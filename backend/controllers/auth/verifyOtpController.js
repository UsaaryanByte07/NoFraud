const User = require("../../models/User");

const postVerifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user.otp === otp && user.otpExpiry > Date.now()) {
      user.isVerified = true;
      user.otp = "";
      user.otpExpiry = Date.now();
      await user.save();
      res.json({success: true, message: "Email verified successfully. You can login now.", user: user})
    } else {
      res.status(401).json({ message: "Either the OTP has Expired or it is Invalid"})
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error During OTP Verification"})
  }
};

module.exports = {
    postVerifyOtp
}