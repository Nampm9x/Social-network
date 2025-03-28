"use client";

import React, { useState, ChangeEvent } from "react";
import { IComment } from "@/types/comment";
import Link from "next/link";
import { IUserS } from "@/types/user";
import { BsFillSendFill } from "react-icons/bs";
import ReplyCommentEvent from "@/components/profile/ReplyCommentEvent";
import {
    useCommentEvent,
    useGetReplyComments,
    useLikeCommentEvent,
} from "@/hooks/react-query/event";

export default function CommentEvent({
    eventId,
    comment,
    currentUser,
    comments,
}: {
    eventId: string;
    comment: IComment;
    currentUser: IUserS;
    comments: IComment[];
}) {
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [replyingForm, setReplyingForm] = useState<string>("");
    const [isShowReplyingComment, setIsShowReplyingComment] =
        useState<boolean>(false);
    const { data: replyingComments, isLoading: isLoadingReplyingComments } =
        useGetReplyComments(comment._id, isShowReplyingComment);

    const openReplying = (replyingTo: string) => {
        setIsReplying(!isReplying);
        setReplyingForm(`@${replyingTo} `);
    };

    const openShowRepying = () =>
        setIsShowReplyingComment(!isShowReplyingComment);

    const sendComment = useCommentEvent(eventId);
    const handleSendComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendComment.mutate(
            {
                eventId,
                comment: replyingForm,
                replyingTo: comment._id,
            },
            {
                onSuccess: () => {
                    setReplyingForm("");
                    setIsReplying(false);
                },
            }
        );
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setReplyingForm(e.target.value);
    };

    const likeComment = useLikeCommentEvent(comment?._id, eventId);
    const handleLikeComment = async () => {
        likeComment.mutate();
    };

    return (
        <>
            <div className="flex gap-3 mb-2">
                <img
                    src={comment?.owner?.profilePicture}
                    alt=""
                    className="w-6 h-6 border rounded-full"
                />
                <div>
                    <div className="bg-third pb-2 pt-1 rounded min-w-[220px] px-2">
                        <Link
                            href={`/profile/${comment?.owner?.username}`}
                            className="font-semibold hover:text-primary"
                        >
                            {comment?.owner?.name}
                        </Link>
                        <p>{comment?.comment}</p>
                    </div>
                    <div className="mt-1 text-sm flex font-semibold justify-end gap-3">
                        <button
                            className={`${
                                comment?.likes?.includes(currentUser?._id)
                                    ? "text-primary hover:text-black"
                                    : "hover:text-primary"
                            }`}
                            onClick={handleLikeComment}
                        >
                            {comment?.likes?.includes(currentUser?._id)
                                ? "Liked"
                                : "Like"}
                            ({comment?.likes?.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => openReplying(comment?.owner?.name)}
                            className="hover:text-primary"
                        >
                            {isReplying ? "Replying" : "Reply"}
                        </button>
                        {replyingComments && replyingComments.length > 0 && (
                            <button
                                type="button"
                                onClick={openShowRepying}
                                className="hover:text-primary"
                            >
                                {isShowReplyingComment ? "Hide" : "Show"}{" "}
                                {replyingComments.length}{" "}
                                {replyingComments.length > 1
                                    ? "replies"
                                    : "reply"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isReplying && (
                <div className="mb-8">
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
                            value={replyingForm}
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
            )}
            {isLoadingReplyingComments && <p>Loading...</p>}
            {isShowReplyingComment &&
                replyingComments &&
                replyingComments.map((replyingComment) => (
                    <div key={replyingComment?._id} className="mb-3 ml-10">
                        <ReplyCommentEvent
                            replyingComment={replyingComment}
                            currentUser={currentUser}
                            eventId={eventId}
                            comment={comment}
                            comments={comments}
                            replyingComments={replyingComments}
                        />
                    </div>
                ))}
        </>
    );
}
