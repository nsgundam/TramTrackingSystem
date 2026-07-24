"use client";
import "leaflet/dist/leaflet.css";
import "@/app/shuttle-tracker.css";
import { useShuttleTracker } from "@/hooks/useShuttleTracker";

import BrandingHeader from "@/components/public/BrandingHeader";
import AvailabilityCard from "@/components/public/AvailabilityCard";
import RouteSelector from "@/components/public/RouteSelector";
import FeedbackButton from "@/components/public/FeedbackButton";
import BottomDock from "@/components/public/BottomDock";
import MapControls from "@/components/public/MapControls";
import Preloader from "@/components/public/Preloader";
import AppLockOverlay from "@/components/public/AppLockOverlay";
import AppTour from "@/components/public/AppTour";
import FeedbackModal from "@/components/public/FeedbackModal";

export default function ShuttleTracker() {
  const {
    routes,
    selectedRoute,
    availableCount,
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
    isRouteMenuOpen,
    routeMenuRef,
    mapRef,
    configuredBackendOrigin,
    handleRouteChange,
    handleLocateUser,
    handleRecenter,
    handleOpenFeedback,
    handleInstallClick,
    setIsRouteMenuOpen,
    setIsFeedbackOpen,
  } = useShuttleTracker();

  return (
    <div className="h-dvh w-screen overflow-hidden font-body-sm text-on-surface bg-surface map-bg relative select-none">
      <Preloader show={showPreloader} isFinished={isIntroFinished} />
      <AppLockOverlay locked={isAppLocked} />

      <div
        className={`w-full h-full relative z-0 transition-all duration-700 ${showPreloader ? "map-blur-effect" : ""}`}
      >
        <div id="rsu-map" className="w-full h-full absolute inset-0 z-0" />

        {/* Top Left: Branding */}
        <BrandingHeader />

        {/* Top Right: Status & Toggles */}
        <div className="absolute top-4 right-4 md:top-10 md:right-10 z-10 flex flex-col items-stretch gap-3 w-[160px] md:w-[180px]">
          <AvailabilityCard count={availableCount} />
          <RouteSelector
            routes={routes}
            selectedRoute={selectedRoute}
            isOpen={isRouteMenuOpen}
            onToggle={() => setIsRouteMenuOpen(!isRouteMenuOpen)}
            onSelect={handleRouteChange}
            menuRef={routeMenuRef}
          />
          <FeedbackButton onClick={() => handleOpenFeedback(selectedVehicleId)} />
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
          onRecenter={handleRecenter}
          onFeedbackClick={handleOpenFeedback}
        />

        {/* Bottom Right: Map Controls */}
        <MapControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={handleLocateUser}
        />
      </div>

      {!showPreloader && (
        <AppTour
          onInstallClick={handleInstallClick}
          isPwaAvailable={!!deferredPrompt}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          initialVehicleId={feedbackVehicleId}
          apiOrigin={configuredBackendOrigin}
        />
      )}
    </div>
  );
}