"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import { IEvent } from "@/types/event";
import { IUser, IUserS } from "@/types/user";
import { FaCaretRight } from "react-icons/fa";
import { CiLocationOn, CiHeart, CiCalendarDate } from "react-icons/ci";
import { PiChatCircleThin, PiUsersThin } from "react-icons/pi";
import Link from "next/link";
import { LuDot } from "react-icons/lu";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { IoIosMore } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";
import Modal from "react-modal";
import { IoMdClose } from "react-icons/io";
import CommentEvent from "@/components/profile/CommentEvent";
import SendItem from "./SendItem";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import EditEvent from "./EditEvent";
import { usePathname, useRouter } from "next/navigation";
import SimpleBar from "simplebar-react";
import {
    useCommentEvent,
    useDeleteEvent,
    useFollowEvent,
    useGetComments,
    useLikeEvent,
    useViewEvent,
} from "@/hooks/react-query/event";
import { toast } from "react-toastify";
import LoadingComments from "../loading/LoadingComments";

Modal.setAppElement("#main-body");

export default function Event({
    event,
    currentUser,
}: {
    event: IEvent;
    currentUser: IUserS;
}) {
    const dateFromMongoDb = new Date(event?.date);
    const formattedDate = dateFromMongoDb?.toISOString().split("T")[0];
    const [commentForm, setCommentForm] = useState<string>("");
    const [commentModalIsOpen, setCommentModalIsOpen] =
        useState<boolean>(false);
    const { data: comments, isLoading: isLoadingComments } = useGetComments(
        event._id,
        commentModalIsOpen
    );
    const [modalDeleteEventIsOpen, setModalDeleteEventIsOpen] =
        useState<boolean>(false);
    const formatDate = useFormattedDate();
    const [modalEditEventIsOpen, setModalEditEventIsOpen] =
        useState<boolean>(false);
    const [eventWidth, setEventWidth] = useState<number>(0);
    const [eventHeight, setEventHeight] = useState<number>(0);
    const elementRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const updateWidth = () => {
            if (elementRef.current) {
                setEventWidth(elementRef.current.offsetWidth);
                setEventHeight(elementRef.current.offsetHeight);
            }
        };

        updateWidth();

        window.addEventListener("resize", updateWidth);

        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const followEvent = useFollowEvent(event?._id, event?.owner._id);
    const handleFollowEvent = () => {
        followEvent.mutate();
    };

    const likeEvent = useLikeEvent(event?._id, event?.owner._id);
    const handleLikeEvent = () => {
        likeEvent.mutate();
    };

    const deleteEvent = useDeleteEvent(event?._id, event?.owner?._id);
    const handleDeleteEvent = () => {
        deleteEvent.mutate(
            { eventId: event?._id },
            {
                onSuccess: () => {
                    setModalDeleteEventIsOpen(false);
                    toast.success("Event deleted successfully!");
                    setCommentModalIsOpen(false);
                    if (pathname.startsWith(`/events/${event._id}`)) {
                        router.push("/");
                    }
                },
            }
        );
    };

    const commentEvent = useCommentEvent(event?._id);
    const handleSendComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        commentEvent.mutate(
            {
                eventId: event._id,
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

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCommentForm(e.target.value);
    };

    const openCommentModal = () => setCommentModalIsOpen(true);
    const closeCommentModal = () => setCommentModalIsOpen(false);

    const openDeleteEventModal = () => {
        setModalDeleteEventIsOpen(true)
        setCommentModalIsOpen(false);
    };
    const closeDeleteEventModal = () => setModalDeleteEventIsOpen(false);

    const openEditEventIsOpen = () => setModalEditEventIsOpen(true);

    return (
        <div className="bg-white rounded-lg p-5 pb-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src={event?.owner?.profilePicture}
                        className="w-10 h-10 rounded-full border object-cover"
                    />
                    <FaCaretRight />
                    <div>
                        <div className="flex items-center">
                            <Link
                                href={`/profile/${event?.owner?.username}`}
                                className="font-semibold hover:text-primary"
                            >
                                {event?.owner?.name}
                            </Link>
                            <LuDot className="text-sm" />
                            <p className="text-sm">
                                {event?.visibility?.charAt(0).toUpperCase() +
                                    event?.visibility?.slice(1)}
                            </p>
                        </div>
                        <p className="text-xs">
                            {formatDate(event.createdAt as string)}
                        </p>
                    </div>
                </div>
                <div>
                    {event?.owner._id === currentUser?._id && (
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
                                        onClick={openEditEventIsOpen}
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Edit event
                                    </button>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        onClick={openDeleteEventModal}
                                        type="button"
                                        className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Delete event
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    )}
                </div>
            </div>

            <div
                className="flex gap-2 lg:gap-5 items-center mt-2 pb-4"
            >
                <div
                    className="w-[75px] md:w-[100px] xl:w-[150px] aspect-square rounded-lg object-cover"
                >
                    <img
                        src={event.image}
                        alt=""
                        className="w-full h-full rounded-lg object-cover"
                    />
                </div>
                <div>
                    <Link
                        href={`/events/${event._id}`}
                        className="font-bold text-lg md:text-xl hover:text-primary"
                    >
                        {event.title}
                    </Link>
                    <div className="md:flex my-2 items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <CiCalendarDate />
                            <span>{formattedDate}</span>
                            <span>{event.time as string}</span>
                        </div>
                        <div className="flex gap-3 mt-1 md:mt-0">
                            <div className="flex items-center gap-1">
                                <CiLocationOn />
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <PiUsersThin />
                                <span>{event?.followers?.length}</span>
                            </div>
                        </div>
                    </div>
                    {event?.owner._id !== currentUser?._id && (
                        <>
                            {event?.followers?.includes(currentUser?._id) ? (
                                <div>
                                    <button
                                        onClick={handleFollowEvent}
                                        type="button"
                                        className="px-3 py-1 border bg-primary text-white rounded hover:bg-white hover:text-primary border-primary"
                                    >
                                        Following
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <button
                                        onClick={handleFollowEvent}
                                        type="button"
                                        className="px-3 py-1 border bg-primary text-white rounded hover:bg-white hover:text-primary border-primary"
                                    >
                                        Follow
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-between border-y">
                <button
                    type="button"
                    onClick={handleLikeEvent}
                    className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                >
                    {event?.likes?.includes(currentUser?._id) ? (
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
                    <p>({event?.likes?.length})</p>
                </button>
                <button
                    type="button"
                    onClick={openCommentModal}
                    className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                >
                    <PiChatCircleThin />
                    <p>Comment</p>
                </button>
                <SendItem item={event} currentUser={currentUser} />
            </div>
            <div className="py-5">
                <form onSubmit={handleSendComment} className="flex">
                    <textarea
                        required
                        rows={1}
                        name="comment"
                        onChange={handleChange}
                        value={commentForm}
                        placeholder="Add a comment..."
                        className="flex items-center resize-none w-full outline-none px-2 b py-2 g-third text-secondary border rounded-l border-r-0"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1 bg-third text-secondary rounded-r hover:bg-third hover:text-primary"
                    >
                        <BsFillSendFill />
                    </button>
                </form>
            </div>

            <Modal
                isOpen={commentModalIsOpen}
                onRequestClose={closeCommentModal}
                className="w-full mx-4 md:px-0 md:w-1/2 lg:w-1/3 rounded-md bg-white z-50"
                overlayClassName="fixed mt-0 z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div className="h-[95vh] relative">
                    <div className="py-5 bg-white w-full border-b flex px-2 justify-between items-center">
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
                    <SimpleBar className="h-[calc(95vh-113px)] overflow-y-auto">
                    <div className="flex items-center justify-between px-2 mt-2">
                <div className="flex items-center">
                    <img
                        src={event?.owner?.profilePicture}
                        className="w-10 h-10 rounded-full border object-cover"
                    />
                    <FaCaretRight />
                    <div>
                        <div className="flex items-center">
                            <Link
                                href={`/profile/${event?.owner?.username}`}
                                className="font-semibold hover:text-primary"
                            >
                                {event?.owner?.name}
                            </Link>
                            <LuDot className="text-sm" />
                            <p className="text-sm">
                                {event?.visibility?.charAt(0).toUpperCase() +
                                    event?.visibility?.slice(1)}
                            </p>
                        </div>
                        <p className="text-xs">
                            {formatDate(event.createdAt as string)}
                        </p>
                    </div>
                </div>
                <div>
                    {event?.owner._id === currentUser?._id && (
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
                                        onClick={openEditEventIsOpen}
                                        className="w-full text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Edit event
                                    </button>
                                </MenuItem>
                                <MenuItem>
                                    <button
                                        onClick={openDeleteEventModal}
                                        type="button"
                                        className="w-full block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                                    >
                                        Delete event
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    )}
                </div>
            </div>
                        <div className="flex gap-5 items-center mt-2 pb-4 px-2">
                            <div
                                ref={elementRef}
                                className="w-[75px] h-[75px] md:w-[100px] md:h-[100px] xl:w-[150px] xl:h-[150px] rounded-lg object-cover"
                            >
                                <img
                                    src={event.image}
                                    className="w-full h-full rounded-lg object-cover"
                                />
                            </div>
                            <div>
                                <Link
                                    href={`/events/${event._id}`}
                                    className="font-bold text-lg md:text-xl hover:text-primary"
                                >
                                    {event.title}
                                </Link>
                                <div className="md:flex my-2 items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        <CiCalendarDate />
                                        <span>{formattedDate}</span>
                                        <span>{event.time as string}</span>
                                    </div>
                                    <div className="flex gap-3 mt-1 md:mt-0">
                                        <div className="flex items-center gap-1">
                                            <CiLocationOn />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <PiUsersThin />
                                            <span>
                                                {event?.followers?.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {currentUser?._id !== event?.owner?._id && (
                                    <>
                                        {event?.followers?.includes(
                                            currentUser?._id
                                        ) ? (
                                            <div>
                                                <button
                                                    onClick={handleFollowEvent}
                                                    type="button"
                                                    className="px-3 py-1 border bg-primary text-white rounded hover:bg-white hover:text-primary border-primary"
                                                >
                                                    Following
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <button
                                                    onClick={handleFollowEvent}
                                                    type="button"
                                                    className="px-3 py-1 border bg-primary text-white rounded hover:bg-white hover:text-primary border-primary"
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between border-y mx-2">
                            <button
                                type="button"
                                onClick={handleLikeEvent}
                                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                            >
                                {event?.likes?.includes(currentUser?._id) ? (
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
                                <p>({event?.likes?.length})</p>
                            </button>
                            <label
                                htmlFor="comment-event-modal"
                                className="py-3 flex gap-1 items-center w-1/3 justify-center hover:bg-third cursor-pointer text-secondary hover:text-primary"
                            >
                                <PiChatCircleThin />
                                <p>Comment</p>
                            </label>
                            <SendItem item={event} currentUser={currentUser} />
                        </div>
                        <div className="px-2">
                            <p className="py-2 text-secondary text-md font-semibold">
                                {comments?.length} Comments{" "}
                            </p>
                            {isLoadingComments && <LoadingComments />}
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
                                                    <CommentEvent
                                                        eventId={event._id}
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
                            <textarea
                                required
                                rows={1}
                                id="comment-event-modal"
                                name="comment"
                                onChange={handleChange}
                                value={commentForm}
                                placeholder="Add a comment..."
                                className="flex items-center resize-none w-full outline-none p-2 bg-third text-secondary border rounded-l border-r-0"
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

            {event && (
                <EditEvent
                    event={event}
                    currentUser={currentUser}
                    modalEditEventIsOpen={modalEditEventIsOpen}
                    setModalEditEventIsOpen={setModalEditEventIsOpen}
                />
            )}

            {/* delete event */}
            <Modal
                isOpen={modalDeleteEventIsOpen}
                onRequestClose={closeDeleteEventModal}
                className="w-full sm:w-1/2 lg:w-1/3 mx-4 rounded-md bg-white"
                overlayClassName="fixed mt-16 lg:mt-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <div>
                    <div className="pb-5">
                        <p className="text-center text-lg py-5">
                            Are you sure you want to delete this event?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleDeleteEvent}
                                className="py-1 px-3 border bg-red-500 rounded text-white hover:bg-white hover:text-red-500 border-red-500"
                            >
                                Yes
                            </button>
                            <button
                                onClick={closeDeleteEventModal}
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
