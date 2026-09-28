import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';
import { Tournament } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

interface RoomCredentialsModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onJoinClick?: (tournament: Tournament) => void;
}

export const RoomCredentialsModal: React.FC<RoomCredentialsModalProps> = ({
  tournament,
  onClose,
  onJoinClick,
}) => {
  const { isPlayerRegistered, isAdmin, revealRoomCredentials, getRoomCredentialsStatus } = useTournaments();
  const [copiedField, setCopiedField] = useState<'id' | 'password' | 'all' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [, setTick] = useState(0);

  // Update countdown every second while modal is open
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!tournament) return null;

  const isRegistered = isPlayerRegistered(tournament.id);
  const status = getRoomCredentialsStatus(tournament);

  const handleCopy = (text: string, field: 'id' | 'password' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const copyAllText = `🎮 MK Tournament: ${tournament.title}\n📍 Map: ${tournament.map} (${tournament.mode})\n🔑 Room ID: ${tournament.roomId}\n🔒 Room Password: ${tournament.roomPassword}\n⚠️ Please join your assigned slot strictly on time!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${status.canView ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {status.canView ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Custom Room Credentials
              </h3>
              <p className="text-xs text-slate-400">
                {tournament.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Condition 1: User is NOT registered and NOT admin */}
          {!isRegistered && !isAdmin ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-white">
                  Room Credentials Protected
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  To prevent unauthorized leaks, Room ID & Password are only visible to confirmed registered participants.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Entry Fee:</span>
                  <span className="font-bold text-amber-400">{tournament.entryFee} Coins</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Slots:</span>
                  <span className="font-bold">{tournament.registeredPlayers.length} / {tournament.totalSlots} Booked</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Password Reveal:</span>
                  <span className="text-cyan-400 font-semibold">{tournament.revealMinutesBefore} mins before match</span>
                </div>
              </div>

              {tournament.status === 'upcoming' && tournament.registeredPlayers.length < tournament.totalSlots ? (
                <button
                  onClick={() => {
                    onClose();
                    if (onJoinClick) onJoinClick(tournament);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-heading font-black text-base shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Join Tournament to Unlock Room
                </button>
              ) : (
                <p className="text-xs text-rose-400 font-medium">
                  {tournament.status === 'live' ? 'Match has already started. Spectate instead!' : 'Tournament slots are currently full.'}
                </p>
              )}
            </div>
          ) : !status.canView ? (
            /* Condition 2: Registered / Admin, but Reveal time hasn't arrived yet! */
            <div className="space-y-5 text-center py-2">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                <div className="w-18 h-18 rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Countdown</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Password Reveal Protection Active
                </div>
                <h4 className="font-heading text-xl font-bold text-white">
                  Unlocks In: <span className="text-amber-400 font-mono text-2xl">{status.formattedCountdown}</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                  Room ID and Password are kept confidential until exactly <strong className="text-slate-200">{tournament.revealMinutesBefore} minutes</strong> before the scheduled match time. This screen will auto-reveal!
                </p>
              </div>

              {/* Match overview details */}
              <div className="grid grid-cols-2 gap-2 text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Game Mode</span>
                  <span className="font-semibold text-white">{tournament.game} ({tournament.mode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Map</span>
                  <span className="font-semibold text-white">{tournament.map}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Your Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Registered & Confirmed
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Match Time</span>
                  <span className="font-semibold text-white">
                    {new Date(tournament.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => revealRoomCredentials(tournament.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Admin Override: Reveal Credentials Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Condition 3: Revealed and Allowed to View! */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Credentials Successfully Revealed
                </span>
                <span className="text-[11px] text-slate-400">Match Ready</span>
              </div>

              {/* Room ID Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Room ID</span>
                  <span className="text-slate-400 text-[10px]">Enter in Custom Match</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono font-black text-lg text-amber-400 tracking-wider">
                    {tournament.roomId}
                  </span>
                  <button
                    onClick={() => handleCopy(tournament.roomId, 'id')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-200 text-xs font-bold transition-all"
                  >
                    {copiedField === 'id' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Room Password Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Room Password</span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono font-black text-lg text-emerald-400 tracking-wider">
                    {showPassword ? tournament.roomPassword : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => handleCopy(tournament.roomPassword, 'password')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-xs font-bold transition-all"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Copy Full Squad Details */}
              <button
                onClick={() => handleCopy(copyAllText, 'all')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                {copiedField === 'all' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>All Credentials Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copy Full Room Info (For Squad Chat)</span>
                  </>
                )}
              </button>

              {/* Tournament Match Instructions */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Important Custom Room Rules</span>
                </div>
                <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                  <li>Please join your assigned slot strictly. Changing slots may cause auto-kick.</li>
                  <li>Do NOT share credentials with non-registered players.</li>
                  <li>Match begins automatically at scheduled start time.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
