"use client";

import React from "react";
import { IPost } from "@/types/post";

export default function SamePosts({ post }: { post: IPost }) {
    return (
        <div className="p-2">
            <div className="font-semibold text-lg text-center text-primary border-b-2 pb-3">
                Same posts
            </div>
        </div>
    );
}
