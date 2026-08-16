"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "@/app/shuttle-tracker.css";
import { useShuttleTracker } from "@/hooks/useShuttleTracker";
import { getPublicAvailabilityReason } from "@/utils/truthful-ui-state";

import BrandingHeader from "@/components/public/BrandingHeader";
import AvailabilityCard from "@/components/public/AvailabilityCard";
import RouteSelector from "@/components/public/RouteSelector";
import FeedbackButton from "@/components/public/FeedbackButton";
import LanguageSelector from "@/components/public/LanguageSelector";
import BottomDock from "@/components/public/BottomDock";
import MapControls from "@/components/public/MapControls";
import Preloader from "@/components/public/Preloader";
import AppLockOverlay from "@/components/public/AppLockOverlay";

// Code-split heavy interactive components to make the initial page load extremely fast
const AppTour = dynamic(() => import("@/components/public/AppTour"), {
  ssr: false,
});

const FeedbackModal = dynamic(() => import("@/components/public/FeedbackModal"), {
  ssr: false,
});

export default function ShuttleTracker() {
  const {
    routes,
    selectedRoute,
    vehicleStateCounts,
    realtimeConnectionState,
    hasAuthoritativeVehicleState,
    vehicleSnapshotState,
    lastCanonicalUpdateAt,
    isVehicleStateRetrying,
    targetStop,
    realEta,
    isAppLocked,
    selectedVehicleId,
    activeVehicleInfo,
    isTracking,
    stopsByRoute,
    isFeedbackOpen,
    feedbackVehicleId,
    vehicleNames,
    deferredPrompt,
    showPreloader,
    isIntroFinished,
    isPreloaderTakingLong,
    isRouteMenuOpen,
    routeMenuRef,
    mapRef,
    configuredBackendOrigin,
    handleRouteChange,
    handleLocateUser,
    handleRecenter,
    handleOpenFeedback,
    handleRetryVehicleState,
    handleInstallClick,
    setIsRouteMenuOpen,
    setIsFeedbackOpen,
  } = useShuttleTracker();

  const availabilityReason = getPublicAvailabilityReason({
    counts: vehicleStateCounts,
    connectionState: realtimeConnectionState,
    hasAuthoritativeState: hasAuthoritativeVehicleState,
    snapshotState: vehicleSnapshotState,
  });

  // Prevent downloading/rendering the tour React Joyride code chunk for returning users
  const [shouldShowTour, setShouldShowTour] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenTour = localStorage.getItem("rsu-bus-tour-seen");
      if (!hasSeenTour) {
        // Defer to next microtask queue to avoid cascading render warning in React Compiler
        Promise.resolve().then(() => {
          setShouldShowTour(true);
        });
      }
    }
  }, []);

  // Stable callbacks defined at component-level to conform to Rules of Hooks and optimize child rendering
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, [mapRef]);

  const handleToggleRouteMenu = useCallback(() => {
    setIsRouteMenuOpen((prev) => !prev);
  }, [setIsRouteMenuOpen]);

  const handleFeedbackClick = useCallback(() => {
    handleOpenFeedback(selectedVehicleId);
  }, [handleOpenFeedback, selectedVehicleId]);

  const handleCloseFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
  }, [setIsFeedbackOpen]);

  return (
    <div className="h-dvh w-screen overflow-hidden font-body-sm text-on-surface bg-surface map-bg relative select-none">
      <Preloader
        show={showPreloader}
        isFinished={isIntroFinished}
        isTakingLong={isPreloaderTakingLong}
      />
      <AppLockOverlay locked={isAppLocked} />

      <div
        className={`w-full h-full relative z-0 transition-all duration-700 ${
          showPreloader ? "map-blur-effect" : ""
        }`}
      >
        <div id="rsu-map" className="w-full h-full absolute inset-0 z-0" />

        {/* Top Left: Branding */}
        <BrandingHeader />

        {/* Top Right: Status & Toggles */}
        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-10 flex w-[152px] flex-col items-stretch gap-3 sm:w-40 md:w-45">
          <AvailabilityCard
            counts={vehicleStateCounts}
            connectionState={realtimeConnectionState}
            hasAuthoritativeState={hasAuthoritativeVehicleState}
            snapshotState={vehicleSnapshotState}
            lastCanonicalUpdateAt={lastCanonicalUpdateAt}
            isRetrying={isVehicleStateRetrying}
            onRetry={handleRetryVehicleState}
          />
          <RouteSelector
            routes={routes}
            selectedRoute={selectedRoute}
            isOpen={isRouteMenuOpen}
            onToggle={handleToggleRouteMenu}
            onSelect={handleRouteChange}
            menuRef={routeMenuRef}
          />
          <FeedbackButton onClick={handleFeedbackClick} />
          <LanguageSelector />
        </div>

        {/* Bottom Left: Info Cards */}
        <BottomDock
          selectedVehicleId={selectedVehicleId}
          activeVehicleInfo={activeVehicleInfo}
          vehicleName={vehicleNames[selectedVehicleId || ""]}
          stopsByRoute={stopsByRoute[selectedRoute] || []}
          selectedRoute={selectedRoute}
          isTracking={isTracking}
          targetStop={targetStop}
          realEta={realEta}
          availabilityReason={availabilityReason}
          onRecenter={handleRecenter}
          onFeedbackClick={handleOpenFeedback}
        />

        {/* Bottom Right: Map Controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocateUser}
        />
      </div>

      {!showPreloader && shouldShowTour && (
        <AppTour
          onInstallClick={handleInstallClick}
          isPwaAvailable={!!deferredPrompt}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={handleCloseFeedback}
          initialVehicleId={feedbackVehicleId}
          apiOrigin={configuredBackendOrigin}
        />
      )}
    </div>
  );
}
