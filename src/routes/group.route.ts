import express from "express";
import {
    acceptGroupMember,
    cancelPendingMember,
    createGroup,
    deleteGroup,
    editGroup,
    getGroup,
    getGroupsJoined,
    getGroupSuggestions,
    getYourGroups,
    getYourPendingGroups,
    joinGroup,
    leaveGroup,
    searchGroups,
} from "../controllers/group.controller";
import verifyToken from "../utils/verifyUser";

const router = express.Router();

router.post("/create-group", verifyToken, createGroup);
router.get("/get-group/:groupid", verifyToken, getGroup);
router.get("/get-your-groups", verifyToken, getYourGroups);
router.get("/get-groups-joined", verifyToken, getGroupsJoined);
router.get("/get-your-pending-groups", verifyToken, getYourPendingGroups);
router.get("/search-groups", verifyToken, searchGroups);
router.put("/join-group/:groupid", verifyToken, joinGroup);
router.put(
    "/accept-group-member/:groupid/:userid",
    verifyToken,
    acceptGroupMember
);
router.put("/leave-group/:groupid/:userid", verifyToken, leaveGroup);
router.put(
    "/cancel-pending-member/:groupid/:userid",
    verifyToken,
    cancelPendingMember
);
router.delete("/delete-group/:groupid", verifyToken, deleteGroup);
router.put("/edit-group/:groupid", verifyToken, editGroup);
router.get("/get-group-suggestions", verifyToken, getGroupSuggestions);

export default router;
