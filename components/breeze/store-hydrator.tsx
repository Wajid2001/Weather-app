"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useWeatherStore } from "@/lib/weather-store";
import type { GeoLocation, ForecastResponse, TempUnit, WindSpeedUnit } from "@/lib/weather-api";

interface HydratorProps {
  location: GeoLocation;
  tempUnit: TempUnit;
  windUnit: WindSpeedUnit;
  forecast: ForecastResponse | null;
  error: string | null;
  isCleanURL?: boolean;
}

export function StoreHydrator({ location, tempUnit, windUnit, forecast, error, isCleanURL }: HydratorProps) {
  const router = useRouter();
  const prevProps = useRef("");

  // Serialize props to detect any changes passed from server during router.refresh()
  const currentPropsStr = JSON.stringify({
    locationId: location?.id,
    tempUnit,
    windUnit,
    forecastTime: forecast?.current?.time,
    error
  });

  if (prevProps.current !== currentPropsStr) {
    // Only hydrate store if there's no fatal error overriding the ui
    if (!(error && !forecast)) {
      useWeatherStore.setState({
        location,
        tempUnit,
        windUnit,
        forecast,
        error,
        loading: false,
      });

      // Synchronize client-side cookies with the valid server props
      try {
        if (location) Cookies.set("breeze_location", JSON.stringify(location), { expires: 365 });
        Cookies.set("breeze_temp_unit", tempUnit, { expires: 365 });
        Cookies.set("breeze_wind_unit", windUnit, { expires: 365 });
      } catch {
        // Do nothing on cookie failure
      }

    } else {
      useWeatherStore.setState({ error, loading: false });
      // Schedule a revert of the URL back to our preserved working state
      setTimeout(() => {
        const state = useWeatherStore.getState();
        const url = new URL(window.location.href);
        if (state.location) {
          url.searchParams.set("lat", state.location.latitude.toString());
          url.searchParams.set("lon", state.location.longitude.toString());
          url.searchParams.set("name", state.location.name);
        }
        url.searchParams.set("tempUnit", state.tempUnit);
        url.searchParams.set("windUnit", state.windUnit);
        router.replace(url.pathname + url.search);
      }, 0);
    }
    prevProps.current = currentPropsStr;
  }
  
  // Clean URL TimeZone Redirection
  useEffect(() => {
    if (isCleanURL) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isUS = tz.startsWith("America/") && !tz.includes("Argentina") && !tz.includes("Sao_Paulo") && !tz.includes("Santiago");
      const isUK = tz === "Europe/London";
      
      const newTempUnit = isUS ? "fahrenheit" : "celsius";
      const newWindUnit = isUS || isUK ? "mph" : "kmh";

      const url = new URL(window.location.href);
      url.searchParams.set("tempUnit", newTempUnit);
      url.searchParams.set("windUnit", newWindUnit);
      url.searchParams.set("lat", location.latitude.toString());
      url.searchParams.set("lon", location.longitude.toString());
      url.searchParams.set("name", location.name);
      
      router.replace(url.pathname + url.search);
    }
  }, [isCleanURL, router, location]);

  useEffect(() => {
    // Force scroll strictly to top on page refresh/initial mount
    window.scrollTo(0, 0);
  }, []);

  return null;
}
