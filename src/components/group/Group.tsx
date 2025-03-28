"use client";

import React from "react";
import { IGroup } from "@/types/group";
import { IUser, IUserS } from "@/types/user";
import { FaLock } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { MdPublic } from "react-icons/md";

export default function Group({
    group,
    currentUser,
}: {
    group: IGroup;
    currentUser: IUserS;
}) {
    return (
        <div className="bg-white rounded-lg">
            <img
                src={group.groupPicture}
                alt="group"
                className="w-full h-[150px] md:h-[200px] object-cover border-b rounded-t-lg"
            />
            <div className="py-3">
                <div className="flex gap-3 items-center">
                    <p className="text-2xl px-2 font-bold">{group.name}</p>
                </div>
                <div className="flex gap-1 items-center mt-3">
                    {group.groupVisibility === "private" && (
                        <div className="text-secondary flex gap-2 items-center px-2">
                            <FaLock />
                            Private group
                        </div>
                    )}
                    {group.groupVisibility === "public" && (
                        <div className="text-secondary flex gap-2 items-center px-2">
                            <MdPublic />
                            Public group
                        </div>
                    )}
                    <LuDot />
                    <div>
                        <p className="text-secondary">
                            {group.members.length} members
                        </p>
                    </div>
                </div>
            </div>
            {group.description && (
                <div className="py-3 border-t px-2 text-center">
                    <h2 className="font-semibold">Group Description</h2>
                    <p className="text-secondary">{group.description}</p>
                </div>
            )}
        </div>
    );
}
