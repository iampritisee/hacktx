import React from "react";
import RacerDot from "./racerdot.jsx"; // adjust import if needed

export default function RaceTrack() {
  const trackPath = [
    { x: 6, y: 50, turn: "Start" },
    { x: 32, y: 90, turn: "Turn 01" },
    { x: 32, y: 70, turn: "Turn 02" },
    { x: 43, y: 59, turn: "Turn 03" },
    { x: 44, y: 55, turn: "Turn 04" },
    { x: 49, y: 50, turn: "Turn 05" },
    { x: 54, y: 39, turn: "Turn 06" },
    { x: 62, y: 44, turn: "Turn 07" },
    { x: 69, y: 36, turn: "Turn 08" },
    { x: 72, y: 42, turn: "Turn 09" },
    { x: 82, y: 39, turn: "Turn 10" },
    { x: 94, y: 15, turn: "Turn 11" },
    { x: 38, y: 26, turn: "Turn 12 Apex" },
    { x: 42, y: 42, turn: "Turn 13 Exit" },
    { x: 37, y: 41, turn: "Turn 14" },
    { x: 33, y: 32, turn: "Turn 15" },
    { x: 35, y: 50, turn: "Turn 16" },
    { x: 34, y: 54, turn: "Turn 17" },
    { x: 25, y: 57, turn: "Turn 18" },
    { x: 18, y: 39, turn: "Turn 19" },
    { x: 4, y: 47, turn: "Turn 20" },
    { x: 6, y: 50, turn: "Finish" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Racing Track Animation
          </h1>
          <p className="text-gray-400 text-lg">
            Watch the racers follow the path in real-time
          </p>
        </div>

        {/* Track Area */}
        <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="relative w-full" style={{ paddingBottom: "60%" }}>
            <img
              src="/images/Gemini_Generated_Image_gl6goxgl6goxgl6g-Photoroom.png"
              alt="Racing Track"
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Racer Dots */}
            <RacerDot trackPath={trackPath} color="#facc15" delay={0} />
            <RacerDot trackPath={trackPath} color="#3b82f6" delay={300} />
            <RacerDot trackPath={trackPath} color="#ef4444" delay={600} />

            {/* Add more racers if needed */}

            {/* Turn Markers */}
            {trackPath.map((point, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-green-500 rounded-full opacity-40"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                title={point.turn}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
