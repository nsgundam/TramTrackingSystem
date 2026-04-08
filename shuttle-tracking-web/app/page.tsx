"use client";

import dynamic from "next/dynamic";
import "./shuttle-tracker.css";

const ShuttleTracker = dynamic(() => import("@/components/public/ShuttleTracker"), {
  ssr: false,
});

export default function PublicTrackingPage() {
  return (
    <main className="public-tracker-page">
      <ShuttleTracker />
    </main>
  );
}
