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
