import express from "express";
import {
    createConversation,
    getConversationById,
    getConversationByUsername,
    getConversations,
    updateConversation,
    readConversation,
    archiveConversation,
    getArchivedConversations,
    unarchiveConversation,
    deleteConversation,
    leaveGroup,
    searchConversations,
} from "../controllers/conversation.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.post("/create-conversation", verifyToken, createConversation);
router.get("/get-conversations", verifyToken, verifyToken, getConversations);
router.get("/get-archivedconversations", verifyToken, getArchivedConversations);
router.get(
    "/get-conversationbyusername/:id1/:id2",
    verifyToken,
    getConversationByUsername
);
router.get(
    "/get-conversationbyid/:conversationid",
    verifyToken,
    getConversationById
);
router.put(
    "/update-conversation/:conversationid",
    verifyToken,
    updateConversation
);
router.put("/read-conversation/:conversationid", verifyToken, readConversation);
router.put(
    "/archive-conversation/:conversationid",
    verifyToken,
    archiveConversation
);
router.put(
    "/unarchive-conversation/:conversationid",
    verifyToken,
    unarchiveConversation
);
router.put(
    "/delete-conversation/:conversationid",
    verifyToken,
    deleteConversation
);
router.put("/leave-group/:conversationid/:userid", verifyToken, leaveGroup);
router.get("/search-conversations/:search", verifyToken, searchConversations);

export default router;
