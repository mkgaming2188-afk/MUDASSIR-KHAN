import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  UserX,
  Coins,
  Award,
  Zap,
  RotateCcw,
  Sparkles,
  Users,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { Tournament, TournamentResult, GameMode } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

export const AdminPanel: React.FC = () => {
  const {
    tournaments,
    user,
    createTournament,
    updateTournament,
    deleteTournament,
    revealRoomCredentials,
    setTournamentStatus,
    publishResults,
    removePlayerByAdmin,
    addCoins,
    resetAllData,
  } = useTournaments();

  // Create tournament modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('MK Pro Invitational Series');
  const [newGame, setNewGame] = useState('BGMI / PUBG Mobile');
  const [newMode, setNewMode] = useState<GameMode>('Squad');
  const [newMap, setNewMap] = useState('Erangel');
  const [newMatchTime, setNewMatchTime] = useState(
    new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [newEntryFee, setNewEntryFee] = useState(100);
  const [newPrizePool, setNewPrizePool] = useState(3000);
  const [newPerKillBonus, setNewPerKillBonus] = useState(10);
  const [newSlots, setNewSlots] = useState(48);
  const [newRoomId, setNewRoomId] = useState(`MK-ROOM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newRoomPassword, setNewRoomPassword] = useState(`MK_WIN_${Math.floor(10 + Math.random() * 90)}`);
  const [newRevealMinutes, setNewRevealMinutes] = useState(10);

  // Results submission modal state
  const [resultTournament, setResultTournament] = useState<Tournament | null>(null);
  const [resultRows, setResultRows] = useState<
    { playerName: string; ign: string; gameUid: string; teamName: string; kills: number; placement: number }[]
  >([]);

  // Selected tournament to manage players
  const [inspectTournamentId, setInspectTournamentId] = useState<string | null>(null);
  const inspectTournament = tournaments.find(t => t.id === inspectTournamentId);

  // Handle open result modal
  const handleOpenResults = (t: Tournament) => {
    setResultTournament(t);
    // Initialize results from registered players or placeholders
    const initialRows = (
      t.registeredPlayers.length > 0
        ? t.registeredPlayers
        : [
            { id: '1', username: 'MK Gaming', ign: 'MK_LEGEND_OP', gameUid: '5192840192', teamName: 'MK Esports' },
            { id: '2', username: 'Player X', ign: 'ALPHA_X_SNIPER', gameUid: '4820194899', teamName: 'Team Alpha' },
            { id: '3', username: 'Player Y', ign: 'SHADOW_Y_KILLER', gameUid: '7829104744', teamName: 'Team Shadow' },
            { id: '4', username: 'Toxic Sniper', ign: 'TOXIC_AWM_GOD', gameUid: '9920194888', teamName: 'Toxic Gang' },
          ]
    ).map((p, idx) => ({
      playerName: p.username || `Player #${idx + 1}`,
      ign: p.ign || `IGN_${idx + 1}`,
      gameUid: p.gameUid || `UID_${idx + 1}`,
      teamName: p.teamName || (t.mode === 'Solo' ? 'Solo' : `Squad #${idx + 1}`),
      kills: Math.max(0, 8 - idx * 2),
      placement: idx + 1,
    }));

    setResultRows(initialRows);
  };

  // Submit results & distribute prize coins
  const handlePublishResults = () => {
    if (!resultTournament) return;

    // Calculate placement points formula:
    // #1 = 10 pts, #2 = 8, #3 = 6, #4 = 5, #5 = 4, #6+ = 1
    const getPlacementPts = (pl: number) => {
      if (pl === 1) return 10;
      if (pl === 2) return 8;
      if (pl === 3) return 6;
      if (pl === 4) return 5;
      if (pl === 5) return 4;
      return 1;
    };

    // Calculate total points and sort by points
    const calculated: TournamentResult[] = resultRows
      .map(r => {
        const placePts = getPlacementPts(r.placement);
        const killPts = r.kills * 1;
        const totalPoints = placePts + killPts;
        return {
          rank: 0, // will assign next
          playerName: r.playerName,
          teamName: r.teamName,
          ign: r.ign,
          gameUid: r.gameUid,
          kills: r.kills,
          placement: r.placement,
          killPoints: killPts,
          placementPoints: placePts,
          totalPoints,
          prizeWon: 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign rank and prize distribution
    const prizePool = resultTournament.prizePool;
    const finalResults = calculated.map((res, idx) => {
      let prize = 0;
      if (idx === 0) prize = Math.floor(prizePool * 0.5);
      else if (idx === 1) prize = Math.floor(prizePool * 0.3);
      else if (idx === 2) prize = Math.floor(prizePool * 0.2);

      return {
        ...res,
        rank: idx + 1,
        prizeWon: prize,
      };
    });

    publishResults(resultTournament.id, finalResults);
    setResultTournament(null);
  };

  // Handle create tournament submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTournament({
      title: newTitle,
      game: newGame,
      mode: newMode,
      map: newMap,
      matchTime: new Date(newMatchTime).toISOString(),
      entryFee: Number(newEntryFee),
      prizePool: Number(newPrizePool),
      perKillBonus: Number(newPerKillBonus),
      totalSlots: Number(newSlots),
      roomId: newRoomId,
      roomPassword: newRoomPassword,
      revealMinutesBefore: Number(newRevealMinutes),
    });
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                Organizer Access
              </span>
              <h1 className="font-heading font-black text-2xl text-white">
                MK Tournament Admin Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control room credentials, password auto-reveal triggers, player bans, and match prize distributions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Tournament
          </button>

          <button
            onClick={() => {
              if (confirm('Reset mock tournaments and wallet to default demo state?')) {
                resetAllData();
              }
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Reset All Mock Data to Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Tournaments</span>
          <span className="font-heading font-black text-2xl text-white">{tournaments.length}</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Live Matches</span>
          <span className="font-heading font-black text-2xl text-red-500">
            {tournaments.filter(t => t.status === 'live').length}
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Registered Players</span>
          <span className="font-heading font-black text-2xl text-cyan-400">
            {tournaments.reduce((acc, curr) => acc + curr.registeredPlayers.length, 0)}
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">User Coin Balance</span>
          <span className="font-heading font-black text-2xl text-amber-400">
            {user.coins.toLocaleString()} 🪙
          </span>
        </div>
      </div>

      {/* Tournaments Management Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-xl text-white">
            Manage Tournaments & Room Passwords
          </h3>
          <span className="text-xs text-slate-400">
            Click "Reveal" to bypass the timer, or "Enter Results" to distribute coins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3">Tournament</th>
                <th className="py-3 px-3">Mode / Map</th>
                <th className="py-3 px-3">Slots</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Room ID & Pass</th>
                <th className="py-3 px-3">Password Reveal</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {tournaments.map(t => (
                <tr key={t.id} className="hover:bg-slate-850/40 transition-colors">
                  
                  {/* Tournament Title */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block">{t.title}</span>
                    <span className="text-[10px] text-slate-400">
                      Fee: {t.entryFee} 🪙 • Prize: {t.prizePool} 🪙
                    </span>
                  </td>

                  {/* Mode / Map */}
                  <td className="py-3.5 px-3 font-semibold text-slate-300">
                    {t.mode} • {t.map}
                  </td>

                  {/* Slots */}
                  <td className="py-3.5 px-3 font-mono">
                    <button
                      onClick={() => setInspectTournamentId(t.id)}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                      title="Inspect registered players"
                    >
                      <Users className="w-3 h-3" />
                      {t.registeredPlayers.length} / {t.totalSlots}
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <select
                      value={t.status}
                      onChange={e => setTournamentStatus(t.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-[11px] font-bold border ${
                        t.status === 'live'
                          ? 'bg-red-600/20 text-red-400 border-red-500/40'
                          : t.status === 'completed'
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">🔥 Live Match</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* Room ID & Pass */}
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    <div className="text-amber-300 font-bold">{t.roomId}</div>
                    <div className="text-slate-400">{t.roomPassword}</div>
                  </td>

                  {/* Reveal Status & Manual Trigger */}
                  <td className="py-3.5 px-3">
                    {t.roomRevealed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Unlock className="w-3 h-3" /> Revealed
                      </span>
                    ) : (
                      <button
                        onClick={() => revealRoomCredentials(t.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] transition-colors"
                        title="Bypass countdown and reveal to registered players immediately"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        Reveal Now
                      </button>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    {/* Enter Results Button */}
                    <button
                      onClick={() => handleOpenResults(t)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                      title="Enter match kills, placement & distribute prizes"
                    >
                      Enter Results
                    </button>

                    <button
                      onClick={() => setInspectTournamentId(t.id)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] border border-slate-700"
                      title="View & manage players"
                    >
                      Players
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete tournament "${t.title}"?`)) {
                          deleteTournament(t.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60"
                      title="Delete tournament"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Registered Players Drawer / Section */}
      {inspectTournament && (
        <div className="bg-slate-900 rounded-2xl border border-amber-500/40 p-5 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-heading font-black text-lg text-white">
                Enrolled Players Roster: {inspectTournament.title}
              </h3>
              <p className="text-xs text-slate-400">
                Verify in-game IGNs, slots, or ban/remove players with automated coin refunds.
              </p>
            </div>
            <button
              onClick={() => setInspectTournamentId(null)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
            >
              Close Roster
            </button>
          </div>

          {inspectTournament.registeredPlayers.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No players have enrolled in this tournament yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {inspectTournament.registeredPlayers.map(p => (
                <div
                  key={p.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        Slot #{p.slotNumber}
                      </span>
                      <span className="font-bold text-white text-xs">{p.ign}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      UID: {p.gameUid} • {p.teamName || p.username}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove & refund ${p.ign} from tournament?`)) {
                        removePlayerByAdmin(inspectTournament.id, p.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Remove player & auto-refund entry fee"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <h3 className="font-heading font-black text-xl text-white">
                Create New MK Tournament
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tournament Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Game</label>
                  <select
                    value={newGame}
                    onChange={e => setNewGame(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="BGMI / PUBG Mobile">BGMI / PUBG Mobile</option>
                    <option value="Free Fire MAX">Free Fire MAX</option>
                    <option value="Call of Duty Mobile">Call of Duty Mobile</option>
                    <option value="Apex Legends Mobile">Apex Legends Mobile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mode</label>
                  <select
                    value={newMode}
                    onChange={e => setNewMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Map</label>
                  <input
                    type="text"
                    required
                    value={newMap}
                    onChange={e => setNewMap(e.target.value)}
                    placeholder="Erangel, Bermuda, Miramar..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Match Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newMatchTime}
                    onChange={e => setNewMatchTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Slots (Players/Teams)</label>
                  <input
                    type="number"
                    required
                    value={newSlots}
                    onChange={e => setNewSlots(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Entry Fee (Coins)</label>
                  <input
                    type="number"
                    required
                    value={newEntryFee}
                    onChange={e => setNewEntryFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Total Prize Pool (Coins)</label>
                  <input
                    type="number"
                    required
                    value={newPrizePool}
                    onChange={e => setNewPrizePool(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Custom Room ID</label>
                  <input
                    type="text"
                    required
                    value={newRoomId}
                    onChange={e => setNewRoomId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Room Password</label>
                  <input
                    type="text"
                    required
                    value={newRoomPassword}
                    onChange={e => setNewRoomPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="block text-amber-400 font-bold mb-1">
                    “Password Reveal” Window (Anti-Leak System)
                  </label>
                  <p className="text-slate-400 mb-2">
                    Room password automatically appears on registered players' screens this many minutes before match launch:
                  </p>
                  <select
                    value={newRevealMinutes}
                    onChange={e => setNewRevealMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value={5}>5 Minutes before Match Start</option>
                    <option value={10}>10 Minutes before Match Start (Recommended)</option>
                    <option value={15}>15 Minutes before Match Start</option>
                    <option value={30}>30 Minutes before Match Start</option>
                  </select>
                </div>

              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg transition-all"
                >
                  Publish Tournament
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Enter Match Results & Distribute Coins */}
      {resultTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Result Entry & Prize Payout
                </span>
                <h3 className="font-heading font-black text-xl text-white">
                  {resultTournament.title}
                </h3>
              </div>
              <button
                onClick={() => setResultTournament(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <p className="text-slate-300">
                Input kills and final placement rank for participants. The app automatically calculates points and distributes the{' '}
                <strong className="text-amber-400">{resultTournament.prizePool} Coins</strong> prize pool to the winners' wallets!
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-2 px-2">Player / Squad</th>
                      <th className="py-2 px-2">In-Game Name (IGN)</th>
                      <th className="py-2 px-2 w-24">Placement #</th>
                      <th className="py-2 px-2 w-24">Kills</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {resultRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-850">
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.playerName}
                            onChange={e => {
                              const updated = [...resultRows];
                              updated[idx].playerName = e.target.value;
                              setResultRows(updated);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white w-full"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={row.ign}
                            onChange={e => {
                              const updated = [...resultRows];
                              updated[idx].ign = e.target.value;
                              setResultRows(updated);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono w-full"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={row.placement}
                            onChange={e => {
                              const updated = [...resultRows];
                              updated[idx].placement = Number(e.target.value);
                              setResultRows(updated);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center w-full font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            min={0}
                            value={row.kills}
                            onChange={e => {
                              const updated = [...resultRows];
                              updated[idx].kills = Number(e.target.value);
                              setResultRows(updated);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 text-center w-full font-bold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add extra row button */}
              <button
                type="button"
                onClick={() => {
                  setResultRows([
                    ...resultRows,
                    {
                      playerName: `New Player ${resultRows.length + 1}`,
                      ign: `IGN_${resultRows.length + 1}`,
                      gameUid: `51928400${resultRows.length + 1}`,
                      teamName: 'Solo',
                      kills: 1,
                      placement: resultRows.length + 1,
                    },
                  ]);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                + Add Another Player Result
              </button>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePublishResults}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-heading font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Publish Leaderboard & Auto-Credit Prize Coins
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
