import { search } from "@/redux/features/search/api";
import { useQuery } from "@tanstack/react-query";

export const useSearch = (query: string) => {
    return useQuery({
        queryKey: ["search", query],
        queryFn: () => {
            return search(query);
        },
        retry: 1,
        enabled: !!query,
        staleTime: (1000 * 60 * 1) / 6, // 10 seconds
    });
};
