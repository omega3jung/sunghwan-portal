import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Detects whether the current viewport width is below the mobile breakpoint.
 *
 * Use for:
 * - Switching component layouts for mobile screens
 * - Conditionally rendering mobile-specific interactions in client components
 *
 * @param none - This hook does not accept any arguments
 * @returns `true` when the viewport width is smaller than the mobile breakpoint, otherwise `false`
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
