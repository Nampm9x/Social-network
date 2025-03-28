import EventComment from "../models/eventcomment.model";
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
    const { eventid } = req.params;
    const userVerified = req.user;
    const { comment, replyingTo } = req.body;

    try {
        const eventComment = new EventComment({
            eventId: eventid,
            comment,
            replyingTo,
            owner: userVerified?._id,
        });

        await eventComment.save();
        const populateComment = await EventComment.findById(
            eventComment._id
        ).populate("owner", "name username profilePicture _id");

        if (replyingTo) {
            createNotification(
                userVerified?._id || "",
                eventComment.owner.toString(),
                `${userVerified?.name} replied to your comment`,
                "comment",
                `/events/${eventid}`,
                req
            );
        } else {
            createNotification(
                userVerified?._id || "",
                eventComment.owner.toString(),
                `${userVerified?.name} commented on your event`,
                "comment",
                `/events/${eventid}`,
                req
            );
        }

        res.status(201).json(populateComment);
    } catch (error) {
        next(error);
    }
};

export const getComments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;

    try {
        const comments = await EventComment.find({ eventId: eventid })
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
        const replyComments = await EventComment.find({ replyingTo: commentid })
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
        const eventComment = await EventComment.findById(commentid);

        if (!eventComment) {
            return next(errorHandler(404, "Event's comment not found"));
        }
        const userIndex = eventComment.likes.indexOf(userVerified?._id);

        if (userIndex === -1) {
            eventComment.likes.push(userVerified?._id);
            createNotification(
                userVerified?._id || "",
                eventComment.owner.toString(),
                `${userVerified?.name} liked your comment`,
                "like",
                `/events/${eventComment.eventId}`,
                req
            );
        } else {
            eventComment.likes.splice(userIndex, 1);
        }
        await eventComment.save();

        res.status(200).json(eventComment.likes);
    } catch (error) {
        next(error);
    }
};
