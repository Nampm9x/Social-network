import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const getCurrentUser = async () => {
    const res = await axios.get(`/api/user/get-current-user`, {
        headers,
    });
    return res.data;
};

export const getUser = async (username: string) => {
    const res = await axios.get(`/api/user/get-user/${username}`, {
        headers,
    });
    return res.data;
};

export const followUser = async (followId: string) => {
    const res = await axios.post(
        `/api/user/follow-user/${followId}`,
        {},
        {
            headers,
        }
    );
    return res.data;
};

export const editUser = async (data: any) => {
    const res = await axios.put(`/api/user/edit-profile`, data, {
        headers,
    });
    return res.data;
};

export const searchUsersToSendMessage = async (
    query: string,
    userId: string
) => {
    const res = await axios.get(
        `/api/user/search-users-to-send-message/${query}`,
        { headers }
    );
    return res.data;
};

export const whoToFollow = async () => {
    const res = await axios.get(`/api/user/who-to-follow`, { headers });
    return res.data;
};

export const changeCoverPhoto = async (coverPhoto: string) => {
    const res = await axios.put(
        `/api/user/change-cover-photo`,
        { coverPhoto },
        { headers }
    );
    return res.data;
};

export const checkExistsUsername = async (username: string) => {
    const res = await axios.get(`/api/user/check-exists-username/${username}`, {
        headers,
    });
    return res.data;
};

export const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string
) => {
    const res = await axios.put(
        `/api/user/change-password`,
        { oldPassword, newPassword, confirmNewPassword },
        { headers }
    );
    return res.data;
};

export const sendVerificationCode = async (email: string) => {
    const res = await axios.post(
        `/api/mailer/reset-password`,
        { email },
        { headers }
    );
    return res.data;
};

export const verificationResetPasswordCode = async (
    email: string,
    otp: string
) => {
    const res = await axios.post(
        `/api/mailer/verification-reset-password-code`,
        { email, otp },
        { headers }
    );
    return res.data;
};

export const resetPassword = async (email: string, password: string) => {
    const res = await axios.put(
        `/api/user/reset-password`,
        { email, password },
        { headers }
    );
    return res.data;
};
