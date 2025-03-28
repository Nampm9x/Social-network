import {
    acceptGroupMember,
    approvePost,
    cancelPendingMember,
    createGroup,
    createGroupPost,
    deleteGroup,
    deletePost,
    editGroup,
    getComments,
    getGroup,
    getGroupPost,
    getGroupPosts,
    getGroupSuggestions,
    getPendingPosts,
    getReplyComments,
    getYourGroupPostsForFeed,
    getYourGroups,
    getYourGroupsJoined,
    getYourPendingGroups,
    getYourPendingPosts,
    joinGroup,
    leaveGroup,
    likeComment,
    likePost,
    rejectPost,
    searchGroups,
    sendComment,
} from "@/redux/features/group/api";
import { IComment } from "@/types/comment";
import { IGroup } from "@/types/group";
import { IGroupPost } from "@/types/grouppost";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

export const useGetGroup = (groupId: string) => {
    return useQuery({
        queryKey: ["group", groupId],
        queryFn: () => {
            return getGroup(groupId);
        },
        retry: 1,
        enabled: groupId !== "feed",
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetYourGroupPostsForFeed = (groupId: string) => {
    const limit = 5;
    return useInfiniteQuery({
        queryKey: ["group-posts-for-feed"],
        queryFn: ({ pageParam = 0 }) =>
            getYourGroupPostsForFeed({
                pageParam,
                limit,
            }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length * limit : undefined;
        },
        retry: 2,
        initialPageParam: 0,
        staleTime: 60 * 1000 * 60,
        enabled: groupId === "feed",
    });
};

export const useGetGroupPost = (groupId: string, postId: string) => {
    return useQuery({
        queryKey: ["group-post", postId],
        queryFn: () => {
            return getGroupPost(groupId, postId);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetGroupPosts = (groupId: string) => {
    return useQuery({
        queryKey: ["group-posts", groupId],
        queryFn: () => {
            return getGroupPosts(groupId);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetPendingPosts = (groupId: string, currentTab: string) => {
    return useQuery({
        queryKey: ["pending-posts", groupId],
        queryFn: () => {
            return getPendingPosts(groupId);
        },
        retry: 1,
        enabled: currentTab === "Pending posts",
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetYourPendingPosts = (groupId: string, currentTab: string) => {
    return useQuery({
        queryKey: ["your-pending-posts", groupId],
        queryFn: () => {
            return getYourPendingPosts(groupId);
        },
        retry: 1,
        enabled: currentTab === "Your pending posts",
        staleTime: 1000 * 60 * 60,
    });
};

export const useJoinGroup = (userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId }: { groupId: string }) => joinGroup(groupId),
        onSuccess: (updatedData, variable) => {
            queryClient.setQueryData(["group", updatedData._id], updatedData);
            if (updatedData?.pendingMembers?.some(member => member._id === userId)) {
                queryClient.setQueryData(
                    ["your-pending-groups"],
                    (oldGroups: IGroup[]) => {
                        if (oldGroups) {
                            return [...oldGroups, updatedData];
                        }
                        return [updatedData];
                    }
                );
                queryClient.setQueryData(
                    ["group-suggestions"],
                    (oldGroups: IGroup[] | undefined) => {
                        if (oldGroups) {
                            return oldGroups.filter(
                                (group) => group._id !== updatedData._id
                            );
                        }
                        return oldGroups;
                    }
                );
            } else {
                queryClient.setQueryData(
                    ["your-pending-groups"],
                    (oldGroups: IGroup[]) => {
                        if (oldGroups) {
                            return oldGroups.filter(
                                (group) => group._id !== updatedData._id
                            );
                        }
                        return oldGroups;
                    }
                );
                queryClient.setQueryData(
                    ["group-suggestions"],
                    (oldGroups: IGroup[] | undefined) => {
                        if (oldGroups) {
                            return [...oldGroups, updatedData];
                        }
                        return oldGroups;
                    }
                );
            }
        },
    });
};

export const useLeaveGroup = (groupId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            groupId,
            userId,
        }: {
            groupId: string;
            userId: string;
        }) => leaveGroup(groupId, userId),
        onSuccess: (updatedData, variable) => {
            queryClient.setQueryData(["group", groupId], (oldGroup: IGroup) => {
                if (oldGroup) {
                    return {
                        ...oldGroup,
                        members: oldGroup.members.filter(
                            (member: { _id: string }) => member._id !== userId
                        ),
                    };
                }
                return oldGroup;
            });
        },
    });
};

export const useDeleteGroup = (groupId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) => deleteGroup(groupId),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["group", groupId] });
            queryClient.setQueryData(["your-groups"], (oldGroups: IGroup[]) => {
                if (oldGroups) {
                    return oldGroups.filter((group) => group._id !== groupId);
                }
                return oldGroups;
            });
        },
    });
};

export const useEditGroup = (groupId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => editGroup(groupId, data),
        onSuccess: (updatedData, variables) => {
            queryClient.setQueryData(["group", groupId], updatedData);
        },
    });
};

export const useAcceptGroupMember = (groupId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            groupId,
            userId,
        }: {
            groupId: string;
            userId: string;
        }) => acceptGroupMember(groupId, userId),
        onSuccess: (updatedData, variables) => {
            queryClient.setQueryData(["group", groupId], updatedData);
        },
    });
};

export const useCancelPendingMember = (groupId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            groupId,
            userId,
        }: {
            groupId: string;
            userId: string;
        }) => cancelPendingMember(groupId, userId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["group", groupId],
                (oldGroup: IGroup | undefined) => {
                    if (oldGroup) {
                        return {
                            ...oldGroup,
                            pendingMembers: oldGroup?.pendingMembers?.filter(
                                (member: { _id: string }) =>
                                    member._id !== userId
                            ),
                        };
                    }
                    return oldGroup;
                }
            );
        },
    });
};

export const useApprovePost = (groupId: string, postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            groupId,
        }: {
            postId: string;
            groupId: string;
        }) => approvePost(postId, groupId),
        onSuccess: (newPost, variables) => {
            queryClient.setQueryData(
                ["group-posts", groupId],
                (oldPosts: IGroupPost[] | []) => {
                    if (oldPosts && oldPosts.length > 0) {
                        return [newPost, ...oldPosts];
                    }
                    return [newPost];
                }
            );
            queryClient.setQueryData(
                ["pending-posts", groupId],
                (oldPosts: IGroupPost[] | []) => {
                    if (oldPosts && oldPosts.length > 0) {
                        return oldPosts.filter((post) => post._id !== postId);
                    }
                    return [];
                }
            );
            queryClient.setQueryData(
                ["your-pending-posts", groupId],
                (oldPendingPosts: IGroupPost[]) => {
                    if (oldPendingPosts && oldPendingPosts.length > 0) {
                        return oldPendingPosts.filter(
                            (post) => post._id !== postId
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useRejectPost = (groupId: string, postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            groupId,
        }: {
            postId: string;
            groupId: string;
        }) => rejectPost(postId, groupId),
        onSuccess: (newPost, variables) => {
            queryClient.setQueryData(
                ["pending-posts", groupId],
                (oldPosts: IGroupPost[] | undefined) => {
                    if (oldPosts && oldPosts.length > 0) {
                        return oldPosts.filter((post) => post._id !== postId);
                    }
                    return [];
                }
            );
            queryClient.setQueryData(
                ["your-pending-posts", groupId],
                (oldPendingPosts: IGroupPost[]) => {
                    if (oldPendingPosts && oldPendingPosts.length > 0) {
                        return oldPendingPosts.filter(
                            (post) => post._id !== postId
                        );
                    }
                    return [];
                }
            );
        },
    });
};

export const useDeletePost = (postId: string, groupId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId }: { postId: string }) => deletePost(postId),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["group-post", postId] });
            queryClient.setQueryData(
                ["group-posts-for-feed"],
                (oldPosts: IGroupPost[] | undefined) => {
                    if (oldPosts) {
                        return oldPosts.filter((post) => post._id !== postId);
                    }
                    return [];
                }
            );
            if (groupId) {
                queryClient.setQueryData(
                    ["group-posts", groupId],
                    (oldPosts: IGroup[] | undefined) => {
                        if (oldPosts) {
                            return oldPosts.filter(
                                (post) => post._id !== postId
                            );
                        }
                    }
                );
            }
        },
    });
};

export const useGetComments = (postId: string, commentModalIsOpen: boolean) => {
    return useQuery({
        queryKey: ["group-post-comments", postId],
        queryFn: () => {
            return getComments(postId);
        },
        retry: 1,
        enabled: commentModalIsOpen,
        staleTime: 1000 * 60 * 60,
    });
};

export const useLikePost = (postId: string, groupId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId }: { postId: string }) => likePost(postId),
        onSuccess: (response, variables) => {
            queryClient.setQueryData(
                ["group-post", postId],
                (oldPost: IGroupPost) => {
                    if (oldPost) {
                        return {
                            ...oldPost,
                            likes: response,
                        };
                    }
                    return null;
                }
            );
            queryClient.setQueryData(
                ["group-posts", groupId],
                (oldPosts?: IGroupPost[]) => {
                    if (oldPosts) {
                        return oldPosts.map((post) =>
                            post._id === postId
                                ? { ...post, likes: response }
                                : post
                        );
                    }
                    return oldPosts;
                }
            );
            queryClient.setQueryData(
                ["group-posts-for-feed"],
                (oldPosts?: IGroupPost[]) => {
                    if (oldPosts) {
                        return oldPosts.map((post) =>
                            post._id === postId
                                ? { ...post, likes: response }
                                : post
                        );
                    }
                    return oldPosts;
                }
            );
        },
    });
};

export const useCreateGroupPost = (
    groupId: string,
    userId: string,
    groupOwner: string
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            content,
            images,
            groupId,
        }: {
            content: string;
            images: string[];
            groupId: string;
        }) => createGroupPost(content, images, groupId),
        onSuccess: (newPost, variables) => {
            if (groupOwner === userId) {
                queryClient.setQueryData<IGroupPost[]>(
                    ["group-posts", groupId],
                    (oldPosts) => {
                        if (oldPosts) {
                            return [newPost, ...oldPosts];
                        }
                        return [newPost];
                    }
                );
            } else {
                queryClient.setQueryData<IGroupPost[]>(
                    ["your-pending-posts", groupId],
                    (oldPosts) => {
                        if (oldPosts) {
                            return [newPost, ...oldPosts];
                        }
                        return [newPost];
                    }
                );
                queryClient.setQueryData<IGroupPost[]>(
                    ["pending-posts", groupId],
                    (oldPosts) => {
                        if (oldPosts) {
                            return [newPost, ...oldPosts];
                        }
                        return [newPost];
                    }
                );
            }
        },
    });
};

export const useSendComment = (postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            comment,
            replyingTo,
        }: {
            postId: string;
            comment: string;
            replyingTo: string;
        }) => sendComment(postId, comment, replyingTo),
        onSuccess: (newComment, variables) => {
            queryClient.setQueryData(
                ["group-post-comments", postId],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return [newComment, ...oldComments];
                    }
                    return [newComment];
                }
            );
            if (newComment.replyingTo && newComment.replyingTo !== "") {
                queryClient.setQueryData(
                    ["reply-comments", newComment._id],
                    (oldComments: IComment[]) => {
                        if (oldComments) {
                            return [newComment, ...oldComments];
                        }
                        return [newComment];
                    }
                );
            }
        },
    });
};

export const useGetReplyComments = (commentId: string) => {
    return useQuery({
        queryKey: ["reply-comments", commentId],
        queryFn: () => {
            return getReplyComments(commentId);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useLikeComment = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId }: { commentId: string }) =>
            likeComment(commentId),
        onSuccess: (response, { commentId }) => {
            queryClient.setQueryData(
                ["group-post-comments", id],
                (oldComments: IComment[] | undefined) => {
                    if (oldComments) {
                        return oldComments.map((comment) =>
                            comment._id === commentId
                                ? { ...comment, likes: response }
                                : comment
                        );
                    }
                    return oldComments;
                }
            );
            queryClient.setQueryData(
                ["reply-comments", id],
                (oldComments: IComment[] | undefined) => {
                    if (oldComments) {
                        return oldComments.map((comment) =>
                            comment._id === commentId
                                ? { ...comment, likes: response }
                                : comment
                        );
                    }
                    return oldComments;
                }
            );
        },
    });
};

export const useGetYourGroups = (currentTab: string) => {
    return useQuery({
        queryKey: ["your-groups"],
        queryFn: () => {
            return getYourGroups();
        },
        retry: 1,
        enabled: currentTab === "Yours",
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetYourGroupsJoined = (currentTab: string) => {
    return useQuery({
        queryKey: ["your-groups-joined"],
        queryFn: () => {
            return getYourGroupsJoined();
        },
        retry: 1,
        enabled: currentTab === "Joined",
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetYourPendingGroups = (currentTab: string) => {
    return useQuery({
        queryKey: ["your-pending-groups"],
        queryFn: () => {
            return getYourPendingGroups();
        },
        retry: 1,
        enabled: currentTab === "Pending",
        staleTime: 1000 * 60 * 60,
    });
};

export const useSearchGroups = (query: string) => {
    return useQuery({
        queryKey: ["search-groups", query],
        queryFn: () => {
            return searchGroups(query);
        },
        retry: 1,
        enabled: !!query,
        staleTime: 1000 * 60 * 1,
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => createGroup(data),
        onSuccess: (newGroup: IGroup, variables) => {
            queryClient.setQueryData(["your-groups"], (oldGroups: IGroup[]) => {
                if (oldGroups) {
                    return [...oldGroups, newGroup];
                }
                return [newGroup];
            });
        },
    });
};

export const useGetGroupSuggestions = () => {
    return useQuery({
        queryKey: ["group-suggestions"],
        queryFn: () => {
            return getGroupSuggestions();
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};
