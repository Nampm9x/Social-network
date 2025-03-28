import { Server, Socket } from "socket.io";
import Message from "../models/message.model";
import Notification from "../models/notification.model";
import Conversation from "../models/conversation.model";

const onlineUsers: Map<string, Set<string>> = new Map();

export const onConnection = (socket: Socket, io: Server) => {
    socket.on("onlineUsers", (user) => {
        if (!onlineUsers.has(user._id)) {
            onlineUsers.set(user._id, new Set());
        }
        onlineUsers.get(user._id)!.add(socket.id);

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });  

    socket.on("message", async (data) => {
        const { conversationId, sender, text, members, replyTo, type } = data;
        try {
            const newMessage = new Message({
                conversationId,
                sender,
                text,
                members,
                replyTo,
                type,
            });
            await newMessage.save();
            const populatedMessage = await Message.findById(newMessage._id)
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
                });
            io.emit("message", {populatedMessage, conversation});
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("notification", async (data) => {
        const { from, to, message, type } = data;
        try {
            const newNotification = new Notification({
                from,
                to,
                message,
                type,
            });
            await newNotification.save();
            const populatedNotification = await Notification.findById(
                newNotification._id
            )
                .populate({
                    path: "from",
                    select: "name profilePicture username _id",
                })
                .populate({
                    path: "to",
                    select: "name profilePicture username _id",
                });
            io.emit("notification", populatedNotification);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("disconnect", () => {
        onlineUsers.forEach((sockets, userId) => {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                onlineUsers.delete(userId);
            }
        });

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
};
