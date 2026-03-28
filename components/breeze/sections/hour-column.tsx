import { cn } from "@/lib/utils";
import {
  getWeatherCondition,
  getWeatherColor,
  windDirectionLabel,
} from "@/lib/weather-api";

export interface HourData {
  time: string;
  temp: number;
  code: number;
  precip: number;
  isDay: number;
  windSpeed: number;
  windDir: number;
  humidity: number;
}

export function HourColumn({
  h,
  isNow,
  displayTempUnit,
  displayWindUnit,
  showDayLabel = true,
}: {
  h: HourData;
  isNow?: boolean;
  displayTempUnit: string;
  displayWindUnit: string;
  showDayLabel?: boolean;
}) {
  const hCondition = getWeatherCondition(h.code);
  const hDate = new Date(h.time);
  
  const dayName = hDate.toLocaleDateString([], { weekday: "short" });
  const dayNum = String(hDate.getDate()).padStart(2, "0");
  const monthNum = String(hDate.getMonth() + 1).padStart(2, "0");
  const dayLabel = `${dayName} ${dayNum}/${monthNum}`;
  
  const timeLabel = isNow
    ? "Now"
    : hDate.toLocaleTimeString([], { hour: "numeric", hour12: true }).replace(" AM", "am").replace(" PM", "pm");

  return (
    <div
      id={isNow ? "now-hour" : undefined}
      className={cn(
        "flex flex-col items-center py-4 sm:py-5 px-3 sm:px-4 min-w-[64px] sm:min-w-[72px] transition-colors border-r border-border last:border-r-0",
        isNow ? "bg-primary-10" : "hover:bg-surface-dim"
      )}
    >
      {showDayLabel && (
        <span className={cn("text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1 opacity-70", isNow ? "text-primary font-bold" : "text-muted-foreground")}>
          {dayLabel}
        </span>
      )}
      <span className={cn("text-xs font-semibold mb-2 sm:mb-3 whitespace-nowrap", isNow ? "text-primary" : "text-muted-foreground")}>
        {timeLabel}
      </span>
      <span
        className={cn("material-symbols-outlined text-xl sm:text-2xl mb-1 sm:mb-2", getWeatherColor(h.code, h.isDay === 1))}
        style={h.code <= 1 || h.code >= 51 ? { fontVariationSettings: "'FILL' 1" } : undefined}
        aria-hidden="true"
      >
        {h.isDay ? hCondition.iconDay : hCondition.iconNight}
      </span>
      <span
        className={cn("text-sm sm:text-base font-bold", isNow ? "text-primary" : "text-foreground")}
        style={{ fontFamily: "var(--font-data)" }}
      >
        {h.temp}°{displayTempUnit}
      </span>
      
      <div className="flex flex-col items-center w-full mt-2.5 pt-2.5 border-t border-border gap-2">
        <div className="flex items-center gap-1 w-full justify-center" title="Precipitation">
          <span className={cn("material-symbols-outlined text-[12px] sm:text-[14px]", h.precip > 0 ? "text-primary" : "text-muted-foreground")} style={h.precip > 0 ? { fontVariationSettings: "'FILL' 1" } : undefined} aria-hidden="true">water_drop</span>
          <span className={cn("text-[10px] sm:text-xs font-semibold", h.precip > 0 ? "text-primary" : "text-muted-foreground")}>
            <span className="sr-only">Precipitation: </span>{h.precip}%
          </span>
        </div>
        
        <div className="flex items-center gap-1 w-full justify-center text-muted-foreground" title={`Wind: ${windDirectionLabel(h.windDir)}`}>
          <span className="material-symbols-outlined text-[12px] sm:text-[14px]" aria-hidden="true">air</span>
          <span className="text-[10px] sm:text-xs font-medium">
            <span className="sr-only">Wind: </span>{h.windSpeed} {displayWindUnit}
          </span>
        </div>

        <div className="flex items-center gap-1 w-full justify-center text-muted-foreground" title="Humidity">
          <span className="material-symbols-outlined text-[12px] sm:text-[14px]" aria-hidden="true">humidity_percentage</span>
          <span className="text-[10px] sm:text-xs font-medium">
            <span className="sr-only">Humidity: </span>{h.humidity}%
          </span>
        </div>
      </div>
    </div>
  );
}
