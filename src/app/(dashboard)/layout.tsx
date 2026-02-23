import { ClassProvider } from "@/contexts/class-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClassProvider>
      <DashboardShell>{children}</DashboardShell>
    </ClassProvider>
  );
}
