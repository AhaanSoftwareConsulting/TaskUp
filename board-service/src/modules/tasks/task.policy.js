const isStaff = (u) => ['manager', 'ceo'].includes(u?.role);
const isCreator = (u, task) => !!task.created_by && String(task.created_by) === String(u?.id);

const canClose = (u, task) => !task.closed_at && (isStaff(u) || isCreator(u, task));
const canReopen = (u, task) => !!task.closed_at && (isStaff(u) || isCreator(u, task));

module.exports = { isStaff, isCreator, canClose, canReopen };