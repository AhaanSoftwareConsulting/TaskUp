// components/dashboard/Task/TaskTimePanel.tsx
import { useEffect, useState } from "react";
import { X, Clock } from "@phosphor-icons/react";
import type { Task } from "../../types/board.Types";
import { ActivityDetails } from "./ActivityDetails";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export const TaskTimePanel = ({ task, onClose }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!task);
  }, [task]);

  if (!task) return null;

  const msToHours = (ms: number = 0) => (ms / 3600000).toFixed(1);
  const byUser = task.timeManagement?.byUser ?? [];
  const totalMs = byUser.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[35%] bg-white shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 truncate pr-4">{task.title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-gray-50">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Clock size={14} weight="bold" /> Time by Member
            </h4>
            {byUser.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No time logged yet.</p>
            ) : (
              <div className="space-y-3">
                {byUser.map((entry, i) => (
                  <div key={entry.user?.id ?? i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {entry.user?.full_name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm text-gray-700">{entry.user?.full_name ?? "Unknown"}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{msToHours(entry.duration)} hrs</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-sm font-black text-slate-800">{msToHours(totalMs)} hrs</span>
                </div>
              </div>
            )}
          </div>

          <ActivityDetails taskId={task.id} />
        </div>
      </div>
    </div>
  );
};