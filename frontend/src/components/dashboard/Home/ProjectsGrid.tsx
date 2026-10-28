import { Link } from "react-router-dom";
import { KanbanIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { Avatar } from "../Task/CommentComposer";
import { slugify } from "../../hooks/slugify";
import type { HomeData } from "./useHomeData";

export const ProjectsGrid = ({ data }: { data: HomeData }) => (
  <Card title="Projects" icon={<KanbanIcon size={14} weight="bold" />}>
    {data.projects.length === 0 ? <Empty text="No projects yet." /> : (
      <div className="grid gap-4 sm:grid-cols-2">
        {data.projects.slice(0, 6).map(({ board, total, done, pct, overdue }) => (
          <Link key={board.id} to={`${data.base}/${slugify(board.name)}`}
            className="group rounded-2xl border border-gray-100 p-4 transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate font-bold capitalize text-gray-800 group-hover:text-blue-600">{board.name}</h4>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{board.description || `${board.members.length} members`}</p>
              </div>
              <span className="shrink-0 text-lg font-black text-gray-800">{pct}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} /></div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {board.members.slice(0, 4).map((m) => <div key={m.id} className="rounded-full border-2 border-white"><Avatar name={m.full_name} size={24} /></div>)}
                {board.members.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500">+{board.members.length - 4}</span>}
              </div>
              <span className="text-[11px] text-gray-400">{done}/{total} done{overdue > 0 && <b className="ml-2 text-red-500">{overdue} overdue</b>}</span>
            </div>
          </Link>
        ))}
      </div>
    )}
  </Card>
);