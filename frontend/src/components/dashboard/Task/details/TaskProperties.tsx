import { useEffect, useState, type ReactNode } from "react";
import { CalendarBlankIcon, CaretDownIcon, CircleDashedIcon, FlagIcon, HourglassIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../../redux/app/hook";
import { moveTask, updateTask } from "../../../redux/features/Task/taskSlice";
import { useBoardColumns } from "../../../hooks/useBoardColumns";
import { useToast } from "../../../hooks/useToast";
import { getColumnColor } from "../../../utils/columnColors";
import { formatLong, toDateInput } from "../../../utils/dateHelpers";
import type { Task } from "../../../types/board.Types";
import { Avatar } from "../CommentComposer";
import { AssigneePicker } from "./AssigneePicker";

const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
const PRIORITY_COLOR: Record<string, string> = { Low: "text-blue-500", Medium: "text-green-500", High: "text-yellow-500", Critical: "text-red-500" };

const Row = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3 py-1">
    <div className="flex items-center gap-2 text-sm text-gray-500">{icon}<span>{label}</span></div>
    <div className="min-w-0">{children}</div>
  </div>
);

const PillSelect = ({ value, onChange, options, disabled, lead }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean; lead?: ReactNode;
}) => (
  <div className="relative inline-flex items-center">
    {lead && <span className="pointer-events-none absolute left-3 flex items-center">{lead}</span>}
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer appearance-none rounded-lg border border-transparent py-1.5 pr-8 text-sm font-medium text-gray-800 outline-none transition hover:border-gray-200 hover:bg-gray-50 focus:border-blue-300 focus:bg-white disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent ${lead ? "pl-8" : "pl-3"}`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {!disabled && <CaretDownIcon size={12} className="pointer-events-none absolute right-2.5 text-gray-400" />}
  </div>
);

const DateInput = ({ value, onCommit, disabled, min, max }: {
  value: string; onCommit: (v: string) => boolean | void; disabled?: boolean; min?: string; max?: string;
}) => {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input
      type="date" value={v} min={min} max={max} disabled={disabled}
      onChange={(e) => { setV(e.target.value); if (onCommit(e.target.value) === false) setV(value); }}
      className="rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-gray-800 outline-none transition hover:border-gray-200 hover:bg-gray-50 focus:border-blue-300 focus:bg-white disabled:hover:border-transparent disabled:hover:bg-transparent"
    />
  );
};

export const TaskProperties = ({ task, locked }: { task: Task; locked: boolean }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = useAppSelector((s) => s.login.user);
  const board = useAppSelector((s) => s.board.boards.find((b) => b.id === task.board_id));
  const allTasks = useAppSelector((s) => s.task.task);
  const columns = useBoardColumns(task.board_id);

  const staff = me?.role === "manager" || me?.role === "ceo";
  const status = columns.find((c) => c.id === task.column_id)?.name ?? "";
  const [estimate, setEstimate] = useState(String(task.timeManagement?.estimated_time ?? 0));
  useEffect(() => setEstimate(String(task.timeManagement?.estimated_time ?? 0)), [task.timeManagement?.estimated_time]);

  const fail = (e: unknown) => showToast(typeof e === "string" ? e : "Update failed", "error");
  const patch = (update: Record<string, unknown>) =>
    dispatch(updateTask({ taskId: task.id, update: update as Partial<Task> })).unwrap().catch(fail);

  const changeStatus = (columnId: string) => {
    if (columnId === task.column_id) return;
    const position = allTasks.filter((t) => t.column_id === columnId).length; // end of the column
    dispatch(moveTask({ taskId: task.id, newColumnId: columnId, newPosition: position })).unwrap().catch(fail);
  };

  const commitDate = (key: "start_date" | "due_date", value: string): boolean => {
    if (!value) return false;
    if (value === toDateInput(task[key])) return true;
    const start = key === "start_date" ? value : toDateInput(task.start_date);
    const due = key === "due_date" ? value : toDateInput(task.due_date);
    if (start && due && start > due) { showToast("Start date can't be after the due date", "error"); return false; }
    patch({ [key]: value });
    return true;
  };

  const commitEstimate = () => {
    const n = Math.max(0, Math.round(Number(estimate) || 0));
    setEstimate(String(n));
    if (n !== (task.timeManagement?.estimated_time ?? 0)) patch({ estimated_time: n });
  };

  return (
    <div className="space-y-0.5 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
      <Row icon={<CircleDashedIcon size={18} />} label="Status">
        <PillSelect
          value={task.column_id} disabled={locked} onChange={changeStatus}
          options={columns.map((c) => ({ value: c.id, label: c.name }))}
          lead={<span className={`h-2.5 w-2.5 rounded-full ${getColumnColor(status).header}`} />}
        />
      </Row>
      <Row icon={<FlagIcon size={18} />} label="Priority">
        <PillSelect
          value={task.priority} disabled={locked} onChange={(v) => patch({ priority: v })}
          options={PRIORITIES.map((p) => ({ value: p, label: p }))}
          lead={<FlagIcon size={14} weight="fill" className={PRIORITY_COLOR[task.priority]} />}
        />
      </Row>
      <Row icon={<UsersIcon size={18} />} label="Assignees">
        <AssigneePicker task={task} members={board?.members ?? []} locked={locked} />
      </Row>
      <Row icon={<CalendarBlankIcon size={18} />} label="Dates">
        <div className="flex flex-wrap items-center gap-1">
          <DateInput value={toDateInput(task.start_date)} max={toDateInput(task.due_date) || undefined} disabled={locked} onCommit={(v) => commitDate("start_date", v)} />
          <span className="text-gray-300">→</span>
          <DateInput value={toDateInput(task.due_date)} min={toDateInput(task.start_date) || undefined} disabled={locked} onCommit={(v) => commitDate("due_date", v)} />
        </div>
      </Row>
      <Row icon={<HourglassIcon size={18} />} label="Estimate">
        {staff && !locked ? (
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={1} value={estimate}
              onChange={(e) => setEstimate(e.target.value)} onBlur={commitEstimate}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-20 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium outline-none hover:border-gray-200 hover:bg-gray-50 focus:border-blue-300 focus:bg-white"
            />
            <span className="text-xs text-gray-400">hours</span>
          </div>
        ) : (
          <span className="px-2 text-sm font-medium text-gray-800">
            {task.timeManagement?.estimated_time ? `${task.timeManagement.estimated_time} hours` : "Not set"}
            {!staff && <span className="ml-2 text-xs font-normal text-gray-400">set by a manager</span>}
          </span>
        )}
      </Row>
      <Row icon={<UserCircleIcon size={18} />} label="Created by">
        {task.creator?.full_name ? (
          <div className="flex items-center gap-2 px-2">
            <Avatar name={task.creator.full_name} size={24} />
            <span className="text-sm font-medium text-gray-800">{task.creator.full_name}</span>
            <span className="text-xs text-gray-400">· {formatLong(task.created_at)}</span>
          </div>
        ) : (
          <span className="px-2 text-sm text-gray-400">Unknown (created before tracking)</span>
        )}
      </Row>
    </div>
  );
};