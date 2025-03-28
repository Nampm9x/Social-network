"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import Link from "next/link";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { PiChatCircleThin } from "react-icons/pi";
import { IoIosMore, IoMdClose } from "react-icons/io";
import { LuDot } from "react-icons/lu";
import { CiHeart } from "react-icons/ci";
import { FaCaretRight } from "react-icons/fa";
import { IPost } from "@/types/post";
import { IUserS } from "@/types/user";
import { IoMdHeart } from "react-icons/io";
import Modal from "react-modal";
import CommentPost from "@/components/profile/CommentPost";
import { BsFillSendFill } from "react-icons/bs";
import SendItem from "@/components/profile/SendItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import SimpleBar from "simplebar-react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { toast } from "react-toastify";
import EditPost from "./EditPost";
import {
    useDeletePost,
    useGetComments,
    useLikePost,
    useSendCommentPost,
} from "@/hooks/react-query/post";
import LoadingComments from "../loading/LoadingComments";

Modal.setAppElement("#main-body");

export default function Post({
    post,
    currentUser,
}: {
    post: IPost;
    currentUser: IUserS;
}) {
    const [commentModalIsOpen, setCommentModalIsOpen] =
        useState<boolean>(false);
    const [commentForm, setCommentForm] = useState<string>("");
    const { data: comments, isLoading: isLoadingComments } = useGetComments(
        post._id,
        commentModalIsOpen
    );
    const [postWidth, setPostWidth] = useState<number>(0);
    const [postHeight, setPostHeight] = useState<number>(0);
    const elementRef = useRef<HTMLDivElement>(null);

    const [modalDeletePostIsOpen, setModalDeletePostIsOpen] =
        useState<boolean>(false);
    const [modalEditPostIsOpen, setModalEditPostIsOpen] =
        useState<boolean>(false);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const updateWidth = () => {
            if (elementRef.current) {
                setPostWidth(elementRef.current.offsetWidth);
                setPostHeight(elementRef.current.offsetHeight);
            }
        };

        updateWidth();

        window.addEventListener("resize", updateWidth);

        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const formatDate = useFormattedDate();

    const likePost = useLikePost(post?._id, post?.owner?._id);
    const handleLikePost = () => {
        likePost.mutate();
    };

    const sendComment = useSendCommentPost(post?._id);
    const handleSendComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendComment.mutate(
            { comment: commentForm, replyingTo: "" },
            {
                onSuccess: () => {
                    setCommentForm("");
                },
            }
        );
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCommentForm(e.target.value);
    };

    const openCommentModal = () => setCommentModalIsOpen(true);
    const closeCommentModal = () => setCommentModalIsOpen(false);

    const closeDeletePostModal = () => setModalDeletePostIsOpen(false);
    const openDeletePostModal = () => {
        setCommentModalIsOpen(false);
        setModalDeletePostIsOpen(true);
    };

    const openEditPostModal = () => setModalEditPostIsOpen(true);
    const closeEditPostModal = () => setModalEditPostIsOpen(false);

    const deletePost = useDeletePost(post._id, post?.owner?._id);
    const handleDeletePost = async () => {
        deletePost.mutate(
            { postId: post._id },
            {
                onSuccess: () => {
                    toast.success("Post deleted successfully");
                    setModalDeletePostIsOpen(false);
                },
            }
        );
    };

    return (
        <div className="bg-white rounded-lg p-5 pb-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src={post?.owner?.profilePicture}
                        className="w-10 h-10 rounded-full"
                    />
                    <FaCaretRight />
                    <div>
                        <div className="flex items-center">
                            <Link
                                href={`/profile/${post?.owner?.username}`}
                                className="font-semibold hover:text-primary"
                            >
                                {post?.owner?.name}
                            </Link>
                            <LuDot className="text-sm" />
                            <p className="text-sm">
                                {post?.visibility?.charAt(0).toUpperCase() +
                                    post?.visibility?.slice(1)}
                            </p>
                        </div>
                        <p className="text-xs">
                            {new Date(post?.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })}
                        </p>
                    </div>
                </div>
                <div>
                    {post?.owner?._id === currentUser?._id && (
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
                                        onClick={openEditPostModal}
                                        type="button"
                                        className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 rounded-md"
                                    >
                                        Edit post
                                    </button>
                                </MenuItem>
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

            <div className="gap-5 items-center mt-2 pb-4">
                <p className="pb-3 text-md text-secondary">{post?.content}</p>
                {post?.images?.length > 1 ? (
                    <div className="w-full h-[300px] sm:h-[350px] rounded">
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
                                                        className="w-full !h-full rounded-lg"
                                                        src={image}
                                                        controls
                                                        controlsList="nodownload nofullscreen noremoteplayback"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <img
                                                        src={image}
                                                        className="w-full !h-full rounded-lg"
                                                    />
                                                </>
                                            )}
                                            <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                {index + 1}/{post.images.length}
                                            </span>
                                        </div>
                                    </SwiperSlide>
                                )
                            )}
                        </Swiper>
                    </div>
                ) : (
                    post?.images?.map((image: string, index: number) => (
                        <div
                            key={index}
                            ref={elementRef}
                            className="w-full h-[300px] sm:h-[350px]"
                        >
                            {image.includes(".mp4") ? (
                                <>
                                    <video
                                        className="w-full !h-full rounded-lg"
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
                )}
            </div>
            <div className="flex justify-between border-y">
                <button
                    type="button"
                    onClick={handleLikePost}
                    className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                >
                    {post?.likes?.includes(currentUser?._id) ? (
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
                    <p>({post?.likes?.length})</p>
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
                <form onSubmit={handleSendComment} className="flex">
                    <img
                        src={currentUser?.profilePicture}
                        alt=""
                        className="items-center w-10 h-10 rounded-full border mr-3"
                    />
                    <textarea
                        required
                        rows={1}
                        name="comment"
                        onChange={handleChange}
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

            {/* comment modal  */}
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={post?.owner?.profilePicture}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <FaCaretRight />
                                    <div>
                                        <div className="flex items-center">
                                            <Link
                                                href={`/profile/${post?.owner?.username}`}
                                                className="font-semibold hover:text-primary"
                                            >
                                                {post?.owner?.name}
                                            </Link>
                                            <LuDot className="text-sm" />
                                            <p className="text-sm">
                                                {post?.visibility
                                                    ?.charAt(0)
                                                    .toUpperCase() +
                                                    post?.visibility?.slice(1)}
                                            </p>
                                        </div>
                                        <p className="text-xs">
                                            {formatDate(
                                                post.createdAt as string
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {post?.owner?._id === currentUser?._id && (
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
                                                            openEditPostModal
                                                        }
                                                        type="button"
                                                        className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 rounded-md"
                                                    >
                                                        Edit post
                                                    </button>
                                                </MenuItem>
                                                <MenuItem>
                                                    <button
                                                        onClick={
                                                            openDeletePostModal
                                                        }
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
                            <p className="pb-3 text-md text-secondary">
                                {post.content}
                            </p>
                            {post?.images?.length > 1 ? (
                                <div className="w-full h-[300px] sm:h-[350px] rounded overflow-hidden">
                                    <Swiper
                                        pagination={true}
                                        modules={[Pagination]}
                                        onSlideChange={(swiper) => {
                                            const currentSlide =
                                                swiper.slides[
                                                    swiper.activeIndex
                                                ];
                                            const imageElement =
                                                currentSlide.querySelector(
                                                    "img"
                                                );
                                            if (imageElement) {
                                                const src =
                                                    imageElement.getAttribute(
                                                        "data-src"
                                                    );
                                                if (src) {
                                                    imageElement.setAttribute(
                                                        "src",
                                                        src
                                                    );
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
                                                        {image.includes(
                                                            ".mp4"
                                                        ) ? (
                                                            <>
                                                                <div className="top-0 right-0 absolute w-full h-[80%] rounded-tr-lg px-2 z-10">
                                                                    {" "}
                                                                </div>
                                                                <video
                                                                    className="w-full !h-full rounded-lg"
                                                                    src={image}
                                                                    controls
                                                                    controlsList="nodownload nofullscreen noremoteplayback"
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img
                                                                    src={image}
                                                                    className="w-full !h-full rounded-lg"
                                                                />
                                                            </>
                                                        )}
                                                        <span className="absolute top-0 right-0 rounded-tr-lg px-2 bg-third text-secondary text-xs">
                                                            {index + 1}/
                                                            {post.images.length}
                                                        </span>
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
                        <div className="flex justify-between border-y mx-2 mt-2">
                            <button
                                type="button"
                                onClick={handleLikePost}
                                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                            >
                                {post?.likes?.includes(currentUser?._id) ? (
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
                                <p>({post?.likes?.length})</p>
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
                                {comments?.length} Comments
                            </p>
                            <div>
                                {comments &&
                                    comments.length > 0 &&
                                    comments.map(
                                        (comment) =>
                                            comment.replyingTo === "" && (
                                                <div
                                                    key={comment._id}
                                                    className="mb-8"
                                                >
                                                    <CommentPost
                                                        postId={post._id}
                                                        comment={comment}
                                                        currentUser={
                                                            currentUser
                                                        }
                                                        comments={comments}
                                                    />
                                                </div>
                                            )
                                    )}
                            </div>
                        </div>
                    </SimpleBar>
                    <div className="py-1 absolute bottom-0 w-full px-2">
                        <form onSubmit={handleSendComment} className="flex">
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
                                onChange={handleChange}
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

            {/* delete post modal */}
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

            {/* edit the post */}
            <Modal
                isOpen={modalEditPostIsOpen}
                onRequestClose={closeEditPostModal}
                className="w-full md:w-1/2 lg:w-1/3 z-50 rounded-md bg-white overflow-y-auto"
                overlayClassName="fixed mt-16 lg:mt-0 z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <EditPost
                    closeEditPostModal={closeEditPostModal}
                    currentUser={currentUser}
                    post={post}
                    setModalEditPostIsOpen={setModalEditPostIsOpen}
                />
            </Modal>
        </div>
    );
}
