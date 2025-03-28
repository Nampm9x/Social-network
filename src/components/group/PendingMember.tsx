"use client";

import {
    useAcceptGroupMember,
    useCancelPendingMember,
} from "@/hooks/react-query/group";
import { IGroup } from "@/types/group";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

export default function PendingMember({
    member,
    currentUser,
    group,
}: {
    member: {
        name: string;
        username: string;
        profilePicture: string;
        _id: string;
    };
    currentUser: IUserS;
    group: IGroup;
}) {
    const acceptGroupMember = useAcceptGroupMember(group._id, member._id);
    const handleAcceptGroupMember = async () => {
        acceptGroupMember.mutate(
            {
                groupId: group._id,
                userId: member._id,
            },
            {
                onSuccess: () => {
                    toast.success("User has been accept to group");
                },
            }
        );
    };

    const cancelPendingMember = useCancelPendingMember(group._id, member._id);
    const handleCancelPendingMember = async () => {
        cancelPendingMember.mutate(
            {
                groupId: group._id,
                userId: member._id,
            },
            {
                onSuccess: () => {
                    toast.success("Cancel pending member successfully!");
                },
            }
        );
    };
    return (
        <div className="flex gap-3 items-center justify-between p-2 border-b">
            <Link
                href={`/profile/${member.username}`}
                className="flex gap-3 items-center p-2 hover:bg-third w-full"
            >
                <img
                    src={member.profilePicture}
                    alt="profile"
                    className="w-10 h-10 rounded-full border"
                />
                <p className="font-semibold">{member.name}</p>
            </Link>
            <div className=" flex">
                <button
                    onClick={handleCancelPendingMember}
                    className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAcceptGroupMember}
                    className="py-1 px-3 border bg-primary rounded text-white ml-2 hover:bg-white hover:text-primary border-primary"
                >
                    Accept
                </button>
            </div>
        </div>
    );
}
