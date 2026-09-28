import React, { useState, useEffect } from 'react';
import {
  Tv,
  Users,
  Crosshair,
  Shield,
  Heart,
  Skull,
  Flame,
  Radio,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  Target,
  Swords,
  Timer,
} from 'lucide-react';
import { Tournament, LiveSpectatorPlayer } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

interface SpectatorViewProps {
  onBackToTournaments?: () => void;
  onOpenRoomModal?: (tournament: Tournament) => void;
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({
  onBackToTournaments,
  onOpenRoomModal,
}) => {
  const {
    tournaments,
    activeSpectatorTournamentId,
    setActiveSpectatorTournamentId,
    spectatorSelectedPlayerId,
    setSpectatorSelectedPlayerId,
    simulateSpectatorEvent,
  } = useTournaments();

  // Find selected tournament or first live tournament or first tournament
  const activeTournament =
    tournaments.find(t => t.id === activeSpectatorTournamentId) ||
    tournaments.find(t => t.status === 'live') ||
    tournaments[0];

  const liveState = activeTournament?.liveMatchState;

  // Camera perspective: 'pov' | 'tactical_map' | 'overhead'
  const [cameraMode, setCameraMode] = useState<'pov' | 'tactical_map' | 'overhead'>('pov');
  const [streamQuality, setStreamQuality] = useState('1080p 60fps');
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'leaderboard' | 'chat'>('roster');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [chatMessages, setChatMessages] = useState<
    { id: string; user: string; text: string; time: string; color: string }[]
  >([
    { id: 'c1', user: 'ViperFan_99', text: 'MK Gaming is dominating Pochinki! 🔥', time: '12:41', color: 'text-amber-400' },
    { id: 'c2', user: 'EsportsHost', text: 'Zone 3 is shrinking rapidly towards Military Base.', time: '12:42', color: 'text-cyan-400' },
    { id: 'c3', user: 'SniperQueen', text: 'AWM shot from 350m was INSANE! 🎯', time: '12:43', color: 'text-emerald-400' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Selected player for POV
  const selectedPlayer =
    liveState?.players.find(p => p.id === spectatorSelectedPlayerId) ||
    liveState?.players.find(p => p.status === 'alive') ||
    liveState?.players[0];

  // Send cheer reaction
  const triggerReaction = (emoji: string) => {
    const newReaction = {
      id: `rx_${Date.now()}_${Math.random()}`,
      emoji,
      left: 15 + Math.random() * 70, // %
    };
    setFloatingEmojis(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: `chat_${Date.now()}`,
        user: 'Spectator (You)',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: 'text-amber-300',
      },
    ]);
    setChatInput('');
  };

  if (!activeTournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Tv className="w-12 h-12 mx-auto text-slate-500 mb-3" />
        <h2 className="font-heading text-xl text-white font-bold">No Match Selected for Spectator Mode</h2>
        <p className="text-slate-400 text-sm mt-1">Please select an ongoing live tournament to spectate.</p>
      </div>
    );
  }

  // Calculate live scores for scoreboard:
  // Points = Kills * 1 + Placement estimate based on status
  const sortedLiveLeaderboard = [...(liveState?.players || [])].sort((a, b) => {
    const scoreA = a.kills * 1 + (a.status === 'alive' ? 10 : 3);
    const scoreB = b.kills * 1 + (b.status === 'alive' ? 10 : 3);
    return scoreB - scoreA;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Match Bar / Match Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        
        {/* Left: Tournament Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-sm shadow-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                LIVE BROADCAST
              </span>
              <span className="text-xs font-bold text-slate-400">
                {activeTournament.game} • {activeTournament.mode}
              </span>
            </div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-wide mt-0.5">
              {activeTournament.title}
            </h1>
          </div>
        </div>

        {/* Right: Tournament Selector & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeTournament.id}
            onChange={e => setActiveSpectatorTournamentId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.status === 'live' ? '🔥 [LIVE] ' : t.status === 'completed' ? '🏁 [COMPLETED] ' : '⏳ '}
                {t.title} ({t.mode})
              </option>
            ))}
          </select>

          {/* Simulate Action Button */}
          {activeTournament.status === 'live' && (
            <button
              onClick={() => simulateSpectatorEvent(activeTournament.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="Simulate real-time combat action (kills, headshots, damage exchange)"
            >
              <Swords className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Gunfight</span>
            </button>
          )}

          {onOpenRoomModal && (
            <button
              onClick={() => onOpenRoomModal(activeTournament)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
            >
              Room Password
            </button>
          )}
        </div>

      </div>

      {/* Main Spectator Grid: Stream Player (Left) + Stats & Scoreboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Esports Stream Screen + Tactical Controls */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Stream Player Container */}
          <div className="relative aspect-video w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between group">
            
            {/* Top Stream HUD Overlay */}
            <div className="relative z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              {/* Alive Counter HUD */}
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase text-slate-400">Alive:</span>
                  <span className="font-heading font-black text-sm text-white">
                    {liveState?.alivePlayers ?? activeTournament.registeredPlayers.length} / {liveState?.totalPlayers ?? activeTournament.totalSlots}
                  </span>
                </div>
                <div className="w-px h-3.5 bg-slate-700"></div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase text-slate-400">Squads:</span>
                  <span className="font-heading font-black text-sm text-white">
                    {liveState?.aliveTeams ?? 7}
                  </span>
                </div>
              </div>

              {/* Circle Shrink & Match Timer */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                  <span className="text-xs font-semibold text-cyan-300">
                    Circle #{liveState?.currentCircle ?? 3}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {Math.floor((liveState?.circleShrinkTimer ?? 120) / 60)}:
                    {((liveState?.circleShrinkTimer ?? 120) % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Spectator Count */}
                <div className="flex items-center gap-1.5 bg-red-950/70 border border-red-800/80 px-2.5 py-1.5 rounded-xl text-red-300 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{liveState?.spectatorCount ?? 142} Watching</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Stream Viewport */}
            <div className="absolute inset-0 flex items-center justify-center select-none overflow-hidden">
              
              {/* Camera Mode 1: Player POV */}
              {cameraMode === 'pov' && (
                <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black flex items-center justify-center">
                  
                  {/* Dynamic Esports Game Visual Background */}
                  <img
                    src={activeTournament.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"}
                    alt="Game view"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
                  />

                  {/* Scanlines Effect Overlay */}
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-40"></div>

                  {/* Tactical Reticle / Crosshair */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute w-full h-px bg-amber-400/40"></div>
                      <div className="absolute h-full w-px bg-amber-400/40"></div>
                      <div className="w-3 h-3 rounded-full border border-amber-400/80 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 bg-black/60 px-2 py-0.5 rounded mt-2">
                      TARGET ACQUIRED • {selectedPlayer?.weapons.primary}
                    </span>
                  </div>

                  {/* In-Game Player Name Tag HUD (Esports Broadcast Overlay) */}
                  <div className="absolute bottom-16 left-6 z-20 flex items-center gap-3 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-xl">
                    <div
                      className="w-3.5 h-12 rounded-full"
                      style={{ backgroundColor: selectedPlayer?.teamColor || '#f59e0b' }}
                    ></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          {selectedPlayer?.teamName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          POV CAM
                        </span>
                      </div>
                      <h4 className="font-heading font-black text-xl text-white tracking-wide">
                        {selectedPlayer?.ign}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-mono">
                        UID: {selectedPlayer?.gameUid} • Slot #{selectedPlayer?.id.replace('sp_', '')}
                      </p>
                    </div>

                    {/* HP and Armor Meters */}
                    <div className="ml-4 pl-4 border-l border-slate-700 space-y-1.5 min-w-[130px]">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Heart className="w-2.5 h-2.5 fill-current" /> HP
                          </span>
                          <span>{selectedPlayer?.health}/100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              (selectedPlayer?.health ?? 100) > 40 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                            }`}
                            style={{ width: `${selectedPlayer?.health ?? 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Shield className="w-2.5 h-2.5 fill-current" /> ARMOR
                          </span>
                          <span>{selectedPlayer?.armor}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-500"
                            style={{ width: `${selectedPlayer?.armor ?? 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weapon Loadout & Ammo HUD */}
                  <div className="absolute bottom-16 right-6 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80">
                    <Target className="w-5 h-5 text-amber-400" />
                    <div className="text-right">
                      <span className="block text-[11px] font-bold text-white">
                        {selectedPlayer?.weapons.primary}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedPlayer?.weapons.secondary} • {selectedPlayer?.weapons.throwable}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* Camera Mode 2: Tactical Radar Minimap */}
              {cameraMode === 'tactical_map' && (
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-6">
                  {/* Grid background */}
                  <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-2xl border border-cyan-500/40 p-4 shadow-inner overflow-hidden flex items-center justify-center">
                    
                    {/* Radar Sweep Effect */}
                    <div className="absolute inset-0 radar-sweep opacity-15 bg-gradient-to-tr from-cyan-500 to-transparent pointer-events-none"></div>

                    {/* Zone Circles */}
                    <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-dashed border-cyan-400/60 pointer-events-none"></div>
                    <div className="absolute w-1/2 h-1/2 rounded-full border-2 border-white/80 bg-white/5 pointer-events-none"></div>

                    {/* Map terrain label */}
                    <span className="absolute top-3 left-3 text-[10px] font-mono font-bold text-cyan-400/80 tracking-widest uppercase">
                      TACTICAL RADAR: {activeTournament.map}
                    </span>

                    {/* Player Radar Blips */}
                    {liveState?.players.map(p => {
                      const isSelected = p.id === selectedPlayer?.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSpectatorSelectedPlayerId(p.id);
                            setCameraMode('pov');
                          }}
                          style={{
                            left: `${p.coords.x}%`,
                            top: `${p.coords.y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform ${
                            p.status === 'eliminated' ? 'opacity-25' : 'hover:scale-150'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-125'
                                : ''
                            }`}
                            style={{ backgroundColor: p.teamColor }}
                          >
                            {p.status === 'knocked' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></div>
                            )}
                          </div>
                          <span className="hidden group-hover:block absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[9px] px-1.5 py-0.5 rounded border border-slate-700 font-mono z-30">
                            {p.ign} ({p.kills}K)
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}

              {/* Camera Mode 3: Overhead Drone */}
              {cameraMode === 'overhead' && (
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80"
                    alt="Drone Cam"
                    className="w-full h-full object-cover filter contrast-125 brightness-75"
                  />
                  <div className="absolute inset-0 bg-cyan-950/20 mix-blend-color"></div>
                  <div className="absolute top-6 left-6 bg-black/70 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    DRONE OVERHEAD • ALTITUDE 450M • TACTICAL STREAM
                  </div>
                </div>
              )}

              {/* Live Kill Feed Box in Upper Right of Stream */}
              <div className="absolute top-14 right-4 z-20 space-y-1.5 max-w-xs pointer-events-none">
                {liveState?.killFeed.slice(0, 4).map((kf, idx) => (
                  <div
                    key={kf.id || idx}
                    className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] shadow-lg animate-slideInRight"
                  >
                    <span className="font-bold text-amber-400 truncate max-w-[80px]">
                      {kf.killer}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      [{kf.weapon}]
                    </span>
                    {kf.isHeadshot && (
                      <span className="text-rose-500 font-black text-[10px] flex items-center">
                        <Skull className="w-3 h-3 fill-current" />
                      </span>
                    )}
                    <span className="font-semibold text-rose-300 truncate max-w-[80px]">
                      {kf.victim}
                    </span>
                  </div>
                ))}
              </div>

              {/* Floating Emojis / Cheers */}
              {floatingEmojis.map(rx => (
                <div
                  key={rx.id}
                  style={{ left: `${rx.left}%` }}
                  className="absolute bottom-16 text-3xl animate-floatUp pointer-events-none select-none z-30 drop-shadow-lg"
                >
                  {rx.emoji}
                </div>
              ))}

            </div>

            {/* Bottom Stream Controls Bar */}
            <div className="relative z-20 flex items-center justify-between p-3 bg-gradient-to-t from-black via-black/80 to-transparent border-t border-slate-800/80">
              
              {/* Camera Switcher Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCameraMode('pov')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cameraMode === 'pov'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Player POV
                </button>

                <button
                  onClick={() => setCameraMode('tactical_map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cameraMode === 'tactical_map'
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Tactical Map
                </button>

                <button
                  onClick={() => setCameraMode('overhead')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cameraMode === 'overhead'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  Drone Cam
                </button>
              </div>

              {/* Stream Settings & Audio */}
              <div className="flex items-center gap-3">
                {/* Quick Emoji Cheers */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                  {['🔥', '🎯', '👏', '🏆', '💀', '💥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => triggerReaction(emoji)}
                      className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <select
                  value={streamQuality}
                  onChange={e => setStreamQuality(e.target.value)}
                  className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded border border-slate-800 font-mono"
                >
                  <option value="1080p 60fps">1080p60</option>
                  <option value="720p 60fps">720p60</option>
                  <option value="480p">480p</option>
                </select>
              </div>

            </div>

          </div>

          {/* Active Player Spotlight Card */}
          {selectedPlayer && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-xl text-black shadow-lg"
                  style={{ backgroundColor: selectedPlayer.teamColor }}
                >
                  {selectedPlayer.kills}K
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-lg text-white">
                      {selectedPlayer.ign}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedPlayer.status === 'alive'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : selectedPlayer.status === 'knocked'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {selectedPlayer.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Team: <strong className="text-slate-200">{selectedPlayer.teamName}</strong> • Real Name: {selectedPlayer.name}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Kills</span>
                  <span className="font-heading text-lg font-bold text-amber-400">{selectedPlayer.kills}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Damage</span>
                  <span className="font-heading text-lg font-bold text-white">{selectedPlayer.damage}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Headshots</span>
                  <span className="font-heading text-lg font-bold text-cyan-400">{selectedPlayer.headshots}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
                  <span className="font-heading text-lg font-bold text-emerald-400">
                    {Math.min(94, 62 + selectedPlayer.kills * 4)}%
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 cols): Tabbed Spectator Hub (Roster, Live Scoreboard, Chat) */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col h-[640px] overflow-hidden">
          
          {/* Tabs Header */}
          <div className="flex items-center border-b border-slate-800 p-2 bg-slate-950/60">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Players Roster
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Live Scores
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Live Chat
            </button>
          </div>

          {/* Tab 1: Players Roster with Camera Switching */}
          {activeTab === 'roster' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 px-1 flex items-center justify-between">
                <span>Select Player to Switch POV</span>
                <span>{liveState?.players.length ?? 0} Players</span>
              </div>

              {liveState?.players.map(p => {
                const isSelected = p.id === selectedPlayer?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSpectatorSelectedPlayerId(p.id);
                      setCameraMode('pov');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: p.teamColor }}
                      ></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-sm text-white truncate">
                            {p.ign}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-black bg-amber-400 text-black px-1 rounded">
                              WATCHING
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {p.teamName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div>
                        <span className="block font-heading font-black text-sm text-amber-400">
                          {p.kills} Kills
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.damage} dmg
                        </span>
                      </div>

                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          p.status === 'alive'
                            ? 'bg-emerald-500'
                            : p.status === 'knocked'
                            ? 'bg-amber-500 animate-ping'
                            : 'bg-rose-500 opacity-50'
                        }`}
                        title={p.status}
                      ></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Live Leaderboard / Standings */}
          {activeTab === 'leaderboard' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 px-1 flex items-center justify-between">
                <span>Rank & Player</span>
                <span>Live Points</span>
              </div>

              {sortedLiveLeaderboard.map((p, idx) => {
                const totalLivePts = p.kills * 1 + (p.status === 'alive' ? 10 : 3);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-800/40 border-slate-700'
                        : idx === 2
                        ? 'bg-orange-950/20 border-orange-800/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading font-black text-sm w-5 text-center text-slate-300">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div>
                        <span className="font-bold text-white block">
                          {p.ign}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.teamName} • {p.kills} Kills
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-black text-base text-amber-400">
                        {totalLivePts} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Spectator Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-bold ${msg.color}`}>{msg.user}</span>
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-slate-300">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Cheer for your favorite team..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
