import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import {
  fetchForecast,
  type ForecastResponse,
  type GeoLocation,
  type TempUnit,
  type WindSpeedUnit,
  type PrecipUnit,
} from './weather-api';
import { searchLocationsAction } from './actions';

export interface WeatherState {
  // Location
  location: GeoLocation | null;
  setLocation: (loc: GeoLocation) => void;

  // Forecast Data
  forecast: ForecastResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // Preferences
  tempUnit: TempUnit;
  setTempUnit: (u: TempUnit) => void;
  windUnit: WindSpeedUnit;
  setWindUnit: (u: WindSpeedUnit) => void;
  getPrecipUnit: () => PrecipUnit;

  // Saved Locations
  savedLocations: GeoLocation[];
  addSavedLocation: (loc: GeoLocation) => void;
  removeSavedLocation: (id: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: GeoLocation[];
  searching: boolean;
  searchDebounceTimeout: NodeJS.Timeout | null;
}

export const DEFAULT_LOCATION: GeoLocation = {
  id: 1857910,
  name: "Kyoto",
  latitude: 35.0117,
  longitude: 135.7683,
  country: "Japan",
  country_code: "JP",
  admin1: "Kyoto",
  timezone: "Asia/Tokyo",
};

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      location: null,
      forecast: null,
      loading: true, // starts loading until SSR injects state or hydrate fires
      error: null,
      
      tempUnit: "celsius",
      windUnit: "kmh",
      savedLocations: [],
      
      searchQuery: "",
      searchResults: [],
      searching: false,
      searchDebounceTimeout: null,

      setLocation: (loc) => {
        set({ location: loc });
        Cookies.set('breeze_location', JSON.stringify(loc), { expires: 365 });
      },

      setTempUnit: (u) => {
        set({ tempUnit: u });
        Cookies.set('breeze_temp_unit', u, { expires: 365 });
      },

      setWindUnit: (u) => {
        set({ windUnit: u });
        Cookies.set('breeze_wind_unit', u, { expires: 365 });
      },

      getPrecipUnit: () => {
        return get().tempUnit === "fahrenheit" ? "inch" : "mm";
      },

      addSavedLocation: (loc) => set((state) => {
        if (state.savedLocations.some((l) => l.id === loc.id)) return state;
        return { savedLocations: [...state.savedLocations, loc] };
      }),

      removeSavedLocation: (id) => set((state) => ({
        savedLocations: state.savedLocations.filter((l) => l.id !== id),
      })),

      refetch: async () => {
        const state = get();
        if (!state.location) return;
        
        set({ loading: true, error: null });
        try {
          const precip = state.tempUnit === "fahrenheit" ? "inch" : "mm";
          const data = await fetchForecast(state.location.latitude, state.location.longitude, {
            temperature_unit: state.tempUnit,
            windspeed_unit: state.windUnit,
            precipitation_unit: precip,
            timezone: state.location.timezone ?? "auto",
          });
          set({ forecast: data, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Failed to fetch forecast", loading: false });
        }
      },

      setSearchQuery: (q) => {
        set({ searchQuery: q });
        
        const state = get();
        if (state.searchDebounceTimeout) {
          clearTimeout(state.searchDebounceTimeout);
        }

        if (!q.trim()) {
          set({ searchResults: [], searchDebounceTimeout: null });
          return;
        }

        const timeout = setTimeout(async () => {
          set({ searching: true });
          try {
            const results = await searchLocationsAction(q, 6);
            set({ searchResults: results, searching: false });
          } catch {
            set({ searchResults: [], searching: false });
          }
        }, 600);

        set({ searchDebounceTimeout: timeout });
      },
    }),
    {
      name: 'breeze-storage',
      // ONLY persist local settings that don't mismatch SSR UI, 
      // location and units are SSR initialized via cookies to avoid hydration tree mismatch!
      partialize: (state) => ({
        savedLocations: state.savedLocations,
      }),
    }
  )
);
