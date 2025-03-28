"use client";

import { useMarkReadNotification } from "@/hooks/react-query/notification";
import { INotification } from "@/types/notification";
import { IUserS } from "@/types/user";
import { MenuItem } from "@headlessui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Notification({
    notification,
    currentUser,
}: {
    notification: INotification;
    currentUser: IUserS;
}) {
    const [currentNotification, setCurrentNotification] =
        useState<INotification>(notification);

    const router = useRouter();

    const markRead = useMarkReadNotification(
        notification?._id,
        currentUser?._id
    );
    const handleMarkRead = async () => {
        if (currentNotification.read) {
            if (notification?.link) {
                router.push(notification?.link);
            }
            return;
        }
        markRead.mutate();
        router.push(notification?.link);
    };

    return (
        <MenuItem>
            <button
                onClick={handleMarkRead}
                onMouseEnter={() => router.prefetch(notification?.link)}
                className={`w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 flex gap-2 items-center ${
                    currentNotification.read ? "" : "bg-third"
                } border-b-2`}
            >
                <div className="h-8 w-8">
                    <img
                        src={notification?.from?.profilePicture}
                        alt="Profile Picture"
                        className="h-full aspect-square rounded-full border"
                    />
                </div>

                <div className="text-start">
                    <p
                        className={`${
                            currentNotification.read ? "" : "font-semibold"
                        }`}
                    >
                        {notification?.message}
                    </p>
                    <p className="text-xs">
                        {new Date(notification?.createdAt).toLocaleString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            }
                        )}
                    </p>
                </div>
            </button>
        </MenuItem>
    );
}
