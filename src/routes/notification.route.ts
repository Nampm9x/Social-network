import express from "express";
import { deleteAllNotifications, getNotifications, readAllNotifications, readNotification } from "../controllers/notification.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.get("/get-notifications", verifyToken, getNotifications);
router.put("/mark-read/:id", verifyToken, readNotification);
router.patch("/mark-read-all", verifyToken, readAllNotifications);
router.patch("/delete-all-notifications", verifyToken, deleteAllNotifications);

export default router;