"use server";

import { searchLocations as apiSearch, fetchHistoricalWeather as apiHistorical, fetchDayHourlyForecast } from "./weather-api";
import type { GeoLocation, HistoricalResponse, HourlyForecast, TempUnit, WindSpeedUnit, PrecipUnit } from "./weather-api";

/**
 * Server Action to search locations from Open-Meteo via the Next.js backend.
 */
export async function searchLocationsAction(query: string, count = 5): Promise<GeoLocation[]> {
  return apiSearch(query, count);
}

/**
 * Server Action to fetch historical data from Open-Meteo via the Next.js backend.
 */
export async function fetchHistoricalWeatherAction(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  options?: {
    temperature_unit?: TempUnit;
    windspeed_unit?: WindSpeedUnit;
    precipitation_unit?: PrecipUnit;
    timezone?: string;
  }
): Promise<HistoricalResponse> {
  return apiHistorical(latitude, longitude, startDate, endDate, options);
}

/**
 * Server Action to fetch specific day hourly forecast
 */
export async function fetchDayHourlyAction(
  latitude: number,
  longitude: number,
  dateStr: string,
  options?: {
    temperature_unit?: TempUnit;
    windspeed_unit?: WindSpeedUnit;
    precipitation_unit?: PrecipUnit;
    timezone?: string;
  }
): Promise<HourlyForecast> {
  return fetchDayHourlyForecast(latitude, longitude, dateStr, options);
}
