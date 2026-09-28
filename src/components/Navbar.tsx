import React from 'react';
import {
  Trophy,
  Coins,
  Tv,
  ShieldAlert,
  Wallet,
  User,
  PlusCircle,
  Gift,
  Flame,
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

interface NavbarProps {
  currentTab: 'home' | 'spectator' | 'wallet' | 'leaderboards' | 'admin';
  setCurrentTab: (tab: 'home' | 'spectator' | 'wallet' | 'leaderboards' | 'admin') => void;
  onOpenWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenWallet }) => {
  const { user, isAdmin, setIsAdmin, tournaments, claimDailyReward, activeSpectatorTournamentId, setActiveSpectatorTournamentId } = useTournaments();

  const liveTournamentsCount = tournaments.filter(t => t.status === 'live').length;
  const todayStr = new Date().toDateString();
  const canClaimDaily = user.dailyRewardClaimedAt !== todayStr;

  const handleOpenSpectator = () => {
    // If no active spectator tournament selected, default to first live tournament or first tournament
    if (!activeSpectatorTournamentId) {
      const liveTour = tournaments.find(t => t.status === 'live');
      if (liveTour) {
        setActiveSpectatorTournamentId(liveTour.id);
      } else if (tournaments.length > 0) {
        setActiveSpectatorTournamentId(tournaments[0].id);
      }
    }
    setCurrentTab('spectator');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-heading font-black text-xl text-black tracking-wider">MK</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                  MK <span className="text-amber-400">Tournament</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-950/80 text-red-400 border border-red-800/50">
                  Esports Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Custom Rooms • Instant Reveal • Spectator Stream
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Tournaments
            </button>

            <button
              onClick={handleOpenSpectator}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'spectator'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tv className="w-4 h-4 text-red-400" />
              Spectator Mode
              {liveTournamentsCount > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.2 text-[10px] uppercase font-black bg-red-500 text-white rounded-full animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  Live
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('leaderboards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'leaderboards'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              Leaderboards
            </button>

            <button
              onClick={() => setCurrentTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'wallet'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              Wallet
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Admin Panel
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Daily Reward Quick Claim */}
            {canClaimDaily && (
              <button
                onClick={() => claimDailyReward()}
                title="Claim daily 250 free coins"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                <Gift className="w-3.5 h-3.5 animate-bounce" />
                <span>+250 Free</span>
              </button>
            )}

            {/* Coin Balance Pill */}
            <div 
              onClick={onOpenWallet}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer transition-all hover:border-amber-400 shadow-sm group"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400">
                <Coins className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-semibold leading-none uppercase">Coins</span>
                <span className="font-heading text-base font-bold text-amber-400 leading-tight">
                  {user.coins.toLocaleString()}
                </span>
              </div>
              <PlusCircle className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400 ml-0.5" />
            </div>

            {/* Profile / Admin toggle */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                onClick={() => {
                  const newIsAdmin = !isAdmin;
                  setIsAdmin(newIsAdmin);
                }}
                title={isAdmin ? "Switch to Player Mode" : "Switch to Admin / Organizer Mode"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  isAdmin 
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAdmin ? 'Admin Mode' : 'Organizer?'}</span>
              </button>

              <div 
                onClick={() => setCurrentTab('wallet')}
                className="flex items-center gap-2 p-1 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors"
                title={`${user.username} (${user.ign})`}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="flex md:hidden items-center justify-around bg-slate-900/95 py-2 px-2 border-t border-slate-800/80 text-xs font-semibold">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded ${
            currentTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Matches</span>
        </button>

        <button
          onClick={handleOpenSpectator}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded ${
            currentTab === 'spectator' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Spectate</span>
          {liveTournamentsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('leaderboards')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded ${
            currentTab === 'leaderboards' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Ranks</span>
        </button>

        <button
          onClick={() => setCurrentTab('wallet')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded ${
            currentTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet</span>
        </button>

        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded ${
            currentTab === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
