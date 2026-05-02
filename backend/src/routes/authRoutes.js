import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, verifyOTP, resendOTP, forgotPasswordOTPGenerator, resetPassword } from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";




const router = Router();

router.route("/register")
    .post(registerUser);

router.route("/login")
    .post(loginUser);

router.route("/logout")
    .post(authMiddleware, logoutUser);

router.route("/refresh-token")
    .post(refreshAccessToken);

router.route("/verify-otp")
    .post(verifyOTP);

router.route("/resend-otp")
    .post(resendOTP);

router.route("/forgot-password")
    .post(forgotPasswordOTPGenerator);

router.route("/reset-password")
    .post(resetPassword);


export default router;