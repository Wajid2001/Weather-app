"use client";

import { useWeatherStore } from "@/lib/weather-store";
import { Section } from "./section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WindSpeedUnit } from "@/lib/weather-api";
import { useRouter } from "next/navigation";

export function Settings() {
  const location = useWeatherStore((s) => s.location);
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const router = useRouter();
  
  const savedLocations = useWeatherStore((s) => s.savedLocations);
  const addSavedLocation = useWeatherStore((s) => s.addSavedLocation);
  const removeSavedLocation = useWeatherStore((s) => s.removeSavedLocation);

  const displayTempUnit = tempUnit === "fahrenheit" ? "F" : "C";
  const displayWindUnit = windUnit;

  const pushUrlParams = (updates: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    router.push(url.pathname + url.search, { scroll: false });
  };

  return (
    <Section id="settings" title="Settings" icon="settings" className="pb-12 sm:pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Units Card */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-sm">
          <h3 className="text-foreground text-base sm:text-lg font-bold mb-4 sm:mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg sm:text-xl">thermostat</span> Units
          </h3>
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Temperature */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-medium text-foreground">Temperature</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Celsius / Fahrenheit</p>
              </div>
              <div className="flex bg-background p-1 rounded-lg border border-border relative h-9 sm:h-10">
                <div className="absolute inset-y-1 w-[calc(50%-4px)] bg-surface rounded-md shadow-sm border border-border unit-toggle" style={{ left: displayTempUnit === "C" ? "4px" : "calc(50%)" }} />
                {(["C", "F"] as const).map((u) => (
                  <button key={u} type="button" onClick={() => {
                      const newUnit = u === "F" ? "fahrenheit" : "celsius";
                      pushUrlParams({ tempUnit: newUnit });
                    }}
                    className={cn("relative z-10 px-4 sm:px-5 text-xs sm:text-sm rounded-md transition-colors cursor-pointer", displayTempUnit === u ? "font-bold text-foreground" : "font-medium text-muted-foreground hover:text-foreground")}>
                    °{u}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Wind */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <p className="text-sm sm:text-base font-medium text-foreground">Wind Speed</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Measurement format</p>
              </div>
              <div className="flex bg-background p-1 rounded-lg border border-border relative h-9 sm:h-10">
                <div className="absolute inset-y-1 w-[calc(33.33%-4px)] bg-surface rounded-md shadow-sm border border-border unit-toggle" style={{ left: displayWindUnit === "mph" ? "4px" : displayWindUnit === "kmh" ? "33.33%" : "66.66%" }} />
                {(["mph", "kmh", "ms"] as WindSpeedUnit[]).map((unit) => (
                  <button key={unit} type="button" onClick={() => {
                      pushUrlParams({ windUnit: unit });
                    }}
                    className={cn("relative z-10 px-3 sm:px-4 text-xs sm:text-sm rounded-md transition-colors cursor-pointer w-full", displayWindUnit === unit ? "font-bold text-foreground" : "font-medium text-muted-foreground hover:text-foreground")}>
                    {unit === "kmh" ? "km/h" : unit === "ms" ? "m/s" : unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Locations Card */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-foreground text-base sm:text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl">bookmark</span> Saved Locations
            </h3>
            {location && (
              <Button variant="ghost" size="sm" onClick={() => addSavedLocation(location)}
                className="text-xs sm:text-sm text-primary hover:text-primary hover:bg-primary/10 font-medium flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span> Save current
              </Button>
            )}
          </div>

          {savedLocations.length > 0 ? (
            <ul className="flex flex-col gap-2 sm:gap-3">
              {savedLocations.map((loc) => (
                <li key={loc.id}
                  className="group flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:border-muted-foreground hover:bg-surface-dim transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    pushUrlParams({ lat: loc.latitude.toString(), lon: loc.longitude.toString(), name: loc.name, country: loc.country, tz: loc.timezone });
                  }} role="button" tabIndex={0}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter" || e.key === " ") {
                      pushUrlParams({ lat: loc.latitude.toString(), lon: loc.longitude.toString(), name: loc.name, country: loc.country, tz: loc.timezone });
                    }
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                      <span className="material-symbols-outlined text-base sm:text-lg">location_on</span>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-foreground leading-tight">{loc.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{loc.country}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${loc.name}`}
                    onClick={(e) => { e.stopPropagation(); removeSavedLocation(loc.id); }}
                    className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">delete</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-muted-foreground mb-2">bookmark_border</span>
              <p className="text-muted-foreground text-xs sm:text-sm">No saved locations yet.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
