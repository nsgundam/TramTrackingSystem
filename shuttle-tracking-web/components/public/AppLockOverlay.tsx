"use client";
import { memo } from "react";

interface AppLockOverlayProps {
  locked: boolean;
}

function AppLockOverlay({ locked }: AppLockOverlayProps) {
  if (!locked) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, cursor: "wait", touchAction: "none" }}
      onTouchStart={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    />
  );
}

export default memo(AppLockOverlay);