"use client";

import { IUser, IUserS } from "@/types/user";
import React from "react";

export default function UserToCreateNewGroup({
    user,
    currentUser,
    handleChangeMembers,
}: {
    user: IUser;
    currentUser: IUserS;
    handleChangeMembers: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="hover:bg-third relative border-x border-white rounded flex gap-3 justify-between items-center border-b">
            <label
                htmlFor={`name_${user._id}`}
                className=" p-2 flex gap-3 items-center hover:cursor-pointer w-full"
            >
                <img
                    className="h-10 w-10 rounded-full"
                    src={user.profilePicture}
                    alt="Image"
                />
                <p className="font-semibold">{user.name}</p>
            </label>
            <input
                onChange={handleChangeMembers}
                type="checkbox"
                name="name"
                id={`name_${user._id}`}
                value={user._id}
                className="absolute right-0 mr-2"
            />
        </div>
    );
}
