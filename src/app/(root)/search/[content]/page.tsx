"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IPost } from "@/types/post";
import { IEvent } from "@/types/event";
import { IUser } from "@/types/user";
import Post from "@/components/profile/Post";
import Event from "@/components/profile/Event";
import Search from "@/components/search/Search";
import User from "@/components/search/User";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import { useSearch } from "@/hooks/react-query/search";
import Link from "next/link";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function SearchPage() {
    const { content } = useParams() as { content: string };
    const { data: searchResults } = useSearch(content);
    const [currentTab, setCurrentTab] = useState<string>("All");
    const [posts, setPosts] = useState<IPost[]>([]);
    const [events, setEvents] = useState<IEvent[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [searchResult, setSearchResult] = useState<any>([]);
    const tabs = ["All", "Posts", "Events", "Users", "Groups"];
    const { data: currentUser } = useGetCurrentUser();
    const flattenedResults = searchResult.flat();

    const handleChangeCurrentTab = (tab: string) => {
        setCurrentTab(tab);
    };

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
        if (!searchResults) return;
        setPosts(searchResults.posts);
        setEvents(searchResults.events);
        setUsers(searchResults.users);
        setGroups(searchResults.groups);
    }, [searchResults]);

    useEffect(() => {
        if (currentTab === "All") {
            setSearchResult([posts, events, users, groups]);
        } else if (currentTab === "Posts") {
            setSearchResult([posts]);
        } else if (currentTab === "Events") {
            setSearchResult([events]);
        } else if (currentTab === "Users") {
            setSearchResult([users]);
        } else if (currentTab === "Groups") {
            setSearchResult([groups]);
        }
    }, [currentTab, posts, events, users, groups]);

    return (
        <>
            <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8">
                <div className="w-full md:w-1/3 bg-white">
                    <div className="p-2">
                        <div className="font-semibold text-secondary mb-2">
                            Enter what you wanna search
                        </div>
                        <Search />
                    </div>
                </div>
                <div
                    className={`w-full hidden md:block md:w-2/3 bg-white p-2 overflow-y-auto rounded h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]`}
                >
                    <div className="flex gap-2">
                        {tabs.map((tab, index: number) => (
                            <button
                                onClick={() => handleChangeCurrentTab(tab)}
                                className={`border px-3 py-1 rounded-lg ${
                                    currentTab === tab
                                        ? "bg-primary text-white"
                                        : "text-secondary"
                                }`}
                                key={index}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div>
                        {flattenedResults.length > 0 ? (
                            flattenedResults.map((item: any, index: number) => (
                                <div key={index}>
                                    {item.content ? (
                                        <div className="pt-3 border-t mt-3">
                                            <Post
                                                post={item}
                                                currentUser={currentUser}
                                            />
                                        </div>
                                    ) : item.title ? (
                                        <div className="pt-3 border-t mt-3">
                                            <Event
                                                event={item}
                                                currentUser={currentUser}
                                            />
                                        </div>
                                    ) : item.profilePicture ? (
                                        <div className="pt-3 border-t mt-3">
                                            <User
                                                user={item}
                                                currentUser={currentUser}
                                            />
                                        </div>
                                    ) : item.groupPicture ? (
                                        <div className="pt-3 border-t mt-3">
                                            <div
                                                className="flex items-center gap-1 mb-3 justify-between"
                                                key={item?._id}
                                            >
                                                <Link
                                                    href={`/groups/${item?._id}`}
                                                    className="flex gap-2 items-center hover:bg-third w-full hover:cursor-pointer rounded-lg"
                                                >
                                                    <img
                                                        src={item.groupPicture}
                                                        className="h-10 w-10 rounded aspect-square"
                                                    />
                                                    <div>
                                                        <p className="text-center font-semibold text-sm">
                                                            {item.name}
                                                            <span className="text-xs text-secondary">
                                                                {" "}
                                                                (
                                                                {
                                                                    item?.membersCount
                                                                }{" "}
                                                                Members)
                                                            </span>
                                                        </p>
                                                        <p className="text-xs">
                                                            {item?.friendCount}{" "}
                                                            Friends joined{" "}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>Not found</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="font-semibold text-lg flex items-center justify-center mt-10">
                                Not found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
