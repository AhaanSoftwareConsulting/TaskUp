const taskRepo = require('./task.repository');
const timerRepo = require('../timers/timer.repository');
const { getUserById, getUsersByIds } = require('../../utils/userClient');
const { notifyUser } = require('../../utils/notifyClient');
const templates = require('../../utils/emailTemplates');
const config = require('../../config/config');

async function notifyTaskState({ task, board, actorId, closed, note = '' }) {
  const [full, sums] = await Promise.all([taskRepo.findFull(task.id), timerRepo.sumByUserForTasks([task.id])]);
  const members = new Set(board.members.map(String));
  const ids = [...new Set([
    ...(full.assignedTo || []), full.created_by,
    ...(full.comments || []).map((c) => c.user_id),
    ...sums.map((r) => r.user_id),
  ].filter(Boolean).map(String))].filter((id) => id !== String(actorId) && members.has(id));

  const [actor, users] = await Promise.all([getUserById(actorId), getUsersByIds(ids)]);
  const actorName = actor?.full_name || 'Someone';
  const build = closed ? templates.taskClosed : templates.taskReopened;

  await Promise.all(Object.values(users).map((u) => notifyUser({
    userId: u.id,
    title: closed ? 'Task closed' : 'Task reopened',
    message: `${actorName} ${closed ? 'closed' : 'reopened'} "${task.title}"`,
    email: u.email ? { to: u.email, ...build({
      taskTitle: task.title, boardName: board.name, actorName, note,
      taskLink: `${config.frontend.url}/${u.role || 'employee'}/dashboard/tasks/${task.id}`,
    }) } : undefined,
  })));
}
module.exports = { notifyTaskState };