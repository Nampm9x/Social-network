import { INotification } from "@/types/notification";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const markReadNotification = async (notificationId: string) => {
    const res = await axios.put(
        `/api/notification/mark-read/${notificationId}`,
        { headers }
    );
    return res.data;
};

export const getNotifications = async () => {
    const res = await axios.get<INotification[]>(
        `/api/notification/get-notifications`,
        { headers }
    );
    return res.data;
};

export const readAllNotification = async () => {
    const res = await axios.patch(`/api/notification/mark-read-all`, {
        headers,
    });
    return res.data;
};

export const deleteAllNotifications = async () => {
    const res = await axios.patch(
        `/api/notification/delete-all-notifications`,
        { headers }
    );
    return res.data;
};
