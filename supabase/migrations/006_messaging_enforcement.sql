-- ================================================================
-- Messaging enforcement: parent-teacher only communication
-- ================================================================

-- 1. Add parent_id FK to messages table
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES parent_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);

-- 2. Add sender_role to message_items with CHECK constraint
ALTER TABLE message_items
  ADD COLUMN IF NOT EXISTS sender_role TEXT NOT NULL DEFAULT 'teacher'
  CHECK (sender_role IN ('teacher', 'parent'));

-- 3. Backfill existing rows
-- Backfill parent_id from parent_accounts via students.parent_email
UPDATE messages m
SET parent_id = pa.id
FROM parent_accounts pa
JOIN students s ON lower(s.parent_email) = lower(pa.email)
WHERE m.student_id = s.id
  AND m.parent_id IS NULL;

-- Backfill sender_role from is_from_teacher
UPDATE message_items
SET sender_role = CASE WHEN is_from_teacher THEN 'teacher' ELSE 'parent' END;

-- ================================================================
-- Helper functions for role verification
-- ================================================================

-- Returns the teachers.id for the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_teacher_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM teachers WHERE auth_id = auth.uid()
$$;

-- Returns the parent_accounts.id for the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_parent_account_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM parent_accounts WHERE auth_id = auth.uid()
$$;

-- ================================================================
-- Tightened RLS policies on messages
-- ================================================================

-- Drop old teacher policies
DROP POLICY IF EXISTS "Teachers manage own messages" ON messages;

-- Teacher: SELECT own messages (must be a verified teacher)
CREATE POLICY "Teachers select own messages"
  ON messages FOR SELECT
  USING (
    teacher_id = get_my_teacher_id()
  );

-- Teacher: INSERT own messages
CREATE POLICY "Teachers insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    teacher_id = get_my_teacher_id()
    AND get_my_teacher_id() IS NOT NULL
  );

-- Teacher: UPDATE own messages
CREATE POLICY "Teachers update own messages"
  ON messages FOR UPDATE
  USING (
    teacher_id = get_my_teacher_id()
  );

-- Drop old parent policies
DROP POLICY IF EXISTS "Parents see messages about their children" ON messages;
DROP POLICY IF EXISTS "Parents create messages about their children" ON messages;
DROP POLICY IF EXISTS "Parents update messages about their children" ON messages;

-- Parent: SELECT messages for their children (must be a verified parent)
CREATE POLICY "Parents select messages for their children"
  ON messages FOR SELECT
  USING (
    student_id IN (SELECT * FROM get_my_parent_student_ids())
    AND get_my_parent_account_id() IS NOT NULL
  );

-- Parent: INSERT messages for their children
CREATE POLICY "Parents insert messages for their children"
  ON messages FOR INSERT
  WITH CHECK (
    student_id IN (SELECT * FROM get_my_parent_student_ids())
    AND get_my_parent_account_id() IS NOT NULL
    AND parent_id = get_my_parent_account_id()
  );

-- Parent: UPDATE messages for their children
CREATE POLICY "Parents update messages for their children"
  ON messages FOR UPDATE
  USING (
    student_id IN (SELECT * FROM get_my_parent_student_ids())
    AND get_my_parent_account_id() IS NOT NULL
  );

-- ================================================================
-- Tightened RLS policies on message_items
-- ================================================================

-- Drop old teacher policies
DROP POLICY IF EXISTS "Teachers see message items" ON message_items;

-- Teacher: SELECT message items for own threads
CREATE POLICY "Teachers select message items"
  ON message_items FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages WHERE teacher_id = get_my_teacher_id()
    )
  );

-- Teacher: INSERT message items (must be sender_role = 'teacher')
CREATE POLICY "Teachers insert message items"
  ON message_items FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages WHERE teacher_id = get_my_teacher_id()
    )
    AND is_from_teacher = true
    AND sender_role = 'teacher'
  );

-- Drop old parent policies
DROP POLICY IF EXISTS "Parents see message items for their children" ON message_items;
DROP POLICY IF EXISTS "Parents insert message items for their children" ON message_items;

-- Parent: SELECT message items for their children's threads
CREATE POLICY "Parents select message items for their children"
  ON message_items FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages
      WHERE student_id IN (SELECT * FROM get_my_parent_student_ids())
    )
    AND get_my_parent_account_id() IS NOT NULL
  );

-- Parent: INSERT message items (must be sender_role = 'parent')
CREATE POLICY "Parents insert message items for their children"
  ON message_items FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages
      WHERE student_id IN (SELECT * FROM get_my_parent_student_ids())
    )
    AND get_my_parent_account_id() IS NOT NULL
    AND is_from_teacher = false
    AND sender_role = 'parent'
  );

-- ================================================================
-- NOTE: Students have NO policies on messages or message_items.
-- RLS is enabled on both tables, so any student access returns
-- zero rows or fails. This is intentional — do NOT add permissive
-- policies for students on these tables.
-- ================================================================
