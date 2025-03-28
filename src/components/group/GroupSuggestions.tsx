"use client";

import {
    useGetGroupSuggestions,
    useJoinGroup,
} from "@/hooks/react-query/group";
import { IGroup } from "@/types/group";
import { IUserS } from "@/types/user";
import Link from "next/link";
import React from "react";

export default function GroupSuggestions({
    currentUser,
}: {
    currentUser: IUserS;
}) {
    const { data: groupSuggestions, isLoading: isLoadingGroupSuggestions } =
        useGetGroupSuggestions();

    const joinGroup = useJoinGroup(currentUser?._id);
    const handleJoinGroup = async (groupId: string) => {
        joinGroup.mutate({
            groupId: groupId,
        });
    };

    return (
        <div>
            <h2 className="text-xl text-center text-secondary font-semibold py-3 border-b">
                Group suggestions
            </h2>
            <div className="px-2 mt-3">
                {groupSuggestions &&
                    groupSuggestions.length > 0 &&
                    groupSuggestions.map((group: any) => (
                        <div
                            className="flex items-center gap-1 mb-3 justify-between"
                            key={group?._id}
                        >
                            <Link
                                href={`/groups/${group?._id}`}
                                className="flex gap-2 items-center hover:bg-third w-full hover:cursor-pointer rounded-lg"
                            >
                                <img
                                    src={group.groupPicture}
                                    className="h-10 w-10 rounded aspect-square"
                                />
                                <div>
                                    <p className="font-semibold text-sm">
                                        {group.name}
                                    </p>
                                    <p className="text-xs text-secondary">
                                        ({group?.membersCount} Members)
                                    </p>
                                    <p className="text-xs">
                                        {group?.friendCount} Friends joined{" "}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleJoinGroup(group?._id)}
                                className="px-3 py-1 h-full border rounded bg-third hover:bg-gray-200 text-primary font-semibold"
                            >
                                Join
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
}
