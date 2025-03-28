"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IoMdClose } from "react-icons/io";
import { MdGroups, MdKeyboardArrowRight } from "react-icons/md";
import { IUser, IUserS } from "@/types/user";
import User from "./User";

export default function FindAndSendMessage({
    closeCreateConversationModal,
    handleChangeSearchForm,
    createNewGroup,
    searchUsers,
    currentUser,
    setCreateConversationModalIsOpen,
}: {
    closeCreateConversationModal: () => void;
    handleChangeSearchForm: (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => void;
    createNewGroup: () => void;
    searchUsers: IUser[];
    currentUser: IUserS;
    setCreateConversationModalIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <div>
            <div className="py-2 border-b flex px-2 justify-between items-center">
                <p className="font-semibold text-primary">New message</p>
                <div className="p1-3 flex px-2 justify-end items-center">
                    <button
                        onClick={closeCreateConversationModal}
                        className="text-secondary hover:text-black"
                    >
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>
            </div>
            <div className="flex px-2 py-3">
                <button className="border border-r-0 px-6 cursor-default rounded-l">
                    To
                </button>
                <textarea
                    rows={1}
                    name="search"
                    onChange={handleChangeSearchForm}
                    placeholder="Type a name or group name"
                    className="resize-none w-full border p-2 outline-none rounded-r"
                />
            </div>
            <div className="flex pb-3 px-2">
                <button
                    onClick={createNewGroup}
                    className="flex gap-2 justify-between w-full py-2 border rounded text-secondary hover:bg-third hover:text-primary items-center px-3"
                >
                    <div className="flex gap-3 items-center">
                        <MdGroups />
                        <span>Create new group</span>
                    </div>
                    <MdKeyboardArrowRight />
                </button>
            </div>
            <div className="h-[50vh] overflow-y-auto">
                {searchUsers &&
                    searchUsers.length > 0 &&
                    searchUsers.map((user: IUser) => (
                        <div key={user._id}>
                            <User
                                user={user}
                                currentUser={currentUser}
                                setCreateConversationModalIsOpen={
                                    setCreateConversationModalIsOpen
                                }
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
