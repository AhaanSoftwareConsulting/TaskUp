import { Link } from "react-router-dom";
import { CalendarCheckIcon, ClockIcon, ListChecksIcon, WarningIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { HomeData } from "./useHomeData";

const Tile = ({ to, icon, value, label, tone }: { to: string; icon: ReactNode; value: ReactNode; label: string; tone: string }) => (
  <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
    <div><p className="text-2xl font-black text-gray-900">{value}</p><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p></div>
  </Link>
);

export const KpiStrip = ({ data }: { data: HomeData }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <Tile to={data.tasksLink} icon={<ListChecksIcon size={24} />} value={data.myOpen.length} label="My open tasks" tone="bg-blue-50 text-blue-600" />
    <Tile to={data.tasksLink} icon={<CalendarCheckIcon size={24} />} value={data.myDueSoon.length} label="Due this week" tone="bg-amber-50 text-amber-600" />
    <Tile to={data.tasksLink} icon={<WarningIcon size={24} />} value={data.myOverdue.length} label="Overdue" tone="bg-red-50 text-red-600" />
    <Tile to={`${data.base}/profile`} icon={<ClockIcon size={24} />} value={`${(data.myHoursMs / 3600000).toFixed(1)}h`} label="Hours logged" tone="bg-emerald-50 text-emerald-600" />
  </div>
);