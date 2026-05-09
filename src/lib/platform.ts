/**
 * Platform detection utilities.
 * Evaluated once at module init using userAgent (navigator.platform is deprecated).
 */

/** True when running on macOS. */
export const isMac: boolean = navigator.userAgent.includes('Mac')
