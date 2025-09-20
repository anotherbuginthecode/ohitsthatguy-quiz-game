export function trackNewGame(
  tracker: any,
  event_name: string,
  params?: Record<string, any>
) {
  tracker.trackEvent(event_name, params);
}
