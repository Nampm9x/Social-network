"use client";

import { IGroup } from "@/types/group";
import Select from "react-select";
import React, { Dispatch, SetStateAction, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { BeatLoader, ClipLoader } from "react-spinners";
import SimpleBar from "simplebar-react";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { IUser, IUserS } from "@/types/user";
import { toast } from "react-toastify";
import { useEditGroup } from "@/hooks/react-query/group";

export default function EditGroup({
    group,
    currentUser,
    closeEditGroup,
    setIsShowEditGroupModal,
}: {
    group: IGroup;
    currentUser: IUserS;
    closeEditGroup: (value: any) => void;
    setIsShowEditGroupModal: Dispatch<SetStateAction<boolean>>;
}) {
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [image, setImage] = useState<string>(group.groupPicture);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<string>(group.groupVisibility);
    const [editGroupForm, setEditGroupForm] = useState<{
        name: string;
        description: string;
    }>({
        name: group.name,
        description: group.description,
    });

    const options = [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
    ];

    const handleChooceImage = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const type = "groups";
            const username = currentUser?.username;
            setLoadingImage(true);
            const uploadedImage = await uploadOneImage(file, type, username);
            if (uploadedImage) {
                setImage(uploadedImage);
            }
            setLoadingImage(false);
        } else {
            setError("Please upload a valid image file!");
        }
    };

    const handleChangeVisibility = (selectedOption: any) => {
        setVisibility(selectedOption.value);
    };

    const handleChangeGroupForm = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setEditGroupForm({ ...editGroupForm, [e.target.name]: e.target.value });
    };

    const editGroup = useEditGroup(group._id);
    const handleSubmitEditGroup = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        if (!visibility) {
            toast.error("Visibility is required!");
            return;
        }
        if (!image) {
            toast.error("Image is required!");
            return;
        }
        editGroup.mutate(
            {
                data: {
                    ...editGroupForm,
                    groupVisibility: visibility,
                    groupPicture: image,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Group updated");
                    setIsShowEditGroupModal(false);
                },
            }
        );
    };

    return (
        <>
            <SimpleBar className="max-h-[95vh] overflow-y-auto">
                <div className="py-5 border-b flex px-2 justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">
                        Edit group
                    </h2>
                    <button
                        onClick={closeEditGroup}
                        className="text-secondary hover:text-black"
                    >
                        <IoMdClose className="text-2xl" />
                    </button>
                </div>
                <form
                    className="px-2 text-secondary"
                    onSubmit={handleSubmitEditGroup}
                >
                    <div className="mt-3">
                        <label>Group name</label>
                        <br />
                        <input
                            onChange={handleChangeGroupForm}
                            type="text"
                            required
                            placeholder="Group name here"
                            name="name"
                            value={editGroupForm.name}
                            className="w-full rounded px-2 py-1 border outline-none"
                        />
                    </div>
                    <div className="mt-2">
                        <label>Group description</label>
                        <br />
                        <textarea
                            onChange={handleChangeGroupForm}
                            value={editGroupForm.description}
                            rows={3}
                            required
                            placeholder="Your group description"
                            name="description"
                            className="resize-none w-full rounded px-2 py-1 border outline-none"
                        />
                    </div>
                    <div className="relative h-40 mb-3 flex items-center">
                        <label htmlFor="group-picture" className="mt-3">
                            Group picture
                        </label>
                        <input
                            id="group-picture"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleChooceImage}
                        />
                        <div className="absolute right-0 left-0 h-full items-center flex justify-center top-0 mt-3">
                            <label
                                htmlFor="group-picture"
                                className="cursor-pointer w-40 h-40 flex items-center justify-center border rounded hover:text-black text-secondary"
                            >
                                {loadingImage ? (
                                    <div className="flex items-center justify-center">
                                        <ClipLoader color="#3795BD" />
                                    </div>
                                ) : (
                                    <img
                                        src={image}
                                        alt="group"
                                        className="w-40 h-40 rounded"
                                    />
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-3 items-center">
                        <Select
                            onChange={handleChangeVisibility}
                            name="visibility"
                            placeholder="Visibility"
                            options={options}
                        />
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                    <div className="flex justify-center mt-3 mb-5">
                        <button
                            type="submit"
                            className="font-semibold bg-primary text-white w-full py-2 border border-primary rounded-md hover:text-primary hover:bg-white"
                        >
                            {loading ? <BeatLoader /> : "Update"}
                        </button>
                    </div>
                </form>
            </SimpleBar>
        </>
    );
}
