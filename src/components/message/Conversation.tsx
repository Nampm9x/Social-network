"use client";

import React, { useEffect, useState } from "react";
import { IConversation } from "@/types/conversation";
import { IUserS } from "@/types/user";
import Link from "next/link";
import { useFormatedTime } from "@/hooks/useFormattedDate";
import { IoIosMore } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { GoDotFill } from "react-icons/go";
import Modal from "react-modal";
import {
    useArchiveConversation,
    useDeleteConversation,
    useGetMessages,
    useUnArchiveConversation,
} from "@/hooks/react-query/message";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Conversation({
    conversation,
    conversation_id,
    currentUser,
    conversations,
    isDisplayArchivedConversations,
    archivedConversations,
    onlineUsers,
}: {
    conversation: IConversation;
    conversation_id: string;
    currentUser: IUserS;
    conversations: IConversation[];
    isDisplayArchivedConversations: boolean;
    archivedConversations: IConversation[];
    onlineUsers: string[];
}) {
    const [user, setUser] = useState({
        name: "",
        profilePicture: "",
        username: "",
        _id: "",
    });
    const [modalDeleteConversationIsOpen, setModalDeleteConversationIsOpen] =
        useState<boolean>(false);

    const openDeleteConversationModal = () =>
        setModalDeleteConversationIsOpen(true);
    const closeDeleteConversationModal = () =>
        setModalDeleteConversationIsOpen(false);

    const { data: messages, isLoading: messagesLoading } = useGetMessages(
        conversation._id
    );
    const router = useRouter();

    const time = useFormatedTime(conversation.lastMessageTime);

    const otherUser = conversation?.members.find(
        (mem) => mem?._id !== currentUser?._id
    );

    const [unreadMessages, setUnreadMessages] = useState<number>(0);

    useEffect(() => {
        if (!messages) return;
        const unReadMessages = messages.filter(
            (message:any) =>
                message?.sender?._id !== currentUser?._id &&
            !message?.read?.includes(currentUser?._id)
        ).length;
        setUnreadMessages(unReadMessages);
    }, [messages]);

    useEffect(() => {
        if (
            conversation &&
            conversation.conversationType === "private" &&
            Array.isArray(conversation.members) &&
            conversation.members.length === 2
        ) {
            conversation.members.forEach((member) => {
                if (member._id !== currentUser?._id) {
                    setUser(member);
                }
            });
        }
    }, [conversation_id, conversation._id]);

    const archiveConversation = useArchiveConversation();
    const handleArchiveConversation = async () => {
        archiveConversation.mutate({
            conversationId: conversation._id,
        });
    };

    const unArchiveConversation = useUnArchiveConversation();
    const handleUnarchiveConversation = async () => {
        unArchiveConversation.mutate({
            conversationId: conversation._id,
        });
    };

    const deleteConversation = useDeleteConversation(conversation?._id);
    const handleDeleteConversation = async () => {
        deleteConversation.mutate({
            conversationId: conversation._id,
        }, {
            onSuccess: () => {
                toast.success("Deleted conversation successfully!");
                if(conversation?._id === conversation_id) {
                    router.push(`/messages/conversation`)
                }
            }
        });
        closeDeleteConversationModal();
    };
    return (
        <>
            <div className="relative">
                <Link
                    href={`/messages/${conversation._id}`}
                    className={`flex items-center gap-3 py-2 px-2 mb-3 rounded ${
                        conversation_id === conversation._id ? "bg-third" : ""
                    } hover:bg-third hover:cursor-pointer`}
                >
                    <div className="relative">
                        <img
                            className="w-12 h-12 rounded-full border"
                            src={
                                conversation.conversationPicture ||
                                user.profilePicture
                            }
                            alt="Image"
                        />
                        {onlineUsers &&
                            otherUser &&
                            onlineUsers.includes(otherUser._id) && (
                                <div className="absolute -top-1 -right-1">
                                    <span className="text-green-500">
                                        <GoDotFill className="text-xl" />
                                    </span>
                                </div>
                            )}
                    </div>
                    <div className=" max-w-[calc(100%-62px)]">
                        <div className="flex gap-2 items-center">
                            <p className="font-semibold flex items-center">
                                {conversation.conversationName || user.name}
                            </p>
                            <span className="text-xs">{time}</span>
                            {unreadMessages > 0 && (
                                <div className="text-xs bg-red-400 rounded-full h-4 w-4 flex justify-center items-center text-white">
                                    {unreadMessages}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center text-sm gap-5">
                            <p
                                className={`${
                                    conversation &&
                                    conversation?.lastMessageSender?._id !==
                                        currentUser?._id &&
                                    conversation?.lastMessageRead?.some(
                                        (mem) => mem?._id === currentUser?._id
                                    )
                                        ? "text-black font-semibold "
                                        : "text-secondary "
                                } text-sm overflow-hidden text-ellipsis whitespace-nowrap`}
                            >
                                {conversation?.lastMessageSender?._id ===
                                currentUser?._id
                                    ? "You: "
                                    : conversation?.lastMessageSender?.name +
                                      ": "}
                                {conversation?.lastMessage}
                            </p>
                        </div>
                    </div>
                </Link>
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
                    <Menu as="div" className="relative">
                        <div>
                            <MenuButton className="relative flex rounded outline-none px-2 py-1 hover:bg-third">
                                <IoIosMore />
                            </MenuButton>
                        </div>
                        <MenuItems
                            transition
                            className="absolute right-0 z-50 mt-2 origin-top-right rounded-md bg-white shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            <MenuItem>
                                {!isDisplayArchivedConversations ? (
                                    <button
                                        onClick={handleArchiveConversation}
                                        type="button"
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Archive
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnarchiveConversation}
                                        type="button"
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Unarchive
                                    </button>
                                )}
                            </MenuItem>
                            <MenuItem>
                                <button
                                    onClick={openDeleteConversationModal}
                                    type="button"
                                    className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                >
                                    Delete
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                </div>
            </div>

            {/* delete covnersation */}
            <Modal
                isOpen={modalDeleteConversationIsOpen}
                onRequestClose={closeDeleteConversationModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="pb-5">
                        <p className="text-center text-lg py-5">
                            Are you sure you want to delete this conversation?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleDeleteConversation}
                                className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                            >
                                Yes
                            </button>
                            <button
                                onClick={closeDeleteConversationModal}
                                className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
