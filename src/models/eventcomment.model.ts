import mongoose from "mongoose";

const eventcommentSchema = new mongoose.Schema(
    {
        eventId: {
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

const EventComment = mongoose.model("EventComment", eventcommentSchema);

export default EventComment;