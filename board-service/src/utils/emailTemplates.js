//emailTemplates.js
const wrap = (heading, body) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="margin:0 0 12px;color:#111">${heading}</h2>
    ${body}
    <p style="color:#999;font-size:12px;margin-top:24px">Ahaan Software Project Management</p>
  </div>`;

module.exports = {
  addedToBoard: ({ boardName, addedBy }) => ({
    subject: `You were added to "${boardName}"`,
    html: wrap('Added to a project', `<p><b>${addedBy}</b> added you to the project <b>${boardName}</b>.</p>`),
  }),
  taskAssigned: ({ taskTitle, boardName, assignedBy }) => ({
    subject: `New task assigned: ${taskTitle}`,
    html: wrap('New task assigned', `<p><b>${assignedBy}</b> assigned you <b>${taskTitle}</b> in <b>${boardName}</b>.</p>`),
  }),
  statusChanged: ({ taskTitle, boardName, changedBy, from, to }) => ({
    subject: `Task moved to ${to}: ${taskTitle}`,
    html: wrap('Task status changed', `<p><b>${changedBy}</b> moved <b>${taskTitle}</b> in <b>${boardName}</b>.</p>
      <p style="font-size:16px"><span style="background:#eee;padding:4px 10px;border-radius:999px">${from}</span> → <span style="background:#111;color:#fff;padding:4px 10px;border-radius:999px">${to}</span></p>`),
  }),
};