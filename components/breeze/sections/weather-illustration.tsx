import { cn } from "@/lib/utils";

interface WeatherIllustrationProps {
  code: number;
  isDay: boolean;
  className?: string;
}

export function WeatherIllustration({ code, isDay, className }: WeatherIllustrationProps) {
  // Map WMO codes to general weather types for decoration
  const isClear = code === 0 || code === 1;
  const isCloudy = code === 2 || code === 3 || code === 45 || code === 48;
  const isRainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const isSnowy = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const isStormy = code >= 95;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40 mix-blend-overlay", className)}>
      {/* Sun/Moon Glow */}
      <div 
        className={cn(
          "absolute right-[-10%] sm:right-[5%] top-[-20%] sm:top-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[120px] transition-all duration-[2000ms] ease-in-out",
          isDay 
            ? isClear ? "bg-amber-400/60 scale-110" : "bg-orange-300/30 scale-100"
            : "bg-indigo-400/20 scale-90"
        )} 
      />

      {/* Decorative large icon based on weather */}
      <div className="absolute right-[-5%] sm:right-[10%] top-[5%] sm:top-[15%] opacity-50 flex items-center justify-center mix-blend-luminosity">
        {isClear && (
          <span 
            className="material-symbols-outlined text-[200px] sm:text-[300px] md:text-[400px] text-amber-500 animate-slow-spin"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            {isDay ? "sunny" : "clear_night"}
          </span>
        )}
        
        {isCloudy && (
          <span 
            className="material-symbols-outlined text-[200px] sm:text-[300px] md:text-[400px] text-slate-400 animate-pulse-cloud"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            cloud
          </span>
        )}

        {(isRainy || isStormy) && (
          <span 
            className="material-symbols-outlined text-[200px] sm:text-[300px] md:text-[400px] text-sky-600 animate-heavy-bounce"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            {isStormy ? "thunderstorm" : "rainy"}
          </span>
        )}

        {isSnowy && (
          <span 
            className="material-symbols-outlined text-[200px] sm:text-[300px] md:text-[400px] text-zinc-300 animate-slow-spin"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            weather_snowy
          </span>
        )}
      </div>

      {/* Additional environmental particles/layers can be added here */}
      {isRainy && (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-move-bg" />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slow-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse-cloud { 0%, 100% { transform: scale(1) translateY(0); opacity: 0.4; } 50% { transform: scale(1.05) translateY(-20px); opacity: 0.6; } }
        @keyframes float-cloud { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes heavy-bounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(40px); opacity: 0.8; } }
        @keyframes moveBg { 0% { background-position: 0 0; } 100% { background-position: 100% 100%; } }
        
        .animate-slow-spin { animation: slow-spin 60s linear infinite; }
        .animate-pulse-cloud { animation: pulse-cloud 10s ease-in-out infinite; }
        .animate-float { animation: float-cloud 8s ease-in-out infinite; }
        .animate-heavy-bounce { animation: heavy-bounce 6s ease-in-out infinite; }
        .animate-move-bg { animation: moveBg 20s linear infinite; }
      `}} />
    </div>
  );
}
