import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        contentWithoutAccents: {
            type: String,
        },
        visibility: {
            type: String,
            required: true,
        },
        images: {
            type: Array,
            default: [],
        },
        likes: {
            type: Array,
            default: [],
        },
        viewed: {
            type: Array,
            default: [],
        }
    }, { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;