import { useEffect, useRef, useState } from "react";
import { TextAlignLeftIcon } from "@phosphor-icons/react";
import { useAppDispatch } from "../../../redux/app/hook";
import { updateTask } from "../../../redux/features/Task/taskSlice";
import type { Task } from "../../../types/board.Types";

export const DescriptionSection = ({ task, locked }: { task: Task; locked: boolean }) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.description ?? "");
  const skip = useRef(false);

  useEffect(() => { if (!editing) setValue(task.description ?? ""); }, [task.description, editing]);

  const commit = () => {
    setEditing(false);
    if (skip.current) { skip.current = false; return; }
    const next = value.trim();
    if (next !== (task.description ?? "")) dispatch(updateTask({ taskId: task.id, update: { description: next } }));
  };

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400"><TextAlignLeftIcon size={16} /> Description</h3>
      {editing ? (
        <textarea
          autoFocus rows={6} value={value}
          onChange={(e) => setValue(e.target.value)} onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") { skip.current = true; (e.target as HTMLTextAreaElement).blur(); }
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) (e.target as HTMLTextAreaElement).blur();
          }}
          placeholder="Add a detailed description…"
          className="w-full rounded-xl border border-blue-200 p-4 text-sm leading-relaxed outline-none ring-4 ring-blue-50"
        />
      ) : (
        <div
          onClick={() => !locked && setEditing(true)}
          className={`min-h-[64px] whitespace-pre-wrap rounded-xl p-3 text-sm leading-relaxed ${locked ? "" : "cursor-text hover:bg-gray-50"} ${task.description ? "text-gray-700" : "text-gray-400"}`}
        >
          {task.description || (locked ? "No description." : "Add a description…")}
        </div>
      )}
    </section>
  );
};