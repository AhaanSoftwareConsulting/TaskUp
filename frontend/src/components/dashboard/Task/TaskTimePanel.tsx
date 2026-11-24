import { Link } from "react-router-dom";
import {
  ArrowSquareOutIcon,
  ClockIcon,
  LockSimpleIcon,
  XIcon,
  CalendarBlankIcon,
  FolderIcon,
  UserCircleIcon,
  UsersThreeIcon,
  ChartLineUpIcon,
  ArrowRightIcon,
  TimerIcon,
} from "@phosphor-icons/react";

import { useAppSelector } from "../../redux/app/hook";
import { getColumnColor } from "../../utils/columnColors";
import { formatLong } from "../../utils/dateHelpers";
import { Avatar } from "./CommentComposer";

const hrs = (ms = 0) => (ms / 3600000).toFixed(1);

export const TaskTimePanel = ({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) => {
  const task = useAppSelector((s) =>
    s.task.task.find((t) => t.id === taskId)
  );

  const me = useAppSelector((s) => s.login.user);
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);

  if (!task || !me) return null;

  const staff = me.role === "manager" || me.role === "ceo";

  const status =
    columns[task.board_id]?.find((c) => c.id === task.column_id)?.name ?? "";

  const color = getColumnColor(status);

  const rows = (task.timeManagement?.byUser ?? []).filter(
    (e) => staff || e.user?.id === me.id
  );

  const total = rows.reduce((s, e) => s + e.duration, 0);

  const est = task.timeManagement?.estimated_time || 0;
  const logged = task.timeManagement?.total_logged_time || 0;

  const pct =
    est > 0
      ? Math.min((logged / (est * 3600000)) * 100, 100)
      : 0;

  const projectName =
    boards.find((b) => b.id === task.board_id)?.name || "—";

  return (
    <aside className="hidden w-[35%] min-w-[320px] flex-col overflow-y-auto border-l border-[#E9EDF5] bg-[#F7F9FC] p-4 md:flex">

      {/* TOP BAR */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#278CFA]">
            <ClockIcon size={17} weight="duotone" />
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-[#171B2E]">
              Time Overview
            </h3>
            <p className="text-[9px] font-medium text-gray-400">
              Task details & tracking
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          title="Close panel"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500"
        >
          <XIcon size={15} weight="bold" />
        </button>
      </div>

      {/* MAIN PANEL */}
      <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-[#E8EDF5] bg-white p-4 shadow-sm">

        {/* TASK HEADER */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#278CFA]">
              Task Details
            </span>

            <Link
              to={`/${me.role}/dashboard/tasks/${task.id}`}
              title="Open task"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-blue-50 hover:text-[#278CFA]"
            >
              <ArrowSquareOutIcon size={16} weight="bold" />
            </Link>
          </div>

          <Link
            to={`/${me.role}/dashboard/tasks/${task.id}`}
            className="group flex items-start gap-2"
          >
            <h2 className="text-[15px] font-extrabold leading-snug text-[#171B2E] transition-colors group-hover:text-[#278CFA]">
              {task.title}
            </h2>

            <ArrowSquareOutIcon
              size={14}
              className="mt-1 shrink-0 text-gray-300 transition-colors group-hover:text-[#278CFA]"
            />
          </Link>

          {/* STATUS BADGES */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${color.bg} ${color.text}`}
            >
              {status || "No status"}
            </span>

            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-orange-600">
              {task.priority}
            </span>

            {task.closed_at && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#171B2E] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <LockSimpleIcon size={10} weight="bold" />
                Closed
              </span>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-gray-100" />

        {/* TASK INFORMATION */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <FolderIcon size={15} weight="duotone" />
            </div>

            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              General Information
            </h4>
          </div>

          <div className="space-y-3 rounded-xl bg-[#F8FAFD] p-3">

            {/* PROJECT */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <FolderIcon size={14} />
                <span className="text-[11px] font-medium">Project</span>
              </div>

              <span className="max-w-[60%] truncate text-right text-[11px] font-bold text-[#171B2E]">
                {projectName}
              </span>
            </div>

            {/* DUE DATE */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <CalendarBlankIcon size={14} />
                <span className="text-[11px] font-medium">Due Date</span>
              </div>

              <span className="text-[11px] font-bold text-[#171B2E]">
                {formatLong(task.due_date)}
              </span>
            </div>

            {/* CREATOR */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <UserCircleIcon size={14} />
                <span className="text-[11px] font-medium">Created By</span>
              </div>

              <span className="max-w-[60%] truncate text-right text-[11px] font-bold text-[#171B2E]">
                {task.creator?.full_name ?? "—"}
              </span>
            </div>

            {/* ASSIGNEES */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <UsersThreeIcon size={14} />
                <span className="text-[11px] font-medium">Assignees</span>
              </div>

              <div className="flex -space-x-2">
                {task.assignedTo.map((u) => (
                  <div
                    key={u.id}
                    title={u.full_name}
                    className="rounded-full border-2 border-white"
                  >
                    <Avatar name={u.full_name} size={25} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TIME TRACKING */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TimerIcon size={15} weight="duotone" />
              </div>

              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Time Tracking
              </h4>
            </div>

            <ChartLineUpIcon
              size={16}
              className="text-gray-300"
              weight="duotone"
            />
          </div>

          {/* TIME SUMMARY */}
          <div className="grid grid-cols-2 gap-2">

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500">
                Time Logged
              </p>

              <p className="mt-1 text-xl font-extrabold tracking-tight text-[#171B2E]">
                {hrs(logged)}
                <span className="ml-1 text-[10px] font-bold text-gray-400">
                  hrs
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-purple-500">
                Estimate
              </p>

              <p className="mt-1 text-xl font-extrabold tracking-tight text-[#171B2E]">
                {est || "—"}
                <span className="ml-1 text-[10px] font-bold text-gray-400">
                  hrs
                </span>
              </p>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500">
                Time Progress
              </span>

              <span className="text-[10px] font-extrabold text-[#278CFA]">
                {Math.round(pct)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#278CFA] to-indigo-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-[9px] font-medium text-gray-400">
                {hrs(logged)}h completed
              </span>

              <span className="text-[9px] font-medium text-gray-400">
                {est ? `${est}h target` : "No estimate"}
              </span>
            </div>
          </div>
        </div>

        {/* TIME BY MEMBER */}
        <div className="rounded-xl border border-[#E8EDF5] bg-[#F8FAFD] p-3.5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#278CFA] shadow-sm">
                <ClockIcon size={15} weight="duotone" />
              </div>

              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#171B2E]">
                  {staff ? "Time by Member" : "My Time"}
                </h4>

                <p className="text-[9px] text-gray-400">
                  Logged working hours
                </p>
              </div>
            </div>

            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-bold text-gray-400 shadow-sm">
              {rows.length} {rows.length === 1 ? "Member" : "Members"}
            </span>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-300 shadow-sm">
                <ClockIcon size={21} weight="duotone" />
              </div>

              <p className="text-xs font-semibold text-gray-500">
                No time logged yet
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Working hours will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((e, i) => (
                <div
                  key={e.user?.id ?? i}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={e.user?.full_name} size={27} />

                    <span className="truncate text-[11px] font-semibold text-gray-700">
                      {e.user?.full_name ?? "Unknown"}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-[#171B2E] shadow-sm">
                    {hrs(e.duration)} h
                  </span>
                </div>
              ))}

              {rows.length > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">
                    Total Logged
                  </span>

                  <span className="text-sm font-extrabold text-emerald-600">
                    {hrs(total)} h
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="mt-auto space-y-2 pt-1">

          <Link
            to={`/${me.role}/dashboard/tasks/${task.id}/hours`}
            className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#171B2E] to-[#293C66] px-4 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <ChartLineUpIcon size={16} weight="duotone" />
            Working Hours Report

            <ArrowRightIcon
              size={14}
              className="ml-auto transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            to={`/${me.role}/dashboard/tasks/${task.id}`}
            className="group flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-[#278CFA]"
          >
            Open Full Task

            <ArrowSquareOutIcon
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </aside>
  );
};