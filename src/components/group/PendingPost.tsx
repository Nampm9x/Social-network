"use client";

import { useApprovePost, useRejectPost } from "@/hooks/react-query/group";
import { IGroup } from "@/types/group";
import { IGroupPost } from "@/types/grouppost";
import { IUser, IUserS } from "@/types/user";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import React, { useRef } from "react";
import { IoIosMore } from "react-icons/io";
import { LuDot } from "react-icons/lu";
import { PiUsersThreeBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function PendingPost({
    pendingPost,
    currentUser,
    group,
}: {
    pendingPost: IGroupPost;
    currentUser: IUserS;
    group: IGroup;
}) {
    const elementRef = useRef<HTMLDivElement>(null);

    const date = new Date(pendingPost?.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    const approvePost = useApprovePost(group._id, pendingPost?._id);
    const handleApprovePost = async () => {
        approvePost.mutate(
            {
                postId: pendingPost?._id,
                groupId: group._id
            }, 
            {
                onSuccess: () => {
                    toast.success("Post has been approved");
                }
            }
        )
    };

    const rejectPost = useRejectPost(group._id, pendingPost?._id)
    const handleRejectPost = async () => {
        rejectPost.mutate(
            {
                postId: pendingPost?._id,
                groupId: group._id
            }, 
            {
                onSuccess: () => {
                    toast.success("Post has been rejected");
                }
            }
        )
    };

    return (
        <div className="p-2">
            <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-3 items-center">
                    <Link href={`/profile/${pendingPost?.owner?.username}`} className="w-10 h-10 ">
                        <img
                            src={pendingPost?.owner?.profilePicture}
                            alt="group"
                            className="w-full h-full rounded-lg"
                        />
                    </Link>
                    <div>
                        <div className="flex gap-1 items-center">
                            <Link
                                href={`/profile/${pendingPost?.owner?.username}`}
                                className="font-semibold hover:underline"
                            >
                                {pendingPost?.owner?.name}
                            </Link>
                            <LuDot />
                            <p className="text-secondary text-sm">{date}</p>
                            <LuDot />
                            <PiUsersThreeBold className="rounded-full text-secondary" />
                        </div>
                    </div>
                </div>
                {pendingPost?.owner?._id === currentUser?._id && (
                    <Menu as="div" className="relative">
                        <div>
                            <MenuButton className="relative flex rounded text-sm focus:outline-none p-2 hover:bg-third">
                                <span className="absolute -inset-1.5" />
                                <IoIosMore />
                            </MenuButton>
                        </div>
                        <MenuItems
                            transition
                            className="absolute min-w-28 right-0 z-50 mt-2 origin-top-right rounded-md bg-white shadow-lg transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            <MenuItem>
                                <button
                                    type="button"
                                    className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 rounded-md"
                                >
                                    Edit post
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button
                                    type="button"
                                    className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 rounded-md"
                                >
                                    Delete post
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                )}
            </div>
            <div className="my-3">
                <p>{pendingPost?.content}</p>
            </div>
            {pendingPost?.images?.length > 1 ? (
                <div
                    ref={elementRef}
                    className="w-full h-[300px] sm:h-[350px] rounded overflow-hidden"
                >
                    <Swiper
                        pagination={true}
                        modules={[Pagination]}
                        onSlideChange={(swiper) => {
                            const currentSlide =
                                swiper.slides[swiper.activeIndex];
                            const imageElement =
                                currentSlide.querySelector("img");
                            if (imageElement) {
                                const src =
                                    imageElement.getAttribute("data-src");
                                if (src) {
                                    imageElement.setAttribute("src", src);
                                }
                            }
                        }}
                    >
                        {pendingPost?.images?.map(
                            (image: string, index: number) => (
                                <SwiperSlide key={index} className="">
                                    <div className="relative">
                                        <img
                                            src={image}
                                            className={`w-full h-full rounded-lg`}
                                        />
                                        <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                            {index + 1}/
                                            {pendingPost?.images?.length}
                                        </span>
                                    </div>
                                </SwiperSlide>
                            )
                        )}
                    </Swiper>
                </div>
            ) : pendingPost?.images?.length === 1 ? (
                pendingPost?.images?.map((image: string, index: number) => (
                    <div
                        key={index}
                        ref={elementRef}
                        className="w-full h-[300px] sm:h-[350px]"
                    >
                        <img
                            src={image}
                            className={`w-full h-full object-cover rounded-lg`}
                        />
                    </div>
                ))
            ) : null}
            {group.owner?._id === currentUser?._id && (
                <div className="flex justify-center gap-3 mt-3">
                    <button onClick={handleRejectPost} className="py-2 px-3 border bg-red-500 text-white border-red-500 w-1/2 rounded hover:bg-white hover:text-red-500 font-semibold">
                        Reject
                    </button>
                    <button
                        onClick={handleApprovePost}
                        className="py-2 px-3 border bg-primary text-white border-primary w-1/2 rounded hover:bg-white hover:text-primary font-semibold"
                    >
                        Approve
                    </button>
                </div>
            )}
        </div>
    );
}
