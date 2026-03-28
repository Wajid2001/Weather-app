"use client";

import { useState, useCallback } from "react";
import { useWeatherStore } from "@/lib/weather-store";
import { Section } from "./section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type HistoricalResponse } from "@/lib/weather-api";
import { fetchHistoricalWeatherAction } from "@/lib/actions";
import { TimeMachineResult } from "./time-machine-result";
import { useEffect } from "react";

function getLastYearISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

export function TimeMachine() {
  const location = useWeatherStore((s) => s.location);
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const getPrecipUnit = useWeatherStore((s) => s.getPrecipUnit);
  const precipUnit = getPrecipUnit();

  const [tmDate, setTmDate] = useState<string>(getLastYearISO);
  const [tmResult, setTmResult] = useState<HistoricalResponse | null>(null);
  const [tmResultDate, setTmResultDate] = useState("");
  const [tmLoading, setTmLoading] = useState(false);
  const [tmError, setTmError] = useState<string | null>(null);

  const handleTimeMachineFetch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setTmLoading(true);
      setTmError(null);
      setTmResult(null);
      try {
        if (!location) throw new Error("Please select a location first.");
        
        const selectedDate = new Date(tmDate + "T00:00:00");
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (selectedDate > yesterday) throw new Error("Date must be in the past.");
        if (selectedDate < new Date("1940-01-01")) throw new Error("Data available from 1940 onwards.");

        const data = await fetchHistoricalWeatherAction(location.latitude, location.longitude, tmDate, tmDate, {
          temperature_unit: tempUnit,
          windspeed_unit: windUnit,
          precipitation_unit: precipUnit === "inch" ? "inch" : "mm",
          timezone: location.timezone ?? "auto",
        });
        setTmResult(data);
        setTmResultDate(tmDate);
      } catch (err) {
        setTmError(err instanceof Error ? err.message : "Failed to fetch.");
      } finally {
        setTmLoading(false);
      }
    },
    [location, tmDate, tempUnit, windUnit, precipUnit]
  );

  useEffect(() => {
    if (location && !tmResult && !tmLoading && !tmError) {
      handleTimeMachineFetch();
    }
  }, [location, tmResult, tmLoading, tmError, handleTimeMachineFetch]);

  const tmUnitSymbol = tempUnit === "fahrenheit" ? "°F" : "°C";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  const precipUnitLabel = precipUnit === "inch" ? "in" : "mm";
  const windUnitLabel = windUnit === "mph" ? "mph" : windUnit === "ms" ? "m/s" : "km/h";

  return (
    <Section id="time-machine" title="Time Machine" icon="history">
      <p className="text-muted-foreground text-sm sm:text-base mb-5 sm:mb-6 max-w-xl">
        Look up historical weather for <strong className="text-foreground">{location?.name ?? "the selected location"}</strong> on any date, as far back as 1940.
      </p>

      <form onSubmit={handleTimeMachineFetch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6 max-w-xl">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
            <span className="material-symbols-outlined text-muted-foreground text-lg sm:text-xl">calendar_month</span>
          </div>
          <Input type="date" value={tmDate} onChange={(e) => setTmDate(e.target.value)} max={maxDate} min="1940-01-01"
            className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-4 bg-surface text-sm sm:text-base font-medium"
            id="time-machine-date" />
        </div>
        <Button type="submit" disabled={tmLoading || !location} size="lg"
          className="h-12 sm:h-14 px-5 sm:px-8 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto bg-primary text-white shadow-sm hover:bg-primary/90">
          {tmLoading ? (
            <><span className="material-symbols-outlined text-lg sm:text-[20px] animate-spin">progress_activity</span> Loading…</>
          ) : (
            <><span className="material-symbols-outlined text-lg sm:text-[20px]">history</span> Fetch</>
          )}
        </Button>
      </form>

      {tmError && (
        <div className="bg-destructive-10 border border-destructive rounded-xl p-4 mb-4 text-center">
          <p className="text-destructive text-sm font-medium">{tmError}</p>
        </div>
      )}

      {tmResult && (
        <TimeMachineResult
          tmResult={tmResult}
          tmResultDate={tmResultDate}
          locationName={location?.name}
          locationCountry={location?.country}
          tempUnitSymbol={tmUnitSymbol}
          precipUnitLabel={precipUnitLabel}
          windUnitLabel={windUnitLabel}
        />
      )}
    </Section>
  );
}
