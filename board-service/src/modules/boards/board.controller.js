const boardRepo = require('./board.repository');
const columnRepo = require('../columns/column.repository');
const taskRepo = require('../tasks/task.repository');
const { getUserById, getUsersByIds } = require('../../utils/userClient');
const { notifyUser, notifyAddedToBoard } = require('../../utils/notifyClient');
const templates = require('../../utils/emailTemplates');
const { validateProjectInput } = require('./board.validation');

// Fields a client may send when creating or editing a project.
const PROJECT_FIELDS = [
  'name', 'description', 'clientName', 'clientContactPerson', 'clientEmail', 'clientPhone',
  'projectManagerId', 'startDate', 'deadline', 'priority', 'status', 'estimatedHours',
];

const pickProjectFields = (body) => {
  const out = {};
  PROJECT_FIELDS.forEach((f) => { if (body[f] !== undefined) out[f] = body[f]; });
  if (typeof out.name === 'string') out.name = out.name.trim();
  if (out.description !== undefined) {
    out.description = typeof out.description === 'string' ? out.description.trim().slice(0, 500) || null : null;
  }
  ['clientName', 'clientContactPerson', 'clientEmail', 'clientPhone'].forEach((f) => {
    if (typeof out[f] === 'string') out[f] = out[f].trim();
  });
  return out;
};

const canManage = (board, user) =>
  String(board.owner) === String(user.id) ||
  String(board.projectManagerId) === String(user.id) ||
  ['manager', 'ceo'].includes(user.role);

/** Attaches { name, email, role } from the user-service onto owner / project manager / members. */
async function withMemberInfo(board) {
  const ids = [...new Set([board.owner, board.projectManagerId, ...board.members].filter(Boolean))];
  const usersById = await getUsersByIds(ids);
  return {
    ...board,
    owner: usersById[board.owner] || { id: board.owner },
    projectManager: usersById[board.projectManagerId] || { id: board.projectManagerId },
    members: board.members.map((id) => usersById[id] || { id }),
  };
}

const createBoard = async (req, res) => {
  const ownerId = req.user.id;
  const errors = validateProjectInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    const members = Array.isArray(req.body.members) ? req.body.members : [];
    const newProject = await boardRepo.create({ ...pickProjectFields(req.body), owner: ownerId, memberIds: members });

    const toNotify = [...new Set([...members, newProject.projectManagerId])].filter((id) => id && id !== ownerId);
    await Promise.all(
      toNotify.map((memberId) => notifyAddedToBoard({ memberId, actorId: ownerId, boardName: newProject.name }))
    );

    return res.status(201).json(await withMemberInfo(newProject));
  } catch (error) {
    console.error('Error creating project', error);
    res.status(500).json({ message: 'server error: failed to create project' });
  }
};

const getBoardsForUser = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const boards = await boardRepo.findByMember(req.user.id, { includeArchived });
    res.status(200).json(await Promise.all(boards.map(withMemberInfo)));
  } catch (error) {
    console.error('Error fetching projects', error);
    res.status(500).json({ message: 'server error: could not fetch projects' });
  }
};

const getBoardById = async (req, res) => {
  const boardId = req.params.id;
  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isMember = board.members.some((m) => String(m) === String(req.user?.id));
    if (!isMember) return res.status(403).json({ message: 'Access Denied. You are not a member of Board' });

    const columns = await columnRepo.findByBoard(boardId);
    const tasks = await taskRepo.findByBoards([boardId]);
    const tasksByColumn = tasks.reduce((acc, t) => {
      (acc[t.columnid] = acc[t.columnid] || []).push(t); // unchanged from your version
      return acc;
    }, {});

    const usersById = await getUsersByIds(tasks.flatMap((t) => t.assignedTo));
    const enrichedColumns = columns.map((col) => ({
      ...col,
      tasks: (tasksByColumn[col.id] || []).map((t) => ({
        ...t,
        assignedTo: t.assignedTo.map((id) => usersById[id] || { id }),
      })),
    }));

    res.status(200).json({ ...(await withMemberInfo(board)), columns: enrichedColumns });
  } catch (error) {
    console.error(`Error fetching project ${boardId}:`, error);
    res.status(500).json({ message: 'Server error: Failed to retrieve project details' });
  }
};

const addMemberToBoard = async (req, res) => {
  const { boardId } = req.params;
  const { memberId } = req.body;

  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.members.includes(memberId)) return res.status(400).json({ message: 'User already a member' });

    await boardRepo.addMember(boardId, memberId);
    await notifyAddedToBoard({ memberId, actorId: req.user.id, boardName: board.name });

    const [member, actor] = await Promise.all([getUserById(memberId), getUserById(req.user.id)]);
    await notifyUser({
      userId: memberId,
      title: 'Added to project',
      message: `You were added to the project "${board.name}"`,
      email: member?.email
        ? { to: member.email, ...templates.addedToBoard({ boardName: board.name, addedBy: actor?.full_name || 'A manager' }) }
        : undefined,
    });

    return res.status(200).json(await withMemberInfo(await boardRepo.findById(boardId)));
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBoard = async (req, res) => {
  const { boardId } = req.params;
  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'board not found' });
    await boardRepo.deleteById(boardId);
    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'server error during deleting process' });
  }
};

const editBoard = async (req, res) => {
  const { boardId } = req.params;
  const errors = validateProjectInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Project not found' });
    if (!canManage(board, req.user)) {
      return res.status(403).json({ message: 'Only the owner, project manager, a manager or the CEO can edit this project' });
    }

    await boardRepo.updateDetails(boardId, pickProjectFields(req.body));
    return res.status(200).json(await withMemberInfo(await boardRepo.findById(boardId)));
  } catch (error) {
    console.error('Error editing project', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** PATCH /:boardId/archive  body: { archived: true | false } (default true) */
const archiveBoard = async (req, res) => {
  const { boardId } = req.params;
  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Project not found' });
    if (!canManage(board, req.user)) return res.status(403).json({ message: 'You cannot archive this project' });

    await boardRepo.setArchived(boardId, req.body?.archived !== false);
    return res.status(200).json(await withMemberInfo(await boardRepo.findById(boardId)));
  } catch (error) {
    console.error('Error archiving project', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const removeMemberFromBoard = async (req, res) => {
  const { boardId, memberId } = req.params;
  try {
    const board = await boardRepo.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (String(board.owner) === String(memberId)) return res.status(400).json({ message: "Can't remove the project owner" });
    if (String(board.projectManagerId) === String(memberId)) {
      return res.status(400).json({ message: "Can't remove the project manager. Assign a new manager first." });
    }
    await boardRepo.removeMember(boardId, memberId);
    return res.status(200).json(await withMemberInfo(await boardRepo.findById(boardId)));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBoard, getBoardsForUser, getBoardById, addMemberToBoard,
  deleteBoard, editBoard, archiveBoard, removeMemberFromBoard,
};
