import React, { useState } from 'react';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  History,
  Sparkles,
  Trophy,
  Check,
  Info,
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

export const WalletView: React.FC = () => {
  const { user, transactions, claimDailyReward, addCoins } = useTournaments();

  const [activeFilter, setActiveFilter] = useState<'all' | 'prizes' | 'entries' | 'rewards'>('all');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<string | null>(null);

  const todayStr = new Date().toDateString();
  const canClaimDaily = user.dailyRewardClaimedAt !== todayStr;

  const handleClaimReward = () => {
    const res = claimDailyReward();
    if (!res.success) {
      setVoucherStatus(res.error || 'Already claimed today!');
    }
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'MK500' || code === 'PROGAMER' || code === 'WINNER') {
      addCoins(500, `Redeemed Promo Voucher "${code}"`);
      setVoucherStatus('🎉 Successfully redeemed 500 Coins!');
      setVoucherCode('');
    } else if (code === 'MK1000' || code === 'ESPORTS') {
      addCoins(1000, `Redeemed VIP Promo Voucher "${code}"`);
      setVoucherStatus('🔥 Successfully redeemed 1,000 Coins!');
      setVoucherCode('');
    } else {
      setVoucherStatus('❌ Invalid promo code. Try "MK500" or "MK1000".');
    }

    setTimeout(() => {
      setVoucherStatus(null);
    }, 4000);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'prizes') return t.type === 'prize_won';
    if (activeFilter === 'entries') return t.type === 'entry_fee';
    if (activeFilter === 'rewards') return t.type === 'reward_claimed' || t.type === 'top_up' || t.type === 'admin_bonus';
    return true;
  });

  const totalWon = transactions
    .filter(t => t.type === 'prize_won')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'entry_fee')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Wallet Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="lg:col-span-2 relative rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                MK Virtual Coin Balance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Player ID: {user.gameUid}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight">
                  {user.coins.toLocaleString()}
                </span>
                <span className="font-heading font-bold text-2xl text-amber-400">
                  COINS 🪙
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Virtual currency used for joining tournaments and collecting champion prize rewards.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">Total Prizes Won</span>
              <span className="font-heading font-black text-lg text-emerald-400">
                +{totalWon.toLocaleString()} 🪙
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">Entry Fees Spent</span>
              <span className="font-heading font-black text-lg text-slate-300">
                -{totalSpent.toLocaleString()} 🪙
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">Tournaments Won</span>
              <span className="font-heading font-black text-lg text-amber-400">
                {user.tournamentsWon} 🏆
              </span>
            </div>
          </div>
        </div>

        {/* Claim Daily Bonus & Promo Code Box */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-5">
          
          {/* Daily Streak Claim */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                Daily Coin Streak
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                +250 COINS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Login each day to claim 250 free tournament coins to keep competing.
            </p>
            <button
              onClick={handleClaimReward}
              disabled={!canClaimDaily}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                canClaimDaily
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Gift className="w-4 h-4" />
              {canClaimDaily ? 'Claim Daily 250 Coins' : '✓ Claimed Today (Return Tomorrow)'}
            </button>
          </div>

          {/* Promo Voucher Code */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Redeem Promo Code
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Hint: "MK500"
              </span>
            </div>
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value)}
                placeholder="Enter Code (e.g. MK500)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                Apply
              </button>
            </form>

            {voucherStatus && (
              <p className="text-xs font-semibold text-center text-amber-300 animate-fadeIn">
                {voucherStatus}
              </p>
            )}

            {/* Quick Test Top-up Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Quick Test Coins:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => addCoins(100, 'Quick test top-up')}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-800"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => addCoins(500, 'Quick test top-up')}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded text-[10px] font-mono border border-slate-800"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => addCoins(1000, 'Quick test top-up')}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-emerald-400 rounded text-[10px] font-mono border border-slate-800"
                >
                  +1000
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Compliance / Fair Play Notice as explicitly instructed in prompt */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 font-bold block mb-0.5">
            Fair Play & Virtual Entertainment Coins Compliance Notice:
          </strong>
          MK Tournament operates on a virtual gaming coin system for competitive skill-based esports tournaments. 
          All entries and prizes are settled in virtual in-app coins for prototype and community play. Real-money conversions, age verifications, and compliance restrictions must be reviewed before deploying commercial cash prize contests.
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-black text-xl text-white">
              Wallet Transaction History
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeFilter === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setActiveFilter('prizes')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeFilter === 'prizes' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Prizes Won
            </button>
            <button
              onClick={() => setActiveFilter('entries')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeFilter === 'entries' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entry Fees
            </button>
            <button
              onClick={() => setActiveFilter('rewards')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeFilter === 'rewards' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rewards & Top-ups
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions found under this category.
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-850/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">
                        {tx.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {tx.description}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-heading font-black text-base ${
                        isCredit ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isCredit ? `+${tx.amount}` : tx.amount} 🪙
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      Bal: {tx.balanceAfter.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
