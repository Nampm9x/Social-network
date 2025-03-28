"use client";

import React, { useState } from "react";
import { CiPaperplane } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { IUser, IUserS } from "@/types/user";
import User from "@/components/profile/User";
import { useSearchUsersToSendMessage } from "@/hooks/react-query/user";
import { useSearchConversations } from "@/hooks/react-query/message";

export default function SendItem({
    item,
    currentUser,
}: {
    item: any;
    currentUser: IUserS;
}) {
    const [sendPostModalIsOpen, setSendPostModalIsOpen] =
        useState<boolean>(false);
    const [searchInput, setSearchInput] = useState<string>("");
    const { data: searchResults, isLoading: isLoadingSearchResults } =
        useSearchConversations(searchInput);

    const openSendPostModal = () => setSendPostModalIsOpen(true);
    const closeSendPostModal = () => setSendPostModalIsOpen(false);

    const handleChangeSearchInput = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setSearchInput(event.target.value);
    };

    return (
        <>
            <div
                onClick={openSendPostModal}
                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
            >
                <CiPaperplane />
                <p>Send</p>
            </div>
            <Modal
                isOpen={sendPostModalIsOpen}
                onRequestClose={closeSendPostModal}
                className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white xl:mx-44 mx-4 mb-4 lg:mb-8 border border-third"
                overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 flex justify-end items-end"
            >
                <div>
                    <div className="py-2 border-b flex px-2 justify-between items-center">
                        <p className="font-semibold text-primary">
                            Send to someone
                        </p>
                        <div className="p1-3 flex px-2 justify-end items-center">
                            <button
                                onClick={closeSendPostModal}
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
                            onChange={handleChangeSearchInput}
                            rows={1}
                            placeholder="Type a name or group name"
                            className="resize-none w-full border p-2 outline-none rounded-r"
                        />
                    </div>
                    <div className="h-[50vh] overflow-y-auto">
                        {searchResults &&
                            searchResults.length > 0 &&
                            searchResults.map((conversation: any) => (
                                <div key={conversation._id}>
                                    <User
                                        user={conversation}
                                        currentUser={currentUser}
                                        item={item}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            </Modal>
        </>
    );
}
