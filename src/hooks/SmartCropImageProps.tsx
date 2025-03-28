import SmartCrop from "smartcrop";

export const handleFileChange = async (
    srcImage: string,
    widthImage: number,
    heightImage: number
): Promise<string | null> => {
    try {
        const response = await fetch(srcImage);
        if (!response.ok) throw new Error(`Không thể tải ảnh: ${response.statusText}`);

        const blob = await response.blob();

        const imageSrc = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        const img = new Image();
        img.src = imageSrc;

        return new Promise((resolve, reject) => {
            img.onload = async () => {
                try {
                    const cropResult = await SmartCrop.crop(img, { width: widthImage, height: heightImage });
                    const { x, y, width, height } = cropResult.topCrop;

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    canvas.width = widthImage;
                    canvas.height = heightImage;

                    if (ctx) {
                        ctx.drawImage(img, x, y, width, height, 0, 0, widthImage, heightImage);
                        resolve(canvas.toDataURL());
                    } else {
                        reject(new Error("Canvas context không khả dụng"));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Không thể load hình ảnh"));
        });
    } catch (err) {
        console.error("Lỗi khi xử lý ảnh:", err);
        return null;
    }
};
