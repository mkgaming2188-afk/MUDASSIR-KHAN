import React, { useState } from 'react';
import {
  X,
  Coins,
  Shield,
  Users,
  AlertCircle,
  Check,
  Zap,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Tournament } from '../types/tournament';
import { useTournaments } from '../context/TournamentContext';

interface JoinModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: (tournament: Tournament) => void;
  onOpenWallet: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  tournament,
  onClose,
  onSuccess,
  onOpenWallet,
}) => {
  const { user, joinTournament, addCoins } = useTournaments();

  const [ign, setIgn] = useState(user.ign || 'MK_PLAYER_01');
  const [gameUid, setGameUid] = useState(user.gameUid || '5192840192');
  const [teamName, setTeamName] = useState(
    tournament?.mode !== 'Solo' ? `${user.username}'s Squad` : ''
  );

  // Teammates for Duo / Squad
  const [teammate1Ign, setTeammate1Ign] = useState('MK_SCOUT_OP');
  const [teammate1Uid, setTeammate1Uid] = useState('5192840193');
  const [teammate2Ign, setTeammate2Ign] = useState('MK_SNIPER_PRO');
  const [teammate2Uid, setTeammate2Uid] = useState('5192840194');
  const [teammate3Ign, setTeammate3Ign] = useState('MK_ASSAULT_9');
  const [teammate3Uid, setTeammate3Uid] = useState('5192840195');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tournament) return null;

  const hasEnoughCoins = user.coins >= tournament.entryFee;
  const balanceAfter = user.coins - tournament.entryFee;

  const handleQuickAddCoins = () => {
    addCoins(tournament.entryFee, 'Quick Top-Up for Tournament');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ign.trim()) {
      setError('Please provide your In-Game Name (IGN).');
      return;
    }
    if (!gameUid.trim()) {
      setError('Please provide your numeric In-Game UID.');
      return;
    }

    if (tournament.mode !== 'Solo' && !teamName.trim()) {
      setError('Please specify a Team / Squad Name.');
      return;
    }

    const teammates = [];
    if (tournament.mode === 'Duo' || tournament.mode === 'Squad') {
      teammates.push({ ign: teammate1Ign, gameUid: teammate1Uid });
    }
    if (tournament.mode === 'Squad') {
      teammates.push({ ign: teammate2Ign, gameUid: teammate2Uid });
      teammates.push({ ign: teammate3Ign, gameUid: teammate3Uid });
    }

    setIsSubmitting(true);

    const res = joinTournament({
      tournamentId: tournament.id,
      ign,
      gameUid,
      teamName: tournament.mode !== 'Solo' ? teamName : undefined,
      teammates: teammates.length > 0 ? teammates : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess(tournament);
      onClose();
    } else {
      setError(res.error || 'Failed to join tournament.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Tournament Registration
            </span>
            <h3 className="font-heading font-black text-xl text-white">
              {tournament.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {tournament.game} • {tournament.mode} • Map: {tournament.map}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Fee & Balance Overview */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="border-r border-slate-800 pr-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Entry Fee</span>
              <span className="font-heading text-lg font-bold text-amber-400">
                {tournament.entryFee} 🪙
              </span>
            </div>
            <div className="border-r border-slate-800 px-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Balance</span>
              <span className="font-heading text-lg font-bold text-slate-200">
                {user.coins} 🪙
              </span>
            </div>
            <div className="pl-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">After Join</span>
              <span className={`font-heading text-lg font-bold ${hasEnoughCoins ? 'text-emerald-400' : 'text-rose-400'}`}>
                {balanceAfter} 🪙
              </span>
            </div>
          </div>

          {/* Insufficient Coins Warning */}
          {!hasEnoughCoins && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>You need {tournament.entryFee - user.coins} more coins to join.</span>
              </div>
              <button
                type="button"
                onClick={handleQuickAddCoins}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] shrink-0 transition-colors"
              >
                + Top Up Now
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Captain / Main Player Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              {tournament.mode === 'Solo' ? 'Player Profile' : 'Team Captain Details'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  In-Game Name (IGN) *
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={e => setIgn(e.target.value)}
                  placeholder="e.g. MK_LEGEND_OP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Game Character UID *
                </label>
                <input
                  type="text"
                  required
                  value={gameUid}
                  onChange={e => setGameUid(e.target.value)}
                  placeholder="e.g. 5192840192"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Team / Squad Details (if Duo or Squad) */}
          {tournament.mode !== 'Solo' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  {tournament.mode} Members Roster
                </h4>
                <span className="text-[10px] text-slate-400">Slots assigned sequentially</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. MK Esports / Shadow Legends"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Teammate 1 */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #2 IGN</label>
                  <input
                    type="text"
                    value={teammate1Ign}
                    onChange={e => setTeammate1Ign(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #2 UID</label>
                  <input
                    type="text"
                    value={teammate1Uid}
                    onChange={e => setTeammate1Uid(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Teammate 2 & 3 for Squad */}
              {tournament.mode === 'Squad' && (
                <>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #3 IGN</label>
                      <input
                        type="text"
                        value={teammate2Ign}
                        onChange={e => setTeammate2Ign(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #3 UID</label>
                      <input
                        type="text"
                        value={teammate2Uid}
                        onChange={e => setTeammate2Uid(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #4 IGN</label>
                      <input
                        type="text"
                        value={teammate3Ign}
                        onChange={e => setTeammate3Ign(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Teammate #4 UID</label>
                      <input
                        type="text"
                        value={teammate3Uid}
                        onChange={e => setTeammate3Uid(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rules Acknowledgement */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Registration Terms:</span>
            <p>
              • Entry fee of <strong>{tournament.entryFee} coins</strong> will be immediately debited.
            </p>
            <p>
              • Room ID & Password will be unlocked <strong>{tournament.revealMinutesBefore} minutes</strong> prior to match start on your Room Details screen.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!hasEnoughCoins || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-heading font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                hasEnoughCoins && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isSubmitting
                ? 'Confirming Slot...'
                : `Confirm Entry & Pay ${tournament.entryFee} Coins`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
