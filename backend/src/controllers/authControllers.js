import bcryptjs from "bcryptjs";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.js";
import { generateOTP, sendVerificationOTP, sendResetPasswordOTP } from "../utils/sendEmail.js";
import { response } from "express";

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findByPk(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validate: false });

        return { accessToken, refreshToken };
    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Something went wrong while generating tokens");
    }

}

export const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unathorised Request: No Refresh Token Found");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await findByPk(decodedToken?.id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None"
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user.id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        );

}
);

export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if ([email, otp].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        where: { email }
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified.");
    }

    const isOTPValid = await bcryptjs.compare(String(otp), user.otp);

    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (new Date(user.otpExpires) < Date.now()) {
        throw new ApiError(400, "OTP is expired");
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Email verified successfully")
        );
})

export const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if ([email].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    };

    if (user.isEmailVerified === true) {
        throw new ApiError(400, "Email is already verified");
    }

    const COOLDOWN = 3 * 60 * 1000;

    if(user.otpRequestedAt && Date.now() - user.otpRequestedAt < COOLDOWN) {
        throw new ApiError(400, "Please wait for 3 minutes before requesting another OTP");
    }

    const rawOTP = generateOTP();
    const salt = await bcryptjs.genSalt(10);
    const hashedOTP = await bcryptjs.hash(rawOTP, salt);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = hashedOTP;
    user.otpExpires = otpExpiry;
    user.otpRequestedAt = Date.now();
    await user.save();

    await sendVerificationOTP(email, rawOTP);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "OTP sent successfully")
        );

})

export const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, password, confirmPassword } = req.body;

    if ([firstName, email, role, password, confirmPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "First name, email, role, password and confirmPassword are required");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password do not match.");
    }

    const existedUser = await User.findOne({
        where: { email }
    }
    )

    if (existedUser) {
        throw new ApiError(409, "User with this email already existed.");
    };

    const rawOTP = generateOTP();

    const salt = await bcryptjs.genSalt(10);
    const hashedOTP = await bcryptjs.hash(rawOTP, salt)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
        firstName,
        lastName,
        email,
        role,
        password,
        otp: hashedOTP,
        otpExpires: otpExpiry,
        isEmailVerified: false
    });

    const createdUser = await User.findByPk(user.id);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user.");
    }

    try {
        await sendVerificationOTP(email, rawOTP);
    } catch (error) {
        console.error("Email sending error:", error);
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully.")
    )
}
);

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email and password are required.");
    }

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Email is not verified.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 10 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, user, "Login successful.")
        )
});


export const logoutUser = asyncHandler(async (req, res) => {
    await User.update(
        { refreshToken: null },
        { where: { id: req.user.id } }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None"
    };

    return res.
        status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "Logout successful.")
        );

})

export const forgotPasswordOTPGenerator = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (email?.trim() === "") {
        throw new ApiError(400, "Email is required.");
    }

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }



    const COOLDOWN = 3 * 60 * 1000;

    if(user.resetOtpRequestedAt && Date.now() - user.resetOtpRequestedAt < COOLDOWN) {
        throw new ApiError(400, "Please wait for 3 minutes before requesting another OTP");
    }

    const rawOTP = generateOTP();

    const salt = await bcryptjs.genSalt(10);
    const hashedOTP = await bcryptjs.hash(rawOTP, salt);

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = hashedOTP;
    user.resetOtpExpires = otpExpiry;
    user.resetOtpRequestedAt = Date.now();
    await user.save();

    try {
        await sendResetPasswordOTP(email, rawOTP);
    } catch (error) {
        console.error("Email sending error:", error);
        throw new ApiError(500, "Something went wrong while sending email.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "OTP sent successfully.")
        )
})


export const resetPassword = asyncHandler(async (req, res) => {
    // resetOtp ko otp kar diya taaki frontend se match kare
    const { email, otp, password, confirmPassword } = req.body;

    // Validation update
    if (!email || !otp || !password || !confirmPassword) {
        throw new ApiError(400, "All fields are required.");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match.");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(404, "User not found.");

    // Compare checking with the same name
    const isOTPValid = await bcryptjs.compare(String(otp), user.resetOtp);

    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP.");
    }

    // Expiry check (Dates compare karne ke liye new Date use karein)
    if (new Date(user.resetOtpExpires) < new Date()) {
        throw new ApiError(400, "OTP has expired.");
    }

    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successful."));
});