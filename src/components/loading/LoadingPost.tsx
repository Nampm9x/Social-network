import React from "react";

export default function LoadingPost() {
    return (
        <>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-24 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                            <div className="h-2 w-24 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                            <div className="h-2 w-24 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        </div>
                </div>
            </div>
            <div className="gap-5 items-center mt-2 px-2">
                <div className="pb-3 h-4 w-48 rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 mb-3" />
                <div className="w-full h-[300px] sm:h-[350px] rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            </div>
            <div className="flex justify-between gap-1 mt-1 px-2">
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                        />
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                        />
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                        />
                    </div>
                    <div className="flex mt-1 px-2">
                        <div className="items-center w-10 h-10 aspect-square rounded-full bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        <div className="w-full px-2 ml-3 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    </div>
        </>
    );
}
