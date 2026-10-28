import { Link } from "react-router-dom";
import { ListChecksIcon, TimerIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { HomeData } from "./useHomeData";

export const HeroBanner = ({ data }: { data: HomeData }) => {
  const { user, base, tasksLink, myOpen, myDueSoon, myOverdue, activeTimer } = data;
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const first = user?.full_name?.split(" ")[0] ?? "there";
  const dateText = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const link = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 p-8 text-white shadow-xl">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-white/60">{dateText}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{greet}, {first}</h1>
          <p className="mt-2 max-w-xl text-white/70">
            You have <b className="text-white">{myOpen.length}</b> open {myOpen.length === 1 ? "task" : "tasks"},{" "}
            <b className="text-white">{myDueSoon.length}</b> due this week
            {myOverdue.length > 0 && <> and <b className="text-red-300">{myOverdue.length} overdue</b></>}.
          </p>
          {activeTimer && (
            <Link to={`${base}/tasks/${activeTimer.taskId}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              <TimerIcon size={14} weight="fill" /> Tracking: {activeTimer.taskTitle}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={tasksLink} className={`${link} bg-white text-gray-900 hover:bg-gray-100`}><ListChecksIcon size={18} />Open tasks</Link>
          <Link to={`${base}/profile`} className={`${link} bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20`}><UserCircleIcon size={18} />My profile</Link>
        </div>
      </div>
    </div>
  );
};