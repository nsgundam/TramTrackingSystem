interface Props {
  count: number;
}

export default function AvailabilityCard({ count }: Props) {
  return (
    <div className="glass-panel rounded-full px-sm py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm">
      <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-alert opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-status-alert pulse-dot"></span>
      </span>
      <div className="flex flex-col select-none">
        <span className="font-label-caps text-[9px] md:text-label-caps text-on-surface-variant leading-none mb-[2px]">Active Trams</span>
        <span className="font-data-display text-[11px] md:text-data-display text-on-surface leading-none">{count} trams</span>
      </div>
    </div>
  );
}
