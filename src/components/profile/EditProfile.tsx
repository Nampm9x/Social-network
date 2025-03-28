"use client";

import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { IUser, IUserS } from "@/types/user";
import { toast } from "react-toastify";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { useRouter } from "next/navigation";
import { LiaTimesSolid } from "react-icons/lia";
import { LiaCheckSolid } from "react-icons/lia";
import { useCheckExistsUsername, useEditUser } from "@/hooks/react-query/user";

Modal.setAppElement("#main-body");

export default function EditProfile({
    user,
    editProfileModalIsOpen,
    closeEditProfileModal,
    currentUser,
}: {
    user: IUser;
    editProfileModalIsOpen: boolean;
    closeEditProfileModal: () => void;
    currentUser: IUserS;
}) {
    const [formEdit, setFormEdit] = useState({
        name: user?.name || "",
        biography: user?.biography || "",
        birthday: user?.birthday?.substring(0, 10) || "",
        birthdayVisibility: user?.birthdayVisibility || "Private",
        work: user?.work || "",
        workVisibility: user?.workVisibility || "Private",
        livesIn: user?.livesIn || "",
        livesInVisibility: user?.livesInVisibility || "Private",
        status: user?.status || "",
        statusVisibility: user?.statusVisibility || "Private",
        username: user?.username || "",
        enterPassword: "",
    });
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [imageEdit, setImageEdit] = useState<string>("");
    const {
        data: checkExistsUsername,
        isLoading: isLoadingCheckExistsUsername,
    } = useCheckExistsUsername(formEdit?.username, editProfileModalIsOpen);

    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFormEdit({
                name: user.name || "",
                biography: user.biography || "",
                birthday: user.birthday?.substring(0, 10) || "",
                birthdayVisibility: user.birthdayVisibility || "Private",
                work: user.work || "",
                workVisibility: user.workVisibility || "Private",
                livesIn: user.livesIn || "",
                livesInVisibility: user.livesInVisibility || "Private",
                status: user.status || "",
                statusVisibility: user.statusVisibility || "Private",
                username: user.username || "",
                enterPassword: "",
            });
            setImageEdit(user.profilePicture);
        }
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormEdit({ ...formEdit, [e.target.name]: e.target.value });
    };

    const handleChangeProfilePicture = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const type = "profilePictures";
            const username = currentUser?.username;
            setLoadingImage(true);
            const uploadedImage = await uploadOneImage(file, type, username);
            if (uploadedImage) {
                setImageEdit(uploadedImage);
            }
            setLoadingImage(false);
        } else {
            toast.error("Please upload a valid image file!");
        }
    };

    const editUser = useEditUser();
    const handleSubmit = () => {
        if (checkExistsUsername === undefined) {
            toast.error("Username is required");
            return;
        }
        if (checkExistsUsername?.exist) {
            toast.error("Username existed");
            return;
        }
        editUser.mutate(
            {
                data: { ...formEdit, profilePicture: imageEdit },
            },
            {
                onSuccess: (res) => {
                    router.replace(`/profile/${res.username}`, undefined);
                    toast.success("Profile update!");
                    setFormEdit({ ...formEdit, enterPassword: "" });
                    closeEditProfileModal();
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data.message || "Something went wrong"
                    );
                },
            }
        );
    };

    return (
        <>
            <Modal
                isOpen={editProfileModalIsOpen}
                onRequestClose={closeEditProfileModal}
                className="w-full md:w-1/2 lg:w-2/5 z-50 rounded-md bg-white"
                overlayClassName="fixed mt-16 z-50 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div className="max-h-[95vh] overflow-y-auto">
                    <div className="py-5 border-b flex px-2 justify-between items-center">
                        <h2 className="text-xl font-bold text-primary">
                            Edit profile
                        </h2>
                        <div className="py-3 flex px-2 justify-end items-center">
                            <button
                                onClick={closeEditProfileModal}
                                className="text-secondary hover:text-black"
                            >
                                <IoMdClose className="text-2xl" />
                            </button>
                        </div>
                    </div>
                    <div className="px-2">
                        <div className="mt-3 flex gap-1 items-center">
                            <div className="min-w-[30%]">Profile picture:</div>
                            <div>
                                {loadingImage ? (
                                    <div className="h-24 w-24 flex items-center justify-center rounded-full border">
                                        <ClipLoader color="#3795BD" />
                                    </div>
                                ) : (
                                    <img
                                        src={
                                            imageEdit
                                                ? imageEdit
                                                : user?.profilePicture
                                        }
                                        className="h-24 w-24 rounded-full border"
                                        alt=""
                                    />
                                )}
                            </div>
                            <label
                                htmlFor="profilePicture-edit"
                                className="bg-primary text-white hover:text-primary border border-primary hover:cursor-pointer hover:bg-white px-3 py-1 rounded"
                            >
                                Change
                            </label>
                            <input
                                onChange={handleChangeProfilePicture}
                                multiple
                                hidden
                                type="file"
                                id="profilePicture-edit"
                            />
                        </div>

                        <div className="mt-3">
                            <div className="flex gap-1 items-center">
                                <label
                                    htmlFor="name-edit"
                                    className="min-w-[30%]"
                                >
                                    Name:
                                </label>
                                <input
                                    value={formEdit.name}
                                    onChange={handleChange}
                                    id="name-edit"
                                    name="name"
                                    className="py-1 w-full flex items-center border outline-none px-1 rounded text-sm"
                                />
                            </div>
                            <div className="flex mt-2 gap-1 items-center relative">
                                <label
                                    htmlFor="username-edit"
                                    className="min-w-[30%]"
                                >
                                    Username:
                                </label>
                                <input
                                    value={formEdit.username}
                                    onChange={handleChange}
                                    id="username-edit"
                                    name="username"
                                    className="py-1 w-full flex items-center border outline-none px-1 rounded text-sm"
                                />
                                <div className="absolute h-full flex items-center right-0 pr-1">
                                    {checkExistsUsername?.exist ||
                                    checkExistsUsername === undefined ? (
                                        <LiaTimesSolid className="text-red-500" />
                                    ) : (
                                        <LiaCheckSolid className="text-green-600" />
                                    )}
                                </div>
                            </div>
                            <div className="flex mt-2 gap-1 items-center">
                                <label
                                    htmlFor="biography-edit"
                                    className="min-w-[30%]"
                                >
                                    Biography:
                                </label>
                                <input
                                    value={formEdit.biography}
                                    onChange={handleChange}
                                    id="biography-edit"
                                    name="biography"
                                    className="p-1 flex items-center w-full border outline-none rounded text-sm"
                                />
                            </div>
                            <div className="flex mt-2 items-center gap-1">
                                <label
                                    htmlFor="birthday-edit"
                                    className="min-w-[30%]"
                                >
                                    Birthday:
                                </label>
                                <input
                                    type="Date"
                                    value={formEdit.birthday}
                                    required
                                    id="birthday-edit"
                                    onChange={handleChange}
                                    name="birthday"
                                    className="outline-none border rounded py-1 px-2 w-full"
                                />
                                <select
                                    name="birthdayVisibility"
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="Public">Public</option>
                                    <option value="Folowers">Folowers</option>
                                    <option value="Friends">Friends</option>
                                    <option value="Private">Private</option>
                                </select>
                            </div>
                            <div className="mt-2 flex gap-1 items-center">
                                <label
                                    htmlFor="status-edit"
                                    className="min-w-[30%]"
                                >
                                    Status:
                                </label>
                                <select
                                    onChange={handleChange}
                                    value={formEdit.status}
                                    name="status"
                                    id="status-edit"
                                    className="border py-1 px-2 rounded w-full"
                                >
                                    <option value="" hidden disabled>
                                        Status
                                    </option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="In a relationship">
                                        In a relationship
                                    </option>
                                </select>
                                <select
                                    name="statusVisibility"
                                    onChange={handleChange}
                                    value={formEdit.statusVisibility}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="Public">Public</option>
                                    <option value="Folowers">Folowers</option>
                                    <option value="Friends">Friends</option>
                                    <option value="Private">Private</option>
                                </select>
                            </div>
                            <div className="mt-2 flex gap-1 items-center">
                                <label
                                    htmlFor="work-edit"
                                    className="min-w-[30%]"
                                >
                                    Work:
                                </label>
                                <input
                                    name="work"
                                    value={formEdit.work}
                                    id="work-edit"
                                    onChange={handleChange}
                                    className="p-1 w-full flex items-center border outline-none rounded text-sm"
                                />
                                <select
                                    name="workVisibility"
                                    onChange={handleChange}
                                    value={formEdit.workVisibility}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="Public">Public</option>
                                    <option value="Folowers">Folowers</option>
                                    <option value="Friends">Friends</option>
                                    <option value="Private">Private</option>
                                </select>
                            </div>
                            <div className="mt-2 flex gap-1 items-center">
                                <label
                                    htmlFor="livesIn-edit"
                                    className="min-w-[30%]"
                                >
                                    Lives in:
                                </label>
                                <input
                                    name="livesIn"
                                    value={formEdit.livesIn}
                                    id="livesIn-edit"
                                    onChange={handleChange}
                                    className="p-1 w-full border outline-none flex items-center rounded text-sm"
                                />
                                <select
                                    name="livesInVisibility"
                                    onChange={handleChange}
                                    value={formEdit.livesInVisibility}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="Public">Public</option>
                                    <option value="Folowers">Folowers</option>
                                    <option value="Friends">Friends</option>
                                    <option value="Private">Private</option>
                                </select>
                            </div>
                            <div className="mt-2 flex gap-1 items-center">
                                <label
                                    htmlFor="password-edit"
                                    className="min-w-[30%]"
                                >
                                    Enter password:
                                </label>
                                <input
                                    name="enterPassword"
                                    type="password"
                                    id="password-edit"
                                    required
                                    value={formEdit.enterPassword}
                                    onChange={handleChange}
                                    className="w-full border p-1 outline-none rounded text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mt-3 mb-5">
                            <button
                                onClick={handleSubmit}
                                type="submit"
                                className={`font-semibold bg-primary text-white w-full py-2 border border-primary rounded-md hover:text-primary hover:bg-white `}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
