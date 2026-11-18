import type { ProjectView } from "../../../hooks/useProjects";
import { msToHours } from "../../../utils/projectFormat";
import { Section } from "./Section";

import {
  ClockIcon,
  TimerIcon,
  HourglassMediumIcon,
  TrendUpIcon,
  WarningCircleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

const hourStats = [
  {
    key: "estimated",
    label: "Estimated hours",
    icon: ClockIcon,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50",
    accent: "bg-indigo-100",
  },
  {
    key: "logged",
    label: "Total logged",
    icon: TimerIcon,
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "bg-emerald-100",
  },
  {
    key: "remaining",
    label: "Remaining",
    icon: HourglassMediumIcon,
    color: "text-orange-500",
    iconBg: "bg-orange-50",
    accent: "bg-orange-100",
  },
] as const;

export const WorkingHoursSection = ({
  project: p,
}: {
  project: ProjectView;
}) => {
  const logged = msToHours(p.loggedMs);
  const estimated = p.estimatedHours;

  const hasEstimate = estimated > 0;

  const overBy =
    hasEstimate && logged > estimated
      ? Math.round((logged - estimated) * 10) / 10
      : 0;

  const remaining = Math.max(estimated - logged, 0);

  const usedPct = hasEstimate
    ? Math.round((logged / estimated) * 100)
    : 0;

  const isOver = overBy > 0;

  const values = {
    estimated: hasEstimate ? `${estimated}h` : "Not set",
    logged: `${logged}h`,
    remaining: hasEstimate
      ? isOver
        ? `${overBy}h`
        : `${remaining}h`
      : "—",
  };

  return (
    <Section title="Working hours">
      <div className="space-y-6">

        {/* Working Hours Summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {hourStats.map((stat) => {
            const Icon = stat.icon;
            const value = values[stat.key];

            const valueColor =
              stat.key === "remaining"
                ? isOver
                  ? "text-rose-500"
                  : "text-orange-500"
                : stat.key === "logged"
                  ? "text-emerald-600"
                  : "text-gray-900";

            return (
              <div
                key={stat.key}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-[0_10px_25px_-16px_rgba(15,23,42,0.25)] sm:p-5"
              >

                {/* Decorative Circle */}
                <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-gray-50 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative">

                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={19} weight="duotone" />
                  </div>

                  {/* Value */}
                  <p
                    className={`mt-4 text-2xl font-extrabold tracking-tight ${valueColor}`}
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

        {/* Estimate Progress */}
        {hasEstimate ? (
          <div
            className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
              isOver
                ? "border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-orange-50/60"
                : "border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60"
            }`}
          >

            {/* Background Glow */}
            <div
              className={`pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl ${
                isOver ? "bg-rose-200/30" : "bg-emerald-200/30"
              }`}
            />

            <div className="relative">

              {/* Progress Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-2.5">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isOver
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {isOver ? (
                      <WarningCircleIcon size={19} weight="duotone" />
                    ) : (
                      <TrendUpIcon size={19} weight="duotone" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {isOver ? "Estimate exceeded" : "Estimate usage"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {isOver
                        ? "Logged hours exceeded the project estimate"
                        : "Track your project time consumption"}
                    </p>
                  </div>

                </div>

                <span
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    isOver
                      ? "bg-rose-100 text-rose-600"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {usedPct}% used
                </span>

              </div>

              {/* Progress Bar */}
              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Working hours progress
                  </span>

                  <span className="text-[10px] font-semibold text-gray-600">
                    {logged}h / {estimated}h
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 shadow-inner">
                  <div
                    className={`relative h-full rounded-full transition-all duration-1000 ease-out ${
                      isOver
                        ? "bg-gradient-to-r from-rose-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                    }`}
                    style={{
                      width: `${Math.min(usedPct, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 animate-[progressShine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </div>

              </div>

              {/* Bottom Information */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">

                <div className="flex items-center gap-1.5">
                  <SparkleIcon
                    size={13}
                    weight="fill"
                    className={isOver ? "text-rose-500" : "text-emerald-500"}
                  />

                  <span className="text-[10px] font-medium text-gray-500">
                    {isOver
                      ? `${overBy}h over the estimated time`
                      : `${remaining}h remaining from estimate`}
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-gray-400">
                  {estimated}h estimated
                </span>

              </div>

            </div>
          </div>
        ) : (
          /* No Estimate State */
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <ClockIcon size={21} weight="duotone" />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700">
                No time estimate available
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
                Add estimated hours with Edit project to track remaining time.
              </p>
            </div>

          </div>
        )}

      </div>
    </Section>
  );
};