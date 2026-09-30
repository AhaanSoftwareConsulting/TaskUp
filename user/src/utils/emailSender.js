/**
 * Sends via the Hostinger Mail API (official SDK), not raw SMTP —
 * SMTP auth from this host was failing (535 error). The API sends through
 * an actual Hostinger mailbox, identified by its resourceId, rather than
 * an arbitrary "from" address: getCurrentAccount() looks up the mailbox
 * matching config.smtp.fromEmail once, then every send reuses that id.
 */
const { AccountApi, SendApi, Configuration } = require('hostinger-mail-api-sdk');
const config = require('../config/config');

const configuration = new Configuration({ accessToken: config.hostingerMailApi.token });
const accountApi = new AccountApi(configuration);
const sendApi = new SendApi(configuration);

let cachedResourceId = null;

async function getMailboxResourceId() {
  if (cachedResourceId) return cachedResourceId;

  const { data } = await accountApi.getCurrentAccount();
  const mailbox = data.data.mailboxes.find(
    (m) => m.address.toLowerCase() === config.smtp.fromEmail.toLowerCase()
  );
  if (!mailbox) {
    throw new Error(
      `No Hostinger mailbox found matching SMTP_FROM_EMAIL="${config.smtp.fromEmail}". ` +
      `Check the address exists in hPanel and the API token has access to it.`
    );
  }
  cachedResourceId = mailbox.resourceId;
  return cachedResourceId;
}

async function sendEmail(toEmail, subject, htmlBody) {
  if (config.app.debug) {
    console.log(`DEV email to ${toEmail}: ${subject}`);
    return;
  }
  const resourceId = await getMailboxResourceId();
  await sendApi.sendEmail(resourceId, {
    to: [toEmail],
    subject,
    html: htmlBody,
  });
  console.log(`✅ Email sent to ${toEmail} via mailbox ${resourceId}`);
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  const subject = 'Reset your password';
  const html = `
    <p>We received a request to reset your password.</p>
    <p><a href="${resetLink}">Click here to reset your password</a></p>
    <p>This link expires in ${config.tokens.passwordResetExpireMinutes} minutes.
    If you didn't request this, you can ignore this email.</p>
  `;
  await sendEmail(toEmail, subject, html);
}

async function sendVerificationEmail(toEmail, verifyLink) {
  const subject = 'Verify your email address';
  const html = `
    <p>Thanks for signing up! Please verify your email address.</p>
    <p><a href="${verifyLink}">Click here to verify your email</a></p>
    <p>This link expires in ${config.tokens.emailVerificationExpireHours} hours.</p>
  `;
  await sendEmail(toEmail, subject, html);
}

module.exports = { sendEmail, sendPasswordResetEmail, sendVerificationEmail };