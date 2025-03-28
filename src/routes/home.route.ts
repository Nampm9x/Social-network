import express from "express"
import { getPostsAndEvents } from "../controllers/home.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.get("/get-posts-and-events", verifyToken, getPostsAndEvents);

export default router;