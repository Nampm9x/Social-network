import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const logout = async () => {
    const res = await axios.post(`/api/auth/logout`, {}, { headers });
    return res.data;
};

export const login = async (email: string, password: string) => {
    const res = await axios.post(
        `/api/auth/login`,
        { email, password },
        { headers }
    );
    return res;
};

export const resendCodeRegister = async (email: string) => {
    const res = await axios.post(
        `/api/mailer/register`,
        { email },
        { headers }
    );
    return res.data;
};
