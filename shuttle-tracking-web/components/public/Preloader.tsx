"use client";
import { memo } from "react";

interface PreloaderProps {
  show: boolean;
  isFinished: boolean;
  isTakingLong: boolean;
}

function Preloader({ show, isFinished, isTakingLong }: PreloaderProps) {
  if (!show) return null;

  return (
    <div
      className={`preloader-overlay ${isFinished ? "fade-out" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="loader-logo" />
      <div className="loader"></div>
      <span className="sr-only">กำลังเตรียมแผนที่และข้อมูลเส้นทาง</span>
      {isTakingLong && (
        <div className="preloader-slow-message">
          <strong>กำลังใช้เวลานานกว่าปกติ</strong>
          <span>ระบบจะเปิดแผนที่ให้อัตโนมัติ</span>
        </div>
      )}
    </div>
  );
}

export default memo(Preloader);
