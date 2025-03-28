"use client";

import { IUser, IUserS } from "@/types/user";
import React, { Dispatch, SetStateAction } from "react";
import { FaTimes } from "react-icons/fa";
import { useGetMemberOfGroup } from "@/hooks/react-query/message";

export default function MemberOfGroup({
    member,
    currentUser,
    setMembers,
}: {
    member: string;
    currentUser: IUserS;
    setMembers: Dispatch<SetStateAction<string[]>>;
}) {
    const { data: user, isLoading: isLoadingUser } =
        useGetMemberOfGroup(member);

    return (
        <div className="text-center relative">
            <img
                className="h-10 w-10 rounded-full"
                src={user?.profilePicture}
                alt="Image"
            />
            <p className="text-xs">{user?.name}</p>
            <label
                htmlFor={`name_${user?._id}`}
                className="absolute hover:cursor-pointer -top-1 -right-1 border hover:bg-third text-secondary bg-white rounded-full"
            >
                <FaTimes />
            </label>
        </div>
    );
}
