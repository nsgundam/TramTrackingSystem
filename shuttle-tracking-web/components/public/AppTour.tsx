"use client";

import { useState, useMemo } from "react";
import { STATUS, ACTIONS, EVENTS, Joyride, type EventData, type Step, type TooltipRenderProps } from "react-joyride";

interface AppTourProps {
  onInstallClick?: () => void;
  isPwaAvailable?: boolean;
}

export default function AppTour({ onInstallClick, isPwaAvailable = false }: AppTourProps) {
  const [run, setRun] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("rsu-bus-tour-seen");
  });
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo<Step[]>(() => [
    {
      target: "body",
      placement: "center",
      title: "ยินดีต้อนรับ",
      content: "แนะนำแอป RSU Tram Tracker",
      skipBeacon: true,
    },
    {
      target: '.rsu-stop-eta-box', 
      title: 'เวลารอรถ (ETA)',
      content: 'กดที่ป้ายบนแผนที่ → ดูเวลาที่รถจะมาถึง',
      placement: 'top',
    },
    {
      target: '.rsu-vehicle-next-stop', 
      title: 'ข้อมูลรถ',
      content: 'กดที่รถ → ดูว่าป้ายถัดไปคือที่ไหน',
      placement: 'top',
    },
    {
      target: '.route-selector-menu', 
      title: 'เลือกเส้นทาง',
      content: 'เลือกเส้นทางที่ต้องการดูได้ที่นี่',
      placement: 'left',
    },
    {
      target: '.rsu-feedback-btn', 
      title: 'ส่งข้อเสนอแนะ',
      content: 'พบปัญหาหรือมีความเห็น? กดที่นี่เพื่อแจ้งทีมงาน',
      placement: 'left',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'เพิ่มเข้าหน้า Home',
      content: isPwaAvailable 
        ? 'คุณสามารถติดตั้งแอปพลิเคชันลงบนหน้าจอหลักเพื่อการใช้งานที่สะดวกรวดเร็วและเสถียรยิ่งขึ้น'
        : 'สำหรับอุปกรณ์ของคุณ: สามารถกดที่ปุ่มแชร์ "Share" ในเบราว์เซอร์ของคุณ แล้วเลือก "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen) เพื่อติดตั้งแอปได้ครับ',
    }
  ], [isPwaAvailable]);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;
    const currentIndex = index ?? 0;

    // เมื่อกด FINISHED หรือ SKIP ให้ Zoom กลับ Center
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("rsu-bus-tour-seen", "true");
      setRun(false);
      
      // ส่งสัญญาณไปที่ ShuttleTracker
      window.dispatchEvent(new CustomEvent("tour-zoom-center"));
    } 
    else if (
      type === EVENTS.STEP_AFTER ||
      type === EVENTS.STEP_AFTER_HOOK ||
      type === EVENTS.TARGET_NOT_FOUND
    ) {
      const nextIndex = currentIndex + (action === ACTIONS.PREV ? -1 : 1);

      // Logic "พากด" อัตโนมัติ เพื่อให้ Card โผล่ก่อนถึง Step ถัดไป
      if (nextIndex === 1) { // ก่อนเข้า Step 2 (ป้ายรถ)
        const stopBtn = document.querySelector('.stop-marker-tour') as HTMLElement;
        if (stopBtn) stopBtn.click();
      } else if (nextIndex === 2) { // ก่อนเข้า Step 3 (รถบัส)
        const busBtn = document.querySelector('.bus-marker-tour') as HTMLElement;
        if (busBtn) busBtn.click();
      }
      
      setStepIndex(nextIndex);
    }
  };

  const CustomTooltip = ({
    index,
    isLastStep,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
  }: TooltipRenderProps) => {
    return (
      <div 
        {...tooltipProps} 
        className="bg-white text-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm border border-gray-100 flex flex-col gap-4 relative"
        style={{ minWidth: "320px" }}
      >
        {/* Close Button (X) */}
        <button 
          {...skipProps}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-lg leading-none">close</span>
        </button>

        {/* Title */}
        {step.title && (
          <h3 className="text-lg font-bold text-gray-900 pr-6">
            {step.title}
          </h3>
        )}

        {/* Content */}
        <div className="text-sm text-gray-600 leading-relaxed">
          {step.content}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-2 w-full gap-2">
          {/* Left side: Skip button (only if not on the last step) */}
          {!isLastStep ? (
            <button 
              {...skipProps}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
            >
              ข้าม
            </button>
          ) : (
            <div />
          )}

          {/* Right side: Back, Install, Next */}
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button 
                {...backProps}
                className="px-3.5 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer font-medium border-none bg-transparent"
              >
                Back
              </button>
            )}

            {isLastStep && isPwaAvailable && (
              <button
                onClick={onInstallClick}
                className="flex items-center justify-center gap-1.5 h-10 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm active:scale-95 transition-all text-sm cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-base leading-none">download</span>
                ติดตั้งแอป
              </button>
            )}

            <button 
              {...primaryProps}
              className="flex items-center justify-center h-10 px-4 bg-[#151c25] text-white font-semibold rounded-lg hover:bg-[#202938] transition-colors cursor-pointer shadow-sm border-none text-sm"
            >
              {isLastStep ? "เริ่มใช้งานเลย!" : "ถัดไป"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Joyride
      stepIndex={stepIndex}
      onEvent={handleJoyrideCallback}
      continuous={true}
      run={run}
      steps={steps}
      scrollToFirstStep={true}
      tooltipComponent={CustomTooltip}
      styles={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      }}
    />
  );
}
