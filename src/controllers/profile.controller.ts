import { NextFunction, Response } from "express";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import Post from "../models/post.model";
import Event from "../models/event.model";
import { CustomRequest } from "../utils/verifyUser";

export const getPostsAndEvents = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    const { id } = req.params; // currentid: ID người đăng nhập, id: ID người xem
    const limit = parseInt(req.query.limit as string) || 3; // Số lượng tối đa (phân trang)
    const skip = parseInt(req.query.skip as string) || 0; // Số lượng bỏ qua (phân trang)

    try {
        // Lấy thông tin người đăng nhập
        const user = await User.findById(userVerified?._id).select(
            "friends following"
        );
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        // Điều kiện chung
        const commonConditions =
            id === userVerified?._id
                ? { owner: id } // Trang cá nhân của chính người dùng
                : {
                      owner: id, // Chỉ lấy bài viết/sự kiện của người đang được xem
                      $or: [
                          { visibility: "public" }, // Công khai
                          {
                              visibility: "friends",
                              "owner._id": { $in: user.friends }, // Nếu là bạn bè
                          },
                          {
                              visibility: "followers",
                              "owner._id": { $in: user.following }, // Nếu là người theo dõi
                          },
                      ],
                  };

        // Lấy bài viết
        const posts = await Post.find(commonConditions)
            .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
            .skip(skip) // Bỏ qua bài viết (phân trang)
            .limit(limit) // Giới hạn số bài viết
            .populate("owner", "name username profilePicture _id"); // Lấy thông tin chủ sở hữu

        // Lấy sự kiện
        const events = await Event.find(commonConditions)
            .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
            .skip(skip) // Bỏ qua sự kiện (phân trang)
            .limit(limit) // Giới hạn số sự kiện
            .populate("owner", "name username profilePicture _id"); // Lấy thông tin chủ sở hữu

        // Nếu không có bài viết hoặc sự kiện nào
        if (!posts.length && !events.length) {
            res.status(200).json({ posts: [], events: [], hasMore: false });
            return;
        }

        // Kiểm tra có thêm dữ liệu hay không
        const hasMorePosts = posts.length === limit;
        const hasMoreEvents = events.length === limit;
        const hasMore = hasMorePosts || hasMoreEvents;

        // Trả kết quả
        res.status(200).json({
            posts,
            events,
            hasMore,
        });
    } catch (error) {
        console.error("Error fetching posts and events:", error);
        next(error);
    }
};
