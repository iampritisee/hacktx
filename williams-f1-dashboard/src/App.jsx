import React, { useState } from 'react';
import { ChevronRight, User, Calendar, LogOut, Play, CheckCircle, Settings } from 'lucide-react';

const WilliamsF1Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [currentPage, setCurrentPage] = useState('profile');
  const [selectedRace, setSelectedRace] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [liveComments, setLiveComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [expandedRaces, setExpandedRaces] = useState({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    stability_bias: 0.8,
    steering_weight_preference: 'medium',
    throttle_linearity: 0.85,
    brake_pedal_linearity: 0.90,
    aggression: 0.2
  });

  const livePositions = [
    { position: 1, driver: 'M. Verstappen', team: 'Red Bull', interval: 'Leader' },
    { position: 2, driver: 'L. Norris', team: 'McLaren', interval: '+2.145' },
    { position: 3, driver: 'C. Leclerc', team: 'Ferrari', interval: '+5.234' },
    { position: 4, driver: 'O. Piastri', team: 'McLaren', interval: '+8.456' },
    { position: 5, driver: 'G. Russell', team: 'Mercedes', interval: '+12.567' },
    { position: 6, driver: 'L. Hamilton', team: 'Mercedes', interval: '+15.678' },
    { position: 7, driver: 'C. Sainz', team: 'Ferrari', interval: '+18.789' },
    { position: 8, driver: 'S. Perez', team: 'Red Bull', interval: '+21.890' },
    { position: 9, driver: 'F. Alonso', team: 'Aston Martin', interval: '+25.012' },
    { position: 10, driver: 'L. Stroll', team: 'Aston Martin', interval: '+28.123' },
    { position: 11, driver: 'P. Gasly', team: 'Alpine', interval: '+31.234' },
    { position: 12, driver: 'Y. Tsunoda', team: 'RB', interval: '+35.345' },
    { position: 13, driver: 'A. Albon', team: 'Williams', interval: '+38.456' },
    { position: 14, driver: 'A. Alle', team: 'Williams', interval: '+42.567' },
    { position: 15, driver: 'N. Hulkenberg', team: 'Haas', interval: '+45.678' },
    { position: 16, driver: 'K. Magnussen', team: 'Haas', interval: '+48.789' },
    { position: 17, driver: 'V. Bottas', team: 'Sauber', interval: '+52.890' },
    { position: 18, driver: 'G. Zhou', team: 'Sauber', interval: '+56.012' },
    { position: 19, driver: 'D. Ricciardo', team: 'RB', interval: '+1 Lap' },
    { position: 20, driver: 'E. Ocon', team: 'Alpine', interval: '+1 Lap' }
  ];

  const gridPositions = [
    { position: 1, driver: 'M. Verstappen', team: 'Red Bull Racing', time: '1:28.987' },
    { position: 2, driver: 'L. Norris', team: 'McLaren', time: '1:29.145' },
    { position: 3, driver: 'C. Leclerc', team: 'Ferrari', time: '1:29.234' },
    { position: 4, driver: 'O. Piastri', team: 'McLaren', time: '1:29.456' },
    { position: 5, driver: 'G. Russell', team: 'Mercedes', time: '1:29.567' },
    { position: 6, driver: 'L. Hamilton', team: 'Mercedes', time: '1:29.678' },
    { position: 7, driver: 'C. Sainz', team: 'Ferrari', time: '1:29.789' },
    { position: 8, driver: 'S. Perez', team: 'Red Bull Racing', time: '1:29.890' },
    { position: 9, driver: 'F. Alonso', team: 'Aston Martin', time: '1:30.012' },
    { position: 10, driver: 'L. Stroll', team: 'Aston Martin', time: '1:30.123' },
    { position: 11, driver: 'P. Gasly', team: 'Alpine', time: '1:30.234' },
    { position: 12, driver: 'Y. Tsunoda', team: 'RB', time: '1:30.345' },
    { position: 13, driver: 'A. Albon', team: 'Williams', time: '1:30.456' },
    { position: 14, driver: 'F. Colapinto', team: 'Williams', time: '1:30.567' },
    { position: 15, driver: 'N. Hulkenberg', team: 'Haas', time: '1:30.678' },
    { position: 16, driver: 'K. Magnussen', team: 'Haas', time: '1:30.789' },
    { position: 17, driver: 'V. Bottas', team: 'Sauber', time: '1:30.890' },
    { position: 18, driver: 'G. Zhou', team: 'Sauber', time: '1:31.012' },
    { position: 19, driver: 'D. Ricciardo', team: 'RB', time: '1:31.123' },
    { position: 20, driver: 'E. Ocon', team: 'Alpine', time: '1:31.234' }
  ];

  const drivers = [
    { id: 1, name: 'Carlos Sainz', number: 55, years: '16 seasons', age: 31, podiums: 2, points: 38, races: 18, championships: 0, topSpeed: '342 km/h', avgPosition: 13.1 },
    { id: 2, name: 'Anish Alle', number: 4, years: '1 season', age: 19, podiums: 0, points: 12, races: 8, championships: 0, topSpeed: '328 km/h', avgPosition: 19.2 }
  ];

  const races = [
    { id: 1, name: 'United States Grand Prix', date: 'Oct 17-19', circuit: 'Circuit of the Americas', laps: 56, sprint: true, trackimage: '/tracks/austin.png'},
    { id: 2, name: 'Singapore Grand Prix', date: 'Oct 3-5', circuit: 'Marina Bay Street Circuit', laps: 62, trackimage: '/tracks/marina bay.png' },
    { id: 3, name: 'Azerbaijan Grand Prix', date: 'Sep 19-21', circuit: 'Baku City Circuit', laps: 51, trackimage: '/tracks/azerbaijan.png' },
    { id: 4, name: 'Italian Grand Prix', date: 'Sep 5-7', circuit: 'Autodromo Nazionale di Monza', laps: 53, trackimage: '/tracks/italymonza.png' },
    { id: 5, name: 'Dutch Grand Prix', date: 'Aug 29-31', circuit: 'Circuit Zandvoort', laps: 72, trackimage: '/tracks/netherlands.png' },
    { id: 6, name: 'Hungarian Grand Prix', date: 'Aug 1-3', circuit: 'Hungaroring', laps: 70, trackimage: '/tracks/hungary.png' },
    { id: 7, name: 'Belgian Grand Prix', date: 'Jul 25-27', circuit: 'Circuit de Spa-Francorchamps', laps: 44, sprint: true, trackimage: '/tracks/belgium.png' },
    { id: 8, name: 'British Grand Prix', date: 'Jul 4-6', circuit: 'Silverstone Circuit', laps: 52, trackimage: '/tracks/great britain.png' },
    { id: 9, name: 'Austrian Grand Prix', date: 'Jun 27-29', circuit: 'Red Bull Ring', laps: 71, trackimage: '/tracks/austria.png' },
    { id: 10, name: 'Canadian Grand Prix', date: 'Jun 13-15', circuit: 'Circuit Gilles Villeneuve', laps: 70, trackimage: '/tracks/canada.png' },
    { id: 11, name: 'Spanish Grand Prix', date: 'May 30-Jun 1', circuit: 'Circuit de Barcelona-Catalunya', laps: 66, trackimage: '/tracks/spain.png' },
    { id: 12, name: 'Monaco Grand Prix', date: 'May 23-25', circuit: 'Circuit de Monaco', laps: 78, trackimage: '/tracks/monaco.png' },
    { id: 13, name: 'Emilia Romagna Grand Prix', date: 'May 16-18', circuit: 'Autodromo Enzo e Dino Ferrari', laps: 63, trackimage: '/tracks/italy.png' },
    { id: 14, name: 'Miami Grand Prix', date: 'May 2-4', circuit: 'Miami International Autodrome', laps: 57, sprint: true, trackimage: '/tracks/miami.png' },
    { id: 15, name: 'Saudi Arabian Grand Prix', date: 'Apr 18-20', circuit: 'Jeddah Corniche Circuit', laps: 50, trackimage: '/tracks/jeddah.png' },
    { id: 16, name: 'Bahrain Grand Prix', date: 'Apr 11-13', circuit: 'Bahrain International Circuit', laps: 57, trackimage: '/tracks/bahrain.png' },
    { id: 17, name: 'Japanese Grand Prix', date: 'Apr 4-6', circuit: 'Suzuka Circuit', laps: 53, trackimage: '/tracks/japan.png' },
    { id: 18, name: 'Chinese Grand Prix', date: 'Mar 21-23', circuit: 'Shanghai International Circuit', laps: 56, sprint: true, trackimage: '/tracks/china.png' },
    { id: 19, name: 'Australian Grand Prix', date: 'Mar 14-16', circuit: 'Albert Park Circuit', laps: 58, trackimage: '/tracks/australia.png' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) setIsLoggedIn(true);
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    setCurrentPage('profile');
  };

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    setRaceStarted(false);
    setRaceFinished(false);
    setLiveComments([]);
  };

  const handleStartRace = () => {
    setRaceStarted(true);
    setLiveComments([
      { lap: 1, time: '14:02:15', comment: 'Clean start. P12 holding position.' },
      { lap: 1, time: '14:02:45', comment: 'Tire temps: FL 85°C, FR 87°C, RL 83°C, RR 84°C' }
    ]);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const lap = Math.floor(Math.random() * 20) + 1;
      const time = new Date().toLocaleTimeString();
      setLiveComments([...liveComments, { lap, time, comment: newComment }]);
      setNewComment('');
    }
  };

  const handleFinishRace = () => {
    setRaceFinished(true);
    setRaceStarted(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-blue-500/20">
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center p-3">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 25 L 30 15 L 30 35 Z" fill="white"/>
                    <rect x="28" y="20" width="8" height="10" fill="white"/>
                    <path d="M 40 25 L 50 25 L 45 15 Z" fill="#ef4444"/>
                    <path d="M 40 25 L 50 25 L 45 35 Z" fill="#ef4444"/>
                    <rect x="55" y="15" width="3" height="20" fill="white"/>
                    <circle cx="70" cy="25" r="10" stroke="white" strokeWidth="3" fill="none"/>
                    <circle cx="70" cy="25" r="5" fill="#ef4444"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Wheel be Fine </h1>
              <p className="text-blue-400 text-sm uppercase tracking-wider">Racing Analytics Platform</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Enter employee ID" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" placeholder="Enter password" required />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:from-blue-500 hover:to-blue-400 transition transform hover:scale-105 shadow-lg shadow-blue-500/30">Access Team</button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-500">Made at HackTX © 2025</div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Select Driver</h1>
              <p className="text-blue-400">Choose a driver to analyze</p>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"><LogOut className="w-4 h-4" />Logout</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {drivers.map((driver) => (
              <div key={driver.id} onClick={() => handleDriverSelect(driver)} className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-500/20 hover:border-blue-500 cursor-pointer transition transform hover:scale-105 shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-6xl font-bold text-blue-500 mb-2">#{driver.number}</div>
                    <h2 className="text-2xl font-bold text-white mb-1">{driver.name}</h2>
                    <p className="text-gray-400">{driver.years}</p>
                  </div>
                  <User className="w-16 h-16 text-blue-400 opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400">Races</p><p className="text-xl font-bold text-white">{driver.races}</p></div>
                  <div><p className="text-gray-400">Points</p><p className="text-xl font-bold text-white">{driver.points}</p></div>
                </div>
                <div className="mt-6 flex items-center justify-end text-blue-400">
                  <span className="text-sm font-medium">Select</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="border-b border-blue-500/20 bg-slate-800/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white">WHEEL BE FINE</h1>
                <p className="text-sm text-blue-400">#{selectedDriver.number} {selectedDriver.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedDriver(null); setCurrentPage('profile'); }} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Change Driver</button>
              <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"><LogOut className="w-4 h-4" />Logout</button>
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {['profile', 'testdrive', 'races', 'feedback', 'recovery'].map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-6 py-2 font-medium transition ${currentPage === page ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
                {page === 'testdrive' ? 'Test Drive' : page === 'feedback' ? 'Feedback Log' : page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'profile' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-blue-400 mb-2">{selectedDriver.name.split(' ')[0]}</h2>
                <p className="text-gray-400">Let's review your racing performance</p>
              </div>
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <div className="grid grid-cols-3 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏁</span>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-blue-400">{selectedDriver.races}</p>
                      <p className="text-gray-400 text-sm">Races Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏱️</span>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-purple-400">{(selectedDriver.races * 1.5).toFixed(1)}</p>
                      <p className="text-gray-400 text-sm">Hours on Track</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-green-400">{((20 - selectedDriver.avgPosition) / 20 * 100).toFixed(0)}%</p>
                      <p className="text-gray-400 text-sm">Consistency</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div onClick={() => setShowPreferences(true)} className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-500 cursor-pointer transition group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center"><Settings className="w-7 h-7 text-cyan-400" /></div>
                      <div><h3 className="text-xl font-bold text-white mb-1">Setup Preferences</h3><p className="text-cyan-200 text-sm">Fine-tune your car configuration</p></div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
                <div onClick={() => setCurrentPage('races')} className="bg-gradient-to-br from-orange-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 hover:border-orange-500 cursor-pointer transition group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center"><Play className="w-7 h-7 text-orange-400" /></div>
                      <div><h3 className="text-xl font-bold text-white mb-1">Start Racing</h3><p className="text-orange-200 text-sm">Begin your next race session</p></div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Weekly Performance Goals</h3>
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">Complete 3 pre-race excercises</p>
                      <p className="text-blue-400 font-bold">2/3</p>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{width: '66%'}}></div>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">Finish in top 15 positions</p>
                      <p className="text-purple-400 font-bold">1/2</p>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full" style={{width: '50%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-4 space-y-6">
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/50 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 relative">
                    <img src="/profile.png" alt={selectedDriver.name} className="w-full h-full object-cover absolute inset-0" onError={(e) => e.target.style.display = 'none'} />
                    <svg viewBox="0 0 64 64" className="w-16 h-16 relative z-10" fill="white">
                      <path d="M32 8 L28 12 L20 12 L18 14 L18 20 L16 22 L16 28 L14 30 L14 36 L16 38 L16 44 L18 46 L18 52 L20 54 L44 54 L46 52 L46 46 L48 44 L48 38 L50 36 L50 30 L48 28 L48 22 L46 20 L46 14 L44 12 L36 12 L32 8 Z" />
                      <ellipse cx="32" cy="30" rx="18" ry="12" fill="#1e293b" opacity="0.3"/>
                      <path d="M20 18 L44 18 L46 20 L46 24 L44 26 L20 26 L18 24 L18 20 Z" fill="#ef4444"/>
                      <rect x="28" y="32" width="8" height="4" rx="1" fill="#94a3b8"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedDriver.name}</h3>
                  <p className="text-gray-400 mb-4">Car #{selectedDriver.number}</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Age</span>
                    <span className="text-white font-semibold">{selectedDriver.age} years</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-semibold">{selectedDriver.years}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Total Races</span>
                    <span className="text-white font-semibold">{selectedDriver.races}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Career Points</span>
                    <span className="text-blue-400 font-semibold">{selectedDriver.points}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Podiums</span>
                    <span className="text-white font-semibold">{selectedDriver.podiums}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Championships</span>
                    <span className="text-white font-semibold">{selectedDriver.championships}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-400">Top Speed</span>
                    <span className="text-white font-semibold">{selectedDriver.topSpeed}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Average Position</span>
                    <span className="text-blue-400 font-semibold">{selectedDriver.avgPosition}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPreferences && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-blue-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Driver Preferences</h2>
                  <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {['brake_pedal_linearity', 'throttle_linearity'].map(key => (
                        <div key={key} className="bg-slate-700/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-300 text-sm font-medium">{key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</label>
                            <span className="text-blue-400 font-bold">{preferences[key]}</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.05" value={preferences[key]} onChange={(e) => setPreferences({...preferences, [key]: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-gray-300 text-sm font-medium">Stability Bias</label>
                          <span className="text-blue-400 font-bold">{preferences.stability_bias}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={preferences.stability_bias} onChange={(e) => setPreferences({...preferences, stability_bias: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="bg-slate-700/50 rounded-xl p-4">
                        <label className="text-gray-300 text-sm font-medium mb-2 block">Steering Weight Preference</label>
                        <select value={preferences.steering_weight_preference} onChange={(e) => setPreferences({...preferences, steering_weight_preference: e.target.value})} className="w-full px-4 py-2 bg-slate-600 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500">
                          {['light', 'medium', 'heavy'].map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Car Configuration</h3>
                    <div className="bg-slate-600/50 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                      <p className="text-gray-400 text-center">Upload your large configuration component here<br/>This will display your custom car setup interface</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button onClick={() => setShowPreferences(false)} className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">Cancel</button>
                    <button onClick={() => setShowPreferences(false)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition">Save Changes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'testdrive' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Test Drive Simulator</h2>
              <p className="text-blue-400">Practice and refine your setup on any circuit</p>
            </div>

            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Individual Track Time</h3>
                  <p className="text-gray-400 text-sm">Test your driving performance on specific circuits</p>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Upload your Individual Track Time component here<br/>
                  This will display track selection and timing interface
                </p>
              </div>
            </div>

            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Ideal Configuration</h3>
                  <p className="text-gray-400 text-sm">Find the optimal car setup for your driving style</p>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Upload your Ideal Configuration component here<br/>
                  This will display car setup optimization tools
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the code continues with races, feedback, and recovery sections */}
        
        {currentPage === 'races' && !selectedRace && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">2025 Season</h2>
              <p className="text-blue-400">Select a race to analyze</p>
            </div>
            <div className="grid gap-4">
              {races.map(race => (
                <div key={race.id} onClick={() => handleRaceSelect(race)} className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500 cursor-pointer transition hover:transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-400" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{race.name}</h3>
                          {race.sprint && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded border border-purple-500/30">SPRINT</span>}
                        </div>
                        <p className="text-gray-400 text-sm">{race.circuit} • {race.laps} laps</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4"><p className="text-blue-400 font-medium">{race.date}</p></div>
                      <ChevronRight className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'races' && selectedRace && !raceFinished && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => setSelectedRace(null)} className="text-blue-400 hover:text-blue-300 transition">← Back to Races</button>
              {raceStarted && <button onClick={handleFinishRace} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition"><CheckCircle className="w-5 h-5" />Finish Race</button>}
            </div>
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedRace.name}</h2>
                  <p className="text-gray-400">{selectedRace.circuit} • {selectedRace.date}</p>
                </div>
                {!raceStarted && <button onClick={handleStartRace} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition"><Play className="w-5 h-5" />Start Race Analysis</button>}
              </div>
              {!raceStarted && (
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Circuit Layout</h3>
                    <div className="bg-slate-600/50 rounded-lg p-4 h-64 flex items-center justify-center">
                      <div style={{display: 'none'}} className="text-center text-gray-400">
                        <p>Track outline will appear here</p>
                        <p className="text-xs mt-2">Place PNG in {selectedRace.trackimage}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Starting Grid</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {gridPositions.map(grid => (
                        <div key={grid.position} className={`flex items-center justify-between p-3 rounded-lg ${grid.driver === 'A. Albon' || grid.driver === 'F. Colapinto' ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-slate-600/50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center"><span className="text-white font-bold text-sm">{grid.position}</span></div>
                            <div>
                              <p className={`font-bold text-sm ${grid.driver === 'A. Albon' || grid.driver === 'F. Colapinto' ? 'text-blue-400' : 'text-white'}`}>{grid.driver}</p>
                              <p className="text-gray-400 text-xs">{grid.team}</p>
                            </div>
                          </div>
                          <span className="text-gray-400 text-xs font-mono">{grid.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {raceStarted && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 space-y-6">
                  <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Race Track View</h3>
                    <div className="bg-slate-700/50 rounded-xl p-8 h-96 flex items-center justify-center">
                      <img src={selectedRace.trackimage} alt={`${selectedRace.name} Circuit`} className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <div style={{display: 'none'}} className="text-center text-gray-400">
                        <p>Upload your race track component here</p>
                        <p className="text-sm mt-2">Full width track visualization • Real-time position tracking</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Live Strategy Feed</h3>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {liveComments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-400 font-bold text-sm">LAP {comment.lap}</span>
                            <span className="text-gray-500 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-white text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} placeholder="Add strategy feedback..." className="flex-1 px-4 py-2 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
                      <button onClick={handleAddComment} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition">Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'races' && selectedRace && raceFinished && (
          <div>
            <div className="mb-6">
              <button onClick={() => { setSelectedRace(null); setRaceFinished(false); }} className="text-blue-400 hover:text-blue-300 transition">← Back to Races</button>
            </div>
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20 mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedRace.name} - Race Summary</h2>
              <p className="text-gray-400">{selectedRace.circuit}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
                <p className="text-gray-400 text-sm mb-2">Final Position</p>
                <p className="text-4xl font-bold text-white">P12</p>
              </div>
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
                <p className="text-gray-400 text-sm mb-2">Laps Completed</p>
                <p className="text-4xl font-bold text-blue-400">{selectedRace.laps}</p>
              </div>
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
                <p className="text-gray-400 text-sm mb-2">Points Scored</p>
                <p className="text-4xl font-bold text-white">0</p>
              </div>
            </div>
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Strategy Feedback Log</h3>
              <div className="space-y-3">
                {liveComments.map((comment, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-bold text-sm">LAP {comment.lap}</span>
                      <span className="text-gray-500 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-white text-sm">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'feedback' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Overall Feedback Log</h2>
              <p className="text-blue-400">Historical race analysis and configurations</p>
            </div>
            <div className="space-y-4">
              {[
                {key: 'bahrain', name: 'Bahrain Grand Prix', track: '/tracks/bahrain.png', feedback: [
                  {laps: 'Lap 1-18', text: 'Starting on medium tires, good pace maintained. Clean first stint.'},
                  {laps: 'Lap 19-38', text: 'Switched to hard tires. Strong middle stint, gained 2 positions through undercuts.'},
                  {laps: 'Lap 39-57', text: 'Final stint on hard tires. Tire deg higher than expected. Consider earlier final stop.'}
                ]},
                {key: 'saudi', name: 'Saudi Arabian Grand Prix', track: '/tracks/jeddah.png', feedback: [
                  {laps: 'Lap 1-28', text: 'Started on hard tires, excellent tire management in opening stint.'},
                  {laps: 'Lap 29-50', text: 'Changed to medium compound. Great pace, overtook 3 cars. Perfect strategy execution.'}
                ]},
                {key: 'australia', name: 'Australian Grand Prix', track: '/tracks/australia.png', feedback: [
                  {laps: 'Lap 1-22', text: 'Medium compound start, solid pace maintaining position.'},
                  {laps: 'Lap 23-44', text: 'Hard tires fitted. Front wing adjustment at Lap 28 improved balance significantly.'},
                  {laps: 'Lap 45-58', text: 'Soft tires for final push. Great overtakes on Lap 34-36. Strong finish.'}
                ]}
              ].map(race => (
                <div key={race.key} className="bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-blue-500/20 overflow-hidden">
                  <button onClick={() => setExpandedRaces({...expandedRaces, [race.key]: !expandedRaces[race.key]})} className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition">
                    <h3 className="text-2xl font-bold text-white">{race.name}</h3>
                    <ChevronRight className={`w-6 h-6 text-blue-400 transition-transform ${expandedRaces[race.key] ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedRaces[race.key] && (
                    <div className="p-6 pt-0">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-bold text-blue-400 mb-3">Race Feedback</h4>
                          <div className="space-y-3">
                            {race.feedback.map((fb, i) => (
                              <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                                <p className="text-gray-400 text-xs mb-1">{fb.laps}</p>
                                <p className="text-white text-sm">{fb.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-blue-400 mb-3">Track Layout</h4>
                          <div className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-center min-h-64">
                            <img src={race.track} alt={`${race.name} Circuit`} className="max-h-64 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                            <div style={{display: 'none'}} className="text-gray-400 text-center">
                              <p>Track outline will appear here</p>
                              <p className="text-xs mt-2">Place PNG in {race.track}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'recovery' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Recovery & Performance</h2>
              <p className="text-blue-400">Track your physical and mental readiness</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Recovery Metrics</h3>
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Sleep Quality</span>
                      <span className="text-green-400 font-bold">85%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Stress Level</span>
                      <span className="text-yellow-400 font-bold">42%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full" style={{width: '42%'}}></div>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Hydration</span>
                      <span className="text-blue-400 font-bold">92%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
                <h3 className="text-xl font-bold text-white mb-6">Training Schedule</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">Cardio Session</p>
                        <p className="text-gray-400 text-sm">Tomorrow, 7:00 AM</p>
                      </div>
                      <span className="text-green-400">✓</span>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">Simulator Practice</p>
                        <p className="text-gray-400 text-sm">Tomorrow, 2:00 PM</p>
                      </div>
                      <span className="text-blue-400">→</span>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">Strategy Review</p>
                        <p className="text-gray-400 text-sm">Wed, 10:00 AM</p>
                      </div>
                      <span className="text-gray-400">○</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WilliamsF1Dashboard;