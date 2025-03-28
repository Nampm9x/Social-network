"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IUserS } from "@/types/user";
import { IPost } from "@/types/post";
import Post from "@/components/profile/Post";

export default function Posts({
    posts,
    currentUser,
}: {
    posts: IPost[];
    currentUser: IUserS;
}) {
    return (
        <>
            {posts.length > 0 ? (
                posts.map((post: IPost) => (
                    <div key={post._id}>
                        <div className="mt-4 lg:mt-8">
                            <Post post={post} currentUser={currentUser} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white py-4 lg:py-8 px-2 text-center font-semibold mt-4 lg:mt-8">
                    No posts to show
                </div>
            )}
        </>
    );
}
