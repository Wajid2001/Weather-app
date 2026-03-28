"use client";

import { useState, useEffect, useTransition, useRef, useMemo } from "react";
import { useWeatherStore } from "@/lib/weather-store";
import { Section } from "./section";
import { getWeatherCondition, getWeatherColor, getCurrentHourIndex } from "@/lib/weather-api";
import { cn } from "@/lib/utils";
import { fetchDayHourlyAction } from "@/lib/actions";
import type { HourlyForecast } from "@/lib/weather-api";
import { HourlyScrollList, type HourlyScrollListItem } from "./hourly-scroll-list";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatDay(dateStr: string, isToday: boolean): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = isToday ? "Today" : DAY_NAMES[d.getDay()];
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${dayName}, ${date}/${month}`;
}

function calcBarPosition(low: number, high: number, globalMin: number, globalMax: number) {
  const range = globalMax - globalMin || 1;
  return {
    left: `${Math.max(((low - globalMin) / range) * 100, 0).toFixed(1)}%`,
    right: `${Math.max(((globalMax - high) / range) * 100, 0).toFixed(1)}%`,
  };
}

function DayHourlyList({ dateStr }: { dateStr: string }) {
  const [hourly, setHourly] = useState<HourlyForecast | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [nowTimeMs] = useState(() => Date.now());

  const location = useWeatherStore((s) => s.location);
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const getPrecipUnit = useWeatherStore((s) => s.getPrecipUnit);

  useEffect(() => {
    if (!location) return;
    startTransition(async () => {
      try {
        setError(null);
        const precip = getPrecipUnit();
        const data = await fetchDayHourlyAction(location.latitude, location.longitude, dateStr, {
          temperature_unit: tempUnit,
          windspeed_unit: windUnit,
          precipitation_unit: precip,
          timezone: location.timezone ?? "auto",
        });
        setHourly(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hourly forecast");
      }
    });
  }, [dateStr, location, tempUnit, windUnit, getPrecipUnit]);

  useEffect(() => {
    if (listRef.current && hourly) {
      const nowEl = listRef.current.querySelector("#now-hour") as HTMLElement;
      if (nowEl) {
        nowEl.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
      }
    }
  }, [hourly]);

  if (error) return <div className="text-destructive text-sm p-4 text-center border-t border-border">{error}</div>;

  if (isPending || !hourly) {
    return (
      <div className="flex justify-center items-center py-10 w-full border-t border-border" aria-label="Loading hourly forecast" aria-live="polite">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl" aria-hidden="true">progress_activity</span>
      </div>
    );
  }

  const nowIdx = getCurrentHourIndex(hourly.time);

  const displayTempUnit = tempUnit === "fahrenheit" ? "F" : "C";
  const displayWindUnit = windUnit === "mph" ? "mph" : windUnit === "ms" ? "m/s" : "km/h";

  const hourDataList: HourlyScrollListItem[] = hourly.time.map((time, idx) => ({
    isNow: idx === nowIdx && Math.abs(new Date(time).getTime() - nowTimeMs) < 2 * 60 * 60 * 1000,
    h: {
      time,
      temp: Math.round(hourly.temperature_2m[idx]),
      code: hourly.weathercode[idx],
      precip: hourly.precipitation_probability[idx],
      isDay: hourly.is_day[idx],
      windSpeed: Math.round(hourly.windspeed_10m[idx]),
      windDir: hourly.winddirection_10m[idx],
      humidity: hourly.relative_humidity_2m[idx],
    }
  }));

  if (hourDataList.length === 0) return <div className="text-muted-foreground text-sm p-4 text-center border-t border-border">No hourly data available for this date.</div>;

  return (
    <HourlyScrollList
      ref={listRef}
      items={hourDataList}
      displayTempUnit={displayTempUnit}
      displayWindUnit={displayWindUnit}
      showDayLabel={false}
    />
  );
}

export function DailyForecast() {
  const forecast = useWeatherStore((s) => s.forecast);
  const loading = useWeatherStore((s) => s.loading);
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const daily = forecast?.daily;

  // Global min/max mapping
  const today = new Date();
  const todayLocal = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  let startIndex = daily ? daily.time.findIndex(t => t >= todayLocal) : 0;
  if (startIndex === -1) startIndex = 0;
  
  const sliceEnd = daily ? Math.min(startIndex + 7, daily.time.length) : 0;
  
  const displayDates = useMemo(() => {
    return daily ? daily.time.slice(startIndex, sliceEnd) : [];
  }, [daily, startIndex, sliceEnd]);

  if (loading || !daily) return null;

  const displayTempUnit = tempUnit === "fahrenheit" ? "F" : "C";
  const displayWindUnit = windUnit === "mph" ? "mph" : windUnit === "ms" ? "m/s" : "km/h";

  const futureMinTemps = daily.temperature_2m_min.slice(startIndex, sliceEnd);
  const futureMaxTemps = daily.temperature_2m_max.slice(startIndex, sliceEnd);
  const globalMin = Math.min(...futureMinTemps);
  const globalMax = Math.max(...futureMaxTemps);

  const activeExpandedDate = expandedDate === null && displayDates.length > 0 ? displayDates[0] : expandedDate;

  return (
    <Section id="forecast" title="7-Day Forecast" icon="calendar_month">
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden text-sm sm:text-base">
        <div className="hidden md:flex items-center px-6 py-3 border-b border-border bg-surface-dim text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="w-28">Date</div>
          <div className="w-16 text-center">Conditions</div>
          <div className="flex-1 text-center px-8">Temperature Range</div>
          <div className="w-24 text-center">Wind</div>
          <div className="w-24 text-right">Precip</div>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {displayDates.map((dateStr, displayIdx) => {
            const index = startIndex + displayIdx;
            const isExpanded = activeExpandedDate === dateStr;
            const dayLabel = formatDay(dateStr, displayIdx === 0);
            const code = daily.weathercode[index];
            const cond = getWeatherCondition(code);
            const lo = Math.round(daily.temperature_2m_min[index]);
            const hi = Math.round(daily.temperature_2m_max[index]);
            const wind = Math.round(daily.windspeed_10m_max[index]);
            const precip = daily.precipitation_probability_max[index];
            const isFilled = code <= 1 || code >= 51;
            const iconColor = getWeatherColor(code, true);
            const isHighPrecip = precip >= 50;
            const isHighlight = precip >= 80;
            const bar = calcBarPosition(lo, hi, globalMin, globalMax);

            return (
              <div key={dateStr} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setExpandedDate(isExpanded ? "none" : dateStr)}
                  aria-expanded={isExpanded}
                  aria-controls={`forecast-panel-${dateStr}`}
                  className={cn(
                    "flex items-center px-3 sm:px-4 md:px-6 h-[64px] sm:h-[72px] md:h-[80px] hover:bg-surface-dim transition-colors duration-200 cursor-pointer group text-left",
                    isHighlight && "bg-primary-5"
                  )}
                >
                  <div className="w-20 sm:w-24 md:w-28 flex items-center pr-2">
                    <span className={cn("text-xs sm:text-sm tracking-tight", isHighlight ? "font-semibold text-primary" : displayIdx === 0 ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                      {dayLabel}
                    </span>
                  </div>

                  <div className="w-10 sm:w-12 md:w-16 flex justify-center">
                    <span
                      className={cn("material-symbols-outlined text-2xl sm:text-3xl transition-transform group-hover:scale-110", iconColor)}
                      style={isFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      aria-hidden="true"
                    >
                      {cond.icon}
                    </span>
                  </div>

                  <div className="hidden md:flex flex-1 items-center px-8 gap-4">
                    <span className="text-muted-foreground font-medium w-9 text-right" style={{ fontFamily: "var(--font-data)" }}>{lo}°{displayTempUnit}</span>
                    <div className="relative flex-1 max-w-[200px] h-1.5 sparkline-track rounded-full overflow-hidden" aria-label={`${lo}° to ${hi}°`}>
                      <div className={cn("absolute top-0 bottom-0 rounded-full group-hover:opacity-100 transition-opacity", isHighlight ? "bg-primary opacity-100" : "sparkline-fill opacity-80")} style={{ left: bar.left, right: bar.right }} />
                    </div>
                    <span className="text-foreground font-semibold w-9" style={{ fontFamily: "var(--font-data)" }}>{hi}°{displayTempUnit}</span>
                  </div>

                  <div className="flex-1 md:hidden flex justify-end items-center gap-2 sm:gap-3 pr-2 sm:pr-4">
                    <span className="text-foreground font-semibold text-base sm:text-lg" style={{ fontFamily: "var(--font-data)" }}>{hi}°{displayTempUnit}</span>
                    <span className="text-muted-foreground font-medium text-sm sm:text-base" style={{ fontFamily: "var(--font-data)" }}>{lo}°{displayTempUnit}</span>
                  </div>

                  <div className="w-20 hidden md:flex items-center justify-center gap-1 text-muted-foreground">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">air</span>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--font-data)" }}>{wind} {displayWindUnit}</span>
                  </div>

                  <div className={cn("w-14 sm:w-16 md:w-24 flex justify-end items-center gap-1", isHighPrecip ? "text-primary" : "text-muted-foreground")}>
                    {precip >= 80 && (
                       <span className="material-symbols-outlined text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">water_drop</span>
                    )}
                    <span className={cn("text-xs sm:text-sm", precip >= 80 ? "font-bold" : "font-medium")} style={{ fontFamily: "var(--font-data)" }}>{precip}%</span>
                  </div>
                  
                  <div className="w-4 sm:w-6 flex justify-end items-center text-muted-foreground/30 group-hover:text-muted-foreground ml-1 sm:ml-2">
                    <span className={cn("material-symbols-outlined text-lg sm:text-xl transition-transform", isExpanded && "rotate-180")} aria-hidden="true">expand_more</span>
                  </div>
                </button>

                {isExpanded && (
                  <div 
                    id={`forecast-panel-${dateStr}`} 
                    role="region" 
                    aria-label={`Hourly forecast for ${dayLabel}`}
                    className="bg-surface-dim/30 animate-slide-up origin-top"
                  >
                    <DayHourlyList dateStr={dateStr} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
