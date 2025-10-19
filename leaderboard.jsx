'use client';

import React, { useEffect, useState } from "react";

export default function Leaderboard({ rankings, maxLaps }) {
  // Track which racers have visible arrows
  const [visibleChanges, setVisibleChanges] = useState({});

  useEffect(() => {
    // When rankings update, show arrows for racers who have changes
    const racersWithChanges = {};
    rankings.forEach(racer => {
      if (racer.change !== 0) {
        racersWithChanges[racer.id] = true;
      }
    });
    setVisibleChanges(racersWithChanges);

    // Set timer to hide arrows after 5 seconds
    const timer = setTimeout(() => {
      setVisibleChanges({});
    }, 5000);

    // Cleanup timer if rankings change before 5 sec
    return () => clearTimeout(timer);
  }, [rankings]);

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 text-left">
        🏆 Leaderboard
      </h2>
      <div className="space-y-2">
        {rankings.map((racer, index) => (
          <div
            key={racer.id}
            className="flex items-center justify-between border-b border-gray-700 py-2"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-lg font-bold text-white w-6 text-right">
                {index + 1}
              </div>
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: racer.color }}
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{racer.driverName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-gray-400">
                Lap {racer.lap}/{maxLaps}
              </div>
              {visibleChanges[racer.id] && racer.change > 0 && (
                <span className="text-green-400 font-semibold">
                  ↑{racer.change}
                </span>
              )}
              {visibleChanges[racer.id] && racer.change < 0 && (
                <span className="text-red-400 font-semibold">
                  ↓{Math.abs(racer.change)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
