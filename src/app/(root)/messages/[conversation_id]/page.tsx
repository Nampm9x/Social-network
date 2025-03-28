"use client";

import React, { useState, useEffect, useRef } from "react";
import ListConversation from "@/components/message/ListConversation";
import { useParams } from "next/navigation";
import Message from "@/components/message/Message";
import { IMessage } from "@/types/message";
import io from "socket.io-client";
import SideBar from "@/components/message/SideBar";
import {
    useGetArchivedConversations,
    useGetConversation,
    useGetConversations,
    useGetMessages,
    useReadMessage,
} from "@/hooks/react-query/message";
import { useQueryClient } from "@tanstack/react-query";
import { IConversation } from "@/types/conversation";
import { useGetCurrentUser } from "@/hooks/react-query/user";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function ConversationPage() {
    const { data: currentUser } = useGetCurrentUser();
    const { conversation_id } = useParams() as { conversation_id: string };
    const { data: conversations = [], isLoading: isLoadingConversations } =
        useGetConversations();
    const { data: conversation = null, isLoading: isLoadingConversation } =
        useGetConversation(conversation_id);
    let { data: messages = [], isLoading: isLoadingMessages } =
        useGetMessages(conversation_id);
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [replyingTo, setReplyingTo] = useState<{
        messageid: string;
        messagetext: string;
        _id: string;
        name: string;
    }>({
        messageid: "",
        messagetext: "",
        _id: "",
        name: "",
    });
    const [isDisplayArchivedConversations, setIsDisplayArchivedConversations] =
        useState<boolean>(false);
    const {
        data: archivedConversations,
        isLoading: isLoadingArchivedConversations,
    } = useGetArchivedConversations(isDisplayArchivedConversations);
    // let onlineUsers: any;
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!currentUser || !currentUser._id) {
            return;
        }

        socket.emit("onlineUsers", currentUser);

        socket.on("onlineUsers", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("onlineUsers");
        };
    }, [currentUser]);

    useEffect(() => {
        if (conversation_id.startsWith("temp_")) {
            const messageWithUserId = conversation_id.replace("temp_", "");
            const currentConversation = localStorage.getItem(
                `conversation_${messageWithUserId}`
            );

            if (currentConversation) {
                const parsedCurrentConversation =
                    JSON.parse(currentConversation);
                queryClient.setQueryData(
                    ["conversation", conversation_id],
                    () => {
                        return {
                            _id: parsedCurrentConversation.id,
                            conversationPicture:
                                parsedCurrentConversation.profilePicture,
                            conversationName: parsedCurrentConversation.name,
                            conversationType: "",
                            lastMessage: "",
                            lastMessageSender: {
                                _id: "",
                                name: "",
                                profilePicture: "",
                                username: "",
                            },
                            lastMessageTime: "",
                            lastMessageRead: false,
                            lastMessageReceived: false,
                            lastMessageSent: false,
                            lastMessageDelivered: false,
                            createdAt: "",
                            members: [
                                {
                                    _id: "",
                                    name: "",
                                    profilePicture: "",
                                    username: "",
                                },
                            ],
                            archives: [
                                {
                                    _id: "",
                                    name: "",
                                    profilePicture: "",
                                    username: "",
                                },
                            ],
                            deleted: [
                                {
                                    _id: "",
                                    name: "",
                                    profilePicture: "",
                                    username: "",
                                },
                            ],
                        };
                    }
                );
            }
        }
    }, [conversation_id, conversation?._id, messages]);
    const queryClient = useQueryClient();
    const handleMessage = (data: any) => {
        const isMember = data.conversation.members.some(
            (member: any) => member._id === currentUser?._id
        );
        
        if (!isMember) {
            return;
        }
        queryClient.setQueryData(
            ["messages", data.populatedMessage.conversationId],
            (oldMessages: IMessage[]) => {
                // if (data.populatedMessage.sender._id === currentUser?._id) {
                //     return;
                // }
                // if (
                //     oldMessages &&
                //     oldMessages[0]?._id === oldMessages[1]?._id
                // ) {
                //     return [data.populatedMessage]
                // }
                if (oldMessages) {
                    return [...oldMessages, data.populatedMessage];
                }
                return [data.populatedMessage];
            }
        );
        queryClient.setQueryData(
            ["conversation", data.populatedMessage.conversationId],
            {
                ...data.conversation,
                lastMessageRead:
                    conversation_id === data.populatedMessage.conversationId,
            }
        );
        queryClient.setQueryData(
            ["conversations"],
            (oldConversations: IConversation[]) => {
                if (oldConversations) {
                    // Lọc conversation cần cập nhật ra trước
                    const updatedConversations = oldConversations
                        .filter(
                            (conversation) =>
                                conversation._id !== data.conversation._id
                        )
                        .map((conversation) => {
                            if (
                                conversation._id ===
                                data.populatedMessage.conversationId
                            ) {
                                return {
                                    ...data.conversation,
                                    lastMessageRead:
                                        conversation_id ===
                                        data.populatedMessage.conversationId,
                                };
                            }
                            return conversation;
                        });

                    // Đưa conversation mới lên đầu
                    return [data.conversation, ...updatedConversations];
                }

                return oldConversations;
            }
        );
        if (
            data.populatedMessage.type === "photo" ||
            data.populatedMessage.type === "video"
        ) {
            queryClient.setQueryData(
                ["media-message", data.populatedMessage.conversationId],
                (oldMedia: any) => {
                    if (!oldMedia) {
                        return {
                            pages: [
                                {
                                    media: [data.populatedMessage],
                                },
                            ],
                        };
                    }
                    return {
                        ...oldMedia,
                        pages: oldMedia.pages.map(
                            (page: any, index: number) => {
                                if (index === 0) {
                                    return {
                                        ...page,
                                        media: [
                                            data.populatedMessage,
                                            ...page.media,
                                        ],
                                    };
                                }
                                return page;
                            }
                        ),
                    };
                }
            );
        }
    };

    useEffect(() => {
        socket.on("message", handleMessage);

        return () => {
            socket.off("message", handleMessage);
        };
    }, [currentUser, messages]);

    console.log(messages);

    const readMessage = useReadMessage(
        conversation_id,
        currentUser?._id,
        currentUser
    );
    useEffect(() => {
        messages?.forEach((message: any) => {
            if (message.sender?._id !== currentUser?._id) {
                return;
            }
        });
        if (
            messages?.length === 0 ||
            (messages &&
                (messages[messages?.length - 1]?.read.includes(
                    currentUser?._id
                ) ||
                    messages[messages?.length - 1]?.sender?._id ===
                        currentUser?._id))
        )
            return;
        readMessage.mutate({
            conversationId: conversation_id,
        });
    }, [conversation_id, currentUser?._id, conversation, messages]);


    return currentUser && conversation_id === "conversation" ? (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8">
            <div className="w-full md:w-1/3">
                <ListConversation
                    isLoadingConversations={isLoadingConversations}
                    isLoadingArchivedConversations={
                        isLoadingArchivedConversations
                    }
                    isDisplayArchivedConversations={
                        isDisplayArchivedConversations
                    }
                    setIsDisplayArchivedConversations={
                        setIsDisplayArchivedConversations
                    }
                    conversations={conversations || []}
                    conversation_id={conversation_id}
                    currentUser={currentUser}
                    archivedConversations={archivedConversations || []}
                    conversation={conversation || ({} as IConversation)}
                    onlineUsers={onlineUsers}
                />
            </div>
            <div className={`w-full hidden md:block md:w-2/3`}>
                <div className="flex justify-center items-center text-lg font-semibold bg-white rounded-lg h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]">
                    Please select a conversation
                </div>
            </div>
        </div>
    ) : conversation?._id === "" || !conversation ? (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8">
            <div
                className={`w-full md:w-1/3 ${conversation?._id ? "hidden" : ""}`}
            >
                <ListConversation
                    conversations={conversations || []}
                    isLoadingConversations={isLoadingConversations}
                    isLoadingArchivedConversations={
                        isLoadingArchivedConversations
                    }
                    isDisplayArchivedConversations={
                        isDisplayArchivedConversations
                    }
                    setIsDisplayArchivedConversations={
                        setIsDisplayArchivedConversations
                    }
                    conversation_id={conversation_id}
                    currentUser={currentUser}
                    archivedConversations={archivedConversations || []}
                    conversation={conversation || ({} as IConversation)}
                    onlineUsers={onlineUsers}
                />
            </div>
            <div className={`w-full hidden md:block md:w-2/3`}>
                <div className="flex justify-center items-center text-lg font-semibold bg-white rounded-lg h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]">
                    Conversation not found
                </div>
            </div>
        </div>
    ) : (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8">
            <div
                className={`w-full ${conversation_id === "conversation" && "block"} ${conversation?._id ? "hidden md:block md:w-1/3 lg:w-1/4" : " "} md:w-1/3 lg:w-1/4`}
            >
                <ListConversation
                    conversations={conversations || []}
                    isLoadingConversations={isLoadingConversations}
                    isLoadingArchivedConversations={
                        isLoadingArchivedConversations
                    }
                    isDisplayArchivedConversations={
                        isDisplayArchivedConversations
                    }
                    setIsDisplayArchivedConversations={
                        setIsDisplayArchivedConversations
                    }
                    conversation_id={conversation_id}
                    currentUser={currentUser}
                    archivedConversations={archivedConversations || []}
                    conversation={conversation || ({} as IConversation)}
                    onlineUsers={onlineUsers}
                />
            </div>
            <div
                className={`w-full md:block md:w-2/3 lg:w-1/2 ${conversation_id === "conversation" && "sm:hidden md:block"}`}
            >
                <Message
                    conversation={conversation || ({} as IConversation)}
                    conversations={conversations || []}
                    conversation_id={conversation_id}
                    currentUser={currentUser}
                    messages={messages}
                    isReplying={isReplying}
                    setIsReplying={setIsReplying}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onlineUsers={onlineUsers}
                />
            </div>
            <div className="hidden lg:block lg:w-1/4 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]">
                <SideBar
                    conversation={conversation || ({} as IConversation)}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
}
