# Breeze Weather

Breeze is a modern, hyper-responsive weather application built with a focus on seamless user experience, clean aesthetics, and blistering performance. It delivers real-time weather data, 7-day accurate forecasts securely fetched from the Open-Meteo API, and features a "Time Machine" mode to review historical weather spanning back to 1940.

## Core Features & Sections

### 1. Unified Current Weather Display
Instantly view precisely located, current environmental metrics. Using dynamic `WMO` (World Meteorological Organization) code mapping, the interface parses real-time temperature, wind vectors, and local precipitation limits with custom contextual colorization rendering directly onto native Google Material Icons.

### 2. 24-Hour Floating Forecast
A fully horizontal list automatically mapping ±12 hours of localized meteorological trajectory spanning outwards from the absolute current hour. It inherently centers you exactly to the dynamically mapped "Now" mark and relies on Intersection Observers to spawn a "Scroll to Now" tether component exactly when you pan out of sight.

### 3. Asynchronously Rendered 7-Day Forecast
The 7-Day Forecast serves as a structurally tight accordion component holding macro-level data ranges. When clicked, it activates Next.js's bleeding-edge `useTransition` hooks to fire secure backend Server Actions that strictly lazy-load the deeper, day-focused sub-hourly datasets asynchronously behind the scenes. This architectural pivot means the DOM stays incredibly lightweight on first-load!

### 4. Historic "Time Machine" Lookup
Delve into Open-Meteo's `archive-api` data extending all the way back to the 1940s. Upon navigating to this widget, it explicitly preloads yesterday's identical locale conditions on load to serve as a baseline. Custom date-picker functionality seamlessly validates data backwards natively.

### 5. Configurable URL-Bound Settings
Persistent "URL-as-State" mappings mean users aren't reliant strictly on isolated React Context. Temperature scales (Fahrenheit / Celsius) and specific units for precipitation/wind directly hydrate through deeply configurable settings seamlessly routing back.

## Technologies Used

*   **Next.js 14/15 (App Router):** Leveraged for Server-Side Rendering (SSR) and aggressive API request caching to provide instant load times.
*   **React (Server & Client Components):** Employed for highly interactive UI states seamlessly merging tightly with server actions.
*   **Zustand:** Provides decoupled, lightweight, and blazingly fast global state management synced persistently across user sessions via cookies.
*   **Tailwind CSS:** Fully handles responsive, atomic design principles with a finely tuned set of bespoke colors supporting the beautiful "Breeze Minimal" design paradigm.
*   **shadcn/ui & Radix UI:** Accessible, headless layout components that provide the foundation for interactive UI parts.
*   **Open-Meteo API:** A free and powerful open-source data suite utilized for all real-time, geocoding, and historical telemetry data. 

## Design Choices & Architecture

1.  **URL as the First-Class State (SSR First):** User locality mapping and custom format preferences are synced bidirectionally to caching cookies. This guarantees that initial document loads are perfectly Server-Side Rendered (hydration matches the UI beautifully, ending hydration mismatches).
2.  **Next.js Native Data Fetching:** We moved away from repetitive client-side request spam by completely adapting into Next.js's Data Cache. The app only calls out to external endpoints when the data is realistically stale. For example, historical data in the Time Machine is cached for effectively 24 hours globally, while forecast data validates every 15 minutes.
3.  **Breeze Minimal UI:** The interface removes all chaotic, heavily bloated "weather widgets" and instead focuses on sharp, monolithic data blocks utilizing bespoke Google variable fonts. The UI seamlessly utilizes conditional gradient logic representing physical day-night time cycles and WMO code mappings to inject color efficiently across icons rather than loading heavy weather-image assets.
4.  **Actionable & Modular Components:** Complicated interfaces (like the 7-day accordion system) pull components out on-demand using modern React `useTransition` paradigms connected directly to backend Server Actions `fetchDayHourlyAction`. This keeps the DOM lightweight until the user actively interact with deeper forecast elements.

---

## Setup and Installation

Follow these steps to spin up the localized Next.js development server:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or later)
*   [Bun](https://bun.sh/) (preferred package manager) or `npm`/`yarn`/`pnpm`.

### Installation

1.  **Clone the repository** (if applicable) and navigate to the project directory:
    ```bash
    cd Weather-app
    ```

2.  **Install the dependencies:**
    ```bash
    bun install
    ```
    *(Or substitute `npm install`, `yarn`, etc. based on your active manager)*

3.  **Run the local development server:**
    ```bash
    bun run dev
    ```

4.  **View the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your web browser. The app will immediately request and map your geolocation based intuitively on your browser's preset timezone natively. No Open-Meteo API keys are required for the telemetry endpoints used!

---

## Folder Structure Summary

*   `/app`: The Next.js App Router core containing `page.tsx` and layout shells.
*   `/components/breeze`: The bespoke functional components strictly tailored for this UI (e.g., `<Header />`, `<CurrentWeather />`, `<DailyForecast />`).
*   `/lib/weather-api.ts`: Formatted native fetch endpoints wrapping around Open-Meteo logic.
*   `/lib/weather-store.ts`: The unified Zustand state tree binding UI reactivity explicitly to browser preferences.
*   `/lib/actions.ts`: Secure backend server actions bypassing the exposure of endpoint manipulations to the client network tab.
