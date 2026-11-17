import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  PlusIcon,
  SquaresFourIcon,
  RowsIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  useProjects,
  msToHours,
  formatDate,
  statusStyle,
  priorityStyle,
  type ProjectView,
  type ProjectStatus,
} from "../../hooks/useProjects";
import { useAppDispatch } from "../../redux/app/hook";
import { fetchBoard } from "../../redux/features/Board/boardSlice";
import { CreateBoardForm } from "../../redux/features/Board/CreateBoardForm";
import { EditBoardModal } from "../../modal/EditBoardModal";
import axiosClient from "../../api/boardApiClient";
import { getAvatarColor } from "../../utils/avatarColor";

const emptyFilters = {
  status: "",
  manager: "",
  resource: "",
  priority: "",
  client: "",
  startFrom: "",
  startTo: "",
  dueFrom: "",
  dueTo: "",
};
type Filters = typeof emptyFilters;

const inRange = (value: string | null, from: string, to: string) => {
  if (!from && !to) return true;
  if (!value) return false;
  const t = new Date(value).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime() + 86_399_999) return false;
  return true;
};

const field =
  "h-10 w-full rounded-lg bg-zinc-900 border border-white/10 px-3 text-sm text-white outline-none focus:border-emerald-500 [color-scheme:dark]";

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, user, isManager, loading } = useProjects();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const base = `/${user?.role || "user"}/dashboard/projects`;
  const setF = (k: keyof Filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const counts = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "Active").length,
      hold: projects.filter((p) => p.status === "On Hold").length,
      delayed: projects.filter((p) => p.status === "Delayed").length,
    }),
    [projects]
  );

  const options = useMemo(() => {
    const uniq = (a: string[]) => [...new Set(a.filter((x) => x && x !== "—"))].sort();
    return {
      managers: uniq(projects.map((p) => p.manager)),
      clients: uniq(projects.map((p) => p.client)),
      resources: uniq(projects.flatMap((p) => p.resources.map((r) => r.name))),
    };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q)) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.manager && p.manager !== filters.manager) return false;
      if (filters.client && p.client !== filters.client) return false;
      if (filters.priority && p.priority !== filters.priority) return false;
      if (filters.resource && !p.resources.some((r) => r.name === filters.resource)) return false;
      if (!inRange(p.startDate, filters.startFrom, filters.startTo)) return false;
      if (!inRange(p.deadline, filters.dueFrom, filters.dueTo)) return false;
      return true;
    });
  }, [projects, search, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const clearAll = () => {
    setFilters(emptyFilters);
    setSearch("");
  };

  const archive = async (p: ProjectView) => {
    if (!window.confirm(`Archive "${p.name}"? It will be hidden from the project list.`)) return;
    try {
      // Assumes PATCH /api/boards/:id accepts { archived: true }
      await axiosClient.patch(`/api/boards/${p.id}`, { archived: true }, { withCredentials: true });
      dispatch(fetchBoard());
    } catch (e) {
      console.error("Archive failed", e);
    }
  };

  const statTile = (label: string, value: number, color: string, status?: ProjectStatus) => (
    <button
      key={label}
      onClick={() => setF("status", status && filters.status !== status ? status : "")}
      className="text-left rounded-lg px-1 py-1 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
    >
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
      <div className="mt-3 text-base text-zinc-300">{label}</div>
    </button>
  );

  return (
    <div className="w-full p-6 lg:p-10 space-y-6">
      {/* ---------- Section 1: overview, search, filters ---------- */}
      <section className="rounded-2xl bg-black text-white p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Projects</h1>
            <p className="mt-1 text-zinc-400">Manage and monitor all projects</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400">
            Project overview
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statTile("Total", counts.total, "text-white")}
          {statTile("Active", counts.active, "text-emerald-500", "Active")}
          {statTile("On Hold", counts.hold, "text-orange-500", "On Hold")}
          {statTile("Delayed", counts.delayed, "text-red-400", "Delayed")}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 px-2">
            <MagnifyingGlassIcon size={22} className="text-zinc-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects by name"
              className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex rounded-lg border border-white/10 p-0.5">
            <button
              onClick={() => setView("cards")}
              aria-label="Card view"
              className={`p-2 rounded-md ${view === "cards" ? "bg-white/15" : "text-zinc-400"}`}
            >
              <SquaresFourIcon size={18} />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className={`p-2 rounded-md ${view === "table" ? "bg-white/15" : "text-zinc-400"}`}
            >
              <RowsIcon size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowFilters((s) => !s)}
            aria-label="Filters"
            aria-expanded={showFilters}
            className="relative p-2 rounded-lg hover:bg-white/10"
          >
            <SlidersHorizontalIcon size={24} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreate(true)}
            aria-label="Create project"
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <PlusIcon size={24} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-zinc-400 space-y-1.5">
                Status
                <select value={filters.status} onChange={(e) => setF("status", e.target.value)} className={field}>
                  <option value="">All statuses</option>
                  {["Active", "On Hold", "Completed", "Delayed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-zinc-400 space-y-1.5">
                Project manager
                <select value={filters.manager} onChange={(e) => setF("manager", e.target.value)} className={field}>
                  <option value="">All managers</option>
                  {options.managers.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-zinc-400 space-y-1.5">
                Assigned resource
                <select value={filters.resource} onChange={(e) => setF("resource", e.target.value)} className={field}>
                  <option value="">All resources</option>
                  {options.resources.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-zinc-400 space-y-1.5">
                Client
                <select value={filters.client} onChange={(e) => setF("client", e.target.value)} className={field}>
                  <option value="">All clients</option>
                  {options.clients.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-zinc-400 space-y-1.5">
                Priority
                <select value={filters.priority} onChange={(e) => setF("priority", e.target.value)} className={field}>
                  <option value="">All priorities</option>
                  {["High", "Medium", "Low"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>

              <div className="text-xs text-zinc-400 space-y-1.5">
                Start date
                <div className="flex gap-2">
                  <input type="date" aria-label="Start date from" value={filters.startFrom} onChange={(e) => setF("startFrom", e.target.value)} className={field} />
                  <input type="date" aria-label="Start date to" value={filters.startTo} onChange={(e) => setF("startTo", e.target.value)} className={field} />
                </div>
              </div>

              <div className="text-xs text-zinc-400 space-y-1.5 sm:col-span-2">
                Deadline
                <div className="flex gap-2">
                  <input type="date" aria-label="Deadline from" value={filters.dueFrom} onChange={(e) => setF("dueFrom", e.target.value)} className={field} />
                  <input type="date" aria-label="Deadline to" value={filters.dueTo} onChange={(e) => setF("dueTo", e.target.value)} className={field} />
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white">
                <XIcon size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* ---------- Section 2: projects ---------- */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="font-semibold text-gray-800">
            {projects.length === 0 ? "No projects yet" : "No projects match your search"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length === 0 ? "Create your first project to get started." : "Try removing a filter or searching for another name."}
          </p>
          {projects.length > 0 && (
            <button onClick={clearAll} className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">
              Clear filters
            </button>
          )}
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              onClick={() => navigate(`${base}/${p.id}`)}
              className="cursor-pointer rounded-2xl bg-black p-6 text-white hover:ring-1 hover:ring-white/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
                <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[p.status]}`}>
                  {p.status === "Active" ? "In Progress" : p.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-300">Client: {p.client}</p>

              <div className="mt-5 flex justify-between text-base">
                <span className="text-zinc-300">Progress</span>
                <span className="font-bold">{p.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4 text-sm text-zinc-300">
                <span className="min-w-0">
                  Assigned resource:{" "}
                  {p.resources.length === 0
                    ? "—"
                    : p.resources.slice(0, 2).map((r) => r.name.split(" ")[0]).join(", ") +
                      (p.resources.length > 2 ? ` +${p.resources.length - 2}` : "")}
                </span>
                <span className="shrink-0">Due: {formatDate(p.deadline)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
                <span>Logged: {msToHours(p.loggedMs)}h</span>
                <span className="text-zinc-400">View details →</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-black text-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                {["Project", "Manager", "Resources", "Start", "Deadline", "Progress", "Logged", "Status", "Priority", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-4 py-4">
                    <button onClick={() => navigate(`${base}/${p.id}`)} className="text-left">
                      <div className="font-semibold hover:underline">{p.name}</div>
                      <div className="text-xs text-zinc-400">{p.client}</div>
                    </button>
                  </td>
                  <td className="px-4 py-4 text-zinc-200">{p.manager}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2" title={p.resources.map((r) => r.name).join(", ")}>
                      <div className="flex -space-x-2">
                        {p.resources.slice(0, 3).map((r) => (
                          <span
                            key={r.id}
                            className="grid h-6 w-6 place-items-center rounded-full border border-black text-[10px] font-bold"
                            style={{ backgroundColor: getAvatarColor(r.name) }}
                          >
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <span className="text-zinc-300">{p.resources.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-4 text-zinc-300">{formatDate(p.deadline)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{msToHours(p.loggedMs)}h</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyle[p.priority]}`}>{p.priority}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => navigate(`${base}/${p.id}`)} className="text-zinc-200 hover:text-white">
                        View
                      </button>
                      {isManager && (
                        <>
                          <button onClick={() => setEditId(p.id)} className="text-zinc-200 hover:text-white">
                            Edit
                          </button>
                          <button onClick={() => archive(p)} className="text-orange-400 hover:text-orange-300">
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-[520px] max-w-[95vw] rounded-2xl bg-white p-8" onClick={(e) => e.stopPropagation()}>
            <CreateBoardForm onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}
      {editId && <EditBoardModal boardId={editId} onClose={() => setEditId(null)} />}
    </div>
  );
};

export default ProjectsPage;
