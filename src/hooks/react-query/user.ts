import {
    changeCoverPhoto,
    changePassword,
    checkExistsUsername,
    editUser,
    followUser,
    getCurrentUser,
    getUser,
    sendVerificationCode,
    searchUsersToSendMessage,
    verificationResetPasswordCode,
    whoToFollow,
    resetPassword,
} from "@/redux/features/user/api";
import { IUser, IUserS } from "@/types/user";
import {
    InvalidateQueryFilters,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
export const useGetUser = (username: string) => {
    return useQuery({
        queryKey: ["user", username],
        queryFn: () => {
            return getUser(username);
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: () => {
            return getCurrentUser();
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60 * 24,
    });
};

export const useFollowUser = (username: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ followId }: { followId: string }) =>
            followUser(followId),

        onSuccess: (updatedData, variable) => {
            queryClient.setQueryData(["user", username], (oldData: IUser) => {
                if (oldData) {
                    return {
                        ...oldData,
                        followers: updatedData.followers,
                        following: updatedData.following,
                        friends: updatedData.friends,
                    };
                }

            });
        },
    });
};

export const useEditUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => editUser(data),

        onSuccess: (newData) => {
            queryClient.setQueryData(["current-user"], (oldData: IUserS) => {
                if (oldData) {
                    return {
                        ...oldData,
                        username: newData.username,
                        profilePicture: newData.profilePicture,
                        name: newData.name,
                    };
                }
            });
            queryClient.setQueryData(["user", newData.username], newData);
        },
    });
};

export const useSearchUsersToSendMessage = (query: string, userId: string) => {
    return useQuery({
        queryKey: ["search-users-to-send-message", query, userId],
        queryFn: () => {
            return searchUsersToSendMessage(query, userId);
        },
        retry: 1,
        enabled: !!query,
    });
};

export const useWhoToFollow = () => {
    return useQuery({
        queryKey: ["who-to-follow"],
        queryFn: () => {
            return whoToFollow();
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60 * 24,
    });
};

export const useChangeCoverPhoto = (username: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ coverPhoto }: { coverPhoto: string }) =>
            changeCoverPhoto(coverPhoto),
        onSuccess: (updatedData: string) => {
            queryClient.setQueryData(["user", username], (oldData: IUser) => {
                return { ...oldData, coverPicture: updatedData };
            });
        },
    });
};

export const useCheckExistsUsername = (
    username: string,
    editProfileModalIsOpen: boolean
) => {
    return useQuery({
        queryKey: ["exists-username", username],
        queryFn: () => {
            return checkExistsUsername(username);
        },
        retry: 1,
        enabled: !!username && editProfileModalIsOpen,
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({
            oldPassword,
            newPassword,
            confirmNewPassword,
        }: {
            oldPassword: string;
            newPassword: string;
            confirmNewPassword: string;
        }) => changePassword(oldPassword, newPassword, confirmNewPassword),
    });
};

export const useSendVerificationCode = () => {
    return useMutation({
        mutationFn: ({ email }: { email: string }) =>
            sendVerificationCode(email),
    });
};

export const useVerificationResetPasswordCode = () => {
    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) =>
            verificationResetPasswordCode(email, otp),
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => resetPassword(email, password),
    });
};
