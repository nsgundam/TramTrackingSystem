"use client";

interface AppLockOverlayProps {
  locked: boolean;
}

export default function AppLockOverlay({ locked }: AppLockOverlayProps) {
  if (!locked) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, cursor: "wait", touchAction: "none" }}
      onTouchStart={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    />
  );
}