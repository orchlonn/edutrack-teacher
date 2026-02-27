-- ================================================
-- Teacher invitation-based signup flow
-- ================================================
-- Mirrors the student/parent invitation pattern:
-- Manager creates teacher record → teacher signs up → claims the record

-- 1. Make auth_id nullable so manager can create teacher records
--    without an auth account (teacher claims it during signup)
ALTER TABLE teachers
  ALTER COLUMN auth_id DROP NOT NULL;

-- 2. Check if a teacher record exists for the given email
--    Called during signup before creating the auth account
CREATE OR REPLACE FUNCTION check_teacher_invitation(lookup_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'exists', true,
    'has_account', (auth_id IS NOT NULL)
  ) INTO result
  FROM teachers
  WHERE lower(email) = lower(trim(lookup_email));

  IF result IS NULL THEN
    RETURN json_build_object('exists', false, 'has_account', false);
  END IF;

  RETURN result;
END;
$$;

-- 3. Link auth account to pre-created teacher record after signup
--    Only claims unclaimed records (auth_id IS NULL) to prevent hijacking
CREATE OR REPLACE FUNCTION claim_teacher_account(teacher_email TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE teachers
  SET auth_id = user_id
  WHERE lower(email) = lower(trim(teacher_email))
    AND auth_id IS NULL;

  RETURN FOUND;
END;
$$;

-- 4. Drop old INSERT policy (no longer needed; claim function is SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can create own teacher record" ON teachers;
