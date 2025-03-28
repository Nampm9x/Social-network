import express from "express";
import {
    createMessage,
    getMedia,
    getMessages,
    readMessage,
} from "../controllers/message.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.post("/create-message", verifyToken, createMessage);
router.get("/get-messages/:conversationid", verifyToken, getMessages);
router.put("/read-message/:conversationid", verifyToken, readMessage);
router.get("/get-media/:conversationid", verifyToken, getMedia);

export default router;
