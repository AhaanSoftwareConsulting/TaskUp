import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks, toggleTimer } from "../../redux/features/Task/taskSlice";

import type { TimeManagement } from "../../types/board.Types";

import { Play, Pause, WarningCircle, Clock, X } from "@phosphor-icons/react";

interface TimerProps {
  taskId: string;
  dueDate?: string;
  estimatedTime?: number;
  timeData?: TimeManagement;
}

interface TimerSwitchError {
  code?: string;
  message?: string;
  activeTaskId?: string;
}

export const Timer = ({
  taskId,
  timeData,
  dueDate,
  estimatedTime = 0,
}: TimerProps) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.login.user);
  const tasks = useAppSelector((state) => state.task.task);

  const [elapsedSinceStart, setElapsedSinceStart] = useState(0);

  const [showTimerConfirm, setShowTimerConfirm] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [switchingTimer, setSwitchingTimer] = useState(false);
  const [timerError, setTimerError] = useState("");

  // Find the current user's timer for this task.
  const myTimer = timeData?.activeTimers?.find(
    (timer) => String(timer.user.id) === String(currentUser?.id),
  );

  const isRunning = Boolean(myTimer);
  const activeStartTime = myTimer?.active_start_time ?? null;

  // Previously logged time for this user.
  const myLoggedMs =
    timeData?.byUser?.find(
      (entry) => String(entry.user.id) === String(currentUser?.id),
    )?.duration ?? 0;

  // Update the live timer every second.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning && activeStartTime) {
      const updateElapsed = () => {
        const start = new Date(activeStartTime).getTime();

        setElapsedSinceStart(
          Number.isFinite(start) ? Math.max(0, Date.now() - start) : 0,
        );
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSinceStart(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, activeStartTime]);

  const formatTime = (ms: number) => {
    const safeMs = Math.max(0, ms);

    const hours = Math.floor(safeMs / 3600000);
    const minutes = Math.floor((safeMs % 3600000) / 60000);
    const seconds = Math.floor((safeMs % 60000) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const myTotalMs = myLoggedMs + elapsedSinceStart;
  const goalMs = estimatedTime * 3600000;

  const cappedLoggedTime = goalMs > 0 ? Math.min(myTotalMs, goalMs) : myTotalMs;

  let liveDelay = timeData?.delay || 0;

  if (goalMs > 0 && myTotalMs > goalMs) {
    liveDelay += myTotalMs - goalMs;
  }

  if (isRunning && dueDate && activeStartTime) {
    const deadline = new Date(dueDate).getTime();
    const now = Date.now();

    if (Number.isFinite(deadline) && now > deadline) {
      const start = new Date(activeStartTime).getTime();

      const currentSessionDelay =
        start > deadline ? elapsedSinceStart : now - deadline;

      if (goalMs === 0 || myTotalMs <= goalMs) {
        liveDelay += currentSessionDelay;
      }
    }
  }

  // Parse the structured timer error from Redux.
  const parseTimerError = (payload: unknown): TimerSwitchError | null => {
    if (typeof payload !== "string") {
      return null;
    }

    try {
      return JSON.parse(payload) as TimerSwitchError;
    } catch {
      return { message: payload };
    }
  };

  // Refresh tasks from the backend so every timer component gets fresh data.
  const refreshTasks = async () => {
    await dispatch(getTasks({ scope: "mine" })).unwrap();
  };

  // Start or stop the timer for this task.
  const handleTimerClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (switchingTimer) return;

    setTimerError("");

    try {
      const result = await dispatch(toggleTimer({ taskId })).unwrap();

      // A successful toggle changes backend state.
      // Refresh Redux so the UI updates immediately.
      await refreshTasks();

      return result;
    } catch (error: unknown) {
      const parsedError = parseTimerError(error);

      if (parsedError?.code === "TIMER_ALREADY_RUNNING") {
        setPendingTaskId(taskId);

        setActiveTaskId(
          parsedError.activeTaskId ? String(parsedError.activeTaskId) : null,
        );

        setShowTimerConfirm(true);
        return;
      }

      setTimerError(
        parsedError?.message ||
          (typeof error === "string"
            ? error
            : "Unable to update the timer. Please try again."),
      );
    }
  };

  // Find the task whose timer is currently running.
  const findRunningTaskId = (): string | null => {
    if (activeTaskId && String(activeTaskId) !== String(pendingTaskId)) {
      return String(activeTaskId);
    }

    const runningTask = tasks.find((task) => {
      if (String(task.id) === String(pendingTaskId)) {
        return false;
      }

      return task.timeManagement?.activeTimers?.some(
        (timer) => String(timer.user.id) === String(currentUser?.id),
      );
    });

    return runningTask ? String(runningTask.id) : null;
  };

  // Stop the previous timer, then start the selected task's timer.
  const handleConfirmSwitch = async () => {
    if (!pendingTaskId || switchingTimer) return;

    setSwitchingTimer(true);
    setTimerError("");

    try {
      let runningTaskId = findRunningTaskId();

      /*
       * If the task ID was not available in Redux, fetch fresh tasks
       * before trying to identify the running timer.
       */
      if (!runningTaskId) {
        await refreshTasks();

        const refreshedTasks = tasks;

        const runningTask = refreshedTasks.find((task) => {
          if (String(task.id) === String(pendingTaskId)) {
            return false;
          }

          return task.timeManagement?.activeTimers?.some(
            (timer) => String(timer.user.id) === String(currentUser?.id),
          );
        });

        runningTaskId = runningTask ? String(runningTask.id) : null;
      }

      if (!runningTaskId) {
        setTimerError(
          "Could not identify the running timer. Please close this popup and try again.",
        );
        return;
      }

      // 1. Stop the previous task timer.
      await dispatch(toggleTimer({ taskId: runningTaskId })).unwrap();

      // 2. Refresh task data after stopping the previous timer.
      await refreshTasks();

      // 3. Start the requested task timer.
      await dispatch(toggleTimer({ taskId: pendingTaskId })).unwrap();

      // 4. Refresh again so the updated timer appears immediately.
      await refreshTasks();

      setShowTimerConfirm(false);
      setPendingTaskId(null);
      setActiveTaskId(null);
      setTimerError("");
    } catch (error: unknown) {
      const parsedError = parseTimerError(error);

      setTimerError(
        parsedError?.message ||
          (typeof error === "string"
            ? error
            : "Could not switch timers. Please try again."),
      );

      // Sync the frontend with the actual backend state.
      try {
        await refreshTasks();
      } catch {
        // Preserve the original timer error.
      }
    } finally {
      setSwitchingTimer(false);
    }
  };

  // Cancel without changing the currently running timer.
  const handleCancelSwitch = () => {
    if (switchingTimer) return;

    setShowTimerConfirm(false);
    setPendingTaskId(null);
    setActiveTaskId(null);
    setTimerError("");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Timer display and control */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
        <div className="flex flex-col items-start px-1">
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {goalMs > 0 && myTotalMs >= goalMs
              ? "Goal Reached"
              : "My Time Logged"}
          </span>

          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              goalMs > 0 && myTotalMs >= goalMs
                ? "text-emerald-600"
                : "text-gray-800"
            }`}
          >
            {formatTime(cappedLoggedTime)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleTimerClick}
          disabled={switchingTimer}
          aria-label={isRunning ? "Stop timer" : "Start timer"}
          title={isRunning ? "Stop timer" : "Start timer"}
          className={`rounded-lg p-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            isRunning
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          {isRunning ? (
            <Pause size={18} weight="fill" />
          ) : (
            <Play size={18} weight="fill" />
          )}
        </button>
      </div>

      {/* Overtime */}
      {liveDelay > 0 && (
        <div className="flex animate-pulse items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1">
          <WarningCircle size={14} className="text-rose-600" weight="fill" />

          <span className="text-[11px] font-bold text-rose-700">
            OVERTIME: {formatTime(liveDelay)}
          </span>
        </div>
      )}

      {/* Error outside popup */}
      {timerError && !showTimerConfirm && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {timerError}
        </p>
      )}

      {/* Confirmation modal */}
      {showTimerConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
          onClick={handleCancelSwitch}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="timer-confirm-title"
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={26} weight="fill" />
              </div>

              <button
                type="button"
                onClick={handleCancelSwitch}
                disabled={switchingTimer}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <h3
              id="timer-confirm-title"
              className="text-lg font-bold text-gray-900"
            >
              Another timer is running
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              You already have a timer running on another task. Stop that timer
              and start tracking this task instead?
            </p>

            {timerError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {timerError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelSwitch}
                disabled={switchingTimer}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={switchingTimer}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {switchingTimer ? "Switching..." : "Stop & Start New"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
