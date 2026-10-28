import { useEffect, useRef, useState } from "react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useAppDispatch } from "../../../redux/app/hook";
import { updateTask } from "../../../redux/features/Task/taskSlice";
import { useToast } from "../../../hooks/useToast";
import UserSearchInput from "../../UserSearchInput";
import type { Task } from "../../../types/board.Types";
import type { User } from "../../../types/user.Types";
import { Avatar } from "../CommentComposer";

export const AssigneePicker = ({ task, members, locked }: { task: Task; members: User[]; locked: boolean }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const assignees = task.assignedTo ?? [];
  const ids = assignees.map((u) => u.id);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const save = (next: string[]) =>
    dispatch(updateTask({ taskId: task.id, update: { assignedTo: next } as unknown as Partial<Task> })).unwrap()
      .catch((e) => showToast(typeof e === "string" ? e : "Failed to update assignees", "error"));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button" disabled={locked} onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition hover:border-gray-200 hover:bg-gray-50 disabled:hover:border-transparent disabled:hover:bg-transparent"
      >
        {assignees.length ? (
          <>
            <div className="flex -space-x-2">
              {assignees.slice(0, 5).map((u) => <div key={u.id} className="rounded-full border-2 border-white"><Avatar name={u.full_name} size={26} /></div>)}
            </div>
            <span className="text-sm text-gray-700">{assignees.length === 1 ? assignees[0].full_name : `${assignees.length} people`}</span>
          </>
        ) : <span className="text-sm text-gray-400">Unassigned</span>}
        {!locked && <PlusIcon size={14} className="text-gray-400" />}
      </button>

      {open && !locked && (
        <div className="absolute z-30 mt-2 w-80 space-y-3 rounded-xl border border-gray-100 bg-white p-3 shadow-xl">
          {assignees.length > 0 && (
            <ul className="space-y-1">
              {assignees.map((u) => (
                <li key={u.id} className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-sm text-gray-700"><Avatar name={u.full_name} size={22} />{u.full_name}</span>
                  <button onClick={() => save(ids.filter((id) => id !== u.id))} className="text-gray-400 hover:text-red-500"><XIcon size={14} weight="bold" /></button>
                </li>
              ))}
            </ul>
          )}
          <UserSearchInput
            onUserSelect={(u) => { if (!ids.includes(u.id)) save([...ids, u.id]); }}
            excludeUserIds={ids}
            includeUserIds={members.map((m) => m.id)}
          />
        </div>
      )}
    </div>
  );
};