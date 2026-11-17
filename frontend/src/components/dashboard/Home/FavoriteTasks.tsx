import { Link } from "react-router-dom";
import {
  StarIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import type { HomeData } from "./useHomeData";

const PRIORITY_TONE: Record<string, string> = {
  Critical: "bg-red-50 text-red-600",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-gray-100 text-gray-500",
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-amber-400",
  Low: "bg-gray-300",
};

export const FavoriteTasks = ({ data }: { data: HomeData }) => (
  <Card
    title="Starred Tasks"
    icon={
      <StarIcon
        size={15}
        weight="fill"
        className="text-yellow-400"
      />
    }
    to={`${data.base}/profile`}
  >
    {data.favorites.length === 0 ? (
      <Empty text="Star a task to pin it here." />
    ) : (
      <ul className="space-y-1">
        {data.favorites.map((t) => (
          <li key={t.id}>
            <Link
              to={`${data.base}/tasks/${t.id}`}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/50"
            >
              {/* Star Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition-all duration-300 group-hover:scale-105 group-hover:bg-amber-100">
                <StarIcon size={17} weight="fill" />
              </div>

              {/* Task Title */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600">
                  {t.title}
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-gray-400">
                  Saved to favorites
                </p>
              </div>

              {/* Priority Badge */}
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                  PRIORITY_TONE[t.priority] ?? PRIORITY_TONE.Low
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    PRIORITY_DOT[t.priority] ?? PRIORITY_DOT.Low
                  }`}
                />
                {t.priority}
              </span>

              {/* Arrow */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 transition-all duration-200 group-hover:bg-white group-hover:text-blue-600">
                <ArrowUpRightIcon
                  size={15}
                  weight="bold"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
