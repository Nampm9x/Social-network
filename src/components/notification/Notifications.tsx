"use client";

import React, { useEffect, useRef, useState } from "react";
import { MenuButton, MenuItems } from "@headlessui/react";
import { INotification } from "@/types/notification";
import io from "socket.io-client";
import Notification from "./Notification";
import { GoBell, GoDotFill } from "react-icons/go";
import { MdDone } from "react-icons/md";
import {
    useDeleteAllNotifications,
    useGetNotifications,
    useReadAllNotification,
} from "@/hooks/react-query/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import SimpleBar from "simplebar-react";

const socket = io(process.env.NEXT_PUBLIC_SERVER_URL);

export default function Notifications() {
    const { data: currentUser } = useGetCurrentUser();
    const { data: notifications, isLoading: isLoadingNotifications } =
        useGetNotifications();
    const [isConfirmDeletion, setIsConfirmDeletion] = useState<boolean>(false);
    const [isConfirmReadAll, setIsConfirmReadAll] = useState<boolean>(false);

    useEffect(() => {
        notifications?.filter((notification) => notification.read === false)
            .length === 0;
    }, [notifications]);

    const queryClient = useQueryClient();
    useEffect(() => {
        const handleNotification = (data: INotification) => {
            // Kiểm tra thông báo có dành cho người dùng hiện tại không
            const isForCurrentUser = data.to.some(
                (recipient) => recipient._id === currentUser?._id
            );

            if (!isForCurrentUser) return;

            // Cập nhật thông báo trong `queryClient`
            queryClient.setQueryData(
                ["notifications"],
                (oldNotifications: INotification[] = []) => {
                    // Tìm thông báo cũ có `type`, `from`, `link`, `to` giống thông báo mới
                    const duplicateIndex = oldNotifications.findIndex(
                        (notification) =>
                            notification.type === data.type &&
                            notification.from._id === data.from._id && // So sánh `_id` của `from`
                            notification.link === data.link && // So sánh `link`
                            notification.to.some((recipient) =>
                                data.to.some(
                                    (newRecipient) =>
                                        newRecipient._id === recipient._id
                                )
                            )
                    );

                    if (duplicateIndex !== -1) {
                        // Nếu tìm thấy thông báo cũ, cập nhật nó với thông báo mới
                        const updatedNotifications = [...oldNotifications];
                        updatedNotifications[duplicateIndex] = data; // Thay thế thông báo cũ bằng thông báo mới
                        return updatedNotifications;
                    }

                    // Nếu không trùng, thêm thông báo mới vào đầu danh sách
                    return [data, ...oldNotifications];
                }
            );
        };

        // Lắng nghe sự kiện `notification` từ Socket.IO
        socket.on("notification", handleNotification);

        // Dọn dẹp sự kiện khi component bị hủy
        return () => {
            socket.off("notification", handleNotification);
        };
    }, [currentUser, queryClient]);

    const readAllNotification = useReadAllNotification();
    const handleReadAllNotification = async () => {
        if (
            notifications?.filter((notification) => notification.read === false)
                .length === 0
        )
            return;
        readAllNotification.mutate();
        setIsConfirmReadAll(false);
    };

    const deleteAllNotifications = useDeleteAllNotifications();
    const handleDeleteAllNotification = async () => {
        deleteAllNotifications.mutate();
        setIsConfirmDeletion(false);
    };

    const handleConfirmDeletion = () => {
        setIsConfirmDeletion(true);
        setTimeout(() => {
            setIsConfirmDeletion(false);
        }, 5000);
    };

    const handleConfirmReadAll = () => {
        setIsConfirmReadAll(true);
        setTimeout(() => {
            setIsConfirmReadAll(false);
        }, 5000);
    };

    return (
        <>
            <div>
                <MenuButton className="relative flex rounded border text-sm focus:outline-none focus:ring-2 focus:ring-white">
                    <div className="relative">
                        <div className="bg-third font-semibold hover:cursor-pointer text-secondary border rounded py-1 px-2 lg:p-2 hover:text-black">
                            <GoBell />
                        </div>
                        {notifications &&
                            notifications.length > 0 &&
                            notifications?.filter(
                                (notification) => notification.read === false
                            ).length > 0 && (
                                <GoDotFill className="absolute -top-1 text-red-500 -right-1" />
                            )}
                    </div>
                </MenuButton>
            </div>
            <MenuItems
                transition
                className="absolute right-0 z-50 h-[80vh] border-t-2 mt-2 w-72 p-1 origin-top-right rounded-md bg-white py-1 shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
                <SimpleBar className="h-full overflow-y-auto w-full">
                    <div
                        className={`flex justify-between items-center text-sm px-2 ${
                            (!notifications ||
                                (notifications &&
                                    notifications.length === 0)) &&
                            "border-b"
                        }`}
                    >
                        {isConfirmReadAll ? (
                            <button
                                onClick={handleReadAllNotification}
                                className="text-primary hover:underline flex"
                            >
                                Confirm
                                <MdDone />
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirmReadAll}
                                className="text-primary hover:underline"
                            >
                                Read
                            </button>
                        )}

                        <h2 className="w-full py-3 text-center text-lg font-semibold">
                            Notifications
                        </h2>
                        {isConfirmDeletion ? (
                            <button
                                onClick={handleDeleteAllNotification}
                                className="text-red-400 hover:underline flex"
                            >
                                Confirm
                                <MdDone />
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirmDeletion}
                                className="text-red-400 hover:underline"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div key={notification._id}>
                                <Notification
                                    notification={notification}
                                    currentUser={currentUser}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="block px-4 py-2 text-sm text-gray-700 text-center mt-3 w-full">
                            You have no notifications
                        </div>
                    )}
                </SimpleBar>
            </MenuItems>
        </>
    );
}
