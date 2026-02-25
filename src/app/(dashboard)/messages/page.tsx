import { getMessages, getCurrentTeacher, getStudents } from "@/lib/db";
import { MessagesClient } from "@/components/messages/messages-client";

export default async function MessagesPage() {
  const [initialMessages, teacher, students] = await Promise.all([
    getMessages(),
    getCurrentTeacher(),
    getStudents(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <MessagesClient
        initialMessages={initialMessages}
        teacherName={teacher.name}
        students={students}
      />
    </div>
  );
}
