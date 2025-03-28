import { Response, NextFunction } from "express";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import bcryptjs from "bcryptjs";
import removeAccents from "remove-accents";
import mongoose from "mongoose";
import { createNotification } from "./notification.controller";
import { CustomRequest } from "../utils/verifyUser";

export const getCurrentUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    try {
        const user = await User.findOne({ _id: userVerified?._id })
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const userReturn = {
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture,
            username: user.username,
        };

        res.status(200).json(userReturn);
    } catch (error) {
        next(error);
    }
};

export const getUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { username } = req.params;
    const userVerified = req.user;
    try {
        let user: any = await User.findOne({ username })
            .select("-password")
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        // Nếu là chính chủ, trả về toàn bộ dữ liệu
        if (userVerified?.username === username) {
            res.status(200).json(user);
            return;
        }

        // Nếu không phải chính chủ, lọc dữ liệu theo visibility
        const filteredUser: any = {
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            coverPicture: user.coverPicture,
            followers: user.followers,
            following: user.following,
            friends: user.friends,
            createdAt: user.createdAt,
        };

        // Xác định quyền truy cập
        const isFriend = user.friends.some(
            (friend: any) => friend._id.toString() === userVerified?._id
        );
        const isFollower = user.followers.some(
            (follower: any) => follower._id.toString() === userVerified?._id
        );

        // Hàm kiểm tra visibility
        const checkVisibility = (field: string, visibility: string) => {
            if (visibility === "Private") return undefined; // Ẩn hoàn toàn nếu là private
            if (visibility === "Public") return user[field];
            if (visibility === "Priends" && isFriend) return user[field];
            if (visibility === "Pollowers" && isFollower) return user[field];
            return undefined;
        };

        // Lọc các thông tin theo visibility
        filteredUser.email = checkVisibility("email", user.emailVisibility);
        filteredUser.birthday = checkVisibility(
            "birthday",
            user.birthdayVisibility
        );
        filteredUser.livesIn = checkVisibility(
            "livesIn",
            user.livesInVisibility
        );
        filteredUser.status = checkVisibility("status", user.statusVisibility);
        filteredUser.work = checkVisibility("work", user.workVisibility);
        filteredUser.biography = user.biography; // Tiểu sử hiển thị mặc định

        res.status(200).json(filteredUser);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id)
            .select(" _id coverPicture name username profilePicture followers following friends")
            .populate({
                path: "followers",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "following",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username _id",
            });
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const { password: pass, ...rest } = user.toObject();

        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

export const editProfile = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const {
        name,
        username,
        profilePicture,
        birthday,
        birthdayVisibility,
        biography,
        livesIn,
        livesInVisibility,
        status,
        statusVisibility,
        work,
        workVisibility,
        enterPassword,
    } = req.body;

    const userVerified = req.user;

    try {
        const user = await User.findOne({ _id: userVerified?._id });
        if (!user) {
            return next(errorHandler(404, "User not found"));
        } else {
            const isMatch = await bcryptjs.compare(
                enterPassword,
                user.password
            );
            if (!isMatch) {
                return next(errorHandler(400, "The password is incorrect"));
            } else {
                const updateUser = await User.findOneAndUpdate(
                    {
                        _id: userVerified?._id,
                    },
                    {
                        $set: {
                            name,
                            username,
                            nameWithoutAccents: removeAccents(name),
                            profilePicture,
                            birthday,
                            birthdayVisibility,
                            biography,
                            livesIn,
                            livesInVisibility,
                            status,
                            statusVisibility,
                            work,
                            workVisibility,
                        },
                    },
                    { new: true }
                )
                    .populate({
                        path: "followers",
                        select: "name profilePicture username _id",
                    })
                    .populate({
                        path: "following",
                        select: "name profilePicture username _id",
                    })
                    .populate({
                        path: "friends",
                        select: "name profilePicture username _id",
                    });

                if (!updateUser) {
                    return next(errorHandler(500, "Failed to update user"));
                }
                const { password, ...rest } = updateUser.toObject();
                if (req.user && updateUser.username) {
                    req.user.username = updateUser.username;
                }
                res.status(200).json(rest);
            }
        }
    } catch (error) {
        next(error);
    }
};

export const followUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    let { id } = req.params;
    const userVerified = req.user;
    try {
        // Kiểm tra ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(errorHandler(400, "Invalid user ID"));
        }

        const idAfter = new mongoose.Types.ObjectId(id);
        const currentidAfter = new mongoose.Types.ObjectId(userVerified?._id);

        const user = await User.findById(idAfter);
        const currentuser = await User.findById(currentidAfter);

        if (!user || !currentuser) {
            return next(errorHandler(404, "User not found"));
        }

        // Kiểm tra xem người dùng đã theo dõi nhau hay chưa
        const userIndex = user.followers.indexOf(currentidAfter);
        const currentuserIndex = currentuser.following.indexOf(idAfter);

        if (userIndex === -1 && currentuserIndex === -1) {
            // Thêm vào followers và following
            user.followers.push(currentidAfter);
            currentuser.following.push(idAfter);

            // Tạo thông báo
            createNotification(
                userVerified?._id || "",
                id,
                `${userVerified?.name} followed you`,
                "follow",
                `/profile/${user.username}`,
                req
            );
        } else {
            // Nếu đã theo dõi, bỏ theo dõi
            if (userIndex !== -1) user.followers.splice(userIndex, 1);
            if (currentuserIndex !== -1)
                currentuser.following.splice(currentuserIndex, 1);
        }

        // Kiểm tra xem họ có phải là bạn bè không
        if (
            currentuser.followers.some((user) => user._id.toString() === id) &&
            currentuser.following.some((user) => user._id.toString() === id)
        ) {
            // Thêm vào danh sách bạn bè
            if (!currentuser.friends.includes(idAfter))
                currentuser.friends.push(idAfter);
            if (!user.friends.includes(currentidAfter))
                user.friends.push(currentidAfter);
        } else {
            // Nếu không phải bạn bè thì bỏ
            const userFriendIndex = currentuser.friends.indexOf(idAfter);
            const currentUserFriendIndex = user.friends.indexOf(currentidAfter);

            if (userFriendIndex !== -1)
                currentuser.friends.splice(userFriendIndex, 1);
            if (currentUserFriendIndex !== -1)
                user.friends.splice(currentUserFriendIndex, 1);
        }

        // Lưu dữ liệu
        await user.save();
        await currentuser.save();

        // Trả về dữ liệu người dùng đã cập nhật
        const updatedUser = await User.findById(idAfter)
        .select(" _id coverPicture name username profilePicture followers following friends createdAt")
            .populate({
                path: "followers",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "following",
                select: "name profilePicture username _id",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username _id",
            });

        res.status(200).json(updatedUser);
    } catch (error) {
        return next(errorHandler(500, "Internal Server Error"));
    }
};

export const searchUsers = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { query } = req.params;
    const normalizedQuery = removeAccents(query);

    try {
        const users = await User.find({
            nameWithoutAccents: { $regex: normalizedQuery, $options: "i" },
        })
        .select(" _id coverPicture name username profilePicture followers following friends")
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!users.length) {
            return next(errorHandler(404, "No users found"));
        }

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userVerified = req.user;
        const user = await User.findOne({ _id: userVerified?._id })
        .select(" _id coverPicture name username profilePicture followers following friends")
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const userFollowing = user.following;

        const whoToFollow = await User.find({
            _id: { $nin: [...userFollowing, user._id] },
        })
            .select(
                "-password -email -emailVisibility -birthday -birhdayVisibility -livesIn -livesInVisibility -status -statusVisibility -works worksVisibility"
            )
            .sort({ followersCount: -1 })
            .limit(10)
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        res.status(200).json(whoToFollow);
    } catch (error) {
        next(error);
    }
};

export const searchUsersToSendMessage = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { query } = req.params;

    const userVerified = req.user;
    const normalizedQuery = removeAccents(query);

    try {
        const currentUser = await User.findOne({ _id: userVerified?._id })
        .select(" _id coverPicture name username profilePicture followers following friends")
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!currentUser) {
            return next(errorHandler(404, "User not found"));
        }

        const users = await User.find({
            nameWithoutAccents: { $regex: normalizedQuery, $options: "i" },
            _id: { $ne: userVerified?._id, $in: currentUser.friends },
        })
            .select("-password")
            .populate({
                path: "followers",
                select: "name profilePicture username",
            })
            .populate({
                path: "following",
                select: "name profilePicture username",
            })
            .populate({
                path: "friends",
                select: "name profilePicture username",
            });

        if (!users.length) {
            return next(errorHandler(404, "No users found"));
        }

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const changeCoverPhoto = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userid = req.user?._id;
    const { coverPhoto } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            userid,
            { coverPicture: coverPhoto },
            { new: true }
        );
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }
        res.status(200).json(user.coverPicture);
    } catch (error) {
        next(error);
    }
};

export const whoToFollow = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?._id;

    try {
        // Lấy thông tin người dùng hiện tại và các mối quan hệ
        const user = await User.findById(userId)
            .populate("friends", "_id") // Lấy danh sách bạn bè
            .populate("following", "_id") // Lấy danh sách người đang theo dõi
            .populate("followers", "_id"); // Lấy danh sách người theo dõi

        if (!user) {
            return next(errorHandler(404, "User not found")); // Người dùng không tồn tại
        }

        // Nếu người dùng chưa có bạn bè, người theo dõi, hoặc người đang theo dõi
        if (
            user.friends.length === 0 &&
            user.following.length === 0 &&
            user.followers.length === 0
        ) {
            // Gợi ý các người dùng ngẫu nhiên hoặc những người dùng nổi bật
            const popularUsers = await User.find({
                _id: { $ne: userId }, // Loại bỏ người dùng hiện tại
            }).select("_id name username profilePicture"); // Lấy thông tin cơ bản

            res.status(200).json(popularUsers); // Trả về danh sách người dùng có thể gợi ý
            return;
        }

        // Nếu người dùng có mối quan hệ, tìm người dùng có thể gợi ý
        const friends = user.friends.map((friend) => friend._id);
        const following = user.following.map((follow) => follow._id);
        const followers = user.followers.map((follower) => follower._id);

        const potentialFollowers = await User.find({
            _id: { $ne: userId }, // Loại bỏ người dùng hiện tại
            $nor: [
                { _id: { $in: following } }, // Loại bỏ những người đã được theo dõi
                { _id: { $in: friends } }, // Loại bỏ những người đã là bạn bè
            ],
        }).select("_id name username profilePicture");

        // Trả về danh sách người dùng có thể gợi ý
        res.status(200).json(potentialFollowers);
    } catch (error) {
        next(error); // Xử lý lỗi
    }
};

export const checkExistsUsername = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { username } = req.params;
    const userid = req.user?._id;
    try {
        if (!username) {
            res.status(200).json({ exist: true });
        }
        const user = await User.findOne({ username, _id: { $ne: userid } });
        if (user) {
            res.status(200).json({ exist: true });
            return;
        }
        res.status(200).json({ exist: false });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userVerified = req.user;
    try {
        const user = await User.findOne({ _id: userVerified?._id });

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const isMatch = await bcryptjs.compare(oldPassword, user.password);
        if (!isMatch) {
            return next(errorHandler(400, "The password is incorrect"));
        }

        if (newPassword !== confirmNewPassword) {
            res.status(200).json("Passwords do not match");
            return;
        }

        if (newPassword === oldPassword) {
            res.status(200).json(
                "New password must be different from old password"
            );
            return;
        }

        if (newPassword.length < 6) {
            res.status(200).json("Password must be at least 6 characters long");
            return;
        }

        const hashPassword = await bcryptjs.hash(newPassword, 10);

        const updateUser = await User.findOneAndUpdate(
            {
                _id: userVerified?._id,
            },
            {
                $set: {
                    password: hashPassword,
                },
            },
            { new: true }
        );

        if (!updateUser) {
            return next(errorHandler(500, "Failed to update user"));
        }

        res.status(200).json("Password updated successfully");
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const hashPassword = await bcryptjs.hash(password, 10);

        await User.findOneAndUpdate(
            {
                email,
            },
            {
                $set: {
                    password: hashPassword,
                },
            },
            { new: true }
        );

        res.status(200).json("Password updated successfully");
    } catch (error) {
        next(error);
    }
};
