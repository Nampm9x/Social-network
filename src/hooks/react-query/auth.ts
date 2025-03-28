import { login, logout, resendCodeRegister } from "@/redux/features/auth/api";
import { IUserS } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => login(email, password),
        onSuccess: (res: any) => {
            queryClient.setQueryData(["current-user"], (oldData: IUserS) => {
                if (oldData) {
                    return {
                        name: res.data.rest.name,
                        username: res.data.rest.username,
                        email: res.data.rest.email,
                        profilePicture: res.data.rest.profilePicture,
                    };
                }
            });
        },
    });
};

export const useResendCodeRegister = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ email }: { email: string }) => resendCodeRegister(email),
        onSuccess: ()  => {
            
        }
    });
};
