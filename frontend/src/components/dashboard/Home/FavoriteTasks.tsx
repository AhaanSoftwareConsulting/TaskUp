import { StarIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import type { HomeData } from "./useHomeData";
import { Link } from "react-router-dom";
export const FavoriteTasks = ({ data }: { data: HomeData }) => (
  <Card title="Starred tasks" icon={<StarIcon size={14} weight="fill" className="text-yellow-400" />} to={`${data.base}/profile`}>
    {data.favorites.length === 0 ? <Empty text="Star a task to pin it here." /> : (
      <ul className="space-y-1">
        {data.favorites.map((t) => (
          <li key={t.id}><Link to={`${data.base}/tasks/${t.id}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
            <span className="truncate text-gray-700">{t.title}</span><span className="ml-2 shrink-0 text-[10px] font-black uppercase text-gray-400">{t.priority}</span>
          </Link></li>
        ))}
      </ul>
    )}
  </Card>
);