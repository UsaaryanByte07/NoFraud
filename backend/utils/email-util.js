require("dotenv").config();
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: to,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    if (error.response && error.response.includes('454 4.7.0')) {
      console.error('\n🚨 GMAIL QUOTA EXCEEDED 🚨');
      console.error('Error Code: 454 4.7.0');
      console.error('Reason: You have hit the 500 recipients/day limit.');
      console.error('Action Required: You must wait up to 24 hours for the quota to reset.\n');
      
      return { success: false, error: 'Quota exceeded', code: 454 };
    } 
    console.error('❌ Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {sendEmail}