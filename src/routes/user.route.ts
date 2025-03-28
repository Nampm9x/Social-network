import express from "express";
import {
    editProfile,
    getUser,
    followUser,
    searchUsers,
    getUsers,
    searchUsersToSendMessage,
    getUserById,
    changeCoverPhoto,
    getCurrentUser,
    whoToFollow,
    checkExistsUsername,
    changePassword,
    resetPassword,
} from "../controllers/user.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.get("/get-user/:username", verifyToken, getUser);
router.get("/get-user-by-id/:id", verifyToken, getUserById);
router.put("/edit-profile", verifyToken, editProfile);
router.post("/follow-user/:id", verifyToken, followUser);
router.get("/search-users/:query", verifyToken, searchUsers);
router.get("/get-users", verifyToken, getUsers);
router.get(
    "/search-users-to-send-message/:query",
    verifyToken,
    searchUsersToSendMessage
);
router.put(`/change-cover-photo`, verifyToken, changeCoverPhoto);
router.get("/get-current-user", verifyToken, getCurrentUser);
router.get("/who-to-follow", verifyToken, whoToFollow);
router.get(
    "/check-exists-username/:username",
    verifyToken,
    checkExistsUsername
);
router.put("/change-password", verifyToken, changePassword);
router.put("/reset-password", resetPassword);

export default router;
