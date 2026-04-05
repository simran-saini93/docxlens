/**
 * Umami analytics — safe wrapper around window.umami.track()
 * Never throws, never blocks the app.
 * Replace YOUR_UMAMI_ID in layout.jsx to activate.
 */
export function track(eventName, data = {}) {
  try {
    if (typeof window === 'undefined') return
    if (!window.umami) return
    window.umami.track(eventName, data)
  } catch (_) {
    // analytics must never break the app
  }
}
