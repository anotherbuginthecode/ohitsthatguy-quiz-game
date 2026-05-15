// utils/retentionTracker.ts
import { v4 as uuidv4 } from "uuid";
import { GoogleAnalyticsTracker } from "@keiko-app/react-google-analytics";

// Inizializza user anonimo e data primo accesso
export function initUser() {
  let anonymousId = localStorage.getItem("anonymousId");
  let installDate = localStorage.getItem("installDate");

  if (!anonymousId) {
    anonymousId = uuidv4();
    installDate = new Date().toISOString();
    localStorage.setItem("anonymousId", anonymousId);
    localStorage.setItem("anonymous_device", "device_" + anonymousId);
    localStorage.setItem("installDate", installDate);
  }

  return {
    anonymousId,
    installDate: new Date(installDate as string),
    deviceUUID: localStorage.getItem("anonymous_device"),
  };
}

// Calcola differenza giorni
function daysBetween(date1: Date, date2: Date) {
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Giorni che vuoi tracciare come retention
const retentionDays = [1, 3, 7, 14];

export function trackRetention(tracker: GoogleAnalyticsTracker) {
  const { anonymousId, installDate, deviceUUID } = initUser();
  const today = new Date();
  const daysSince = daysBetween(installDate, today);

  if (retentionDays.includes(daysSince)) {
    sendAnalyticsEvent(tracker, `retention_d${daysSince}`, { anonymousId });
  }

  return { anonymousId, deviceUUID };
}

// Mock invio evento a GA4
export function sendAnalyticsEvent(
  tracker: GoogleAnalyticsTracker,
  eventName: string,
  params: Record<string, any>
) {
  if (!import.meta.env.DEV) {
    tracker.trackEvent(eventName, params);
  } else {
    console.log("Event:", eventName, params);
  }
}
