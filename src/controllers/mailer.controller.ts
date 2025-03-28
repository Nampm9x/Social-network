import { NextFunction, Response } from "express";
import crypto from "crypto";
import { sendCodeRegister, sendCodeResetPassword } from "../mailers/index";
import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import { LocalStorage } from "node-localstorage";
import { CustomRequest } from "../utils/verifyUser";

export const registerCode = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { email, name } = req.body;
    const localStoragePath = "./src/scratch";
    const localStorage = new LocalStorage(localStoragePath);
    const verificationCode = crypto.randomInt(100000, 999999);

    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(errorHandler(400, "User already exists"));
    }

    const otpData = localStorage.getItem(`otpData_register_${email}`);
    if (otpData) {
        const parsedOtpData = JSON.parse(otpData);
        const now = new Date();

        if (
            parsedOtpData.email === email &&
            parsedOtpData.expiry > now.getTime()
        ) {
            return next(
                errorHandler(
                    400,
                    "Please wait for 3 minutes before requesting another code"
                )
            );
        }
    }

    const saveOtpWithExpiry = () => {
        const now = new Date();
        const otpObject = {
            otp: verificationCode,
            email: email,
            expiry: now.getTime() + 3 * 60 * 1000,
        };
        localStorage.setItem(
            `otpData_register_${email}`,
            JSON.stringify(otpObject)
        );
    };

    const deleteDataAfterExpiry = () => {
        setTimeout(() => {
            localStorage.removeItem(`otpData_register_${email}`);
        }, 3 * 60 * 1000);
    };

    saveOtpWithExpiry();
    deleteDataAfterExpiry();

    try {
        await sendCodeRegister(
            email,
            "Account registration verification code",
            "registerTemplate",
            { name, otp: verificationCode }
        );
        res.status(200).json({ message: "Verification code sent" });
    } catch (error) {
        next(error);
    }
};

export const forgotPasswordCode = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;
    const localStoragePath = "./src/scratch";
    const localStorage = new LocalStorage(localStoragePath);
    const verificationCode = crypto.randomInt(100000, 999999);

    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(errorHandler(400, "User not found"));
    }

    const otpData = localStorage.getItem(`otpData_resetPassword_${email}`);
    if (otpData) {
        const parsedOtpData = JSON.parse(otpData);
        const now = new Date();

        if (
            parsedOtpData.email === email &&
            parsedOtpData.expiry > now.getTime()
        ) {
            return next(
                errorHandler(
                    400,
                    "Please wait for 3 minutes before requesting another code"
                )
            );
        }
    }

    const saveOtpWithExpiry = () => {
        const now = new Date();
        const otpObject = {
            otp: verificationCode,
            email: email,
            expiry: now.getTime() + 3 * 60 * 1000,
        };
        localStorage.setItem(
            `otpData_resetPassword_${email}`,
            JSON.stringify(otpObject)
        );
    };

    const deleteDataAfterExpiry = () => {
        setTimeout(() => {
            localStorage.removeItem(`otpData_resetPassword_${email}`);
        }, 3 * 60 * 1000);
    };

    saveOtpWithExpiry();
    deleteDataAfterExpiry();

    try {
        await sendCodeResetPassword(
            email,
            "Password reset verification code",
            "resetPasswordTemplate",
            { name: userExist.name, otp: verificationCode }
        );
        res.status(200).json({ message: "Verification code sent" });
    } catch (error) {
        next(error);
    }
};

export const verificationCode = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const { otp, email } = req.body;
    const localStoragePath = "./src/scratch";
    const localStorage = new LocalStorage(localStoragePath);

    const otpData = localStorage.getItem(`otpData_resetPassword_${email}`);
    
    if (otpData) {
        const parsedOtpData = JSON.parse(otpData);
        if (parsedOtpData.otp != otp) {
            return next(errorHandler(400, "Invalid OTP"));
        }
    }

    res.status(200).json({ message: "Verification code is correct" });
};
