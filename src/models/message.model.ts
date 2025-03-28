import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
    },
    replyTo: {
        messageId: {
            type: String,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Array,
        default: []
    },
    type: {
        type: String,
        default: "message"
    },
    // message or reply
    deleted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    status: {
        type: String,
        default: "sent",
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;