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
      return res.status(422).json({errors: errors.array(), prevDetails: {firstName,lastName,password,email,confirmPassword,userType,terms}})
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
      await sendEmail(
        email,
        "Welcome to NoFraud - Verify Your Email",
        `Hi ${firstName} ${lastName},

To complete your account setup, please verify your email address using the OTP (One-Time Password) below:

Your Verification Code: ${otp}

This code will expire in 5 minutes for security reasons.

Steps to verify:
1. Return to the verification page
2. Enter the 6-digit code: ${otp}
3. Click "Verify Email"
`,`<p>Hi ${firstName} ${lastName},

To complete your account setup, please verify your email address using the OTP (One-Time Password) below:

Your Verification Code: ${otp}

This code will expire in 5 minutes for security reasons.

Steps to verify:
1. Return to the verification page
2. Enter the 6-digit code: ${otp}
3. Click "Verify Email"
</p>`
      );
    } catch (err) {
      if (err.code == 11000) {
        return res.status(422).json({errors: [{msg: "Email Entered by You already Exist. You can Try Sign In with the Email."}]})
      }
      return res.status(500).json({errors: [{msg: "An unexpected server error occurred. Please try again."}]})
    }
    res.json({success: true, message: "OTP Sent Successfull. Please Check Your Email.", email});
  },
];


module.exports = {
    postSignup
}