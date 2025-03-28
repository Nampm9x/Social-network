"use client";

import React, { useState, Dispatch, SetStateAction, ChangeEvent } from "react";
import { IoMdClose } from "react-icons/io";
import { IUser, IUserS } from "@/types/user";
import UserToCreateNewGroup from "./UserToCreateNewGroup";
import MemberOfGroup from "./MemberOfGroup";
import { IConversation } from "@/types/conversation";
import { useRouter } from "next/navigation";
import { useCreateGroup } from "@/hooks/react-query/message";

export default function CreateGroup({
    createNewGroup,
    closeCreateConversationModal,
    searchUsers,
    handleChangeSearchForm,
    currentUser,
    conversations,

    setCreateConversationModalIsOpen,
}: {
    createNewGroup: () => void;
    closeCreateConversationModal: () => void;
    searchUsers: IUser[];
    handleChangeSearchForm: (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => void;
    currentUser: IUserS;
    conversations: IConversation[];
    setCreateConversationModalIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const [members, setMembers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState<string>("");
    const router = useRouter();

    const handleChangeMembers = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMembers((prev) => {
            if (event.target.checked) {
                return [...prev, event.target.value];
            } else {
                return prev.filter((member) => member !== event.target.value);
            }
        });
    };

    const handleChangeGroupName = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setGroupName(event.target.value);
    };

    const createGroup = useCreateGroup();
    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const lastMessageTime = new Date().toISOString();
        createGroup.mutate(
            {
                members: [...members, currentUser?._id],
                type: "group",
                lastMessage: `${currentUser?.name} created this group`,
                lastMessageTime,
                conversationPicture:
                    "https://firebasestorage.googleapis.com/v0/b/sleepant-social.appspot.com/o/images%2Fgroup-chat%2Fgroup-chat.webp?alt=media&token=db2d9d46-3d8a-4469-ba4a-bf4c7309cb53",
                conversationName: groupName,
            },
            {
                onSuccess: (newConversation: IConversation) => {
                    setCreateConversationModalIsOpen(false);
                    router.push(`/messages/${newConversation._id}`);
                    setMembers([]);
                    setGroupName("");
                },
            }
        );
    };

    return (
        <div>
            <div className="py-2 border-b flex px-2 justify-between items-center">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={createNewGroup}
                        className="text-secondary hover:text-primary"
                    >
                        Cancel
                    </button>
                    <p className="font-semibold text-primary">New group</p>
                </div>
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
                <button className="border border-r-0 px-6 rounded-l cursor-default">
                    Search
                </button>
                <textarea
                    rows={1}
                    onChange={handleChangeSearchForm}
                    placeholder="Type a name"
                    className="resize-none w-full border p-2 outline-none rounded-r"
                />
            </div>
            <div className="flex gap-2 px-2 flex-wrap">
                {members.map((member) => (
                    <div key={member}>
                        <MemberOfGroup
                            member={member}
                            currentUser={currentUser}
                            setMembers={setMembers}
                        />
                    </div>
                ))}
            </div>
            <div className="h-[50vh] overflow-y-auto">
                {members.length > 1 && (
                    <form
                        onSubmit={handleCreateGroup}
                        className="flex justify-center my-3"
                    >
                        <div className="text-center">
                            <div>
                                <textarea
                                    onChange={handleChangeGroupName}
                                    value={groupName}
                                    placeholder="Group's name"
                                    name="groupname"
                                    required
                                    className="resize-none py-1 px-2 rounded border outline-none w-full"
                                    rows={1}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-2 border rounded bg-primary text-white hover:bg-white hover:text-primary font-semibold border-primary"
                            >
                                Create new group
                            </button>
                        </div>
                    </form>
                )}
                {searchUsers &&
                    searchUsers.length > 0 &&
                    searchUsers.map((user) => (
                        <div key={user.username}>
                            <UserToCreateNewGroup
                                user={user}
                                currentUser={currentUser}
                                handleChangeMembers={handleChangeMembers}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
