"use client";

import React from "react";
import { IEvent } from "@/types/event";
import Event from "./Event";

export default function ListEvents({
    events,
    event_id,
}: {
    events: IEvent[];
    event_id: string;
}) {
    return (
        <>
            <div className="flex flex-wrap p-2">
                {events &&
                    events.length > 0 &&
                    events.map((event) => (
                        <div
                            key={event._id}
                            className="w-1/2 border rounded-lg"
                        >
                            <Event event={event} event_id={event_id} />
                        </div>
                    ))}
            </div>
        </>
    );
}
