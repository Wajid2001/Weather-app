/**
 * Open-Meteo API integration layer
 * Docs: https://open-meteo.com/en/docs
 *
 * Endpoints used:
 *  - Geocoding:   https://geocoding-api.open-meteo.com/v1/search
 *  - Forecast:    https://api.open-meteo.com/v1/forecast
 *  - Historical:  https://archive-api.open-meteo.com/v1/archive
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string; // state / region
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
  is_day: number;
  relative_humidity: number;
  apparent_temperature: number;
  precipitation: number;
  cloud_cover: number;
  surface_pressure: number;
}

export interface HourlyForecast {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weathercode: number[];
  windspeed_10m: number[];
  winddirection_10m: number[];
  uv_index: number[];
  is_day: number[];
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  windspeed_10m_max: number[];
  winddirection_10m_dominant: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  hourly_units: Record<string, string>;
  daily_units: Record<string, string>;
}

export interface HistoricalDaily {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
  winddirection_10m_dominant: number[];
}

export interface HistoricalResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  daily: HistoricalDaily;
  daily_units: Record<string, string>;
}

export type TempUnit = "celsius" | "fahrenheit";
export type WindSpeedUnit = "kmh" | "mph" | "ms";
export type PrecipUnit = "mm" | "inch";

// ─── WMO Weather Code Mapping ────────────────────────────────────────────────

export interface WeatherCondition {
  label: string;
  icon: string; // Material Symbols Outlined icon name
  iconDay: string;
  iconNight: string;
}

export const WMO_CODES: Record<number, WeatherCondition> = {
  0:  { label: "Clear Sky",            icon: "clear_day",            iconDay: "clear_day",            iconNight: "clear_night" },
  1:  { label: "Mainly Clear",         icon: "clear_day",            iconDay: "clear_day",            iconNight: "clear_night" },
  2:  { label: "Partly Cloudy",        icon: "partly_cloudy_day",    iconDay: "partly_cloudy_day",    iconNight: "partly_cloudy_night" },
  3:  { label: "Overcast",             icon: "cloud",                iconDay: "cloud",                iconNight: "cloud" },
  45: { label: "Fog",                  icon: "foggy",                iconDay: "foggy",                iconNight: "foggy" },
  48: { label: "Depositing Rime Fog",  icon: "foggy",                iconDay: "foggy",                iconNight: "foggy" },
  51: { label: "Light Drizzle",        icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  53: { label: "Moderate Drizzle",     icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  55: { label: "Dense Drizzle",        icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  56: { label: "Light Freezing Drizzle", icon: "weather_snowy",      iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  57: { label: "Dense Freezing Drizzle", icon: "weather_snowy",      iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  61: { label: "Slight Rain",          icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  63: { label: "Moderate Rain",        icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  65: { label: "Heavy Rain",           icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  66: { label: "Light Freezing Rain",  icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  67: { label: "Heavy Freezing Rain",  icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  71: { label: "Slight Snow Fall",     icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  73: { label: "Moderate Snow Fall",   icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  75: { label: "Heavy Snow Fall",      icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  77: { label: "Snow Grains",          icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  80: { label: "Slight Rain Showers",  icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  81: { label: "Moderate Rain Showers",icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  82: { label: "Violent Rain Showers", icon: "rainy",                iconDay: "rainy",                iconNight: "rainy" },
  85: { label: "Slight Snow Showers",  icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  86: { label: "Heavy Snow Showers",   icon: "weather_snowy",        iconDay: "weather_snowy",        iconNight: "weather_snowy" },
  95: { label: "Thunderstorm",         icon: "thunderstorm",         iconDay: "thunderstorm",         iconNight: "thunderstorm" },
  96: { label: "Thunderstorm with Slight Hail", icon: "thunderstorm", iconDay: "thunderstorm",        iconNight: "thunderstorm" },
  99: { label: "Thunderstorm with Heavy Hail",  icon: "thunderstorm", iconDay: "thunderstorm",        iconNight: "thunderstorm" },
};

export function getWeatherCondition(code: number): WeatherCondition {
  return WMO_CODES[code] ?? { label: "Unknown", icon: "help", iconDay: "help", iconNight: "help" };
}

export function getWeatherColor(code: number, isDay = true): string {
  if (code <= 1) return isDay ? "text-yellow-500" : "text-indigo-300"; // clear
  if (code === 2) return isDay ? "text-sky-300" : "text-indigo-200"; // partly cloudy
  if (code === 3) return "text-slate-400"; // overcast
  if (code >= 45 && code <= 48) return "text-slate-300"; // fog
  if (code >= 51 && code <= 55) return "text-sky-300"; // drizzle
  if (code >= 61 && code <= 65) return "text-blue-500"; // rain
  if (code >= 66 && code <= 77) return "text-blue-200"; // snow
  if (code >= 80 && code <= 82) return "text-blue-500"; // rain showers
  if (code >= 85 && code <= 86) return "text-blue-200"; // snow showers
  if (code >= 95) return "text-purple-400"; // thunderstorms
  return "text-foreground";
}

// ─── API Functions ───────────────────────────────────────────────────────────

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HISTORY_URL = "https://archive-api.open-meteo.com/v1/archive";

/**
 * Search for locations by name using Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string, count = 5): Promise<GeoLocation[]> {
  if (!query.trim()) return [];

  const raw = query.trim();

  // Parse coordinate format "lat, lon" or "lat lon"
  const coordRegex = /^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/;
  const match = raw.match(coordRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [{
        id: Date.now(),
        name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        latitude: lat,
        longitude: lon,
        country: "Coordinates",
        country_code: "N/A",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }];
    }
  }

  const params = new URLSearchParams({
    name: raw,
    count: String(count),
    language: "en",
    format: "json",
  });

  const res = await fetch(`${GEOCODING_URL}?${params}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.statusText}`);

  const data = await res.json();
  return (data.results ?? []) as GeoLocation[];
}

/**
 * Fetch the full weather forecast (current + hourly + 7-day daily).
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  options?: {
    temperature_unit?: TempUnit;
    windspeed_unit?: WindSpeedUnit;
    precipitation_unit?: PrecipUnit;
    timezone?: string;
    forecast_days?: number;
  }
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    // Current weather variables
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weathercode",
      "cloud_cover",
      "surface_pressure",
      "windspeed_10m",
      "winddirection_10m",
    ].join(","),
    // Hourly variables
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weathercode",
      "windspeed_10m",
      "winddirection_10m",
      "uv_index",
      "is_day",
    ].join(","),
    // Daily variables
    daily: [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "windspeed_10m_max",
      "winddirection_10m_dominant",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
    temperature_unit: options?.temperature_unit ?? "celsius",
    windspeed_unit: options?.windspeed_unit ?? "kmh",
    precipitation_unit: options?.precipitation_unit ?? "mm",
    timezone: options?.timezone ?? "auto",
    forecast_days: String(options?.forecast_days ?? 7),
    past_days: "7",
  });

  const res = await fetch(`${FORECAST_URL}?${params}`, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error(`Forecast failed: ${res.statusText}`);

  const data = await res.json();

  // Map the "current" block field names to our interface
  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    windspeed: data.current.windspeed_10m,
    winddirection: data.current.winddirection_10m,
    weathercode: data.current.weathercode,
    time: data.current.time,
    is_day: data.current.is_day,
    relative_humidity: data.current.relative_humidity_2m,
    apparent_temperature: data.current.apparent_temperature,
    precipitation: data.current.precipitation,
    cloud_cover: data.current.cloud_cover,
    surface_pressure: data.current.surface_pressure,
  };

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    timezone: data.timezone,
    timezone_abbreviation: data.timezone_abbreviation,
    current,
    hourly: data.hourly,
    daily: data.daily,
    hourly_units: data.hourly_units,
    daily_units: data.daily_units,
  };
}

/**
 * Fetch hourly forecast explicitly locked to a specific date range.
 */
export async function fetchDayHourlyForecast(
  latitude: number,
  longitude: number,
  dateStr: string, // YYYY-MM-DD
  options?: {
    temperature_unit?: TempUnit;
    windspeed_unit?: WindSpeedUnit;
    precipitation_unit?: PrecipUnit;
    timezone?: string;
  }
): Promise<HourlyForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: dateStr,
    end_date: dateStr,
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weathercode",
      "windspeed_10m",
      "winddirection_10m",
      "uv_index",
      "is_day",
    ].join(","),
    temperature_unit: options?.temperature_unit ?? "celsius",
    windspeed_unit: options?.windspeed_unit ?? "kmh",
    precipitation_unit: options?.precipitation_unit ?? "mm",
    timezone: options?.timezone ?? "auto",
  });

  const res = await fetch(`${FORECAST_URL}?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Day Forecast failed: ${res.statusText}`);

  const data = await res.json();
  return data.hourly as HourlyForecast;
}

/**
 * Fetch historical weather data for a given date range.
 */
export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  options?: {
    temperature_unit?: TempUnit;
    windspeed_unit?: WindSpeedUnit;
    precipitation_unit?: PrecipUnit;
    timezone?: string;
  }
): Promise<HistoricalResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    daily: [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "windspeed_10m_max",
      "winddirection_10m_dominant",
    ].join(","),
    temperature_unit: options?.temperature_unit ?? "celsius",
    windspeed_unit: options?.windspeed_unit ?? "kmh",
    precipitation_unit: options?.precipitation_unit ?? "mm",
    timezone: options?.timezone ?? "auto",
  });

  const res = await fetch(`${HISTORY_URL}?${params}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Historical weather failed: ${res.statusText}`);

  const data = await res.json();
  if (data.error) throw new Error(data.reason ?? "Historical fetch error");

  return data as HistoricalResponse;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get cardinal wind direction from degrees.
 */
export function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

/**
 * Get the UV risk level label + color.
 */
export function uvLevel(index: number): { label: string; color: string } {
  if (index <= 2) return { label: "Low", color: "#4ade80" };
  if (index <= 5) return { label: "Moderate", color: "#E2A973" };
  if (index <= 7) return { label: "High", color: "#fb923c" };
  if (index <= 10) return { label: "Very High", color: "#ef4444" };
  return { label: "Extreme", color: "#a855f7" };
}

/**
 * Get the current hour's index in hourly arrays.
 */
export function getCurrentHourIndex(hourlyTimes: string[]): number {
  const currentLocalTime = Date.now();
  let closestIndex = 0;
  let minDiff = Infinity;
  hourlyTimes.forEach((isoString, index) => {
    const diff = Math.abs(new Date(isoString).getTime() - currentLocalTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = index;
    }
  });
  return closestIndex;
}

/**
 * Get the dew point estimate from temperature and humidity.
 * Magnus formula approximation.
 */
export function estimateDewPoint(tempC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  return Math.round((b * alpha) / (a - alpha));
}
