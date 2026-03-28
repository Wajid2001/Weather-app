"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeatherStore } from "@/lib/weather-store";
import type { GeoLocation } from "@/lib/weather-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SearchPillProps {
  className?: string;
}

export function SearchPill({ className = "" }: SearchPillProps) {
  const location = useWeatherStore((s) => s.location);
  const searchResults = useWeatherStore((s) => s.searchResults);
  const searchQuery = useWeatherStore((s) => s.searchQuery);
  const setSearchQuery = useWeatherStore((s) => s.setSearchQuery);
  const searching = useWeatherStore((s) => s.searching);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input display value with currently selected location
  useEffect(() => {
    if (location && !isOpen) {
      setInputValue(`${location.name}, ${location.country}`);
    }
  }, [location, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Reset input value to current location if closing without selection
        if (location) setInputValue(`${location.name}, ${location.country}`);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);
    setIsOpen(true);
  };

  const router = useRouter();

  const pushUrlParams = (loc: GeoLocation) => {
    const url = new URL(window.location.href);
    url.searchParams.set("lat", loc.latitude.toString());
    url.searchParams.set("lon", loc.longitude.toString());
    url.searchParams.set("name", loc.name);
    url.searchParams.set("country", loc.country);
    url.searchParams.set("tz", loc.timezone);
    router.push(url.pathname + url.search);
  };

  const handleSelect = (loc: GeoLocation) => {
    setInputValue(`${loc.name}, ${loc.country}`);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
    pushUrlParams(loc);
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Select all text on focus for easy re-search
    inputRef.current?.select();
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { searchLocationsAction } = await import("@/lib/actions");
        // Open-Meteo geocoding doesn't support reverse, so we'll create a location from coords
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const loc: GeoLocation = {
          id: Date.now(),
          name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
          latitude: lat,
          longitude: lon,
          country: "Current Location",
          country_code: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        // Try to find a real name
        try {
          const results = await searchLocationsAction(`${lat.toFixed(2)} ${lon.toFixed(2)}`, 1);
          if (results.length > 0) {
            pushUrlParams(results[0]);
            return;
          }
        } catch {
          // fallback to coords
        }
        pushUrlParams(loc);
      },
      () => {
        // Permission denied, do nothing
      }
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div 
        className="search-pill relative flex items-center w-full h-14 md:h-16 bg-surface rounded-full border border-border shadow-sm transition-all duration-200"
        role="search"
      >
        <div className="pl-5 md:pl-6 pr-2 md:pr-3 text-muted-foreground flex items-center justify-center">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">search</span>
        </div>
        <Input
          ref={inputRef}
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="flex-1 bg-transparent border-none text-base md:text-lg focus-visible:ring-0 shadow-none placeholder:text-muted-foreground px-2 h-full rounded-none"
          placeholder="Search for a location or coordinates..."
          id="location-search"
          autoComplete="off"
          aria-label="Search for a location"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results-list"
          aria-autocomplete="list"
        />

        {/* Loading spinner */}
        <div aria-live="polite" className="sr-only">
          {searching ? "Searching for locations..." : ""}
        </div>
        {searching && (
          <div className="pr-2 text-muted-foreground flex items-center">
            <span className="material-symbols-outlined text-[20px] animate-spin" aria-hidden="true">progress_activity</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={handleGeolocate}
          className="mr-3 md:mr-4 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer w-10 h-10 flex items-center justify-center"
          aria-label="Use current location"
          title="Use current location"
        >
          <span className="material-symbols-outlined" aria-hidden="true">my_location</span>
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <Card 
          id="search-results-list"
          role="listbox" 
          aria-label="Search Results"
          className="absolute z-50 mt-2 w-full shadow-lg overflow-hidden animate-slide-up rounded-xl border-border bg-surface"
        >
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-5 py-3.5 hover:bg-surface-dim transition-colors flex items-center gap-3 cursor-pointer group border-b border-border last:border-b-0 bg-transparent focus:bg-surface-dim focus:outline-none"
            >
              <span className="material-symbols-outlined text-muted-foreground text-xl group-hover:text-primary transition-colors" aria-hidden="true">
                location_on
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-semibold truncate">
                  {result.name}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {[result.admin1, result.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {result.country_code}
              </span>
            </button>
          ))}
        </Card>
      )}

      {/* No results message */}
      <div aria-live="polite" className="sr-only">
        {isOpen && searchQuery.trim().length > 2 && !searching && searchResults.length === 0 ? `No locations found for ${searchQuery}` : ""}
      </div>
      {isOpen && searchQuery.trim().length > 2 && !searching && searchResults.length === 0 && (
        <Card className="absolute z-50 mt-2 w-full p-5 text-center text-muted-foreground text-sm animate-slide-up rounded-xl shadow-lg border-border bg-surface">
          No locations found for &ldquo;{searchQuery}&rdquo;
        </Card>
      )}
    </div>
  );
}
