"use client";

import About from "@/components/profile/About";
import Information from "@/components/profile/Information";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import Friends from "@/components/profile/Friends";
import CreatePost from "@/components/home/CreatePost";
import Feed from "@/components/profile/Feed";
import Posts from "@/components/profile/Posts";
import Events from "@/components/profile/Events";
import FriendsTab from "@/components/profile/FriendsTab";
import SimpleBar from "simplebar-react";
import debounce from "lodash.debounce";
import { useGetCurrentUser, useGetUser } from "@/hooks/react-query/user";
import { useGetPostsAndEvents } from "@/hooks/react-query/profile";
import LoadingProfile from "@/components/loading/LoadingProfile";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function Profile() {
    const { data: currentUser } = useGetCurrentUser();
    const { username } = useParams() as { username: string };
    const { data: user, isLoading: isLoadingUser } = useGetUser(username);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useGetPostsAndEvents(user?._id);

    const [navigation, setNavigation] = useState<string>("Feed");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const STORAGE_KEY = "scrollProfilePage";

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

    const combinedAndSortedItems = data?.pages
        ?.flatMap((page: any) => [...page.posts, ...page.events])
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

    const posts = data?.pages.flatMap((page) => page.posts) || [];
    const events = data?.pages.flatMap((page) => page.events) || [];

    return (
        <>
            {isLoadingUser && <LoadingProfile />}
            {user ? (
                <div className="flex gap-4 xl:gap-8">
                    <div className="w-full md:w-2/3 h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg pr-3">
                        <SimpleBar
                            className="h-full w-full rounded-lg"
                            scrollableNodeProps={{ ref: containerRef }}
                            onScrollCapture={debouncedHandleScroll}
                        >
                            <Information
                                user={user}
                                currentUser={currentUser}
                                navigation={navigation}
                                setNavigation={setNavigation}
                            />

                            {currentUser?.username === username &&
                                (navigation === "Feed" ||
                                    navigation === "Posts" ||
                                    navigation === "Events") && (
                                    <div className="mt-4 lg:mt-8">
                                        <CreatePost
                                            currentUser={currentUser}
                                            posts={posts}
                                            events={events}
                                        />
                                    </div>
                                )}
                            {navigation === "Feed" ? (
                                combinedAndSortedItems &&
                                combinedAndSortedItems.length > 0 ? (
                                    <div>
                                        <Feed
                                            combinedAndSortedItems={
                                                combinedAndSortedItems
                                            }
                                            currentUser={currentUser}
                                            loadingNewsfeed={isFetchingNextPage}
                                            posts={posts}
                                            hasMore={hasNextPage}
                                        />
                                    </div>
                                ) : (
                                    <div className="font-semibold mt-4 lg:mt-8 py-4 lg:py-8 flex justify-center items-center px-4 rounded-lg bg-white">
                                        No feed to show
                                    </div>
                                )
                            ) : navigation === "Friends" ? (
                                <div className="p-4 mt-4 lg:mt-8 bg-white rounded-lg">
                                    <FriendsTab
                                        currentUser={currentUser}
                                        user={user}
                                    />
                                </div>
                            ) : navigation === "Posts" ? (
                                <Posts
                                    posts={posts}
                                    currentUser={currentUser}
                                />
                            ) : navigation === "Events" ? (
                                <Events
                                    events={events}
                                    currentUser={currentUser}
                                />
                            ) : navigation === "About" ? (
                                <div className="mt-4 lg:mt-8">
                                    <About
                                        user={user}
                                        currentUser={currentUser}
                                    />
                                </div>
                            ) : null}
                        </SimpleBar>
                    </div>
                    <div className="hidden md:block md:w-1/3 h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)]">
                        <SimpleBar
                            className="h-full w-full rounded-lg"
                            
                            onScrollCapture={debouncedHandleScroll}
                        >
                            <About user={user} currentUser={currentUser} />
                            <Friends
                                user={user}
                                currentUser={currentUser}
                                friends={user?.friends}
                                setNavigation={setNavigation}
                            />
                        </SimpleBar>
                    </div>
                </div>
            ) : (
                !isLoadingUser && (
                    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                        User not found
                    </div>
                )
            )}
        </>
    );
}
