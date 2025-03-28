import { NextFunction, Response } from "express";
import { errorHandler } from "../utils/error";
import Group from "../models/group.model";
import removeAccents from "remove-accents";
import { createNotification } from "./notification.controller";
import User from "../models/user.model";
import GroupPost from "../models/grouppost.model";
import GroupPostComment from "../models/grouppostcomment.model";
import { CustomRequest } from "../utils/verifyUser";
import mongoose from "mongoose";

export const createGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { data } = req.body;
    const { name, description, groupPicture, groupVisibility } = data;

    const userVerified = req.user;

    if (!name) {
        return next(errorHandler(400, "Name is required"));
    }

    const group = new Group({
        name,
        description,
        owner: userVerified?._id,
        groupPicture,
        groupVisibility,
        members: [userVerified?._id],
        nameWithoutAccents: removeAccents(name || ""),
    });

    try {
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        next(error);
    }
};

export const getGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;
    const userVerified = req.user;

    try {
        let group = await Group.findOne({ _id: groupid })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "pendingMembers",
                select: "name profilePicture username _id",
            });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};

export const getYourGroups = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;

    try {
        const groups = await Group.find({
            owner: userVerified?._id,
        })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            });
        if (!groups) {
            return next(errorHandler(404, "Groups not found"));
        }
        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

export const getGroupsJoined = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;

    try {
        const groups = await Group.find({
            members: userVerified?._id,
            owner: { $ne: userVerified?._id },
        })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            });
        if (!groups) {
            return next(errorHandler(404, "Groups not found"));
        }
        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

export const getYourPendingGroups = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;

    try {
        const groups = await Group.find({
            pendingMembers: userVerified?._id,
            owner: { $ne: userVerified?._id },
        })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            });
        if (!groups) {
            return next(errorHandler(404, "Groups not found"));
        }
        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

export const searchGroups = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { search } = req.query;
    if (!search || typeof search !== "string" || search.trim() === "") {
        return next(errorHandler(400, "Search is required"));
    }

    try {
        // Lấy thông tin người dùng và danh sách bạn bè, followers, following
        const user = await User.findById(req.user?._id)
            .populate("friends", "_id")
            .populate("following", "_id")
            .populate("followers", "_id");

        if (!user) throw new Error("User not found");

        const friends = user.friends.map((friend) => friend._id);
        const following = user.following.map((follow) => follow._id);
        const followers = user.followers.map((follower) => follower._id);

        const relatedUsers = [
            ...new Set([...friends, ...following, ...followers]),
        ];

        // Tìm nhóm có tên khớp với tìm kiếm và tính toán thông tin bổ sung
        const groups = await Group.aggregate([
            {
                $match: {
                    nameWithoutAccents: {
                        $regex: removeAccents(search),
                        $options: "i",
                    },
                },
            },
            {
                $addFields: {
                    friendCount: {
                        $size: {
                            $setIntersection: ["$members", friends],
                        },
                    },
                    relatedUserCount: {
                        $size: {
                            $setIntersection: ["$members", relatedUsers],
                        },
                    },
                    membersCount: { $size: "$members" }, // Tổng số thành viên
                },
            },
            {
                $sort: { friendCount: -1, relatedUserCount: -1, createdAt: -1 },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                },
            },
            {
                $unwind: "$ownerDetails",
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    groupPicture: 1,
                    friendCount: 1,
                    relatedUserCount: 1,
                    membersCount: 1,
                    owner: {
                        _id: "$ownerDetails._id",
                        name: "$ownerDetails.name",
                        username: "$ownerDetails.username",
                        profilePicture: "$ownerDetails.profilePicture",
                    },
                },
            },
        ]);

        if (!groups.length) {
            return next(errorHandler(404, "Groups not found"));
        }

        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

export const joinGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;

    const userVerified = req.user;

    try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }

        if (group.members.includes(userVerified?._id as any)) {
            return next(errorHandler(400, "User is already a member"));
        }
        if (group.pendingMembers.includes(userVerified?._id as any)) {
            group.pendingMembers = group.pendingMembers.filter(
                (member) => member.toString() !== userVerified?._id
            );
        } else {
            group.pendingMembers.push(userVerified?._id as any);
            createNotification(
                userVerified?._id || "",
                group.owner.toString(),
                `${userVerified?.name} wants to join your group ${group.name}`,
                "group",
                `/groups/${groupid}`,
                req
            );
        }
        await group.save();
        const populatedGroup = await Group.findOne({ _id: groupid })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "pendingMembers",
                select: "name profilePicture username _id",
            });
        res.status(200).json(populatedGroup);
    } catch (error) {
        next(error);
    }
};

export const acceptGroupMember = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid, userid } = req.params;

    try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        const user = await User.findById(userid);
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }
        if (group.members.includes(userid as any)) {
            return next(errorHandler(400, "User is already a member"));
        }
        group.members.push(userid as any);
        group.pendingMembers = group.pendingMembers.filter(
            (member) => member.toString() !== userid
        );
        createNotification(
            group.owner.toString(),
            userid,
            `You are now a member of ${group.name}`,
            "group",
            `/groups/${groupid}`,
            req
        );
        await group.save();
        const populatedGroup = await Group.findOne({ _id: groupid })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "pendingMembers",
                select: "name profilePicture username _id",
            });
        res.status(200).json(populatedGroup);
    } catch (error) {
        next(error);
    }
};

export const leaveGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid, userid } = req.params;

    try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        if (group.owner.toString() === userid) {
            return next(errorHandler(400, "Owner can't leave the group"));
        }
        group.members = group.members.filter(
            (member) => member.toString() !== userid
        );
        await group.save();
        res.status(200).json({ message: "User left the group" });
    } catch (error) {
        next(error);
    }
};

export const cancelPendingMember = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid, userid } = req.params;

    try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        group.pendingMembers = group.pendingMembers.filter(
            (member) => member.toString() !== userid
        );
        await group.save();
        res.status(200).json({ message: "User canceled the request" });
    } catch (error) {
        next(error);
    }
};

export const deleteGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;

    const userVerified = req.user;

    try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        if (group.owner.toString() !== userVerified?._id) {
            return next(errorHandler(401, "User is not the owner"));
        }
        await group.deleteOne();
        await GroupPost.deleteMany({ group: groupid });
        res.status(200).json({ message: "Group deleted" });
    } catch (error) {
        next(error);
    }
};

export const editGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;
    const userVerified = req.user;
    const { name, description, groupPicture, groupVisibility } = req.body;
    try {
        const group = await Group.findById(groupid);
        if (!group) {
            return next(errorHandler(404, "Group not found "));
        }
        if (group.owner.toString() !== userVerified?._id) {
            return next(errorHandler(401, "User is not the owner"));
        }
        group.name = name;
        group.description = description;
        group.groupPicture = groupPicture;
        group.groupVisibility = groupVisibility;
        (group.nameWithoutAccents = removeAccents(name || "")),
            await group.save();

        const populatedGroup = await Group.findById(groupid)
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "members",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "pendingMembers",
                select: "name profilePicture username _id",
            });

        res.status(200).json(populatedGroup);
    } catch (error) {
        next(error);
    }
};

export const getGroupSuggestions = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const limit = 10;
    const userVerified = req.user;
    try {
        // Lấy thông tin người dùng và danh sách bạn bè, followers, following
        const user = await User.findById(userVerified?._id)
            .populate("friends", "_id")
            .populate("following", "_id")
            .populate("followers", "_id");

        if (!user) throw new Error("User not found");

        const friends = user.friends.map((friend) => friend._id);
        const following = user.following.map((follow) => follow._id);
        const followers = user.followers.map((follower) => follower._id);

        // Tạo một danh sách những người liên quan
        const relatedUsers = [
            ...new Set([...friends, ...following, ...followers]),
        ];

        // Tìm các nhóm gợi ý
        const suggestions = await Group.aggregate([
            {
                $match: {
                    pendingMembers: {
                        $nin: [new mongoose.Types.ObjectId(userVerified?._id)],
                    },
                    members: {
                        $nin: [new mongoose.Types.ObjectId(userVerified?._id)],
                    }, // Người dùng chưa tham gia nhóm
                },
            },
            {
                $addFields: {
                    friendCount: {
                        $size: {
                            $setIntersection: ["$members", friends], // Đếm số lượng bạn bè trong nhóm
                        },
                    },
                    relatedUserCount: {
                        $size: {
                            $setIntersection: ["$members", relatedUsers], // Đếm số lượng người liên quan trong nhóm
                        },
                    },
                },
            },
            {
                $sort: { friendCount: -1, relatedUserCount: -1, createdAt: -1 }, // Sắp xếp ưu tiên theo bạn bè, người liên quan, và ngày tạo
            },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    description: 1,
                    groupPicture: 1,
                    friendCount: 1,
                    relatedUserCount: 1,
                    membersCount: { $size: "$members" }, // Tổng số thành viên
                },
            },
        ]);

        res.status(200).json(suggestions);
    } catch (error) {
        next(error);
    }
};
