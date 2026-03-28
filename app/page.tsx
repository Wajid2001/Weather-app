import { cookies } from "next/headers";
import { Header } from "@/components/breeze/header";
import { CurrentWeather } from "@/components/breeze/sections/current-weather";
import { HourlyForecast } from "@/components/breeze/sections/hourly-forecast";
import { DailyForecast } from "@/components/breeze/sections/daily-forecast";
import { TimeMachine } from "@/components/breeze/sections/time-machine";
import { Settings } from "@/components/breeze/sections/settings";
import { StoreHydrator } from "@/components/breeze/store-hydrator";
import { fetchForecast, type TempUnit, type WindSpeedUnit } from "@/lib/weather-api";
import { DEFAULT_LOCATION } from "@/lib/weather-store";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const cookieStore = await cookies();
  const search = await searchParams;
  
  // Read location query params first, else cookie or default
  let location = DEFAULT_LOCATION;
  if (search.lat && search.lon) {
    location = {
      id: Math.round(parseFloat(search.lat) * 1000 + parseFloat(search.lon) * 1000),
      latitude: parseFloat(search.lat),
      longitude: parseFloat(search.lon),
      name: search.name || "Custom Location",
      country: search.country || "",
      country_code: "",
      timezone: search.tz || "auto"
    };
  } else {
    const locCookie = cookieStore.get("breeze_location");
    if (locCookie?.value) {
      try { 
        location = JSON.parse(decodeURIComponent(locCookie.value)); 
      } catch {}
    }
  }
  
  // Read units from query params first, else cookie or defaults
  const queryTemp = search.tempUnit as TempUnit | undefined;
  const tempUnit: TempUnit = queryTemp || (cookieStore.get("breeze_temp_unit")?.value as TempUnit) || "celsius";

  const queryWind = search.windUnit as WindSpeedUnit | undefined;
  const windUnit: WindSpeedUnit = queryWind || (cookieStore.get("breeze_wind_unit")?.value as WindSpeedUnit) || "kmh";
  
  const precipUnit = tempUnit === "fahrenheit" ? "inch" : "mm";
  
  // Flag to know if we are on a clean URL needing timezone auto-detect
  const isCleanURL = !search.lat && !search.tempUnit && !search.windUnit;
  
  // Server Side Render Fetch!
  let forecast = null;
  let error = null;
  try {
    forecast = await fetchForecast(location.latitude, location.longitude, {
      temperature_unit: tempUnit,
      windspeed_unit: windUnit,
      precipitation_unit: precipUnit,
      timezone: location.timezone ?? "auto",
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch weather on server";
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <StoreHydrator 
        location={location} 
        tempUnit={tempUnit} 
        windUnit={windUnit} 
        forecast={forecast} 
        error={error} 
        isCleanURL={isCleanURL}
      />
      <Header />

      <main className="flex-1 flex flex-col items-center">
        <CurrentWeather />

        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex flex-col gap-10 sm:gap-14 md:gap-16">
          <HourlyForecast />
          <DailyForecast />
          <TimeMachine />
          <Settings />
        </div>
      </main>
    </div>
  );
}
