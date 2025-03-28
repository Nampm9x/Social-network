"use client ";

import React, { useState, useEffect } from "react";
import { IConversation } from "@/types/conversation";
import { IUser, IUserS } from "@/types/user";
import { FaRegUser } from "react-icons/fa";
import { IoPersonAddOutline, IoSearchOutline } from "react-icons/io5";
import { GoPeople } from "react-icons/go";
import { HiOutlineArrowLeftStartOnRectangle } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import {
    useGetMedia,
    useKickMemberToGroup,
    useLeaveGroup,
} from "@/hooks/react-query/message";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { IoIosSearch } from "react-icons/io";

Modal.setAppElement("#main-body");

export default function SideBar({
    conversation,
    currentUser,
}: {
    currentUser: IUserS;
    conversation: IConversation;
}) {
    const [user, setUser] = useState<{
        _id: string;
        name: string;
        username: string;
        profilePicture: string;
    }>({
        _id: "",
        name: "",
        username: "",
        profilePicture: "",
    });
    const {
        data: media,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGetMedia(conversation?._id);

    const router = useRouter();

    const [showMembersModalIsOpen, setShowMembersModalIsOpen] =
        useState<boolean>(false);
    const [showMediaDetailModalIsOpen, setShowMediaDetailModalIsOpen] =
        useState<boolean>(false);
    const [mediaDetail, setMediaDetail] = useState<string>("");
    const [leaveGroupModalIsOpen, setLeaveGroupModalIsOpen] =
        useState<boolean>(false);
    const [kickMemberToGroupModalIsOpen, setKickMemberToGroupModalIsOpen] =
        useState<boolean>(false);
    const [inviteMemberModalIsOpen, setInviteMemberModalIsOpen] =
        useState<boolean>(false);
    const [memberToKick, setMemberToKick] = useState<string>("");

    const closeShowMembersModal = () => setShowMembersModalIsOpen(false);
    const openShowMembersModal = () => setShowMembersModalIsOpen(true);

    const closeInviteMemberModal = () => setInviteMemberModalIsOpen(false);
    const openInviteMemberModal = () => setInviteMemberModalIsOpen(true);

    const closeShowLeaveGroupModal = () => setLeaveGroupModalIsOpen(false);
    const openShowLeaveGroupModal = () => setLeaveGroupModalIsOpen(true);

    const closeShowKickMemberToGroupModal = () => {
        setKickMemberToGroupModalIsOpen(false);
        setMemberToKick("");
    };
    const openShowKickMemberToGroupModal = (mem: string) => {
        setKickMemberToGroupModalIsOpen(true);
        setShowMembersModalIsOpen(false);
        setMemberToKick(mem);
    };

    const openShowMediaDetailModal = (media: string) => {
        setShowMediaDetailModalIsOpen(true);
        setMediaDetail(media);
    };

    const closeShowMediaDetailModal = () => {
        setShowMediaDetailModalIsOpen(false);
        setMediaDetail("");
    };

    useEffect(() => {
        if (conversation.conversationType !== "private") {
            return;
        }

        const userId = conversation?.members?.find(
            (member) => member._id !== currentUser?._id
        );

        if (!userId) return;

        setUser(userId);
    }, [conversation._id]);

    const leaveGroup = useLeaveGroup(conversation?._id);
    const handleLeaveGroup = () => {
        leaveGroup.mutate(
            {
                userId: currentUser?._id,
            },
            {
                onSuccess: () => {
                    toast.success("Leave group successfully!");
                    router.push("/messages/conversation");
                },
            }
        );
    };

    const kickMemberToGroup = useKickMemberToGroup(
        conversation?._id,
        memberToKick
    );
    const handleKickMemberToGroup = () => {
        kickMemberToGroup.mutate(
            { userId: memberToKick },
            {
                onSuccess: () => {
                    toast.success("User has been kicked");
                    setKickMemberToGroupModalIsOpen(false);
                },
            }
        );
    };

    const mediaToShow = media?.pages?.flatMap((page): any => page.media);

    return (
        <div className="bg-white rounded-lg p-2 w-full h-full">
            <div className="border-b pb-2">
                <div className="flex justify-center">
                    <img
                        src={
                            conversation?.conversationPicture ||
                            user?.profilePicture
                        }
                        alt=""
                        className="w-10 h-10 rounded-full border"
                    />
                </div>
                <div className="flex justify-center">
                    <p className=" font-semibold">
                        {conversation?.conversationName || user.name}
                    </p>
                </div>
            </div>
            <div className="">
                {conversation.conversationType === "group" && (
                    <>
                        <button
                            onClick={openShowMembersModal}
                            className="px-2 hover:bg-third flex gap-2 items-center py-1 font-semibold border-b w-full"
                        >
                            <GoPeople />{" "}
                            <span className="font-semibold">Members</span>
                        </button>
                    </>
                )}
                {conversation.conversationType === "private" && (
                    <Link
                        href={`/profile/${user.username}`}
                        className="px-2 hover:bg-third flex gap-2 items-center py-1 font-semibold border-b w-full"
                    >
                        <FaRegUser />{" "}
                        <span className="font-semibold">Profile</span>
                    </Link>
                )}
                {conversation.conversationType === "group" && (
                    <>
                        <button
                            onClick={openShowLeaveGroupModal}
                            className="px-2 hover:bg-third flex gap-2 items-center py-1 font-semibold border-b w-full"
                        >
                            <HiOutlineArrowLeftStartOnRectangle />{" "}
                            <span className="font-semibold">Leave</span>
                        </button>
                    </>
                )}
            </div>
            <div className="flex flex-wrap mt-2">
                {mediaToShow?.map((m) =>
                    m.type === "video" ? (
                        <video
                            onClick={() => openShowMediaDetailModal(m.text)}
                            key={m._id}
                            src={m.text}
                            className="w-1/2 aspect-square border hover:cursor-pointer hover:opacity-80"
                        />
                    ) : (
                        <img
                            onClick={() => openShowMediaDetailModal(m.text)}
                            key={m._id}
                            src={m.text}
                            alt="Image"
                            className="w-1/2 aspect-square border hover:cursor-pointer hover:opacity-80"
                        />
                    )
                )}
            </div>

            {/* members */}
            {conversation.conversationType === "group" && (
                <>
                    <Modal
                        isOpen={showMembersModalIsOpen}
                        onRequestClose={closeShowMembersModal}
                        className="w-full mt-16 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white"
                        overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <SimpleBar className={`h-full  overflow-y-auto w-full`}>
                            <div className="py-5 border-b flex px-2 justify-between items-center">
                                <h2 className="text-xl font-bold text-primary">
                                    Members
                                </h2>
                                <div className="py-3 flex px-2 justify-end items-center">
                                    <button
                                        onClick={closeShowMembersModal}
                                        className="text-secondary hover:text-black"
                                    >
                                        <IoMdClose className="text-2xl" />
                                    </button>
                                </div>
                            </div>
                            <div className={` px-2`}>
                                {conversation?.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className={`flex items-center ${
                                            conversation.admin._id ===
                                                currentUser?._id &&
                                            "justify-between"
                                        } gap-3 py-2 border-b`}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <img
                                                src={member.profilePicture}
                                                alt="Profile picture"
                                                className="w-10 h-10 rounded-full border"
                                            />
                                            <div className="flex gap-3 items-center">
                                                <Link
                                                    href={`/profile/${member.username}`}
                                                    className="font-semibold hover:text-primary"
                                                >
                                                    {member.name}
                                                </Link>
                                                {conversation.admin._id ===
                                                    member?._id && (
                                                    <span className="text-xs">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {conversation.admin._id ===
                                            currentUser?._id &&
                                            conversation.admin._id !==
                                                member?._id && (
                                                <button
                                                    onClick={() =>
                                                        openShowKickMemberToGroupModal(
                                                            member?._id
                                                        )
                                                    }
                                                    className="bg-red-400 py-1 px-2 rounded text-white hover:text-red-400 hover:bg-white border border-red-400"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </SimpleBar>
                    </Modal>
                </>
            )}

            {/* invite */}
            <>
                <Modal
                    isOpen={inviteMemberModalIsOpen}
                    onRequestClose={closeInviteMemberModal}
                    className="w-full mt-16 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white"
                    overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                >
                    <SimpleBar className={`h-full  overflow-y-auto w-full`}>
                        <div className="py-3 border-b flex px-2 justify-between items-center">
                            <h2 className="text-xl font-bold text-primary">
                                Invite members
                            </h2>
                            <div className="py-3 flex px-2 justify-end items-center">
                                <button
                                    onClick={closeInviteMemberModal}
                                    className="text-secondary hover:text-black"
                                >
                                    <IoMdClose className="text-2xl" />
                                </button>
                            </div>
                        </div>
                        <div className={` px-2`}>
                            <div className="flex justify-center mt-2">
                                <div className="flex border rounded">
                                    <input
                                        type="text"
                                        className="border-0 rounded py-1 pl-2 outline-none"
                                    />
                                    <button className="hover:text-black text-secondary hover:font-semibold px-2">
                                        <IoIosSearch />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SimpleBar>
                </Modal>
            </>

            {/* search in conversation */}

            {/* kick member */}
            <Modal
                isOpen={kickMemberToGroupModalIsOpen}
                onRequestClose={closeShowKickMemberToGroupModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div className="pb-5">
                    <p className="text-center text-lg py-5">
                        Are you sure you want to kick this member to group?
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleKickMemberToGroup}
                            className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                        >
                            Yes
                        </button>
                        <button
                            onClick={closeShowKickMemberToGroupModal}
                            className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                        >
                            No
                        </button>
                    </div>
                </div>
            </Modal>

            {/* leave group */}
            <Modal
                isOpen={leaveGroupModalIsOpen}
                onRequestClose={closeShowLeaveGroupModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    {conversation?.admin?._id === currentUser?._id ? (
                        <div className="pb-5">
                            <p className="text-center text-lg py-5">
                                You can't leave this group because you are the
                                admin!
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={closeShowLeaveGroupModal}
                                    className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-5">
                            <p className="text-center text-lg py-5">
                                Are you sure you want to leave this group?
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={handleLeaveGroup}
                                    className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={closeShowLeaveGroupModal}
                                    className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* show media detail */}
            <Modal
                isOpen={showMediaDetailModalIsOpen}
                onRequestClose={closeShowMediaDetailModal}
                className="w-full mt-16 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white"
                overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <SimpleBar className={`h-full  overflow-y-auto w-full`}>
                    <div className="flex p-2 justify-end items-center border-b">
                        <div className="py-2 flex px-2 justify-end items-center">
                            <button
                                onClick={closeShowMediaDetailModal}
                                className="text-secondary hover:text-black"
                            >
                                <IoMdClose className="text-xl" />
                            </button>
                        </div>
                    </div>
                    <div className={` px-2`}>
                        {mediaDetail.includes("video") ? (
                            <video
                                src={mediaDetail}
                                className="aspect-square"
                                controls
                                controlsList="nofullscreen"
                            />
                        ) : (
                            <img
                                src={mediaDetail}
                                className="aspect-square"
                                alt=""
                            />
                        )}
                    </div>
                </SimpleBar>
            </Modal>
        </div>
    );
}
