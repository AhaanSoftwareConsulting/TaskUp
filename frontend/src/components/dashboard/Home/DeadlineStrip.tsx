import { Link } from "react-router-dom";
import {
  CalendarBlankIcon,
  ArrowUpRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Card } from "./Card";
import type { HomeData } from "./useHomeData";

export const DeadlineStrip = ({ data }: { data: HomeData }) => {
  const upcoming = data.week.flatMap((d) => d.tasks).slice(0, 3);

  return (
    <Card
      title="Next 7 Days"
      icon={<CalendarBlankIcon size={15} weight="bold" />}
      to={data.tasksLink}
      action="View all"
    >
      <div className="space-y-4">

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {data.week.map((d, i) => {
            const n = d.tasks.length;
            const isToday = i === 0;

            return (
              <Link
                key={i}
                to={data.tasksLink}
                title={
                  n
                    ? d.tasks.map((t) => t.title).join("\n")
                    : "Nothing due"
                }
                className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border px-1 py-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  isToday
                    ? "border-blue-200 bg-blue-50/80 shadow-sm shadow-blue-100"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                }`}
              >
                {/* Today Indicator */}
                {isToday && (
                  <span className="absolute left-0 top-0 h-1 w-full bg-blue-500" />
                )}

                {/* Weekday */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    isToday ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {d.date.toLocaleDateString("en-GB", {
                    weekday: "short",
                  })}
                </span>

                {/* Date */}
                <span
                  className={`mt-1 text-lg font-extrabold ${
                    isToday ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {d.date.getDate()}
                </span>

                {/* Task Count */}
                <span
                  className={`mt-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold transition-transform duration-300 group-hover:scale-110 ${
                    n
                      ? n > 2
                        ? "bg-red-500 text-white shadow-sm shadow-red-200"
                        : "bg-amber-400 text-white shadow-sm shadow-amber-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {n}
                </span>

                {/* Task Indicator */}
                {n > 0 && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current opacity-30" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Upcoming Tasks */}
        <div className="border-t border-gray-100 pt-4">

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon
                size={15}
                weight="bold"
                className="text-gray-400"
              />

              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Upcoming Deadlines
              </h4>
            </div>

            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
              {upcoming.length} Tasks
            </span>
          </div>

          {upcoming.length > 0 ? (
            <ul className="space-y-2">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`${data.base}/tasks/${t.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-transparent bg-gray-50/70 px-3 py-2.5 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/50"
                  >
                    {/* Task Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm transition-colors group-hover:bg-blue-100">
                      <CalendarBlankIcon
                        size={16}
                        weight="duotone"
                      />
                    </div>

                    {/* Task Title */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-700 transition-colors group-hover:text-blue-600">
                        {t.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Upcoming task
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowUpRightIcon
                      size={16}
                      className="shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-500">
                <CheckCircleIcon size={19} weight="duotone" />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700">
                  All caught up!
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  No upcoming deadlines this week.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};