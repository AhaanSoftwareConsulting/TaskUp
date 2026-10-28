import { useState } from "react";
import { CheckCircleIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { useAppDispatch } from "../../../redux/app/hook";
import { closeTask, reopenTask } from "../../../redux/features/Task/lifecycleThunks";
import { useToast } from "../../../hooks/useToast";
import { formatLong } from "../../../utils/dateHelpers";
import type { Task } from "../../../types/board.Types";

export const TaskCloseBar = ({ task, status, onRequestClose }: { task: Task; status: string | null; onRequestClose: () => void }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();

  if (task.closed_at) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <LockSimpleIcon size={20} className="mt-0.5 shrink-0 text-gray-500" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">Closed by {task.closed_by_user?.full_name ?? "someone"} on {formatLong(task.closed_at)}</p>
            <p className="text-xs text-gray-500">This task is read-only. {task.closed_note && <>“{task.closed_note}”</>}</p>
          </div>
        </div>
        {task.can_reopen && (
          <button
            onClick={() => dispatch(reopenTask({ taskId: task.id })).unwrap().then(() => showToast("Task reopened")).catch((e) => showToast(String(e), "error"))}
            className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >Reopen</button>
        )}
      </div>
    );
  }

  if (status === "Completed" && task.can_close) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-emerald-100 bg-emerald-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <CheckCircleIcon size={22} weight="fill" className="shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">The work is complete</p>
            <p className="text-xs text-emerald-700">Close the task to lock it and notify everyone who worked on it.</p>
          </div>
        </div>
        <button onClick={onRequestClose} className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Close task</button>
      </div>
    );
  }
  return null;
};

export const CloseTaskDialog = ({ task, onClose }: { task: Task; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await dispatch(closeTask({ taskId: task.id, note: note.trim() })).unwrap();
      showToast("Task closed. Everyone involved was notified");
      onClose();
    } catch (e) {
      showToast(typeof e === "string" ? e : "Could not close the task", "error");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900">Close “{task.title}”?</h3>
        <p className="mt-2 text-sm text-gray-500">The task becomes read-only, running timers are stopped, and everyone who worked on it gets an email. You can reopen it later.</p>
        <textarea
          value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} rows={3}
          placeholder="Add a closing note (optional)"
          className="mt-4 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-400"
        />
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} disabled={busy} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={busy} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">{busy ? "Closing…" : "Close task"}</button>
        </div>
      </div>
    </div>
  );
};