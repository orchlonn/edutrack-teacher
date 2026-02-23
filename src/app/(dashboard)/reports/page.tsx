"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClassOverview } from "@/components/reports/class-overview";
import { AttendanceTrends } from "@/components/reports/attendance-trends";
import { GradeDistribution } from "@/components/reports/grade-distribution";
import { AtRiskStudents } from "@/components/reports/at-risk-students";
import { LayoutGrid, ClipboardCheck, GraduationCap, AlertTriangle } from "lucide-react";

const tabs = [
  { id: "overview", label: "Class Overview", icon: LayoutGrid },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "grades", label: "Grades", icon: GraduationCap },
  { id: "at-risk", label: "At-Risk", icon: AlertTriangle },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <ClassOverview />}
      {activeTab === "attendance" && <AttendanceTrends />}
      {activeTab === "grades" && <GradeDistribution />}
      {activeTab === "at-risk" && <AtRiskStudents />}
    </div>
  );
}
