"use client";

import { IUser, IUserS } from "@/types/user";
import Friend from "@/components/profile/Friend";

export default function Friends({
    user,
    currentUser,
    friends,
    setNavigation,
}: {
    user: IUser;
    currentUser: IUserS;
    friends: IUserS[];
    setNavigation: (value: string) => void;
}) {

    return (
        <div className="bg-white rounded-lg mt-4 lg:mt-8 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Friends</h2>
                    <span className="secondary text-sm bg-third px-1 rounded">
                        {friends?.length}
                    </span>
                </div>
            </div>
            <div className="flex flex-wrap justify-between mt-3">
                {friends &&
                    friends.slice(0, 4).map((friend) => (
                        <div className="mb-3 w-[48%]" key={friend._id}>
                            <Friend friend={friend} currentUser={currentUser} />
                        </div>
                    ))}
            </div>
        </div>
    );
}
