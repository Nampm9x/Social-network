import PostComment from "../models/postcomment.model";
import { Response, NextFunction } from "express";
import { errorHandler } from "../utils/error";
import { createNotification } from "./notification.controller";
import User from "../models/user.model";
import { CustomRequest } from "../utils/verifyUser";

export const createComment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    const { comment, replyingTo } = req.body;

    try {
        const postComment = new PostComment({
            postId: postid,
            owner: userVerified?._id,
            comment,
            replyingTo,
        });

        await postComment.save();

        const populatedPostComment = await PostComment.findById(
            postComment._id
        ).populate("owner", "name username profilePicture _id");

        if (replyingTo) {
            createNotification(
                userVerified?._id || "",
                postComment.owner.toString(),
                `${userVerified?.name} replied to your comment`,
                "comment",
                `/posts/${postid}`,
                req
            );
        } else {
            createNotification(
                userVerified?._id || "",
                postComment.owner.toString(),
                `${userVerified?.name} commented on your post`,
                "comment",
                `/posts/${postid}`,
                req
            );
        }

        res.status(201).json(populatedPostComment);
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
        const comments = await PostComment.find({ postId: postid })
            .sort({ createdAt: -1 })
            .populate("owner", "name username profilePicture _id");

        if (!comments) {
            return next(errorHandler(404, "No comments found"));
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
        const replyComments = await PostComment.find({ replyingTo: commentid })
            .sort({ createdAt: -1 })
            .populate("owner", "name username profilePicture _id");

        if (!replyComments) {
            return next(errorHandler(404, "No reply comments found"));
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
        const postComment = await PostComment.findById(commentid);

        if (!postComment) {
            return next(errorHandler(404, "Post's comment not found"));
        }
        const userIndex = postComment.likes.indexOf(userVerified?._id);

        if (userIndex === -1) {
            postComment.likes.push(userVerified?._id);

            createNotification(
                userVerified?._id || "",
                postComment.owner.toString(),
                `${userVerified?.name} liked your comment`,
                "comment",
                `/posts/${postComment.postId}`,
                req
            );
        } else {
            postComment.likes.splice(userIndex, 1);
        }
        await postComment.save();

        res.status(200).json(postComment.likes);
    } catch (error) {
        next(error);
    }
};
