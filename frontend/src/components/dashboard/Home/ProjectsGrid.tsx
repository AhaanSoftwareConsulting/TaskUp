import { Link } from "react-router-dom";
import {
  KanbanIcon,
  ArrowUpRightIcon,
  FolderSimpleIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import { slugify } from "../../hooks/slugify";
import type { HomeData } from "./useHomeData";

export const ProjectsGrid = ({ data }: { data: HomeData }) => (
  <Card
    title="Projects"
    icon={<KanbanIcon size={15} weight="bold" />}
  >
    {data.projects.length === 0 ? (
      <Empty text="No projects yet." />
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {data.projects.slice(0, 6).map(({ board, total, done, pct, overdue }) => {
          const progressColor =
            pct === 100
              ? "bg-emerald-500"
              : pct >= 50
                ? "bg-blue-500"
                : "bg-amber-500";

          const progressBg =
            pct === 100
              ? "bg-emerald-50"
              : pct >= 50
                ? "bg-blue-50"
                : "bg-amber-50";

          return (
            <Link
              key={board.id}
              to={`${data.base}/${slugify(board.name)}`}
              className="group relative isolate overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50"
            >
              {/* Top Accent */}
              <div
                className={`absolute left-0 top-0 h-1 w-full ${progressColor} opacity-80`}
              />

              {/* Decorative Background */}
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${progressBg} opacity-70 blur-2xl transition-all duration-500 group-hover:scale-150`}
              />

              <div className="relative z-10">

                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-600">
                      <FolderSimpleIcon size={21} weight="duotone" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold capitalize text-gray-800 transition-colors group-hover:text-blue-600">
                        {board.name}
                      </h4>

                      <p className="mt-1 truncate text-xs text-gray-400">
                        {board.description || `${board.members.length} members`}
                      </p>
                    </div>
                  </div>

                  {/* Completion Percentage */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-gray-900">
                      {pct}%
                    </span>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        pct === 100
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {pct === 100 ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Project Progress
                    </span>

                    <span className="text-[11px] font-semibold text-gray-500">
                      {done}/{total} Tasks
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${progressColor} transition-all duration-700 ease-out group-hover:brightness-110`}
                      style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">

                  {/* Team Members */}
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {board.members.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          title={m.full_name}
                          className="rounded-full border-2 border-white transition-transform duration-200 hover:z-10 hover:-translate-y-1"
                        >
                          <Avatar name={m.full_name} size={27} />
                        </div>
                      ))}

                      {board.members.length > 4 && (
                        <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-bold text-gray-600">
                          +{board.members.length - 4}
                        </span>
                      )}
                    </div>

                    <span className="ml-2 text-[11px] text-gray-400">
                      {board.members.length} members
                    </span>
                  </div>

                  {/* Task Status & Arrow */}
                  <div className="flex items-center gap-2">

                    {overdue > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                        <WarningCircleIcon size={12} weight="fill" />
                        {overdue} overdue
                      </span>
                    ) : pct === 100 ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircleIcon size={12} weight="fill" />
                        All done
                      </span>
                    ) : null}

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      <ArrowUpRightIcon
                        size={15}
                        weight="bold"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    )}
  </Card>
);