import express from "express";
import verifyToken from "../utils/verifyUser";
import {
    approveGroupPost,
    createGroupPost,
    deleteGroupPost,
    getGroupPost,
    getGroupPosts,
    getGroupPostsForFeed,
    getPendingPosts,
    getYourPendingPosts,
    likeGroupPost,
    rejectGroupPost,
} from "../controllers/grouppost.controller";

const router = express.Router();

router.post("/create-group-post", verifyToken, createGroupPost);
router.get("/get-group-posts/:groupid", verifyToken, getGroupPosts);
router.get("/get-group-post/:groupid/:postid", verifyToken, getGroupPost);
router.put("/like-group-post/:postid", verifyToken, likeGroupPost);
router.get("/get-pending-posts/:groupid", verifyToken, getPendingPosts);
router.put(
    "/approve-group-post/:postid/:groupid",
    verifyToken,
    approveGroupPost
);
router.get(
    "/get-group-posts-for-feed",
    verifyToken,
    getGroupPostsForFeed
);
router.delete(
    "/delete-group-post/:postid",
    verifyToken,
    deleteGroupPost
);
router.get(
    "/get-your-pending-posts/:groupid",
    verifyToken,
    getYourPendingPosts
);
router.put(
    "/reject-group-post/:postid/:groupid",
    verifyToken,
    rejectGroupPost
);

export default router;
