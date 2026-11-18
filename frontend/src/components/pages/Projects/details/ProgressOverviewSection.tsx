import type { ProjectView } from "../../../hooks/useProjects";
import { Section } from "./Section";

import {
  ListChecksIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  WarningCircleIcon,
  TrendUpIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

const stats = [
  {
    key: "totalTasks",
    label: "Total tasks",
    icon: ListChecksIcon,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50",
    border: "hover:border-indigo-200",
    valueColor: "text-gray-900",
    accent: "bg-indigo-100",
  },
  {
    key: "completedTasks",
    label: "Completed tasks",
    icon: CheckCircleIcon,
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    border: "hover:border-emerald-200",
    valueColor: "text-emerald-600",
    accent: "bg-emerald-100",
  },
  {
    key: "pendingTasks",
    label: "Pending tasks",
    icon: ClockCountdownIcon,
    color: "text-orange-500",
    iconBg: "bg-orange-50",
    border: "hover:border-orange-200",
    valueColor: "text-orange-500",
    accent: "bg-orange-100",
  },
  {
    key: "overdueTasks",
    label: "Overdue tasks",
    icon: WarningCircleIcon,
    color: "text-rose-500",
    iconBg: "bg-rose-50",
    border: "hover:border-rose-200",
    valueColor: "text-rose-500",
    accent: "bg-rose-100",
  },
] as const;

export const ProgressOverviewSection = ({
  project: p,
}: {
  project: ProjectView;
}) => {
  const progress = Math.min(100, Math.max(0, p.progress));

  return (
    <Section title="Progress overview">
      <div className="space-y-6">

        {/* Progress Hero Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/70 p-5 sm:p-6">

          {/* Background Decoration */}
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-teal-200/25 blur-3xl" />

          <div className="relative">

            {/* Top Information */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                {/* Performance Badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 shadow-sm">
                  <SparkleIcon
                    size={12}
                    weight="fill"
                    className="text-emerald-500"
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[1.2px] text-emerald-700">
                    Project performance
                  </span>
                </div>

                {/* Overall Completion */}
                <p className="text-xs font-medium text-gray-500">
                  Overall completion
                </p>

                {/* Percentage */}
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {p.progress}
                  </span>

                  <span className="text-2xl font-bold text-emerald-600">
                    %
                  </span>
                </div>
              </div>

              {/* Progress Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80 text-emerald-600 shadow-sm sm:h-16 sm:w-16">
                <TrendUpIcon
                  size={29}
                  weight="duotone"
                />
              </div>

            </div>

            {/* Progress Bar */}
            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Completion progress
                </span>

                <span className="text-[11px] font-bold text-emerald-700">
                  {progress}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 shadow-inner">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 animate-[progressShine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

          {stats.map((stat) => {
            const Icon = stat.icon;
            const value = p[stat.key];

            return (
              <div
                key={stat.key}
                className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_25px_-15px_rgba(15,23,42,0.25)] sm:p-5 ${stat.border}`}
              >

                {/* Decorative Circle */}
                <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-gray-50 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative">

                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon
                      size={19}
                      weight="duotone"
                    />
                  </div>

                  {/* Value */}
                  <p
                    className={`mt-4 text-2xl font-extrabold tracking-tight ${stat.valueColor}`}
                  >
                    {value}
                  </p>

                  {/* Label */}
                  <p className="mt-1 text-[11px] font-medium text-gray-500">
                    {stat.label}
                  </p>

                  {/* Bottom Accent */}
                  <div
                    className={`mt-3 h-1 w-9 rounded-full ${stat.accent} transition-all duration-300 group-hover:w-full`}
                  />

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </Section>
  );
};