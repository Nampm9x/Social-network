"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Newsfeed from "@/components/home/Newsfeed";
import WhoToFollow from "@/components/home/WhoToFollow";
import SimpleBar from "simplebar-react";
import debounce from "lodash.debounce";
import { useGetPostsAndEvents } from "@/hooks/react-query/home";
import { useGetCurrentUser, useWhoToFollow } from "@/hooks/react-query/user";
import GroupSuggestions from "@/components/group/GroupSuggestions";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function Home() {
    const { data: currentUser } = useGetCurrentUser();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const STORAGE_KEY = "scrollHomePage";

    useEffect(() => {
        if (!currentUser || !currentUser._id) {
            return;
        }

        socket.emit("onlineUsers", currentUser);

        return () => {
            socket.off("onlineUsers");
        };
    }, [currentUser]);

    useEffect(() => {
        const scrollElement = containerRef.current;

        // Lấy vị trí cuộn trước đó
        const savedScroll = sessionStorage.getItem(STORAGE_KEY);
        if (savedScroll && scrollElement) {
            scrollElement.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = () => {
            if (scrollElement) {
                sessionStorage.setItem(
                    STORAGE_KEY,
                    scrollElement.scrollTop.toString()
                );
            }
        };

        scrollElement?.addEventListener("scroll", handleScroll);

        return () => scrollElement?.removeEventListener("scroll", handleScroll);
    }, []);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useGetPostsAndEvents();

    const { data: whoToFollow, isLoading: isLoadingWhoToFollow } =
        useWhoToFollow();
    const debouncedHandleScroll = useCallback(
        debounce(() => {
            const container = containerRef.current;
            if (
                container &&
                hasNextPage &&
                !isFetchingNextPage &&
                container.scrollTop + container.clientHeight >=
                    container.scrollHeight - 5
            ) {
                fetchNextPage();
            }
        }, 200),
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", debouncedHandleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", debouncedHandleScroll);
            }
        };
    }, [debouncedHandleScroll]);

    const combinedAndSortedItems = data?.pages
        ?.flatMap((page) => [...page.posts, ...page.events, ...page.groupPosts])
        ?.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    const posts = data?.pages?.flatMap((page) => page.posts);
    const events = data?.pages?.flatMap((page) => page.events);
    const groupPosts = data?.pages?.flatMap((page) => page.groupPosts);

    return (
        <>
            {currentUser && (
                <div className="flex gap-4 xl:gap-8">
                    <div className="hidden lg:block lg:w-1/4 bg-white rounded-lg">
                        <GroupSuggestions currentUser={currentUser} />
                    </div>
                    <div className="w-full md:w-2/3 lg:w-1/2 h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] rounded-lg ">
                        <SimpleBar
                            className="h-full w-full rounded-lg"
                            scrollableNodeProps={{
                                ref: containerRef,
                            }}
                            onScrollCapture={debouncedHandleScroll}
                        >
                            <Newsfeed
                                combinedAndSortedItems={combinedAndSortedItems}
                                currentUser={currentUser}
                                posts={posts || []}
                                events={events || []}
                                groupPost={groupPosts || []}
                                hasMore={hasNextPage}
                                loadingNewsfeed={isFetchingNextPage}
                            />
                        </SimpleBar>
                    </div>
                    <div className="hidden md:block md:w-1/3 lg:w-1/4 bg-white rounded-lg">
                        <WhoToFollow
                            users={whoToFollow}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
