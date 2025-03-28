import { getPostsAndEvents } from "@/redux/features/profile/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetPostsAndEvents = (otherUserId: string) => {
    const limit = 3;
    return useInfiniteQuery({
        queryKey: ["posts-and-events-for-profile", otherUserId],
        queryFn: ({ pageParam = 0 }) =>
            getPostsAndEvents({
                pageParam,
                limit,
                otherUserId,
            }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length * limit : undefined;
        },
        retry: 2,
        initialPageParam: 0,
        staleTime: 60 * 1000 * 60,
        enabled: !!otherUserId,
    });
};
