import { useEffect, useRef, useState } from "react";
import {
  ArrowSquareOutIcon, DotsThreeIcon, FolderIcon, LinkSimpleIcon, LockSimpleIcon,
  LockSimpleOpenIcon, StarIcon, TrashIcon, XIcon,
} from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../../redux/app/hook";
import { deleteTask } from "../../../redux/features/Task/taskSlice";
import { reopenTask } from "../../../redux/features/Task/lifecycleThunks";
import { toggleFavorite } from "../../../redux/features/Favorite/favoriteThunks";
import { useToast } from "../../../hooks/useToast";
import { DeleteModal } from "../../../modal/DeleteModal";
import type { Task } from "../../../types/board.Types";
import { useBoardColumns } from "../../../hooks/useBoardColumns";
interface Props { task: Task; onClose: () => void; onRequestClose: () => void }

export const TaskDetailsHeader = ({ task, onClose, onRequestClose }: Props) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const role = useAppSelector((s) => s.login.user?.role);
  const board = useAppSelector((s) => s.board.boards.find((b) => b.id === task.board_id));
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const columns = useBoardColumns(task.board_id);
  const completed = columns.find((c) => c.id === task.column_id)?.name === "Completed";

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const url = `${window.location.origin}/${role}/dashboard/tasks/${task.id}`;
  const share = async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const reopen = () => dispatch(reopenTask({ taskId: task.id })).unwrap()
    .then(() => showToast("Task reopened")).catch((e) => showToast(String(e), "error"));

  const btn = "rounded-lg p-2 text-gray-500 hover:bg-gray-100";
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
        <FolderIcon size={18} />
        <span className="truncate">{board?.name ?? "Project"}</span>
        {task.closed_at && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">
            <LockSimpleIcon size={11} weight="bold" /> Closed
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={share} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <LinkSimpleIcon size={16} /> {copied ? "Copied!" : "Share"}
        </button>
        <button onClick={() => dispatch(toggleFavorite(task.id))} className={btn} title="Favorite">
          <StarIcon size={20} weight={task.is_favorited ? "fill" : "regular"} className={task.is_favorited ? "text-yellow-400" : ""} />
        </button>
        <button onClick={() => window.open(url, "_blank", "noopener,noreferrer")} className={btn} title="Open in new tab"><ArrowSquareOutIcon size={20} /></button>
        <div className="relative" ref={ref}>
          <button onClick={() => setMenu((m) => !m)} className={btn}><DotsThreeIcon size={20} weight="bold" /></button>
          {menu && (
            <div className="absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
              {task.can_close && (
                <button disabled={!completed} title={completed ? undefined : "Move the task to Completed first"}
                  onClick={() => { setMenu(false); onRequestClose(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent">
                  <LockSimpleIcon size={16} /> Close task
                </button>
              )}
              {task.can_reopen && (
                <button onClick={() => { setMenu(false); reopen(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  <LockSimpleOpenIcon size={16} /> Reopen task
                </button>
              )}
              <button onClick={() => { setMenu(false); setConfirmDelete(true); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                <TrashIcon size={16} /> Delete
              </button>
            </div>
          )}
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><XIcon size={20} weight="bold" /></button>
      </div>
      <DeleteModal
        item={confirmDelete ? task : null}
        itemLabel="task"
        getName={(t) => t.title}
        getId={(t) => t.id}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={(id) => { dispatch(deleteTask({ taskId: id })); setConfirmDelete(false); onClose(); }}
      />
    </div>
  );
};