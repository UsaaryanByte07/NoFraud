require("dotenv").config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid API (HTTPS) to bypass SMTP port blocking.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version of message
 * @param {string} html - HTML version of message
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to: to,
    from: process.env.EMAIL, // Must be verified in SendGrid
    subject: subject,
    text: text,
    html: html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent via SendGrid' };
  } catch (error) {
    console.error('❌ SendGrid Error:', error.message);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };