import { Link } from "react-router-dom";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import type { HomeData } from "./useHomeData";

export const TeamWorkload = ({ data }: { data: HomeData }) => {
  const max = Math.max(1, ...data.workload.map((w) => w.open));
  return (
    <Card title="Team workload" icon={<UsersThreeIcon size={14} weight="bold" />} to={`${data.base}/teams`}>
      {data.workload.length === 0 ? <Empty text="No assignments yet." /> : (
        <ul className="space-y-4">
          {data.workload.map((w) => (
            <li key={w.user.id}>
              <Link to={`${data.base}/teams`} className="flex items-center gap-3">
                <Avatar name={w.user.full_name} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-xs"><b className="truncate text-gray-800">{w.user.full_name}</b><span className="text-gray-400">{w.open} open · {(w.hoursMs / 3600000).toFixed(1)}h</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${(w.open / max) * 100}%` }} /></div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};