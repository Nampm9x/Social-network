import {
    commentEvent,
    createEvent,
    deleteEvent,
    editEvent,
    followEvent,
    getComments,
    getEvent,
    getEvents,
    getReplyComments,
    likeCommentEvent,
    likeEvent,
    viewEvent,
} from "@/redux/features/event/api";
import { IComment } from "@/types/comment";
import { IEvent } from "@/types/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => createEvent(data),
        onSuccess: (newEvent: IEvent) => {
            queryClient.setQueryData(
                ["events", newEvent.owner._id],
                (oldEvents: IEvent[]) => {
                    if (oldEvents) {
                        return [newEvent, ...oldEvents];
                    }
                    return [newEvent];
                }
            );
            queryClient.setQueryData(["event", newEvent._id], newEvent);
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [newEvent],
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
                                    events: [newEvent, ...page.events],
                                };
                            }
                            return page;
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-evnets-for-profile", newEvent.owner._id],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [newEvent],
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
                                    events: [newEvent, ...page.events],
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

export const useGetEvent = (eventId: string) => {
    return useQuery<IEvent>({
        queryKey: ["event", eventId],
        queryFn: () => {
            return getEvent(eventId);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetEvents = (userId: string) => {
    return useQuery({
        queryKey: ["events", userId],
        queryFn: () => {
            return getEvents(userId);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetComments = (
    eventId: string,
    commentModalIsOpen: boolean
) => {
    return useQuery({
        queryKey: ["comments-event", eventId],
        queryFn: () => {
            return getComments(eventId);
        },
        retry: 1,
        enabled: !!eventId && commentModalIsOpen,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetReplyComments = (commentId: string, isShowReplyingComment: boolean) => {
    return useQuery({
        queryKey: ["reply-comments-event", commentId],
        queryFn: () => {
            return getReplyComments(commentId);
        },
        retry: 1,
        enabled: !!commentId && isShowReplyingComment,
        staleTime: 1000 * 60 * 60,
    });
};

export const useCommentEvent = (eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            eventId,
            comment,
            replyingTo,
        }: {
            eventId: string;
            comment: string;
            replyingTo?: string;
        }) => commentEvent(eventId, comment, replyingTo),
        onSuccess: (newComment: IComment) => {
            queryClient.setQueryData(
                ["comments-event", eventId],
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

export const useLikeCommentEvent = (commentId: string, eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => likeCommentEvent(commentId),
        onSuccess: (response) => {
            queryClient.setQueryData(
                ["comment", commentId],
                (oldComment: IComment) => {
                    if (oldComment) {
                        return {
                            ...oldComment,
                            likes: response,
                        };
                    }
                    return oldComment;
                }
            );
            queryClient.setQueryData(
                ["comments-event", eventId],
                (oldComments: IComment[]) => {
                    if (oldComments) {
                        return oldComments.map((comment) => {
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

export const useFollowEvent = (eventId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => followEvent(eventId),
        onSuccess: (newData) => {
            queryClient.setQueryData(["event", eventId], (oldEvent: IEvent) => {
                if (oldEvent) {
                    return {
                        ...oldEvent,
                        followers: newData,
                    };
                }
                return oldEvent;
            });
            queryClient.setQueryData(
                ["events", userId],
                (oldEvents: IEvent[] | undefined) => {
                    if (oldEvents) {
                        return oldEvents.map((event) =>
                            event._id === eventId
                                ? { ...event, followers: newData }
                                : event
                        );
                    }
                    return oldEvents;
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
                                events: page.events.map((event: any) => {
                                    if (event._id === eventId) {
                                        return {
                                            ...event,
                                            followers: newData,
                                        };
                                    }
                                    return event;
                                }),
                            };
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-profile", userId],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                events: page.events.map((event: any) => {
                                    if (event._id === eventId) {
                                        return {
                                            ...event,
                                            followers: newData,
                                        };
                                    }
                                    return event;
                                }),
                            };
                        }),
                    };
                }
            );
        },
    });
};

export const useViewEvent = (eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => viewEvent(eventId),
    });
};

export const useLikeEvent = (eventId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => likeEvent(eventId),
        onSuccess: (response) => {
            queryClient.setQueryData(
                ["event", eventId],
                (oldEvent: IEvent | undefined) => {
                    if (oldEvent) {
                        return {
                            ...oldEvent,
                            likes: response,
                        };
                    }
                    return oldEvent;
                }
            );
            queryClient.setQueryData(
                ["events", userId],
                (oldEvents: IEvent[] | undefined) => {
                    if (oldEvents) {
                        return oldEvents.map((event) =>
                            event._id === eventId
                                ? { ...event, likes: response }
                                : event
                        );
                    }
                    return oldEvents;
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
                                events: page.events.map((event: any) => {
                                    if (event._id === eventId) {
                                        return {
                                            ...event,
                                            likes: response,
                                        };
                                    }
                                    return event;
                                }),
                            };
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-profile", userId],
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return {
                                ...page,
                                events: page.events.map((event: any) => {
                                    if (event._id === eventId) {
                                        return {
                                            ...event,
                                            likes: response,
                                        };
                                    }
                                    return event;
                                }),
                            };
                        }),
                    };
                }
            );
        },
    });
};

export const useEditEvent = (eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => editEvent(eventId, data),
        onSuccess: (newData: IEvent) => {
            queryClient.setQueryData(["event", eventId], newData);
            queryClient.setQueryData(
                ["events", newData.owner._id],
                (oldEvents: IEvent[] | undefined) => {
                    if(Array.isArray(oldEvents)) {
                        return oldEvents.map((event) => 
                        event._id === eventId ? newData : event
                        )
                    }
                    return [newData];
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [newData],
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
                                    events: page.events.map((event: any) =>
                                        event._id === eventId ? newData : event
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
                ["posts-and-events-for-profile", newData.owner._id],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [newData],
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
                                    events: page.events.map((event: any) =>
                                        event._id === eventId ? newData : event
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

export const useDeleteEvent = (eventId: string, userId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId }: { eventId: string }) => deleteEvent(eventId),
        onSuccess: () => {
            queryClient.setQueryData(["event", eventId], (oldEvent: IEvent) => {
                if (oldEvent) {
                    return undefined;
                }
            });
            queryClient.setQueryData(
                ["events", userId],
                (oldEvents: IEvent[]) => {
                    if (oldEvents) {
                        return oldEvents.filter(
                            (event) => event._id !== eventId
                        );
                    }
                    return oldEvents;
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-home"],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [],
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
                                    events: page.events.filter(
                                        (event: any) => event._id !== eventId
                                    ),
                                };
                            }
                            return page;
                        }),
                    };
                }
            );
            queryClient.setQueryData(
                ["posts-and-events-for-profile", userId],
                (oldData: any) => {
                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    events: [],
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
                                    events: page.events.filter(
                                        (event: any) => event._id !== eventId
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
