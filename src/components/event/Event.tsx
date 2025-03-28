"use client";

import React from "react";
import { IEvent } from "@/types/event";
import Link from "next/link";
import { FaEye } from "react-icons/fa";

export default function Event({
    event,
    event_id,
}: {
    event: IEvent;
    event_id: string;
}) {
    return (
        <Link
            href={`/events/${event._id}`}
            className={`rounded-lg opacity-100 hover:opacity-60 ${
                event._id === event_id ? "opacity-60" : ""
            } relative`}
        >
            <img
                src={event.image}
                alt="event"
                className="w-full aspect-square object-cover rounded-lg"
            />
            {event_id === event._id && (
                <div className="absolute top-0 font-semibold w-full h-full flex items-center justify-center opacity-60">
                    <FaEye className="text-4xl" />
                </div>
            )}
        </Link>
    );
}
