import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized: No token found"));
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findByPk(decodedToken?.id, {
            attributes: { exclude: ["password", "refreshToken"] }
        });

        if (!user) {
            return next(new ApiError(401, "Invalid token: User not found"));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(
            new ApiError(401, error?.message || "Invalid access token")
        );
    }
};