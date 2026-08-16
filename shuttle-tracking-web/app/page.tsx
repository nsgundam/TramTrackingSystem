"use client";

import dynamic from "next/dynamic";
import "./shuttle-tracker.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const ShuttleTracker = dynamic(() => import("@/components/public/ShuttleTracker"), {
  ssr: false,
});

export default function PublicTrackingPage() {
  return (
    <LanguageProvider>
      <main className="public-tracker-page">
        <ShuttleTracker />
      </main>
    </LanguageProvider>
  );
}
