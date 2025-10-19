"use client";

import React from "react";

export default function Leaderboard({ rankings, maxLaps }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4 text-left">
        🏆 Leaderboard
      </h2>

      {/* Bordered container */}
      <div className="border border-gray-600 rounded-lg p-2">
        {/* Scrollable leaderboard container */}
        <div
          className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-700"
          style={{ maxHeight: '700px' }}
        >
          {rankings.map((racer, index) => (
            <div
              key={racer.id}
              className="flex items-center justify-between border-b border-gray-700 py-2"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-lg font-bold text-white w-6 text-right">
                  {index + 1}
                </div>

                {/* Avatar Dot with optional glow */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: racer.color,
                    boxShadow: racer.glow
                      ? `0 0 6px ${racer.color}, 0 0 10px ${racer.color}`
                      : "none",
                  }}
                />

                <div className="flex-1">
                  <div className="text-white text-sm font-medium">
                    {racer.driverName}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="text-gray-400">
                  Lap {racer.lap}/{maxLaps}
                </div>
                {racer.change > 0 && (
                  <span className="text-green-400 font-semibold">
                    ↑{racer.change}
                  </span>
                )}
                {racer.change < 0 && (
                  <span className="text-red-400 font-semibold">
                    ↓{Math.abs(racer.change)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}