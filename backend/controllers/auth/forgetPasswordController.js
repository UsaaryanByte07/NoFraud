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

    await sendEmail(
      email,
      "Reset Your Airbnb Password",
      `Hi there,

We received a request to reset the password for your NoFraud account associated with ${email}.

To reset your password, please click on the following link or copy and paste it into your browser:
http://localhost:5173/reset-password?token=${token}&email=${email}

This link will expire in 5 minutes for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The Airbnb Team`,
      `Hi there,

We received a request to reset the password for your NoFraud account associated with ${email}.

To reset your password, please click on the following link or copy and paste it into your browser:
http://localhost:5173/reset-password?token=${token}&email=${email}

This link will expire in 5 minutes for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The Airbnb Team`,
    );

    res.json({
      success: true,
      message: "Password reset link has been sent to your email address.",
    });
  } catch (err) {
    console.log(err);
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
