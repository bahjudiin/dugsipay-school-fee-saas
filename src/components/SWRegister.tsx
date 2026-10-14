"use client";

import { useEffect } from "react";

/** Registers the service worker in production — enables offline shell + asset caching. */
export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement — never break the app over it.
    });
  }, []);
  return null;
}
