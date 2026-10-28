import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../../redux/app/hook";
import { updateTask } from "../../../redux/features/Task/taskSlice";
import type { Task } from "../../../types/board.Types";

export const TaskTitle = ({ task, locked }: { task: Task; locked: boolean }) => {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState(task.title);
  const [focused, setFocused] = useState(false);
  const skip = useRef(false);

  useEffect(() => { if (!focused) setValue(task.title); }, [task.title, focused]);

  const commit = () => {
    setFocused(false);
    if (skip.current) { skip.current = false; setValue(task.title); return; }
    const next = value.trim();
    if (!next) return setValue(task.title);
    if (next !== task.title) dispatch(updateTask({ taskId: task.id, update: { title: next } }));
  };

  return (
    <input
      value={value}
      disabled={locked}
      onFocus={() => setFocused(true)}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") { skip.current = true; (e.target as HTMLInputElement).blur(); }
      }}
      className="-mx-2 w-full rounded-lg bg-transparent px-2 py-1 text-3xl font-bold tracking-tight text-gray-900 outline-none transition hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-default disabled:hover:bg-transparent"
    />
  );
};