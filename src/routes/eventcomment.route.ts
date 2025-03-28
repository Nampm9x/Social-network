import express from 'express';
import { createComment, getComments, getReplyComments, likeComment } from '../controllers/eventcomment.controller';
import verifyToken from '../utils/verifyUser';

const router = express.Router();

router.post('/create/:eventid', verifyToken, createComment);
router.get('/get-comment/:eventid', verifyToken, getComments);
router.get('/get-replycomments/:commentid', verifyToken, getReplyComments);
router.post('/like-comment/:commentid', verifyToken, likeComment);

export default router;