import React from "react";

export default function LoadingProfile() {
    return (
        <div className="bg-white rounded-lg h-h-[calc(100vh-64px-32px)] lg:h-[calc(100vh-64px-64px)] w-full">
            <div
                className={`h-32 sm:h-40 md:h-48 rounded-tl-lg bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200`}
            />
            <div className="sm:flex justify-between px-4 items-center">
                <div className="sm:flex gap-2">
                    <div className="-mt-10 flex justify-center sm:block">
                        <div className="w-24 h-24 border rounded-full bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                    </div>
                    <div className="mt-2">
                        <div className="flex justify-center sm:block">
                            <p className="font-semibold w-48 h-6 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        </div>
                        <div className="flex gap-2 items-center justify-center sm:justify-start mt-3">
                            <div className="bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 w-16 h-2" />
                            <div className="bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 w-16 h-2" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-center sm:start mt-3 sm:mt-0">
                    <div className="flex gap-2 items-center">
                        <div className="w-14 h-6 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        <div className="bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-14 h-6" />
                    </div>
                </div>
            </div>
            <div className="flex gap-2 items-center mt-10 px-2">
                <div className="w-14 h-14 aspect-square rounded-full bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                <div className="w-full h-6 p-2 rounded-full bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            </div>
            <div className="flex gap-5 mt-3 items-center px-2">
                <button className="bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-10 w-24 rounded-md" />
                <button className="bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-10 w-24 rounded-md" />
            </div>
        </div>
    );
}
