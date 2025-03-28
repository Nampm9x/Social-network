"use client";

import { IGroupPost } from "@/types/grouppost";
import { IUserS } from "@/types/user";
import React, { ChangeEvent, useRef, useState } from "react";
import { LuDot } from "react-icons/lu";
import { PiChatCircleThin, PiUsersThreeBold } from "react-icons/pi";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SendItem from "../profile/SendItem";
import { CiHeart } from "react-icons/ci";
import { IoIosMore, IoMdClose, IoMdHeart } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import Modal from "react-modal";
import CommentPost from "./CommentPost";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IGroup } from "@/types/group";
import { toast } from "react-toastify";
import {
    useDeletePost,
    useGetComments,
    useLikePost,
    useSendComment,
} from "@/hooks/react-query/group";
import LoadingComments from "../loading/LoadingComments";

export default function Post({
    post,
    currentUser,
    group,
}: {
    post: IGroupPost;
    currentUser: IUserS;
    group?: IGroup;
}) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [commentForm, setCommentForm] = useState<string>("");

    const [commentModalIsOpen, setCommentModalIsOpen] =
        useState<boolean>(false);
    const { data: comments, isLoading: isLoadingComments } = useGetComments(
        post?._id,
        commentModalIsOpen
    );
    const [modalDeletePostIsOpen, setModalDeletePostIsOpen] =
        useState<boolean>(false);

    const openDeletePostModal = () => {
        if (commentModalIsOpen) {
            setCommentModalIsOpen(false);
        }
        setModalDeletePostIsOpen(true);
    };
    const closeDeletePostModal = () => setModalDeletePostIsOpen(false);

    const deletePost = useDeletePost(post?._id, group?._id);
    const handleDeletePost = async () => {
        deletePost.mutate(
            {
                postId: post?._id,
            },
            {
                onSuccess: () => {
                    toast.success("Post has been deleted");
                    setModalDeletePostIsOpen(false);
                },
            }
        );
    };

    const openCommentModal = () => setCommentModalIsOpen(true);
    const closeCommentModal = () => setCommentModalIsOpen(false);

    const date = new Date(post?.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    const handleChangeComment = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCommentForm(e.target.value);
    };

    const likePost = useLikePost(post?._id, group?._id);
    const handleLikeGroupPost = async () => {
        likePost.mutate({
            postId: post?._id,
        });
    };

    const sendComment = useSendComment(post?._id);
    const handleSendGroupPostComment = async (
        e: React.FormEvent<HTMLElement>
    ) => {
        e.preventDefault();
        sendComment.mutate(
            {
                postId: post?._id,
                comment: commentForm,
                replyingTo: "",
            },
            {
                onSuccess: () => {
                    setCommentForm("");
                },
            }
        );
    };

    return (
        <div>
            <div className="w-full p-2 rounded-lg">
                <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                        <div className="relative w-10 h-10 ">
                            <img
                                src={post?.group?.groupPicture}
                                alt="group"
                                className="w-full h-full rounded-lg"
                            />
                            <div className="absolute -bottom-2 -right-2">
                                <img
                                    src={post?.owner?.profilePicture}
                                    className="w-8 h-8 rounded-full border bg-third"
                                />
                            </div>
                        </div>
                        <div>
                            <Link
                                href={`/groups/${post?.group?._id}`}
                                className="font-semibold hover:underline"
                            >
                                {post?.group?.name}
                            </Link>
                            <div className="flex gap-1 items-center">
                                <Link
                                    href={`/profile/${post?.owner?.username}`}
                                    className="text-secondary text-sm hover:underline"
                                >
                                    {post?.owner?.name}
                                    {post?.owner?._id === group?.owner?._id && (
                                        <span className="text-xs">
                                            {" "}
                                            (Admin)
                                        </span>
                                    )}
                                </Link>
                                <LuDot />
                                <p className="text-secondary text-xs">{date}</p>
                                <LuDot />
                                <PiUsersThreeBold className="rounded-full text-secondary" />
                            </div>
                        </div>
                    </div>
                    <div>
                        {(post?.owner?._id === currentUser?._id ||
                            group?.owner._id === currentUser?._id) && (
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
                                            onClick={openDeletePostModal}
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
                </div>
                <div className="my-3">
                    <p>{post?.content}</p>
                </div>
                {post?.images?.length > 1 ? (
                    <div
                        ref={elementRef}
                        className="w-full h-[300px] sm:h-[350px] rounded"
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
                            className="!h-full !m-0 !p-0"
                        >
                            {post?.images?.map(
                                (image: string, index: number) => (
                                    <SwiperSlide
                                        key={index}
                                        className="!h-full !m-0 !p-0"
                                    >
                                        <div className="relative !h-full">
                                            {image.includes(".mp4") ? (
                                                <>
                                                    <div className="top-0 right-0 absolute w-full h-[80%] rounded-tr-lg px-2 z-10">
                                                        {" "}
                                                    </div>
                                                    <video
                                                        className="w-full h-full rounded-lg"
                                                        src={image}
                                                        controls
                                                        controlsList="nodownload nofullscreen noremoteplayback"
                                                        style={{
                                                            pointerEvents:
                                                                "auto",
                                                        }}
                                                    />
                                                    <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                        {index + 1}/
                                                        {post.images.length}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <img
                                                        src={image}
                                                        className="w-full h-full rounded-lg"
                                                    />
                                                    <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                        {index + 1}/
                                                        {post.images.length}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                )
                            )}
                        </Swiper>
                    </div>
                ) : post?.images?.length === 1 ? (
                    post?.images?.map((image: string, index: number) => (
                        <div
                            key={index}
                            ref={elementRef}
                            className="w-full h-[300px] sm:h-[350px]"
                        >
                            {image.includes(".mp4") ? (
                                <>
                                    <video
                                        className="w-full h-full rounded-lg"
                                        src={image}
                                        controls
                                        controlsList="nodownload nofullscreen noremoteplayback"
                                        style={{
                                            pointerEvents: "auto",
                                        }}
                                    />
                                </>
                            ) : (
                                <img
                                    src={image}
                                    className="w-full h-full rounded-lg"
                                />
                            )}
                        </div>
                    ))
                ) : null}
            </div>
            <div className="flex justify-between border-y mx-2">
                <button
                    onClick={handleLikeGroupPost}
                    type="button"
                    className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                >
                    {post && post?.likes.includes(currentUser?._id) ? (
                        <>
                            <IoMdHeart className="text-pink-500" />
                            <p>Liked</p>
                        </>
                    ) : (
                        <>
                            <CiHeart />
                            <p>Like</p>
                        </>
                    )}
                    <p>({post && post?.likes.length})</p>
                </button>
                <div
                    onClick={openCommentModal}
                    className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                >
                    <PiChatCircleThin />
                    <p>Comment</p>
                </div>
                <SendItem item={post} currentUser={currentUser} />
            </div>
            <div className="py-5">
                <form
                    className="flex mx-2"
                    onSubmit={handleSendGroupPostComment}
                >
                    <img
                        src={currentUser?.profilePicture}
                        alt=""
                        className="items-center w-10 h-10 rounded-full border mr-3"
                    />
                    <textarea
                        onChange={handleChangeComment}
                        value={commentForm}
                        required
                        rows={1}
                        name="comment"
                        placeholder="Add a comment..."
                        className="flex items-center resize-none w-full outline-none px-2 bg-third text-secondary border rounded-l border-r-0"
                    />
                    <button
                        type="submit"
                        className="px-3 bg-third text-secondary rounded-r hover:bg-third hover:text-primary"
                    >
                        <BsFillSendFill />
                    </button>
                </form>
            </div>

            {/* comment modal */}
            <Modal
                isOpen={commentModalIsOpen}
                onRequestClose={closeCommentModal}
                className="w-full mx-4 md:px-0 md:w-1/2 lg:w-1/3 rounded-lg bg-white z-50"
                overlayClassName="fixed mt-0 z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div className="h-[95vh] relative">
                    <div className="py-5 bg-white w-full border-b flex px-2 justify-between items-center rounded-t-lg">
                        <h2 className="text-xl font-bold text-primary">
                            Comments
                        </h2>
                        <button
                            onClick={closeCommentModal}
                            className="text-secondary hover:text-black"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                    <SimpleBar className="h-[calc(95vh-70px-48px)] overflow-y-auto">
                        <div className=" items-center mt-2 px-2">
                            <div className="flex justify-between">
                                <div className="flex gap-3 items-center">
                                    <div className="relative w-10 h-10 ">
                                        <img
                                            src={post?.group?.groupPicture}
                                            alt="group"
                                            className="w-full h-full rounded-lg"
                                        />
                                        <div className="absolute -bottom-2 -right-2">
                                            <img
                                                src={
                                                    post?.owner?.profilePicture
                                                }
                                                className="w-8 h-8 rounded-full border bg-third"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Link
                                            href={`/groups/${post?.group?._id}`}
                                            className="font-semibold hover:underline"
                                        >
                                            {post?.group?.name}
                                        </Link>
                                        <div className="flex gap-1 items-center">
                                            <Link
                                                href={`/profile/${post?.owner?.username}`}
                                                className="text-secondary text-sm hover:underline"
                                            >
                                                {post?.owner?.name}
                                            </Link>
                                            <LuDot />
                                            <p className="text-secondary text-sm">
                                                {date}
                                            </p>
                                            <LuDot />
                                            <PiUsersThreeBold className="rounded-full text-secondary" />
                                        </div>
                                    </div>
                                </div>
                                {(post?.owner?._id === currentUser?._id ||
                                    group?.owner._id === currentUser?._id) && (
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
                                                    onClick={
                                                        openDeletePostModal
                                                    }
                                                    type="button"
                                                    className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 rounded-md"
                                                >
                                                    Delete Post
                                                </button>
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                )}
                            </div>
                            <p className="pb-3 text-md text-secondary">
                                {post?.content}
                            </p>
                            {post?.images?.length > 1 ? (
                                <div className="w-full h-[300px] sm:h-[350px] rounded">
                                    <Swiper
                                        pagination={true}
                                        modules={[Pagination]}
                                        className="!h-full !m-0 !p-0"
                                    >
                                        {post?.images?.map(
                                            (image: string, index: number) => (
                                                <SwiperSlide
                                                    key={index}
                                                    className="!h-full !m-0 !p-0"
                                                >
                                                    <div className="relative !h-full">
                                                        {image.includes(
                                                            ".mp4"
                                                        ) ? (
                                                            <>
                                                                <div className="top-0 right-0 absolute w-full h-[80%] rounded-tr-lg px-2 z-10">
                                                                    {" "}
                                                                </div>
                                                                <video
                                                                    className="w-full h-full rounded-lg"
                                                                    src={image}
                                                                    controls
                                                                    controlsList="nodownload nofullscreen noremoteplayback"
                                                                    style={{
                                                                        pointerEvents:
                                                                            "auto",
                                                                    }}
                                                                />
                                                                <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                                    {index + 1}/
                                                                    {
                                                                        post
                                                                            .images
                                                                            .length
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img
                                                                    src={image}
                                                                    className="w-full h-full rounded-lg"
                                                                />
                                                                <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                                    {index + 1}/
                                                                    {
                                                                        post
                                                                            .images
                                                                            .length
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </SwiperSlide>
                                            )
                                        )}
                                    </Swiper>
                                </div>
                            ) : (
                                post?.images?.map(
                                    (image: string, index: number) => (
                                        <div
                                            key={index}
                                            ref={elementRef}
                                            className="w-full h-[300px] sm:h-[350px]"
                                        >
                                            {image.includes(".mp4") ? (
                                                <>
                                                    <video
                                                        className="w-full h-full rounded-lg"
                                                        src={image}
                                                        controls
                                                        controlsList="nodownload nofullscreen noremoteplayback"
                                                        style={{
                                                            pointerEvents:
                                                                "auto",
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <img
                                                    src={image}
                                                    className="w-full h-full rounded-lg"
                                                />
                                            )}
                                        </div>
                                    )
                                )
                            )}
                        </div>
                        <div className="flex justify-between border-y mt-2">
                            <button
                                type="button"
                                onClick={handleLikeGroupPost}
                                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                            >
                                {post &&
                                post?.likes.includes(currentUser?._id) ? (
                                    <>
                                        <IoMdHeart className="text-pink-500" />
                                        <p>Liked</p>
                                    </>
                                ) : (
                                    <>
                                        <CiHeart />
                                        <p>Like</p>
                                    </>
                                )}
                                <p>({post && post?.likes.length})</p>
                            </button>
                            <label
                                htmlFor="post-comment-modal"
                                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                            >
                                <PiChatCircleThin />
                                <p>Comment</p>
                            </label>
                            <SendItem item={post} currentUser={currentUser} />
                        </div>
                        <div className="px-2">
                            {isLoadingComments && <LoadingComments />}
                            <p className="py-2 text-secondary text-md font-semibold">
                                {comments && comments.length} Comments{" "}
                            </p>
                            <div>
                                {comments &&
                                    comments.map(
                                        (comment) =>
                                            comment.replyingTo === "" && (
                                                <div
                                                    key={comment._id}
                                                    className="mb-8"
                                                >
                                                    <CommentPost
                                                        postId={post?._id}
                                                        comment={comment}
                                                        currentUser={
                                                            currentUser
                                                        }
                                                    />
                                                </div>
                                            )
                                    )}
                            </div>
                        </div>
                    </SimpleBar>
                    <div className="py-1 absolute bottom-0 w-full px-2">
                        <form
                            onSubmit={handleSendGroupPostComment}
                            className="flex"
                        >
                            <img
                                src={currentUser?.profilePicture}
                                alt=""
                                className="items-center w-10 h-10 rounded-full border mr-3"
                            />
                            <textarea
                                id="post-comment-modal"
                                required
                                rows={1}
                                name="comment"
                                onChange={handleChangeComment}
                                value={commentForm}
                                placeholder="Add a comment..."
                                className="flex items-center resize-none w-full outline-none px-2 bg-third text-secondary border rounded-l border-r-0"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1 bg-third text-secondary rounded-r hover:bg-third hover:text-primary"
                            >
                                <BsFillSendFill />
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={modalDeletePostIsOpen}
                onRequestClose={closeDeletePostModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="pb-5">
                        <p className="text-center text-lg py-5">
                            Are you sure you want to delete this post?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleDeletePost}
                                className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                            >
                                Yes
                            </button>
                            <button
                                onClick={closeDeletePostModal}
                                className="py-1 px-3 border bg-primary rounded text-white hover:bg-white hover:text-primary border-primary"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
