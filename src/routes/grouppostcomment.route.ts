import express from 'express';
import verifyToken from '../utils/verifyUser';
import { createGroupPostComment, getComments, getReplyComments, likeComment } from '../controllers/grouppostcomment.controller';

const router = express.Router();

router.post("/create/:postid", verifyToken, createGroupPostComment);
router.get("/get-comment/:postid", verifyToken, getComments);
router.get("/get-replycomments/:commentid", verifyToken, getReplyComments);
router.post("/like-comment/:commentid", verifyToken, likeComment);

export default router;