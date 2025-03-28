"use client";

import { BiSolidMessageRounded } from "react-icons/bi";
import { IUser, IUserS } from "@/types/user";
import Link from "next/link";
import { useGetConversationByUserId } from "@/hooks/react-query/message";
import { useRouter } from "next/navigation";

export default function Friend({
    friend,
    currentUser,
}: {
    friend: IUserS;
    currentUser: IUserS;
}) {
    const { data: conversation, isLoading: isLoadingConversation } =
        useGetConversationByUserId(currentUser?._id, friend);
        const router = useRouter();

        const handleMessage = () => {
            router.push(`/messages/${conversation?._id}`);
        }
    return (
        <div>
            <div className="border p-4 rounded-lg">
                <Link
                    href={`/profile/${friend.username}`}
                    className="flex justify-center"
                >
                    <img
                        src={friend.profilePicture}
                        alt=""
                        className="rounded-full w-14 h-14 lg:w-24 lg:h-24"
                    />
                </Link>
                <Link
                    href={`/profile/${friend.username}`}
                    className="flex justify-center"
                >
                    <p className="mt-2 text-sm lg:text-base font-semibold text-center hover:text-primary">
                        {friend.name}
                    </p>
                </Link>
                <div className="mt-2 flex justify-center gap-1 lg:gap-2">
                    <button onClick={handleMessage} className="bg-primary rounded text-sm lg:text-base py-1 px-5 lg:px-8 border text-white hover:text-primary hover:bg-white">
                        <BiSolidMessageRounded />
                    </button>
                </div>
            </div>
        </div>
    );
}
