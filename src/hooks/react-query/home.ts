import { getPostsAndEvents } from "@/redux/features/home/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetPostsAndEvents = () => {
    const limit = 3;
    return useInfiniteQuery({
        queryKey: ["posts-and-events-for-home"],
        queryFn: ({ pageParam = 0 }) => getPostsAndEvents({ pageParam, limit }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length * limit : undefined;
        },
        initialPageParam: 0,
        staleTime: 60 * 1000 * 60,
    });
};
