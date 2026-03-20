"use client";

import { useEffect } from "react";

export default function PWAProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("PWA Service Worker registered with scope: ", registration.scope);
          },
          (err) => {
            console.log("PWA Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
