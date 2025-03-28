"use client";

import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import Modal from "react-modal";
import { IoMdClose, IoMdCloudUpload } from "react-icons/io";
import { IUserS } from "@/types/user";
import Select from "react-select";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { ClipLoader } from "react-spinners";
import { removeOneImage } from "@/hooks/useRemoveOneImage";
import { useRouter } from "next/navigation";
import { IGroup } from "@/types/group";
import Link from "next/link";
import {
    useCreateGroup,
    useGetYourGroups,
    useGetYourGroupsJoined,
    useGetYourPendingGroups,
    useSearchGroups,
} from "@/hooks/react-query/group";
import { toast } from "react-toastify";

Modal.setAppElement("#main-body");

export default function YourGroups({ currentUser }: { currentUser: IUserS }) {
    const [modalCreateGroupIsOpen, setCreateGroupIsOpen] =
        useState<boolean>(false);
    const [visibility, setVisibility] = useState<string>("");
    const [groupPicture, setGroupPicture] = useState<string>("");
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [formDataCreateNewGroup, setFormDataCreateNewGroup] = useState({
        name: "",
        description: "",
    });
    const [currentTab, setCurrentTab] = useState<string>("Yours");
    const { data: yourGroups, isLoading: isLoadingYourGroups } =
        useGetYourGroups(currentTab);
    const { data: yourGroupsJoined, isLoading: isLoadingYourGroupsJoined } =
        useGetYourGroupsJoined(currentTab);
    const { data: yourPendingGroups, isLoading: isLoadingYourPendingGroups } =
        useGetYourPendingGroups(currentTab);
    const [searchGroups, setSearchGroups] = useState<string>("");
    const {
        data: searchGroupsResult,
        isLoading: isLoadingSearchGroupsResult,
        isError: isErrorSearchGroupsResult,
    } = useSearchGroups(searchGroups);

    const handleChangeSearchGroups = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchGroups(e.target.value);
    };

    const tabs = ["Yours", "Joined", "Pending"];

    const handleChangeCurrentTab = (tabChange: string) => {
        if (currentTab === tabChange) return;
        setCurrentTab(tabChange);
    };

    const handleChooceImage = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (groupPicture) {
            await removeOneImage(groupPicture);
            setGroupPicture("");
        }
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const type = "groups";
            const username = currentUser?.username;
            setLoadingImage(true);
            const uploadedImage = await uploadOneImage(file, type, username);
            if (uploadedImage) {
                setGroupPicture(uploadedImage);
            }
            setLoadingImage(false);
        } else {
            setError("Please upload a valid image file!");
        }
    };

    const openCreateGroupModal = () => setCreateGroupIsOpen(true);
    const closeCreateGroupModal = () => setCreateGroupIsOpen(false);
    const handleChangeVisibility = (selectedOption: any) => {
        setVisibility(selectedOption.value);
    };

    const options = [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
    ];

    const router = useRouter();

    const createGroup = useCreateGroup();
    const handleSubmitCreateNewGroup = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        if (!formDataCreateNewGroup.name) {
            setError("Group name is required");
            setLoading(false);
            return;
        }
        if (!groupPicture) {
            setError("Group picture is required");
            setLoading(false);
            return;
        }
        if (!visibility) {
            setError("Visibility is required");
            setLoading(false);
            return;
        }
        const data = {
            ...formDataCreateNewGroup,
            groupPicture,
            groupVisibility: visibility,
        };

        createGroup.mutate(
            {
                data,
            },
            {
                onSuccess: (response) => {
                    router.push(`/groups/${response._id}`);
                    toast.success("Create group successfully!");
                },
            }
        );
    };

    const handleChangeFormCreateNewGroup = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormDataCreateNewGroup({
            ...formDataCreateNewGroup,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div>
            <div className="flex justify-center border-b">
                <h1 className="font-semibold text-xl py-3 text-secondary">
                    Groups
                </h1>
            </div>
            <form className="border rounded mx-2 mt-3 hidden md:flex">
                <input
                    onChange={handleChangeSearchGroups}
                    type="text"
                    className="w-full border-none rounded px-2 focus:outline-none"
                    placeholder="Search groups"
                />
                <button
                    type="button"
                    className=" text-secondary px-2 py-2 rounded hover:text-black"
                >
                    <IoSearch />
                </button>
            </form>
            <div className="flex justify-center mt-3 px-2 pb-2 md:pb-0">
                <button
                    onClick={openCreateGroupModal}
                    className="flex gap-1 items-center justify-center py-1 px-2 border w-full rounded bg-third text-primary hover:bg-gray-200 font-semibold"
                >
                    <FaPlus />
                    Create new group
                </button>
            </div>
            <div className="mt-3 border-t hidden md:block">
                <div className="flex justify-center gap-1 px-2 my-3">
                    {searchGroups === "" &&
                        tabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => handleChangeCurrentTab(tab)}
                                className={`rounded font-semibold ${
                                    tab === currentTab
                                        ? "bg-primary text-white"
                                        : "bg-third text-secondary"
                                } hover:bg-primary hover:text-white px-1 py-1 text-sm`}
                            >
                                {tab}
                            </button>
                        ))}
                </div>
                <div className="px-2 ">
                    {currentTab === "Yours" &&
                        searchGroups === "" &&
                        (yourGroups && yourGroups?.length > 0 ? (
                            yourGroups.map((group: IGroup) => (
                                <Link
                                    href={`/groups/${group._id}`}
                                    key={group._id}
                                    className="hover:bg-third flex gap-2 items-center rounded-lg hover:cursor-pointer mb-1 border"
                                >
                                    <img
                                        src={group.groupPicture}
                                        alt="group"
                                        className="w-10 h-10 rounded-lg"
                                    />
                                    <p className="text-center font-semibold text-sm">
                                        {group.name}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="flex justify-center font-semibold pb-4 text-sm">
                                You have not created any group yet!
                            </div>
                        ))}
                        {currentTab === "Pending" &&
                        searchGroups === "" &&
                        (yourPendingGroups && yourPendingGroups?.length > 0 ? (
                            yourPendingGroups.map((group: IGroup) => (
                                <Link
                                    href={`/groups/${group._id}`}
                                    key={group._id}
                                    className="hover:bg-third flex gap-2 items-center rounded-lg hover:cursor-pointer mb-1 border"
                                >
                                    <img
                                        src={group.groupPicture}
                                        alt="group"
                                        className="w-10 h-10 rounded-lg"
                                    />
                                    <p className="text-center font-semibold text-sm">
                                        {group.name}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="flex justify-center font-semibold pb-4 text-sm">
                                You have not pending any group yet!
                            </div>
                        ))}
                    {currentTab === "Joined" &&
                        searchGroups === "" &&
                        (yourGroupsJoined && yourGroupsJoined?.length > 0 ? (
                            yourGroupsJoined.map((group: IGroup) => (
                                <Link
                                    href={`/groups/${group._id}`}
                                    key={group._id}
                                    className="hover:bg-third flex gap-2 items-center rounded-lg hover:cursor-pointer mb-1 border"
                                >
                                    <img
                                        src={group.groupPicture}
                                        alt="group"
                                        className="w-10 h-10 rounded-lg"
                                    />
                                    <p className="text-center font-semibold text-sm">
                                        {group.name}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="flex justify-center font-semibold text-sm">
                                You have not joined any group yet!
                            </div>
                        ))}
                    {isLoadingSearchGroupsResult || isLoadingYourGroups || isLoadingYourGroupsJoined || isLoadingYourPendingGroups && (
                        <div className="flex justify-center items-center">
                            <ClipLoader color="blue" size={15} />
                        </div>
                    )}
                    {searchGroups !== "" &&
                        (searchGroupsResult &&
                        searchGroupsResult?.length > 0 ? (
                            searchGroupsResult.map((group: any) => (
                                <Link
                                    href={`/groups/${group?._id}`}
                                    className="flex gap-2 items-center hover:bg-third w-full hover:cursor-pointer rounded-lg mb-1 border"
                                >
                                    <img
                                        src={group.groupPicture}
                                        className="h-10 w-10 rounded aspect-square"
                                    />
                                    <div>
                                        <p className="text-center font-semibold text-sm">
                                            {group.name}
                                            <span className="text-xs text-secondary">
                                                {" "}
                                                ({group?.membersCount} Members)
                                            </span>
                                        </p>
                                        <p className="text-xs">
                                            {group?.friendCount} Friends joined{" "}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : !isLoadingSearchGroupsResult ? (
                            <div className="flex justify-center font-semibold">
                                No group found!
                            </div>
                        ) : null)}
                </div>
            </div>

            <Modal
                isOpen={modalCreateGroupIsOpen}
                onRequestClose={closeCreateGroupModal}
                className="w-full md:w-1/2 lg:w-1/3 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="py-5 border-b flex px-2 justify-between items-center">
                        <h2 className="text-xl font-bold text-primary">
                            Create new group
                        </h2>
                        <button
                            onClick={closeCreateGroupModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                    <form
                        className="px-2"
                        onSubmit={handleSubmitCreateNewGroup}
                    >
                        <div className="flex gap-2 mt-3">
                            <img
                                src={currentUser?.profilePicture}
                                alt="profile"
                                className="w-12 h-12 rounded-full border"
                            />
                            <div>
                                <p className="font-semibold">
                                    {currentUser?.name}
                                </p>
                                <p>Admin</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <input
                                onChange={handleChangeFormCreateNewGroup}
                                placeholder="Group name"
                                type="text"
                                name="name"
                                className="border outline-none py-2 px-3 w-full rounded"
                            />
                            <input
                                onChange={handleChangeFormCreateNewGroup}
                                placeholder="Group description"
                                type="text"
                                name="description"
                                className="border outline-none py-2 px-3 w-full rounded mt-3"
                            />
                            <div className="relative h-40 mb-3 flex items-center">
                                <label htmlFor="group-picture" className="mt-3">
                                    Group picture
                                </label>
                                <input
                                    onChange={handleChooceImage}
                                    id="group-picture"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                />
                                <div className="absolute right-0 left-0 h-full items-center flex justify-center top-0 mt-3">
                                    <label
                                        htmlFor="group-picture"
                                        className="cursor-pointer w-40 h-40 flex items-center justify-center border rounded hover:text-black text-secondary"
                                    >
                                        {groupPicture ? (
                                            <img
                                                src={groupPicture}
                                                alt="group"
                                                className="w-40 h-40 rounded"
                                            />
                                        ) : loadingImage ? (
                                            <div className="flex items-center justify-center">
                                                <ClipLoader color="#3795BD" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-center">
                                                    <div className="flex justify-center">
                                                        <IoMdCloudUpload className="text-2xl" />
                                                    </div>
                                                    <p>Upload</p>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Select
                                    onChange={handleChangeVisibility}
                                    name="visibility"
                                    placeholder="Visibility"
                                    options={options}
                                />
                            </div>
                            {error && (
                                <div className="mt-3 text-red-500">{error}</div>
                            )}
                        </div>
                        <div className="my-3">
                            <button
                                type="submit"
                                className="w-full py-2 border bg-primary text-white font-semibold hover:text-primary hover:bg-white rounded border-primary"
                            >
                                {loading ? (
                                    <ClipLoader color="#fff" />
                                ) : (
                                    "Create group"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
