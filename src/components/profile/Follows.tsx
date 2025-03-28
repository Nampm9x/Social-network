"use client";

import React from "react";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { IUser, IUserS } from "@/types/user";
import FollowUser from "@/components/profile/FollowUser";

export default function Follows({
    modalShowFollowsIsOpen,
    closeShowFollowsModal,
    follows,
    currentUser,
    type,
}: {
    modalShowFollowsIsOpen: boolean;
    closeShowFollowsModal: () => void;
    follows: IUserS[];
    currentUser: IUserS;
    type: string;
}) {
    return (
        <Modal
            isOpen={modalShowFollowsIsOpen}
            onRequestClose={closeShowFollowsModal}
            className="w-full md:w-1/2 lg:w-1/3 rounded-md bg-white"
            overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
            <div>
                <div className="py-5 border-b flex px-2 justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">{type}</h2>
                    <button
                        onClick={closeShowFollowsModal}
                        className="text-secondary hover:text-black"
                    >
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>
                <div>
                    {follows?.map((follow, index) => (
                        <div key={index}>
                            <FollowUser
                                follow={follow}
                                currentUser={currentUser}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}
