import express from 'express';
import authRoutes from './auth.route';
import mailerRoutes from './mailer.route';
import postRoutes from './post.route';
import userRoutes from './user.route';
import eventRoutes from './event.route';
import eventcommentRoutes from './eventcomment.route';
import postcommentRoutes from './postcomment.route';
import conversationRoutes from './conversation.route';
import messageRoutes from './message.route';
import homeRoutes from './home.route';
import profileRoutes from './profile.route';
import notificationRoutes from './notification.route';
import groupRoutes from './group.route';
import groupPostRoutes from './grouppost.route';
import groupPostCommentRoutes from './grouppostcomment.route';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/mailer', mailerRoutes);
router.use('/post', postRoutes);
router.use('/user', userRoutes);
router.use('/event', eventRoutes);
router.use('/eventcomment', eventcommentRoutes);
router.use('/postcomment', postcommentRoutes);
router.use('/conversation', conversationRoutes);
router.use('/message', messageRoutes);
router.use("/home", homeRoutes);
router.use("/profile", profileRoutes);
router.use("/notification", notificationRoutes);
router.use("/group", groupRoutes);
router.use("/grouppost", groupPostRoutes);
router.use("/grouppostcomment", groupPostCommentRoutes);

export default router;