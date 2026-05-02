import { Router } from "express";
import { updateProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";



const router = Router();


router.route("/update-profile")
    .post(authMiddleware, updateProfile);

    export default router;