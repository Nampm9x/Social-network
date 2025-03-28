"use client";

import React from "react";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";

export default function User({
    user,
    currentUser,
}: {
    user: IUser;
    currentUser: IUserS;
}) {
    return (
        <Link
            className="flex gap-3 hover:bg-third"
            href={`/profile/${user.username}`}
        >
            <img
                src={user.profilePicture}
                alt=""
                className="h-10 w-10 rounded border"
            />
            <div className="">
                <p className="font-semibold text-secondary hover:text-primary">
                    {user.name}
                </p>
                <div className="flex gap-2 items-center text-sm">
                    <p className="text-xs">{user.followers.length} Followers</p>
                    <p className="text-xs">{user.following.length} Following</p>
                </div>
            </div>
        </Link>
    );
}
