"use client";

import YourGroups from "@/components/group/YourGroups";
import YourFeed from "@/components/group/YourFeed";
import GroupSuggestions from "@/components/group/GroupSuggestions";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import {
    useGetGroup,
    useGetYourGroupPostsForFeed,
} from "@/hooks/react-query/group";
import LoadingGroupDetail from "@/components/loading/LoadingGroupDetail";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function page() {
    const { data: currentUser } = useGetCurrentUser();

    const { group_id } = useParams() as { group_id: string };

    const { data: group, isLoading: isLoadingGroup } = useGetGroup(group_id);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useGetYourGroupPostsForFeed(group_id);

    const groupPosts = data?.pages.flatMap((page) => page.groupPosts) || [];

    useEffect(() => {
        if (!currentUser || !currentUser._id) {
            return;
        }

        socket.emit("onlineUsers", currentUser);

        return () => {
            socket.off("onlineUsers");
        };
    }, [currentUser]);

    return (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8">
            <div className="w-full hidden md:block md:w-1/3 lg:w-1/4 bg-white rounded-lg">
                <YourGroups currentUser={currentUser} />
            </div>
            <div
                className={`w-full pt-0 md:pt-0 md:block md:w-2/3 lg:w-1/2 rounded-lg`}
            >
                {isLoadingGroup && <LoadingGroupDetail />}
                <YourFeed
                    group={group}
                    group_id={group_id}
                    currentUser={currentUser}
                    groupPosts={groupPosts || []}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
            </div>
            <div className="hidden lg:block lg:w-1/4 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] bg-white rounded-lg">
                <GroupSuggestions currentUser={currentUser} />
            </div>
        </div>
    );
}
