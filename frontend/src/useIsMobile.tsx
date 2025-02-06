import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Use navigator.userAgent or matchMedia for mobile detection
      const isMobileDevice =
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
          navigator.userAgent
        ) || window.matchMedia("(max-width: 768px)").matches;

      setIsMobile(isMobileDevice);
    };

    checkMobile();

    // Optionally, add a resize listener to dynamically check screen size
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
};
