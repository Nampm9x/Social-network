"use client";

import { useCreateGroupPost } from "@/hooks/react-query/group";
import { removeOneImage } from "@/hooks/useRemoveOneImage";
import { uploadManyImages } from "@/hooks/useUploadImage";
import { IGroup } from "@/types/group";
import { IGroupPost } from "@/types/grouppost";
import { IUser, IUserS } from "@/types/user";
import React, { Dispatch, SetStateAction, useState } from "react";
import { AiFillPicture } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { MdDelete, MdPhotoLibrary } from "react-icons/md";
import Modal from "react-modal";
import { BeatLoader, ClipLoader } from "react-spinners";

Modal.setAppElement("#main-body");

export default function CreatePost({
    currentUser,
    group,
    handleChangeCurrentTab,
}: {
    currentUser: IUserS;
    group: IGroup;
    handleChangeCurrentTab: (value: string) => void;
}) {
    const [modalCreatePostIsOpen, setCreatePostIsOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [content, setContent] = useState<string>("");

    const createGroupPost = useCreateGroupPost(
        group._id,
        currentUser?._id,
        group.owner._id
    );

    const openCreatePostModal = () => setCreatePostIsOpen(true);
    const closeCreatePostModal = () => setCreatePostIsOpen(false);

    const handleContentChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setContent(event.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (images.length === 0 && content === "") {
            setError("Images or content cannot be empty.");
            setLoading(false);
            return;
        }
        createGroupPost.mutate(
            {
                content: content ? content : "",
                images: images ? images.map((image) => image) : [],
                groupId: group._id,
            },
            {
                onSuccess: () => {
                    setContent("");
                    setImages([]);
                    setCreatePostIsOpen(false);
                    setError("");
                    if (group.owner._id !== currentUser?._id) {
                        handleChangeCurrentTab("Your pending posts");
                    }
                },
            }
        );
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const type = "posts";
            const username = currentUser?.username;
            setLoadingImages(true);
            const uploadedImages = await uploadManyImages(
                Array.from(files),
                type,
                username
            );
            if (uploadedImages) {
                setImages((prevImages) => [...prevImages, ...uploadedImages]);
            }
            setLoadingImages(false);
        }
    };

    const removeImage = async (image: string) => {
        if (image) {
            await removeOneImage(image);
            setImages((prevImages) =>
                prevImages.filter((img) => img !== image)
            );
        }
    };

    return (
        <>
            <div className="mt-4 lg:mt-8 bg-white w-full p-2 rounded-lg">
                <div className="flex gap-2 items-center">
                    <img
                        src={currentUser?.profilePicture}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full "
                    />
                    <button
                        onClick={openCreatePostModal}
                        className="text-secondary w-full p-2 rounded-full hover:text-primary flex justify-start bg-third"
                    >
                        What do you write?
                    </button>
                </div>
                <div className="flex gap-5 mt-3 items-center">
                    <button
                        onClick={openCreatePostModal}
                        className="flex items-center gap-1 bg-third text-secondary hover:text-primary text-sm p-2 rounded-md"
                    >
                        <AiFillPicture color="#0CBC87" />
                        Photo/Video
                    </button>
                </div>
            </div>
            <Modal
                isOpen={modalCreatePostIsOpen}
                onRequestClose={closeCreatePostModal}
                className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="py-5 border-b flex px-2 justify-between items-center">
                        <h2 className="text-xl font-bold text-primary">
                            Create post
                        </h2>
                        <button
                            onClick={closeCreatePostModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                    <form className="px-2" onSubmit={handleSubmit}>
                        <div className="mt-3 flex gap-3">
                            <img
                                src={currentUser?.profilePicture}
                                className="h-12 w-12 rounded-full"
                                alt=""
                            />
                            <textarea
                                onChange={handleContentChange}
                                value={content}
                                rows={3}
                                placeholder="What do you write?"
                                className="flex items-center px-2 outline-none w-full resize-none"
                            />
                        </div>
                        <div className="flex justify-center mt-3">
                            <label
                                htmlFor="imagesforpost"
                                className="hover:cursor-pointer bg-third w-1/2 text-secondary py-10 rounded-md hover:text-primary text-center"
                            >
                                <span className="flex justify-center">
                                    <MdPhotoLibrary className="text-3xl" />
                                </span>
                                <span className="text-center font-semibold">
                                    Add photo/video
                                </span>
                            </label>
                            <input
                                id="imagesforpost"
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                accept="image/*, video/*"
                                hidden
                            />
                        </div>
                        {error && <p className="text-red-500 mt-3">{error}</p>}
                        {loadingImages ? (
                            <div className="flex justify-center pt-3">
                                <ClipLoader color="#3795BD" />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        {image.includes(".mp4") ? (
                                            <>
                                                <video
                                                    src={image}
                                                    className="w-24 h-24 object-cover border"
                                                />
                                                <div
                                                    onClick={() =>
                                                        removeImage(image)
                                                    }
                                                    className="flex justify-center items-center bg-gray-200 opacity-0 group group-hover:opacity-100 transition duration-500 ease-in-out absolute top-0 bottom-0 right-0 left-0 bg-opacity-60 hover:cursor-pointer"
                                                >
                                                    <MdDelete className="text-3xl text-red-500" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src={image}
                                                    alt={`Uploaded ${index}`}
                                                    className="w-24 h-24 object-cover border"
                                                />
                                                <div
                                                    onClick={() =>
                                                        removeImage(image)
                                                    }
                                                    className="flex justify-center items-center bg-gray-200 opacity-0 group group-hover:opacity-100 transition duration-500 ease-in-out absolute top-0 bottom-0 right-0 left-0 bg-opacity-60 hover:cursor-pointer"
                                                >
                                                    <MdDelete className="text-3xl text-red-500" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center mt-3 mb-5">
                            <button
                                type="submit"
                                className="font-semibold bg-primary text-white w-full py-2 border border-primary rounded-md hover:text-primary hover:bg-white"
                            >
                                {loading ? <BeatLoader /> : "Post"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
