const express = require('express')
const authRouter = express.Router();
const {postForgotPassword, postResetPassword} = require('../controllers/auth/forgetPasswordController');
const {postLogin, postLogout} = require('../controllers/auth/loginController');
const {postVerifyOtp} = require('../controllers/auth/verifyOtpController');
const {postSignup} = require('../controllers/auth/signupController');

authRouter.post('/reset-password', postResetPassword)

authRouter.post('/forgot-password', postForgotPassword)

authRouter.post('/verify-otp', postVerifyOtp);

authRouter.post('/login',postLogin);

authRouter.post('/signup',postSignup);

authRouter.post('/logout',postLogout);


module.exports = {
    authRouter,
}