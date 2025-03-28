import { IComment } from "@/types/comment";
import { IGroup } from "@/types/group";
import { IGroupPost } from "@/types/grouppost";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const getGroup = async (groupId: string) => {
    const res = await axios.get<IGroup>(`/api/group/get-group/${groupId}`, {
        headers,
    });
    return res.data;
};

export const getYourGroupPostsForFeed = async ({
    pageParam = 0,
    limit = 5,
}: {
    pageParam?: number;
    limit?: number;
}) => {
    const res = await axios.get(
        `/api/grouppost/get-group-posts-for-feed`,
        {params: {skip: pageParam, limit }, headers }
    );
    return res.data;
};

export const getGroupPosts = async (groupId: string) => {
    const res = await axios.get<IGroupPost[]>(
        `/api/grouppost/get-group-posts/${groupId}`,
        { headers }
    );
    return res.data;
};

export const getGroupPost = async (groupId: string, postId: string) => {
    const res = await axios.get<IGroupPost>(
        `/api/grouppost/get-group-post/${groupId}/${postId}`,
        { headers }
    );
    return res.data;
};

export const createGroupPost = async (
    content: string,
    images: string[],
    groupId: string
) => {
    const res = await axios.post<IGroupPost>(
        `/api/grouppost/create-group-post`,
        {
            content: content,
            images: images,
            group: groupId,
        },
        { headers }
    );
    return res.data;
};

export const getPendingPosts = async (groupId: string) => {
    const res = await axios.get<IGroupPost[]>(
        `/api/grouppost/get-pending-posts/${groupId}`,
        { headers }
    );
    return res.data;
};

export const getYourPendingPosts = async (groupId: string) => {
    const res = await axios.get<IGroupPost[]>(
        `/api/grouppost/get-your-pending-posts/${groupId}`,
        { headers }
    );
    return res.data;
};

export const joinGroup = async (groupId: string) => {
    const res = await axios.put<IGroup>(`/api/group/join-group/${groupId}`, {
        headers,
    });
    return res.data;
};

export const leaveGroup = async (groupId: string, userId: string) => {
    const res = await axios.put<IGroup>(
        `/api/group/leave-group/${groupId}/${userId}`,
        { headers }
    );
    return res.data;
};

export const deleteGroup = async (groupId: string) => {
    const res = await axios.delete(`/api/group/delete-group/${groupId}`, {
        headers,
    });
    return res.data;
};

export const editGroup = async (groupId: string, data: any) => {
    const res = await axios.put<IGroupPost>(
        `/api/group/edit-group/${groupId}`,
        data,
        { headers }
    );
    return res.data;
};

export const acceptGroupMember = async (groupId: string, userId: string) => {
    const res = await axios.put(
        `/api/group/accept-group-member/${groupId}/${userId}`,
        { headers }
    );
    return res.data;
};

export const cancelPendingMember = async (groupId: string, userId: string) => {
    const res = await axios.put(
        `/api/group/cancel-pending-member/${groupId}/${userId}`,
        { headers }
    );
    return res.data;
};

export const approvePost = async (postId: string, groupId: string) => {
    const res = await axios.put(
        `/api/grouppost/approve-group-post/${postId}/${groupId}`,
        { headers }
    );
    return res.data;
};

export const rejectPost = async (postId: string, groupId: string) => {
    const res = await axios.put(
        `/api/grouppost/reject-group-post/${postId}/${groupId}`,
        {},
        { headers }
    );
    return res.data;
};

export const deletePost = async (postId: string) => {
    const res = await axios.delete(
        `/api/grouppost/delete-group-post/${postId}`,
        { headers }
    );
    return res.data;
};

export const getComments = async (postId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/grouppostcomment/get-comment/${postId}`,
        { headers }
    );
    return res.data;
};

export const likePost = async (postId: string) => {
    const res = await axios.put(`/api/grouppost/like-group-post/${postId}`, {
        headers,
    });
    return res.data;
};

export const sendComment = async (
    postId: string,
    comment: string,
    replyingTo: string
) => {
    const res = await axios.post(
        `/api/grouppostcomment/create/${postId}`,
        {
            comment,
            replyingTo,
        },
        { headers }
    );
    return res.data;
};

export const getReplyComments = async (commentId: string) => {
    const res = await axios.get<IComment[]>(
        `/api/grouppostcomment/get-replycomments/${commentId}`,
        { headers }
    );
    return res.data;
};

export const likeComment = async (commentId: string) => {
    const res = await axios.post(
        `/api/grouppostcomment/like-comment/${commentId}`,
        { headers }
    );
    return res.data;
};

export const getYourGroups = async () => {
    const res = await axios.get<IGroup[]>(`/api/group/get-your-groups`, {
        headers,
    });
    return res.data;
};

export const getYourGroupsJoined = async () => {
    const res = await axios.get<IGroup[]>(`/api/group/get-groups-joined`, {
        headers,
    });
    return res.data;
};

export const getYourPendingGroups = async () => {
    const res = await axios.get(`/api/group/get-your-pending-groups`, {
        headers,})
    return res.data;
};

export const searchGroups = async (query: string) => {
    const res = await axios.get<any[]>(
        `/api/group/search-groups?search=${query}`,
        { headers }
    );
    return res.data;
};

export const createGroup = async (data: any) => {
    const res = await axios.post<IGroup>(
        `/api/group/create-group`,
        { data },
        { headers }
    );
    return res.data;
};

export const getGroupSuggestions = async () => {
    const res = await axios.get(`/api/group/get-group-suggestions`, {headers});
    return res.data;
}