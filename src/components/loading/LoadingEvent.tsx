import React from "react";

export default function LoadingEvent() {
    return (
            <>
                <div role="status" className="animate-pulse p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="h-2 w-44 rounded bg-gray-200" />
                        </div>
                    </div>
                    <div className="flex gap-2 lg:gap-5 items-center mt-2 pb-4">
                        <div className="w-[75px] md:w-[100px] xl:w-[150px] aspect-square rounded-lg object-cover">
                            <div className="w-full h-full rounded-lg bg-gray-200" />
                        </div>
                        <div>
                            <div className="w-44 h-4 bg-gray-200 rounded" />
                            <div className="md:flex my-2 items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 bg-gray-200 w-24 rounded h-2" />
                                <div className="flex gap-3 mt-1 md:mt-0">
                                    <div className="flex items-center gap-1 h-2 w-24 bg-gray-200 rounded" />
                                    <div className="flex items-center gap-1 h-2 w-24 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between border-y gap-1 mt-3">
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 rounded"
                        />
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 rounded"
                        />
                        <button
                            type="button"
                            className="py-3  w-1/3 h-10 bg-gray-200 rounded"
                        />
                    </div>
                    <div className="flex mt-3">
                        <div className="items-center w-10 h-10 rounded-full bg-gray-200" />
                        <div className="w-full px-2 ml-3 bg-gray-200 rounded" />
                    </div>
                </div>
            </>
    );
}
