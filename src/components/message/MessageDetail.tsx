"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IMessage } from "@/types/message";
import { IUser, IUserS } from "@/types/user";
import { IoMdMore } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

export default function ({
    message,
    currentUser,
    setIsReplying,
    setReplyingTo,
}: {
    message: IMessage;
    currentUser: IUserS;
    setIsReplying: Dispatch<SetStateAction<boolean>>;
    setReplyingTo: Dispatch<
        SetStateAction<{
            messageid: string;
            messagetext: string;
            _id: string;
            name: string;
        }>
    >;
}) {
    const OpenRepLying = (
        messageid: string,
        messagetext: string,
        _id: string,
        name: string
    ) => {
        setIsReplying(true);
        setReplyingTo({
            messageid,
            messagetext,
            _id,
            name,
        });
    };

    return (
        <div>
            <div
                className={`flex items-end gap-2 mb-2 w-full ${
                    message?.sender?._id === currentUser?._id ? "justify-end" : ""
                }`}
            >
                {message?.sender?._id !== currentUser?._id ? (
                    <>
                        <div className="flex items-end gap-1 w-full">
                            <img
                                className="h-8 w-8 rounded-full border"
                                src={message?.sender?.profilePicture}
                                alt="Image"
                            />
                            <div className="w-2/3">
                                {message.replyTo && (
                                    <div className={`w-full flex`}>
                                        <div>
                                            <p>
                                                {message?.sender?._id ===
                                                currentUser?._id
                                                    ? "You"
                                                    : message?.sender?.name}{" "}
                                                replied to{" "}
                                                {message?.replyTo?.id?._id ===
                                                currentUser?._id
                                                    ? "you"
                                                    : message?.sender?.name}
                                            </p>
                                            <div className="bg-primary text-white rounded px-2 pb-2 -mb-2 flex">
                                                <p>{message?.replyTo?.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex w-full">
                                    <div
                                        className={`flex items-center relative group max-w-full ${
                                            message?.type === "photo" ||
                                            message?.type === "video"
                                                ? ""
                                                : "p-2 bg-third"
                                        } rounded`}
                                    >
                                        {message?.type === "message" ? (
                                            <p className="w-full break-words">
                                                {message?.text}
                                            </p>
                                        ) : message?.type === "link" ? (
                                            <Link
                                                target="_blank"
                                                className="underline w-full break-words"
                                                href={message?.text}
                                            >
                                                {message?.text}
                                            </Link>
                                        ) : message?.type === "photo" ? (
                                            <img
                                                src={message?.text}
                                                alt="Image"
                                                className="w-52 border aspect-square object-cover rounded"
                                            />
                                        ) : message?.type === "video" ? (
                                            <video
                                                src={message?.text}
                                                className="w-52 aspect-square object-cover rounded"
                                                controls
                                            />
                                        ) : null}
                                        <div className="absolute -right-5 opacity-0 group-hover:opacity-100 transition duration-500 ease-in-out">
                                            <Menu as="div" className="relative">
                                                <div>
                                                    <MenuButton className="relative text-black flex rounded outline-none">
                                                        <span className="absolute -inset-1.5" />
                                                        <IoMdMore />
                                                    </MenuButton>
                                                </div>
                                                <MenuItems
                                                    transition
                                                    className="absolute right-0 z-50 mt-2 origin-top-right rounded-md bg-white shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                                >
                                                    <MenuItem>
                                                        <button
                                                            onClick={() =>
                                                                OpenRepLying(
                                                                    message?._id,
                                                                    message?.type ===
                                                                        "photo"
                                                                        ? "Photo"
                                                                        : message?.type ===
                                                                          "video"
                                                                        ? "Video"
                                                                        : message?.text,
                                                                    message?.sender?._id,
                                                                    message?.sender?.name
                                                                )
                                                            }
                                                            type="button"
                                                            className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                                        >
                                                            Reply
                                                        </button>
                                                    </MenuItem>
                                                </MenuItems>
                                            </Menu>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-2/3">
                        {message.replyTo && (
                            <div className={`flex justify-end`}>
                                <div className="">
                                    <p className="break-words">
                                        {message?.sender?._id === currentUser?._id
                                            ? "You"
                                            : message?.replyTo?.id?.name}{" "}
                                        replied to{" "}
                                        {message?.replyTo?.id?._id ===
                                        currentUser?._id
                                            ? "yourself"
                                            : message?.replyTo?.id?.name}
                                    </p>
                                    <div className="bg-third rounded px-2 pb-2 -mb-2 max-w-full">
                                        <p className="break-words">
                                            {message?.replyTo?.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end w-full">
                            <div className="flex justify-end gap-1 items-center relative group max-w-full">
                                <div
                                    className={`${
                                        message.type === "photo" ||
                                        message.type === "video"
                                            ? ""
                                            : "p-2 bg-primary"
                                    } max-w-full rounded text-white`}
                                >
                                    {message.type === "message" ? (
                                        <p className="break-words">
                                            {message.text}
                                        </p>
                                    ) : message.type === "link" ? (
                                        <Link
                                            target="_blank"
                                            className="underline break-words w-full"
                                            href={message.text}
                                        >
                                            {message.text}
                                        </Link>
                                    ) : message.type === "photo" ? (
                                        <img
                                            src={message.text}
                                            alt="Image"
                                            className="w-52 border aspect-square object-cover rounded"
                                        />
                                    ) : message.type === "video" ? (
                                        <video
                                            src={message.text}
                                            className="w-52 aspect-square object-cover rounded"
                                            controls
                                        />
                                    ) : null}
                                </div>
                                <div className="absolute -left-5 opacity-0 group-hover:opacity-100 transition duration-500 ease-in-out">
                                    <Menu as="div" className="relative">
                                        <div>
                                            <MenuButton className="relative flex rounded outline-none">
                                                <IoMdMore />
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 z-50 mt-2 origin-top-right rounded-md bg-white shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                        >
                                            <MenuItem>
                                                <button
                                                    onClick={() =>
                                                        OpenRepLying(
                                                            message?._id,
                                                            message.type ===
                                                                "photo"
                                                                ? "Photo"
                                                                : message.type ===
                                                                  "video"
                                                                ? "Video"
                                                                : message.text,
                                                            message?.sender._id,
                                                            message?.sender?.name
                                                        )
                                                    }
                                                    type="button"
                                                    className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                                >
                                                    Reply
                                                </button>
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
