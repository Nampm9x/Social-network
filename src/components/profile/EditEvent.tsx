"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { IEvent } from "@/types/event";
import { IUser, IUserS } from "@/types/user";
import { BeatLoader, ClipLoader } from "react-spinners";
import Select from "react-select";
import { MdPhotoLibrary } from "react-icons/md";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { MdDelete } from "react-icons/md";
import SimpleBar from "simplebar-react";
import { useEditEvent } from "@/hooks/react-query/event";
import { toast } from "react-toastify";

export default function EditEvent({
    event,
    currentUser,
    modalEditEventIsOpen,
    setModalEditEventIsOpen,
}: {
    event: IEvent;
    currentUser: IUserS;
    modalEditEventIsOpen: boolean;
    setModalEditEventIsOpen: (value: any) => void;
}) {
    const dateFromMongoDb = new Date(event?.date);
    const formattedDate = dateFromMongoDb.toISOString().split("T")[0];
    const [formEvent, setFormEvent] = useState({
        title: event.title,
        description: event.description,
        date: formattedDate,
        time: event.time,
        duration: event.duration,
        location: event.location,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [visibility, setVisibility] = useState<string>(event.visibility);
    const [image, setImage] = useState<string>(event.image);
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const options = [
        { value: "public", label: "Public" },
        { value: "followers", label: "Followers" },
        { value: "friends", label: "Friends" },
        { value: "private", label: "Private" },
    ];

    const handleChangeEventForm = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormEvent({ ...formEvent, [e.target.name]: e.target.value });
    };

    const closeEditEventModal = () => setModalEditEventIsOpen(false);

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
                setImage(uploadedImage);
            }
            setLoadingImage(false);
        } else {
            setError("Please upload a valid image file!");
        }
    };

    const removeImage = async () => {
        if (image) {
            setImage("");
        }
    };

    const handleChangeVisibility = (selectedOption: any) => {
        setVisibility(selectedOption.value);
    };

    const data = { ...formEvent, visibility, image };
    const editEvent = useEditEvent(event._id);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (!visibility) {
            setError("Visibility is required!");
            setLoading(false);
            return;
        }
        if (!image) {
            setError("Image is required!");
            setLoading(false);
            return;
        }
        editEvent.mutate(
            { data },
            {
                onSuccess: () => {
                    closeEditEventModal();
                    setLoading(false);
                    toast.success("Event updated successfully!");
                },
                onError: (error) => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <>
            <Modal
                isOpen={modalEditEventIsOpen}
                onRequestClose={closeEditEventModal}
                className="w-full md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white overflow-y-auto"
                overlayClassName="fixed mt-16 lg:mt-0 z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <SimpleBar className="max-h-[95vh] overflow-y-auto">
                    <div className="py-5 border-b flex px-2 justify-between items-center">
                        <h2 className="text-xl font-bold text-primary">
                            Edit event
                        </h2>
                        <button
                            onClick={closeEditEventModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                    <form
                        className="px-2 text-secondary"
                        onSubmit={handleSubmit}
                    >
                        <div className="mt-3">
                            <label>Title</label>
                            <br />
                            <input
                                type="text"
                                required
                                placeholder="Event name here"
                                onChange={handleChangeEventForm}
                                name="title"
                                value={formEvent.title}
                                className="w-full rounded px-2 py-1 border outline-none"
                            />
                        </div>
                        <div className="mt-2">
                            <label>Description</label>
                            <br />
                            <textarea
                                rows={3}
                                required
                                placeholder="Ex: topics, schedule, etc."
                                onChange={handleChangeEventForm}
                                name="description"
                                value={formEvent.description}
                                className="resize-none w-full rounded px-2 py-1 border outline-none"
                            />
                        </div>
                        <div className="mt-2 flex justify-between">
                            <div className="">
                                <label>Date</label>
                                <br />
                                <input
                                    type="date"
                                    required
                                    onChange={handleChangeEventForm}
                                    name="date"
                                    value={formEvent.date}
                                    className="rounded px-2 py-1 border outline-none"
                                />
                            </div>
                            <div className="">
                                <label>Time</label>
                                <br />
                                <input
                                    type="time"
                                    required
                                    onChange={handleChangeEventForm}
                                    name="time"
                                    value={formEvent.time}
                                    className="rounded px-2 py-1 border outline-none"
                                />
                            </div>
                            <div className="">
                                <label>Duration</label>
                                <br />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: 1hr 23m"
                                    onChange={handleChangeEventForm}
                                    name="duration"
                                    value={formEvent.duration}
                                    className="rounded px-2 py-1 border outline-none"
                                />
                            </div>
                        </div>
                        <div className="mt-2">
                            <label>Location</label>
                            <br />
                            <input
                                type="text"
                                required
                                placeholder="Cau Giay, Hanoi"
                                onChange={handleChangeEventForm}
                                name="location"
                                value={formEvent.location}
                                className="w-full rounded px-2 py-1 border outline-none"
                            />
                        </div>
                        <div className="flex justify-center mt-3">
                            {loadingImage ? (
                                <ClipLoader color="#3795BD" />
                            ) : image ? (
                                <div className="relative group w-1/2 flex justify-center">
                                    <img
                                        src={image}
                                        alt=""
                                        className="w-full h-[100px] sm:h-[150px] md:h-[120px] object-cover"
                                    />
                                    <div
                                        onClick={removeImage}
                                        className="w-full h-full inset-0 flex justify-center items-center bg-gray-200 opacity-0 group group-hover:opacity-100 transition duration-500 ease-in-out absolute top-0 bottom-0 right-0 left-0 bg-opacity-60 hover:cursor-pointer"
                                    >
                                        <MdDelete className="text-3xl text-red-500" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label
                                        htmlFor="imagesforpost"
                                        className="hover:cursor-pointer bg-third w-1/2 text-secondary py-10 rounded-md hover:text-primary text-center"
                                    >
                                        <span className="flex justify-center">
                                            <MdPhotoLibrary className="text-3xl" />
                                        </span>
                                        <span className="text-center font-semibold">
                                            Add photo
                                        </span>
                                    </label>
                                </>
                            )}
                            <input
                                id="imagesforpost"
                                type="file"
                                onChange={handleChooceImage}
                                accept="image/*"
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
            </Modal>
        </>
    );
}
