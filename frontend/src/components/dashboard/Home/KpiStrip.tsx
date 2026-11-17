import { Link } from "react-router-dom";
import {
  CalendarCheckIcon,
  ClockIcon,
  ListChecksIcon,
  WarningIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { HomeData } from "./useHomeData";

const Tile = ({
  to,
  icon,
  value,
  label,
  tone,
  accent,
  bg,
}: {
  to: string;
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone: string;
  accent: string;
  bg: string;
}) => (
  <Link
    to={to}
    className="group relative isolate overflow-hidden rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50"
  >
    {/* Top Accent */}
    <div className={`absolute left-0 top-0 h-1 w-full ${accent} opacity-80`} />

    {/* Decorative Background */}
    <div
      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${bg} opacity-40 blur-2xl transition-all duration-500 group-hover:scale-150`}
    />

    <div className="relative z-10 flex items-center justify-between">
      {/* Icon */}
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        {icon}
      </div>

      {/* Arrow */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition-all duration-300 group-hover:bg-gray-100 group-hover:text-gray-700">
        <ArrowUpRightIcon size={17} weight="bold" />
      </div>
    </div>

    {/* Content */}
    <div className="relative z-10 mt-3.5">
      <p className="text-2xl font-extrabold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>
    </div>

    {/* Bottom Progress */}
    <div className="relative mt-3.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full w-1/3 rounded-full ${accent} transition-all duration-500 group-hover:w-2/3`}
      />
    </div>
  </Link>
);

export const KpiStrip = ({ data }: { data: HomeData }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Tile
      to={data.tasksLink}
      icon={<ListChecksIcon size={24} weight="duotone" />}
      value={data.myOpen.length}
      label="My Open Tasks"
      tone="bg-blue-50 text-blue-600"
      accent="bg-blue-500"
      bg="bg-blue-300"
    />

    <Tile
      to={data.tasksLink}
      icon={<CalendarCheckIcon size={24} weight="duotone" />}
      value={data.myDueSoon.length}
      label="Due This Week"
      tone="bg-amber-50 text-amber-600"
      accent="bg-amber-500"
      bg="bg-amber-300"
    />

    <Tile
      to={data.tasksLink}
      icon={<WarningIcon size={24} weight="duotone" />}
      value={data.myOverdue.length}
      label="Overdue"
      tone="bg-rose-50 text-rose-600"
      accent="bg-rose-500"
      bg="bg-rose-300"
    />

    <Tile
      to={`${data.base}/profile`}
      icon={<ClockIcon size={24} weight="duotone" />}
      value={`${(data.myHoursMs / 3600000).toFixed(1)}h`}
      label="Hours Logged"
      tone="bg-emerald-50 text-emerald-600"
      accent="bg-emerald-500"
      bg="bg-emerald-300"
    />
  </div>
);