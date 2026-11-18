import { XIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { Filters } from "../projectFilters";

interface Props {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
  activeCount: number;
  options: {
    managers: string[];
    clients: string[];
    resources: string[];
  };
}

const control =
  "h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

const Label = ({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-gray-500">
      {text}
    </span>
    {children}
  </label>
);

const Select = ({
  value,
  onChange,
  all,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  all: string;
  items: string[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={control}
  >
    <option value="">{all}</option>

    {items.map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>
);

const DateInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <Label text={label}>
    <input
      type="date"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={control}
    />
  </Label>
);

export const ProjectFilters = ({
  filters,
  onChange,
  onClear,
  activeCount,
  options,
}: Props) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <FunnelSimpleIcon size={16} weight="bold" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Filter projects
          </h3>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Refine projects by their details
          </p>
        </div>
      </div>

      {activeCount > 0 && (
        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
          {activeCount} active {activeCount === 1 ? "filter" : "filters"}
        </span>
      )}
    </div>

    {/* Filter Fields */}
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
      <Label text="Status">
        <Select
          value={filters.status}
          onChange={(v) => onChange("status", v)}
          all="All statuses"
          items={["Active", "On Hold", "Completed", "Delayed"]}
        />
      </Label>

      <Label text="Project manager">
        <Select
          value={filters.manager}
          onChange={(v) => onChange("manager", v)}
          all="All managers"
          items={options.managers}
        />
      </Label>

      <Label text="Assigned resource">
        <Select
          value={filters.resource}
          onChange={(v) => onChange("resource", v)}
          all="All resources"
          items={options.resources}
        />
      </Label>

      <Label text="Client">
        <Select
          value={filters.client}
          onChange={(v) => onChange("client", v)}
          all="All clients"
          items={options.clients}
        />
      </Label>

      <Label text="Priority">
        <Select
          value={filters.priority}
          onChange={(v) => onChange("priority", v)}
          all="All priorities"
          items={["High", "Medium", "Low"]}
        />
      </Label>

      <DateInput
        label="Start date from"
        value={filters.startFrom}
        onChange={(v) => onChange("startFrom", v)}
      />

      <DateInput
        label="Start date to"
        value={filters.startTo}
        onChange={(v) => onChange("startTo", v)}
      />

      <DateInput
        label="Deadline from"
        value={filters.deadlineFrom}
        onChange={(v) => onChange("deadlineFrom", v)}
      />

      <DateInput
        label="Deadline to"
        value={filters.deadlineTo}
        onChange={(v) => onChange("deadlineTo", v)}
      />
    </div>

    {/* Footer */}
    {activeCount > 0 && (
      <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <XIcon size={14} weight="bold" />
          Clear all filters
        </button>
      </div>
    )}
  </section>
);