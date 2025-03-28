import express from 'express';
import { createComment, getComments, getReplyComments, likeComment } from '../controllers/postcomment.controller';
import verifyToken from '../utils/verifyUser';

const router = express.Router();

router.post('/create/:postid', verifyToken, createComment);
router.get('/get-comment/:postid', verifyToken, getComments);
router.get('/get-replycomments/:commentid', verifyToken, getReplyComments);
router.post('/like-comment/:commentid', verifyToken, likeComment);

export default router;