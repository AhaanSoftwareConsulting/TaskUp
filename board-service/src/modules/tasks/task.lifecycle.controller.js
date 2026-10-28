const taskRepo = require('./task.repository');
const timerRepo = require('../timers/timer.repository');
const activityRepo = require('../activity/activity.repository');
const { calcSession } = require('../timers/timer.rules');
const { getAccessibleTask } = require('./task.access');
const { presentTask } = require('./task.presenter');
const { canClose, canReopen } = require('./task.policy');
const { notifyTaskState } = require('./task.notify');
const columnRepo = require('../columns/column.repository');
const respond = async (res, req, taskId) =>
  res.status(200).json(await presentTask(await taskRepo.findFull(taskId, req.user.id), req.user));

const closeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const access = await getAccessibleTask(req, res, taskId, { allowClosed: true });
    if (!access) return;
    const { task, board } = access;
    if (task.closed_at) return res.status(409).json({ code: 'TASK_CLOSED', message: 'This task is already closed.' });
    if (!canClose(req.user, task)) return res.status(403).json({ message: 'Only the task creator, a manager or the CEO can close this task' });
const col = await columnRepo.findById(task.column_id);
if (col?.name !== 'Completed') {
  return res.status(409).json({ code: 'TASK_NOT_COMPLETED', message: 'Move the task to Completed before closing it.' });
}
    const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 300) : '';
    await timerRepo.stopAllForTask(taskId, new Date(), calcSession); // nobody keeps logging on a closed task
    await taskRepo.markClosed(taskId, req.user.id, note);
    await activityRepo.add(taskId, { userId: req.user.id, action: note ? `closed this task: "${note}"` : 'closed this task' });

    notifyTaskState({ task, board, actorId: req.user.id, closed: true, note }).catch((e) => console.error('close notifications failed:', e.message));
    await respond(res, req, taskId);
  } catch (e) {
    console.error('closeTask error:', e);
    res.status(500).json({ message: 'Failed to close task' });
  }
};

const reopenTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const access = await getAccessibleTask(req, res, taskId, { allowClosed: true });
    if (!access) return;
    const { task, board } = access;
    if (!task.closed_at) return res.status(409).json({ message: 'This task is not closed.' });
    if (!canReopen(req.user, task)) return res.status(403).json({ message: 'Only the task creator, a manager or the CEO can reopen this task' });

    await taskRepo.markReopened(taskId);
    let backTo = null;
const cols = await columnRepo.findByBoard(task.board_id);
const target = cols.find((c) => c.name === 'In Progress') || cols.find((c) => c.name === 'Todo');
if (target && String(target.id) !== String(task.column_id)) {
  await taskRepo.setColumn(taskId, target.id);
  const ids = (await taskRepo.listIdsInColumn(task.board_id, target.id)).filter((id) => String(id) !== String(taskId));
  await taskRepo.bulkUpdatePositions([...ids, taskId].map((id, i) => ({ id, position: i })));   // end of the column
  const oldIds = await taskRepo.listIdsInColumn(task.board_id, task.column_id);
  await taskRepo.bulkUpdatePositions(oldIds.map((id, i) => ({ id, position: i })));
  backTo = target.name;
}
await activityRepo.add(taskId, { userId: req.user.id, action: backTo ? `reopened this task and moved it back to "${backTo}"` : 'reopened this task' });
    notifyTaskState({ task, board, actorId: req.user.id, closed: false }).catch((e) => console.error('reopen notifications failed:', e.message));
    await respond(res, req, taskId);
  } catch (e) {
    console.error('reopenTask error:', e);
    res.status(500).json({ message: 'Failed to reopen task' });
  }
};


module.exports = { closeTask, reopenTask };