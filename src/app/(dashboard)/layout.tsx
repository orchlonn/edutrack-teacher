import { ClassProvider } from "@/contexts/class-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadMessageCount, getCurrentTeacher } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, teacher] = await Promise.all([
    getUnreadMessageCount(),
    getCurrentTeacher(),
  ]);

  return (
    <ClassProvider>
      <DashboardShell unreadCount={unreadCount} teacherName={teacher.name}>
        {children}
      </DashboardShell>
    </ClassProvider>
  );
}
