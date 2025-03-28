"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoIosCreate } from "react-icons/io";
import { FaArchive } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import Modal from "react-modal";
import { IConversation } from "@/types/conversation";
import Conversation from "@/components/message/Conversation";
import { IUser, IUserS } from "@/types/user";
import FindAndSendMessage from "./FindAndSendMessage";
import CreateGroup from "./CreateGroup";
import { PiChatsCircleFill } from "react-icons/pi";
import SimpleBar from "simplebar-react";
import Link from "next/link";
import {
    useGetUserToSendMessage,
    useSearchConversations,
} from "@/hooks/react-query/message";
import LoadingConversations from "../loading/LoadingConversations";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

Modal.setAppElement("#main-body");

export default function ListConversation({
    conversations,
    conversation_id,
    currentUser,
    archivedConversations,
    conversation,
    onlineUsers,
    isLoadingConversations,
    isLoadingArchivedConversations,
    isDisplayArchivedConversations,
    setIsDisplayArchivedConversations,
}: {
    conversations: IConversation[];
    conversation_id: string;
    currentUser: IUserS;
    archivedConversations: IConversation[];
    conversation: IConversation;
    onlineUsers: string[];
    isLoadingConversations: boolean;
    isLoadingArchivedConversations: boolean;
    isDisplayArchivedConversations: boolean;
    setIsDisplayArchivedConversations: (value: boolean) => void;
}) {
    const [createConversationModalIsOpen, setCreateConversationModalIsOpen] =
        useState(false);
    const [isCreatingNewGroup, setIsCreatingNewGroup] =
        useState<boolean>(false);
    const [searchForm, setSearchForm] = useState<string>("");
    const { data: searchUsers, isLoading: isLoadingSearchUsers } =
        useGetUserToSendMessage(searchForm);
    const [searchConversationsForm, setSearchConversationsForm] =
        useState<string>("");
    const {
        data: searchConversations,
        isLoading: isLoadingSearchConversations,
    } = useSearchConversations(searchConversationsForm);
    const [user, setUser] = useState<IUserS>();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const STORAGE_KEY = "scrollListConversationMessagePage";

    useEffect(() => {
        const scrollElement = containerRef.current;

        // Lấy vị trí cuộn trước đó
        const savedScroll = sessionStorage.getItem(STORAGE_KEY);
        if (savedScroll && scrollElement) {
            scrollElement.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = () => {
            if (scrollElement) {
                sessionStorage.setItem(
                    STORAGE_KEY,
                    scrollElement.scrollTop.toString()
                );
            }
        };

        scrollElement?.addEventListener("scroll", handleScroll);

        return () => scrollElement?.removeEventListener("scroll", handleScroll);
    }, []);

    const router = useRouter();

    const handleChangeConversationsForm = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setSearchConversationsForm(e.target.value);
    };

    const handleViewMessage = (conversation: any) => {
        if (!conversation._id.startsWith("temp_")) {
            router.push(`/messages/${conversation._id}`);
        }
    };

    const displayArchivedConversations = () =>
        setIsDisplayArchivedConversations(true);
    const hideArchivedConversations = () =>
        setIsDisplayArchivedConversations(false);

    const handleChangeSearchForm = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setSearchForm(event.target.value);
    };

    const createNewGroup = () => {
        setIsCreatingNewGroup(!isCreatingNewGroup);
    };

    const openCreateConversationModal = () => {
        setCreateConversationModalIsOpen(true);
        setIsCreatingNewGroup(false);
    };
    const closeCreateConversationModal = () =>
        setCreateConversationModalIsOpen(false);

    useEffect(() => {
        if (
            conversation.archives?.some(
                (archivedUser) => archivedUser._id === currentUser?._id
            )
        ) {
            setIsDisplayArchivedConversations(true);
        }
    }, [conversation]);

    return (
        <>
            <div className="bg-white pl-2 rounded-lg h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]">
                <div className="py-5 flex justify-between items-center pr-2">
                    {!isDisplayArchivedConversations ? (
                        <button
                            type="button"
                            onClick={displayArchivedConversations}
                            className="rounded text-secondary hover:text-primary p-3 bg-third"
                        >
                            <FaArchive />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={hideArchivedConversations}
                            className=" rounded text-secondary hover:text-primary p-3 bg-third"
                        >
                            <PiChatsCircleFill />
                        </button>
                    )}
                    <Link
                        href={`/messages/conversations`}
                        className="text-center font-semibold text-xl"
                    >
                        Conversations
                    </Link>
                    <button
                        onClick={openCreateConversationModal}
                        className="rounded-full text-secondary hover:text-primary p-3 bg-third"
                    >
                        <IoIosCreate />
                    </button>
                </div>
                <div className="pr-2">
                    <div className="flex mb-3 border">
                        <textarea
                            onChange={handleChangeConversationsForm}
                            rows={1}
                            placeholder="Search for chat"
                            className="resize-none w-full outline-none rounded p-2"
                        />
                        <button
                            type="button"
                            className="px-3 outline-none rounded"
                        >
                            <IoIosSearch className="text-xl text-secondary hover:text-black" />
                        </button>
                    </div>
                    {isLoadingSearchConversations && (
                        <div className="flex justify-center items-center">
                            <ClipLoader color="blue" size={15} />
                        </div>
                    )}
                    {searchConversationsForm &&
                        !searchConversations &&
                        !isLoadingSearchConversations && (
                            <div className="flex justify-center items-center">
                                <p className="text-lg text-secondary text-center">
                                    No conversation found
                                </p>
                            </div>
                        )}
                    {searchConversations && !isLoadingSearchConversations ? (
                        <SimpleBar
                            scrollableNodeProps={{ ref: containerRef }}
                            className="lg:h-[calc(100vh-64px-32px-32px-120px-16px)] h-[calc(100vh-64px-16px-16px-120px-16px)] overflow-y-auto pr-3"
                        >
                            {searchConversations?.map((conversation: any) => (
                                <div key={conversation._id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleViewMessage(conversation)
                                        }
                                        className={`flex items-center gap-3 py-2 px-2 mb-3 rounded ${
                                            conversation_id === conversation._id
                                                ? "bg-third"
                                                : ""
                                        } hover:bg-third hover:cursor-pointer w-full`}
                                    >
                                        <div className="relative flex gap-2 items-center">
                                            <img
                                                className="w-12 h-12 rounded-full border"
                                                src={
                                                    conversation.profilePicture ||
                                                    currentUser.profilePicture
                                                }
                                                alt="Image"
                                            />
                                            <p className="font-semibold">
                                                {conversation.name}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </SimpleBar>
                    ) : (
                        <SimpleBar className="lg:h-[calc(100vh-64px-32px-32px-120px-16px)] h-[calc(100vh-64px-16px-16px-120px-16px)] overflow-y-auto pr-3">
                            {isLoadingConversations && <LoadingConversations />}
                            {isLoadingArchivedConversations && (
                                <LoadingConversations />
                            )}
                            {!isDisplayArchivedConversations
                                ? conversations?.map((conversation) => (
                                      <div key={conversation._id}>
                                          <Conversation
                                              conversation={conversation}
                                              conversation_id={conversation_id}
                                              currentUser={currentUser}
                                              conversations={conversations}
                                              isDisplayArchivedConversations={
                                                  isDisplayArchivedConversations
                                              }
                                              archivedConversations={
                                                  archivedConversations || []
                                              }
                                              onlineUsers={onlineUsers}
                                          />
                                      </div>
                                  ))
                                : archivedConversations?.map((conversation) => (
                                      <div key={conversation._id}>
                                          <Conversation
                                              conversation={conversation}
                                              conversation_id={conversation_id}
                                              currentUser={currentUser}
                                              conversations={conversations}
                                              isDisplayArchivedConversations={
                                                  isDisplayArchivedConversations
                                              }
                                              archivedConversations={
                                                  archivedConversations || []
                                              }
                                              onlineUsers={onlineUsers}
                                          />
                                      </div>
                                  ))}
                            {(!searchConversationsForm && !conversations) ||
                                (conversations &&
                                    !searchConversationsForm &&
                                    conversations.length === 0 &&
                                    !isLoadingConversations &&
                                    !isDisplayArchivedConversations && (
                                        <div className="flex justify-center items-center">
                                            <p className="text-lg text-secondary text-center">
                                                No conversation found
                                            </p>
                                        </div>
                                    ))}
                            {!archivedConversations ||
                                (archivedConversations &&
                                    archivedConversations.length === 0 &&
                                    !isLoadingConversations &&
                                    !isLoadingArchivedConversations &&
                                    isDisplayArchivedConversations && (
                                        <div className="flex justify-center items-center">
                                            <p className="text-lg text-secondary text-center">
                                                No archived conversation found
                                            </p>
                                        </div>
                                    ))}
                        </SimpleBar>
                    )}
                </div>
            </div>
            <Modal
                isOpen={createConversationModalIsOpen}
                onRequestClose={closeCreateConversationModal}
                className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white xl:mx-44 mx-4 mb-4 lg:mb-8 border border-third"
                overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 flex justify-end items-end"
            >
                {isCreatingNewGroup ? (
                    <CreateGroup
                        closeCreateConversationModal={
                            closeCreateConversationModal
                        }
                        createNewGroup={createNewGroup}
                        searchUsers={searchUsers}
                        currentUser={currentUser}
                        handleChangeSearchForm={handleChangeSearchForm}
                        conversations={conversations}
                        setCreateConversationModalIsOpen={
                            setCreateConversationModalIsOpen
                        }
                    />
                ) : (
                    <FindAndSendMessage
                        closeCreateConversationModal={
                            closeCreateConversationModal
                        }
                        handleChangeSearchForm={handleChangeSearchForm}
                        createNewGroup={createNewGroup}
                        searchUsers={searchUsers}
                        currentUser={currentUser}
                        setCreateConversationModalIsOpen={
                            setCreateConversationModalIsOpen
                        }
                    />
                )}
            </Modal>
        </>
    );
}
