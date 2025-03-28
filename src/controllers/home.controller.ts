import { NextFunction, Response } from "express";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import Post from "../models/post.model";
import Event from "../models/event.model";
import { CustomRequest } from "../utils/verifyUser";
import Group from "../models/group.model";
import GroupPost from "../models/grouppost.model";

export const getPostsAndEvents = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const skip = parseInt(req.query.skip as string) || 0;

    const userVerified = req.user;

    try {
        const user = await User.findOne({ _id: userVerified?._id });
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const groups = await Group.find({ members: user._id }).select("_id");
        const groupIds = groups.map((group) => group._id);
        const groupPosts = await GroupPost.find({
            group: { $in: groupIds },
            status: "approved",
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "owner",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "group",
                select: "name groupPicture _id",
            })
            .skip(skip)
            .limit(limit + 1);

        // Fetch posts
        const posts = await Post.find({
            $or: [
                { owner: user._id },
                {
                    visibility: "friends",
                    owner: { $in: user.friends || [] },
                },
                {
                    visibility: "followers",
                    owner: { $in: user.following || [] },
                },
                {
                    visibility: "public",
                    owner: { $in: user.following || [] },
                },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "name username profilePicture _id");

        // Fetch events
        const events = await Event.find({
            $or: [
                { owner: user._id },
                {
                    visibility: "friends",
                    owner: { $in: user.friends || [] },
                },
                {
                    visibility: "followers",
                    owner: { $in: user.following || [] },
                },
                {
                    visibility: "public",
                    owner: { $in: user.following || [] },
                },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "name username profilePicture _id");

        // Nếu cả posts và events đều rỗng, báo hết dữ liệu
        if (
            (!posts && !events && groupPosts) ||
            (posts &&
                posts.length === 0 &&
                events &&
                events.length === 0 &&
                groupPosts &&
                groupPosts.length === 0)
        ) {
            res.status(200).json({ posts: [], events: [], groupPosts: [], hasMore: false });
            return;
        }

        // Trả về kết quả kèm theo hasMore để báo frontend
        res.status(200).json({
            posts,
            events,
            groupPosts,
            hasMore: posts.length === limit || events.length === limit || groupPosts.length === limit,
        });
    } catch (error) {
        next(error);
    }
};
