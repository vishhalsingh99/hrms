// utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Reusable function to send email with OTP
 */
const sendEmail = async ({ email, subject, title, otp, color, message }) => {
    const mailOptions = {
        from: `"HRMS Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #1f2937;">${title}</h2>
                <p style="color: #4b5563; font-size: 16px;">${message}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h1 style="letter-spacing: 10px; color: ${color}; font-size: 42px; margin: 0; font-weight: bold;">
                        ${otp}
                    </h1>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px;">
                    <strong>Note:</strong> This OTP is valid for only 10 minutes.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send email", { cause: error });
    }
};

// Generate 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Email Verification OTP
export const sendVerificationOTP = async (email, otp) => {
    return await sendEmail({
        email,
        otp,
        subject: "Verify Your HRMS Account",
        title: "Email Verification",
        message: "Welcome! Please use the OTP below to verify your account:",
        color: "#4F46E5"   // Blue
    });
};

// Send Password Reset OTP
export const sendResetPasswordOTP = async (email, otp) => {
    return await sendEmail({
        email,
        otp,
        subject: "Reset Your Password - HRMS",
        title: "Password Reset Request",
        message: "We received a request to reset your password. Here is your OTP:",
        color: "#DC2626"   // Red
    });
};

// Default export
export default {
    generateOTP,
    sendVerificationOTP,
    sendResetPasswordOTP
};