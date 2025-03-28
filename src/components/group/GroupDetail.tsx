"use client";

import { IGroup } from "@/types/group";
import React, { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { MdPublic } from "react-icons/md";
import { IUser, IUserS } from "@/types/user";
import CreatePost from "./CreatePost";
import { IGroupPost } from "@/types/grouppost";
import PendingMember from "./PendingMember";
import Member from "./Member";
import { toast } from "react-toastify";
import PendingPost from "./PendingPost";
import Post from "./Post";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import EditGroup from "./EditGroup";
import {
    useDeleteGroup,
    useGetGroupPosts,
    useGetPendingPosts,
    useGetYourPendingPosts,
    useJoinGroup,
    useLeaveGroup,
} from "@/hooks/react-query/group";

export default function GroupDetail({
    group,
    currentUser,
}: {
    group: IGroup;
    currentUser: IUserS;
}) {
    const [tabs, setTabs] = useState<string[]>([
        "Feed",
        "Members",
        "Pending members",
        "Pending posts",
    ]);
    const [currentTab, setCurrentTab] = useState<string>("Feed");
    const { data: groupPosts, isLoading: isLoadingGroupPosts } =
        useGetGroupPosts(group._id);
    const [isMemberOfGroup, setIsMemberOfGroup] = useState<boolean>(false);
    const [isPendingMember, setIsPendingMember] = useState<boolean>(false);
    const { data: pendingPosts, isLoading: isLoadingPendingPosts } =
        useGetPendingPosts(group._id, currentTab);
    const [isShowDeleteGroupModal, setIsShowDeleteGroupModal] =
        useState<boolean>(false);
    const [isShowEditGroupModal, setIsShowEditGroupModal] =
        useState<boolean>(false);
    const {
        data: yourPendingPosts,
        isLoading: isLoadingYourPendingPosts,
        isError: isErrorYourPendingPosts,
    } = useGetYourPendingPosts(group._id, currentTab);
    const [modalLeaveGroupIsOpen, setModalLeaveGroupIsOpen] =
        useState<boolean>(false);

    const openLeaveGroupModal = () => setModalLeaveGroupIsOpen(true);
    const closeLeaveGroupModal = () => setModalLeaveGroupIsOpen(false);

    const router = useRouter();

    const openDeleteGroup = () => setIsShowDeleteGroupModal(true);
    const closeDeleteGroup = () => setIsShowDeleteGroupModal(false);

    const openEditGroup = () => setIsShowEditGroupModal(true);
    const closeEditGroup = () => setIsShowEditGroupModal(false);

    const handleChangeCurrentTab = async (tab: string) => {
        setCurrentTab(tab);
    };

    const joinGroup = useJoinGroup(currentUser?._id);
    const handleJoinGroup = async () => {
        joinGroup.mutate(
            {
                groupId: group._id,
            },
            {
                onSuccess: (response:any) => {
                    response?.pendingMembers?.some(
                        (member: {
                            name: string;
                            username: string;
                            _id: string;
                            profilePicture: string;
                        }) => member._id === currentUser?._id
                    )
                        ? setIsPendingMember(true)
                        : setIsPendingMember(false);
                },
            }
        );
    };

    useEffect(() => {
        setIsMemberOfGroup(
            group.members.some((member) => member._id === currentUser?._id)
        );
        setIsPendingMember(
            !!group?.pendingMembers?.some(
                (member:any) => member._id === currentUser?._id
            )
        );

        if (group && group.owner._id !== currentUser?._id) {
            setTabs(["Feed", "Members", "Your pending posts"]);
        }
    }, [group]);

    const leaveGroup = useLeaveGroup(group._id, currentUser?._id);
    const handleLeaveGroup = async () => {
        leaveGroup.mutate(
            {
                groupId: group._id,
                userId: currentUser?._id,
            },
            {
                onSuccess: () => {
                    setModalLeaveGroupIsOpen(false);
                    toast.success("Left group successfully");
                },
            }
        );
    };

    const deleteGroup = useDeleteGroup(group._id);
    const handleDeleteGroup = async () => {
        deleteGroup.mutate(
            {
                userId: "",
            },
            {
                onSuccess: () => {
                    toast.success("Group deleted!");
                    router.push(`/groups/feed`);
                    setIsShowDeleteGroupModal(false);
                },
                onError: (error) => {
                    console.error("Error deleting group: ", error);
                },
            }
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg">
                <img
                    src={group.groupPicture}
                    alt="group"
                    className="w-full h-[150px] md:h-[200px] object-cover border-b rounded-t-lg"
                />
                <div className="py-3 pr-2">
                    <div className="flex gap-3 items-center">
                        <p className="text-2xl px-2 font-bold">{group.name}</p>
                        {group.owner._id === currentUser?._id && (
                            <button
                                onClick={openEditGroup}
                                className="text-white font-semibold px-2 py-1 rounded bg-primary hover:bg-white hover:text-primary border border-primary"
                            >
                                Edit group
                            </button>
                        )}
                        {!isMemberOfGroup &&
                            !isPendingMember &&
                            group.owner._id !== currentUser?._id && (
                                <button
                                    onClick={handleJoinGroup}
                                    className="text-white font-semibold px-2 py-1 rounded bg-primary hover:bg-white hover:text-primary border border-primary"
                                >
                                    Join group
                                </button>
                            )}
                        {!isMemberOfGroup &&
                            isPendingMember &&
                            group.owner._id !== currentUser?._id && (
                                <button
                                    onClick={handleJoinGroup}
                                    className="text-white font-semibold px-2 py-1 rounded bg-primary hover:bg-white hover:text-primary border border-primary"
                                >
                                    Pending
                                </button>
                            )}
                        {!isPendingMember &&
                            isMemberOfGroup &&
                            group.owner._id !== currentUser?._id && (
                                <button
                                    onClick={openLeaveGroupModal}
                                    className="text-white font-semibold px-2 py-1 rounded bg-primary hover:bg-white hover:text-primary border border-primary"
                                >
                                    Leave group
                                </button>
                            )}
                        {group.owner._id === currentUser?._id && (
                            <button
                                onClick={openDeleteGroup}
                                className="text-white font-semibold px-2 py-1 rounded bg-red-500 hover:bg-white hover:text-red-500 border border-red-500"
                            >
                                Delete group
                            </button>
                        )}
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
                            <p
                                onClick={() =>
                                    handleChangeCurrentTab("Members")
                                }
                                className="text-secondary hover:underline hover:cursor-pointer"
                            >
                                {group.members.length} members
                            </p>
                        </div>
                    </div>
                </div>
                {group.description && (
                    <div className="py-3 border-t px-2">
                        <h2 className="font-semibold">Group Description</h2>
                        <p className="text-secondary">{group.description}</p>
                    </div>
                )}
                <div>
                    <div className="flex justify-center gap-3 font-semibold text-secondary items-center py-3 px-2 border-t">
                        {tabs.map((tab, index) => (
                            <div
                                onClick={() => handleChangeCurrentTab(tab)}
                                key={index}
                                className={`border-b-2 hover:border-primary ${
                                    tab === currentTab
                                        ? "border-b-2 border-primary"
                                        : " border-transparent"
                                } ${
                                    (tab === "Pending posts" ||
                                        tab === "Pending members") &&
                                    "relative"
                                } hover:cursor-pointer`}
                            >
                                <p>{tab}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <>
                <div className="mt-4 lg:mt-8 rounded-lg">
                    {currentTab === "Feed" &&
                        group &&
                        group.members.some(
                            (member) => member._id === currentUser?._id
                        ) && (
                            <CreatePost
                                currentUser={currentUser}
                                group={group}
                                handleChangeCurrentTab={handleChangeCurrentTab}
                            />
                        )}
                    {currentTab === "Feed" ? (
                        groupPosts &&
                        groupPosts.length > 0 &&
                        (group.groupVisibility === "public" ||
                            (group.groupVisibility === "private" &&
                                group.members.some(
                                    (member) => member._id === currentUser?._id
                                ))) ? (
                            groupPosts.map((groupPost) => (
                                <div
                                    key={groupPost._id}
                                    className="bg-white mt-4 lg:mt-8 rounded-lg"
                                >
                                    <Post
                                        post={groupPost}
                                        currentUser={currentUser}
                                        group={group}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg font-semibold flex justify-center py-3">
                                <p>No posts yet</p>
                            </div>
                        )
                    ) : currentTab === "Pending members" ? (
                        group.pendingMembers &&
                        group.pendingMembers.length > 0 ? (
                            <div className="bg-white rounded-lg">
                                {group.pendingMembers.map((member) => (
                                    <div key={member._id}>
                                        <PendingMember
                                            member={member}
                                            group={group}
                                            currentUser={currentUser}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg font-semibold flex justify-center py-3">
                                <p>No pending members</p>
                            </div>
                        )
                    ) : currentTab === "Members" ? (
                        group.members &&
                        group.members.length > 0 &&
                        (group.groupVisibility === "public" ||
                            (group.groupVisibility === "private" &&
                                group.members.some(
                                    (member) => member._id === currentUser?._id
                                ))) ? (
                            <div className="bg-white rounded-lg p-2">
                                {group.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className="bg-white rounded-lg"
                                    >
                                        <Member
                                            member={member}
                                            group={group}
                                            currentUser={currentUser}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg font-semibold flex justify-center py-3">
                                <p>No members</p>
                            </div>
                        )
                    ) : currentTab === "Pending posts" ? (
                        pendingPosts &&
                        currentUser?._id === group.owner._id &&
                        pendingPosts.length > 0 ? (
                            <div className="bg-white rounded-lg">
                                {pendingPosts.map((pendingPost) => (
                                    <div key={pendingPost._id}>
                                        <PendingPost
                                            pendingPost={pendingPost}
                                            currentUser={currentUser}
                                            group={group}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg font-semibold flex justify-center py-3">
                                <p>No pending posts</p>
                            </div>
                        )
                    ) : currentTab === "Your pending posts" ? (
                        yourPendingPosts &&
                        yourPendingPosts.length > 0 &&
                        (group.groupVisibility === "public" ||
                            (group.groupVisibility === "private" &&
                                group.members.some(
                                    (member) => member._id === currentUser?._id
                                ))) ? (
                            <div className="bg-white rounded-lg p-2">
                                {yourPendingPosts.map(
                                    (pendingPost: IGroupPost) => (
                                        <div key={pendingPost._id}>
                                            <PendingPost
                                                pendingPost={pendingPost}
                                                currentUser={currentUser}
                                                group={group}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg font-semibold flex justify-center py-3">
                                <p>No pending posts</p>
                            </div>
                        )
                    ) : null}
                </div>

                {/* delete group */}
                <Modal
                    isOpen={isShowDeleteGroupModal}
                    onRequestClose={closeDeleteGroup}
                    className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                    overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                >
                    <div>
                        <div className="pb-5">
                            <p className="text-center text-lg py-5">
                                Are you sure you want to delete this post?
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={handleDeleteGroup}
                                    className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={closeDeleteGroup}
                                    className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* edit group */}
                <Modal
                    isOpen={isShowEditGroupModal}
                    onRequestClose={closeEditGroup}
                    className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                    overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                >
                    <EditGroup
                        group={group}
                        currentUser={currentUser}
                        closeEditGroup={closeEditGroup}
                        setIsShowEditGroupModal={setIsShowEditGroupModal}
                    />
                </Modal>

                {/* leave to the group */}
                <Modal
                    isOpen={modalLeaveGroupIsOpen}
                    onRequestClose={closeLeaveGroupModal}
                    className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                    overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                >
                    <div>
                        <div className="pb-5">
                            <p className="text-center text-lg py-5">
                                Are you sure you want to leave to the group?
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={handleLeaveGroup}
                                    className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={closeLeaveGroupModal}
                                    className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </>
        </>
    );
}
