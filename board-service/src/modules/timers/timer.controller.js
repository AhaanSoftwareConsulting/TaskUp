const timerRepo = require('./timer.repository');
const { calcSession } = require('./timer.rules');
const taskRepo = require('../tasks/task.repository');
const { getAccessibleTask } = require('../tasks/task.access');
const { presentTask } = require('../tasks/task.presenter');
const { isStaff } = require('../tasks/task.policy');
const { getUsersByIds } = require('../../utils/userClient');
const conflict = (res, running) =>
  res.status(409).json({
    code: 'TIMER_ALREADY_RUNNING',
    message: running ? `Stop the timer on "${running.task_title}" first.` : 'You already have a timer running.',
    activeTaskId: running?.task_id ?? null,
  });

const toggleTimer = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  try {
    const access = await getAccessibleTask(req, res, taskId);
    if (!access) return;

    const running = await timerRepo.findActiveForUser(userId);
    const sameTask = running && String(running.task_id) === String(taskId);

    if (running && !sameTask) return conflict(res, running);          // one timer at a time

    if (sameTask) {
      await timerRepo.stopAndRecord(taskId, userId, new Date(), calcSession); // null = already stopped, fine
    } else if (!(await timerRepo.start(taskId, userId, new Date()))) {
      return conflict(res, await timerRepo.findActiveForUser(userId));        // lost a race with ourselves
    }

    const full = await taskRepo.findFull(taskId, userId);
    return res.status(200).json(await presentTask(full, req.user));
  } catch (error) {
    console.error('toggleTimer error:', error);
    return res.status(500).json({ message: 'Failed to toggle timer' });
  }
};
const getMyActiveTimer = async (req, res) => {
  try {
    const t = await timerRepo.findActiveForUser(req.user.id);
    res.status(200).json(t ? { taskId: t.task_id, taskTitle: t.task_title, startedAt: t.active_start_time } : null);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load active timer' });
  }
};
const getTaskHours = async (req, res) => {
  try {
    const { taskId } = req.params;
    const access = await getAccessibleTask(req, res, taskId, { allowClosed: true }); // closed tasks keep their report
    if (!access) return;

    const staff = isStaff(req.user);
    const visible = (r) => staff || String(r.user_id) === String(req.user.id); // employees see only their own rows

    const [sessions, daily, running] = await Promise.all([
      timerRepo.findSessions(taskId),
      timerRepo.findDailyTotals(taskId),
      timerRepo.findActiveForTasks([taskId]),
    ]);

    // Hours logged before sessions existed: whatever the daily total has beyond the sessions
    const covered = new Map();
    sessions.forEach((s) => {
      const k = `${s.user_id}|${new Date(Number(s.ended_ms)).toISOString().slice(0, 10)}`;
      covered.set(k, (covered.get(k) || 0) + Number(s.duration_ms));
    });
    const legacy = daily
      .map((d) => ({ user_id: d.user_id, date: d.log_date, duration: Number(d.duration) - (covered.get(`${d.user_id}|${d.log_date}`) || 0) }))
      .filter((d) => d.duration > 1000);

    const vs = sessions.filter(visible), vl = legacy.filter(visible), vr = running.filter(visible);
    const usersById = await getUsersByIds([...vs, ...vl, ...vr].map((r) => r.user_id));
    const person = (id) => usersById[id] || { id, full_name: null };

    res.status(200).json({
      sessions: vs.map((s) => ({ id: s.id, user: person(s.user_id), startedAt: Number(s.started_ms), endedAt: Number(s.ended_ms), duration: Number(s.duration_ms) })),
      legacy: vl.map((d) => ({ user: person(d.user_id), date: d.date, duration: d.duration })),
      running: vr.map((r) => ({ user: person(r.user_id), startedAt: new Date(r.active_start_time).getTime() })),
      viewerSeesAll: staff,
    });
  } catch (e) {
    console.error('getTaskHours error:', e);
    res.status(500).json({ message: 'Failed to load the hours report' });
  }
};
module.exports = { toggleTimer, getMyActiveTimer, getTaskHours };