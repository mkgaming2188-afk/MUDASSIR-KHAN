import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Coins,
  MapPin,
  Clock,
  Lock,
  Unlock,
  Radio,
  Tv,
  CheckCircle2,
  ChevronRight,
  Flame,
  Search,
  Filter,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { Tournament, GameMode } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

interface HomeViewProps {
  onJoinClick: (tournament: Tournament) => void;
  onRoomClick: (tournament: Tournament) => void;
  onSpectateClick: (tournament: Tournament) => void;
  onResultsClick: (tournament: Tournament) => void;
  onOpenWallet: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onJoinClick,
  onRoomClick,
  onSpectateClick,
  onResultsClick,
  onOpenWallet,
}) => {
  const { tournaments, user, isPlayerRegistered, getRoomCredentialsStatus } = useTournaments();

  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | GameMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (modeFilter !== 'all' && t.mode !== modeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.game.toLowerCase().includes(q) ||
        t.map.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredTournament = tournaments.find(t => t.status === 'live') || tournaments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Featured Hero Banner */}
      {featuredTournament && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0">
            <img
              src={featuredTournament.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80"}
              alt="Tournament Hero"
              className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {featuredTournament.status === 'live' ? (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1.5 shadow-md shadow-red-600/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  🔥 MATCH IN PROGRESS
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  UPCOMING FEATURED
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-cyan-300 border border-slate-700">
                {featuredTournament.game} • {featuredTournament.mode}
              </span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide uppercase leading-tight drop-shadow-md">
              {featuredTournament.title}
            </h1>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Compete on {featuredTournament.map}. Win from a massive prize pool of{' '}
              <strong className="text-amber-400 font-bold">{featuredTournament.prizePool.toLocaleString()} Coins</strong>.
              Anti-leak password reveal protocol active.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Total Prize</span>
                <span className="font-heading text-xl font-bold text-amber-400">
                  {featuredTournament.prizePool.toLocaleString()} 🪙
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Entry Fee</span>
                <span className="font-heading text-xl font-bold text-white">
                  {featuredTournament.entryFee} 🪙
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Slots</span>
                <span className="font-heading text-xl font-bold text-white">
                  {featuredTournament.registeredPlayers.length} / {featuredTournament.totalSlots}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {featuredTournament.status === 'live' ? (
                <button
                  onClick={() => onSpectateClick(featuredTournament)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Tv className="w-4 h-4" />
                  Watch Live Stream (Spectate)
                </button>
              ) : isPlayerRegistered(featuredTournament.id) ? (
                <button
                  onClick={() => onRoomClick(featuredTournament)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  View Room Password
                </button>
              ) : (
                <button
                  onClick={() => onJoinClick(featuredTournament)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Join Tournament ({featuredTournament.entryFee} Coins)
                </button>
              )}

              <button
                onClick={() => onRoomClick(featuredTournament)}
                className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Custom Room Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
        
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Tournaments
          </button>

          <button
            onClick={() => setStatusFilter('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'live'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            🔥 Live Matches
          </button>

          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'upcoming'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            🏆 Upcoming
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'completed'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Completed / Results
          </button>
        </div>

        {/* Mode & Search */}
        <div className="flex items-center gap-2">
          {/* Mode selector */}
          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
          >
            <option value="all">All Modes</option>
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map(tournament => {
          const registered = isPlayerRegistered(tournament.id);
          const credStatus = getRoomCredentialsStatus(tournament);
          const slotsBooked = tournament.registeredPlayers.length;
          const isFull = slotsBooked >= tournament.totalSlots;
          const slotsPercentage = Math.round((slotsBooked / tournament.totalSlots) * 100);

          return (
            <div
              key={tournament.id}
              className="bg-slate-900 rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group"
            >
              {/* Card Image Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={tournament.bannerUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                  alt={tournament.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  {/* Status Badge */}
                  {tournament.status === 'live' ? (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-md shadow-red-600/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      🔥 LIVE
                    </span>
                  ) : tournament.status === 'completed' ? (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      🏁 COMPLETED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/90 text-black shadow-sm">
                      ⏳ UPCOMING
                    </span>
                  )}

                  {/* Mode & Map */}
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/75 backdrop-blur-md text-cyan-300 border border-slate-700">
                    {tournament.mode} • {tournament.map}
                  </span>
                </div>

                {/* Registered Pill Indicator */}
                {registered && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    Enrolled (Slot Reserved)
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {tournament.game}
                  </span>

                  <h3 className="font-heading font-black text-lg text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {tournament.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(tournament.matchTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(tournament.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Prize Pool and Entry Fee Matrix */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center">
                  <div className="border-r border-slate-800/80 pr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prize Pool</span>
                    <span className="font-heading font-black text-lg text-amber-400">
                      {tournament.prizePool.toLocaleString()} 🪙
                    </span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Entry Fee</span>
                    <span className="font-heading font-black text-lg text-white">
                      {tournament.entryFee} 🪙
                    </span>
                  </div>
                </div>

                {/* Slots Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Slots Booked
                    </span>
                    <span className="font-bold text-slate-200">
                      {slotsBooked} / {tournament.totalSlots} {isFull && <span className="text-rose-400">(FULL)</span>}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? 'bg-rose-500' : slotsPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, slotsPercentage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Password Reveal Status Badge */}
                <div className="pt-1">
                  {credStatus.isRevealed ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <Unlock className="w-3.5 h-3.5 shrink-0" />
                      <span>Room ID & Password Revealed!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Password reveals {tournament.revealMinutesBefore}m before match
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {tournament.status === 'live' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSpectateClick(tournament)}
                        className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        Spectate Live
                      </button>

                      <button
                        onClick={() => onRoomClick(tournament)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        Room Pass
                      </button>
                    </div>
                  ) : tournament.status === 'completed' ? (
                    <button
                      onClick={() => onResultsClick(tournament)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      View Final Leaderboard & Winners
                    </button>
                  ) : registered ? (
                    <button
                      onClick={() => onRoomClick(tournament)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <Unlock className="w-4 h-4" />
                      View Room & Password
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 text-slate-500 font-bold text-xs cursor-not-allowed text-center"
                    >
                      All Slots Booked
                    </button>
                  ) : (
                    <button
                      onClick={() => onJoinClick(tournament)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Join Tournament ({tournament.entryFee} Coins)
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
