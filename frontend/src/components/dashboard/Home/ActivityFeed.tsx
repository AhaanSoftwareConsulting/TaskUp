import { Link } from "react-router-dom";
import {
  PulseIcon,
  ArrowUpRightIcon,
  ClockIcon,
  ActivityIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import type { HomeData } from "./useHomeData";

const ago = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

export const ActivityFeed = ({ data }: { data: HomeData }) => (
  <Card
    title="Recent Activity"
    icon={<PulseIcon size={15} weight="bold" />}
  >
    {data.activity.length === 0 ? (
      <Empty text="No activity yet." />
    ) : (
      <ul className="space-y-1">
        {data.activity.slice(0, 4).map((a, index) => {
          const isYou = a.user?.id === data.user?.id;
          const userName = isYou
            ? "You"
            : a.user?.full_name ?? "Someone";

          return (
            <li key={a.key}>
              <Link
                to={`${data.base}/tasks/${a.task.id}`}
                className="group relative flex items-start gap-3 rounded-xl px-2.5 py-3 transition-all duration-200 hover:bg-blue-50/50"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="rounded-full ring-2 ring-white transition-all duration-200 group-hover:ring-blue-100">
                    <Avatar
                      name={a.user?.full_name}
                      size={36}
                    />
                  </div>

                  {/* Activity Indicator */}
                  {index !== Math.min(data.activity.length, 4) - 1 && (
                    <span className="absolute left-1/2 top-10 h-5 w-px -translate-x-1/2 bg-gray-100" />
                  )}
                </div>

                {/* Activity Content */}
                <div className="min-w-0 flex-1 pt-0.5">

                  {/* User + Action */}
                  <p className="text-[13px] leading-relaxed text-gray-600">
                    <span className="font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                      {userName}
                    </span>{" "}
                    <span>{a.action}</span>
                  </p>

                  {/* Task Information */}
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                    <ActivityIcon
                      size={13}
                      className="shrink-0 text-gray-400"
                    />

                    <p className="truncate text-[11px] font-medium text-gray-400">
                      {a.task.title}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-gray-400">
                    <ClockIcon size={12} />
                    <span>{ago(a.at)}</span>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 opacity-0 transition-all duration-200 group-hover:bg-white group-hover:text-blue-600 group-hover:opacity-100">
                  <ArrowUpRightIcon
                    size={16}
                    weight="bold"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);