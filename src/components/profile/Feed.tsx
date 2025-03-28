"use client";

import React from "react";
import { IUser, IUserS } from "@/types/user";
import Event from "@/components/profile/Event";
import Post from "@/components/profile/Post";
import { BeatLoader } from "react-spinners";
import { IPost } from "@/types/post";
import { IoMdDoneAll } from "react-icons/io";

export default function Feed({
    combinedAndSortedItems,
    currentUser,
    loadingNewsfeed,
    posts,
    hasMore,
}: {
    combinedAndSortedItems: any;
    currentUser: IUserS;
    loadingNewsfeed: boolean;
    posts: IPost[];
    hasMore: boolean;
}) {
    return (
        <div>
            {combinedAndSortedItems.map((item: any) => (
                <div key={item._id}>
                    {item.title ? (
                        <div className="mt-4 lg:mt-8">
                            <Event event={item} currentUser={currentUser} />
                        </div>
                    ) : (
                        <div className="mt-4 lg:mt-8">
                            <Post
                                post={item}
                                currentUser={currentUser}
                            />
                        </div>
                    )}
                </div>
            ))}
            {loadingNewsfeed && (
                <div className="mt-4 flex justify-center items-center text-primary">
                    <BeatLoader />
                </div>
            )}
            {!hasMore && (
                <div
                    className={`mt-4 py-4 flex justify-center items-center gap-2 font-semibold bg-white rounded-lg ${
                        !combinedAndSortedItems ||
                        (combinedAndSortedItems &&
                            combinedAndSortedItems.length === 0)
                            ? "h-[calc(100vh-64px-32px-160px)] lg:h-[calc(100vh-64px-64px-160px)]"
                            : ""
                    } `}
                >
                    <IoMdDoneAll />
                    No more data!
                </div>
            )}
        </div>
    );
}
