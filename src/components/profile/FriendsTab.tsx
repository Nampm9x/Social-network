"use client";

import { IUser, IUserS } from "@/types/user";
import Friend from "@/components/profile/Friend";

export default function FriendsTab({
    currentUser,
    user,
}: {
    currentUser: IUserS;
    user: IUser;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {user?.friends.length > 0 ? (
                user?.friends.map((friend) => (
                    <div className="mb-3 w-[175px]" key={friend._id}>
                        <Friend friend={friend} currentUser={currentUser} />
                    </div>
                ))
            ) : (
                <div className="bg-white py-4 lg:py-8 px-2 text-center font-semibold mt-4 lg:mt-8">
                    No friends to show
                </div>
            )}
        </div>
    );
}
