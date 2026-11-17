const { v4: uuidv4 } = require('uuid');
const { pool, query } = require('../../config/database');

// API field (business name) -> DB column. Whitelist: only these can be written.
const FIELD_MAP = {
  name: 'name',
  description: 'description',
  clientName: 'client_name',
  clientContactPerson: 'client_contact_person',
  clientEmail: 'client_email',
  clientPhone: 'client_phone',
  projectManagerId: 'project_manager_id',
  startDate: 'start_date',
  deadline: 'deadline',
  priority: 'priority',
  status: 'status',
  estimatedHours: 'estimated_hours',
};
const NOT_NULLABLE = ['name', 'priority', 'status'];

// DATE columns are formatted in SQL so the API never shifts them by timezone.
const SELECT_COLUMNS = `b.id, b.name, b.description, b.owner, b.project_manager_id,
  b.client_name, b.client_contact_person, b.client_email, b.client_phone,
  DATE_FORMAT(b.start_date, '%Y-%m-%d') AS start_date,
  DATE_FORMAT(b.deadline,   '%Y-%m-%d') AS deadline,
  b.priority, b.status, b.estimated_hours, b.is_archived, b.created_at, b.updated_at`;

const toProject = (row, members) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  owner: row.owner,
  projectManagerId: row.project_manager_id || row.owner,
  clientName: row.client_name,
  clientContactPerson: row.client_contact_person,
  clientEmail: row.client_email,
  clientPhone: row.client_phone,
  startDate: row.start_date,
  deadline: row.deadline,
  priority: row.priority,
  status: row.status,
  estimatedHours: row.estimated_hours,
  archived: Boolean(row.is_archived),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  members,
});

/** [[column, value], ...] for the fields that were actually sent. */
function pickColumns(input) {
  const pairs = [];
  for (const [key, column] of Object.entries(FIELD_MAP)) {
    if (input[key] === undefined) continue;
    let value = input[key] === '' ? null : input[key];
    if (value === null && NOT_NULLABLE.includes(key)) continue;
    if (key === 'estimatedHours' && value !== null) value = Number(value);
    pairs.push([column, value]);
  }
  return pairs;
}

async function create({ owner, memberIds = [], ...input }) {
  const id = uuidv4();
  const projectManagerId = input.projectManagerId || owner;
  const allMembers = [...new Set([owner, projectManagerId, ...memberIds])];
  const pairs = pickColumns({ ...input, projectManagerId });

  const columns = ['id', 'owner', ...pairs.map(([c]) => c)];
  const values = [id, owner, ...pairs.map(([, v]) => v)];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO boards (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );
    for (const userId of allMembers) {
      await conn.execute('INSERT INTO board_members (board_id, user_id) VALUES (?, ?)', [id, userId]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return findById(id);
}

async function findById(id) {
  const rows = await query(`SELECT ${SELECT_COLUMNS} FROM boards b WHERE b.id = ?`, [id]);
  if (!rows[0]) return null;
  return toProject(rows[0], await getMembers(id));
}

async function findByMember(userId, { includeArchived = false } = {}) {
  const rows = await query(
    `SELECT ${SELECT_COLUMNS}
     FROM boards b
     JOIN board_members bm ON bm.board_id = b.id
     WHERE bm.user_id = ? ${includeArchived ? '' : 'AND b.is_archived = 0'}
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return Promise.all(rows.map(async (r) => toProject(r, await getMembers(r.id))));
}

async function getMembers(boardId) {
  const rows = await query('SELECT user_id FROM board_members WHERE board_id = ?', [boardId]);
  return rows.map((r) => r.user_id);
}

async function isMember(boardId, userId) {
  const rows = await query('SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ? LIMIT 1', [boardId, userId]);
  return rows.length > 0;
}

async function addMember(boardId, userId) {
  await query('INSERT IGNORE INTO board_members (board_id, user_id) VALUES (?, ?)', [boardId, userId]);
}

async function removeMember(boardId, userId) {
  await query('DELETE FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, userId]);
}

/** Updates only the fields that were sent. A new project manager is also made a member. */
async function updateDetails(boardId, input) {
  const pairs = pickColumns(input);
  if (pairs.length) {
    await query(
      `UPDATE boards SET ${pairs.map(([c]) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...pairs.map(([, v]) => v), boardId]
    );
  }
  if (input.projectManagerId) await addMember(boardId, input.projectManagerId);
}

async function setArchived(boardId, archived) {
  await query('UPDATE boards SET is_archived = ? WHERE id = ?', [archived ? 1 : 0, boardId]);
}

async function deleteById(boardId) {
  await query('DELETE FROM boards WHERE id = ?', [boardId]); // ON DELETE CASCADE cleans up children
}

module.exports = {
  create, findById, findByMember, getMembers, isMember,
  addMember, removeMember, updateDetails, setArchived, deleteById,
};
