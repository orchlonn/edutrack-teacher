-- Allow authenticated teachers to insert new students
create policy "Teachers can insert students"
  on students for insert
  with check (
    exists (
      select 1 from teachers where auth_id = auth.uid()
    )
  );

-- Allow teachers to update students in their classes
create policy "Teachers can update their students"
  on students for update
  using (
    id in (
      select cs.student_id from class_students cs
      join classes c on c.id = cs.class_id
      where c.teacher_id = (select id from teachers where auth_id = auth.uid())
    )
  )
  with check (
    id in (
      select cs.student_id from class_students cs
      join classes c on c.id = cs.class_id
      where c.teacher_id = (select id from teachers where auth_id = auth.uid())
    )
  );

-- Allow teachers to delete students only in their classes (not shared with other teachers)
create policy "Teachers can delete unshared students"
  on students for delete
  using (
    id in (
      select cs.student_id from class_students cs
      join classes c on c.id = cs.class_id
      where c.teacher_id = (select id from teachers where auth_id = auth.uid())
    )
    and not exists (
      select 1 from class_students cs
      join classes c on c.id = cs.class_id
      where cs.student_id = students.id
        and c.teacher_id != (select id from teachers where auth_id = auth.uid())
    )
  );
