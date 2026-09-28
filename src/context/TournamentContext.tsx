import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Tournament,
  UserProfile,
  WalletTransaction,
  TournamentResult,
  RegisteredPlayer,
  LiveMatchState,
  LiveSpectatorPlayer,
  KillFeedItem,
} from '../types/tournament';
import {
  INITIAL_USER,
  INITIAL_TOURNAMENTS,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';

interface JoinTournamentParams {
  tournamentId: string;
  ign: string;
  gameUid: string;
  teamName?: string;
  teammates?: { ign: string; gameUid: string }[];
}

interface TournamentContextType {
  user: UserProfile;
  tournaments: Tournament[];
  transactions: WalletTransaction[];
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  joinTournament: (params: JoinTournamentParams) => { success: boolean; error?: string };
  leaveTournament: (tournamentId: string) => { success: boolean; error?: string };
  createTournament: (data: Partial<Tournament>) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  revealRoomCredentials: (tournamentId: string) => void;
  setTournamentStatus: (tournamentId: string, status: Tournament['status']) => void;
  publishResults: (tournamentId: string, results: TournamentResult[]) => void;
  removePlayerByAdmin: (tournamentId: string, playerId: string) => void;
  claimDailyReward: () => { success: boolean; coinsClaimed: number; error?: string };
  addCoins: (amount: number, reason: string) => void;
  switchUserRole: (role: 'player' | 'admin') => void;
  activeSpectatorTournamentId: string | null;
  setActiveSpectatorTournamentId: (id: string | null) => void;
  spectatorSelectedPlayerId: string | null;
  setSpectatorSelectedPlayerId: (id: string | null) => void;
  simulateSpectatorEvent: (tournamentId: string) => void;
  isPlayerRegistered: (tournamentId: string, userId?: string) => boolean;
  getRoomCredentialsStatus: (tournament: Tournament) => {
    isRevealed: boolean;
    canView: boolean;
    secondsUntilReveal: number;
    formattedCountdown: string;
    reason?: string;
  };
  resetAllData: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'mk_tournament_user_v2',
  TOURNAMENTS: 'mk_tournament_list_v2',
  TRANSACTIONS: 'mk_tournament_tx_v2',
  IS_ADMIN: 'mk_tournament_is_admin_v2',
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USER;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TOURNAMENTS;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
    return saved ? JSON.parse(saved) : false;
  });

  const [activeSpectatorTournamentId, setActiveSpectatorTournamentId] = useState<string | null>(null);
  const [spectatorSelectedPlayerId, setSpectatorSelectedPlayerId] = useState<string | null>('sp_1');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Periodic check for automatic password reveal countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setTournaments(prev =>
        prev.map(t => {
          if (t.roomRevealed || t.status === 'completed' || t.status === 'cancelled') {
            return t;
          }
          const matchTime = new Date(t.matchTime).getTime();
          const revealThresholdTime = matchTime - t.revealMinutesBefore * 60 * 1000;
          if (now >= revealThresholdTime) {
            return { ...t, roomRevealed: true };
          }
          return t;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Live match simulator ticker for active live matches
  useEffect(() => {
    const interval = setInterval(() => {
      setTournaments(prev =>
        prev.map(t => {
          if (t.status !== 'live' || !t.liveMatchState || t.liveMatchState.isMatchFinished) {
            return t;
          }

          const lms = { ...t.liveMatchState };
          lms.matchElapsedSeconds += 3;

          // Countdown shrink timer
          if (lms.circleShrinkTimer > 0) {
            lms.circleShrinkTimer = Math.max(0, lms.circleShrinkTimer - 3);
          } else if (lms.currentCircle < 5) {
            lms.currentCircle += 1;
            lms.circleShrinkTimer = 120;
          }

          // Random spectator count fluctuation
          const spectatorDelta = Math.floor(Math.random() * 5) - 2;
          lms.spectatorCount = Math.max(50, lms.spectatorCount + spectatorDelta);

          return { ...t, liveMatchState: lms };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isPlayerRegistered = (tournamentId: string, userId: string = user.id): boolean => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return false;
    return tournament.registeredPlayers.some(p => p.userId === userId);
  };

  const getRoomCredentialsStatus = (tournament: Tournament) => {
    const now = new Date().getTime();
    const matchTime = new Date(tournament.matchTime).getTime();
    const revealTime = matchTime - tournament.revealMinutesBefore * 60 * 1000;
    const diffMs = revealTime - now;
    const isPastRevealTime = diffMs <= 0 || tournament.roomRevealed;

    const registered = isPlayerRegistered(tournament.id);
    const canView = (registered || isAdmin) && isPastRevealTime;

    const secondsUntilReveal = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(secondsUntilReveal / 60);
    const secs = secondsUntilReveal % 60;
    const formattedCountdown = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    let reason = '';
    if (!registered && !isAdmin) {
      reason = 'You must be registered in this tournament to view the Room ID and Password.';
    } else if (!isPastRevealTime) {
      reason = `Room credentials will unlock ${tournament.revealMinutesBefore} minutes prior to match launch.`;
    }

    return {
      isRevealed: isPastRevealTime,
      canView,
      secondsUntilReveal,
      formattedCountdown,
      reason,
    };
  };

  const joinTournament = ({
    tournamentId,
    ign,
    gameUid,
    teamName,
    teammates,
  }: JoinTournamentParams) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found' };

    if (tournament.status !== 'upcoming') {
      return { success: false, error: 'Tournament registration is closed or already in progress.' };
    }

    if (tournament.registeredPlayers.length >= tournament.totalSlots) {
      return { success: false, error: 'Tournament is full! All slots have been booked.' };
    }

    if (isPlayerRegistered(tournamentId)) {
      return { success: false, error: 'You are already registered for this tournament.' };
    }

    if (user.coins < tournament.entryFee) {
      return {
        success: false,
        error: `Insufficient coins! Entry fee is ${tournament.entryFee} coins. You have ${user.coins} coins.`,
      };
    }

    // Deduct entry fee
    const newBalance = user.coins - tournament.entryFee;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'entry_fee',
      amount: -tournament.entryFee,
      balanceAfter: newBalance,
      title: 'Tournament Entry Fee',
      description: `Registered for "${tournament.title}" (${tournament.mode})`,
      timestamp: new Date().toISOString(),
      tournamentId: tournament.id,
    };

    const newPlayer: RegisteredPlayer = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      username: user.username,
      ign: ign || user.ign,
      gameUid: gameUid || user.gameUid,
      slotNumber: tournament.registeredPlayers.length + 1,
      registeredAt: new Date().toISOString(),
      teamName: teamName || (tournament.mode !== 'Solo' ? `${user.username}'s Squad` : undefined),
      teammates,
      isVerified: true,
    };

    // Update user
    setUser(prev => ({
      ...prev,
      coins: newBalance,
      tournamentsJoined: prev.tournamentsJoined + 1,
      ign: ign || prev.ign,
      gameUid: gameUid || prev.gameUid,
    }));

    // Update tournaments
    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tournamentId) {
          return {
            ...t,
            registeredPlayers: [...t.registeredPlayers, newPlayer],
          };
        }
        return t;
      })
    );

    setTransactions(prev => [newTx, ...prev]);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore in tests
    }

    return { success: true };
  };

  const leaveTournament = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found' };

    const player = tournament.registeredPlayers.find(p => p.userId === user.id);
    if (!player) return { success: false, error: 'You are not registered in this tournament' };

    if (tournament.status !== 'upcoming') {
      return { success: false, error: 'Cannot cancel registration once match is live or completed.' };
    }

    // Refund coins
    const refundAmount = tournament.entryFee;
    const newBalance = user.coins + refundAmount;

    const newTx: WalletTransaction = {
      id: `tx_ref_${Date.now()}`,
      userId: user.id,
      type: 'refund',
      amount: refundAmount,
      balanceAfter: newBalance,
      title: 'Tournament Entry Refund',
      description: `Cancelled registration for "${tournament.title}"`,
      timestamp: new Date().toISOString(),
      tournamentId: tournament.id,
    };

    setUser(prev => ({
      ...prev,
      coins: newBalance,
      tournamentsJoined: Math.max(0, prev.tournamentsJoined - 1),
    }));

    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tournamentId) {
          return {
            ...t,
            registeredPlayers: t.registeredPlayers.filter(p => p.userId !== user.id),
          };
        }
        return t;
      })
    );

    setTransactions(prev => [newTx, ...prev]);

    return { success: true };
  };

  const removePlayerByAdmin = (tournamentId: string, playerId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const playerToRemove = tournament.registeredPlayers.find(p => p.id === playerId);
    if (!playerToRemove) return;

    // If removing the current user, refund coins
    if (playerToRemove.userId === user.id) {
      const refundAmount = tournament.entryFee;
      const newBalance = user.coins + refundAmount;
      const newTx: WalletTransaction = {
        id: `tx_admin_refund_${Date.now()}`,
        userId: user.id,
        type: 'refund',
        amount: refundAmount,
        balanceAfter: newBalance,
        title: 'Admin Refund & Removal',
        description: `Removed from "${tournament.title}" by organizer with full refund`,
        timestamp: new Date().toISOString(),
        tournamentId: tournament.id,
      };
      setUser(prev => ({
        ...prev,
        coins: newBalance,
        tournamentsJoined: Math.max(0, prev.tournamentsJoined - 1),
      }));
      setTransactions(prev => [newTx, ...prev]);
    }

    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tournamentId) {
          return {
            ...t,
            registeredPlayers: t.registeredPlayers.filter(p => p.id !== playerId),
          };
        }
        return t;
      })
    );
  };

  const createTournament = (data: Partial<Tournament>) => {
    const newTournament: Tournament = {
      id: `tour_${Date.now()}`,
      title: data.title || 'New MK Championship',
      game: data.game || 'BGMI / PUBG Mobile',
      mode: data.mode || 'Squad',
      map: data.map || 'Erangel',
      matchTime: data.matchTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      entryFee: data.entryFee ?? 100,
      prizePool: data.prizePool ?? 3000,
      perKillBonus: data.perKillBonus ?? 10,
      prizeBreakdown: data.prizeBreakdown || [
        { rank: '1st', amount: Math.floor((data.prizePool ?? 3000) * 0.5), label: '🏆 Champion' },
        { rank: '2nd', amount: Math.floor((data.prizePool ?? 3000) * 0.3), label: '🥈 2nd Place' },
        { rank: '3rd', amount: Math.floor((data.prizePool ?? 3000) * 0.2), label: '🥉 3rd Place' },
      ],
      totalSlots: data.totalSlots ?? 48,
      status: 'upcoming',
      roomId: data.roomId || `MK-ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
      roomPassword: data.roomPassword || `MK_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      revealMinutesBefore: data.revealMinutesBefore ?? 10,
      roomRevealed: false,
      rules: data.rules || [
        'Mobile devices only. No emulators.',
        'No hacking, teaming or third party scripts.',
        'Room credentials reveal strictly before match time.',
      ],
      registeredPlayers: [],
      bannerUrl:
        data.bannerUrl ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    };

    setTournaments(prev => [newTournament, ...prev]);
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTournament = (id: string) => {
    setTournaments(prev => prev.filter(t => t.id !== id));
  };

  const revealRoomCredentials = (tournamentId: string) => {
    setTournaments(prev =>
      prev.map(t => (t.id === tournamentId ? { ...t, roomRevealed: true } : t))
    );
  };

  const setTournamentStatus = (tournamentId: string, status: Tournament['status']) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id !== tournamentId) return t;

        // If setting to live and lacks liveMatchState, generate liveMatchState from registered players
        let liveMatchState = t.liveMatchState;
        if (status === 'live' && !liveMatchState) {
          const players: LiveSpectatorPlayer[] = (
            t.registeredPlayers.length > 0 ? t.registeredPlayers : [
              { id: '1', userId: 'usr_mk_01', username: 'MK Gaming', ign: 'MK_LEGEND_OP', gameUid: '5192840192', slotNumber: 1, registeredAt: '' },
              { id: '2', userId: 'usr_02', username: 'Viper Claw', ign: 'VIPER_CLAWS', gameUid: '4820194821', slotNumber: 2, registeredAt: '' },
              { id: '3', userId: 'usr_03', username: 'Phoenix God', ign: 'PHX_FIRE_GOD', gameUid: '9201940121', slotNumber: 3, registeredAt: '' },
              { id: '4', userId: 'usr_04', username: 'Cyber Titan', ign: 'CYBER_TITAN', gameUid: '7829104712', slotNumber: 4, registeredAt: '' },
            ]
          ).map((p, idx) => ({
            id: `sp_${p.id || idx}`,
            name: p.username,
            ign: p.ign,
            gameUid: p.gameUid,
            teamName: p.teamName || `Team #${idx + 1}`,
            teamColor: ['#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#a855f7'][idx % 5],
            status: 'alive',
            health: 100,
            armor: 100,
            kills: 0,
            damage: 0,
            headshots: 0,
            weapons: {
              primary: 'M416 (Red Dot)',
              secondary: 'AWM Sniper',
              throwable: 'Smoke Grenade (x2)',
            },
            coords: {
              x: 25 + Math.floor(Math.random() * 50),
              y: 25 + Math.floor(Math.random() * 50),
            },
          }));

          liveMatchState = {
            currentCircle: 1,
            circleShrinkTimer: 180,
            alivePlayers: players.length,
            totalPlayers: players.length,
            aliveTeams: Math.min(players.length, 12),
            totalTeams: Math.min(players.length, 12),
            matchElapsedSeconds: 0,
            spectatorCount: 85,
            isMatchFinished: false,
            killFeed: [],
            players,
          };
        }

        return {
          ...t,
          status,
          roomRevealed: status === 'live' ? true : t.roomRevealed,
          liveMatchState,
        };
      })
    );
  };

  const publishResults = (tournamentId: string, results: TournamentResult[]) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    // Check if current user won any prize
    const currentUserResult = results.find(
      r => r.playerName === user.username || r.ign === user.ign || r.gameUid === user.gameUid
    );

    if (currentUserResult && currentUserResult.prizeWon > 0) {
      const prizeAmount = currentUserResult.prizeWon;
      const newBalance = user.coins + prizeAmount;
      const newTx: WalletTransaction = {
        id: `tx_prize_${Date.now()}`,
        userId: user.id,
        type: 'prize_won',
        amount: prizeAmount,
        balanceAfter: newBalance,
        title: `🏆 Rank #${currentUserResult.rank} Tournament Prize`,
        description: `Won ${prizeAmount} coins in "${tournament.title}" (${currentUserResult.kills} kills, ${currentUserResult.totalPoints} pts)`,
        timestamp: new Date().toISOString(),
        tournamentId: tournament.id,
      };

      setUser(prev => ({
        ...prev,
        coins: newBalance,
        tournamentsWon: currentUserResult.rank === 1 ? prev.tournamentsWon + 1 : prev.tournamentsWon,
        totalKills: prev.totalKills + currentUserResult.kills,
      }));

      setTransactions(prev => [newTx, ...prev]);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    setTournaments(prev =>
      prev.map(t =>
        t.id === tournamentId
          ? {
              ...t,
              status: 'completed',
              results,
              liveMatchState: t.liveMatchState
                ? { ...t.liveMatchState, isMatchFinished: true, winnerTeam: results[0]?.teamName || results[0]?.playerName }
                : undefined,
            }
          : t
      )
    );
  };

  const claimDailyReward = () => {
    const todayStr = new Date().toDateString();
    if (user.dailyRewardClaimedAt === todayStr) {
      return { success: false, coinsClaimed: 0, error: 'Daily reward already claimed today! Return tomorrow.' };
    }

    const rewardCoins = 250;
    const newBalance = user.coins + rewardCoins;
    const newTx: WalletTransaction = {
      id: `tx_reward_${Date.now()}`,
      userId: user.id,
      type: 'reward_claimed',
      amount: rewardCoins,
      balanceAfter: newBalance,
      title: '🪙 Daily Bonus Claimed',
      description: 'Free daily login check-in streak reward',
      timestamp: new Date().toISOString(),
    };

    setUser(prev => ({
      ...prev,
      coins: newBalance,
      dailyRewardClaimedAt: todayStr,
    }));

    setTransactions(prev => [newTx, ...prev]);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
      });
    } catch (e) {
      // ignore
    }

    return { success: true, coinsClaimed: rewardCoins };
  };

  const addCoins = (amount: number, reason: string) => {
    const newBalance = user.coins + amount;
    const newTx: WalletTransaction = {
      id: `tx_add_${Date.now()}`,
      userId: user.id,
      type: 'top_up',
      amount,
      balanceAfter: newBalance,
      title: '🪙 Wallet Top-Up',
      description: reason || 'Coins added to wallet',
      timestamp: new Date().toISOString(),
    };

    setUser(prev => ({
      ...prev,
      coins: newBalance,
    }));

    setTransactions(prev => [newTx, ...prev]);
  };

  const switchUserRole = (role: 'player' | 'admin') => {
    setIsAdmin(role === 'admin');
    setUser(prev => ({ ...prev, role }));
  };

  // Spectator simulation trigger: simulate real battle action (kills, knocks, damage)
  const simulateSpectatorEvent = (tournamentId: string) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id !== tournamentId || !t.liveMatchState || t.liveMatchState.isMatchFinished) return t;

        const lms = { ...t.liveMatchState };
        const alivePlayers = lms.players.filter(p => p.status === 'alive');
        if (alivePlayers.length < 2) {
          lms.isMatchFinished = true;
          lms.winnerTeam = alivePlayers[0]?.teamName || alivePlayers[0]?.name;
          return { ...t, liveMatchState: lms };
        }

        // Pick killer and victim from different teams
        const killer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const potentialVictims = alivePlayers.filter(p => p.teamName !== killer.teamName && p.id !== killer.id);
        if (potentialVictims.length === 0) return t;

        const victim = potentialVictims[Math.floor(Math.random() * potentialVictims.length)];
        const weapons = ['M416', 'AWM', 'Beryl M762', 'AKM', 'Kar98k', 'Frag Grenade', 'Groza', 'UMP45'];
        const chosenWeapon = weapons[Math.floor(Math.random() * weapons.length)];
        const isHeadshot = Math.random() > 0.6;

        const damageDealt = Math.floor(60 + Math.random() * 80);

        // Update killer
        killer.kills += 1;
        killer.damage += damageDealt;
        if (isHeadshot) killer.headshots += 1;

        // Eliminate victim
        victim.health = 0;
        victim.armor = 0;
        victim.status = 'eliminated';
        victim.eliminatedBy = killer.ign;
        victim.eliminatedAt = `${Math.floor(lms.matchElapsedSeconds / 60)}m ${lms.matchElapsedSeconds % 60}s`;

        const newKillFeedItem: KillFeedItem = {
          id: `kf_${Date.now()}`,
          killer: killer.ign,
          killerTeam: killer.teamName,
          victim: victim.ign,
          victimTeam: victim.teamName,
          weapon: chosenWeapon,
          isHeadshot,
          timestamp: `${Math.floor(lms.matchElapsedSeconds / 60)}m ${lms.matchElapsedSeconds % 60}s`,
        };

        lms.killFeed = [newKillFeedItem, ...lms.killFeed.slice(0, 7)];
        lms.alivePlayers = lms.players.filter(p => p.status !== 'eliminated').length;

        // Count unique alive teams
        const uniqueAliveTeams = new Set(
          lms.players.filter(p => p.status !== 'eliminated').map(p => p.teamName)
        );
        lms.aliveTeams = uniqueAliveTeams.size;

        if (lms.aliveTeams <= 1) {
          lms.isMatchFinished = true;
          lms.winnerTeam = killer.teamName;
        }

        return { ...t, liveMatchState: lms };
      })
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
    setUser(INITIAL_USER);
    setTournaments(INITIAL_TOURNAMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setIsAdmin(false);
  };

  return (
    <TournamentContext.Provider
      value={{
        user,
        tournaments,
        transactions,
        isAdmin,
        setIsAdmin,
        joinTournament,
        leaveTournament,
        createTournament,
        updateTournament,
        deleteTournament,
        revealRoomCredentials,
        setTournamentStatus,
        publishResults,
        removePlayerByAdmin,
        claimDailyReward,
        addCoins,
        switchUserRole,
        activeSpectatorTournamentId,
        setActiveSpectatorTournamentId,
        spectatorSelectedPlayerId,
        setSpectatorSelectedPlayerId,
        simulateSpectatorEvent,
        isPlayerRegistered,
        getRoomCredentialsStatus,
        resetAllData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
