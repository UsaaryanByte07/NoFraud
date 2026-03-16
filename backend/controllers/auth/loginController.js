const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Either the Email is incorrect or the Password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please Verify your Email First", email: user.email });
    }
    // Compare password (bcrypt.compare is async, so we need await)
    const isMatching = await bcrypt.compare(password, user.password);

    if (isMatching) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // Save session and redirect after successful save
      req.session.save((err) => {
        if (err) {
          console.log("Session Save error:", err);
          return res.status(500).json({message: "Internal Server Error"});
        }
        res.json({success: true, message: "Login Successful", user: req.session.user});
      });
    } else {
      return res.status(401).json({message: "Either the Email is incorrect or the Password"});
    }
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({message: "Internal Server Error During Login"});
  }
};

const postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Session Destroy error:", err);
    }
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
    });
    res.json({success: true, message: "Logged Out Successfully"});
  });
};

module.exports = {
    postLogin,
    postLogout
}