import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, verifyOTP, resendOTP } from "../controllers/authControllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";




const router = Router();

router.route("/register")
    .post(registerUser);

router.route("/login")
    .post(loginUser);

router.route("/logout")
    .post(verifyJWT, logoutUser);

router.route("/refresh-token")
    .post(refreshAccessToken);

router.route("/verify-otp")
    .post(verifyOTP);

router.route("/resend-otp")
    .post(resendOTP);



export default router;