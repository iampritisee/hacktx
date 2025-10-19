'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import RacerDot from '@/app/components/racerdot.jsx';
import Leaderboard from '@/app/components/leaderboard.jsx';
import trackImage from '../../../public/coda.png';
import Image from 'next/image';

export default function RaceTrack({ startIndividual = false }) {
  const [activeTab, setActiveTab] = useState('idle');

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
    { x: 94, y: 16, turn: 'Turn 11', type: 'turn' },
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

  // 20 Racers now:
  const allRacers = useMemo(() => [
    { id: 'verstappen', flag: '🇳🇱', driverName: 'M. Verstappen', color: '#0600ef', delay: 0 },
    { id: 'hamilton', flag: '🇬🇧', driverName: 'L. Hamilton', color: '#00d2be', delay: 0 },
    { id: 'leclerc', flag: '🇲🇨', driverName: 'C. Leclerc', color: '#dc0000', delay: 0 },
    { id: 'norris', flag: '🇬🇧', driverName: 'L. Norris', color: '#ff8700', delay: 0 },
    { id: 'sainz', flag: '🇪🇸', driverName: 'C. Sainz', color: '#dc0000', delay: 0 },
    { id: 'alonso', flag: '🇪🇸', driverName: 'F. Alonso', color: '#005aff', delay: 0 },
    { id: 'bottas', flag: '🇫🇮', driverName: 'V. Bottas', color: '#ffffff', delay: 0 },
    { id: 'perez', flag: '🇲🇽', driverName: 'S. Perez', color: '#e10000', delay: 0 },
    { id: 'ricciardo', flag: '🇦🇺', driverName: 'D. Ricciardo', color: '#ffcc00', delay: 0 },
    { id: 'gasly', flag: '🇫🇷', driverName: 'P. Gasly', color: '#0033a0', delay: 0 },
    { id: 'tsunoda', flag: '🇯🇵', driverName: 'Y. Tsunoda', color: '#c70039', delay: 0 },
    { id: 'stroll', flag: '🇨🇦', driverName: 'L. Stroll', color: '#005eab', delay: 0 },
    { id: 'zhou', flag: '🇨🇳', driverName: 'G. Zhou', color: '#f4b400', delay: 0 },
    { id: 'schumacher', flag: '🇩🇪', driverName: 'M. Schumacher', color: '#ff0000', delay: 0 },
    { id: 'vettel', flag: '🇩🇪', driverName: 'S. Vettel', color: '#ff4c00', delay: 0 },
    { id: 'latifi', flag: '🇨🇦', driverName: 'N. Latifi', color: '#0073cf', delay: 0 },
    { id: 'mick', flag: '🇩🇪', driverName: 'M. Schumacher', color: '#cc0000', delay: 0 },
    { id: 'russell', flag: '🇬🇧', driverName: 'G. Russell', color: '#b1b1b1', delay: 0 },
    { id: 'ocon', flag: '🇫🇷', driverName: 'E. Ocon', color: '#009bda', delay: 0 },
    { id: 'alle', flag: '🇺🇸', driverName: 'A. Alle', color: '#ffffff', delay: 0, glow: true },
  ], []);

  const individualRacer = useMemo(() => [
    { id: 'alle', flag: '🇺🇸', driverName: 'A. Alle', color: '#ffffff', delay: 0, glow: true },
  ], []);

  const racers = useMemo(() => {
    if (activeTab === 'individual') return individualRacer;
    if (activeTab === 'full') return allRacers;
    return [];
  }, [activeTab, allRacers, individualRacer]);

  const maxLaps = useMemo(() => (activeTab === 'individual' ? 3 : activeTab === 'full' ? 50 : 0), [activeTab]);

  const [positions, setPositions] = useState({});
  const [rankings, setRankings] = useState([]);
  const prevRanksRef = useRef([]);

  const seqRef = useRef(0);

  const handleProgress = (id, pointIndex, lap) => {
    const seq = ++seqRef.current;
    setPositions((prev) => ({
      ...prev,
      [id]: { pointIndex, lap, seq },
    }));
  };

  useEffect(() => {
    const sorted = [...racers]
      .map((racer) => {
        const pos = positions[racer.id] || { pointIndex: 0, lap: 1, seq: 0 };
        return { ...racer, lap: pos.lap, pointIndex: pos.pointIndex, seq: pos.seq };
      })
      .sort((a, b) => {
        if (b.lap !== a.lap) return b.lap - a.lap;
        if (b.pointIndex !== a.pointIndex) return b.pointIndex - a.pointIndex;
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

    const isSame =
      newRankings.length === rankings.length &&
      newRankings.every((r, i) => r.id === rankings[i]?.id && r.rank === rankings[i]?.rank);

    if (!isSame) {
      setRankings(newRankings);
      prevRanksRef.current = newRankings;
    }
  }, [positions, racers, rankings]);

  useEffect(() => {
    setPositions({});
    setRankings([]);
    prevRanksRef.current = [];
  }, [activeTab]);

  // Get leader lap or fallback
  const leaderLap = rankings.length > 0 ? rankings[0].lap : 0;
  useEffect(() => {
    setActiveTab(startIndividual ? 'individual' : 'idle');
  }, [startIndividual]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[1800px] mx-auto">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-7 md:gap-8 w-full h-[500px]">
          {/* Leaderboard */}
          <div
            className="w-[40%] lg-w-[50%] border border-gray-700 rounded-lg p-3 bg-gray-900 flex flex-col"
            style={{ maxHeight: '720px' }}
          >
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex-grow pr-2">
              <Leaderboard rankings={rankings} maxLaps={maxLaps} />
            </div>
          </div>

          {/* Race Track */}
          <div className="w-[60%] bg-white rounded-2xl shadow-2xl p-4 md:p-8 relative">
            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
              <Image
                src={trackImage}
                alt="Racing Track"
                className="absolute inset-0 w-full h-full object-contain"
                width={1000}
                height={1000}
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
                  glow={racer.glow}
                />
              ))}
              {/*bg-green-500*/ }
              {trackPath.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-2 h-2 rounded-full opacity-40" 
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={point.turn}
                />
              ))}

              {/* Lap Counter Bottom Right */}
              {maxLaps > 0 && (
                <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-lg font-semibold shadow-lg select-none">
                  Lap: {leaderLap} / {maxLaps}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}