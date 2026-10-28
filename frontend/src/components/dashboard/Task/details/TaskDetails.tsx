import { useEffect, useState } from "react";
import type { Task } from "../../../types/board.Types";
import { useBoardColumns } from "../../../hooks/useBoardColumns";
import { ActivityDetails } from "../ActivityDetails";
import { AttachmentSection } from "../AttachMentSection";
import { TaskDetailsHeader } from "./TaskDetailsHeader";
import { CloseTaskDialog, TaskCloseBar } from "./TaskLifecycle";
import { TaskTitle } from "./TaskTitle";
import { TaskProperties } from "./TaskProperties";
import { DescriptionSection } from "./DescriptionSection";
import { TimeSection } from "./TimeSection";

interface Props { task: Task; onClose: () => void; variant?: "modal" | "page" }

export const TaskDetails = ({ task, onClose, variant = "modal" }: Props) => {
  const [closing, setClosing] = useState(false);
  const columns = useBoardColumns(task.board_id);
  const status = columns.find((c) => c.id === task.column_id)?.name ?? null;
  const locked = !!task.closed_at;
  const isPage = variant === "page";

  useEffect(() => {
    if (isPage) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPage, onClose]);

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <TaskDetailsHeader task={task} onClose={onClose} onRequestClose={() => setClosing(true)} />
      <TaskCloseBar task={task} status={status} onRequestClose={() => setClosing(true)} />

      <div className="grid min-h-0 flex-grow lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-h-0 space-y-8 overflow-y-auto p-6 lg:p-8">
          <TaskTitle task={task} locked={locked} />
          <TaskProperties task={task} locked={locked} />
          <DescriptionSection task={task} locked={locked} />
          <TimeSection task={task} />
          <AttachmentSection taskId={task.id} attachments={task.attachments || []} />
        </div>
        <aside className="min-h-0 overflow-hidden border-t border-gray-100 lg:border-l lg:border-t-0">
          <ActivityDetails taskId={task.id} />
        </aside>
      </div>
      {closing && <CloseTaskDialog task={task} onClose={() => setClosing(false)} />}
    </div>
  );

  if (isPage) return <div className="h-[calc(100vh-4rem)] overflow-hidden">{content}</div>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-100 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
};