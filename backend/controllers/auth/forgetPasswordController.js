const validator = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../../utils/email-util");
const crypto = require("crypto");
const {
  passwordValidator,
  confirmPasswordValidator,
} = require("../../utils/validator-util");

const postResetPassword = [
  passwordValidator,
  confirmPasswordValidator,
  async (req, res, next) => {
    const { email, token, password, confirmPassword } = req.body;
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (password !== confirmPassword) {
      return res.status(422).json({ message: "Passwords do not match" });
    }

    try {
      const user = await User.findOne({ email });
      if (user.resetToken === token && user.resetTokenExpiry > Date.now()) {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = "";
        user.resetTokenExpiry = Date.now();
        await user.save();
        return res.json({
          success: true,
          message:
            "Password has Been reset successFully you can try Sign in again",
        });
      }
      return res.json({
        message: "Either the Reset Token is Invalid or Has Expired",
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "Some Error Has Occured. Please Try Again",
      });
    }
  },
];

const postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "No user found with this email address. Please check your email and try again.",
        });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const emailResponse = await sendEmail(
      email,
      "Reset Your NoFraud Password",
      `Hi there,\n\nWe received a request to reset the password for your NoFraud account associated with ${email}.\n\nTo reset your password, please click on the following link or copy and paste it into your browser:\nhttp://localhost:5173/reset-password?token=${token}&email=${email}\n\nThis link will expire in 5 minutes for security reasons.\n\nIf you didn't request a password reset, please ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe NoFraud Team`,
      `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">NoFraud</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
            <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">We received a request to reset the password for your NoFraud account associated with <strong>${email}</strong>.</p>
            <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">To reset your password, please click the button below:</p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="http://localhost:5173/reset-password?token=${token}&email=${email}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; overflow-wrap: break-word; word-break: break-all; color: #4F46E5; margin-bottom: 30px;"><a href="http://localhost:5173/reset-password?token=${token}&email=${email}" style="color: #4F46E5;">http://localhost:5173/reset-password?token=${token}&email=${email}</a></p>
            <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">This link will expire in <strong>5 minutes</strong> for security reasons.</p>
            <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
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
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "Password reset link has been sent to your email address.",
    });
  } catch (err) {
    
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
  }
};

module.exports = {
  postForgotPassword,
  postResetPassword,
};
