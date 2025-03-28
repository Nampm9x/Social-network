import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const search = async (query: string) => {
    const res = await Promise.allSettled([
        axios.get(`/api/post/search-posts/${query}`, { headers }),
        axios.get(`/api/event/search-events/${query}`, { headers }),
        axios.get(`/api/user/search-users/${query}`, { headers }),
        axios.get(`/api/group/search-groups?search=${query}`, { headers }),
    ]);
    const postsRes = res[0];
    const eventsRes = res[1];
    const usersRes = res[2];
    const groupsRes = res[3];

    return {
        posts:
            postsRes.status === "fulfilled" && postsRes.value.status === 200
                ? postsRes.value.data
                : [],
        events:
            eventsRes.status === "fulfilled" && eventsRes.value.status === 200
                ? eventsRes.value.data
                : [],
        users:
            usersRes.status === "fulfilled" && usersRes.value.status === 200
                ? usersRes.value.data
                : [],
        groups:
            groupsRes.status === "fulfilled" && groupsRes.value.status === 200
                ? groupsRes.value.data
                : [],
    };
};
