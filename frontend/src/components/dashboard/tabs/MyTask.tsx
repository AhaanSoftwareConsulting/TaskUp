import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LockSimpleIcon,
  CheckCircleIcon,
  CalendarBlankIcon,
  FolderIcon,
  ListChecksIcon,
  ArrowRightIcon,
  SquaresFourIcon,
  ClockIcon,
  TrendUpIcon,
  SparkleIcon,
  TargetIcon,
} from "@phosphor-icons/react";

import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks } from "../../redux/features/Task/taskSlice";
import { Timer } from "../Home/Timer";
import { TaskTimePanel } from "../Task/TaskTimePanel";
import { dueInfo } from "../../utils/dateHelpers";

const TONE: Record<"red" | "amber" | "gray", string> = {
  red: "border-rose-100 bg-rose-50 text-rose-600",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  gray: "border-slate-200 bg-slate-50 text-slate-500",
};

const PRIORITY: Record<string, string> = {
  Critical: "border-rose-100 bg-rose-50 text-rose-600",
  High: "border-orange-100 bg-orange-50 text-orange-600",
  Medium: "border-amber-100 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-500",
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-amber-400",
  Low: "bg-slate-400",
};

const PRIORITY_ACCENT: Record<string, string> = {
  Critical: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-amber-400",
  Low: "bg-slate-300",
};

export const MyTask = () => {
  const [params] = useSearchParams();

  const scope: "mine" | "all" =
    params.get("scope") === "all" ? "all" : "mine";

  const dispatch = useAppDispatch();

  const tasks = useAppSelector((s) => s.task.task);
  const user = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(
    params.get("closed") === "1"
  );

  useEffect(() => {
    dispatch(getTasks({ scope }));
  }, [dispatch, scope]);

  const visible = tasks.filter(
    (t) => showClosed || !t.closed_at
  );

  const closedCount = tasks.filter((t) => !!t.closed_at).length;

  const completedCount = tasks.filter((t) => {
    const status = columns[t.board_id]?.find(
      (c) => c.id === t.column_id
    )?.name;

    return !!t.closed_at || status === "Completed";
  }).length;

  const activeCount = tasks.length - closedCount;

  const completionRate =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <div className="flex h-full min-h-0">
      {/* MAIN CONTENT */}

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

          {/* HEADER */}

          <header className="relative mb-8 overflow-hidden rounded-[26px] border border-blue-100/70 bg-white p-6 shadow-sm sm:p-8">

            {/* Decorative Background */}

            <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-indigo-100/40 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

              <div className="max-w-xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                  <SparkleIcon
                    size={14}
                    weight="fill"
                    className="text-blue-600"
                  />

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
                    Task Management
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {scope === "all" ? "All Tasks" : "My Tasks"}
                  <span className="text-blue-600">.</span>
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Welcome back,{" "}
                  <span className="font-bold text-slate-700">
                    {user?.full_name || "User"}
                  </span>
                  . Stay focused, manage your workload and keep making
                  progress.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <TargetIcon
                      size={16}
                      className="text-blue-500"
                      weight="duotone"
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      {activeCount} active tasks
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                    <CheckCircleIcon
                      size={16}
                      className="text-emerald-500"
                      weight="fill"
                    />
                    <span className="text-xs font-semibold text-emerald-700">
                      {completionRate}% completed
                    </span>
                  </div>

                </div>
              </div>

              {/* Header Right */}

              <div className="relative flex flex-wrap items-center gap-3">

                {closedCount > 0 && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:shadow-md">

                    <input
                      type="checkbox"
                      checked={showClosed}
                      onChange={(e) => setShowClosed(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
                    />

                    <span className="text-xs font-bold text-slate-600">
                      Show closed
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500">
                      {closedCount}
                    </span>

                  </label>
                )}

              </div>
            </div>
          </header>

          {/* STATISTICS */}

          <section className="mb-9">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">
                  Workspace Overview
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Your task activity at a glance
                </p>
              </div>

              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Overview
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {/* Total Tasks */}

              <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative z-10 flex items-start justify-between">

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Total Tasks
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                      {tasks.length}
                    </h3>

                    <p className="mt-2 text-[10px] font-semibold text-slate-400">
                      All assigned tasks
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-4 ring-blue-50/60">
                    <SquaresFourIcon size={23} weight="duotone" />
                  </div>

                </div>

                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-blue-50">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                </div>

              </div>

              {/* Active Tasks */}

              <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-amber-50 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative z-10 flex items-start justify-between">

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Active Tasks
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                      {activeCount}
                    </h3>

                    <p className="mt-2 text-[10px] font-semibold text-slate-400">
                      Currently open tasks
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/60">
                    <ClockIcon size={23} weight="duotone" />
                  </div>

                </div>

                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-amber-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{
                      width: `${
                        tasks.length > 0
                          ? (activeCount / tasks.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

              </div>

              {/* Completed Tasks */}

              <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-1">

                <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative z-10 flex items-start justify-between">

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Completed Tasks
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                      {completedCount}
                    </h3>

                    <p className="mt-2 text-[10px] font-semibold text-slate-400">
                      Successfully completed
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60">
                    <CheckCircleIcon size={23} weight="duotone" />
                  </div>

                </div>

                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{
                      width: `${completionRate}%`,
                    }}
                  />
                </div>

              </div>

            </div>
          </section>

          {/* TASK LIST SECTION */}

          <section>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <ListChecksIcon size={19} weight="bold" />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {showClosed ? "All Tasks" : "Active Tasks"}
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {visible.length} tasks available
                    </p>
                  </div>

                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                <SquaresFourIcon
                  size={15}
                  className="text-blue-500"
                  weight="duotone"
                />

                <span className="text-[11px] font-bold text-slate-500">
                  Task View
                </span>
              </div>

            </div>

            {/* TASK CARDS */}

            <div className="grid gap-4">

              {visible.map((t) => {
                const est = t.timeManagement?.estimated_time || 0;
                const logged =
                  t.timeManagement?.total_logged_time || 0;

                const pct =
                  est > 0
                    ? Math.min(
                        (logged / (est * 3600000)) * 100,
                        100
                      )
                    : 0;

                const status = columns[t.board_id]?.find(
                  (c) => c.id === t.column_id
                )?.name;

                const due = dueInfo(
                  t.due_date,
                  !!t.closed_at || status === "Completed"
                );

                const isSelected = selectedId === t.id;

                const projectName =
                  boards.find((b) => b.id === t.board_id)?.name ||
                  "Unknown Project";

                return (
                  <article
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                      isSelected
                        ? "border-blue-300 shadow-lg shadow-blue-100/70 ring-2 ring-blue-100"
                        : "border-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                    }`}
                  >

                    {/* Priority Accent */}

                    <div
                      className={`absolute bottom-0 left-0 top-0 w-1 ${
                        PRIORITY_ACCENT[t.priority] ||
                        PRIORITY_ACCENT.Low
                      }`}
                    />

                    <div className="p-5 pl-6 sm:p-6 sm:pl-7">

                      {/* CARD TOP */}

                      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">

                        <div className="min-w-0 flex-1">

                          {/* BADGES */}

                          <div className="mb-3 flex flex-wrap items-center gap-2">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                PRIORITY[t.priority] || PRIORITY.Low
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  PRIORITY_DOT[t.priority] ||
                                  PRIORITY_DOT.Low
                                }`}
                              />
                              {t.priority}
                            </span>

                            {t.closed_at && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                <LockSimpleIcon size={11} weight="bold" />
                                Closed
                              </span>
                            )}

                            {due && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold ${
                                  TONE[due.tone]
                                }`}
                              >
                                <CalendarBlankIcon size={12} weight="bold" />
                                {due.label}
                              </span>
                            )}

                          </div>

                          {/* TITLE */}

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <h3 className="text-base font-extrabold leading-snug text-slate-800 transition-colors group-hover:text-blue-600 sm:text-lg">
                                {t.title}
                              </h3>

                              {/* PROJECT AND STATUS */}

                              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">

                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                  <FolderIcon
                                    size={15}
                                    weight="duotone"
                                    className="text-slate-400"
                                  />
                                  {projectName}
                                </span>

                                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  {status || "No status"}
                                </span>

                              </div>

                            </div>

                            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white sm:flex">
                              <ArrowRightIcon size={17} weight="bold" />
                            </div>

                          </div>

                        </div>

                        {/* TIMER */}

                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Timer
                            taskId={t.id}
                            timeData={t.timeManagement}
                            estimatedTime={est}
                            dueDate={
                              t.due_date
                                ? String(t.due_date)
                                : undefined
                            }
                            disabled={!!t.closed_at}
                          />
                        </div>

                      </div>

                      {/* TIME PROGRESS */}

                      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4">

                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                          <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                              <TrendUpIcon size={15} weight="bold" />
                            </div>

                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                Time Progress
                              </p>

                              <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                                {est
                                  ? `${est}h estimated`
                                  : "No time estimate configured"}
                              </p>
                            </div>

                          </div>

                          {est > 0 && (
                            <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm">
                              <span className="text-xs font-black text-slate-800">
                                {Math.round(pct)}%
                              </span>
                              <span className="ml-1 text-[9px] font-bold text-slate-400">
                                Used
                              </span>
                            </div>
                          )}

                        </div>

                        {/* PROGRESS BAR */}

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70">

                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              pct >= 100
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                : "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                            }`}
                            style={{
                              width: `${pct}%`,
                            }}
                          />

                        </div>

                        {/* FOOTER */}

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

                          <p className="text-[10px] font-medium text-slate-400">
                            Team total:{" "}
                            <span className="font-extrabold text-slate-700">
                              {(logged / 3600000).toFixed(1)}h
                            </span>

                            {(t.timeManagement?.byUser?.length ?? 0) >
                              1 &&
                              ` across ${t.timeManagement!.byUser.length} members`}
                          </p>

                          {est > 0 && pct >= 100 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-600">
                              <CheckCircleIcon
                                size={12}
                                weight="fill"
                              />
                              Estimate reached
                            </span>
                          )}

                        </div>

                      </div>

                    </div>
                  </article>
                );
              })}

              {/* EMPTY STATE */}

              {visible.length === 0 && (
                <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center">

                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-50/70 blur-2xl" />

                  <div className="relative z-10">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
                      <ListChecksIcon size={30} weight="duotone" />
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800">
                      No tasks found
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
                      There are no tasks to display right now. Your assigned
                      tasks will appear here.
                    </p>

                  </div>
                </div>
              )}

            </div>
          </section>
        </div>
      </main>

      {/* TASK DETAILS PANEL */}

      <TaskTimePanel
        taskId={selectedId}
        onClose={() => setSelectedId(null)}
      />

    </div>
  );
};