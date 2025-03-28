import {
    createPost,
    deletePost,
    editPost,
    getComments,
    getPost,
    getPosts,
    getReplyComments,
    likeCommentPost,
    likePost,
    sendCommentPost,
    viewPost,
} from "@/redux/features/post/api";
import { IComment } from "@/types/comment";
import { IPost } from "@/types/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            content,
            visibility,
            images,
        }: {
            content: string;
            visibility: string;
            images: any[];
        }) => createPost(content, visibility, images),
        onSuccess: (newPost) => {
            queryClient.setQueryData(
                ["posts", newPost.owner._id],
                (oldPosts: IPost[]) => {
                    if (oldPosts) {
                        return [newPost, ...oldPosts];
                    }
                    return [newPost];
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    posts: [newPost],
                                },
                            ],
                        };
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    posts: [newPost, ...page.posts],
                                };
                            }
                            return page;
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-profile", newPost.owner._id],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    posts: [newPost],
                                },
                            ],
                        };
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    posts: [newPost, ...page.posts],
                                };
                            }
                            return page;
                        }),
                    };
                }
            );
        },
    });
};

export const useEditPost = (postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            content,
            visibility,
            images,
        }: {
            content: string;
            visibility: string;
            images: any[];
        }) => editPost(postId, content, visibility, images),
        onSuccess: (updatedPost) => {
            // Cập nhật post đã chỉnh sửa vào cache cho post cá nhân
            queryClient.setQueryData(["post", postId], updatedPost);

            // Cập nhật post trong danh sách các post của người dùng
            queryClient.setQueryData(
                ["posts", updatedPost.owner._id],
                (oldPosts: IPost[] | undefined) => {
                    // Kiểm tra xem oldPosts có phải là một mảng không
                    if (Array.isArray(oldPosts)) {
                        return oldPosts.map((post) =>
                            post._id === postId ? updatedPost : post
                        );
                    }
                    // Nếu không phải mảng, trả về mảng chứa updatedPost
                    return [updatedPost];
                }
            );

            // Cập nhật danh sách post trên trang chủ
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    posts: [updatedPost],
                                },
                            ],
                        };
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    posts: page.posts.map((post: any) =>
                                        post._id === postId ? updatedPost : post
                                    ),
                                };
                            }
                            return page;
                        }),
                    };
                }
            );

            // Cập nhật danh sách post trên trang profile
            queryClient.setQueryData(
                ["posts-and-events-for-profile", updatedPost.owner._id],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    posts: [updatedPost],
                                },
                            ],
                        };
                    }

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    posts: page.posts.map((post: any) =>
                                        post._id === postId ? updatedPost : post
                                    ),
                                };
                            }
                            return page;
                        }),
                    };
                }
            );
        },
    });
};

export const useGetPost = (postId: string) => {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: () => {
            return getPost(postId);
        },
        retry: 1,
        enabled: !!postId,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetPosts = (postOwnerId: string) => {
    return useQuery({
        queryKey: ["posts", postOwnerId],
        queryFn: () => {
            return getPosts(postOwnerId);
        },
        retry: 1,
        enabled: !!postOwnerId,
        staleTime: 1000 * 60 * 60,
    });
};

export const useSendCommentPost = (postId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            comment,
            replyingTo,
        }: {
            comment: string;
            replyingTo: string;
        }) => sendCommentPost(postId, comment, replyingTo),
        onSuccess: (newComment) => {
            queryClient.setQueryData(
                ["comments-post", postId],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return [newComment, ...oldComments];
                    }
                    return [newComment];
                }
            );
            queryClient.setQueryData(
                ["reply-comments-post", newComment.replyingTo],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return [...oldComments, newComment];
                    }
                    return [newComment];
                }
            );
        },
    });
};

export const useGetComments = (postId: string, commentModalIsOpen: boolean) => {
    return useQuery({
        queryKey: ["comments-post", postId],
        queryFn: () => {
            return getComments(postId);
        },
        retry: 1,
        enabled: !!postId && commentModalIsOpen,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetReplyComments = (
    commentId: string,
    isShowReplyingComment: boolean
) => {
    return useQuery({
        queryKey: ["reply-comments-post", commentId],
        queryFn: () => {
            return getReplyComments(commentId);
        },
        retry: 1,
        enabled: !!commentId && isShowReplyingComment,
        staleTime: 1000 * 60 * 60,
    });
};

export const useViewPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
            viewPost(postId),
        onSuccess: () => {},
    });
};

export const useLikePost = (postId: string, otherUserId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => likePost(postId),
        onSuccess: (response) => {
            queryClient.setQueryData(["post", postId], (oldPost: IPost) => {
                if (oldPost) {
                    return {
                        ...oldPost,
                        likes: response,
                    };
                }
                return oldPost;
            });
            queryClient.setQueryData(
                ["posts", otherUserId],
                (oldPosts: IPost[]) => {
                    if (oldPosts) {
                        return oldPosts.map((post: IPost) => {
                            if (post._id === postId) {
                                return {
                                    ...post,
                                    likes: response,
                                };
                            }
                            return post;
                        });
                    }
                    return oldPosts;
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                posts: page.posts.map((post: any) => {
                                    if (post._id === postId) {
                                        return {
                                            ...post,
                                            likes: response,
                                        };
                                    }
                                    return post;
                                }),
                            };
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-profile", otherUserId],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                posts: page.posts.map((post: any) => {
                                    if (post._id === postId) {
                                        return {
                                            ...post,
                                            likes: response,
                                        };
                                    }
                                    return post;
                                }),
                            };
                        }),
                    };
                }
            );
        },
    });
};

export const useDeletePost = (postId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId }: { postId: string }) => deletePost(postId),
        onSuccess: () => {
            queryClient.setQueryData(["post", postId], undefined);
            queryClient.setQueryData(["posts", userId], (oldPosts: IPost[]) => {
                if (oldPosts) {
                    return oldPosts.filter(
                        (post: IPost) => post._id !== postId
                    );
                }
            });
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) return;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                posts: page.posts.filter(
                                    (post: any) => post._id !== postId
                                ),
                            };
                        }),
                    };
                }
            );

            queryClient.setQueryData(
                ["posts-and-events-for-profile", userId],
                (oldData: any) => {
                    if (!oldData) return;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                posts: page.posts.filter(
                                    (post: any) => post._id !== postId
                                ),
                            };
                        }),
                    };
                }
            );
        },
    });
};

export const useLikeCommentPost = (commentId: string, postId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => likeCommentPost(commentId),
        onSuccess: (response) => {
            queryClient.setQueryData(
                ["comments-post", postId],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return oldComments.map((comment: IComment) => {
                            if (comment._id === commentId) {
                                return {
                                    ...comment,
                                    likes: response,
                                };
                            }
                            return comment;
                        });
                    }
                }
            );
            queryClient.setQueryData(
                ["reply-comments-post", postId],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return oldComments.map((comment: IComment) => {
                            if (comment._id === commentId) {
                                return {
                                    ...comment,
                                    likes: response,
                                };
                            }
                            return comment;
                        });
                    }
                }
            );
        },
    });
};
