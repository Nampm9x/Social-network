import { Response, NextFunction } from "express";
import Event from "../models/event.model";
import { errorHandler } from "../utils/error";
import User from "../models/user.model";
import removeAccents from "remove-accents";
import Post from "../models/post.model";
import { createNotification } from "./notification.controller";
import { CustomRequest } from "../utils/verifyUser";

interface IEvent {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    visibility: string;
    image: string;
    owner?: {
        name: string;
        username: string;
        profilePicture: string;
        id: string;
    };
}

export const createEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const {
        title,
        description,
        date,
        time,
        duration,
        location,
        visibility,
        image,
    }: IEvent = req.body;
    const userVerified = req.user;

    try {
        const event = new Event({
            title,
            titleWithoutAccents: removeAccents(title),
            description,
            date,
            time,
            duration,
            location,
            visibility,
            image,
            owner: userVerified?._id,
        });

        await event.save();
        const populatedEvent = await Event.findById(event._id)
            .populate("owner", "name profilePicture _id username")
            .select("-viewed");
        res.status(201).json(populatedEvent);
    } catch (error) {
        next(error);
    }
};

export const getEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;

    try {
        const event = await Event.findById(eventid)
            .populate("owner", "name username profilePicture _id")
            .select("-viewed");
        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
};

export const getEvents = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { owner } = req.params;
    try {
        const events = await Event.find({ owner: owner })
            .sort({
                createdAt: -1,
            })
            .select("-viewed")
            .populate("owner", "name username profilePicture _id");
        if (!events) {
            return next(errorHandler(404, "No events found"));
        }

        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

export const followEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;
    const userVerified = req.user;
    try {
        const event = await Event.findById(eventid);
        if (!event) {
            return next(errorHandler(404, "Event not found"));
        }

        const userIndex = event.followers.indexOf(userVerified?._id);
        if (userIndex === -1) {
            event.followers.push(userVerified?._id);
            createNotification(
                userVerified?._id || "",
                event?.owner.toString(),
                `${userVerified?.name} has followed your event`,
                "event",
                `/events/${eventid}`,
                req
            );
        } else {
            event.followers.splice(userIndex, 1);
        }
        await event.save();
        res.status(200).json(event.followers);
    } catch (error) {
        next(error);
    }
};

export const likeEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;
    const userVerified = req.user;
    try {
        const event = await Event.findById(eventid);
        if (!event) {
            return next(errorHandler(404, "Event not found"));
        }
        const userIndex = event.likes.indexOf(userVerified?._id);
        if (userIndex === -1) {
            event.likes.push(userVerified?._id);
            createNotification(
                userVerified?._id || "",
                event?.owner.toString(),
                `${userVerified?.name} liked your event`,
                "event",
                `/events/${eventid}`,
                req
            );
        } else {
            event.likes.splice(userIndex, 1);
        }
        await event.save();
        res.status(200).json(event.likes);
    } catch (error) {
        next(error);
    }
};

export const searchEvents = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { query } = req.params;
    const userVerified = req.user;
    const normalizedQuery = removeAccents(query);
    try {
        const user = await User.findById(userVerified?._id);
        const events = await Event.find({
            titleWithoutAccents: { $regex: normalizedQuery, $options: "i" },
            $or: [
                { visibility: "public" },
                { visibility: "followers", owner: { $in: user?.following } },
                { visibility: "friends", owner: { $in: user?.friends } },
                { visibility: "private", owner: user?._id },
            ],
        })
            .populate("owner", "name username profilePicture _id")
            .select("-viewed");
        if (!events.length) {
            return next(errorHandler(404, "No events found"));
        }

        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

export const editEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;
    const {
        title,
        description,
        date,
        time,
        duration,
        location,
        visibility,
        image,
    }: IEvent = req.body;
    const normalizedQuery = removeAccents(title);
    try {
        const event = await Event.findById(eventid);
        if (!event) {
            return next(errorHandler(404, "Event not found"));
        }
        const updateEvent = await Event.findOneAndUpdate(
            {
                _id: eventid,
            },
            {
                $set: {
                    title,
                    titleWithoutAccents: normalizedQuery,
                    description,
                    date,
                    time,
                    duration,
                    location,
                    visibility,
                    image,
                },
            },
            { new: true }
        )
            .populate("owner", "name username profilePicture _id")
            .select("-viewed");
        if (!updateEvent) {
            return next(errorHandler(500, "Failed to update event"));
        }
        res.status(200).json(updateEvent);
    } catch (error) {
        next(error);
    }
};

export const viewedEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;
    const userVerified = req.user;

    try {
        const event = await Event.findById(eventid);
        if (!event) {
            return next(errorHandler(404, "Event not found"));
        }
        if (event.viewed.indexOf(userVerified?._id) === -1) {
            event.viewed.push(userVerified?._id);
        }
        await event.save();
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { eventid } = req.params;
    try {
        const event = await Event.findById(eventid);
        if (!event) {
            return next(errorHandler(404, "Event not found"));
        }
        await event.deleteOne();
        res.status(200).json({ message: "Event deleted" });
    } catch (error) {
        next(error);
    }
};

export const test = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const event = await Event.find({});
        res.status(200).json(event);
        const post = await Post.find({});
        // event.forEach(async (e) => {
        //     e.viewed = [];
        //     await e.save();
        // });
        // post.forEach(async (p) => {
        //     p.viewed = [];
        //     await p.save();
        // });
    } catch (error) {
        next(error);
    }
};
