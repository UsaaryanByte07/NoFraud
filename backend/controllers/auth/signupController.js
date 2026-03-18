const validator = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../../utils/email-util");
const {passwordValidator, confirmPasswordValidator, emailValidator, firstNameValidator, lastNameValidator} =  require('../../utils/validator-util')

const postSignup = [
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
  async (req, res, next) => {
    const {
      firstName,
      lastName,
      password,
      email,
      confirmPassword,
    } = req.body;
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array(), prevDetails: {firstName,lastName,password,email,confirmPassword}})
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      const user = User({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        otp,
        otpExpiry,
      });
      await user.save();
      const emailResponse = await sendEmail(
        email,
        "Welcome to NoFraud - Verify Your Email",
        `Hi ${firstName} ${lastName},\n\nTo complete your account setup, please verify your email address using the OTP (One-Time Password) below:\n\nYour Verification Code: ${otp}\n\nThis code will expire in 5 minutes for security reasons.\n\nSteps to verify:\n1. Return to the verification page\n2. Enter the 6-digit code: ${otp}\n3. Click "Verify Email"\n\nBest regards,\nThe NoFraud Team`,
        `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">NoFraud</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${firstName} ${lastName}</strong>,</p>
              <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">To complete your account setup, please verify your email address using the OTP (One-Time Password) below.</p>
              <div style="background-color: #f1f5f9; border: 1px dashed #4F46E5; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <p style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 10px 0; letter-spacing: 1px;">Your Verification Code</p>
                <h2 style="font-size: 36px; font-weight: 700; color: #4F46E5; margin: 0; letter-spacing: 5px;">${otp}</h2>
              </div>
              <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">This code will expire in <strong>5 minutes</strong> for security reasons.</p>
              <div style="margin-bottom: 30px;">
                 <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">Steps to verify:</h3>
                 <ol style="font-size: 16px; line-height: 1.6; color: #555; margin: 0; padding-left: 20px;">
                   <li>Return to the verification page</li>
                   <li>Enter the 6-digit code above</li>
                   <li>Click <strong>"Verify Email"</strong></li>
                 </ol>
              </div>
              <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br><strong style="color: #4F46E5;">The NoFraud Team</strong></p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              &copy; ${new Date().getFullYear()} NoFraud. All rights reserved.
            </div>
          </div>
        </div>
        `
      );

      if (!emailResponse.success) {
        return res.status(500).json({errors: [{msg: "Failed to send verification email. Please try again."}]});
      }
    } catch (err) {
      if (err.code == 11000) {
        return res.status(422).json({errors: [{msg: "Email Entered by You already Exist. You can Try Sign In with the Email."}]})
      }
      return res.status(500).json({errors: [{msg: "An unexpected server error occurred. Please try again."}]})
    }
    res.json({success: true, message: "OTP Sent Successfully. Please Check Your Email.", email});
  },
];


module.exports = {
    postSignup
}