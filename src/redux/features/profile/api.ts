import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const getPostsAndEvents = async ({
    pageParam = 0,
    limit = 3,
    otherUserId,
}: {
    pageParam?: number;
    limit?: number;
    otherUserId: string;
}) => {
    const res = await axios.get(
        `/api/profile/get-posts-and-events/${otherUserId}`,
        { params: { skip: pageParam, limit }, headers }
    );
    return res.data;
};
