import { useEffect, useState } from "react";

/**
 * Reads the current browser window width and height in a safe way for server-rendered code.
 *
 * Use for:
 * - Initializing responsive state with the current window size
 * - Reusing a shared window-size snapshot in client hooks
 *
 * @param none - This function does not accept any arguments
 * @returns An object containing the current `width` and `height`, or zeroes during server rendering
 */
function getWindowDimensions() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const { innerWidth: width, innerHeight: height } = window;

  return {
    width,
    height,
  };
}

/**
 * Tracks the current browser window dimensions and updates them when the window is resized.
 *
 * Use for:
 * - Rendering responsive UI based on live viewport size
 * - Reading width and height values inside client components without manual event wiring
 *
 * @param none - This hook does not accept any arguments
 * @returns An object containing the current window `width` and `height`
 */
export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(() =>
    getWindowDimensions()
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};
