import { Link } from "react-router-dom";
import { PulseIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import type { HomeData } from "./useHomeData";

const ago = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export const ActivityFeed = ({ data }: { data: HomeData }) => (
  <Card title="Recent activity" icon={<PulseIcon size={14} weight="bold" />}>
    {data.activity.length === 0 ? <Empty text="No activity yet." /> : (
      <ul className="space-y-3">
        {data.activity.map((a) => (
          <li key={a.key}>
            <Link to={`${data.base}/tasks/${a.task.id}`} className="flex items-start gap-3 rounded-lg p-1.5 transition hover:bg-gray-50">
              <Avatar name={a.user?.full_name} size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600"><b className="text-gray-800">{a.user?.id === data.user?.id ? "You" : a.user?.full_name ?? "Someone"}</b> {a.action}</p>
                <p className="truncate text-[11px] text-gray-400">{a.task.title} · {ago(a.at)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Card>
);