import type { ProjectView } from "../../../hooks/useProjects";
import {
  formatDate,
  msToHours,
  orDash,
} from "../../../utils/projectFormat";
import { getAvatarColor } from "../../../utils/avatarColor";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  UsersThreeIcon,
  TrendUpIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";

export const ProjectCard = ({
  project: p,
  onOpen,
}: {
  project: ProjectView;
  onOpen: () => void;
}) => {
  const names = p.resources.map((r) => r.name.split(" ")[0]);

  const resources =
    names.length === 0
      ? "—"
      : names.slice(0, 2).join(", ") +
        (names.length > 2 ? ` +${names.length - 2}` : "");

  const progress = Math.min(100, Math.max(0, p.progress));

  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View project ${p.name}`}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1  hover:shadow-[0_16px_35px_-18px_rgba(79,70,229,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      {/* Top Accent */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 opacity-100 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* Project Header */}
        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-start gap-3">

            {/* Project Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-100">
              <FolderOpenIcon size={21} weight="duotone" />
            </div>

            {/* Project Name */}
            <div className="min-w-0 pt-0.5">
              <h3 className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-indigo-600 sm:text-base">
                {p.name}
              </h3>

              <p className="mt-1 truncate text-[10px] font-medium text-gray-400">
                {orDash(p.clientName)}
              </p>
            </div>

          </div>

          {/* Arrow */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
            <ArrowUpRightIcon
              size={15}
              weight="bold"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>

        </div>

        {/* Status & Priority */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">

          <StatusBadge status={p.status} />

          <PriorityBadge priority={p.priority} />

        </div>

        {/* Progress Section */}
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 transition-colors duration-300 group-hover:border-indigo-100 group-hover:bg-indigo-50/30">

          <div className="flex items-center justify-between gap-2">

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <TrendUpIcon size={15} weight="duotone" />
              </div>

              <span className="text-[11px] font-semibold text-gray-600">
                Project progress
              </span>
            </div>

            <span className="text-sm font-extrabold text-gray-900">
              {p.progress}%
            </span>

          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-[progressShine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
              Completion
            </span>

            <span className="text-[9px] font-semibold text-emerald-600">
              {progress}% completed
            </span>
          </div>

        </div>

        {/* Assigned Resources */}
        <div className="mt-4 flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <UsersThreeIcon size={17} weight="duotone" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                Assigned team
              </p>

              <p className="mt-0.5 truncate text-[11px] font-semibold text-gray-700">
                {resources}
              </p>
            </div>

          </div>

          {/* Team Avatars */}
          {p.resources.length > 0 && (
            <div className="flex shrink-0 items-center -space-x-2">
              {p.resources.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  title={r.name}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm transition-transform duration-300 hover:z-10 hover:-translate-y-1"
                  style={{
                    backgroundColor: getAvatarColor(r.name),
                  }}
                >
                  {r.name.charAt(0).toUpperCase()}
                </div>
              ))}

              {p.resources.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[8px] font-bold text-gray-600">
                  +{p.resources.length - 3}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Information */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">

          {/* Deadline */}
          <div className="rounded-xl border border-gray-100 bg-white p-3 transition-colors duration-300 group-hover:border-indigo-100">

            <div className="flex items-center gap-1.5">
              <CalendarBlankIcon
                size={13}
                className="text-orange-500"
              />

              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                Deadline
              </span>
            </div>

            <p className="mt-2 truncate text-[11px] font-bold text-gray-800">
              {formatDate(p.deadline)}
            </p>

          </div>

          {/* Logged Hours */}
          <div className="rounded-xl border border-gray-100 bg-white p-3 transition-colors duration-300 group-hover:border-indigo-100">

            <div className="flex items-center gap-1.5">
              <ClockIcon
                size={13}
                className="text-emerald-500"
              />

              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                Time logged
              </span>
            </div>

            <p className="mt-2 truncate text-[11px] font-bold text-gray-800">
              {msToHours(p.loggedMs)}h
            </p>

          </div>

        </div>

      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-3 transition-colors duration-300 group-hover:bg-indigo-50/50 sm:px-5">

        <span className="text-[10px] font-semibold text-gray-500 transition-colors group-hover:text-indigo-600">
          View project details
        </span>

        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600">
          Explore

          <ArrowUpRightIcon
            size={13}
            weight="bold"
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>

      </div>

    </article>
  );
};