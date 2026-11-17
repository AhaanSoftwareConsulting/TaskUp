import { MagnifyingGlassIcon, PlusIcon, RowsIcon, SlidersHorizontalIcon, SquaresFourIcon } from "@phosphor-icons/react";
import type { ProjectStatus } from "../../../types/project.Types";

interface Props {
  counts: { total: number; active: number; hold: number; delayed: number };
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

const Tile = ({ label, value, color, selected, onClick }: { label: string; value: number; color: string; selected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-pressed={selected}
    className={`rounded-xl px-3 py-2 text-left transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black ${
      selected ? "bg-gray-100" : ""
    }`}
  >
    <div className={`text-4xl font-bold ${color}`}>{value}</div>
    <div className="mt-2 text-base text-gray-600">{label}</div>
  </button>
);

export const ProjectsHeader = (p: Props) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
        <p className="mt-1 text-gray-500">Manage and monitor all projects</p>
      </div>
      <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">Project overview</span>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Tile label="Total" value={p.counts.total} color="text-gray-900" selected={p.statusFilter === ""} onClick={() => p.onStatusClick("")} />
      <Tile label="Active" value={p.counts.active} color="text-emerald-600" selected={p.statusFilter === "Active"} onClick={() => p.onStatusClick("Active")} />
      <Tile label="On Hold" value={p.counts.hold} color="text-orange-500" selected={p.statusFilter === "On Hold"} onClick={() => p.onStatusClick("On Hold")} />
      <Tile label="Delayed" value={p.counts.delayed} color="text-red-500" selected={p.statusFilter === "Delayed"} onClick={() => p.onStatusClick("Delayed")} />
    </div>

    <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
      <div className="flex flex-1 items-center gap-3 px-1">
        <MagnifyingGlassIcon size={22} className="text-gray-500" />
        <input
          value={p.search}
          onChange={(e) => p.onSearch(e.target.value)}
          placeholder="Search projects..."
          aria-label="Search by project name"
          className="w-full bg-transparent text-lg text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex rounded-lg border border-gray-200 p-0.5">
        {([["cards", SquaresFourIcon, "Card view"], ["table", RowsIcon, "Table view"]] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => p.onView(key)}
            aria-label={label}
            aria-pressed={p.view === key}
            className={`rounded-md p-2 ${p.view === key ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      <button
        onClick={p.onToggleFilters}
        aria-label="Filters"
        aria-expanded={p.filtersOpen}
        className="relative rounded-lg p-2 text-gray-800 hover:bg-gray-100"
      >
        <SlidersHorizontalIcon size={24} />
        {p.filterCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
            {p.filterCount}
          </span>
        )}
      </button>

      {p.onCreate && (
        <button onClick={p.onCreate} aria-label="Create project" className="rounded-lg p-2 text-gray-800 hover:bg-gray-100">
          <PlusIcon size={24} />
        </button>
      )}
    </div>
  </section>
);
