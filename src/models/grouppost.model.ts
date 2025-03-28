import mongoose from "mongoose";

const groupPostSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        content: {
            type: String,
        },
        contentWithoutAccents: {
            type: String,
        },
        images: {
            type: Array,
            default: [],
        },
        likes: {
            type: Array,
            default: [],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        viewed: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

const GroupPost = mongoose.model("GroupPost", groupPostSchema);

export default GroupPost;
