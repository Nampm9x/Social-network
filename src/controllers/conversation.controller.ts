import { Response, NextFunction } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import removeAccents from "remove-accents";
import { CustomRequest } from "../utils/verifyUser";
import mongoose from "mongoose";

export const createConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const {
        members,
        lastMessage,
        lastMessageTime,
        conversationPicture,
        conversationName,
    } = req.body;
    const userVerified = req.user;

    let conversationType: string;
    if (members.length === 2) {
        conversationType = "private";
    } else if (members.length > 2) {
        conversationType = "group";
    } else {
        conversationType = "";
    }
    try {
        for (let i = 0; i < members.length; i++) {
            const user = await User.findById(members[i]);
            if (!user) {
                return next(errorHandler(404, "User not found"));
            }
        }
        if (members.length === 2) {
            const existingConversation = await Conversation.findOne({
                members,
            });
            if (existingConversation) {
                res.status(200).json(existingConversation);
                return;
            }
        }

        if (!members || (members.length < 3 && conversationType === "group")) {
            return next(
                errorHandler(
                    400,
                    "Group conversation must have at least 3 members"
                )
            );
        }
        const newConversation = new Conversation({
            members,
            conversationType,
            lastMessage,
            lastMessageSender: userVerified?._id,
            lastMessageTime,
            lastMessageRead: [userVerified?._id],
            conversationPicture,
            conversationName,
            conversationNameWithoutAccents: removeAccents(
                conversationName || ""
            ),
            admin: userVerified?._id,
        });
        await newConversation.save();

        const populatedConversation = await Conversation.findById(
            newConversation._id
        )
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });

        res.status(201).json(populatedConversation);
    } catch (err) {
        next(err);
    }
};

export const getConversations = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;

    try {
        const conversations = await Conversation.find({
            members: { $in: userVerified?._id },
            archives: { $ne: userVerified?._id },
            deleted: { $ne: userVerified?._id },
        })
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            .sort({
                lastMessageTime: -1,
            })
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });
        if (!conversations) {
            return next(errorHandler(404, "No conversations found"));
        }

        res.status(200).json(conversations);
    } catch (err) {
        next(err);
    }
};

export const getArchivedConversations = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    try {
        const conversations = await Conversation.find({
            members: { $in: userVerified?._id },
            archives: { $eq: userVerified?._id },
            deleted: { $ne: userVerified?._id },
        })
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            .sort({ lastMessageTime: -1 })
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });

        if (!conversations) {
            return next(errorHandler(404, "No conversations found"));
        }

        res.status(200).json(conversations);
    } catch (err) {
        next(err);
    }
};

export const getConversationByUsername = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { id1, id2 } = req.params;
    try {
        const conversation = await Conversation.findOne({
            $and: [
                { members: { $all: [id1, id2] } }, // Đảm bảo members chứa cả id1 và id2
                { members: { $size: 2 } }, // Đảm bảo chỉ có đúng 2 phần tử
            ],
        })
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });
        if (!conversation) {
            res.status(200).json({});
            return;
        }
        res.status(200).json(conversation);
    } catch (error) {
        next(error);
    }
};

export const getConversationById = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    try {
        const conversation = await Conversation.findOne({
            _id: conversationid,
            members: { $in: [userVerified?._id] },
        })
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            .populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });
        if (!conversation) {
            res.status(200).json({});
            return;
        }
        res.status(200).json(conversation);
    } catch (err) {
        next(err);
    }
};

export const updateConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const { lastMessage, lastMessageTime } = req.body;
    const userVerified = req.user;
    try {
        const conversation = await Conversation.findById(conversationid);
        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }
        const updatedConversation = await Conversation.findOneAndUpdate(
            {
                _id: conversationid,
            },
            {
                $set: {
                    lastMessage,
                    lastMessageSender: userVerified?._id,
                    lastMessageTime,
                    lastMessageRead: [userVerified?._id],
                    deleted: [],
                },
            },
            { new: true }
        )
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
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

        if (!updatedConversation) {
            return next(errorHandler(500, "Failed"));
        }
        res.status(200).json(updatedConversation);
    } catch (err) {
        next(err);
    }
};

export const readConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    try {
        const conversation = await Conversation.findOne({
            _id: conversationid,
            lastMessageSender: { $ne: userVerified?._id },
        });
        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }

        const updatedConversation = await Conversation.findOneAndUpdate(
            {
                _id: conversationid,
            },
            { $set: { lastMessageRead: [userVerified?._id] } },
            { new: true }
        );

        if (!updatedConversation) {
            return next(errorHandler(500, "Failed"));
        }

        res.status(200).json("OK");
    } catch (err) {
        next(err);
    }
};

export const archiveConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    try {
        const conversation = await Conversation.findOne({
            _id: conversationid,
            members: userVerified?._id,
        });
        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }

        const updatedConversation = await Conversation.findOneAndUpdate(
            {
                _id: conversationid,
            },
            { $push: { archives: userVerified?._id } },
            { new: true }
        );

        const populatedConversation = await Conversation.findById(
            conversationid
        )
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            ?.populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });

        if (!updatedConversation) {
            return next(errorHandler(500, "Failed"));
        }

        res.status(200).json(populatedConversation);
    } catch (err) {
        next(err);
    }
};

export const unarchiveConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;
    try {
        const conversation = await Conversation.findOne({
            _id: conversationid,
            members: userVerified?._id,
        });
        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }

        const updatedConversation = await Conversation.findOneAndUpdate(
            {
                _id: conversationid,
            },
            { $pull: { archives: userVerified?._id } },
            { new: true }
        );

        const populatedConversation = await Conversation.findById(
            conversationid
        )
            .select(
                "-archives -deleted -lastMessageReceived -lastMessageSent -lastMessageDelivered"
            )
            ?.populate({
                path: "lastMessageSender",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "members",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "admin",
                select: "name username profilePicture _id",
            });

        if (!updatedConversation) {
            return next(errorHandler(500, "Failed"));
        }

        res.status(200).json(populatedConversation);
    } catch (err) {
        next(err);
    }
};

export const deleteConversation = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid } = req.params;
    const userVerified = req.user;

    try {
        // Tìm cuộc trò chuyện
        const conversation = await Conversation.findOne({
            _id: conversationid,
            members: userVerified?._id, // Đảm bảo user là thành viên của cuộc trò chuyện
        });

        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }

        // Cập nhật trạng thái "deleted" của cuộc trò chuyện
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationid,
            { $addToSet: { deleted: userVerified?._id } }, // Tránh trùng lặp
            { new: true }
        );

        if (!updatedConversation) {
            return next(errorHandler(500, "Failed to update conversation"));
        }

        // Lấy danh sách tin nhắn trong cuộc trò chuyện
        const messages = await Message.find({ conversationId: conversationid });

        // Cập nhật trạng thái "deleted" của tin nhắn
        await Promise.all(
            messages.map(async (message) => {
                await Message.findByIdAndUpdate(
                    message._id,
                    { $addToSet: { deleted: userVerified?._id } },
                    { new: true }
                );
            })
        );

        // Nếu tất cả thành viên đã xóa cuộc trò chuyện, xóa hẳn tin nhắn và cuộc trò chuyện
        if (
            updatedConversation.deleted.length === updatedConversation.members.length
        ) {
            await Message.deleteMany({ conversationId: conversationid }); // Xóa toàn bộ tin nhắn
            await Conversation.findByIdAndDelete(conversationid); // Xóa cuộc trò chuyện
        }

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const searchConversations = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { search } = req.params;
    const userVerified = req.user;

    try {
        if (!userVerified) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const userId = userVerified._id;
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const friendIds = new Set(
            currentUser.friends.map((id) => id.toString())
        );

        // 1. Tìm nhóm có tên trùng với search
        const groupConversations = await Conversation.find({
            members: userId,
            conversationType: "group",
            conversationName: { $regex: search, $options: "i" },
        }).select("_id conversationName conversationPicture");

        // 2. Tìm bạn bè có tên trùng với search
        const friends = await User.find({
            nameWithoutAccents: { $regex: search, $options: "i" },
            _id: { $in: [...friendIds] },
        }).select("_id name profilePicture");

        // 3. Tìm tất cả cuộc trò chuyện riêng tư của user
        const conversations = await Conversation.find({
            members: userId,
            conversationType: "private",
        }).populate("members", "_id name nameWithoutAccents profilePicture");

        // 4. Lọc cuộc trò chuyện với người không phải bạn bè và có tên khớp với search
        const conversationsAreNotFriends = conversations
            .map((conv) => {
                const otherUser: any = conv.members.find(
                    (m) => m._id.toString() !== userId.toString()
                );
                if (!otherUser || friendIds.has(otherUser._id.toString()))
                    return null;
                if (!new RegExp(search, "i").test(otherUser.nameWithoutAccents))
                    return null;

                return {
                    _id: conv._id,
                    name: otherUser.name,
                    username: otherUser.username,
                    profilePicture: otherUser.profilePicture,
                };
            })
            .filter(Boolean);

        // 5. Phân loại bạn bè thành có hoặc chưa có cuộc trò chuyện
        const conversationMap = new Map(
            conversations.map((conv) => {
                const otherUser = conv.members.find(
                    (m) => m._id.toString() !== userId.toString()
                );
                return [otherUser?._id.toString(), conv._id];
            })
        );

        const friendsWithConversation: {
            _id: string;
            username: string;
            name: string;
            profilePicture: string;
        }[] = [];
        const friendsWithoutConversation: {
            _id: string;
            username: string;
            name: string;
            profilePicture: string;
        }[] = [];

        friends.forEach((friend) => {
            const conversationId = conversationMap.get(friend._id.toString());
            if (conversationId) {
                friendsWithConversation.push({
                    _id: conversationId.toString(),
                    name: friend.name,
                    username: "",
                    profilePicture: friend.profilePicture,
                });
            } else {
                friendsWithoutConversation.push({
                    _id: `temp_${friend._id}`,
                    name: friend.name,
                    username: friend.username || "",
                    profilePicture: friend.profilePicture,
                });
            }
        });

        // 6. Kết hợp tất cả kết quả
        const results = [
            ...groupConversations.map((conv) => ({
                _id: conv._id,
                name: conv.conversationName,
                profilePicture: conv.conversationPicture,
            })),
            ...friendsWithConversation,
            ...friendsWithoutConversation,
            ...conversationsAreNotFriends,
        ];

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

export const leaveGroup = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { conversationid, userid } = req.params;
    try {
        const conversation = await Conversation.findById(conversationid);

        if (!conversation) {
            return next(errorHandler(404, "Conversation not found"));
        }
        if (conversation.admin?.toString() === userid) {
            return next(errorHandler(404, "Admin can't leave the group"));
        }
        conversation.members = conversation.members.filter(
            (member) => member.toString() !== userid
        );

        await conversation.save();

        const messages = await Message.find({ conversationId: conversationid });

        messages.forEach(async (message) => {
            message.members = message.members.filter(
                (member) => member.toString() !== userid
            );
            await message.save();
        });

        res.status(200).json({ message: "Leave group successfully" });
    } catch (error) {
        next(error);
    }
};
