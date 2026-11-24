import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import type { TimeManagement } from "../../types/board.Types";

import {
  Play,
  Pause,
  WarningCircle,
  Clock,
  X,
  Timer as TimerIcon,
  Lightning,
  CheckCircle,
} from "@phosphor-icons/react";

import {
  fetchActiveTimer,
  toggleTimer,
} from "../../redux/features/Timer/timerThunks";

interface TimerProps {
  taskId: string;
  dueDate?: string;
  estimatedTime?: number;
  timeData?: TimeManagement;
  disabled?: boolean;
}

interface TimerSwitchError {
  code?: string;
  message?: string;
  activeTaskId?: string | null;
}

const parseTimerError = (payload: unknown): TimerSwitchError => {
  if (payload && typeof payload === "object")
    return payload as TimerSwitchError;

  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return { message: payload };
    }
  }

  return {};
};

const formatTime = (ms: number) => {
  const s = Math.max(0, ms);

  return `${Math.floor(s / 3600000)}h ${Math.floor(
    (s % 3600000) / 60000
  )}m ${Math.floor((s % 60000) / 1000)}s`;
};

export const Timer = ({
  taskId,
  timeData,
  dueDate,
  estimatedTime,
  disabled = false,
}: TimerProps) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((s) => s.login.user);
  const active = useAppSelector((s) => s.timer.active);

  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [timerError, setTimerError] = useState("");

  const myTimer = timeData?.activeTimers?.find(
    (t) => String(t.user.id) === String(currentUser?.id)
  );

  const isRunning = Boolean(myTimer);
  const activeStartTime = myTimer?.active_start_time ?? null;

  const myLoggedMs =
    timeData?.byUser?.find(
      (e) => String(e.user.id) === String(currentUser?.id)
    )?.duration ?? 0;

  useEffect(() => {
    if (!isRunning || !activeStartTime) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      const start = new Date(activeStartTime).getTime();

      setElapsed(
        Number.isFinite(start) ? Math.max(0, Date.now() - start) : 0
      );
    };

    tick();

    const i = setInterval(tick, 1000);

    return () => clearInterval(i);
  }, [isRunning, activeStartTime]);

  const goalMs =
    (estimatedTime || timeData?.estimated_time || 0) * 3600000;

  const myTotalMs = myLoggedMs + elapsed;

  const capped = goalMs > 0 ? Math.min(myTotalMs, goalMs) : myTotalMs;

  const goalReached = goalMs > 0 && myTotalMs >= goalMs;

  let liveDelay = timeData?.delay || 0;

  if (goalMs > 0 && myTotalMs > goalMs) {
    liveDelay += myTotalMs - goalMs;
  }

  if (isRunning && dueDate && activeStartTime) {
    const deadline = new Date(dueDate).getTime();

    if (
      Number.isFinite(deadline) &&
      Date.now() > deadline &&
      (goalMs === 0 || myTotalMs <= goalMs)
    ) {
      const start = new Date(activeStartTime).getTime();

      liveDelay += start > deadline ? elapsed : Date.now() - deadline;
    }
  }

  const closeConfirm = () => {
    setShowConfirm(false);
    setPendingTaskId(null);
    setBlockingTaskId(null);
    setTimerError("");
  };

  const handleTimerClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (switching || disabled) return;

    setTimerError("");

    try {
      await dispatch(toggleTimer({ taskId })).unwrap();
    } catch (error) {
      const parsed = parseTimerError(error);

      if (parsed.code === "TIMER_ALREADY_RUNNING") {
        setPendingTaskId(taskId);

        setBlockingTaskId(
          parsed.activeTaskId ? String(parsed.activeTaskId) : null
        );

        setShowConfirm(true);
        return;
      }

      setTimerError(
        parsed.message || "Unable to update the timer. Please try again."
      );
    }
  };

  const handleConfirmSwitch = async () => {
    if (!pendingTaskId || switching) return;

    const stopId =
      blockingTaskId ??
      (active && active.taskId !== pendingTaskId ? active.taskId : null);

    if (!stopId) {
      setTimerError(
        "Could not identify the running timer. Close this popup and try again."
      );
      return;
    }

    setSwitching(true);
    setTimerError("");

    try {
      await dispatch(toggleTimer({ taskId: stopId })).unwrap();

      await dispatch(toggleTimer({ taskId: pendingTaskId })).unwrap();

      closeConfirm();
    } catch (error) {
      setTimerError(
        parseTimerError(error).message ||
          "Could not switch timers. Please try again."
      );

      dispatch(fetchActiveTimer());
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">

      {/* TIMER CARD */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-3 transition-all duration-300 ${
          isRunning
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm shadow-emerald-100"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        {/* Background Decoration */}
        {isRunning && (
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-100/60 blur-2xl" />
        )}

        <div className="relative flex items-center justify-between gap-3">

          {/* TIMER INFORMATION */}
          <div className="flex min-w-0 items-center gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isRunning
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <TimerIcon size={21} weight="duotone" />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
                  {goalReached ? "Goal Reached" : "My Time Logged"}
                </span>

                {isRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>

              <div
                className={`font-mono text-[15px] font-extrabold tabular-nums tracking-tight ${
                  goalReached ? "text-emerald-600" : "text-gray-900"
                }`}
              >
                {formatTime(capped)}
              </div>

              {isRunning && (
                <p className="mt-0.5 text-[9px] font-semibold text-emerald-600">
                  Timer is running
                </p>
              )}
            </div>
          </div>

          {/* TIMER BUTTON */}
          <button
            type="button"
            onClick={handleTimerClick}
            disabled={switching || disabled}
            aria-label={isRunning ? "Stop timer" : "Start timer"}
            title={
              disabled
                ? "This task is closed"
                : isRunning
                  ? "Stop timer"
                  : "Start timer"
            }
            className={`group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              isRunning
                ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-red-100 hover:shadow-md"
                : "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-100 hover:shadow-md"
            }`}
          >
            {isRunning ? (
              <Pause size={19} weight="fill" />
            ) : (
              <Play size={19} weight="fill" />
            )}
          </button>
        </div>

        {/* PROGRESS INDICATOR */}
        {goalMs > 0 && (
          <div className="relative mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Time progress
              </span>

              <span
                className={`text-[9px] font-extrabold ${
                  goalReached ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {Math.min(100, Math.round((myTotalMs / goalMs) * 100))}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goalReached
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{
                  width: `${Math.min(100, (myTotalMs / goalMs) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* OVERTIME */}
      {liveDelay > 0 && (
        <div className="flex animate-pulse items-center gap-2 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <WarningCircle size={16} weight="fill" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500">
              Overtime
            </p>

            <p className="font-mono text-xs font-bold text-rose-700">
              {formatTime(liveDelay)}
            </p>
          </div>

          <Lightning size={17} weight="fill" className="text-rose-400" />
        </div>
      )}

      {/* TIMER ERROR */}
      {timerError && !showConfirm && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {timerError}
        </p>
      )}

      {/* CONFIRM SWITCH MODAL */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => !switching && closeConfirm()}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#171B2E] via-[#25365D] to-[#278CFA] p-6">
              <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-6 h-24 w-24 rounded-full border border-white/10" />

              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md">
                  <Clock size={25} weight="duotone" />
                </div>

                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={switching}
                  aria-label="Close"
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <h3 className="relative mt-5 text-lg font-extrabold text-white">
                Another timer is running
              </h3>

              <p className="relative mt-1 text-xs leading-relaxed text-blue-100">
                You can only track one task at a time.
              </p>
            </div>

            {/* MODAL BODY */}
            <div className="p-6">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <WarningCircle size={19} weight="fill" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900">
                      Running task detected
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      You already have a timer running
                      {active ? (
                        <>
                          {" "}on <b>{active.taskTitle}</b>
                        </>
                      ) : (
                        " on another task"
                      )}
                      . Stop it and start tracking this task instead?
                    </p>
                  </div>
                </div>
              </div>

              {timerError && (
                <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {timerError}
                </p>
              )}

              {/* MODAL ACTIONS */}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={switching}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  disabled={switching}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-100 transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                >
                  {switching ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} weight="bold" />
                      Stop & Start New
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};