"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

export default function FaviconUpdater() {
  useEffect(() => {
    // Fetch organization settings silently on load
    api.get("/organization/")
      .then((data) => {
        if (data.logo_url) {
          const fileURL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${data.logo_url}`;
          
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = fileURL;
        }
      })
      .catch((e) => {
        // Silently ignore if organization hasn't been set up yet or API fails
        console.warn("Favicon updater failed to fetch organization. Using default.", e);
      });
  }, []);

  return null; // This component does not render any visible UI
}
