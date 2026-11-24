import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import {
  CheckCircleIcon,
  ClockIcon,
  KanbanIcon,
  ListChecksIcon,
  StarIcon,
  ArrowUpRightIcon,
  ChartDonutIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { useAppSelector } from "../../redux/app/hook";

interface StatProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: string;
  iconBg: string;
}

const Stat = ({ icon, label, value, tone, iconBg }: StatProps) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border border-gray-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${tone}`}
  >
    <div className="flex items-center justify-between">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>

      <ArrowUpRightIcon
        size={16}
        className="text-gray-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-500"
      />
    </div>

    <p className="mt-4 text-2xl font-extrabold tracking-tight text-[#171B2E]">
      {value}
    </p>

    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
      {label}
    </p>
  </div>
);

export const ProfileStats = () => {
  const navigate = useNavigate();

  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const tasks = useAppSelector((s) => s.task.task);
  const columns = useAppSelector((s) => s.column.columns);
  const favorites = useAppSelector((s) => s.task.favorites);

  const stats = useMemo(() => {
    const mine = tasks.filter((t) =>
      t.assignedTo?.some((u) => u.id === user?.id)
    );

    const done = (t: (typeof tasks)[number]) =>
      !!t.closed_at ||
      columns[t.board_id]?.find((c) => c.id === t.column_id)?.name ===
        "Completed";

    const completed = mine.filter(done).length;

    const ms = tasks.reduce(
      (s, t) =>
        s +
        (t.timeManagement?.byUser?.find(
          (e) => e.user?.id === user?.id
        )?.duration ?? 0),
      0
    );

    return {
      projects: boards.filter((b) =>
        b.members.some((m) => m.id === user?.id)
      ).length,
      assigned: mine.length,
      completed,
      hours: (ms / 3600000).toFixed(1),
      pct: mine.length
        ? Math.round((completed / mine.length) * 100)
        : 0,
    };
  }, [boards, tasks, columns, user?.id]);

  return (
    <div className="space-y-5">

      {/* ================================= */}
      {/* MY ACTIVITY */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#278CFA]">
              <ChartDonutIcon size={19} weight="duotone" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#171B2E]">
                My Activity
              </h3>

              <p className="mt-0.5 text-[10px] font-medium text-gray-400">
                Your productivity overview
              </p>
            </div>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-[#278CFA]">
            Overview
          </span>
        </div>

        <div className="p-5">

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3">

            <Stat
              icon={<KanbanIcon size={20} weight="duotone" />}
              label="Projects"
              value={stats.projects}
              tone="bg-blue-50/40"
              iconBg="bg-blue-100 text-blue-600"
            />

            <Stat
              icon={<ListChecksIcon size={20} weight="duotone" />}
              label="Assigned Tasks"
              value={stats.assigned}
              tone="bg-amber-50/40"
              iconBg="bg-amber-100 text-amber-600"
            />

            <Stat
              icon={<CheckCircleIcon size={20} weight="duotone" />}
              label="Completed"
              value={stats.completed}
              tone="bg-emerald-50/40"
              iconBg="bg-emerald-100 text-emerald-600"
            />

            <Stat
              icon={<ClockIcon size={20} weight="duotone" />}
              label="Hours Logged"
              value={`${stats.hours}h`}
              tone="bg-violet-50/40"
              iconBg="bg-violet-100 text-violet-600"
            />

          </div>

          {/* Completion Progress */}
          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-[#171B2E]">
                  Task Completion
                </h4>

                <p className="mt-1 text-[10px] text-gray-400">
                  Your overall task progress
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <SparkleIcon size={18} weight="duotone" />
              </div>
            </div>

            <div className="flex items-center gap-4">

              {/* Circular Progress */}
              <div className="relative h-[82px] w-[82px] shrink-0">

                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="9"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.pct / 100) * 263.9} 263.9`}
                    className="transition-all duration-700"
                  />
                </svg>

                <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-[#171B2E]">
                  {stats.pct}%
                </span>

              </div>

              {/* Progress Details */}
              <div className="min-w-0 flex-1">

                <p className="text-sm font-bold text-[#171B2E]">
                  {stats.completed} of {stats.assigned}
                </p>

                <p className="mt-1 text-[11px] text-gray-400">
                  Assigned tasks completed
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================================= */}
      {/* FAVORITE TASKS */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <StarIcon size={18} weight="fill" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#171B2E]">
                Favorite Tasks
              </h3>

              <p className="mt-0.5 text-[10px] font-medium text-gray-400">
                Your saved tasks
              </p>
            </div>
          </div>

          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
            {favorites.length} Saved
          </span>

        </div>

        {/* Favorites List */}
        <div className="p-4">

          {favorites.length === 0 ? (

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-400">
                <StarIcon size={23} weight="duotone" />
              </div>

              <p className="text-sm font-semibold text-gray-600">
                No favorite tasks yet
              </p>

              <p className="mt-1 text-[11px] text-gray-400">
                Star a task to pin it here.
              </p>

            </div>

          ) : (

            <ul className="space-y-2">

              {favorites.map((t) => (

                <li key={t.id}>

                  <button
                    onClick={() =>
                      navigate(
                        `/${user?.role}/dashboard/tasks/${t.id}`
                      )
                    }
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/40"
                  >

                    {/* Star Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition-colors group-hover:bg-amber-100">
                      <StarIcon size={17} weight="fill" />
                    </div>

                    {/* Task Title */}
                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-bold text-gray-700 transition-colors group-hover:text-[#278CFA]">
                        {t.title}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-gray-400">
                        Saved to favorites
                      </p>

                    </div>

                    {/* Priority */}
                    <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-[9px] font-extrabold text-orange-600">
                      {t.priority}
                    </span>

                    {/* Arrow */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 transition-all group-hover:bg-white group-hover:text-[#278CFA]">
                      <ArrowUpRightIcon size={15} weight="bold" />
                    </div>

                  </button>

                </li>

              ))}

            </ul>

          )}

        </div>
      </section>

    </div>
  );
};