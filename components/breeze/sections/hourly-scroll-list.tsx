import { forwardRef } from "react";
import { HourColumn, type HourData } from "./hour-column";

export interface HourlyScrollListItem {
  h: HourData;
  isNow?: boolean;
}

interface HourlyScrollListProps {
  items: HourlyScrollListItem[];
  displayTempUnit: string;
  displayWindUnit: string;
  showDayLabel?: boolean;
}

export const HourlyScrollList = forwardRef<HTMLDivElement, HourlyScrollListProps>(
  ({ items, displayTempUnit, displayWindUnit, showDayLabel = true }, ref) => {
    return (
      <div className="overflow-x-auto scrollbar-thin border-t border-border" ref={ref}>
        <div className="flex min-w-max">
          {items.map(({ isNow, h }) => (
            <HourColumn
              key={h.time}
              h={h}
              isNow={isNow}
              displayTempUnit={displayTempUnit}
              displayWindUnit={displayWindUnit}
              showDayLabel={showDayLabel}
            />
          ))}
        </div>
      </div>
    );
  }
);
HourlyScrollList.displayName = "HourlyScrollList";
