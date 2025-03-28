"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

export default function Loading({ size }: { size: number }) {
    return (
        <div className="flex justify-center items-center">
            <ClipLoader color="blue" size={size} />
        </div>
    );
}
