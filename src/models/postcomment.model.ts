import mongoose from "mongoose";

const postcommentSchema = new mongoose.Schema(
    {
        postId: {
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
        }
    },
    { timestamps: true }
);

const PostComment = mongoose.model("PostComment", postcommentSchema);

export default PostComment;