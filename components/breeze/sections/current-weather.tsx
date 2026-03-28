"use client";

import { useWeatherStore } from "@/lib/weather-store";
import { SearchPill } from "@/components/breeze/search-pill";
import { MetricCard } from "@/components/breeze/metric-card";
import { WeatherIllustration } from "./weather-illustration";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  getWeatherCondition,
  windDirectionLabel,
  uvLevel,
  getCurrentHourIndex,
  estimateDewPoint,
} from "@/lib/weather-api";

export function CurrentWeather() {
  const router = useRouter();
  const location = useWeatherStore((s) => s.location);
  const forecast = useWeatherStore((s) => s.forecast);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  
  const tempUnit = useWeatherStore((s) => s.tempUnit);
  const windUnit = useWeatherStore((s) => s.windUnit);
  const getPrecipUnit = useWeatherStore((s) => s.getPrecipUnit);

  const current = forecast?.current;
  const daily = forecast?.daily;
  const hourly = forecast?.hourly;
  const precipUnit = getPrecipUnit();

  const condition = current ? getWeatherCondition(current.weathercode) : null;
  const conditionIcon = condition
    ? current?.is_day ? condition.iconDay : condition.iconNight
    : "partly_cloudy_day";

  const temp = current ? Math.round(current.temperature) : "--";
  const unitLabel = tempUnit === "fahrenheit" ? "°F" : "°C";
  const highTemp = daily ? Math.round(daily.temperature_2m_max[0]) : "--";
  const lowTemp = daily ? Math.round(daily.temperature_2m_min[0]) : "--";

  const windSpeed = current ? Math.round(current.windspeed) : "--";
  const windUnitLabel = windUnit === "mph" ? "mph" : windUnit === "ms" ? "m/s" : "km/h";
  const windDir = current ? windDirectionLabel(current.winddirection) : "--";

  const humidity = current ? current.relative_humidity : "--";
  const dewPoint = current
    ? (() => {
        let tempC = current.temperature;
        if (tempUnit === "fahrenheit") tempC = (tempC - 32) * (5 / 9);
        const dp = estimateDewPoint(tempC, current.relative_humidity);
        if (tempUnit === "fahrenheit") return Math.round(dp * (9 / 5) + 32);
        return dp;
      })()
    : "--";

  const hourIdx = hourly ? getCurrentHourIndex(hourly.time) : 0;
  const precipProb = hourly ? hourly.precipitation_probability[hourIdx] : 0;
  const precipAmount = current ? current.precipitation : 0;
  const precipUnitLabel = precipUnit === "inch" ? "in" : "mm";

  const currentUV = hourly ? Math.round(hourly.uv_index[hourIdx] ?? 0) : 0;
  const { label: uvLabelText, color: uvColor } = uvLevel(currentUV);
  const peakUV = daily ? Math.round(daily.uv_index_max[0]) : 0;

  const feelsLike = current ? Math.round(current.apparent_temperature) : "--";
  const cloudCover = current ? current.cloud_cover : "--";
  const pressure = current ? Math.round(current.surface_pressure) : "--";

  const sunrise = daily?.sunrise?.[0]
    ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--";
  const sunset = daily?.sunset?.[0]
    ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--";

  return (
    <div
      id="current"
      className="relative overflow-hidden scroll-mt-20 w-full bg-gradient-to-b from-surface to-background px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-12 pb-8 sm:pb-12 md:pb-16"
    >
      {!loading && current && (
        <WeatherIllustration code={current.weathercode} isDay={current.is_day ? true : false} />
      )}
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="relative z-50">
          <SearchPill className="w-full max-w-[640px] mx-auto mb-8 sm:mb-10 md:mb-14" />
        </div>

        {error && (
          <div className="w-full max-w-[640px] mx-auto bg-destructive-10 border border-destructive rounded-xl p-4 mb-6 flex items-center justify-between gap-4 shadow-sm animate-fade-in-up" role="alert" aria-live="assertive">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-destructive text-xl" aria-hidden="true">error</span>
              <p className="text-destructive text-sm font-medium text-left">{error}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => router.refresh()} className="whitespace-nowrap flex items-center gap-1.5 font-semibold" aria-label="Retry loading weather">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
            </Button>
          </div>
        )}

        {loading && (
          <div className="animate-pulse flex flex-col lg:flex-row gap-8 lg:gap-16 items-start" aria-label="Loading local weather" aria-live="polite">
            <div className="flex flex-col flex-1 w-full lg:min-w-[300px]" aria-hidden="true">
              <div className="h-10 sm:h-12 w-48 bg-surface-dim rounded-lg mb-3" />
              <div className="h-5 sm:h-6 w-32 bg-surface-dim rounded mb-6" />
              <div className="h-24 sm:h-32 w-40 sm:w-48 bg-surface-dim rounded-xl" />
              <div className="flex gap-4 mt-4 sm:mt-6">
                <div className="h-5 w-16 bg-surface-dim rounded" />
                <div className="h-5 w-16 bg-surface-dim rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full max-w-[504px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-surface-dim rounded-xl border border-border" />
              ))}
            </div>
          </div>
        )}

        {!loading && forecast && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24 items-start">
            <div className="flex flex-col flex-1 min-w-0 w-full lg:w-auto">
              <div className="mb-3 sm:mb-4">
                <h1 className="text-foreground font-bold tracking-tight leading-none text-4xl sm:text-5xl md:text-6xl mb-1 sm:mb-2">
                  {location?.name ?? "—"}
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] sm:text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    aria-hidden="true"
                  >
                    {conditionIcon}
                  </span>
                  {condition?.label ?? "—"}
                </p>
              </div>

              <div className="relative inline-flex items-start">
                <span
                  className="font-bold text-foreground text-7xl sm:text-8xl md:text-9xl lg:text-[140px] xl:text-[160px] leading-none tracking-tighter"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {temp}
                </span>
                <span
                  className="font-bold text-foreground text-2xl sm:text-3xl md:text-5xl lg:text-6xl mt-2 sm:mt-3 md:mt-5 lg:mt-6"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {unitLabel}
                </span>
              </div>

              <div className="flex gap-4 mt-4 sm:mt-6 md:mt-8 text-muted-foreground font-medium text-sm sm:text-base">
                <span>H: {highTemp}°</span>
                <span>L: {lowTemp}°</span>
                <span className="hidden sm:inline">Feels like: {feelsLike}°</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full lg:max-w-[480px]">
              <MetricCard icon="air" label="Wind" value={windSpeed} unit={windUnitLabel} detail={`Dir: ${windDir}`} />
              <MetricCard icon="humidity_percentage" label="Humidity" value={humidity} unit="%" detail={`Dew: ${dewPoint}°`} />
              <MetricCard icon="rainy" label="Precip" value={typeof precipAmount === 'number' ? precipAmount.toFixed(1) : precipAmount} unit={precipUnitLabel} detail={`${precipProb}% chance`} />
              <MetricCard icon="wb_sunny" label="UV Index" value={currentUV} unit={uvLabelText} unitColor={uvColor} detail={`Peak: ${peakUV}`} glow />
            </div>
          </div>
        )}

        {!loading && forecast && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 sm:mt-8">
            <MetricCard compact icon="device_thermostat" label="Feels Like" value={feelsLike} unit={unitLabel} />
            <MetricCard compact icon="cloud" label="Cloud Cover" value={cloudCover} unit="%" />
            <MetricCard compact icon="compress" label="Pressure" value={pressure} unit="hPa" />
            <MetricCard compact icon="wb_twilight" label="Sunrise" value={sunrise} unit={`↓ ${sunset}`} />
          </div>
        )}
      </div>
    </div>
  );
}
