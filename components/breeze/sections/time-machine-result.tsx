import { type HistoricalResponse, getWeatherCondition, windDirectionLabel } from "@/lib/weather-api";

export function TimeMachineResult({
  tmResult,
  tmResultDate,
  locationName,
  locationCountry,
  tempUnitSymbol,
  precipUnitLabel,
  windUnitLabel,
}: {
  tmResult: HistoricalResponse;
  tmResultDate: string;
  locationName?: string;
  locationCountry?: string;
  tempUnitSymbol: string;
  precipUnitLabel: string;
  windUnitLabel: string;
}) {
  const tmDaily = tmResult.daily;
  if (!tmDaily) return null;

  const tmDayData = {
    maxTemp: Math.round(tmDaily.temperature_2m_max[0]),
    minTemp: Math.round(tmDaily.temperature_2m_min[0]),
    precip: tmDaily.precipitation_sum[0],
    weathercode: tmDaily.weathercode[0],
    windSpeed: Math.round(tmDaily.windspeed_10m_max[0]),
    windDir: tmDaily.winddirection_10m_dominant[0],
  };
  const tmCondition = getWeatherCondition(tmDayData.weathercode);

  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border animate-slide-up">
      <div className="h-1 w-full bg-accent-warm" />
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h3 className="text-foreground text-lg sm:text-xl font-bold mb-0.5">{locationName}, {locationCountry}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wider font-medium">
              {tmResultDate ? new Date(tmResultDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-border w-fit text-sm">
            <span className="material-symbols-outlined text-accent-warm text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{tmCondition.icon}</span>
            <span className="text-foreground font-semibold text-xs sm:text-sm">{tmCondition.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <span className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-[#f43f5e]">arrow_upward</span> Max
            </span>
            <div className="flex items-start">
              <span className="text-foreground text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "var(--font-data)" }}>{tmDayData.maxTemp}</span>
              <span className="text-muted-foreground text-lg sm:text-xl font-medium mt-1 ml-0.5">{tempUnitSymbol}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary">arrow_downward</span> Min
            </span>
            <div className="flex items-start">
              <span className="text-foreground text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "var(--font-data)" }}>{tmDayData.minTemp}</span>
              <span className="text-muted-foreground text-lg sm:text-xl font-medium mt-1 ml-0.5">{tempUnitSymbol}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-[#0ea5e9]">water_drop</span> Rain
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-data)" }}>{tmDayData.precip.toFixed(1)}</span>
              <span className="text-muted-foreground text-base sm:text-lg font-medium">{precipUnitLabel}</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 border-t border-border pt-2">
              {tmDayData.precip > 0
                ? `Wind: ${tmDayData.windSpeed} ${windUnitLabel} ${windDirectionLabel(tmDayData.windDir)}`
                : "No significant precipitation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
