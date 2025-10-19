"use client"

import React from "react";

export default function Leaderboard({ rankings, maxLaps }) {
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
              {racer.change > 0 && (
                  <span className="text-green-400 font-semibold bg-black text-lg px-1 rounded">
                    ↑{racer.change}
                  </span>
                )}
                {racer.change < 0 && (
                  <span className="text-red-400 font-semibold bg-black text-lg px-1 rounded">
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