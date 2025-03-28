import mongoose from "mongoose";

const GroupPostCommentSchema = new mongoose.Schema(
    {
        groupPostId: {
            type: String,
            required: true,
        },
        replyingTo: {
            type: String,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        likes: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

const GroupPostComment = mongoose.model(
    "GroupPostComment",
    GroupPostCommentSchema
);

export default GroupPostComment;
