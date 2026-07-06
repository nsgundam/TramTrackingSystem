interface Props {
  count: number;
}

export default function AvailabilityCard({ count }: Props) {
  return (
    <div className="glass-panel backdrop-blur-sm rounded-2xl px-5 py-2.5 md:px-6 md:py-3 flex items-center justify-start gap-3 w-full select-none">
      <span className="relative flex h-3.5 w-3.5 md:h-4 md:w-4 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-alert opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 bg-status-alert pulse-dot"></span>
      </span>
      <div className="flex flex-col select-none">
        <span className="font-body-sm text-[12px] md:text-[13px] text-on-surface-variant leading-none mb-[2px]">Active Trams</span>
        <span className="font-headline-md text-[16px] md:text-[18px] text-on-surface leading-none">{count} คัน</span>
      </div>
    </div>
  );
}
