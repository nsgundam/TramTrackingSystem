"use client";

interface PreloaderProps {
  show: boolean;
  isFinished: boolean;
}

export default function Preloader({ show, isFinished }: PreloaderProps) {
  if (!show) return null;

  return (
    <div className={`preloader-overlay ${isFinished ? "fade-out" : ""}`}>
      <div className="loader-logo" />
      <div className="loader"></div>
    </div>
  );
}