"use client";

import React from "react";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";

export default function FollowUser({
    follow,
    currentUser,
}: {
    follow: IUserS;
    currentUser: IUserS;
}) {
    return (
        <div className="rounded flex justify-between gap-3 items-center mx-2 p-2 border-b">
            <Link href={`/profile/${follow.username}`} className="flex gap-3 items-center hover:bg-third w-full py-1 rounded">
                <img
                    className="h-10 w-10 rounded-full"
                    src={follow.profilePicture}
                    alt="Image"
                />
                <p
                    
                    className="font-semibold"
                >
                    {follow.name}
                </p>
            </Link>
        </div>
    );
}
