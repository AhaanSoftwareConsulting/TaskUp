const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.password } : undefined,
});

async function sendMail({ to, subject, html }) {
  if (!to) return;
  if (config.app.debug) {
    console.log(`DEV email to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: config.smtp.fromEmail, to, subject, html });
}

module.exports = { sendMail };