require("dotenv").config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to: to,
    from: { email: process.env.EMAIL, name: 'NoFraud Team' }, 
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email sent successfully to', to);
    return { success: true, message: 'Email sent via SendGrid' };
  } catch (error) {
    console.error('SendGrid Error:', error.response ? JSON.stringify(error.response.body, null, 2) : error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };