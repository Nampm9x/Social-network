import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReduxProvider from "@/redux/user/ReduxProvider";
import dynamic from "next/dynamic";
import "simplebar-react/dist/simplebar.min.css";
import "swiper/css";
import "swiper/css/pagination";
import { TanStackReactQueryProvider } from "@/tanStackQueryProvider";
import ScrollRestoration from "@/ScrollToSavePosition";

const PrivateRoute = dynamic(() => import("@/components/PrivateRoute"), {
    ssr: false,
});

export const metadata: Metadata = {
    title: "Sleepant",
    description: "Sleepant social network",
    icons: "/favicon.png",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased bg-third`} id="main-body">
                <ReduxProvider>
                    <TanStackReactQueryProvider>
                        <PrivateRoute>
                            <Header />
                            <ScrollRestoration />
                            <div className="pt-20 xl:pt-24 px-4 xl:px-44">
                                {children}
                            </div>
                            <ToastContainer />
                        </PrivateRoute>
                    </TanStackReactQueryProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
