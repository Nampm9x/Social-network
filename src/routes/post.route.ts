import express from "express";
import {
    createPost,
    getPosts,
    likePost,
    searchPosts,
    getPost,
    viewedPost,
    deletePost,
    editPost,
} from "../controllers/post.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.post("/create-post", verifyToken, createPost);
router.get("/get-posts/:owner", verifyToken, getPosts);
router.post("/like-post/:postid", verifyToken, likePost);
router.get("/search-posts/:query", verifyToken, searchPosts);
router.get("/get-post/:postid", verifyToken, getPost);
router.post("/viewed-post/:postid", verifyToken, viewedPost);
router.delete("/delete-post/:postid", verifyToken, deletePost);
router.put("/edit-post", verifyToken, editPost);

export default router;
