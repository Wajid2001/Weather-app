"use client";

import { useEffect, useRef } from "react";
import { useWeatherStore } from "@/lib/weather-store";
import { Section } from "./section";
import { getCurrentHourIndex } from "@/lib/weather-api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HourlyScrollList, type HourlyScrollListItem } from "./hourly-scroll-list";

export function HourlyForecast() {
  const forecast = useWeatherStore((s) => s.forecast);
  const loading = useWeatherStore((s) => s.loading);
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const hourlyScrollRef = useRef<HTMLDivElement>(null);
  const [isNowVisible, setIsNowVisible] = useState(true);

  const daily = forecast?.daily;
  const hourly = forecast?.hourly;

  const hourIdx = hourly ? getCurrentHourIndex(hourly.time) : 0;

  const scrollToNow = () => {
    if (hourlyScrollRef.current) {
      const nowEl = hourlyScrollRef.current.querySelector("#now-hour") as HTMLElement;
      if (nowEl) {
        nowEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  useEffect(() => {
    // Initial jump without smooth scrolling so it's instant
    if (hourlyScrollRef.current) {
      const nowEl = hourlyScrollRef.current.querySelector("#now-hour") as HTMLElement;
      if (nowEl) {
        // Setup observer to detect if the 'now' scroll indicator needs to be visible
        const observer = new IntersectionObserver((entries) => {
          setIsNowVisible(entries[0].isIntersecting);
        }, {
          root: hourlyScrollRef.current,
          rootMargin: "0px",
          threshold: 0.1,
        });
        observer.observe(nowEl);
        
        nowEl.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });

        return () => observer.disconnect();
      }
    }
  }, [hourly]);

  const startIndex = Math.max(0, hourIdx - 12);
  const endIndex = Math.min(hourly ? hourly.time.length : 0, hourIdx + 13); // +12 hours inclusive

  const hourlySlice: HourlyScrollListItem[] = hourly
    ? hourly.time.slice(startIndex, endIndex).map((time, idxOffset) => {
        const idx = startIndex + idxOffset;
        return {
          isNow: idx === hourIdx,
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
        };
      })
    : [];

  const displayTempUnit = tempUnit === "fahrenheit" ? "F" : "C";
  const displayWindUnit = windUnit === "mph" ? "mph" : windUnit === "ms" ? "m/s" : "km/h";

  if (loading || hourlySlice.length === 0 || !daily) return null;

  return (
    <Section id="hourly" title="Hourly Forecast" icon="schedule" action={
      !isNowVisible && (
        <Button size="sm" variant="outline" onClick={scrollToNow} className="rounded-full h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-sm bg-surface animate-fade-in-up">
          <span className="material-symbols-outlined mr-1.5 text-[16px]" aria-hidden="true">my_location</span> Scroll to Now
        </Button>
      )
    }>
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col pt-2 sm:pt-0">
        <HourlyScrollList
          ref={hourlyScrollRef}
          items={hourlySlice}
          displayTempUnit={displayTempUnit}
          displayWindUnit={displayWindUnit}
          showDayLabel={true}
        />
      </div>
    </Section>
  );
}
