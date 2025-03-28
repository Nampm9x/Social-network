import express from "express";
import { getPostsAndEvents } from "../controllers/profile.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.get("/get-posts-and-events/:id", verifyToken, getPostsAndEvents);

export default router;
