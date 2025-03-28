import { IComment } from "@/types/comment";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const createEvent = async (data: any) => {
    const res = await axios.post(`/api/event/create-event`, data, {
        headers,
    });
    return res.data;
};

export const getEvent = async (eventId: string) => {
    const res = await axios.get(`/api/event/get-event/${eventId}`, { headers });
    return res.data;
};

export const getEvents = async (userId: string) => {
    const res = await axios.get(`/api/event/get-events/${userId}`, {
        headers,
    });
    return res.data;
};

export const getReplyComments = async (commentId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/eventcomment/get-replycomments/${commentId}`,
        { headers }
    );
    return res.data;
};

export const commentEvent = async (
    eventId: string,
    comment: string,
    replyingTo?: string
) => {
    const res = await axios.post<IComment>(
        `/api/eventcomment/create/${eventId}`,
        {
            comment,
            replyingTo,
        },
        {
            headers,
        }
    );
    return res.data;
};

export const likeCommentEvent = async (commentId: string) => {
    const res = await axios.post(
        `/api/eventcomment/like-comment/${commentId}`,
        { headers }
    );
    return res.data;
};

export const followEvent = async (eventId: string) => {
    const res = await axios.post(`/api/event/follow-event/${eventId}`, {
        headers,
    });
    return res.data;
};

export const viewEvent = async (eventId: string) => {
    const res = await axios.post(`/api/event/viewed-event/${eventId}`, {
        headers,
    });
    return res.data;
};

export const getComments = async (eventId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/eventcomment/get-comment/${eventId}`,
        { headers }
    );
    return res.data;
};

export const likeEvent = async (eventId: string) => {
    const res = await axios.post(`/api/event/like-event/${eventId}`, {
        headers,
    });
    return res.data;
};

export const editEvent = async (eventId: string, data: any) => {
    const res = await axios.put(`/api/event/edit-event/${eventId}`, data, {
        headers,
    });
    return res.data;
};

export const deleteEvent = async (eventId: string) => {
    const res = await axios.delete(`/api/event/delete-event/${eventId}`, {
        headers,
    });
    return res.data;
};
