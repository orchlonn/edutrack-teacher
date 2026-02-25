import { getWeekSchedule, getClasses, getClassById } from "@/lib/db";
import { ScheduleClient } from "@/components/schedule/schedule-client";

export default async function SchedulePage() {
  const [schedule, classes] = await Promise.all([
    getWeekSchedule(),
    getClasses(),
  ]);

  // Resolve class info for each schedule item
  const scheduleWithClasses = await Promise.all(
    schedule.map(async (item) => {
      const cls = await getClassById(item.classId);
      return {
        ...item,
        className: cls?.name ?? "Unknown",
      };
    })
  );

  return (
    <div className="mx-auto max-w-5xl">
      <ScheduleClient items={scheduleWithClasses} classes={classes} />
    </div>
  );
}
