const { v4: uuidv4 } = require('uuid');
const { uploadAll, destroyFile, downloadUrl, previewUrl, cleanFileName } = require('../../utils/cloudinary');
const taskRepo = require('./task.repository');
const columnRepo = require('../columns/column.repository');
const boardRepo = require('../boards/board.repository');
const { getUserById, getUsersByIds } = require('../../utils/userClient');
const { notifyUser, notifyBoardMembers, notifyAssigned } = require('../../utils/notifyClient');
const config = require('../../config/config');
const templates = require('../../utils/emailTemplates');

const MENTION_RE = /@\[([^\]]{1,100})\]\(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/gi;
const MAX_COMMENT_CHARS = 5000;
const bad = (message) => Object.assign(new Error(message), { status: 400 });
/** Enrich the string user-ids on a task (assignedTo, comments.user_id, activityLog.user_id, attachments.uploaded_by) with display info. */
async function withUserInfo(task) {
  if (!task) return task;
  const timeByUser = await taskRepo.getTimeByUser(task.id);
  const activeTimers = await taskRepo.getActiveTimersForTask(task.id);
  const ids = [
    ...(task.assignedTo || []),
    ...(task.comments || []).map((c) => c.user_id),
    ...(task.comments || []).flatMap((c) => (c.attachments || []).map((a) => a.uploaded_by)),
    ...(task.activityLog || []).map((a) => a.user_id),
    ...(task.attachments || []).map((a) => a.uploaded_by),
    ...timeByUser.map((t) => t.user_id),
    ...activeTimers.map((t) => t.user_id),
  ];
  const usersById = await getUsersByIds(ids);
  const resolve = (id) => (id ? usersById[id] || { id } : id);

  return {
    ...task,
    timeManagement: {
      estimated_time: task.estimated_time,
      total_logged_time: task.total_logged_time,
      delay: task.time_delay,
      dailyLogs: [],
      byUser: timeByUser.map((t) => ({ user: resolve(t.user_id), duration: Number(t.total_duration) })),
      activeTimers: activeTimers.map((t) => ({ user: resolve(t.user_id), active_start_time: t.active_start_time })),
    },
    assignedTo: (task.assignedTo || []).map(resolve),
    comments: (task.comments || []).map((c) => ({
  id: c.id,
  task_id: c.task_id,
  user: resolve(c.user_id),
  text: c.text,
  blocks: parseBlocks(c.blocks),
  attachments: (c.attachments || []).map((a) => formatAttachment(a, resolve)),
  created_at: c.created_at,
})),
attachments: (task.attachments || []).map((a) => formatAttachment(a, resolve)),
    activityLog: (task.activityLog || []).map((a) => ({ ...a, user: resolve(a.user_id) })),
    
  };
}

const createTask = async (req, res) => {
  const { boardId, columnId } = req.params;
  const { title, description, priority, assignedTo, due_date, start_date } = req.body;
  try {
    const board = await boardRepo.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    const isMember = board.members.some((m) => String(m) === String(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access Denied: You must be member' });
    }
    const newTask = await taskRepo.create({
      title,
      description,
      priority,
      due_date,
      start_date,
      columnId,
      boardId,
      assignedTo: assignedTo || [],
    });
    await taskRepo.addActivityLog(newTask.id, { userId: req.user.id, action: 'Task created' });

    if (assignedTo && assignedTo.length) {
      await Promise.all(
        assignedTo
          .filter((id) => String(id) !== String(req.user.id))
          .map((id) => notifyAssigned({ assigneeId: id, actorId: req.user.id, taskTitle: title, boardName: board.name }))
      );
    }

    const full = await taskRepo.findFull(newTask.id);
    res.status(201).json(await withUserInfo(full));
  } catch (error) {
    console.error(`Error creating task for column ${columnId}:`, error);
    res.status(500).json({ message: 'Server Error: Failed to create task' });
  }
};

const moveTask = async (req, res) => {
  const { newColumnId, newPosition } = req.body;
  const taskId = req.params.taskId;

  try {
    const task = await taskRepo.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldColumnId = task.column_id;
    const oldColumn = await columnRepo.findById(oldColumnId);
    const oldColumnTitle = oldColumn ? oldColumn.name : 'Unknown';

    if (String(oldColumnId) !== String(newColumnId)) {
      const newCol = await columnRepo.findById(newColumnId);

      await taskRepo.addActivityLog(taskId, {
        userId: req.user.id,
        action: `Moved status from "${oldColumnTitle}" to "${newCol.name}"`,
      });

      await taskRepo.setColumn(taskId, newColumnId);

      const board = await boardRepo.findById(task.board_id);
      // await notifyBoardMembers({
      //   memberIds: board ? board.members : [],
      //   actorId: req.user.id,
      //   title: 'Task moved',
      //   message: `"${task.title}" moved from "${oldColumnTitle}" to "${newCol.name}"`,
      // });


      const [actor, assignees] = await Promise.all([
        getUserById(req.user.id),
        getUsersByIds((await taskRepo.findFull(taskId)).assignedTo),
      ]);


      await Promise.all(
        Object.values(assignees)
          .filter((u) => u.id !== req.user.id && u.email)
          .map((u) =>
            notifyUser({
              userId: u.id,
              title: 'Task moved',
              message: `"${task.title}" moved from "${oldColumnTitle}" to "${newCol.name}"`,
              email: {
                to: u.email,
                ...templates.statusChanged({
                  taskTitle: task.title,
                  boardName: board?.name,
                  changedBy: actor?.full_name || 'Someone',
                  from: oldColumnTitle,
                  to: newCol.name,
                }),
              },
            })
          )
      );

    } else {
      await taskRepo.addActivityLog(taskId, {
        userId: req.user.id,
        action: `Changed position in ${oldColumnTitle}`,
      });
    }

    // Reindex the destination column's tasks around the new position.
    const destTasks = (await taskRepo.findByColumnAndBoard(task.board_id, newColumnId)).filter(
      (t) => String(t.id) !== String(taskId)
    );
    destTasks.splice(newPosition, 0, { id: taskId });
    await taskRepo.bulkUpdatePositions(destTasks.map((t, i) => ({ id: t.id, position: i })));

    if (String(oldColumnId) !== String(newColumnId)) {
      const oldColTasks = await taskRepo.findByColumnAndBoard(task.board_id, oldColumnId);
      await taskRepo.bulkUpdatePositions(oldColTasks.map((t, i) => ({ id: t.id, position: i })));
    }

    const updated = await taskRepo.findFull(taskId);
    res.status(200).json(await withUserInfo(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database update failed' });
  }
};

// task.controller.js
const UPDATE_FIELD_TO_COLUMN = {
  title: null, description: null, priority: null,
  due_date: 'due_date', start_date: 'start_date', progress: null, position: null,
  estimated_time: 'estimated_time',   // ← add, and note field names are now snake_case matching the rest of the file
};

function toDay(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return isNaN(d) ? String(value) : d.toISOString().slice(0, 10);
}

function toComparable(key, value) {
  if (value === null || value === undefined || value === '') return '';
  if (key === 'due_date' || key === 'start_date') return toDay(value);
  if (['estimated_time', 'progress', 'position'].includes(key)) return String(Number(value));
  return String(value);
}
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await taskRepo.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    for (const key of Object.keys(UPDATE_FIELD_TO_COLUMN)) {
      if (!Object.prototype.hasOwnProperty.call(updates, key)) continue;
      const column = UPDATE_FIELD_TO_COLUMN[key] || key;
      const oldValue = task[column];
      const newValue = updates[key];
      if (toComparable(key, oldValue) === toComparable(key, newValue)) continue;

      let actionText = `updated the ${key}`;
      if (key === 'priority') {
        actionText = `changed priority from ${oldValue || 'none'} to ${newValue}`;
      }
      await taskRepo.addActivityLog(taskId, {
        userId: req.user.id,
        action: actionText,
        field: key,
        oldValue,
        newValue,
      });
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'assignedTo')) {
      const current = await taskRepo.findFull(taskId);
      const oldIds = (current.assignedTo || []).map(String);
      const newIds = (updates.assignedTo || []).map(String);
      const addedId = newIds.find((id) => !oldIds.includes(id));

      if (addedId) {
        const user = await getUserById(addedId);
        await taskRepo.addActivityLog(taskId, {
          userId: req.user.id,
          action: `assigned task to ${user?.full_name || 'a user'}`,
          field: 'assignedTo',
          oldValue: oldIds,
          newValue: newIds,
        });
        const taskBoard = await boardRepo.findById(task.board_id);
        await notifyAssigned({ assigneeId: addedId, actorId: req.user.id, taskTitle: task.title, boardName: taskBoard?.name });
      }
      await taskRepo.setAssignees(taskId, newIds);
    }

    await taskRepo.updateFields(taskId, updates);

    const updated = await taskRepo.findFull(taskId);
    res.status(200).json(await withUserInfo(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await taskRepo.findById(taskId);
    if (!task) return res.status(404).json('Task already deleted');

    console.log(`User ${req.user.id} deleted task: ${task.title}`);
    // FK ON DELETE CASCADE removes comments/attachments/activity/daily logs.
    const refs = await taskRepo.getFileRefsForTask(taskId);
await taskRepo.deleteById(taskId);
Promise.all(refs.map((r) => destroyFile(r.public_id, r.resource_type))).catch(() => {});

    res.status(200).json('Task deleted successfully');
  } catch (error) {
    res.status(500).json('Failed to delete task');
  }
};

const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const files = req.files || [];

    const access = await getAccessibleTask(req, res, taskId);
    if (!access) return;
    const { task, board } = access;

    const draft = buildCommentBlocks(req.body || {}, files.length);
    if (draft.length === 0) return res.status(400).json({ message: 'Comment cannot be empty' });

    // 1) Cloudinary first; if the DB write fails we delete the files again.
    const results = await uploadAll(files, `taskup/tasks/${taskId}/comments`);
    const attachments = files.map((f, i) => ({
      id: uuidv4(),
      fileName: cleanFileName(f.originalname),
      fileUrl: results[i].secure_url,
      fileType: f.mimetype,
      sizeBytes: results[i].bytes ?? f.size,
      publicId: results[i].public_id,
      resourceType: results[i].resource_type,
      uploadedBy: userId,
    }));

    const blocks = draft.map((b) =>
      b.type === 'file' ? { type: 'file', attachment_id: attachments[b.index].id } : b
    );
    // Plain version (mentions as "@Name") for activity text and notifications
    const plain = draft
      .filter((b) => b.type === 'text')
      .map((b) => b.text.replace(MENTION_RE, '@$1'))
      .join('\n');

    try {
      await taskRepo.addComment(taskId, { userId, text: plain, blocks, attachments });
    } catch (dbErr) {
      await Promise.all(results.map((r) => destroyFile(r.public_id, r.resource_type)));
      throw dbErr;
    }

    await taskRepo.addActivityLog(taskId, {
      userId,
      action: attachments.length
        ? `added a comment with ${attachments.length} file(s)`
        : `added a comment: "${plain.slice(0, 40)}${plain.length > 40 ? '…' : ''}"`,
    });

    const full = await taskRepo.findFull(taskId);

    // Mentions come from the saved text, never from a separate client field,
    // and only board members count (they're the only ones who can open the task).
    const memberIds = new Set(board.members.map(String));
    const mentionIds = [
      ...new Set(
        draft.filter((b) => b.type === 'text').flatMap((b) => [...b.text.matchAll(MENTION_RE)].map((m) => m[2]))
      ),
    ].filter((id) => memberIds.has(id) && id !== String(userId));

    // Assignees + earlier commenters get the generic "new comment"; mentioned people get only the mention.
    const generalIds = [
      ...new Set([
        ...(full.assignedTo || []).map(String),
        ...(full.comments || []).map((c) => c.user_id).filter(Boolean).map(String),
      ]),
    ].filter((id) => id !== String(userId) && !mentionIds.includes(id));

    // Not awaited: the comment shows up instantly even if the notification service is slow.
    (async () => {
      const [author, usersById] = await Promise.all([
        getUserById(userId),
        getUsersByIds([...mentionIds, ...generalIds]),
      ]);
      const authorName = author?.full_name || 'Someone';
      const snippet = plain.replace(/\s+/g, ' ').slice(0, 300) || 'Shared an attachment';
      const linkFor = (u) => `${config.frontend.url}/${u.role || 'employee'}/dashboard/tasks/${taskId}`;
      const send = (id, title, message, template) => {
        const u = usersById[id];
        if (!u) return null;
        return notifyUser({
          userId: u.id,
          title,
          message,
          email: u.email ? { to: u.email, ...template(linkFor(u)) } : undefined,
        });
      };
      await Promise.all([
        ...mentionIds.map((id) =>
          send(id, 'You were mentioned', `${authorName} mentioned you on "${task.title}"`, (taskLink) =>
            templates.mentioned({ taskTitle: task.title, boardName: board.name, mentionedBy: authorName, comment: snippet, taskLink }))),
        ...generalIds.map((id) =>
          send(id, 'New comment', `${authorName} commented on "${task.title}"`, (taskLink) =>
            templates.commentAdded({ taskTitle: task.title, boardName: board.name, commentedBy: authorName, comment: snippet, taskLink }))),
      ]);
    })().catch((e) => console.error('comment notifications failed:', e.message));

    res.status(201).json(await withUserInfo(full, userId));
  } catch (error) {
    console.error('addTaskComment error:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Failed to post comment' });
  }
};

const uploadtaskFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    const access = await getAccessibleTask(req, res, taskId);
    if (!access) return;
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ message: 'No files received' });

    const results = await uploadAll(files, `taskup/tasks/${taskId}`);
    const rows = files.map((f, i) => ({
      id: uuidv4(),
      fileName: cleanFileName(f.originalname),
      fileUrl: results[i].secure_url,
      fileType: f.mimetype,
      sizeBytes: results[i].bytes ?? f.size,
      publicId: results[i].public_id,
      resourceType: results[i].resource_type,
      uploadedBy: req.user.id,
    }));
    try {
      await taskRepo.addAttachments(taskId, rows);
    } catch (dbErr) {
      await Promise.all(results.map((r) => destroyFile(r.public_id, r.resource_type)));
      throw dbErr;
    }
    await taskRepo.addActivityLog(taskId, { userId: req.user.id, action: `uploaded ${rows.length} file(s)` });

    const updated = await taskRepo.findFull(taskId);
    res.status(200).json(await withUserInfo(updated, req.user.id));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'File upload failed' });
  }
};

const deleteTaskFile = async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const access = await getAccessibleTask(req, res, taskId);
    if (!access) return;

    const attachment = await taskRepo.getAttachmentById(fileId);
    if (!attachment || String(attachment.task_id) !== String(taskId)) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    const canDelete =
      String(attachment.uploaded_by) === String(req.user.id) || ['manager', 'ceo'].includes(req.user.role);
    if (!canDelete) {
      return res.status(403).json({ message: 'Only the uploader, a manager or the CEO can delete this file' });
    }

    await taskRepo.deleteAttachment(fileId);
    await destroyFile(attachment.public_id, attachment.resource_type || 'image');
    await taskRepo.addActivityLog(taskId, { userId: req.user.id, action: `deleted attachment: ${attachment.file_name}` });

    const updated = await taskRepo.findFull(taskId);
    res.status(200).json(await withUserInfo(updated, req.user.id));
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

const MAX_SESSION_MS = 8 * 3600000;
 
const toggleTimer = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
 
  try {
    const task = await taskRepo.findById(taskId);
 
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
 
    // Check whether this user already has a timer running
    // on ANY task.
    const runningTimer = await taskRepo.getActiveTimerForUser(userId);
 
    const now = new Date();
 
    // Case 1: A timer is already running on this task.
    // Clicking the button should stop it.
    if (
      runningTimer &&
      String(runningTimer.task_id) === String(taskId)
    ) {
      const startTime = new Date(runningTimer.active_start_time);
 
      const rawWorkDone = now.getTime() - startTime.getTime();
      const workDone = Math.min(
        Math.max(rawWorkDone, 0),
        MAX_SESSION_MS
      );
 
      const deadline = task.due_date
        ? new Date(task.due_date).getTime()
        : null;
 
      const goalMs = (task.estimated_time || 0) * 3600000;
 
      let sessionDelay = 0;
 
      if (deadline && now.getTime() > deadline) {
        sessionDelay =
          startTime.getTime() > deadline
            ? workDone
            : now.getTime() - deadline;
      }
 
      const totalBefore = Number(task.total_logged_time || 0);
      const totalAfter = totalBefore + workDone;
 
      if (goalMs > 0 && totalAfter > goalMs) {
        sessionDelay = Math.max(
          sessionDelay,
          totalAfter - Math.max(totalBefore, goalMs)
        );
      }
 
      await taskRepo.updateTimeManagement(taskId, {
        time_delay: Number(task.time_delay || 0) + sessionDelay,
        total_logged_time: totalAfter,
      });
 
      await taskRepo.stopTimer(taskId, userId);
 
      const todayStr = now.toISOString().split("T")[0];
 
      await taskRepo.upsertDailyLog(
        taskId,
        userId,
        todayStr,
        workDone
      );
 
      const updated = await taskRepo.findFull(taskId);
 
      return res.status(200).json({
        message: "Timer stopped successfully",
        task: await withUserInfo(updated),
      });
    }
 
    // Case 2: Another task's timer is running.
    // Do not start the new timer automatically.
    if (runningTimer) {
      return res.status(409).json({
        code: "TIMER_ALREADY_RUNNING",
        message: "Another task timer is already running.",
        activeTaskId: String(runningTimer.task_id),
      });
    }
 
    // Case 3: No timer is running. Start this task's timer.
    await taskRepo.startTimer(taskId, userId, now);
 
    const updated = await taskRepo.findFull(taskId);
 
    return res.status(200).json({
      message: "Timer started successfully",
      task: await withUserInfo(updated),
    });
  } catch (error) {
    console.error("Toggle timer error:", error);
 
    return res.status(500).json({
      message: "Failed to toggle timer",
    });
  }
};
 

const getTasks = async (req, res) => {
  try {
    const { scope, boardId, columnId } = req.query;

    if (boardId && columnId) {
      const board = await boardRepo.findById(boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });
      if (!board.members.some((m) => String(m) === String(req.user.id))) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const tasks = await taskRepo.findByColumnAndBoard(boardId, columnId, req.user.id);
      return res.status(200).json(await Promise.all(tasks.map(withUserInfo)));
    }

    if (scope === 'mine') {
      const tasks = await taskRepo.findByAssignee(req.user.id);
      return res.status(200).json(await Promise.all(tasks.map(withUserInfo)));
    }
    // task.controller.js — getTasks, add a branch
if (scope === 'favorites') {
  const tasks = await taskRepo.findFavoritesByUser(req.user.id);
  return res.status(200).json(await Promise.all(tasks.map(withUserInfo)));
}

    const boards = await boardRepo.findByMember(req.user.id);
    const boardIds = boards.map((b) => b.id);
    const tasks = await taskRepo.findByBoards(boardIds, req.user.id);
    res.status(200).json(await Promise.all(tasks.map(withUserInfo)));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};


const toggleFavorite = async (req, res) => {
  try {
    const isFavorited = await taskRepo.toggleFavorite(req.params.taskId, req.user.id);
    res.status(200).json({ is_favorited: isFavorited });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
};

function parseBlocks(raw) {
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
}
function formatAttachment(a, resolve) {
  const isImage = (a.file_type || '').startsWith('image/');
  return {
    id: a.id,
    fileName: a.file_name,
    fileUrl: a.file_url,
    downloadUrl: a.public_id ? downloadUrl(a.file_url) : a.file_url,
    previewUrl: isImage ? previewUrl(a.file_url) : null,
    fileType: a.file_type || null,
    size: a.size_bytes != null ? Number(a.size_bytes) : null,
    isImage,
    uploadedBy: resolve(a.uploaded_by),
    createdAt: a.created_at || null,
  };
}

async function getAccessibleTask(req, res, taskId) {
  const task = await taskRepo.findById(taskId);
  if (!task) { res.status(404).json({ message: 'Task not found' }); return null; }
  const board = await boardRepo.findById(task.board_id);
  if (!board || !board.members.some((m) => String(m) === String(req.user.id))) {
    res.status(403).json({ message: 'You are not a member of this board' });
    return null;
  }
  return { task, board };
}

/** Validates the composer's ordered blocks. File blocks refer to the uploaded files by index. */
function buildCommentBlocks(body, fileCount) {
  let raw;
  if (body.blocks !== undefined) {
    try { raw = JSON.parse(body.blocks); } catch { throw bad('Invalid comment content'); }
    if (!Array.isArray(raw) || raw.length > 50) throw bad('Invalid comment content');
  } else {
    raw = []; // older clients: plain text first, then files
    if (body.text) raw.push({ type: 'text', text: String(body.text) });
    for (let i = 0; i < fileCount; i++) raw.push({ type: 'file', index: i });
  }
  const out = [];
  const used = new Set();
  let chars = 0;
  for (const b of raw) {
    if (b?.type === 'text' && typeof b.text === 'string') {
      const text = b.text.trim();
      if (!text) continue;
      chars += text.length;
      if (chars > MAX_COMMENT_CHARS) throw bad(`Comment is too long (max ${MAX_COMMENT_CHARS} characters)`);
      out.push({ type: 'text', text });
    } else if (b?.type === 'file' && Number.isInteger(b.index) && b.index >= 0 && b.index < fileCount && !used.has(b.index)) {
      used.add(b.index);
      out.push({ type: 'file', index: b.index });
    }
  }
  for (let i = 0; i < fileCount; i++) if (!used.has(i)) out.push({ type: 'file', index: i });
  return out;
}

module.exports = {
  uploadtaskFile,
  deleteTaskFile,
  createTask,
  moveTask,
  updateTask,
  deleteTask,
  addTaskComment,
  toggleTimer,
  getTasks,
  toggleFavorite
};
