import React from "react";

export default function LoadingEvents() {
    return (
        <div role="status" className="flex flex-wrap p-2 animate-pulse">
            <div className="w-1/2 aspect-square border border-third bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            <div className="w-1/2 aspect-square border border-third bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            <div className="w-1/2 aspect-square border border-third bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            <div className="w-1/2 aspect-square border border-third bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
    );
}
