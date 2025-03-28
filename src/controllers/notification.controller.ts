import { NextFunction, Response } from "express";
import Notification from "../models/notification.model";
import { errorHandler } from "../utils/error";
import { CustomRequest } from "../utils/verifyUser";

export const createNotification = async (
    from: string,
    to: string | string[],
    message: string,
    type: string,
    link: string,
    req: CustomRequest
) => {
    // Bảo đảm `to` là mảng
    const receivers = Array.isArray(to)
        ? to.filter((id) => id !== from) // Nếu `to` là danh sách các ID
        : to !== from
        ? [to]
        : []; // Nếu `to` là chuỗi

    // Tránh tạo thông báo khi không có người nhận hợp lệ
    if (receivers.length === 0) return;

    // Truy vấn thông báo đã tồn tại
    const existingNotification = await Notification.findOne({
        from,
        to: { $all: receivers }, // Dùng `$all` để khớp danh sách
        message,
        type,
        link,
    });

    // Không tạo thông báo nếu đã tồn tại (ngoại trừ kiểu `message`)
    if (existingNotification && type !== "message") return;

    // Xóa thông báo cũ nếu là kiểu `message`
    if (existingNotification && type === "message") {
        await existingNotification.deleteOne();
    }

    // Tạo thông báo mới
    const notification = new Notification({
        from,
        to: receivers,
        message,
        type,
        link,
    });

    const savedNotification = await notification.save();

    // Populate thông báo
    const populateNotification = await Notification.findById(
        savedNotification._id
    )
        .populate({
            path: "from",
            select: "name username profilePicture _id",
        })
        .populate({
            path: "to",
            select: "name username profilePicture _id",
        });

    // Phát sự kiện qua Socket.IO
    const io = req.app.get("socketio");
    if (io) {
        io.emit("notification", populateNotification);
    } else {
        console.error("Socket.IO instance not found");
    }

    return populateNotification;
};

export const getNotifications = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    try {
        const notifications = await Notification.find({
            to: { $in: [userVerified?._id] },
            deleted: { $ne: userVerified?._id },
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "from",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "to",
                select: "name username profilePicture _id",
            });
        res.status(200).json(notifications);
    } catch (err) {
        next(err);
    }
};

export const readNotification = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findById(id)
            .populate({
                path: "from",
                select: "name username profilePicture _id",
            })
            .populate({
                path: "to",
                select: "name username profilePicture _id",
            });
        if (!notification) {
            return next(errorHandler(404, "Notification not found"));
        }
        notification.read = true;
        await notification.save();
        res.status(200).json(notification);
    } catch (err) {
        next(err);
    }
};

export const readAllNotifications = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    try {
        await Notification.updateMany(
            { to: userVerified?._id },
            { read: true }
        );
        res.status(200).json({ message: "All notifications read" });
    } catch (err) {
        next(err);
    }
};

export const deleteAllNotifications = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const userVerified = req.user;
    try {
        await Notification.updateMany(
            { to: userVerified?._id },
            { deleted: userVerified?._id }
        );
        res.status(200).json({ message: "All notifications deleted" });
    } catch (err) {
        next(err);
    }
};
