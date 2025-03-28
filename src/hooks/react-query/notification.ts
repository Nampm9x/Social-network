import {
    deleteAllNotifications,
    getNotifications,
    markReadNotification,
    readAllNotification,
} from "@/redux/features/notification/api";
import { INotification } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMarkReadNotification = (
    notificationId: string,
    userId: string
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => markReadNotification(notificationId),
        onSuccess: () => {
            queryClient.setQueryData(
                ["notifications", userId],
                (oldNotifications: INotification[]) => {
                    if (oldNotifications) {
                        return oldNotifications.map((notification) => {
                            if (notification._id === notificationId) {
                                return { ...notification, read: true };
                            }
                            return notification;
                        });
                    }
                }
            );
        },
    });
};

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: () => {
            return getNotifications();
        },
        retry: 1,
        enabled: true,
        staleTime: 1000 * 60 * 60,
    });
};

export const useReadAllNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => readAllNotification(),
        onSuccess: () => {
            queryClient.setQueryData(
                ["notifications"],
                (oldNotifications: INotification[]) => {
                    if (oldNotifications) {
                        return oldNotifications.map((notification) => {
                            return { ...notification, read: true };
                        });
                    }
                    return [];
                }
            );
        },
    });
};

export const useDeleteAllNotifications = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => deleteAllNotifications(),
        onSuccess: () => {
            queryClient.setQueryData(["notifications"], []);
        },
    });
};
