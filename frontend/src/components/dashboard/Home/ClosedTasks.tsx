import { Link } from "react-router-dom";
import {
  LockSimpleIcon,
  FolderSimpleIcon,
  ClockIcon,
  CalendarBlankIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import { formatShort } from "../../utils/dateHelpers";
import type { HomeData } from "./useHomeData";

export const ClosedTasks = ({ data }: { data: HomeData }) => {
  const boards = data.projects.map((p) => p.board);
  const rows = data.closed.slice(0, 6);

  const hours = (t: (typeof rows)[number]) => {
    const ms = data.isStaff
      ? t.timeManagement?.total_logged_time ?? 0
      : t.timeManagement?.byUser?.find(
          (e) => e.user?.id === data.user?.id
        )?.duration ?? 0;

    return `${(ms / 3600000).toFixed(1)}h`;
  };

  return (
    <Card
      title={data.isStaff ? "Closed Tasks" : "My Closed Tasks"}
      icon={<LockSimpleIcon size={15} weight="bold" />}
      to={`${data.tasksLink}&closed=1`}
      action={`View all (${data.closed.length})`}
    >
      {rows.length === 0 ? (
        <Empty
          text={
            data.isStaff
              ? "No tasks have been closed yet."
              : "None of your tasks have been closed yet."
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">

            {/* Table Header */}
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="rounded-l-lg px-4 py-3">Task</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">
                  {data.isStaff ? "Assignees" : "Closed By"}
                </th>
                <th className="px-4 py-3">
                  {data.isStaff ? "Hours" : "My Hours"}
                </th>
                <th className="rounded-r-lg px-4 py-3 text-right">
                  Closed
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100/80">
              {rows.map((t) => {
                const projectName = boards.find(
                  (b) => b.id === t.board_id
                )?.name;

                return (
                  <tr
                    key={t.id}
                    className="group transition-colors duration-200 hover:bg-blue-50/40"
                  >
                    {/* Task */}
                    <td className="max-w-[240px] px-4 py-3.5">
                      <Link
                        to={`${data.base}/tasks/${t.id}`}
                        className="flex items-center gap-2 font-semibold text-gray-800 transition-colors hover:text-blue-600"
                      >
                        <span className="truncate">{t.title}</span>

                        <ArrowUpRightIcon
                          size={14}
                          className="shrink-0 text-gray-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex max-w-[230px] items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50/60">
                        <FolderSimpleIcon
                          size={14}
                          className="shrink-0 text-blue-500"
                        />

                        <span className="truncate">
                          {projectName ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Closed By / Assignees */}
                    <td className="px-4 py-3.5">
                      {data.isStaff ? (
                        <div className="flex items-center -space-x-2">
                          {t.assignedTo.slice(0, 4).map((u) => (
                            <div
                              key={u.id}
                              title={u.full_name}
                              className="rounded-full border-2 border-white transition-transform duration-200 hover:z-10 hover:-translate-y-1"
                            >
                              <Avatar
                                name={u.full_name}
                                size={28}
                              />
                            </div>
                          ))}

                          {t.assignedTo.length > 4 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500">
                              +{t.assignedTo.length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600">
                          {t.closed_by_user?.full_name ?? "—"}
                        </span>
                      )}
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3.5">
                      <Link
                        to={`${data.base}/tasks/${t.id}/hours`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <ClockIcon size={14} weight="bold" />
                        {hours(t)}
                      </Link>
                    </td>

                    {/* Closed Date */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500">
                        <CalendarBlankIcon
                          size={14}
                          className="text-gray-400"
                        />
                        {formatShort(t.closed_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
