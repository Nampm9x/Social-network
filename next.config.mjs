/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",  // Định nghĩa mọi yêu cầu bắt đầu bằng /api/
                destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,  // Địa chỉ đến backend API
            },
        ];
    },
    // Nếu cần, thêm các cấu hình khác tại đây, ví dụ cho CORS, image domains, ...
};

export default nextConfig;
