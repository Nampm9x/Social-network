import {
    archiveConversation,
    createConversation,
    createGroup,
    createMessage,
    getArchivedConversations,
    getConversation,
    getConversationByUserId,
    getConversations,
    getMedia,
    getMemberOfGroup,
    getMessages,
    getUserToSendMessage,
    readMessage,
    unArchiveConversation,
    updateConversation,
    leaveGroup,
    searchConversations,
    deleteConversation,
} from "@/redux/features/message/api";
import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { IUser, IUserS } from "@/types/user";

export const useGetConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: () => {
            return getConversations();
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useSearchConversations = (search: string) => {
    return useQuery({
        queryKey: ["search-conversations", search],
        queryFn: () => {
            return searchConversations(search);
        },
        retry: 1,
        enabled: !!search,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetConversation = (conversationId: string) => {
    return useQuery({
        queryKey: ["conversation", conversationId],
        queryFn: () => {
            return getConversation(conversationId);
        },
        retry: 1,
        enabled: conversationId !== "conversation",
        staleTime: 60 * 1000 * 60,
    });
};

export const useGetConversationByUserId = (userId: string, user: IUserS) => {
    return useQuery({
        queryKey: ["conversation", userId, user?._id],
        queryFn: () => {
            return getConversationByUserId(userId, user);
        },
        retry: 1,
        enabled: !!userId && !!user?._id,
        staleTime: 1000 * 60 * 5,
    });
};

export const useGetArchivedConversations = (
    isDisplayArchivedConversations: boolean
) => {
    return useQuery({
        queryKey: ["archived-conversations"],
        queryFn: () => {
            return getArchivedConversations();
        },
        retry: 1,
        enabled: isDisplayArchivedConversations,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetMessages = (conversationId: string) => {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => {
            return getMessages(conversationId);
        },
        retry: 1,
        enabled: conversationId !== "",
        staleTime: 1000 * 60 * 60,
    });
};

export const useReadMessage = (
    conversationId: string,
    userId: string,
    user: IUser
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId }: { conversationId: string }) =>
            readMessage(conversationId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["messages", conversationId],
                (oldMessages: IMessage[]) => {
                    if (oldMessages) {
                        return oldMessages.map((msg) => {
                            if (!msg.read.includes(userId)) {
                                return {
                                    ...msg,
                                    read: [...msg.read, userId],
                                };
                            }
                            return msg;
                        });
                    }
                    return [];
                }
            );
            queryClient.setQueryData(
                ["conversation", conversationId],
                (oldConversation: IConversation) => {
                    if (oldConversation) {
                        return {
                            ...oldConversation,
                            lastMessageRead: [
                                ...oldConversation.lastMessageRead,
                                user,
                            ],
                        };
                    }
                    return [];
                }
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.map((conversation) => {
                            if (conversation._id === conversationId) {
                                return {
                                    ...conversation,
                                    lastMessageRead: [
                                        ...conversation.lastMessageRead,
                                        user,
                                    ],
                                };
                            }
                            return conversation;
                        });
                    }
                }
            );
        },
    });
};

export const useArchiveConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId }: { conversationId: string }) =>
            archiveConversation(conversationId),
        onSuccess: (newData: IConversation) => {
            queryClient.setQueryData(
                ["archived-conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return [newData, ...oldConversations];
                    }
                    return [newData];
                }
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.filter(
                            (conversation) => conversation._id !== newData._id
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useUnArchiveConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId }: { conversationId: string }) =>
            unArchiveConversation(conversationId),
        onSuccess: (newData: IConversation) => {
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return [newData, ...oldConversations];
                    }
                    return [newData];
                }
            );
            queryClient.setQueryData(
                ["archived-conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.filter(
                            (conversation) => conversation._id !== newData._id
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useDeleteConversation = (conversationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId }: { conversationId: string }) =>
            deleteConversation(conversationId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["archived-conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.filter(
                            (conversation) => conversation._id !== conversationId
                        );
                    }
                    return [];
                }
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.filter(
                            (conversation) => conversation._id !== conversationId
                        );
                    }
                    return [];
                }
            );
            queryClient.setQueryData(["messages", conversationId], (oldMessages:IMessage[]) => {
                return [];
            });

        },
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            members,
            type,
            lastMessage,
            lastMessageTime,
            conversationPicture,
            conversationName,
        }: {
            members: string[];
            type: string;
            lastMessage: string;
            lastMessageTime: any;
            conversationPicture: string;
            conversationName: string;
        }) =>
            createGroup(
                members,
                type,
                lastMessage,
                lastMessageTime,
                conversationPicture,
                conversationName
            ),
        onSuccess: (newConversation: IConversation) => {
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return [newConversation, ...oldConversations];
                    }
                    return [newConversation];
                }
            );
        },
    });
};

export const useGetUserToSendMessage = (query: string) => {
    return useQuery({
        queryKey: ["users-to-send-message", query],
        queryFn: () => {
            return getUserToSendMessage(query);
        },
        retry: 1,
        enabled: !!query,
    });
};

export const useGetMemberOfGroup = (userId: string) => {
    return useQuery({
        queryKey: ["member-of-group", userId],
        queryFn: () => {
            return getMemberOfGroup(userId);
        },
        retry: 1,
        enabled: true,
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            members,
            lastMessage,
            lastMessageTime,
        }: {
            members: string[];
            lastMessage: string;
            lastMessageTime: string;
        }) => createConversation(members, lastMessage, lastMessageTime),
        onSuccess: (newConversation: IConversation) => {
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return [newConversation, ...oldConversations];
                    }
                    return [newConversation];
                }
            ),
                queryClient.setQueryData(
                    ["conversation", newConversation._id],
                    newConversation
                );
        },
    });
};

export const useUpdateConversation = (conversationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            conversationId,
            lastMessage,
            lastMessageTime,
        }: {
            conversationId: string;
            lastMessage: string;
            lastMessageTime: string;
        }) => updateConversation(conversationId, lastMessage, lastMessageTime),
        onSuccess: (updatedConversation: IConversation) => {
            queryClient.setQueryData(
                ["conversation", conversationId],
                updatedConversation
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.map((conversation) =>
                            conversation._id === updatedConversation._id
                                ? { ...conversation, ...updatedConversation }
                                : conversation
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useCreateMessage = (share?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            conversationId,
            text,
            members,
            type,
            replyTo,
        }: {
            conversationId: string;
            text: string;
            members: any[];
            type: string;
            replyTo?: any;
        }) => createMessage(conversationId, text, members, type, replyTo),
        onSuccess: (newMessage: any) => {
            if (!share) return;
            queryClient.setQueryData(
                ["messages", newMessage.conversationId],
                (oldMessages: IMessage[] | undefined) => {
                    if (oldMessages) {
                        return [...oldMessages, newMessage];
                    }
                    return [newMessage];
                }
            );
        },
    });
};

export const useGetMedia = (conversationId: string) => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ["media-message", conversationId],
        queryFn: ({ pageParam = 0 }) =>
            getMedia({
                pageParam,
                limit,
                conversationId,
            }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length * limit : undefined;
        },
        retry: 2,
        initialPageParam: 0,
        staleTime: 60 * 1000 * 60,
        enabled: !!conversationId,
    });
};

export const useLeaveGroup = (conversationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            leaveGroup(conversationId, userId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["conversation", conversationId],
                undefined
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.filter(
                            (conversation) =>
                                conversation._id !== conversationId
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useKickMemberToGroup = (
    conversationId: string,
    memberToKick: string
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            leaveGroup(conversationId, userId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["conversation", conversationId],
                (oldConversation: IConversation) => {
                    if (oldConversation) {
                        return {
                            ...oldConversation,
                            members: oldConversation?.members.filter(
                                (member) => member._id !== memberToKick
                            ),
                        };
                    }
                }
            );
            queryClient.setQueryData(
                ["conversations"],
                (oldConversations: IConversation[]) => {
                    if (oldConversations) {
                        return oldConversations.map((conversation) => {
                            if (conversation._id === conversationId) {
                                return {
                                    ...conversation,
                                    members: conversation.members.filter(
                                        (member) => member._id !== memberToKick
                                    ),
                                };
                            }
                            return conversation;
                        });
                    }
                }
            );
        },
    });
};
