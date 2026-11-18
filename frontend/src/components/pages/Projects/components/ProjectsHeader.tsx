import {
  MagnifyingGlassIcon,
  PlusIcon,
  RowsIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  WarningCircleIcon,
  SparkleIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";

import type { ProjectStatus } from "../../../types/project.Types";

interface Props {
  counts: {
    total: number;
    active: number;
    hold: number;
    delayed: number;
  };
  statusFilter: string;
  onStatusClick: (status: ProjectStatus | "") => void;
  search: string;
  onSearch: (v: string) => void;
  view: "cards" | "table";
  onView: (v: "cards" | "table") => void;
  filterCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  onCreate?: () => void;
}

const Tile = ({
  label,
  value,
  color,
  selected,
  onClick,
  icon: Icon,
  iconBg,
  indicator,
}: {
  label: string;
  value: number;
  color: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  iconBg: string;
  indicator: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${
      selected
        ? "border-indigo-200 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-100"
        : "border-gray-100 bg-white hover:border-gray-200"
    }`}
  >
    {/* Decorative Circle */}
    <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-gray-50 transition-transform duration-500 group-hover:scale-150" />

    <div className="relative">
      {/* Icon */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon size={19} weight="duotone" className={color} />
      </div>

      {/* Value */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={`text-2xl font-extrabold tracking-tight ${color}`}>
          {value}
        </span>

        <ArrowUpRightIcon
          size={15}
          weight="bold"
          className={`transition-all duration-300 ${
            selected
              ? "translate-x-0 text-indigo-500 opacity-100"
              : "text-gray-300 opacity-0 group-hover:translate-x-0.5 group-hover:text-indigo-500 group-hover:opacity-100"
          }`}
        />
      </div>

      {/* Label */}
      <p className="mt-1 text-[11px] font-semibold text-gray-500">
        {label}
      </p>

      {/* Bottom Indicator */}
      <div
        className={`mt-3 h-1 w-9 rounded-full transition-all duration-300 group-hover:w-full ${indicator}`}
      />
    </div>

    {/* Selected Indicator */}
    {selected && (
      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
    )}
  </button>
);

export const ProjectsHeader = (p: Props) => {
  const tiles = [
    {
      label: "Total projects",
      value: p.counts.total,
      color: "text-indigo-600",
      icon: FolderOpenIcon,
      iconBg: "bg-indigo-50",
      indicator: "bg-indigo-200",
      status: "",
    },
    {
      label: "Active projects",
      value: p.counts.active,
      color: "text-emerald-600",
      icon: CheckCircleIcon,
      iconBg: "bg-emerald-50",
      indicator: "bg-emerald-200",
      status: "Active",
    },
    {
      label: "On hold",
      value: p.counts.hold,
      color: "text-orange-500",
      icon: PauseCircleIcon,
      iconBg: "bg-orange-50",
      indicator: "bg-orange-200",
      status: "On Hold",
    },
    {
      label: "Delayed projects",
      value: p.counts.delayed,
      color: "text-rose-500",
      icon: WarningCircleIcon,
      iconBg: "bg-rose-50",
      indicator: "bg-rose-200",
      status: "Delayed",
    },
  ] as const;

  const views = [
    {
      key: "cards",
      icon: SquaresFourIcon,
      label: "Card view",
    },
    {
      key: "table",
      icon: RowsIcon,
      label: "Table view",
    },
  ] as const;

  return (
    <section className="space-y-5">

      {/* Hero Header */}
      <div className="relative isolate overflow-hidden rounded-[24px] bg-[#111827] p-5 text-white shadow-[0_14px_35px_-18px_rgba(15,23,42,0.4)] sm:p-7">

        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#111827] via-[#172554] to-[#312E81]" />

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-32 -z-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-[90px]" />

        <div className="absolute -bottom-32 left-1/3 -z-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-[90px]" />

        {/* Decorative Circles */}
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border border-white/[0.07] lg:block" />

        <div className="pointer-events-none absolute right-5 top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full border border-white/[0.07] lg:block" />

        {/* Content */}
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            {/* Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 backdrop-blur-md">
              <SparkleIcon
                size={12}
                weight="fill"
                className="text-cyan-300"
              />

              <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/75">
                Project workspace
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              All Projects
            </h1>

            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Manage, organize and monitor all your projects in one place.
            </p>
          </div>

          {/* Project Overview Badge */}
          <div className="flex items-center gap-3 self-start rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-md sm:self-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
              <FolderOpenIcon size={20} weight="duotone" />
            </div>

            <div>
              <p className="text-lg font-bold leading-none">
                {p.counts.total}
              </p>

              <p className="mt-1 text-[9px] font-medium uppercase tracking-wider text-white/60">
                Total projects
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {tiles.map((tile) => (
          <Tile
            key={tile.label}
            label={tile.label}
            value={tile.value}
            color={tile.color}
            icon={tile.icon}
            iconBg={tile.iconBg}
            indicator={tile.indicator}
            selected={p.statusFilter === tile.status}
            onClick={() => p.onStatusClick(tile.status)}
          />
        ))}
      </div>

      {/* Search & Toolbar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Search */}
          <div className="group flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 transition-all duration-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">

            <MagnifyingGlassIcon
              size={19}
              weight="bold"
              className="shrink-0 text-gray-400 transition-colors group-focus-within:text-indigo-500"
            />

            <input
              value={p.search}
              onChange={(e) => p.onSearch(e.target.value)}
              placeholder="Search projects..."
              aria-label="Search by project name"
              className="w-full bg-transparent text-xs font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-400"
            />

            {p.search && (
              <button
                type="button"
                onClick={() => p.onSearch("")}
                aria-label="Clear search"
                className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center gap-2">

            {/* View Switcher */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/70 p-1">
              {views.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => p.onView(key)}
                  aria-label={label}
                  aria-pressed={p.view === key}
                  className={`flex h-8 w-9 items-center justify-center rounded-lg transition-all duration-200 ${
                    p.view === key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  <Icon size={17} weight="bold" />
                </button>
              ))}
            </div>

            {/* Filters */}
            <button
              type="button"
              onClick={p.onToggleFilters}
              aria-label="Filters"
              aria-expanded={p.filtersOpen}
              className={`relative flex h-10 items-center justify-center gap-2 rounded-xl border px-3 transition-all duration-200 ${
                p.filtersOpen
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontalIcon size={17} weight="bold" />

              <span className="hidden text-[11px] font-semibold sm:inline">
                Filters
              </span>

              {p.filterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                  {p.filterCount}
                </span>
              )}
            </button>

            {/* Create Project */}
            {p.onCreate && (
              <button
                type="button"
                onClick={p.onCreate}
                className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 text-white shadow-sm shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md sm:px-4"
              >
                <PlusIcon size={17} weight="bold" />

                <span className="hidden text-[11px] font-bold sm:inline">
                  New project
                </span>
              </button>
            )}

          </div>
        </div>

        {/* Active Search / Filter Indicator */}
        {(p.search || p.statusFilter) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">

            <span className="text-[10px] font-medium text-gray-400">
              Active:
            </span>

            {p.statusFilter && (
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                {p.statusFilter}
              </span>
            )}

            {p.search && (
              <span className="max-w-[200px] truncate rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                Search: {p.search}
              </span>
            )}

          </div>
        )}

      </div>
    </section>
  );
};