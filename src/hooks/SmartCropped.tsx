"use client";

import React, { useState, useEffect } from "react";
import { handleFileChange } from "@/hooks/SmartCropImageProps";

const ImageCropper = ({ srcImage, widthImage, heightImage, rounded }: { srcImage: string, widthImage: number, heightImage: number, rounded: string }) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const cropImage = async () => {
        try {
            const result = await handleFileChange(srcImage, widthImage, heightImage);
            setCroppedImage(result);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi cắt ảnh:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAndCropImage = async () => {
            await cropImage();
        };
        fetchAndCropImage();
    }, [srcImage, widthImage, heightImage]);

    return (
        <>
            {
                !loading && (
                    <div>
                        {croppedImage ? (
                            <img loading="lazy" src={croppedImage} className={`w-[${widthImage}px] h-[${heightImage}px] rounded-${rounded}`} />
                        ) : (
                            <div className={`w-[${widthImage}px] h-[${heightImage}px] rounded-${rounded}`} >
                            </div>
                        )}
                    </div>
                )
            }
        </>
    );
};

export default ImageCropper;