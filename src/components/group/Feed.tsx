"use client";

import { IGroupPost } from "@/types/grouppost";
import { IUser, IUserS } from "@/types/user";
import { IGroup } from "@/types/group";
import React from "react";
import Post from "./Post";

export default function Feed({
    groupPosts,
    currentUser,
    group,
}: {
    groupPosts?: IGroupPost[];
    currentUser: IUserS;
    group?: IGroup;
}) {
    return (
        <>
            {groupPosts && groupPosts.length > 0 ? (
                groupPosts.map((post: IGroupPost) => (
                    <div
                        key={post._id}
                        className="mb-4 lg:mb-8 bg-white w-full p-2 rounded-lg"
                    >
                        {group ? (
                            <Post
                                currentUser={currentUser}
                                post={post}
                                group={group}
                            />
                        ) : (
                            <Post
                                currentUser={currentUser}
                                post={post}
                            />
                        )}
                    </div>
                ))
            ) : (
                <div className="flex justify-center items-center h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] bg-white">
                    <p className="text-secondary font-semibold">
                        No posts found
                    </p>
                </div>
            )}
        </>
    );
}
