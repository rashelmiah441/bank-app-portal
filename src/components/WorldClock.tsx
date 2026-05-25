"use client";

import { useState, useEffect } from "react";

const timeZones = [
  { name: "Ontario", tz: "America/Toronto" },
  { name: "England", tz: "Europe/London" },
  { name: "New Zealand", tz: "Pacific/Auckland" },
  { name: "Bangladesh", tz: "Asia/Dhaka" },
];

export default function WorldClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(mountTimer);
      clearInterval(timer);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-12 bg-gray-100 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-blue-50/50">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {timeZones.map((zone) => (
          <div key={zone.name} className="flex flex-col">
            <span className="text-xs text-gray-500">{zone.name}</span>
            <span className="text-lg font-mono font-bold text-gray-900 whitespace-nowrap">
              {time.toLocaleTimeString("en-GB", {
                timeZone: zone.tz,
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="text-xs text-gray-400">
               {time.toLocaleDateString("en-GB", {
                timeZone: zone.tz,
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
