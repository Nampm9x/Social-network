"use client";

import { useChangePassword } from "@/hooks/react-query/user";
import React, { ChangeEvent, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";

export default function Settings({
    showSettingsModalIsOpen,
    closeSettingsModal,
}: {
    showSettingsModalIsOpen: boolean;
    closeSettingsModal: () => void;
}) {
    const [formData, setFormData] = useState<{
        oldPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }>({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const changePassword = useChangePassword();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (formData.newPassword === formData.oldPassword) {
            toast.error("New password must be different from old password");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        changePassword.mutate(
            {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword,
            },
            {
                onSuccess: () => {
                    toast.success("Password changed successfully");
                    setFormData({
                        oldPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                    });
                    closeSettingsModal();
                },
                onError: (error:any) => {
                    toast.error(error?.response?.data.message || "Something went wrong")
                }
            }
        );
    };

    return (
        <Modal
            isOpen={showSettingsModalIsOpen}
            onRequestClose={closeSettingsModal}
            className="w-full mt-16 h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)] md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white"
            overlayClassName="fixed mx-4 px-4 lg:mx-0 mt-10 md:mt-16 z-40 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
            <SimpleBar className={`h-full  overflow-y-auto w-full`}>
                <div className="py-5 border-b flex px-2 justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">Settings</h2>
                    <div className="py-3 flex px-2 justify-end items-center">
                        <button
                            onClick={closeSettingsModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                </div>
                <div
                    className={` px-2 mt-2 flex h-[calc(100vh-64px-16px-16px-98px)] lg:h-[calc(100vh-64px-32px-32px-98px)]`}
                >
                    <div className="w-1/4 pr-2">
                        <button className="w-full bg-third py-1 rounded font-semibold">
                            Privacy
                        </button>
                    </div>
                    <div className="w-3/4 pl-2 border-l h-full">
                        <h3 className="font-semibold">Change your password</h3>
                        <form className="mt-2" onSubmit={handleSubmit}>
                            <input
                                onChange={handleChange}
                                type="password"
                                required
                                placeholder="Old password"
                                name="oldPassword"
                                className="w-full border rounded px-2 py-1 mt-2 outline-none"
                            />
                            <input
                                onChange={handleChange}
                                type="password"
                                required
                                name="newPassword"
                                placeholder="New password"
                                className="w-full border rounded px-2 py-1 mt-2 outline-none"
                            />
                            <input
                                onChange={handleChange}
                                type="password"
                                required
                                name="confirmNewPassword"
                                placeholder="Confirm new password"
                                className="w-full border rounded px-2 py-1 mt-2 outline-none"
                            />
                            <div className="mt-2 flex justify-center ">
                                <button
                                    type="submit"
                                    className="px-10 py-1 border bg-primary text-white hover:text-primary hover:bg-white rounded border-primary"
                                >
                                    Change
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </SimpleBar>
        </Modal>
    );
}
