import axios from "axios";

const headers = {
  "Content-Type": "application/json",
};

export const getPostsAndEvents = async ({
  pageParam = 0,
  limit = 3,
}: {
  pageParam?: number;
  limit?: number;
}) => {
  const res = await axios.get(`/api/home/get-posts-and-events`, {
    params: { skip: pageParam, limit },
    headers,
  });
  return res.data;
};
