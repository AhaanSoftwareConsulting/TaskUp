import type { ProjectView } from "../../../hooks/useProjects";
import { getAvatarColor } from "../../../utils/avatarColor";
import {
  formatDate,
  msToHours,
  orDash,
} from "../../../utils/projectFormat";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

import {
  ArrowUpRightIcon,
  PencilSimpleIcon,
  ArchiveIcon,
} from "@phosphor-icons/react";

interface Props {
  projects: ProjectView[];
  canManage: boolean;
  onView: (p: ProjectView) => void;
  onEdit: (p: ProjectView) => void;
  onArchive: (p: ProjectView) => void;
}

export const ProjectsTable = ({
  projects,
  canManage,
  onView,
  onEdit,
  onArchive,
}: Props) => (
  <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

    <table className="w-full table-fixed text-left">

      {/* Table Header */}
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50/80">

          <th className="w-[22%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:px-4">
            Project
          </th>

          <th className="hidden w-[13%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 lg:table-cell">
            Manager
          </th>

          <th className="hidden w-[11%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:table-cell">
            Resources
          </th>

          <th className="hidden w-[10%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 xl:table-cell">
            Start date
          </th>

          <th className="w-[10%] px-2 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:px-3">
            Deadline
          </th>

          <th className="w-[13%] px-2 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:px-3">
            Progress
          </th>

          <th className="hidden w-[9%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 xl:table-cell">
            Logged
          </th>

          <th className="w-[9%] px-2 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:px-3">
            Status
          </th>

          <th className="hidden w-[9%] px-3 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:table-cell">
            Priority
          </th>

          <th className="w-[8%] px-2 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Actions
          </th>

        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-gray-100">

        {projects.map((p) => {
          const progress = Math.min(100, Math.max(0, p.progress));

          return (
            <tr
              key={p.id}
              className="group transition-colors duration-200 hover:bg-gray-50/70"
            >

              {/* Project */}
              <td className="px-3 py-3.5 sm:px-4">
                <button
                  onClick={() => onView(p)}
                  className="flex w-full min-w-0 items-center gap-2.5 text-left"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700">
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-gray-900 transition-colors group-hover:text-black">
                      {p.name}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {orDash(p.clientName)}
                    </p>
                  </div>
                </button>
              </td>

              {/* Manager */}
              <td className="hidden px-3 py-3.5 lg:table-cell">
                <span className="block truncate text-[11px] font-medium text-gray-600">
                  {orDash(p.managerName)}
                </span>
              </td>

              {/* Resources */}
              <td className="hidden px-3 py-3.5 md:table-cell">
                <div
                  className="flex items-center gap-2"
                  title={p.resources.map((r) => r.name).join(", ")}
                >
                  {p.resources.length > 0 ? (
                    <div className="flex -space-x-2">
                      {p.resources.slice(0, 3).map((r) => (
                        <span
                          key={r.id}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-white"
                          style={{
                            backgroundColor: getAvatarColor(r.name),
                          }}
                        >
                          {r.name.charAt(0).toUpperCase()}
                        </span>
                      ))}

                      {p.resources.length > 3 && (
                        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-bold text-gray-600">
                          +{p.resources.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}

                  <span className="text-[10px] text-gray-500">
                    {p.resources.length}
                  </span>
                </div>
              </td>

              {/* Start Date */}
              <td className="hidden whitespace-nowrap px-3 py-3.5 xl:table-cell">
                <span className="text-[11px] text-gray-600">
                  {formatDate(p.startDate)}
                </span>
              </td>

              {/* Deadline */}
              <td className="px-2 py-3.5 sm:px-3">
                <span className="block truncate text-[11px] text-gray-600">
                  {formatDate(p.deadline)}
                </span>
              </td>

              {/* Progress */}
              <td className="px-2 py-3.5 sm:px-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <span className="shrink-0 text-[10px] font-bold text-gray-700">
                    {progress}%
                  </span>
                </div>
              </td>

              {/* Logged Hours */}
              <td className="hidden whitespace-nowrap px-3 py-3.5 xl:table-cell">
                <span className="font-mono text-[11px] text-gray-600">
                  {msToHours(p.loggedMs)}h
                </span>
              </td>

              {/* Status */}
              <td className="px-2 py-3.5 sm:px-3">
                <StatusBadge status={p.status} />
              </td>

              {/* Priority */}
              <td className="hidden px-3 py-3.5 sm:table-cell">
                <PriorityBadge priority={p.priority} />
              </td>

              {/* Actions */}
              <td className="px-2 py-3.5">
                <div className="flex items-center justify-center gap-1">

                  <button
                    onClick={() => onView(p)}
                    title="View project"
                    aria-label={`View ${p.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                  >
                    <ArrowUpRightIcon size={15} weight="bold" />
                  </button>

                  {canManage && (
                    <>
                      <button
                        onClick={() => onEdit(p)}
                        title="Edit project"
                        aria-label={`Edit ${p.name}`}
                        className="hidden h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-black sm:flex"
                      >
                        <PencilSimpleIcon size={14} />
                      </button>

                      <button
                        onClick={() => onArchive(p)}
                        title="Archive project"
                        aria-label={`Archive ${p.name}`}
                        className="hidden h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:flex"
                      >
                        <ArchiveIcon size={14} />
                      </button>
                    </>
                  )}

                </div>
              </td>

            </tr>
          );
        })}

        {/* Empty State */}
        {projects.length === 0 && (
          <tr>
            <td colSpan={10} className="px-4 py-14 text-center">
              <p className="text-sm font-semibold text-gray-800">
                No projects found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try changing your search or filters.
              </p>
            </td>
          </tr>
        )}

      </tbody>
    </table>

    {/* Footer */}
    {projects.length > 0 && (
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">

        <p className="text-[11px] text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-900">
            {projects.length}
          </span>{" "}
          {projects.length === 1 ? "project" : "projects"}
        </p>

        <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
          Project overview
        </span>

      </div>
    )}

  </div>
);