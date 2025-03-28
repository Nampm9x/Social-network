"use client";

import { useState, ChangeEvent } from "react";
import { IComment } from "@/types/comment";
import { IUserS } from "@/types/user";
import Link from "next/link";
import { BsFillSendFill } from "react-icons/bs";
import {
    useLikeCommentPost,
    useSendCommentPost,
} from "@/hooks/react-query/post";

export default function ReplyCommentPost({
    replyingComment,
    currentUser,
    postId,
    comment,
}: {
    replyingComment: IComment;
    currentUser: IUserS;
    postId: string;
    comment: IComment;
}) {
    const [replyingReplyId, setReplyingReplyId] = useState<string | null>(null);
    const [replyingReply, setReplyingReply] = useState<string>("");

    const openReplyingReply = (replyingTo: string, commentId: string) => {
        if (replyingReplyId === commentId) {
            setReplyingReplyId(null);
        } else {
            setReplyingReplyId(commentId);
            setReplyingReply(`@${replyingTo} `);
        }
    };

    const handleChangeReplying = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setReplyingReply(e.target.value);
    };

    const sendReplying = useSendCommentPost(postId);
    const handleSendReplying = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendReplying.mutate(
            {
                comment: replyingReply,
                replyingTo: replyingComment._id,
            },
            {
                onSuccess: () => {
                    setReplyingReplyId(null);
                    setReplyingReply("");
                },
            }
        );
    };

    const likeCommentPost = useLikeCommentPost(
        replyingComment._id,
        comment._id
    );
    const handleLikeComment = async () => {
        likeCommentPost.mutate();
    };

    return (
        <>
            <div className="flex gap-3 mb-2">
                <img
                    src={replyingComment.owner.profilePicture}
                    alt=""
                    className="w-6 h-6 border rounded-full"
                />
                <div>
                    <div className="bg-third pb-2 pt-1 rounded min-w-[180px] px-2">
                        <Link
                            href={`/profile/${replyingComment.owner.username}`}
                            className="font-semibold hover:text-primary"
                        >
                            {replyingComment.owner.name}
                        </Link>
                        <p>{replyingComment.comment}</p>
                    </div>
                    <div className="mt-1 text-sm flex font-semibold justify-end gap-3">
                        <button
                            className={`${
                                replyingComment?.likes?.includes(
                                    currentUser?._id
                                )
                                    ? "text-primary hover:text-black"
                                    : "hover:text-primary"
                            }`}
                            onClick={handleLikeComment}
                        >
                            {replyingComment?.likes?.includes(currentUser?._id)
                                ? "Liked"
                                : "Like"}
                            ({replyingComment?.likes?.length})
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                openReplyingReply(
                                    replyingComment.owner.name,
                                    replyingComment._id
                                )
                            }
                            className="hover:text-primary"
                        >
                            {replyingReplyId === replyingComment._id
                                ? "Replying"
                                : "Reply"}
                        </button>
                    </div>
                </div>
            </div>
            {replyingReplyId === replyingComment._id && (
                <div className="mb-8">
                    <form onSubmit={handleSendReplying} className="flex">
                        <img
                            src={currentUser?.profilePicture}
                            alt=""
                            className="items-center w-10 h-10 rounded-full border mr-3"
                        />
                        <textarea
                            required
                            rows={1}
                            name="comment"
                            onChange={handleChangeReplying}
                            value={replyingReply}
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
        </>
    );
}
