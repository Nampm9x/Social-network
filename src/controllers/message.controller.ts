import { Response, NextFunction } from "express";
import Message from "../models/message.model";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import { createNotification } from "./notification.controller";
import validator from "validator";
import Conversation from "../models/conversation.model";
import { CustomRequest } from "../utils/verifyUser";

export const createMessage = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    let { conversationId, text, replyTo, members, type } = req.body;
    const userVerified = req.user;
    let typeToSave = type || "message";

    if (validator.isURL(text, { require_valid_protocol: true })) {
        if (typeToSave === "image") {
            typeToSave = "image";
        } else if (typeToSave === "video") {
            typeToSave = "video";
        } else if (!typeToSave || typeToSave === "message") {
            typeToSave = "link";
        }
    }

    const newMessage = new Message({
        conversationId,
        sender: userVerified?._id,
        text,
        replyTo,
        members,
        type: typeToSave,
    });

    try {
        const savedMessage = await newMessage.save();

        const populatedMessage = await Message.findById(savedMessage._id)
            .populate({
                path: "sender",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "replyTo.id",
                select: "name profilePicture username _id",
            });

        const conversation = await Conversation.findById(conversationId)
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "archives",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "deleted",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });

        const io = req.app.get("socketio");
        io.emit("message", { populatedMessage, conversation });

        res.status(201).json(populatedMessage);

        // Thực hiện các tác vụ không ảnh hưởng đến phản hồi
        await createNotification(
            userVerified?._id || "",
            members.map((member: any) => member._id),
            `${userVerified?.name} sent you a message`,
            "message",
            `/messages/${conversationId}`,
            req
        );
    } catch (err) {
        if (!res.headersSent) {
            next(err); // Chỉ gọi next nếu headers chưa được gửi
        }
    }
};

export const getMessages = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;

    try {
        const messages = await Message.find({
            conversationId: conversationid,
            deleted: { $ne: userVerified?._id },
            members: { $in: userVerified?._id },
        })
            .sort({ createdAt: 1 })
            .populate({
                path: "sender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "replyTo.id",
                select: "name username profilePicture _id",
            });
            
        res.status(200).json(messages);
    } catch (err) {
        next(err);
    }
};

export const readMessage = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    try {
        const messagesUnread = await Message.find({
            conversationId: conversationid,
            "sender.id": { $ne: userVerified?._id },
            read: { $ne: userVerified?._id },
        });
        messagesUnread.forEach(async (message) => {
            message.read.push(userVerified?._id);
            await message.save();
        });

        res.status(200).json("OK");
    } catch (error) {
        next(error);
    }
};

export const getMedia = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;
    try {
        const media = await Message.find({
            conversationId: conversationid,
            type: { $in: ["photo", "video"] },
            deleted: { $ne: userVerified?._id },
            members: { $in: userVerified?._id },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
            path: "sender",
            select: "username name profilePicture _id"
        })

        res.status(200).json({
            media,
            hasMore: media.length > skip + limit,
        });
    } catch (err) {
        next(err);
    }
};
