"use client";

import React from "react";
import CreatePost from "./CreatePost";
import { IPost } from "@/types/post";
import { IEvent } from "@/types/event";
import Event from "@/components/profile/Event";
import Post from "@/components/profile/Post";
import { IoMdDoneAll } from "react-icons/io";
import { BeatLoader } from "react-spinners";
import { IUserS } from "@/types/user";
import GroupPost from "@/components/group/Post";

export default function Newsfeed({
    combinedAndSortedItems,
    currentUser,
    posts,
    groupPost,
    events,
    hasMore,
    loadingNewsfeed,
}: {
    currentUser: IUserS;
    combinedAndSortedItems: any;
    groupPost: any[];
    posts: any[];
    events: IEvent[];
    hasMore?: boolean;
    loadingNewsfeed?: boolean;
}) {
    return (
        <>
            <CreatePost
                currentUser={currentUser}
                posts={posts}
                events={events}
            />

            {combinedAndSortedItems &&
                combinedAndSortedItems.length > 0 &&
                combinedAndSortedItems.map((item: any, index: number) => (
                    <div key={index} className="mt-4">
                        {item.title ? (
                            <Event event={item} currentUser={currentUser} />
                        ) : item.group ? (
                            <div className="bg-white rounded-lg">
                                <GroupPost
                                    post={item}
                                    currentUser={currentUser}
                                />
                            </div>
                        ) : (
                            <Post post={item} currentUser={currentUser} />
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
        </>
    );
}
