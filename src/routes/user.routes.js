import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 }, // both name avatar and coverImage is received from the frontend, thus should be same names
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);

//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.get("/c/:username", verifyJWT, getUserChannelProfile);
router.get("/history", verifyJWT, getWatchHistory);

export default router;
