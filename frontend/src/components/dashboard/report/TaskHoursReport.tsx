import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowsClockwiseIcon, CalendarBlankIcon, CaretDownIcon, ClockIcon, DownloadSimpleIcon, UserIcon, UsersIcon } from "@phosphor-icons/react";
import boardApiClient from "../../api/boardApiClient";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks } from "../../redux/features/Task/taskSlice";
import { getColumnColor } from "../../utils/columnColors";
import { formatLong } from "../../utils/dateHelpers";
import { HoursChart } from "./HoursChart";
import { HoursTable } from "./HoursTable";
import { buildBuckets, buildRows, dayKeyOf, fmtHours, toCsv, type Granularity, type HoursReport } from "./hoursData";

const Skeleton = () => (
  <div className="mx-auto max-w-6xl animate-pulse space-y-6 p-6 lg:p-8">
    <div className="h-8 w-72 rounded-lg bg-gray-200" />
    <div className="h-28 rounded-2xl bg-gray-100" />
    <div className="h-96 rounded-2xl bg-gray-100" />
  </div>
);

const dateBox = "rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300";

export const TaskHoursReport = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const task = useAppSelector((s) => s.task.task.find((t) => t.id === taskId));
  const board = useAppSelector((s) => s.board.boards.find((b) => b.id === task?.board_id));
  const columns = useAppSelector((s) => s.column.columns);

  const [report, setReport] = useState<HoursReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [member, setMember] = useState("all");
  const [gran, setGran] = useState<Granularity>("daily");
  const touched = useRef(false);

  useEffect(() => { if (!task) dispatch(getTasks()); }, [dispatch, task]);

  const load = useCallback(async () => {
    if (!taskId) return;
    setError(null);
    try {
      const res = await boardApiClient.get<HoursReport>(`/api/tasks/${taskId}/hours`, { withCredentials: true });
      setReport(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Could not load the report");
    }
  }, [taskId]);
  useEffect(() => { setReport(null); touched.current = false; load(); }, [load]);

  // default range = first to last day that has time logged
  useEffect(() => {
    if (!report || touched.current) return;
    const days = buildRows(report, Date.now()).map((r) => r.dayKey).sort();
    setFrom(days[0] ?? dayKeyOf(Date.now() - 6 * 86400000));
    setTo(days[days.length - 1] ?? dayKeyOf(Date.now()));
  }, [report]);

  // keep a running session's duration moving
  const runningCount = report?.running.length ?? 0;
  useEffect(() => {
    if (!runningCount) return;
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, [runningCount]);

  const allRows = useMemo(() => (report ? buildRows(report, now) : []), [report, now]);
  const members = useMemo(() => {
    const m = new Map<string, string>();
    allRows.forEach((r) => m.set(r.user.id, r.user.full_name ?? "Unknown"));
    return [...m.entries()];
  }, [allRows]);
  const rows = useMemo(
    () => allRows.filter((r) => r.dayKey >= from && r.dayKey <= to && (member === "all" || r.user.id === member)),
    [allRows, from, to, member]
  );
  const buckets = useMemo(() => buildBuckets(rows, from, to, gran), [rows, from, to, gran]);

  const setRange = (f: string, t: string) => { touched.current = true; setFrom(f); setTo(t); };
  const allTime = () => {
    const days = allRows.map((r) => r.dayKey).sort();
    if (days.length) setRange(days[0], days[days.length - 1]);
  };

  const exportCsv = () => {
    const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(task?.title ?? "task").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-hours-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <button onClick={load} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }
  if (!task || !report) return <Skeleton />;

  const status = columns[task.board_id]?.find((c) => c.id === task.column_id)?.name ?? "No status";
  const color = getColumnColor(status);
  const totalAll = allRows.reduce((s, r) => s + r.duration, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <header className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="mt-1 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Back"><ArrowLeftIcon size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Working Hours Report</h1>
          <p className="text-sm text-gray-500">Track and view daily working hours for this task.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"><ArrowsClockwiseIcon size={14} /> Refresh</button>
      </header>

      {/* TASK SUMMARY */}
      <section className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">{task.title.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-gray-900">{task.title}</h2>
            <p className="truncate text-sm text-indigo-600">{board?.name}</p>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase ${color.bg} ${color.text}`}>{status}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 lg:border-l lg:border-gray-100 lg:pl-6">
          <div className="flex items-center gap-3"><ClockIcon size={22} className="text-gray-400" /><div><p className="text-[11px] text-gray-400">Total Logged Hours</p><p className="text-lg font-black text-gray-900">{fmtHours(totalAll)}</p></div></div>
          <div className="flex items-center gap-3"><CalendarBlankIcon size={22} className="text-gray-400" /><div><p className="text-[11px] text-gray-400">Duration</p><p className="text-sm font-bold text-gray-900">{formatLong(task.start_date)} – {formatLong(task.due_date)}</p></div></div>
          <div className="flex items-center gap-3"><UsersIcon size={22} className="text-gray-400" /><div><p className="text-[11px] text-gray-400">Team Members</p><p className="text-lg font-black text-gray-900">{task.assignedTo.length}</p></div></div>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5">
            <CalendarBlankIcon size={18} className="text-gray-400" />
            <input type="date" value={from} max={to || undefined} onChange={(e) => setRange(e.target.value, to < e.target.value ? e.target.value : to)} className={dateBox} />
            <span className="text-gray-300">–</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setRange(from > e.target.value ? e.target.value : from, e.target.value)} className={dateBox} />
            <button onClick={allTime} className="ml-1 text-xs font-semibold text-blue-600 hover:underline">All time</button>
          </div>
          {report.viewerSeesAll && (
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={member} onChange={(e) => setMember(e.target.value)} className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-700 outline-none focus:border-blue-300">
                <option value="all">All Team Members</option>
                {members.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <CaretDownIcon size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
          <button onClick={exportCsv} disabled={rows.length === 0} className="ml-auto flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
            <DownloadSimpleIcon size={16} /> Export CSV
          </button>
        </div>

        <div className="rounded-xl border border-gray-100 p-4">
          <h3 className="mb-3 font-bold text-gray-900">Daily Working Hours</h3>
          <HoursTable rows={rows} />
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <HoursChart buckets={buckets} gran={gran} onGran={setGran} />
        </div>
      </section>
    </div>
  );
};