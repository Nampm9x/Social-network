"use client";

import React from "react";
import { IPost } from "@/types/post";
import Link from "next/link";
import { FaEye } from "react-icons/fa";

export default function Post({
    post,
    post_id,
}: {
    post: IPost;
    post_id: string;
}) {
    return (
        <Link
            href={`/posts/${post._id}`}
            className={`rounded-lg w-full h-full opacity-100 hover:opacity-60 ${
                post._id === post_id ? "opacity-60" : ""
            } relative`}
        >
            {post?.images[0] ?
            ( 
            <img
                src={post.images[0]}
                alt="post"
                className="w-full h-full rounded-lg object-cover"
            />
            ) :
            (
                <div className="w-full h-full rounded-lg flex justify-center items-center font-semibold">
                    Text post
                </div>
            )
}
            {post_id === post._id && (
                <div className="absolute top-0 font-semibold w-full h-full flex items-center justify-center opacity-60">
                    <FaEye className="text-4xl" />
                </div>
            )}
        </Link>
    );
}
