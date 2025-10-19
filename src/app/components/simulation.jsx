'use client'
import React from "react";
import RacerDot from "@/app/components/racerdot.jsx";
import Leaderboard from "@/app/components/leaderboard.jsx";
import { useState, useEffect, useRef } from "react";
import trackImage from "../../../public/coda.png";
import Image from "next/image";

export default function RaceTrack() {
  const trackPath = [
    { x: 6, y: 50, turn: "Start", type:"straight" },
    { x: 32, y: 90, turn: "Turn 01",type:"turn" },
    { x: 33, y: 88, turn: "Turn 01 s" , type:"straight"  },
    { x: 32, y: 70, turn: "Turn 02", type:"turn"  },
    { x: 34, y: 70, turn: "Turn 02s", type:"straight"  },
    { x: 43, y: 59, turn: "Turn 03", type: "turn" },
    { x: 44, y: 55, turn: "Turn 04", type:"straight"  },
    { x: 49, y: 50, turn: "Turn 05", type: "turn" },
    { x: 50, y: 48, turn: "Turn 05s", type: "straight" },
    { x: 54, y: 39, turn: "Turn 06", type: "turn" },
    { x: 56, y: 39, turn: "Turn 06s", type: "straight" },
    { x: 62, y: 44, turn: "Turn 07", type: "turn"  },
    { x: 64, y: 42, turn: "Turn 07s", type: "straight"  },
    { x: 69, y: 36, turn: "turn 08", type: "turn"  },
    { x: 70, y: 37, turn: "turn 08s", type: "straight"  },
    { x: 72, y: 42, turn: "Turn 09", type: "turn" },
    { x: 74, y: 42, turn: "Turn 09s", type: "straight" },
    { x: 82, y: 39, turn: "Turn 10", type: "turn"  },
    { x: 84, y: 37, turn: "Turn 10s", type: "straight"  },
    { x: 94, y: 15, turn: "Turn 11", type: "turn"  },
    { x: 92, y: 16, turn: "Turn 11s", type: "straight"  },
    { x: 38, y: 26, turn: "Turn 12 Apex", type: "turn"  },
    { x: 37, y: 28, turn: "Turn 12 Apexs", type: "straight"  },
    { x: 42, y: 42, turn: "Turn 13 Exit", type: "turn"  },
    { x: 40, y: 42, turn: "Turn 13 Exit s", type: "straight"  },
    { x: 37, y: 41, turn: "Turn 14", type: "turn"  },
    { x: 36, y: 39, turn: "Turn 14", type: "straight"  },
    { x: 33, y: 32, turn: "Turn 15", type: "turn"  },
    { x: 32, y: 32, turn: "Turn 15s", type: "straight"  },
    { x: 35, y: 50, turn: "Turn 16", type: "turn"  },
    { x: 34, y: 53, turn: "Turn 16s", type: "straight"  },
    { x: 34, y: 54, turn: "Turn 17", type: "turn"  },
    { x: 32, y: 56, turn: "Turn 17s", type: "straight"  },
    { x: 25, y: 57, turn: "Turn 18", type: "turn"  },
    { x: 23, y: 55, turn: "Turn 18", type: "straight"  },
    { x: 18, y: 39, turn: "Turn 19", type: "turn"  },
    { x: 16, y: 39, turn: "Turn 19s", type: "straight"  },
    { x: 4, y: 47, turn: "Turn 20", type: "turn"  },
    { x: 5, y: 49, turn: "Turn 20", type: "straight"  },
    { x: 6, y: 50, turn: "Finish" },
  ];

  const racers = [
    { id: "verstappen", flag: "🇳🇱", driverName: "M. Verstappen", color: "#0600ef", delay: 0 },
    { id: "hamilton", flag: "🇬🇧", driverName: "L. Hamilton", color: "#00d2be", delay: 300 },
    { id: "leclerc", flag: "🇲🇨", driverName: "C. Leclerc", color: "#dc0000", delay: 600 },
    { id: "norris", flag: "🇬🇧", driverName: "L. Norris", color: "#ff8700", delay: 900 },
    { id: "sainz", flag: "🇪🇸", driverName: "C. Sainz", color: "#dc0000", delay: 1200 },
  ];

  const maxLaps = 50;
  const [positions, setPositions] = useState({});
  const [rankings, setRankings] = useState([]);
  const prevRanksRef = useRef([]);

  const handleProgress = (id, pointIndex, lap) => {
    setPositions((prev) => ({ 
      ...prev, 
      [id]: { pointIndex, lap } 
    }));
  };

  useEffect(() => {
    const sorted = [...racers]
      .map((racer) => {
        const pos = positions[racer.id] || { pointIndex: 0, lap: 1 };
        return {
          ...racer,
          progress: (pos.lap - 1) * trackPath.length + pos.pointIndex,
          lap: pos.lap,
        };
      })
      .sort((a, b) => b.progress - a.progress);

    const newRankings = sorted.map((racer, index) => {
      const prevRank = prevRanksRef.current.findIndex((r) => r.id === racer.id);
      const delta = prevRank === -1 ? 0 : prevRank - index;
      return {
        ...racer,
        rank: index + 1,
        change: delta,
      };
    });

    setRankings(newRankings);
    prevRanksRef.current = newRankings;
  }, [positions]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full max-w-[1800px] mx-auto">
        <div className="w-full lg:w-[30%]">
          <Leaderboard rankings={rankings} maxLaps={maxLaps} />
        </div>

        <div className="w-full lg:w-[70%] bg-white rounded-2xl shadow-2xl p-4 md:p-8">
          <div className="relative w-full" style={{ paddingBottom: "60%" }}>
            <Image
              src={trackImage}
              alt="Racing Track"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {racers.map((racer) => (
              <RacerDot
                key={racer.id}
                id={racer.id}
                color={racer.color}
                delay={racer.delay}
                trackPath={trackPath}
                onProgress={handleProgress}
                maxLaps={maxLaps}
              />
            ))}

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