"use client";

import { IUserS, IUser } from "@/types/user";
import User from "@/components/home/User";
import SimpleBar from "simplebar-react";

export default function WhoToFollow({
    users,
    currentUser,
}: {
    users: IUserS[];
    currentUser: IUserS;
}) {
    return (
        <SimpleBar className="p-2 h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] w-full overflow-y-auto">
            <div className="text-secondary font-semibold mb-3">
                Who to follow
            </div>
            <div className="flex flex-wrap">
                {users?.map((user) => (
                    <div className="mb-2 w-[50%]" key={user._id}>
                        <User user={user} currentUser={currentUser} />
                    </div>
                ))}
            </div>
        </SimpleBar>
    );
}
