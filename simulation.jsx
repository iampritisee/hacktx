'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import RacerDot from '@/app/components/racerdot.jsx';
import Leaderboard from '@/app/components/leaderboard.jsx';
import trackImage from '../../../public/coda.png';
import Image from 'next/image';

export default function RaceTrack() {
  const [activeTab, setActiveTab] = useState('full');

  const trackPath = useMemo(() => [
    { x: 6, y: 50, turn: 'Start', type: 'straight' },
    { x: 32, y: 90, turn: 'Turn 01', type: 'turn' },
    { x: 32, y: 70, turn: 'Turn 02', type: 'turn' },
    { x: 43, y: 59, turn: 'Turn 03', type: 'turn' },
    { x: 49, y: 50, turn: 'Turn 05', type: 'turn' },
    { x: 54, y: 39, turn: 'Turn 06', type: 'turn' },
    { x: 62, y: 44, turn: 'Turn 07', type: 'turn' },
    { x: 69, y: 36, turn: 'turn 08', type: 'turn' },
    { x: 72, y: 42, turn: 'Turn 09', type: 'turn' },
    { x: 82, y: 39, turn: 'Turn 10', type: 'turn' },
    { x: 94, y: 15, turn: 'Turn 11', type: 'turn' },
    { x: 38, y: 26, turn: 'Turn 12 Apex', type: 'turn' },
    { x: 42, y: 42, turn: 'Turn 13 Exit', type: 'turn' },
    { x: 37, y: 41, turn: 'Turn 14', type: 'turn' },
    { x: 33, y: 32, turn: 'Turn 15', type: 'turn' },
    { x: 35, y: 50, turn: 'Turn 16', type: 'turn' },
    { x: 34, y: 54, turn: 'Turn 17', type: 'turn' },
    { x: 25, y: 57, turn: 'Turn 18', type: 'turn' },
    { x: 18, y: 39, turn: 'Turn 19', type: 'turn' },
    { x: 4, y: 47, turn: 'Turn 20', type: 'turn' },
    { x: 6, y: 50, turn: 'Finish', type: 'straight' },
  ], []);

  const allRacers = useMemo(() => [
    { id: 'verstappen', flag: '🇳🇱', driverName: 'M. Verstappen', color: '#0600ef', delay: 0 },
    { id: 'hamilton', flag: '🇬🇧', driverName: 'L. Hamilton', color: '#00d2be', delay: 300 },
    { id: 'leclerc', flag: '🇲🇨', driverName: 'C. Leclerc', color: '#dc0000', delay: 600 },
    { id: 'norris', flag: '🇬🇧', driverName: 'L. Norris', color: '#ff8700', delay: 900 },
    { id: 'sainz', flag: '🇪🇸', driverName: 'C. Sainz', color: '#dc0000', delay: 1200 },
  ], []);

  const individualRacer = useMemo(() => [
    { id: 'verstappen', flag: '🇳🇱', driverName: 'M. Verstappen', color: '#0600ef', delay: 0 },
  ], []);

  // Memoize racers so reference stays stable unless activeTab changes
  const racers = useMemo(() => {
    return activeTab === 'individual' ? individualRacer : allRacers;
  }, [activeTab, allRacers, individualRacer]);

  const maxLaps = useMemo(() => (activeTab === 'individual' ? 3 : 50), [activeTab]);

  const [positions, setPositions] = useState({});
  const [rankings, setRankings] = useState([]);
  const prevRanksRef = useRef([]);

  const seqRef = useRef(0);

const handleProgress = (id, pointIndex, lap) => {
      const seq = ++seqRef.current; // increment sequence number on each update
      setPositions(prev => ({
        ...prev,
        [id]: { pointIndex, lap, seq }, // add seq here
      }));
    };

    useEffect(() => {
      const sorted = [...racers]
        .map(racer => {
          const pos = positions[racer.id] || { pointIndex: 0, lap: 1, seq: 0 };
          return { ...racer, lap: pos.lap, pointIndex: pos.pointIndex, seq: pos.seq };
        })
        .sort((a, b) => {
          if (b.lap !== a.lap) return b.lap - a.lap;
          if (b.pointIndex !== a.pointIndex) return b.pointIndex - a.pointIndex;
          // If same lap and pointIndex, racer with lower seq arrived earlier
          return a.seq - b.seq;
        });

    const newRankings = sorted.map((racer, index) => {
      const prevRank = prevRanksRef.current.findIndex((r) => r.id === racer.id);
      const delta = prevRank === -1 ? 0 : prevRank - index;
      return {
        ...racer,
        rank: index + 1,
        change: delta,
      };
    });

    // Only update rankings if changed to avoid infinite loop
    const isSame =
      newRankings.length === rankings.length &&
      newRankings.every(
        (r, i) => r.id === rankings[i]?.id && r.rank === rankings[i]?.rank
      );

    if (!isSame) {
      setRankings(newRankings);
      prevRanksRef.current = newRankings;
    }
  }, [positions, racers, rankings]);

  // Reset when tab changes
  useEffect(() => {
    setPositions({});
    setRankings([]);
    prevRanksRef.current = [];
  }, [activeTab]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[1800px] mx-auto">
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('full')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'full'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Full Race
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'individual'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Individual Test Run
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full">
          <div className="w-full lg:w-[30%]">
            <Leaderboard rankings={rankings} maxLaps={maxLaps} />
          </div>

          <div className="w-full lg:w-[70%] bg-white rounded-2xl shadow-2xl p-4 md:p-8">
            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
              <Image
                src={trackImage}
                alt="Racing Track"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {racers.map((racer) => (
                <RacerDot
                  key={`${racer.id}-${activeTab}`}
                  id={racer.id}
                  color={racer.color}
                  delay={racer.delay}
                  trackPath={trackPath}
                  onProgress={handleProgress}
                  maxLaps={maxLaps}
                  mode={activeTab}
                />
              ))}
              {trackPath.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-2 h-2 bg-green-500 rounded-full opacity-40"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={point.turn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
