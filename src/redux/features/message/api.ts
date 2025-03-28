import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { IUser, IUserS } from "@/types/user";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const getConversations = async () => {
    const res = await axios.get<IConversation[]>(
        `/api/conversation/get-conversations`,
        { headers }
    );
    return res.data;
};

export const getConversation = async (conversationId: string) => {
    const res = await axios.get<IConversation>(
        `/api/conversation/get-conversationbyid/${conversationId}`,
        { headers }
    );
    return res.data;
};

export const createConversation = async (
    members: string[],
    lastMessage: string,
    lastMessageTime: string
) => {
    const res = await axios.post(
        `/api/conversation/create-conversation`,
        {
            members,
            lastMessage,
            lastMessageTime,
        },
        { headers }
    );

    localStorage.removeItem(`conversation_${members[0]}`);

    return res.data;
};

export const getConversationByUserId = async (userId: string, user: IUserS) => {
    const res = await axios.get<IConversation>(
        `/api/conversation/get-conversationbyusername/${userId}/${user._id}`,
        { headers }
    );
    if (res && res.status === 200 && res.data._id) {
        return res.data;
    } else {
        const localConversationData = localStorage.getItem(
            `conversation_${user._id}`
        );

        if (!localConversationData) {
            const temp = {
                _id: `temp_${user._id}`,
                name: user.name,
                profilePicture: user.profilePicture,
                username: user.username,
            };

            localStorage.setItem(
                `conversation_${user._id}`,
                JSON.stringify(temp)
            );
            return temp;
        } else {
            const parsedData = JSON.parse(localConversationData);
            return parsedData;
        }
    }
};

export const getArchivedConversations = async () => {
    const res = await axios.get<IConversation[]>(
        `/api/conversation/get-archivedconversations`,
        { headers }
    );
    return res.data;
};

export const getMessages = async (conversationId: string) => {
    const res = await axios.get(
        `/api/message/get-messages/${conversationId}`,
        { headers }
    );
    return res.data;
};

export const readMessage = async (conversationId: string) => {
    await axios.put(`/api/message/read-message/${conversationId}`, {
        headers,
    });
    await axios.put(`/api/conversation/read-conversation/${conversationId}`, {
        headers,
    });
};

export const archiveConversation = async (conversationId: string) => {
    const res = await axios.put<IConversation>(
        `/api/conversation/archive-conversation/${conversationId}`,
        { headers }
    );
    return res.data;
};

export const unArchiveConversation = async (conversationId: string) => {
    const res = await axios.put(
        `/api/conversation/unarchive-conversation/${conversationId}`,
        { headers }
    );
    return res.data;
};

export const deleteConversation = async (conversationId: string) => {
    const res = await axios.put(
        `/api/conversation/delete-conversation/${conversationId}`,
        { headers }
    );
    return res.data;
};

export const createGroup = async (
    members: string[],
    type: string,
    lastMessage: string,
    lastMessageTime: any,
    conversationPicture: string,
    conversationName: string
) => {
    const res = await axios.post(
        `/api/conversation/create-conversation`,
        {
            members,
            type,
            lastMessage,
            lastMessageTime,
            conversationPicture,
            conversationName,
        },
        { headers }
    );
    return res.data;
};

export const getUserToSendMessage = async (query: string) => {
    const res = await axios.get(
        `/api/user/search-users-to-send-message/${query}`,
        { headers }
    );
    return res.data;
};

export const getMemberOfGroup = async (userId: string) => {
    const res = await axios.get(`/api/user/get-user-by-id/${userId}`, {
        headers,
    });
    return res.data;
};

export const updateConversation = async (
    conversationId: string,
    lastMessage: string,
    lastMessageTime: string
) => {
    const res = await axios.put(
        `/api/conversation/update-conversation/${conversationId}`,
        {
            lastMessage,
            lastMessageTime,
        }
    );
    return res.data;
};

export const createMessage = async (
    conversationId: string,
    text: string,
    members: any[],
    type: string,
    replyTo?: any
) => {
    const res = await axios.post(
        `/api/message/create-message`,
        {
            conversationId,
            text,
            members,
            type,
            replyTo,
        },
        { headers }
    );
    return res.data;
};

export const getMedia = async ({
    pageParam = 0,
    limit = 10,
    conversationId,
}: {
    pageParam?: number;
    limit?: number;
    conversationId: string;
}) => {
    const res = await axios.get(`/api/message/get-media/${conversationId}`, {
        params: { skip: pageParam, limit },
        headers,
    });
    return res.data;
};

export const leaveGroup = async (conversationId: string, userId: string) => {
    const res = await axios.put(
        `/api/conversation/leave-group/${conversationId}/${userId}`,
        { headers }
    );
    return res.data;
};

export const searchConversations = async (search: string) => {
    const res = await axios.get(
        `/api/conversation/search-conversations/${search}`,
        {
            headers,
        }
    );
    return res.data;
};
