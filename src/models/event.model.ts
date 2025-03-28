import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        titleWithoutAccents: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        visibility: {
            type: String,
            required: true,
        },
        followers: {
            type: Array,
            default: [],
        },
        likes: {
            type: Array,
            default: [],
        },
        image: {
            type: String,
            default: "",
        },
        viewed: {
            type: Array,
            default: [],
        }
    }, { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;