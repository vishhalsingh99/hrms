import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.js";


export const profileUpdate = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { phoneNumber, address, city, state, district, pincode } = req.body;

    if ([phoneNumber, address, city, state, district, pincode]
        .some((field) => !field || String(field).trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

await User.update(
    { phoneNumber, address, city, state, district, pincode },
    { where: { id: userId } }
);

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});