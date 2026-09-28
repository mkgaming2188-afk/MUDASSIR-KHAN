import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Users,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { Tournament, TournamentResult } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

interface LeaderboardViewProps {
  onBackToHome?: () => void;
  selectedTournamentId?: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  selectedTournamentId,
}) => {
  const { tournaments } = useTournaments();

  // Find tournaments with results or all completed tournaments
  const tournamentsWithResults = tournaments.filter(
    t => (t.results && t.results.length > 0) || t.status === 'completed'
  );

  const [activeTourId, setActiveTourId] = useState<string>(
    selectedTournamentId || tournamentsWithResults[0]?.id || tournaments[0]?.id
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentTournament = tournaments.find(t => t.id === activeTourId);

  // Fallback demo results if none provided yet
  const results: TournamentResult[] = currentTournament?.results || [
    {
      rank: 1,
      playerName: 'MK Gaming',
      teamName: 'MK Esports',
      ign: 'MK_LEGEND_OP',
      gameUid: '5192840192',
      kills: 8,
      placement: 1,
      killPoints: 8,
      placementPoints: 10,
      totalPoints: 18,
      prizeWon: 1500,
    },
    {
      rank: 2,
      playerName: 'Player X',
      teamName: 'Team Alpha',
      ign: 'ALPHA_X_SNIPER',
      gameUid: '4820194899',
      kills: 6,
      placement: 2,
      killPoints: 6,
      placementPoints: 8,
      totalPoints: 14,
      prizeWon: 900,
    },
    {
      rank: 3,
      playerName: 'Player Y',
      teamName: 'Team Shadow',
      ign: 'SHADOW_Y_KILLER',
      gameUid: '7829104744',
      kills: 5,
      placement: 3,
      killPoints: 5,
      placementPoints: 6,
      totalPoints: 11,
      prizeWon: 400,
    },
    {
      rank: 4,
      playerName: 'Toxic Sniper',
      teamName: 'Toxic Gang',
      ign: 'TOXIC_AWM_GOD',
      gameUid: '9920194888',
      kills: 4,
      placement: 4,
      killPoints: 4,
      placementPoints: 5,
      totalPoints: 9,
      prizeWon: 200,
    },
    {
      rank: 5,
      playerName: 'GodRishi',
      teamName: 'GodLike',
      ign: 'GOD_RISHI_07',
      gameUid: '3310294821',
      kills: 2,
      placement: 5,
      killPoints: 2,
      placementPoints: 4,
      totalPoints: 6,
      prizeWon: 0,
    },
  ];

  const filteredResults = results.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.playerName.toLowerCase().includes(q) ||
      r.ign.toLowerCase().includes(q) ||
      (r.teamName && r.teamName.toLowerCase().includes(q))
    );
  });

  const top3 = results.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wide uppercase">
              Tournament Leaderboards & Official Results
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculated via placement points + kill points matrix with automated prize payouts.
          </p>
        </div>

        {/* Tournament Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap font-medium">Select Match:</label>
          <select
            value={activeTourId}
            onChange={e => setActiveTourId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentTournament && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Tournament:</span>{' '}
            <strong className="text-white font-bold">{currentTournament.title}</strong>{' '}
            ({currentTournament.game} • {currentTournament.mode} • {currentTournament.map})
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Prize Pool:</span>{' '}
              <strong className="text-amber-400 font-bold">{currentTournament.prizePool.toLocaleString()} Coins</strong>
            </div>
            <div>
              <span className="text-slate-400">Total Entries:</span>{' '}
              <strong className="text-slate-200 font-bold">{currentTournament.registeredPlayers.length} Slots</strong>
            </div>
          </div>
        </div>
      )}

      {/* Podium for Top 3 Winners */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-5 flex flex-col items-center justify-between text-center relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-3xl shadow-lg mb-3">
              🥈
            </div>
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                2nd Place Runner-Up
              </span>
              <h3 className="font-heading font-black text-xl text-white">
                {top3[1].playerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {top3[1].ign} • {top3[1].teamName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Kills</span>
                <span className="font-heading text-lg font-bold text-white">{top3[1].kills}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Points</span>
                <span className="font-heading text-lg font-bold text-amber-400">{top3[1].totalPoints}</span>
              </div>
            </div>

            <div className="mt-3 text-xs font-bold text-emerald-400">
              +{top3[1].prizeWon} Coins Won
            </div>
          </div>

          {/* 1st Place Champion */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 rounded-2xl border-2 border-amber-500/80 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl glow-amber">
            <div className="absolute top-0 right-0 left-0 bg-amber-500 text-black py-0.5 text-[10px] font-black uppercase tracking-widest text-center">
              👑 TOURNAMENT CHAMPION
            </div>
            <div className="w-18 h-18 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-4xl shadow-xl mt-3 mb-3">
              🥇
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-black text-2xl text-amber-400">
                {top3[0].playerName}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                {top3[0].ign} • {top3[0].teamName}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full bg-slate-950/90 p-3 rounded-xl border border-amber-500/40 mt-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Kills</span>
                <span className="font-heading text-lg font-bold text-white">{top3[0].kills}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Placement</span>
                <span className="font-heading text-lg font-bold text-emerald-400">#1</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Pts</span>
                <span className="font-heading text-lg font-bold text-amber-400">{top3[0].totalPoints}</span>
              </div>
            </div>

            <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500 text-black font-heading font-black text-sm uppercase tracking-wide shadow-md">
              🏆 Won {top3[0].prizeWon.toLocaleString()} Coins
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-5 flex flex-col items-center justify-between text-center relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-orange-950/40 border border-orange-700/60 flex items-center justify-center text-3xl shadow-lg mb-3">
              🥉
            </div>
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-950/60 text-orange-400 border border-orange-800">
                3rd Place
              </span>
              <h3 className="font-heading font-black text-xl text-white">
                {top3[2].playerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {top3[2].ign} • {top3[2].teamName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Kills</span>
                <span className="font-heading text-lg font-bold text-white">{top3[2].kills}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Points</span>
                <span className="font-heading text-lg font-bold text-amber-400">{top3[2].totalPoints}</span>
              </div>
            </div>

            <div className="mt-3 text-xs font-bold text-emerald-400">
              +{top3[2].prizeWon} Coins Won
            </div>
          </div>

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Official Match Standings Table
            </h3>
            <p className="text-xs text-slate-400">
              Rule: 1 Kill = 1 Point | Rank 1 = 10 Pts, Rank 2 = 8 Pts, Rank 3 = 6 Pts, Rank 4 = 5 Pts
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by player or team..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player / Team</th>
                <th className="py-3 px-4">In-Game Name (IGN)</th>
                <th className="py-3 px-4 text-center">Placement</th>
                <th className="py-3 px-4 text-center">Kills</th>
                <th className="py-3 px-4 text-center">Place Pts</th>
                <th className="py-3 px-4 text-center">Kill Pts</th>
                <th className="py-3 px-4 text-center font-bold text-amber-400">Total Points</th>
                <th className="py-3 px-4 text-right">Prize (Coins)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResults.map(r => (
                <tr
                  key={r.rank}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    r.rank === 1
                      ? 'bg-amber-500/5 font-semibold'
                      : r.rank <= 3
                      ? 'bg-slate-850/40'
                      : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-heading font-black text-sm text-slate-200">
                    {r.rank === 1 ? '🥇 #1' : r.rank === 2 ? '🥈 #2' : r.rank === 3 ? '🥉 #3' : `#${r.rank}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{r.playerName}</span>
                    <span className="text-[11px] text-slate-400">{r.teamName || 'Solo'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {r.ign}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-200">
                    #{r.placement}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {r.kills}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {r.placementPoints}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {r.killPoints}
                  </td>
                  <td className="py-3.5 px-4 text-center font-heading font-black text-base text-amber-400">
                    {r.totalPoints}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                    {r.prizeWon > 0 ? `+${r.prizeWon.toLocaleString()} 🪙` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
