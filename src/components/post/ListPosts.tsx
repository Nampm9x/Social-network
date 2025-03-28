"use client";

import React, { useRef, useEffect, useState } from "react";
import { IPost } from "@/types/post";
import Post from "./Post";
import { IUser } from "@/types/user";
import Link from "next/link";

export default function ListPosts({
    posts,
    post_id,
    post,
}: {
    posts: IPost[];
    post_id: string;
    post: IPost;
}) {
    const [postWidth, setPostWidth] = useState<number>(0);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elementRef.current) {
            setPostWidth(elementRef.current.offsetWidth);
        }
    }, [elementRef]);

    return (
        <>
            <div className="flex justify-center pt-2">
                <img
                    src={post?.owner?.profilePicture}
                    alt=""
                    className="w-[75px] h-[75px] rounded-full border"
                />
            </div>
            <div className="flex justify-center mt-3 border-b-2 pb-3">
                <Link
                    href={`/profile/${post?.owner?.username}`}
                    className="text-lg font-semibold hover:text-primary"
                >
                    {post?.owner?.name}
                </Link>
            </div>

            <div className="flex flex-wrap p-2">
                {posts &&
                    posts.length > 0 &&
                    posts.map((post) => (
                        <div
                            ref={elementRef}
                            key={post._id}
                            className={`w-1/2 aspect-square border rounded-lg`}
                        >
                            <Post post={post} post_id={post_id} />
                        </div>
                    ))}
            </div>
        </>
    );
}
