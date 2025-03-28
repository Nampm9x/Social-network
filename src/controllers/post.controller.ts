import { Response, NextFunction } from "express";
import Post from "../models/post.model";
import { errorHandler } from "../utils/error";
import User from "../models/user.model";
import removeAccents from "remove-accents";
import { createNotification } from "./notification.controller";
import PostComment from "../models/postcomment.model";
import { CustomRequest } from "../utils/verifyUser";

interface IPost {
    owner: string;
    profilePicture: string;
    name: string;
    content?: string;
    visibility: string;
    images?: string[];
    likes?: string[];
    postid?: string;
}

export const createPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { content, visibility, images, likes }: IPost = req.body;
    const userVerified = req.user;
    try {
        const post = new Post({
            owner: userVerified?._id,
            content,
            contentWithoutAccents: removeAccents(content || ""),
            visibility,
            images,
            likes,
        });

        await post.save();
        const populatedPost = await Post.findById(post._id).populate(
            "owner",
            "name profilePicture _id username"
        );
        res.status(201).json(populatedPost);
    } catch (error) {
        next(error);
    }
};

export const getPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;

    try {
        const user = await User.findOne({ _id: userVerified?._id });
        const post = await Post.findOne({ _id: postid })
            .populate("owner", "name profilePicture _id username");

        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }

        // Nếu người dùng hiện tại là chủ sở hữu của bài viết, luôn hiển thị
        if (post.owner._id.toString() === userVerified?._id.toString()) {
             res.status(200).json(post);
             return
        }

        // Kiểm tra quyền xem bài viết dựa trên visibility
        if (post.visibility === "private") {
            return next(errorHandler(401, "User is not the owner"));
        }
        if (
            post.visibility === "followers" &&
            !user?.following.includes(post.owner._id)
        ) {
            return next(errorHandler(401, "You are not following the owner"));
        }
        if (
            post.visibility === "friends" &&
            !user?.friends.includes(post.owner._id)
        ) {
            return next(
                errorHandler(401, "You are not friends with the owner")
            );
        }

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};


export const getPosts = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { owner } = req.params;
    const userVerified = req.user;
    try {
        const user = await User.findById(userVerified?._id);
        const posts = await Post.find({
            owner: owner,
            $or: [
                { visibility: "public" },
                { visibility: "friends", owner: { $in: user?.friends } },
                {
                    visibility: "followers",
                    owner: { $in: user?.following },
                },
            ],
        }).sort({ createdAt: -1 });
        if (!posts.length) {
            return next(errorHandler(404, "No posts found"));
        }

        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const likePost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    try {
        const post = await Post.findById(postid);
        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }

        const userIndex = post.likes.indexOf(userVerified?._id);
        if (userIndex === -1) {
            post.likes.push(userVerified?._id);
            createNotification(
                userVerified?._id || "",
                post.owner.toString(),
                `${userVerified?.name} has liked your post`,
                "post",
                `/posts/${postid}`,
                req
            );
        } else {
            post.likes.splice(userIndex, 1);
        }
        await post.save();
        res.status(200).json(post.likes);
    } catch (error) {
        next(error);
    }
};

export const searchPosts = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { query } = req.params;
    const normalizedQuery = removeAccents(query || "");
    const userVerified = req.user;
    try {
        const user = await User.findById(userVerified?._id);
        const posts = await Post.find({
            contentWithoutAccents: { $regex: normalizedQuery, $options: "i" },
            $or: [
                { visibility: "public" },
                { visibility: "friends", owner: { $in: user?.friends } },
                { visibility: "followers", owner: { $in: user?.following } },
                { visibility: "private", owner: user?._id },
            ],
        })
            .sort({ createdAt: -1 })
            .populate("owner", "name profilePicture _id username");
        if (!posts.length) {
            return next(errorHandler(404, "No posts found"));
        }

        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const viewedPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;

    const userVerified = req.user;

    try {
        const post = await Post.findById(postid);
        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }
        if (post.viewed.indexOf(userVerified?._id) === -1) {
            post.viewed.push(userVerified?._id);
        }
        await post.save();
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid } = req.params;
    const userVerified = req.user;
    try {
        const post = await Post.findById(postid);
        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }
        if (post.owner.toString() !== userVerified?._id) {
            return next(errorHandler(401, "User is not the owner"));
        }
        await post.deleteOne();
        await PostComment.deleteMany({ postId: postid });
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        next(error);
    }
};

export const editPost = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { postid, content, visibility, images }: IPost = req.body;
    const userVerified = req.user;
    try {
        const post = await Post.findOne({
            _id: postid,
            owner: userVerified?._id,
        });
        if (!post) {
            return next(errorHandler(404, "Post not found"));
        }
        post.content = content || "";
        post.contentWithoutAccents = removeAccents(content || "");
        post.visibility = visibility;
        post.images = images as string[];
        await post.save();
        const populatedPost = await Post.findById(post._id).populate(
            "owner",
            "name profilePicture _id username"
        );
        res.status(200).json(populatedPost);
    } catch (error) {
        next(error);
    }
};
