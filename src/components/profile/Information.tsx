"use client";

import { useState } from "react";
import { MdEdit } from "react-icons/md";
import Modal from "react-modal";
import { IoMdClose } from "react-icons/io";
import EditProfile from "./EditProfile";
import { IUser, IUserS } from "@/types/user";
import { FadeLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import Follows from "./Follows";
import { useChangeCoverPhoto, useFollowUser } from "@/hooks/react-query/user";
import { FaCamera } from "react-icons/fa";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { useGetConversationByUserId } from "@/hooks/react-query/message";
import { toast } from "react-toastify";

Modal.setAppElement("#main-body");

export default function Information({
    user,
    currentUser,
    navigation,
    setNavigation,
}: {
    user: IUser;
    currentUser: IUserS;
    navigation: string;
    setNavigation: (value: string) => void;
}) {
    const tabs = ["Feed", "Posts", "Events", "About"];
    const [profilePictureModalIsOpen, setProfilePictureIsOpen] =
        useState(false);
    const [editProfileModalIsOpen, setEditProfileIsOpen] = useState(false);
    const [modalShowFollowersIsOpen, setModalShowFollowersIsOpen] =
        useState<boolean>(false);
    const [modalShowFollowingIsOpen, setModalShowFollowingIsOpen] =
        useState<boolean>(false);
    const [coverPhoto, setCoverPhoto] = useState<string>("");
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { data: result, isLoading: isLoadingResult } =
        useGetConversationByUserId(currentUser?._id, user);

    const handleChooceImage = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const type = "events";
            const username = currentUser?.username;
            setLoadingImage(true);
            const uploadedImage = await uploadOneImage(file, type, username);
            if (uploadedImage) {
                setCoverPhoto(uploadedImage);
            }
            setLoadingImage(false);
        } else {
            setError("Please upload a valid image file!");
        }
    };

    const router = useRouter();
    const handleChangeNavigation = (tab: string) => {
        setNavigation(tab);
    };

    const openProfilePictureModal = () => setProfilePictureIsOpen(true);
    const closeProfilePictureModal = () => setProfilePictureIsOpen(false);

    const openEditProfileModal = () => setEditProfileIsOpen(true);
    const closeEditProfileModal = () => setEditProfileIsOpen(false);

    const followUser = useFollowUser(user?.username);
    const handleFollowUser = () => {
        followUser.mutate({
            followId: user._id,
        });
    };

    const handleMessage = async () => {
        router.push(`/messages/${result?._id}`);
    };

    const openShowFollowersModal = () => setModalShowFollowersIsOpen(true);
    const closeShowFollowersModal = () => setModalShowFollowersIsOpen(false);

    const openShowFollowingModal = () => setModalShowFollowingIsOpen(true);
    const closeShowFollowingModal = () => setModalShowFollowingIsOpen(false);

    const changeCoverPhoto = useChangeCoverPhoto(currentUser?.username);
    const handleChangeCoverPhoto = () => {
        changeCoverPhoto.mutate(
            {
                coverPhoto,
            },
            {
                onSuccess: () => {
                    toast.success("Cover photo updated successfully!");
                    setCoverPhoto("");
                },
            }
        );
    };

    return (
        <div className="bg-white rounded-lg">
            <div
                className={`h-32 sm:h-40 md:h-48 rounded-tl-lg bg-cover bg-center relative`}
            >
                {loadingImage ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <FadeLoader />
                    </div>
                ) : (
                    <img
                        src={coverPhoto || user?.coverPicture}
                        alt=""
                        className="w-full h-full"
                    />
                )}
                {currentUser?._id === user?._id && (
                    <div className="absolute top-0 right-0 ml-auto pt-2 flex gap-3 justify-end items-end pb-2 mr-4">
                        <label
                            htmlFor="change-cover-photo"
                            className="font-semibold text-sm flex gap-2 items-center px-2 py-1 bg-secondary text-white hover:text-secondary hover:bg-white border hover:cursor-pointer border-secondary rounded"
                        >
                            <FaCamera />
                            Change
                        </label>
                        <input
                            id="change-cover-photo"
                            type="file"
                            onChange={handleChooceImage}
                            accept="image/*"
                            hidden
                        />
                        {coverPhoto && coverPhoto !== "" && (
                            <button
                                onClick={handleChangeCoverPhoto}
                                className="font-semibold text-sm flex gap-2 items-center px-2 py-1 bg-secondary text-white hover:text-secondary hover:bg-white border hover:cursor-pointer border-secondary rounded"
                            >
                                Save
                            </button>
                        )}
                    </div>
                )}
                {/* Profile Picture */}
                <div className="absolute bottom-0 left-1/2 sm:left-0 sm:ml-2 transform -translate-x-1/2 sm:translate-x-0 translate-y-1/2 z-50">
                    <img
                        onClick={openProfilePictureModal}
                        src={user?.profilePicture}
                        alt=""
                        className="w-24 h-24 border border-white rounded-full hover:cursor-pointer"
                    />
                </div>
            </div>
            <div className="sm:flex justify-between px-4 items-center mt-12">
                <div className="sm:flex gap-2">
                    <div>
                        <p className="font-semibold text-center sm:text-left">
                            {user?.name}
                        </p>
                        <div className="flex gap-2 items-center justify-center sm:justify-start">
                            <p
                                onClick={openShowFollowersModal}
                                className="text-secondary text-sm text-center hover:text-primary hover:cursor-pointer"
                            >
                                {user?.followers?.length}
                                {user?.followers?.length > 1
                                    ? " Followers"
                                    : " Follower"}
                            </p>
                            <p
                                onClick={openShowFollowingModal}
                                className="text-secondary text-sm text-center hover:text-primary hover:cursor-pointer"
                            >
                                {user?.following?.length} Following
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center sm:start mt-3 sm:mt-0">
                    {currentUser?._id === user?._id ? (
                        <button
                            onClick={openEditProfileModal}
                            className="border  border-primary bg-primary py-1 px-2 text-white rounded hover:bg-white hover:text-primary flex items-center gap-2 justify-center"
                        >
                            <MdEdit />
                            Edit profile
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={handleFollowUser}
                                className="border border-primary bg-primary py-1 px-4 text-white rounded hover:bg-white hover:text-primary flex items-center gap-2 justify-center"
                            >
                                {user?.friends.some(
                                    (user) => user._id === currentUser?._id
                                )
                                    ? "Friends"
                                    : user?.followers.some(
                                            (user) =>
                                                user._id === currentUser?._id
                                        )
                                      ? "Following"
                                      : user?.following.some(
                                              (user) =>
                                                  user._id === currentUser?._id
                                          )
                                        ? "Follow back"
                                        : "Follow"}
                            </button>
                            <button
                                onClick={handleMessage}
                                className="border border-secondary hover:border-primary bg-white py-1 px-2 text-secondary rounded hover:text-primary flex items-center gap-2 justify-center"
                            >
                                Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex text-sm md:text-base items-center gap-3 md:gap-5 px-4 mt-5 border-t py-5 text-secondary font-semibold">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleChangeNavigation(tab)}
                        className={`${
                            navigation === tab
                                ? "border-b-2 border-primary text-primary"
                                : ""
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* profile picture modal */}
            <Modal
                isOpen={profilePictureModalIsOpen}
                onRequestClose={closeProfilePictureModal}
                className="w-full mt-20 lg:mt-16 max-h-[calc(100vh-70px)] md:w-2/3 lg:w-[40%] mx-4 lg:mx-0 rounded-md bg-white"
                overlayClassName="fixed lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-start lg:items-center"
            >
                <div>
                    <div className="py-3 flex px-2 justify-end items-center">
                        <button
                            onClick={closeProfilePictureModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                    <div className="px-2 overflow-y-auto">
                        <img
                            src={user?.profilePicture}
                            alt=""
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </Modal>

            {/* edit profile modal */}
            <EditProfile
                user={user}
                editProfileModalIsOpen={editProfileModalIsOpen}
                closeEditProfileModal={closeEditProfileModal}
                currentUser={currentUser}
            />

            {/* Show followers modal */}
            <Follows
                modalShowFollowsIsOpen={modalShowFollowersIsOpen}
                closeShowFollowsModal={closeShowFollowersModal}
                follows={user?.followers}
                currentUser={currentUser}
                type="Followers"
            />

            {/* Show following modal */}
            <Follows
                modalShowFollowsIsOpen={modalShowFollowingIsOpen}
                closeShowFollowsModal={closeShowFollowingModal}
                follows={user?.following}
                currentUser={currentUser}
                type="Following"
            />
        </div>
    );
}
