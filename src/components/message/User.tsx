"use client";

import { IUser, IUserS } from "@/types/user";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction } from "react";
import { useGetConversationByUserId } from "@/hooks/react-query/message";

export default function User({
    user,
    currentUser,
    setCreateConversationModalIsOpen,
}: {
    user: IUser;
    currentUser: IUserS;
    setCreateConversationModalIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const router = useRouter();

    const { data: result, isLoading: isLoadingResult } =
        useGetConversationByUserId(currentUser?._id, user);

    const handleMessage = async () => {
        if (isLoadingResult) {
            return;
        }

        if (!result) {
            const localConversationData = localStorage.getItem(
                `conversation_${user._id}`
            );

            if (!localConversationData) {
                const temp = {
                    id: `temp_${user._id}`,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    username: user.username,
                };
                localStorage.setItem(
                    `conversation_${user._id}`,
                    JSON.stringify(temp)
                );
                router.push(`/messages/${temp.id}`);
            } else {
                const parsedData = JSON.parse(localConversationData);
                router.push(`/messages/${parsedData.id}`);
            }
        } else {
            router.push(`/messages/${result._id}`);
        }

        setCreateConversationModalIsOpen(false);
    };

    return (
        <div
            onClick={handleMessage}
            className="hover:bg-third rounded hover:cursor-pointer flex gap-3 items-center mx-2 p-2 border-b"
        >
            <img
                className="h-10 w-10 rounded-full"
                src={user.profilePicture}
                alt="Image"
            />
            <p className="font-semibold">{user.name}</p>
        </div>
    );
}
