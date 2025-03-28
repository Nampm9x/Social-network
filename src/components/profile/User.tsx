"use client";

import React, { useEffect, useState } from "react";
import { IUser, IUserS } from "@/types/user";
import {
    useCreateConversation,
    useCreateMessage,
    useGetConversationByUserId,
    useUpdateConversation,
} from "@/hooks/react-query/message";
import { IConversation } from "@/types/conversation";

export default function User({
    user,
    currentUser,
    item,
}: {
    user: any;
    currentUser: IUserS;
    item: any;
}) {
    let type;
    if (item?.title) {
        type = "events";
    } else if (item?.group) {
        type = "groups";
    } else {
        type = "posts";
    }
    const link = item.group
        ? `${process.env.NEXT_PUBLIC_CLIENT_URL}/${type}/${item.group._id}/posts/${item._id}`
        : `${process.env.NEXT_PUBLIC_CLIENT_URL}/${type}/${item._id}`;
    const [sendStatus, setSendStatus] = useState<string>("Send");

    const createConversation = useCreateConversation();
    const updateConversation = useUpdateConversation(user?._id);
    const createMessage = useCreateMessage("share");
    const handleSendMessage = () => {
        if (sendStatus === "Sent") return;
        const lastMessageTime = new Date().toISOString();
        if (user._id.startsWith("temp_")) {
            const newId = user._id.split("temp_")[1];
            createConversation.mutate(
                {
                    members: [newId, currentUser?._id],
                    lastMessage: link,
                    lastMessageTime: lastMessageTime,
                },
                {
                    onSuccess: (newConversation: IConversation) => {
                        const conversationId = newConversation._id;
                        setSendStatus("Sent");
                        setTimeout(() => {
                            setSendStatus("Send");
                        }, 3000);
                        createMessage.mutate({
                            conversationId: conversationId,
                            text: link,
                            members: [currentUser?._id, newId],
                            type: "link",
                        });
                    },
                }
            );
        } else {
            updateConversation.mutate(
                {
                    conversationId: user?._id,
                    lastMessage: link,
                    lastMessageTime: lastMessageTime,
                },
                {
                    onSuccess: (newConversation: any) => {
                        createMessage.mutate({
                            conversationId: user?._id,
                            text: link,
                            members: newConversation.members,
                            type: "link",
                        });
                    },
                }
            );
        }
        setSendStatus("Sent");
        setTimeout(() => {
            setSendStatus("Send");
        }, 3000);
    };

    return (
        <div className="rounded flex justify-between gap-3 items-center mx-2 p-2 border-b">
            <div className="flex gap-3 items-center">
                <img
                    className="h-10 w-10 rounded-full"
                    src={user.profilePicture}
                    alt="Image"
                />
                <p className="font-semibold">{user.name}</p>
            </div>
            <button
                onClick={handleSendMessage}
                className="border px-3 py-1 rounded bg-primary text-white border-primary hover:bg-white hover:text-primary"
            >
                {sendStatus}
            </button>
        </div>
    );
}
