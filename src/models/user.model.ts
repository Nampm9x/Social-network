import mongoose from "mongoose";

const profilePicture =
    "https://firebasestorage.googleapis.com/v0/b/sleepant-social.appspot.com/o/images%2Fdefault-profile-picture.webp?alt=media&token=8d72a111-81ac-4403-9156-dc6b17e230e5";

const coverPicture =
    "https://firebasestorage.googleapis.com/v0/b/sleepant-social.appspot.com/o/images%2Fdefault%20cover%20image.webp?alt=media&token=828bf625-9c58-498c-98c5-561245ca11ff";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        nameWithoutAccents: {
            type: String,
            required: true,
        },
        username: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        emailVisibility: {
            type: String,
            default: "Private",
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: profilePicture,
        },
        coverPicture: {
            type: String,
            default: coverPicture,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        blocked: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        birthday: {
            type: Date,
            default: "",
        },
        birthdayVisibility: {
            type: String,
            default: "Private",
        },
        biography: {
            type: String,
            default: "",
        },
        livesIn: {
            type: String,
            default: "",
        },
        livesInVisibility: {
            type: String,
            default: "Private",
        },
        status: {
            type: String,
            default: "",
        },
        statusVisibility: {
            type: String,
            default: "Private",
        },
        work: {
            type: String,
            default: "",
        },
        workVisibility: {
            type: String,
            default: "Private",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
