"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollRestoration = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tìm container SimpleBar
    const getScrollContainer = () => {
      return document.querySelector(".simplebar-content") as HTMLElement;
    };

    // Lưu vị trí cuộn
    const saveScrollPosition = () => {
      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        const scrollPosition = {
          x: scrollContainer.scrollLeft,
          y: scrollContainer.scrollTop,
        };
        sessionStorage.setItem(`scrollPosition-${pathname}`, JSON.stringify(scrollPosition));
      }
    };

    // Khôi phục vị trí cuộn
    const restoreScrollPosition = () => {
      const scrollContainer = getScrollContainer();
      if (scrollContainer) {
        const savedPosition = sessionStorage.getItem(`scrollPosition-${pathname}`);
        if (savedPosition) {
          const { x, y } = JSON.parse(savedPosition);
          scrollContainer.scrollTo(x, y);
        } else {
          scrollContainer.scrollTo(0, 0);
        }
      }
    };

    // Sự kiện trước khi rời khỏi trang
    window.addEventListener("beforeunload", saveScrollPosition);

    // Khôi phục vị trí khi vào trang
    restoreScrollPosition();

    return () => {
      window.removeEventListener("beforeunload", saveScrollPosition);
    };
  }, [pathname]);

  return null;
};

export default ScrollRestoration;
