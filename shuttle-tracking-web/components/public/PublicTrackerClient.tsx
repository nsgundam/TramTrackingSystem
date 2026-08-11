"use client";

import dynamic from "next/dynamic";
import { LanguageProvider } from "@/contexts/LanguageContext";

const ShuttleTracker = dynamic(() => import("@/components/public/ShuttleTracker"), {
  ssr: false,
});

export default function PublicTrackerClient() {
  return (
    <div className="public-tracker-client-root">
      <LanguageProvider>
        <ShuttleTracker />
      </LanguageProvider>
    </div>
  );
}
