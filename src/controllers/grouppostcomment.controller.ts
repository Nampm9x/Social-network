import { NextFunction, Response } from "express";
import GroupPostComment from "../models/grouppostcomment.model";
import User from "../models/user.model";
import { createNotification } from "./notification.controller";
import { errorHandler } from "../utils/error";
import { CustomRequest } from "../utils/verifyUser";

export const createGroupPostComment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    const { comment, replyingTo } = req.body;
    try {
        const groupPostComment = new GroupPostComment({
            groupPostId: postid,
            owner: userVerified?._id,
            comment,
            replyingTo,
        });
        await groupPostComment.save();

        const populatedGGrouppostComment = await GroupPostComment.findById(
            groupPostComment._id
        ).populate("owner", "name username profilePicture _id");

        if (replyingTo) {
            createNotification(
                userVerified?._id || "",
                groupPostComment.owner.toString(),
                `${userVerified?.name} replied to your comment`,
                "comment",
                `/groups/${postid}`,
                req
            );
        } else {
            createNotification(
                userVerified?._id || "",
                groupPostComment.owner.toString(),
                `${userVerified?.name} commented on your post`,
                "comment",
                `/groups/${postid}`,
                req
            );
        }

        res.status(201).json(populatedGGrouppostComment);
    } catch (error) {
        next(error);
    }
};

export const getComments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    try {
        const comments = await GroupPostComment.find({ groupPostId: postid })
            .populate("owner", "name username profilePicture _id")
            .sort({ createdAt: 1 });

        if (!comments) {
            return next(errorHandler(404, "Comments not found"));
        }

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};

export const getReplyComments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { commentid } = req.params;
    try {
        const replyComments = await GroupPostComment.find({
            replyingTo: commentid,
        })
            .populate("owner", "name username profilePicture _id")
            .sort({ createdAt: 1 });

        if (!replyComments) {
            return next(errorHandler(404, "Comments not found"));
        }

        res.status(200).json(replyComments);
    } catch (error) {
        next(error);
    }
};

export const likeComment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { commentid } = req.params;
    const userVerified = req.user;
    try {
        const groupPostComment = await GroupPostComment.findById(commentid);

        if (!groupPostComment) {
            return next(errorHandler(404, "Comment not found"));
        }

        const userIndex = groupPostComment.likes.indexOf(userVerified?._id);
        const user = await User.findById(userVerified?._id);
        if (userIndex === -1) {
            groupPostComment.likes.push(userVerified?._id);
            if (user) {
                createNotification(
                    userVerified?._id || "",
                    groupPostComment.owner.toString(),
                    `${user.name} liked your comment`,
                    "like",
                    `/groups/${groupPostComment.groupPostId}`,
                    req
                );
            }
        } else {
            groupPostComment.likes.splice(userIndex, 1);
        }
        await groupPostComment.save();
        res.status(200).json(groupPostComment.likes);
    } catch (error) {
        next(error);
    }
};
