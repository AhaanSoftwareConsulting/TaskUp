const taskRepo = require('./task.repository');
const boardRepo = require('../boards/board.repository');

async function getAccessibleTask(req, res, taskId, { allowClosed = false } = {}) {
  const task = await taskRepo.findById(taskId);
  if (!task) { res.status(404).json({ message: 'Task not found' }); return null; }
  const board = await boardRepo.findById(task.board_id);
  if (!board || !board.members.some((m) => String(m) === String(req.user.id))) {
    res.status(403).json({ message: 'You are not a member of this board' });
    return null;
  }
  if (task.closed_at && !allowClosed) {
    res.status(409).json({ code: 'TASK_CLOSED', message: 'This task is closed. Reopen it to make changes.' });
    return null;
  }
  return { task, board };
}
module.exports = { getAccessibleTask };