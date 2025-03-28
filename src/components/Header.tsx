"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoIosSearch } from "react-icons/io";
import { IoHomeOutline } from "react-icons/io5";
import { FiMessageCircle } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Search from "./search/Search";
import { PiUsersThreeBold } from "react-icons/pi";
import Notifications from "@/components/notification/Notifications";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logout } from "@/redux/user/userSlice";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import Settings from "./settings/Settings";
import { useLogout } from "@/hooks/react-query/auth";

function Header() {
    const pathname = usePathname();
    const { currentUser } = useAppSelector((state) => state.user);
    const [showSettingsModalIsOpen, setShowSettingsModalIsOpen] =
        useState(false);

    const openSettingsModal = () => {
        setShowSettingsModalIsOpen(true);
    };

    const closeSettingsModal = () => {
        setShowSettingsModalIsOpen(false);
    };

    const { data: user } = useGetCurrentUser();

    const dispatch = useAppDispatch();

    const logoutMutation = useLogout();
    const handleLogout = async () => {
        logoutMutation.mutate();
        dispatch(logout());
    };

    return (
        currentUser && (
            <div className="z-50 flex justify-between items-center px-4 xl:px-44 h-16 w-screen bg-white fixed shadow">
                <div className="w-2/6 h-full flex items-center gap-3 lg:gap-3">
                    <Link href="/">
                        <img
                            src="/images/Logo.png"
                            alt="Logo"
                            className="w-8 lg:w-10 h-8 lg:h-10"
                        />
                    </Link>
                    <Search />

                    <div className="md:hidden">
                        <button className="flex items-center bg-third justify-center text-secondary border py-1 px-2 rounded hover:text-black">
                            <IoIosSearch />
                        </button>
                    </div>
                </div>

                <div className="w-2/6 lg:w-3/6 text-secondary">
                    <ul className="flex gap-2 sm:hidden justify-center items-center">
                        <li
                            className={` ${
                                pathname === "/" ? "bg-primary text-white" : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link href="/" className="py-1 px-3 block">
                                <IoHomeOutline />
                            </Link>
                        </li>
                        <li
                            className={`${
                                pathname.startsWith("/messages")
                                    ? "bg-primary text-white"
                                    : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link
                                href="/messages/conversation"
                                className="py-1 px-3 block"
                            >
                                <FiMessageCircle />
                            </Link>
                        </li>
                        <li
                            className={`${
                                pathname.startsWith("/groups")
                                    ? "bg-primary text-white"
                                    : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link
                                href="/groups/feed"
                                className="py-1 px-3 block"
                            >
                                <PiUsersThreeBold />
                            </Link>
                        </li>
                    </ul>
                    <ul className="sm:flex gap-2 hidden justify-center items-center font-semibold">
                        <li
                            className={`p-1 ${
                                pathname === "/" ? "bg-primary text-white" : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link href="/" className="flex gap-2 items-center">
                                <IoHomeOutline /> Home
                            </Link>
                        </li>
                        <li
                            className={`p-1 ${
                                pathname.startsWith("/messages")
                                    ? "bg-primary text-white"
                                    : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link
                                href="/messages/conversation"
                                className="flex gap-2 items-center"
                            >
                                <FiMessageCircle /> Message
                            </Link>
                        </li>
                        <li
                            className={`p-1 ${
                                pathname.startsWith("/groups")
                                    ? "bg-primary text-white"
                                    : ""
                            }  hover:bg-primary hover:text-white rounded`}
                        >
                            <Link
                                href="/groups/feed"
                                className="flex gap-2 items-center"
                            >
                                <PiUsersThreeBold /> Group
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="w-2/6 lg:w-1/6 flex justify-end items-center">
                    <div className="flex gap-2 lg:gap-5 items-center justify-end">
                        <Menu as="div" className="relative">
                            <Notifications />
                        </Menu>
                        <Menu as="div" className="relative">
                            <div>
                                <MenuButton className="relative flex rounded border text-sm focus:outline-none focus:ring-2 focus:ring-white">
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">
                                        Open user menu
                                    </span>
                                    <img
                                        alt="Profile Picture"
                                        src={currentUser?.profilePicture}
                                        className="h-8 lg:w-10 w-8 lg:h-10 rounded"
                                    />
                                </MenuButton>
                            </div>
                            <MenuItems
                                transition
                                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                            >
                                <MenuItem>
                                    <Link
                                        href={`/profile/${user?.username}`}
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Your Profile
                                    </Link>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        onClick={openSettingsModal}
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Settings
                                    </button>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        onClick={handleLogout}
                                        type="button"
                                        className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Log out
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
                <Settings
                    showSettingsModalIsOpen={showSettingsModalIsOpen}
                    closeSettingsModal={closeSettingsModal}
                />
            </div>
        )
    );
}

export default Header;
