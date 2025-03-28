"use client";

import React, { useCallback, useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import { IGroup } from "@/types/group";
import { IUser, IUserS } from "@/types/user";
import Feed from "./Feed";
import GroupDetail from "./GroupDetail";
import { IGroupPost } from "@/types/grouppost";
import debounce from "lodash.debounce";
import { BeatLoader } from "react-spinners";
import { IoMdDoneAll } from "react-icons/io";
import YourGroups from "@/components/group/YourGroups";

export default function YourFeed({
    group,
    group_id,
    currentUser,
    groupPosts,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: {
    group?: IGroup;
    group_id: string;
    currentUser: IUserS;
    groupPosts?: IGroupPost[];
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const STORAGE_KEY = "scrollNewfeedGroupPage";

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
    return (
        <>
            <SimpleBar
                scrollableNodeProps={{ ref: containerRef }}
                onScrollCapture={debouncedHandleScroll}
                className="h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] overflow-y-auto"
            >
                <div className="md:hidden bg-white mb-8 pb-1">
                    <YourGroups currentUser={currentUser} />
                </div>
                {group_id && group_id === "feed" ? (
                    groupPosts ? (
                        <>
                            <Feed
                                groupPosts={groupPosts}
                                currentUser={currentUser}
                                group={group}
                            />
                            {isFetchingNextPage && (
                                <div className="mt-4 flex justify-center items-center text-primary">
                                    <BeatLoader />
                                </div>
                            )}
                            {!hasNextPage && (
                                <div
                                    className={`mt-4 py-4 flex justify-center items-center gap-2 font-semibold bg-white rounded-lg  `}
                                >
                                    <IoMdDoneAll />
                                    No more data!
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg w-full h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] font-semibold bg-white flex items-center justify-center">
                                You haven't joined any groups yet!
                            </div>
                        </>
                    )
                ) : group_id && group && group.name ? (
                    <GroupDetail group={group} currentUser={currentUser} />
                ) : (
                    <div className="flex justify-center items-center h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] bg-white">
                        <p className="text-secondary font-semibold">
                            Group not found
                        </p>
                    </div>
                )}
            </SimpleBar>
        </>
    );
}
