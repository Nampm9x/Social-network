"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Event from "@/components/profile/Event";
import ListEvents from "@/components/event/ListEvents";
import { useGetEvent, useGetEvents } from "@/hooks/react-query/event";
import { useGetCurrentUser } from "@/hooks/react-query/user";
import io from "socket.io-client";
import Loading from "@/components/loading/Loading";

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);

export default function page() {
    const { event_id } = useParams() as { event_id: string };
    const { data: event, isLoading: isLoadingEvent } = useGetEvent(event_id);
    const { data: currentUser, isLoading: isLoadingCurrentUser } =
        useGetCurrentUser();
    const { data: events, isLoading: isLoadingEvents } = useGetEvents(
        event?.owner?._id || ""
    );

    useEffect(() => {
        if (!currentUser || !currentUser._id) {
            return;
        }

        socket.emit("onlineUsers", currentUser);

        return () => {
            socket.off("onlineUsers");
        };
    }, [currentUser]);

    return (
        <div className="md:flex gap-4 xl:gap-8 mb-4 lg:mb-8 justify-center">
            {/* <div className="w-full md:w-1/3 bg-white h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg">
                {isLoadingEvents && <Loading size={20} />}
                {events && events.length > 0 && (
                    <ListEvents events={events} event_id={event_id} />
                )}
            </div> */}
            <div
                className={`w-full hidden md:block md:w-2/3 bg-white h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] overflow-y-auto rounded-lg`}
            >
                {isLoadingEvent && (
                    <div className="w-full h-full flex justify-center items-center">
                        <Loading size={25} />
                    </div>
                )}
                {event && event.title && (
                    <Event event={event} currentUser={currentUser} />
                )}
            </div>
        </div>
    );
}
