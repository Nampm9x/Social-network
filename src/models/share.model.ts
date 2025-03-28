import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
    {
        owner: {
            username: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            profilePicture: {
                type: String,
            },
            id: {
                type: String,
                required: true,
            },
        },
        postId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        contentWithoutAccents: {
            type: String,
            default: "",
        },
        visibility: {
            type: String,
            required: true,
        },
        likes: {
            type: Array,
            default: [],
        }
    }, { timestamps: true }
);

const Share = mongoose.model("Share", shareSchema);

export default Share;