"use client";

import { ActionItems } from "@/components/dashboard/action-items";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { AttendanceSummary } from "@/components/dashboard/attendance-summary";
import { ClassSnapshot } from "@/components/dashboard/class-snapshot";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { actionItems, activities, getTodaySchedule, teacher } from "@/lib/mock-data";

export default function DashboardPage() {
  const todaySchedule = getTodaySchedule();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {greeting}, {teacher.name}
        </h2>
        <p className="text-sm text-gray-500">
          Here&apos;s what&apos;s happening today
        </p>
      </div>

      {/* Action Items - full width, always on top */}
      <ActionItems items={actionItems} />

      {/* Two-column grid on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodaySchedule items={todaySchedule} />
        <div className="space-y-6">
          <AttendanceSummary />
          <ClassSnapshot />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity items={activities} />
    </div>
  );
}
