import express from "express";
import {
    createEvent,
    getEvents,
    followEvent,
    likeEvent,
    searchEvents,
    getEvent,
    editEvent,
    viewedEvent,
    test,
    deleteEvent,
} from "../controllers/event.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.post("/create-event", verifyToken, createEvent);
router.get("/get-events/:owner", verifyToken, getEvents);
router.post("/follow-event/:eventid", verifyToken, followEvent);
router.post("/like-event/:eventid", verifyToken, likeEvent);
router.get("/search-events/:query/:currentid", verifyToken, searchEvents);
router.get("/get-event/:eventid", verifyToken, getEvent);
router.put("/edit-event/:eventid", verifyToken, editEvent);
router.post("/viewed-event/:eventid", verifyToken, viewedEvent);
router.delete("/delete-event/:eventid", verifyToken, deleteEvent);
router.get("/test", test);

export default router;
