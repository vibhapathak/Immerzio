import { Router } from "express";
import multer from "multer";
import { getUserInfo, updateProfile, addProfileImage, removeProfileImage, signup, login, logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"),addProfileImage);
authRoutes.post("/logout", logout);

authRoutes.delete("/remove-profile-image", verifyToken, (req, res, next) => {
    console.log(req.body); // Log request body
    console.log(req.file);  // Log file to see if it's undefined
    next(); // Proceed to the next middleware
}, removeProfileImage);

export default authRoutes;
