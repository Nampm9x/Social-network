"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdDelete, MdPhotoLibrary } from "react-icons/md";
import { BeatLoader, ClipLoader } from "react-spinners";
import SimpleBar from "simplebar-react";
import Select from "react-select";
import { removeOneImage } from "@/hooks/useRemoveOneImage";
import { IUser, IUserS } from "@/types/user";
import { uploadManyImages } from "@/hooks/useUploadImage";
import { IPost } from "@/types/post";
import { useEditPost } from "@/hooks/react-query/post";
import { toast } from "react-toastify";

export default function EditPost({
    closeEditPostModal,
    currentUser,
    post,
    setModalEditPostIsOpen,
}: {
    closeEditPostModal: () => void;
    currentUser: IUserS;
    post: IPost;
    setModalEditPostIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingImages, setLoadingImages] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>(post?.images || []);
    const [error, setError] = useState<string>("");
    const [content, setContent] = useState<string>(post?.content);
    const [visibility, setVisibility] = useState<string>(
        post?.visibility || ""
    );

    const options = [
        { value: "public", label: "Public" },
        { value: "followers", label: "Followers" },
        { value: "friends", label: "Friends" },
        { value: "private", label: "Private" },
    ];

    const handleContentChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setContent(event.target.value);
    };

    const handleChangeVisibility = (selectedOption: any) => {
        setVisibility(selectedOption.value);
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

    const editPost = useEditPost(post?._id);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (images.length === 0 && content === "") {
            toast.error("Content or images are required");
            setLoading(false);
            return;
        }
        if (!visibility) {
            setError("Visibility is required!");
            setLoading(false);
            return;
        }
        editPost.mutate(
            {
                content: content || "",
                visibility: visibility || "public",
                images: images ? images.map((image) => image) : [],
            },
            {
                onSuccess: (response) => {
                    setLoading(false);
                    setContent(response.content);
                    setImages(response.images);
                    setModalEditPostIsOpen(false);
                    setError("");
                    setVisibility("");
                    toast.success("Post edited successfully");
                },
                onError: (error) => {
                    toast.error("error");
                    setModalEditPostIsOpen(false);
                    setError("");
                    setVisibility("");
                }
            },
        );
    };

    return (
        <>
            <SimpleBar className="max-h-[95vh] overflow-y-auto">
                <div className="py-5 border-b flex px-2 justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">
                        Edit post
                    </h2>
                    <button
                        onClick={closeEditPostModal}
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
                            placeholder="What's on your mind?"
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
                    <div className="mt-3 flex gap-3 items-center">
                        <Select
                            onChange={handleChangeVisibility}
                            name="visibility"
                            placeholder="Visibility"
                            options={options}
                        />
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                    {loadingImages ? (
                        <div className="flex justify-center pt-3">
                            <ClipLoader color="#3795BD" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image}
                                        alt={`Uploaded ${index}`}
                                        className="w-24 h-24 object-cover border"
                                    />
                                    <div
                                        onClick={() => removeImage(image)}
                                        className="flex justify-center items-center bg-gray-200 opacity-0 group group-hover:opacity-100 transition duration-500 ease-in-out absolute top-0 bottom-0 right-0 left-0 bg-opacity-60 hover:cursor-pointer"
                                    >
                                        <MdDelete className="text-3xl text-red-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
