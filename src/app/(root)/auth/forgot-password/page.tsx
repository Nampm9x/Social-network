"use client";

import {
    useResetPassword,
    useSendVerificationCode,
    useVerificationResetPasswordCode,
} from "@/hooks/react-query/user";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import OtpInput from "react-otp-input";
import { toast } from "react-toastify";

export default function page() {
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState("");
    const [isResetPasswordForm, setIsResetPasswordForm] = useState(false);
    const [password, setPassword] = useState<{
        newPassword: string;
        confirmNewPassword: string;
    }>({ newPassword: "", confirmNewPassword: "" });

    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value,
        });
    };

    const sendVerificationCode = useSendVerificationCode();
    const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendVerificationCode.mutate(
            { email },
            {
                onSuccess: () => {
                    toast.success("The verification code was sent");
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                },
            }
        );
    };

    const verificationCode = useVerificationResetPasswordCode();
    const handleVerificationCode = () => {
        verificationCode.mutate(
            { email, otp },
            {
                onSuccess: () => {
                    toast.success("The code was verified");
                    setOtp("");
                    setIsResetPasswordForm(true);
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                },
            }
        );
    };

    const resetPassword = useResetPassword();
    const handleResetPassword = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
        }
        if (password.newPassword !== password.confirmNewPassword) {
            toast.error("Passwords do not match");
        }
        resetPassword.mutate(
            {
                email,
                password: password?.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("Password reset successfully");
                    setIsResetPasswordForm(false);
                    setEmail("");
                    setOtp("");
                    router.push("/auth/login");
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                },
            }
        );
    };

    return (
        <div className="pt-10 flex justify-center">
            <div className="bg-white pb-10 px-20 shadow-md max-w-full">
                <h2 className="py-10 rounded text-center text-primary text-3xl font-semibold">
                    PASSWORD RESET
                </h2>

                {isResetPasswordForm ? (
                    <form
                        onSubmit={handleResetPassword}
                        className="flex-col gap-2"
                    >
                        <div className="flex gap-2">
                            <input
                                onChange={handleChangePassword}
                                type="password"
                                required
                                placeholder="New password"
                                name="newPassword"
                                className="w-full py-2 px-2 border outline-none rounded"
                            />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                onChange={handleChangePassword}
                                type="password"
                                required
                                placeholder="Confirm new password"
                                name="confirmNewPassword"
                                className="w-full py-2 px-2 border outline-none rounded"
                            />
                        </div>
                        <div className="mt-3 flex justify-center">
                            <button
                                type="submit"
                                className="font-semibold border px-5 py-2 rounded border-primary bg-primary text-white hover:text-primary hover:bg-white"
                            >
                                Reset password
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-col gap-2">
                        <label
                            htmlFor="email-address-to-reset-password"
                            className="text-secondary"
                        >
                            Email address
                        </label>
                        <div className="flex gap-2">
                            <input
                                onChange={handleChange}
                                type="email"
                                required
                                id="email-address-to-reset-password"
                                className="w-full py-2 px-2 border outline-none rounded"
                            />
                            <button
                                type="submit"
                                className="font-semibold border px-2 rounded border-primary bg-primary text-white hover:text-primary hover:bg-white"
                            >
                                Send
                            </button>
                        </div>
                        <div className="mt-3 text-secondary">
                            Verification code
                        </div>
                        <div className="flex justify-center">
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                renderSeparator={<span>-</span>}
                                renderInput={(props) => <input {...props} />}
                                inputStyle={{
                                    width: "40px",
                                    height: "40px",
                                    fontSize: "24px",
                                    margin: "0 5px",
                                    textAlign: "center",
                                    border: "2px solid #ddd",
                                    borderRadius: "5px",
                                    color: "#3795BD",
                                }}
                            />
                        </div>
                        <div className="mt-3 flex justify-center">
                            <button
                                type="button"
                                onClick={handleVerificationCode}
                                className="font-semibold border px-5 py-2 rounded border-primary bg-primary text-white hover:text-primary hover:bg-white"
                            >
                                Verification code
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
