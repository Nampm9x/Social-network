"use client"

import React from "react"

export default function LoadingGroupDetail () {
    return (
        <>
        <div className="bg-white rounded-lg">
                        <div
                            className="w-full h-[150px] md:h-[200px] bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 border-b rounded-t-lg"
                        />
                        <div className="py-3 pr-2 px-2">
                            <div className="flex gap-3 items-center">
                                <div className="rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-4 w-24" />
                                    <button
                                        className="rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-10 w-24"
                                    />
                            </div>
                            <div className="flex gap-1 items-center mt-3">
                                    <div className="rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-2 w-12"/>
                            </div>
                        </div>
                            <div className="py-3 px-2">
                                <div className="rounded bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-24 w-full"/>
                            </div>
                        <div>
                    </div>
                    <div className="mx-2 mt-2 h-8 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    <div className="mx-2 mt-2 h-8 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    <div className="mx-2 mt-2 h-8 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    <div className="mx-2 mt-2 h-8 bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    </div>
        </>
    )
}