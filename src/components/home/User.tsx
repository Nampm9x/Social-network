"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";
import { useFollowUser } from "@/hooks/react-query/user";

export default function User({
    user,
    currentUser,
}: {
    user: IUserS;
    currentUser: IUserS;
}) {
    const followUser = useFollowUser(user.username);
    const handleFollowUser = async () => {
        followUser.mutate({ followId: user._id });
    };

    return (
        <div className="p-[2px]">
            <div
                className="border p-2 rounded-lg"
            >
                <Link href={`/profile/${user.username}`} className="flex justify-center">
                    <img
                        src={user.profilePicture}
                        alt=""
                        className="rounded w-12 h-12 lg:w-18 lg:h-18"
                    />
                </Link>
                <Link href={`/profile/${user.username}`} className="flex justify-center">
                    <p className="mt-2 text-sm lg:text-base font-semibold text-center">
                        {user.name}
                    </p>
                </Link>
                <div className="mt-2 flex justify-center gap-1 lg:gap-2">
                    <button
                        onClick={handleFollowUser}
                        className="bg-primary rounded text-sm lg:text-base py-1 px-5 lg:px-8 border text-white hover:text-primary hover:bg-white"
                    >
                        Follow
                    </button>
                </div>
            </div>
        </div>
    );
}
