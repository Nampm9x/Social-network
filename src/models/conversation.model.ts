import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    conversationPicture: {
      type: String,
      default: "",
    },
    conversationName: {
      type: String,
      default: "",
    },
    conversationNameWithoutAccents: {
      type: String,
      default: "",
    },
    conversationType: {
      type: String,
      default: "private",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageTime: {
      type: String,
      default: "",
    },
    lastMessageRead: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageReceived: {
      type: Boolean,
      default: false,
    },
    lastMessageSent: {
      type: Boolean,
      default: false,
    },
    lastMessageDelivered: {
      type: Boolean,
      default: false,
    },
    archives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deleted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
