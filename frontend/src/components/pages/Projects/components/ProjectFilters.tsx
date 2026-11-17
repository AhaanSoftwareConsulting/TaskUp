import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { Filters } from "../projectFilters";

interface Props {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
  activeCount: number;
  options: { managers: string[]; clients: string[]; resources: string[] };
}

const control =
  "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black";

const Label = ({ text, children, className = "" }: { text: string; children: ReactNode; className?: string }) => (
  <div className={`space-y-1.5 text-xs font-medium text-gray-600 ${className}`}>
    <span>{text}</span>
    {children}
  </div>
);

const Select = ({ value, onChange, all, items }: { value: string; onChange: (v: string) => void; all: string; items: string[] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={control}>
    <option value="">{all}</option>
    {items.map((i) => (
      <option key={i}>{i}</option>
    ))}
  </select>
);

export const ProjectFilters = ({ filters, onChange, onClear, activeCount, options }: Props) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Label text="Status">
        <Select value={filters.status} onChange={(v) => onChange("status", v)} all="All statuses" items={["Active", "On Hold", "Completed", "Delayed"]} />
      </Label>
      <Label text="Project manager">
        <Select value={filters.manager} onChange={(v) => onChange("manager", v)} all="All managers" items={options.managers} />
      </Label>
      <Label text="Assigned resource">
        <Select value={filters.resource} onChange={(v) => onChange("resource", v)} all="All resources" items={options.resources} />
      </Label>
      <Label text="Client">
        <Select value={filters.client} onChange={(v) => onChange("client", v)} all="All clients" items={options.clients} />
      </Label>
      <Label text="Priority">
        <Select value={filters.priority} onChange={(v) => onChange("priority", v)} all="All priorities" items={["High", "Medium", "Low"]} />
      </Label>
      <Label text="Start date (from – to)">
        <div className="flex gap-2">
          <input type="date" aria-label="Start date from" value={filters.startFrom} onChange={(e) => onChange("startFrom", e.target.value)} className={control} />
          <input type="date" aria-label="Start date to" value={filters.startTo} onChange={(e) => onChange("startTo", e.target.value)} className={control} />
        </div>
      </Label>
      <Label text="Deadline (from – to)" className="sm:col-span-2">
        <div className="flex gap-2">
          <input type="date" aria-label="Deadline from" value={filters.deadlineFrom} onChange={(e) => onChange("deadlineFrom", e.target.value)} className={control} />
          <input type="date" aria-label="Deadline to" value={filters.deadlineTo} onChange={(e) => onChange("deadlineTo", e.target.value)} className={control} />
        </div>
      </Label>
    </div>
    {activeCount > 0 && (
      <button onClick={onClear} className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black">
        <XIcon size={14} /> Clear all filters
      </button>
    )}
  </section>
);
