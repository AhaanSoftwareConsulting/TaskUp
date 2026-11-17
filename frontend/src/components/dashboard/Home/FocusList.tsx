import { Link } from "react-router-dom";
import {
  TargetIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
  FlagIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { dueInfo } from "../../utils/dateHelpers";
import type { HomeData } from "./useHomeData";

const TONE = {
  red: "bg-red-50 text-red-600 border-red-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
};

const DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-400",
  Low: "bg-gray-300",
};

const PRIORITY_TONE: Record<string, string> = {
  Critical: "bg-red-50 text-red-600",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-gray-100 text-gray-500",
};

export const FocusList = ({ data }: { data: HomeData }) => {
  const boards = data.projects.map((p) => p.board);

  return (
    <Card
      title="My Focus"
      icon={<TargetIcon size={15} weight="bold" />}
      to={data.tasksLink}
    >
      {data.myOpen.length === 0 ? (
        <Empty text="Nothing assigned to you. Enjoy the calm." />
      ) : (
        <ul className="divide-y divide-gray-100/80">
          {data.myOpen.slice(0, 6).map((t) => {
            const due = dueInfo(t.due_date);

            return (
              <li key={t.id}>
                <Link
                  to={`${data.base}/tasks/${t.id}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3.5 transition-all duration-200 hover:bg-blue-50/50"
                >
                  {/* Priority Indicator */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 transition-colors duration-200 group-hover:bg-white">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        DOT[t.priority] ?? DOT.Low
                      } ring-4 ring-gray-100/70`}
                      title={t.priority}
                    />
                  </div>

                  {/* Task Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-gray-800 transition-colors group-hover:text-blue-600">
                        {t.title}
                      </p>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-gray-400">
                      <span className="truncate">
                        {boards.find((b) => b.id === t.board_id)?.name ?? "—"}
                      </span>

                      <span className="shrink-0 text-gray-300">•</span>

                      <span className="shrink-0">
                        {data.statusOf(t) ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Priority & Due Date */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
                        PRIORITY_TONE[t.priority] ?? PRIORITY_TONE.Low
                      }`}
                    >
                      <FlagIcon size={11} weight="fill" />
                      {t.priority}
                    </span>

                    {due && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold ${
                          TONE[due.tone]
                        }`}
                      >
                        <CalendarBlankIcon size={11} weight="bold" />
                        {due.label}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 transition-all duration-200 group-hover:bg-white group-hover:text-blue-600">
                    <ArrowUpRightIcon size={16} weight="bold" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
