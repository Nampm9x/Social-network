import { IComment } from "@/types/comment";
import { IPost } from "@/types/post";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const createPost = async (
    content: string,
    visibility: string,
    images: any[]
) => {
    const res = await axios.post(
        `/api/post/create-post`,
        { content, visibility, images },
        { headers }
    );
    return res.data;
};

export const getPost = async (postId: string) => {
    const res = await axios.get(
        `/api/post/get-post/${postId}`,
        {
            headers,
        }
    );
    return res.data;
};

export const getPosts = async (postOwnerId: string) => {
    const res = await axios.get<IPost[]>(
        `/api/post/get-posts/${postOwnerId}`,
        { headers }
    );
    return res.data;
};

export const sendCommentPost = async (
    postId: string,
    comment: string,
    replyingTo?: string
) => {
    const res = await axios.post(
        `/api/postcomment/create/${postId}`,
        { comment, replyingTo },
        { headers }
    );
    return res.data;
};

export const getComments = async (postId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/postcomment/get-comment/${postId}`,
        { headers }
    );
    return res.data;
};

export const getReplyComments = async (commentId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/postcomment/get-replycomments/${commentId}`,
        { headers }
    );
    return res.data;
};

export const viewPost = async (postId: string) => {
    const res = await axios.post(`/api/post/viewed-post/${postId}`, {
        headers,
    });
    return res.data;
};

export const likePost = async (postId: string) => {
    const res = await axios.post(`/api/post/like-post/${postId}`, {
        headers,
    });
    return res.data;
};

export const deletePost = async (postId: string) => {
    const res = await axios.delete(
        `/api/post/delete-post/${postId}`,
        { headers }
    );
    return res.data;
};

export const likeCommentPost = async (commentId: string) => {
    const res = await axios.post(
        `/api/postcomment/like-comment/${commentId}`,
        { headers }
    );
    return res.data;
};

export const editPost = async (
    postId: string,
    content: string,
    visibility: string,
    images: any[]
) => {
    const res = await axios.put(`/api/post/edit-post`, {
        postid: postId,
        content: content || "",
        visibility: visibility || "public",
        images: images || [],
    });
    return res.data;
};
