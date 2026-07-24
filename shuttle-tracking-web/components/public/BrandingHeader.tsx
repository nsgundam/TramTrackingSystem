"use client";
import { memo } from "react";

function BrandingHeader() {
  return (
    <div className="absolute top-4 left-4 md:top-10 md:left-10 z-10 glass-panel backdrop-blur-sm rounded-full flex items-center gap-2.5 px-4 py-1.5 md:px-6 md:py-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="RSU Logo"
        className="h-9 md:h-11 w-auto object-contain drop-shadow-sm select-none"
        src="/icons/RSU_logo.png"
      />
      <div className="flex flex-col">
        <h1 className="font-headline-md text-[15px] md:text-[18px] text-on-surface leading-tight">
          <span className="hidden sm:inline">Rangsit University</span>
          <span className="sm:hidden">RSU</span>
        </h1>
        <span className="font-body-sm text-[10px] md:text-[12px] text-on-surface-variant leading-none">
          Tram Tracker
        </span>
      </div>
    </div>
  );
}

export default memo(BrandingHeader);