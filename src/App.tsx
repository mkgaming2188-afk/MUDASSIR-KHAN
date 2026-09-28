/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TournamentProvider, useTournaments } from './context/TournamentContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SpectatorView } from './components/SpectatorView';
import { LeaderboardView } from './components/LeaderboardView';
import { WalletView } from './components/WalletView';
import { AdminPanel } from './components/AdminPanel';
import { JoinModal } from './components/JoinModal';
import { RoomCredentialsModal } from './components/RoomCredentialsModal';
import { Tournament } from './types/tournament';
import { Trophy, Tv, Wallet, ShieldAlert, Heart, Zap } from 'lucide-react';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'home' | 'spectator' | 'wallet' | 'leaderboards' | 'admin'>('home');
  const [joinModalTournament, setJoinModalTournament] = useState<Tournament | null>(null);
  const [roomModalTournament, setRoomModalTournament] = useState<Tournament | null>(null);
  const [selectedLeaderboardTourId, setSelectedLeaderboardTourId] = useState<string | undefined>(undefined);

  const { setActiveSpectatorTournamentId } = useTournaments();

  const handleSpectateClick = (tournament: Tournament) => {
    setActiveSpectatorTournamentId(tournament.id);
    setCurrentTab('spectator');
  };

  const handleResultsClick = (tournament: Tournament) => {
    setSelectedLeaderboardTourId(tournament.id);
    setCurrentTab('leaderboards');
  };

  const handleJoinSuccess = (tournament: Tournament) => {
    // After joining, open the room credentials modal to show their slot and countdown/credentials
    setRoomModalTournament(tournament);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenWallet={() => setCurrentTab('wallet')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomeView
            onJoinClick={tour => setJoinModalTournament(tour)}
            onRoomClick={tour => setRoomModalTournament(tour)}
            onSpectateClick={handleSpectateClick}
            onResultsClick={handleResultsClick}
            onOpenWallet={() => setCurrentTab('wallet')}
          />
        )}

        {currentTab === 'spectator' && (
          <SpectatorView
            onBackToTournaments={() => setCurrentTab('home')}
            onOpenRoomModal={tour => setRoomModalTournament(tour)}
          />
        )}

        {currentTab === 'leaderboards' && (
          <LeaderboardView
            selectedTournamentId={selectedLeaderboardTourId}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'wallet' && (
          <WalletView />
        )}

        {currentTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Modals */}
      {joinModalTournament && (
        <JoinModal
          tournament={joinModalTournament}
          onClose={() => setJoinModalTournament(null)}
          onSuccess={handleJoinSuccess}
          onOpenWallet={() => {
            setJoinModalTournament(null);
            setCurrentTab('wallet');
          }}
        />
      )}

      {roomModalTournament && (
        <RoomCredentialsModal
          tournament={roomModalTournament}
          onClose={() => setRoomModalTournament(null)}
          onJoinClick={tour => setJoinModalTournament(tour)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-xs">
              MK
            </div>
            <span className="font-heading font-black text-sm text-white">MK TOURNAMENT</span>
            <span>• Next-Gen Esports Tournament Platform</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button
              onClick={() => setCurrentTab('home')}
              className="hover:text-amber-400 transition-colors"
            >
              Tournaments
            </button>
            <button
              onClick={() => setCurrentTab('spectator')}
              className="hover:text-red-400 transition-colors"
            >
              Live Spectate
            </button>
            <button
              onClick={() => setCurrentTab('wallet')}
              className="hover:text-emerald-400 transition-colors"
            >
              Coin Wallet
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="hover:text-indigo-400 transition-colors"
            >
              Organizer Admin
            </button>
          </div>

          <div className="text-right text-[11px] text-slate-600">
            Virtual Gaming Coins Prototype • Fair-Play Certified
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <MainApp />
    </TournamentProvider>
  );
}
