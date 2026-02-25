-- Allow authenticated users to insert their own teacher record
create policy "Users can create own teacher record"
  on teachers for insert
  with check (auth_id = auth.uid());

-- Allow teachers to update their own record
create policy "Teachers can update own record"
  on teachers for update
  using (auth_id = auth.uid())
  with check (auth_id = auth.uid());
