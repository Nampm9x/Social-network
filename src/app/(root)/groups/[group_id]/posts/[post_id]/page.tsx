"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Group from "@/components/group/Group";
import Post from "@/components/group/Post";
import SimpleBar from "simplebar-react";
import { useGetGroup, useGetGroupPost } from "@/hooks/react-query/group";
import LoadingGroup from "@/components/loading/LoadingGroup";
import LoadingPost from "@/components/loading/LoadingPost";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function page() {
    const { group_id, post_id } = useParams() as {
        group_id: string;
        post_id: string;
    };

    const { data: currentUser } = useGetCurrentUser();

    const { data: group, isLoading: isLoadingGroup } = useGetGroup(group_id);

    const { data: groupPost, isLoading: isLoadingGroupPost, isError: isErrorGroupPost, error } = useGetGroupPost(
        group_id,
        post_id
    );

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
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-lg">
                {isLoadingGroup && <LoadingGroup />}
                {group && <Group group={group} currentUser={currentUser} />}
            </div>
            <SimpleBar
                className={`w-full md:block h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto md:w-2/3 lg:w-1/2 rounded-lg bg-white`}
            >
                {isLoadingGroupPost && <LoadingPost />}
                {groupPost && (
                    <Post
                        post={groupPost}
                        currentUser={currentUser}
                        group={group}
                    />
                )}
            </SimpleBar>
            <div className="hidden lg:block lg:w-1/4 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] bg-white rounded-lg"></div>
        </div>
    );
}
