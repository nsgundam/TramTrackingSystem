import "./shuttle-tracker.css";
import PublicTrackerClient from "@/components/public/PublicTrackerClient";

export default function PublicTrackingPage() {
  return (
    <main className="public-tracker-page">
      <PublicTrackerClient />
      <noscript>
        <p className="public-tracker-noscript">
          กรุณาเปิดใช้งาน JavaScript เพื่อดูตำแหน่งรถแบบเรียลไทม์บนแผนที่
        </p>
      </noscript>
    </main>
  );
}
