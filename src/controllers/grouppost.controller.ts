import GroupPost from "../models/grouppost.model";
import { NextFunction, Response } from "express";
import { errorHandler } from "../utils/error";
import removeAccents from "remove-accents";
import { createNotification } from "./notification.controller";
import User from "../models/user.model";
import Group from "../models/group.model";
import { CustomRequest } from "../utils/verifyUser";

export const createGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { content, group, images } = req.body;
    let status: string = "pending";
    const userVerified = req.user;

    if (!content && !group) {
        return next(errorHandler(400, "Content or group is required"));
    }

    try {
        const groupFind = await Group.findOne({ _id: group });
        if (groupFind && groupFind.owner.toString() === userVerified?._id) {
            status = "approved";
        }

        const groupPost = new GroupPost({
            content,
            group,
            owner: userVerified?._id,
            contentWithoutAccents: removeAccents(content || ""),
            images,
            status,
        });
        await groupPost.save();
        const populatedGroupPost = await GroupPost.findById(groupPost._id)
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });
        res.status(201).json(populatedGroupPost);
    } catch (error) {
        next(error);
    }
};

export const getGroupPosts = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;

    const userVerified = req.user;

    try {
        const group = await Group.findOne({
            _id: groupid,
        })
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

        if (
            group.groupVisibility === "private" &&
            group.owner.toString() !== userVerified?._id
        ) {
            if (
                !group.members.find(
                    (member) => member._id.toString() === userVerified?._id
                )
            ) {
                return next(
                    errorHandler(401, "You are not a member of this group")
                );
            }
        }

        const groupPosts = await GroupPost.find({
            group: groupid,
            status: "approved",
        })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });

        res.status(200).json(groupPosts);
    } catch (error) {
        next(error);
    }
};

export const getGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid, postid } = req.params;
    const userVerified = req.user;
    if (!userVerified) {
        return next(errorHandler(401, "Unauthorized"));
    }
    try {
        const group = await Group.findOne({
            _id: groupid,
        });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        if (
            group.groupVisibility === "private" &&
            group.members.findIndex((member) =>
                member.equals(userVerified._id)
            ) === -1
        ) {
            return next(
                errorHandler(401, "You are not a member of this group")
            );
        }
        const groupPost = await GroupPost.findById(postid)
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });
        if (!groupPost) {
            return next(errorHandler(404, "Post not found"));
        }
        res.status(200).json(groupPost);
    } catch (error) {
        next(error);
    }
};

export const likeGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    try {
        const groupPost = await GroupPost.findById(postid).populate({
            path: "group",
            select: "name groupPicture _id",
        });
        if (!groupPost) {
            return next(errorHandler(404, "Post not found"));
        }

        const user = await User.findOne({ _id: userVerified?._id });
        const userIndex = groupPost.likes.indexOf(userVerified?._id);
        if (userIndex === -1) {
            groupPost.likes.push(userVerified?._id);
            createNotification(
                userVerified?._id || "",
                groupPost.owner.toString(),
                `${user?.name} liked your post`,
                "grouppost",
                `/groups/${groupPost.group._id}/posts/${postid}`,
                req
            );
        } else {
            groupPost.likes.splice(userIndex, 1);
        }
        await groupPost.save();
        res.status(200).json(groupPost.likes);
    } catch (error) {
        next(error);
    }
};

export const getPendingPosts = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;
    const userVerified = req.user;
    try {
        const group = await Group.findOne({
            _id: groupid,
            owner: userVerified?._id,
        });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        const groupPendingPosts = await GroupPost.find({
            group: groupid,
            status: "pending",
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });
        res.status(200).json(groupPendingPosts);
    } catch (error) {
        next(error);
    }
};

export const getYourPendingPosts = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { groupid } = req.params;
    const userVerified = req.user;
    try {
        const group = await Group.findById(groupid);
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        const yourPendingPosts = await GroupPost.find({
            group: groupid,
            status: "pending",
            owner: userVerified?._id,
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });
        res.status(200).json(yourPendingPosts);
    } catch (error) {
        next(error);
    }
};

export const approveGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid, groupid } = req.params;
    const userVerified = req.user;
    try {
        const group = await Group.findOne({
            _id: groupid,
            owner: userVerified?._id,
        });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        const groupPost = await GroupPost.findOne({
            _id: postid,
            group: groupid,
            status: "pending",
        });
        if (!groupPost) {
            return next(errorHandler(404, "Post not found"));
        }
        groupPost.status = "approved";
        await groupPost.save();
        createNotification(
            group.owner.toString(),
            groupPost.owner.toString(),
            `Your post has been approved.`,
            `group`,
            `/groups/${group._id}/posts/${groupPost._id}`,
            req
        );

        const groupPostApprevedPopulated = await GroupPost.findById(postid)
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            });

        res.status(200).json(groupPostApprevedPopulated);
    } catch (error) {
        next(error);
    }
};

export const rejectGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid, groupid } = req.params;
    const userVerified = req.user;

    try {
        const group = await Group.findOne({
            _id: groupid,
            owner: userVerified?._id,
        });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }

        const groupPost = await GroupPost.findOne({
            _id: postid,
            status: "pending",
            group: groupid,
        });
        if (!groupPost) {
            return next(errorHandler(404, "Post not found"));
        }
        groupPost.status = "rejected";
        await groupPost.save();
        createNotification(
            group.owner.toString(),
            groupPost.owner.toString(),
            `Your post has been rejected`,
            `group`,
            `/groups/${group._id}/post-rejected/${groupPost._id}`,
            req
        );
        res.status(200).json({ message: "Post has been rejected" });
    } catch (error) {
        next(error);
    }
};

export const getGroupPostsForFeed = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = parseInt(req.query.skip as string) || 0;
    const userVerified = req.user;

    try {
        // Lấy thông tin người dùng
        const user = await User.findById(userVerified?._id);
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        // Lấy danh sách nhóm mà người dùng tham gia
        const groups = await Group.find({ members: user._id }).select("_id");
        if (!groups.length) {
            return next(errorHandler(404, "Groups not found"));
        }

        // Lấy tất cả bài đăng từ các nhóm
        const groupIds = groups.map((group) => group._id);
        const groupPosts = await GroupPost.find({
            group: { $in: groupIds },
            status: "approved",
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            })
            .skip(skip)
            .limit(limit + 1); // Lấy thêm một bài để xác định `hasMore`

        // Xác định `hasMore`
        const hasMore = groupPosts.length > limit;

        res.status(200).json({
            groupPosts: hasMore ? groupPosts.slice(0, limit) : groupPosts,
            hasMore,
        });
    } catch (error) {
        console.error("Error in getGroupPostsForFeed:", error);
        next(error);
    }
};

export const deleteGroupPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    try {
        const post = await GroupPost.findOne({ _id: postid });

        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }
        const group = await Group.findOne({ _id: post.group });
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        if (
            group.owner.toString() !== userVerified?._id &&
            post.owner.toString() !== userVerified?._id
        ) {
            return next(
                errorHandler(401, "You are not authorized to delete this post")
            );
        }
        await post.deleteOne();
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        next(error);
    }
};
