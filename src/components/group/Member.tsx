"use client";

import { IGroup } from "@/types/group";
import { IUser, IUserS } from "@/types/user";
import React, { Dispatch, SetStateAction, useState } from "react";
import Link from "next/link";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useLeaveGroup } from "@/hooks/react-query/group";

export default function Member({
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
    const [modalKickOutIsOpen, setModalKickOutIsOpen] =
        useState<boolean>(false);

    const openKickOutModal = () => {
        setModalKickOutIsOpen(true);
    };

    const closeKickOutModal = () => {
        setModalKickOutIsOpen(false);
    };

    const kickOut = useLeaveGroup(group._id, member._id);
    const handleKickOut = async () => {
        kickOut.mutate(
            {
                groupId: group._id,
                userId: member._id,
            },
            {
                onSuccess: () => {
                    toast.success("User has been kicked!");
                    setModalKickOutIsOpen(false);
                },
            }
        );
    };

    return (
        <>
            <div className="flex gap-3 items-center justify-between py-2 rounded-lg">
                <Link
                    href={`/profile/${member.username}`}
                    className="flex gap-3 items-center hover:bg-third w-full"
                >
                    <img
                        src={member.profilePicture}
                        alt="profile"
                        className="w-10 h-10 rounded-full border"
                    />
                    <div>
                        <p className="font-semibold">
                            {member.name}
                        </p>
                        {member._id === group.owner._id && (
                            <p className="text-secondary text-sm">Admin</p>
                        )}
                    </div>
                </Link>
                <div>
                    {member._id !== group.owner._id &&
                        currentUser?._id === group.owner._id && (
                            <button
                                onClick={openKickOutModal}
                                className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500 min-w-[100px]"
                            >
                                Kick out
                            </button>
                        )}
                </div>
            </div>
            <Modal
                isOpen={modalKickOutIsOpen}
                onRequestClose={closeKickOutModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="pb-5">
                        <p className="text-center text-lg py-5">
                            Are you sure you want to kick out{" "}
                            <span className="font-semibold">{member.name}</span>
                            ?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleKickOut}
                                className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                            >
                                Yes
                            </button>
                            <button
                                onClick={closeKickOutModal}
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
