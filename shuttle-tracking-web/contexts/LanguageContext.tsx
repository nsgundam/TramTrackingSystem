"use client";
import React, { createContext, useContext, useState } from "react";

type Locale = "th" | "en";

interface LanguageContextProps {
  locale: Locale;
  t: (key: string, variables?: Record<string, string | number>) => string;
  changeLanguage: (lang: Locale) => void;
}

const translations: Record<Locale, Record<string, string>> = {
  th: {
    welcome: "ยินดีต้อนรับ",
    tourIntro: "แนะนำแอป RSU Tram Tracker",
    etaTitle: "เวลารอรถ (ETA)",
    etaDesc: "กดที่ป้ายบนแผนที่ → ดูเวลาที่รถจะมาถึง",
    busInfoTitle: "ข้อมูลรถ",
    busInfoDesc: "กดที่รถ → ดูว่าป้ายถัดไปคือที่ไหน",
    selectRouteTitle: "เลือกเส้นทาง",
    selectRouteDesc: "เลือกเส้นทางที่ต้องการดูได้ที่นี่",
    feedbackTitle: "ส่งข้อเสนอแนะ",
    feedbackDesc: "พบปัญหาหรือมีความเห็น? กดที่นี่เพื่อแจ้งทีมงาน",
    addToHomeTitle: "เพิ่มเข้าหน้า Home",
    pwaAvailableDesc: "คุณสามารถติดตั้งแอปพลิเคชันลงบนหน้าจอหลักเพื่อการใช้งานที่สะดวกรวดเร็วและเสถียรยิ่งขึ้น",
    pwaManualDesc: "สำหรับอุปกรณ์ของคุณ: สามารถกดที่ปุ่มแชร์ \"Share\" ในเบราว์เซอร์ของคุณ แล้วเลือก \"เพิ่มไปยังหน้าจอโฮม\" (Add to Home Screen) เพื่อติดตั้งแอปได้ครับ",
    getStartedTitle: "เริ่มต้นใช้งาน",
    thankYouDesc: "ขอบคุณที่ใช้บริการแอปพลิเคชันของเรา",
    startNowBtn: "เริ่มใช้งานเลย!",
    nextBtn: "ถัดไป",
    backBtn: "Back",
    skipBtn: "ข้าม",
    installBtn: "ติดตั้ง",
    activeTrams: "Active Trams", // match existing key text style
    tramCount: "{count} คัน",
    gpsAlert: "กรุณาเปิดการเข้าถึงตำแหน่งที่ตั้ง (GPS) ในเบราว์เซอร์ของคุณ",
    selectedStation: "Selected Station", // match existing header style
    estimatedWaitingTime: "Estimated Waiting Time", // match existing header style
    minSuffix: "min",
    calculating: "กำลังคำนวณ...",
    noTramsOnRoute: "ยังไม่มีรถในสายนี้",
    arriving: "กำลังมาถึง!",
    enRoute: "กำลังเดินทาง",
    outOfService: "ไม่พร้อมให้บริการ",
    unknownStop: "ไม่ทราบชื่อป้าย",
    reportIssue: "แจ้งปัญหา",
    reportIssueTitle: "ส่งข้อเสนอแนะ / แจ้งปัญหา",
    contactType: "ประเภทการติดต่อ",
    selectTram: "เลือกหมายเลขรถรถราง",
    loadingTramData: "กำลังโหลดข้อมูลรถ...",
    selectTramPlaceholder: "-- เลือกหมายเลขรถราง --",
    feedbackDetails: "รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ",
    feedbackPlaceholder: "กรุณาระบุรายละเอียดข้อความของคุณ...",
    cancelBtn: "ยกเลิก",
    submitBtn: "ส่งข้อมูล",
    submittingBtn: "กำลังส่งข้อมูล...",
    submitSuccess: "ส่งข้อมูลสำเร็จ!",
    thankYouFeedback: "ขอบคุณสำหรับข้อเสนอแนะของคุณ ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว",
    fillAllFields: "กรุณากรอกข้อมูลให้ครบถ้วน",
    submitError: "เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ",
    serverConnectionError: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้",
    suggestionType: "ข้อเสนอแนะ",
    complaintType: "แจ้งปัญหา / ร้องเรียน",
    praiseType: "ชื่นชมการบริการ",
    otherType: "เรื่องอื่นๆ",
    nextStation: "Next Station",
    closeImage: "ปิดรูปภาพ",
    clickToEnlarge: "คลิกเพื่อขยายรูป",
    reconnecting: "กำลังเชื่อมต่อใหม่",
    reconnectingDetail: "ระบบกำลังเรียกข้อมูลสดกลับมา",
    reconnectingNoStateDetail: "ยังไม่มีสถานะรถที่ยืนยันได้ ระบบกำลังเชื่อมต่อใหม่",
    liveDataUnavailable: "ข้อมูลสดไม่พร้อม",
    liveDataUnavailableDetail: "ระบบจะลองเชื่อมต่อข้อมูลสดอีกครั้งอัตโนมัติ",
    latestStatusLoadFailed: "โหลดสถานะล่าสุดไม่สำเร็จ",
    noVerifiedVehicleStatus: "ยังไม่มีสถานะรถที่ยืนยันได้",
    waitingVehicleData: "กำลังรอข้อมูลรถ",
    loadingLatestStatus: "กำลังโหลดสถานะล่าสุด",
    vehicleLocationDelayed: "ข้อมูลตำแหน่งล่าช้า",
    showingVerifiedStatus: "แสดงสถานะล่าสุดที่ระบบยืนยันได้",
    noVehicleLocation: "ยังไม่มีตำแหน่งรถ",
    noVehicleLocationDetail: "ระบบยังไม่มีตำแหน่งที่ยืนยันได้",
    statusCannotVerify: "ตรวจสอบสถานะไม่ได้",
    statusCannotVerifyDetail: "ระบบยังยืนยันสถานะรถไม่ได้",
    noActiveTrams: "ไม่มีรถที่กำลังให้บริการ",
    noActiveTramsDetail: "ตรวจสอบแล้วและไม่พบรถที่ให้บริการ",
    retryLoading: "กำลังโหลดข้อมูล",
    retryLoad: "ลองโหลดข้อมูลอีกครั้ง",
    lastUpdatedJustNow: "อัปเดตล่าสุดไม่ถึง 1 นาที",
    lastUpdatedMinutesAgo: "อัปเดตล่าสุด {count} นาทีที่แล้ว",
    lastUpdatedHoursAgo: "อัปเดตล่าสุด {count} ชั่วโมงที่แล้ว",
    lastUpdatedDaysAgo: "อัปเดตล่าสุด {count} วันที่แล้ว",
    etaWaitingForLiveData: "ETA รอข้อมูลสด",
    etaNotReady: "ETA ยังไม่พร้อม",
    vehicleDataDelayed: "ข้อมูลรถล่าช้า",
    noVerifiedEta: "ยังไม่มี ETA ที่ยืนยันได้",
    etaUnavailable: "ตรวจสอบ ETA ไม่ได้",
    noEtaForStop: "ยังไม่มี ETA สำหรับป้ายนี้",
    closeFeedbackDialog: "ปิดหน้าต่างข้อเสนอแนะ",
    feedbackReceivedNotice: "ระบบได้รับข้อมูลแล้ว ทีมงานตรวจสอบในวันทำการ แต่ไม่สามารถตอบกลับรายบุคคลได้",
    feedbackPrivacyNotice: "แบบฟอร์มนี้เป็นการแจ้งแบบไม่ระบุตัวตนและไม่ใช่ช่องทางฉุกเฉิน โปรดอย่าใส่ข้อมูลส่วนบุคคลหรือข้อมูลเร่งด่วน ระบบเก็บข้อความและข้อมูลเคสไม่เกิน 180 วัน; IP ใช้จำกัดการใช้งานเท่านั้นและลบภายใน 30 วัน ทีมงานตรวจสอบในวันทำการและไม่สามารถตอบกลับรายบุคคลได้",
    vehicleVerificationFailed: "ยังยืนยันรายชื่อรถไม่ได้ กรุณาลองโหลดข้อมูลรถอีกครั้ง",
    vehicleListUnavailable: "ไม่สามารถโหลดรายชื่อรถได้ จึงยังไม่สามารถผูกข้อเสนอแนะกับรถคันใดได้",
    retryVehicleList: "ลองโหลดรายชื่อรถอีกครั้ง",
    noVehicleAvailable: "ขณะนี้ไม่มีรถที่เปิดให้เลือก กรุณาลองใหม่ภายหลัง",
  },
  en: {
    welcome: "Welcome",
    tourIntro: "Introducing RSU Tram Tracker App",
    etaTitle: "Wait Time (ETA)",
    etaDesc: "Tap a stop on the map → view estimated arrival times",
    busInfoTitle: "Tram Information",
    busInfoDesc: "Tap a tram → see its next stop",
    selectRouteTitle: "Select Route",
    selectRouteDesc: "Select your desired route here",
    feedbackTitle: "Send Feedback",
    feedbackDesc: "Found an issue or have feedback? Tap here to let the team know",
    addToHomeTitle: "Add to Home Screen",
    pwaAvailableDesc: "You can install the application on your home screen for faster and more stable use.",
    pwaManualDesc: "For your device: Tap the 'Share' button in your browser and select 'Add to Home Screen' to install the app.",
    getStartedTitle: "Get Started",
    thankYouDesc: "Thank you for using our application",
    startNowBtn: "Get Started!",
    nextBtn: "Next",
    backBtn: "Back",
    skipBtn: "Skip",
    installBtn: "Install",
    activeTrams: "Active Trams",
    tramCount: "{count} vehicles",
    gpsAlert: "Please enable location services (GPS) in your browser.",
    selectedStation: "Selected Station",
    estimatedWaitingTime: "Estimated Waiting Time",
    minSuffix: "min",
    calculating: "Calculating...",
    noTramsOnRoute: "No trams on this route",
    arriving: "Arriving!",
    enRoute: "In transit",
    outOfService: "Out of Service",
    unknownStop: "Unknown Stop",
    reportIssue: "Report Issue",
    reportIssueTitle: "Feedback / Report Issue",
    contactType: "Contact Type",
    selectTram: "Select Tram Number",
    loadingTramData: "Loading tram data...",
    selectTramPlaceholder: "-- Select Tram Number --",
    feedbackDetails: "Feedback / Issue Details",
    feedbackPlaceholder: "Please enter your message details...",
    cancelBtn: "Cancel",
    submitBtn: "Submit",
    submittingBtn: "Sending...",
    submitSuccess: "Submitted successfully!",
    thankYouFeedback: "Thank you for your feedback. The system has recorded your information.",
    fillAllFields: "Please fill out all fields.",
    submitError: "An error occurred while sending feedback.",
    serverConnectionError: "Cannot connect to server at this time.",
    suggestionType: "Suggestion",
    complaintType: "Report / Complaint",
    praiseType: "Compliment",
    otherType: "Other",
    nextStation: "Next Station",
    closeImage: "Close image",
    clickToEnlarge: "Click to enlarge image",
    reconnecting: "Reconnecting",
    reconnectingDetail: "Restoring the live feed.",
    reconnectingNoStateDetail: "No verified vehicle status is available while reconnecting.",
    liveDataUnavailable: "Live data unavailable",
    liveDataUnavailableDetail: "The system will automatically try to reconnect to live data.",
    latestStatusLoadFailed: "Could not load the latest status",
    noVerifiedVehicleStatus: "No verified vehicle status is available",
    waitingVehicleData: "Waiting for vehicle data",
    loadingLatestStatus: "Loading the latest status",
    vehicleLocationDelayed: "Vehicle location is delayed",
    showingVerifiedStatus: "Showing the latest verified status",
    noVehicleLocation: "No vehicle location available",
    noVehicleLocationDetail: "The system has no verified vehicle location yet.",
    statusCannotVerify: "Status cannot be verified",
    statusCannotVerifyDetail: "The system cannot verify the vehicle status.",
    noActiveTrams: "No trams are in service",
    noActiveTramsDetail: "No in-service trams were found.",
    retryLoading: "Loading data",
    retryLoad: "Try loading again",
    lastUpdatedJustNow: "Updated less than a minute ago",
    lastUpdatedMinutesAgo: "Updated {count} minutes ago",
    lastUpdatedHoursAgo: "Updated {count} hours ago",
    lastUpdatedDaysAgo: "Updated {count} days ago",
    etaWaitingForLiveData: "ETA is waiting for live data",
    etaNotReady: "ETA is not ready",
    vehicleDataDelayed: "Vehicle data is delayed",
    noVerifiedEta: "No verified ETA is available",
    etaUnavailable: "ETA cannot be verified",
    noEtaForStop: "No ETA is available for this stop",
    closeFeedbackDialog: "Close feedback dialog",
    feedbackReceivedNotice: "The team will review your feedback on business days, but cannot reply individually.",
    feedbackPrivacyNotice: "This anonymous form is not an emergency channel. Do not include personal or urgent information. Messages and case data are retained for no more than 180 days; IP addresses are used only for rate limiting and deleted within 30 days. The team reviews submissions on business days and cannot reply individually.",
    vehicleVerificationFailed: "The vehicle list could not be verified. Please try loading it again.",
    vehicleListUnavailable: "The vehicle list could not be loaded, so feedback cannot be linked to a vehicle yet.",
    retryVehicleList: "Try loading the vehicle list again",
    noVehicleAvailable: "There are no vehicles available to select. Please try again later.",
  },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("rsu-tram-locale") as Locale;
      if (savedLang === "th" || savedLang === "en") {
        return savedLang;
      }
    }
    return "th";
  });

  const changeLanguage = (lang: Locale) => {
    setLocale(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rsu-tram-locale", lang);
    }
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    let text = translations[locale][key] || translations["th"][key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
