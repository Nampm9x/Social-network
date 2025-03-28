"use client";

import React from "react";
import { IUser, IUserS } from "@/types/user";
import { IEvent } from "@/types/event";
import Event from "@/components/profile/Event";

export default function Events({
    events,
    currentUser,
}: {
    events: IEvent[];
    currentUser: IUserS;
}) {
    return (
        <>
            {events.length > 0 ? (
                events.map((event: IEvent) => (
                    <div key={event._id}>
                        <div className="mt-4 lg:mt-8">
                            <Event event={event} currentUser={currentUser} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white py-4 lg:py-8 px-2 text-center font-semibold mt-4 lg:mt-8">
                    No events to show
                </div>
            )}
        </>
    );
}
