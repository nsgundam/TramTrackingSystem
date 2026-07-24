"use client";
import { memo } from "react";
import { MessageSquarePlus } from "lucide-react";

interface FeedbackButtonProps {
  onClick: () => void;
}

function FeedbackButton({ onClick }: FeedbackButtonProps) {
  return (
    <button
      className="rsu-feedback-btn w-full glass-panel backdrop-blur-sm rounded-full py-2 text-[13px] md:text-[14px] text-on-surface hover:bg-white/40! hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 font-medium border border-outline-variant/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
      onClick={onClick}
    >
      <MessageSquarePlus size={16} className="text-on-surface-variant" />
      <span>ส่งข้อเสนอแนะ</span>
    </button>
  );
}

export default memo(FeedbackButton);