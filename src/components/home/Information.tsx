"use client";

import React from "react";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

export default function Information({ currentUser }: { currentUser: IUserS }) {
    return (
        <div className="p-2">
            {/* <div className="flex justify-center">
                <img
                    src={currentUser?.profilePicture}
                    alt=""
                    className="w-[75px] h-[75px] rounded-full"
                />
            </div>
            <div className="flex justify-center mt-3">
                <p className="text-lg font-semibold">{currentUser?.name}</p>
            </div>
            <div className="flex justify-center text-secondary">
                {currentUser?.biography}
            </div>
            <div className="flex justify-between mt-3 border-b-2 pb-5">
                <button className=" border-l-2 px-1 w-1/3">
                    <div>
                        <span className="font-semibold">
                            {currentUser?.followers.length}
                        </span>
                    </div>
                    <div>
                        <span className="text-secondary text-sm">
                            Followers
                        </span>
                    </div>
                </button>
                <button className=" border-x-2 px-3 w-1/3">
                    <div>
                        <span className="font-semibold">
                            {currentUser?.following.length}
                        </span>
                    </div>
                    <div>
                        <span className="text-secondary text-sm">
                            Following
                        </span>
                    </div>
                </button>
                <button className="border-r-2 px-1 w-1/3">
                    <div>
                        <span className="font-semibold">
                            {currentUser?.friends.length}
                        </span>
                    </div>
                    <div>
                        <span className="text-secondary text-sm">Friends</span>
                    </div>
                </button>
            </div>
            <div className="mt-3">
                <Link
                    href="/"
                    className="flex gap-3 items-center hover:text-primary py-3"
                >
                    <FaHome className="text-2xl text-primary" />
                    <span className="font-semibold">Home</span>
                </Link>
                <Link
                    href="/messages/conversation"
                    className="flex gap-3 items-center hover:text-primary py-3"
                >
                    <FaComments className="text-2xl text-primary" />
                    <span className="font-semibold">Messages</span>
                </Link>
                <Link
                    href="/groups"
                    className="flex gap-3 items-center hover:text-primary py-3"
                >
                    <FaUserGroup className="text-2xl text-primary" />
                    <span className="font-semibold">Groups</span>
                </Link>
            </div>
            <div className="flex justify-center mt-3 py-3 border-y-2">
                <Link
                    href={`/profile/${currentUser?.username}`}
                    className="text-secondary hover:text-primary font-semibold"
                >
                    View profile
                </Link>
            </div> */}
        </div>
    );
}
