import React from "react";

export default function LoadingGroup() {
    return (
        <div className="bg-white rounded-lg">
            <div className="w-full h-[150px] md:h-[200px] bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-t-lg" />
            <div className="py-3 px-2">
                <div className="flex gap-3 items-center h-6 w-24 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                <div className="flex gap-3">
                    <div className="flex gap-1 items-center mt-3 h-4 w-24 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                    <div className="flex gap-1 items-center mt-3 h-4 w-24 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                </div>
            </div>
            <div className="py-3 border-t px-2 text-center" />
        </div>
    );
}
