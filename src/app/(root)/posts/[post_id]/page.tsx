"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { IPost } from "@/types/post";
import Post from "@/components/profile/Post";
import ListPosts from "@/components/post/ListPosts";
import SimpleBar from "simplebar-react";
import SamePosts from "@/components/post/SamePosts";
import { useGetPost, useGetPosts } from "@/hooks/react-query/post";
import LoadingPost from "@/components/loading/LoadingPost";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function page() {
    const { post_id } = useParams() as { post_id: string };
    const { data: currentUser } = useGetCurrentUser();
    const { data: post, isLoading: isLoadingPost } = useGetPost(post_id);
    const { data: posts, isLoading: isLoadingPosts } = useGetPosts(
        post?.owner?._id || ""
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

    if (!post) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] font-semibold bg-white rounded-lg">
                You do not have permission to view this post.
            </div>
        );
    }

    return (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8 justify-center">
            {/* <SimpleBar className="hidden md:block md:w-1/3 lg:w-1/4 bg-white h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg">
                <ListPosts posts={posts || []} post_id={post_id} post={post} />
            </SimpleBar> */}
            <SimpleBar className="w-full hidden md:block md:w-2/3 bg-white h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg">
                {isLoadingPosts && <LoadingPost />}
                <Post post={post} currentUser={currentUser} />
            </SimpleBar>
            {/* <SimpleBar className="hidden lg:block lg:w-1/4 bg-white h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg">
                <SamePosts post={post} />
            </SimpleBar> */}
        </div>
    );
}
