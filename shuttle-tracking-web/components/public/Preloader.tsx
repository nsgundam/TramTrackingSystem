"use client";
import { memo } from "react";

interface PreloaderProps {
  show: boolean;
  isFinished: boolean;
}

function Preloader({ show, isFinished }: PreloaderProps) {
  if (!show) return null;

  return (
    <div className={`preloader-overlay ${isFinished ? "fade-out" : ""}`}>
      <div className="loader-logo" />
      <div className="loader"></div>
    </div>
  );
}

export default memo(Preloader);