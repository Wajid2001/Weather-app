"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Current", href: "#current", icon: "thermostat" },
  { label: "Hourly", href: "#hourly", icon: "schedule" },
  { label: "7-Day", href: "#forecast", icon: "calendar_month" },
  { label: "Time Machine", href: "#time-machine", icon: "history" },
  { label: "Settings", href: "#settings", icon: "settings" },
];

export function Header() {
  const [activeSection, setActiveSection] = useState("#current");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const ids = navLinks.map((l) => l.href.substring(1));
      let currentFound = false;
      
      // Loop from bottom to top to find the first section that is near the top of the viewport
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          // 150px provides enough offset for the sticky header
          if (rect.top <= 150) {
            setActiveSection(`#${ids[i]}`);
            currentFound = true;
            break;
          }
        }
      }
      
      // Fallback: if we are at the very top, make sure the first one is active
      if (!currentFound && window.scrollY < 100) {
        setActiveSection(`#${ids[0]}`);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Dynamically rendered sections (like Hourly, Forecast) need polling to be detected right after loading without scrolling
    const interval = setInterval(handleScroll, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header className="relative md:sticky top-0 z-40 flex items-center justify-center md:justify-between whitespace-nowrap border-b border-border bg-surface/90 backdrop-blur-lg px-4 sm:px-6 md:px-10 py-3 md:py-4">
        {/* Logo & Brand */}
        <button
          type="button"
          onClick={() => scrollTo("#current")}
          className="flex items-center gap-2 sm:gap-3 text-foreground group cursor-pointer"
        >
          <div className="size-5 sm:size-6 text-primary transition-transform duration-200 group-hover:scale-110">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-foreground text-lg sm:text-xl font-bold leading-tight tracking-tight">
            Breeze
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 bg-background/80 rounded-full px-1.5 py-1 border border-border">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-dim"
                )}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right padding on desktop to balance the logo */}
        <div className="hidden md:block w-6" />
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none flex justify-center">
        <nav className="pointer-events-auto bg-surface/95 backdrop-blur-xl border border-border/60 shadow-xl rounded-full px-2 py-2 flex items-center justify-between w-full max-w-[400px]">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.href}
                type="button"
                aria-label={link.label}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all duration-200 relative",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-surface-dim"
                )}
              >
                <span className="material-symbols-outlined text-[24px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined} aria-hidden="true">
                  {link.icon}
                </span>
                {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full hidden" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
