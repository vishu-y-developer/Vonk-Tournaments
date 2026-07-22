'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/providers/WalletProvider';
import { walletService } from '@/lib/services/wallet-service';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { WalletTransaction, WalletFilter } from '@/types';
import { AddDemoBalanceDialog } from './AddDemoBalanceDialog';
import { DemoWalletControls } from './DemoWalletControls';
import { 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trophy, 
  RotateCcw, 
  HelpCircle, 
  PlusCircle, 
  History, 
  Gift, 
  FileText, 
  Search, 
  Filter, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';

interface WalletDashboardViewProps {
  activeTab?: 'summary' | 'transactions' | 'prizes' | 'refunds' | 'bonuses';
}

export const WalletDashboardView: React.FC<WalletDashboardViewProps> = ({ activeTab = 'summary' }) => {
  const { 
    wallet, 
    balance, 
    transactions, 
    walletSummary, 
    loading, 
    error, 
    claimBonus,
    filterTransactions,
    creditPrize,
    resetWallet,
    seedWalletData
  } = useWallet();

  const { filters, updateFilter, clearFilters } = useTransactionFilters();

  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Predefined bonuses database
  const predefinedBonuses = [
    { id: 'welcome-100', name: 'Welcome Bonus', description: 'Simulated cash credits for new tournament profiles.', amount: 100, code: 'WELCOME100' },
    { id: 'profile-50', name: 'Profile Completion', description: 'Reward for verifying your BGMI Character ID.', amount: 50, code: 'PROFILE50' },
    { id: 'firstteam-150', name: 'First Team Bonus', description: 'Credit for creating or joining your first active squad.', amount: 150, code: 'FIRSTTEAM' },
    { id: 'vonklaunch-200', name: 'VONK Launch Event', description: 'Special celebration promotional bonus.', amount: 200, code: 'VONKLAUNCH' }
  ];

  // List of claimed bonus IDs
  const claimedBonusIds = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('vonk:v1:wallet-bonuses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [wallet]);

  // Handle promo code submission
  const handleClaimPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a promo code.');
      return;
    }

    const matched = predefinedBonuses.find((b) => b.code === code);
    if (!matched) {
      setPromoError('Invalid promo code. Try using WELCOME100, PROFILE50, FIRSTTEAM, or VONKLAUNCH.');
      return;
    }

    const res = claimBonus(matched.id, matched.name, matched.amount, matched.code);
    if (res.success) {
      setPromoSuccess(`Success! ₹${matched.amount} credited to your demo balance.`);
      setPromoCodeInput('');
    } else {
      setPromoError(res.error || 'Failed to claim promo code.');
    }
  };

  // Filtered & Sorted Transactions list
  const filteredTxs = useMemo(() => {
    const filtered = filterTransactions(filters);
    return walletService.sortTransactions(filtered, filters.sortBy);
  }, [transactions, filters, filterTransactions]);

  // Prize Credits transactions
  const prizeCredits = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'PRIZE_WINNING');
  }, [transactions]);

  // Refund transactions
  const refunds = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'REFUND');
  }, [transactions]);

  // Statistics summaries
  const totalPrizeWon = useMemo(() => {
    return prizeCredits.reduce((acc, tx) => acc + tx.amount, 0);
  }, [prizeCredits]);

  const totalRefunds = useMemo(() => {
    return refunds.reduce((acc, tx) => acc + tx.amount, 0);
  }, [refunds]);

  const totalBonusClaimed = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'BONUS' || tx.type === 'PROMOTIONAL_CREDIT')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const handleClaimPresetBonus = (bonus: { id: string; name: string; amount: number; code: string }) => {
    const res = claimBonus(bonus.id, bonus.name, bonus.amount, bonus.code);
    if (res.success) {
      alert(`Success! Credited ₹${bonus.amount} welcome bonus.`);
    } else {
      alert(res.error || 'Could not claim bonus.');
    }
  };

  // SVG Chart Calculation (Last 10 balance updates)
  const chartPoints = useMemo(() => {
    const txCopy = [...transactions].reverse(); // oldest first
    const points: { x: number; y: number; balance: number; date: string }[] = [];
    
    // Seed point
    points.push({ x: 0, y: 0, balance: 0, date: 'Start' });

    txCopy.forEach((tx, idx) => {
      points.push({
        x: idx + 1,
        y: tx.balanceAfter,
        balance: tx.balanceAfter,
        date: new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    });

    // Take last 10 points
    const sliced = points.slice(-10);
    
    // Normalize coordinates for SVG (width = 500, height = 150)
    const maxVal = Math.max(...sliced.map(p => p.balance), 100);
    const minVal = Math.min(...sliced.map(p => p.balance), 0);
    const valRange = maxVal - minVal || 1;

    return sliced.map((p, idx) => {
      const x = (idx / (sliced.length - 1)) * 480 + 10;
      const y = 140 - ((p.balance - minVal) / valRange) * 120;
      return { ...p, svgX: x, svgY: y };
    });
  }, [transactions]);

  // Tab Header Items
  const tabsList = [
    { id: 'summary', name: 'Overview', icon: FileText },
    { id: 'transactions', name: 'Transactions', icon: History },
    { id: 'prizes', name: 'Prize Winnings', icon: Trophy },
    { id: 'refunds', name: 'Refunds', icon: RotateCcw },
    { id: 'bonuses', name: 'Promo Bonuses', icon: Gift },
  ];

  if (loading && !wallet) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
        <p className="text-xs text-muted">Retrieving simulated wallet profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title & Premium Warning Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-xl font-black tracking-wider text-foreground uppercase">DEMO WALLET CONTROL</h1>
          <p className="text-xs text-muted">Review, deposit, and adjust simulated tournament currency</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-500 max-w-xl">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            <strong>Frontend Simulation:</strong> This wallet contains play money only. No real banking portals, payouts, checkout screens or deposits are supported.
          </p>
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-card/90 p-6 flex flex-col justify-between">
          {/* Background Glow */}
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-primary/20 blur-xl" />
          
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider text-primary uppercase">Demo Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">₹{balance}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Simulated</span>
            </div>
            <p className="text-[10px] text-muted-foreground">No real money is stored or processed.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-black tracking-wider text-primary-foreground hover:bg-primary/95 transition-all uppercase"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Demo Balance</span>
            </button>
            <div className="group relative">
              <button 
                disabled
                className="rounded-lg border border-border bg-white/5 px-4 py-2.5 text-xs font-bold text-muted-foreground cursor-not-allowed transition-all"
              >
                Withdrawal Unavailable
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded bg-black border border-border px-2.5 py-1.5 text-[9px] text-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shadow-xl">
                Real withdrawals are unavailable in this frontend demo.
              </div>
            </div>
          </div>
        </div>

        {/* Total Added / paid cards */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 flex flex-col justify-between">
          <span className="text-[10px] font-black tracking-wider text-muted uppercase">Added & Fees</span>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted block">Total Load Added</span>
              <span className="text-lg font-bold text-foreground">₹{wallet?.totalAdded || 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted block">Entry Fees Deducted</span>
              <span className="text-lg font-bold text-red-400">₹{wallet?.totalFeesPaid || 0}</span>
            </div>
          </div>
        </div>

        {/* Winnings & Refunds */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 flex flex-col justify-between">
          <span className="text-[10px] font-black tracking-wider text-muted uppercase">Winnings & Rewards</span>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted block">Prize Winnings</span>
              <span className="text-lg font-bold text-green-400">₹{totalPrizeWon}</span>
            </div>
            <div>
              <span className="text-xs text-muted block">Refunds Received</span>
              <span className="text-lg font-bold text-blue-400">₹{totalRefunds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Nav Layout */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-2">
          {tabsList.map((t) => {
            const Icon = t.icon;
            const active = currentTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${
                  active 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Contents */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Tab 1: OVERVIEW / SUMMARY */}
              {currentTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left block: Chart & Activity logs */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* SVG Line Graph */}
                    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xs font-black tracking-wider text-foreground uppercase">Balance Progression</h3>
                          <p className="text-[10px] text-muted">Tracking last 10 simulated changes</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          <span>₹{balance} Current</span>
                        </div>
                      </div>

                      {chartPoints.length > 1 ? (
                        <div className="relative pt-4">
                          <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 150">
                            {/* Grids */}
                            <line x1="10" y1="20" x2="490" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                            <line x1="10" y1="80" x2="490" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                            <line x1="10" y1="140" x2="490" y2="140" stroke="rgba(255,255,255,0.08)" />

                            {/* Line */}
                            <path
                              d={`M ${chartPoints.map(p => `${p.svgX} ${p.svgY}`).join(' L ')}`}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2.5"
                            />

                            {/* Gradient Fill under Path */}
                            <path
                              d={`M ${chartPoints[0].svgX} 140 L ${chartPoints.map(p => `${p.svgX} ${p.svgY}`).join(' L ')} L ${chartPoints[chartPoints.length - 1].svgX} 140 Z`}
                              fill="url(#chart-grad)"
                              opacity="0.12"
                            />

                            {/* Dots */}
                            {chartPoints.map((p, idx) => (
                              <g key={idx} className="group cursor-pointer">
                                <circle
                                  cx={p.svgX}
                                  cy={p.svgY}
                                  r="4"
                                  className="fill-primary stroke-background stroke-2 hover:r-6 transition-all"
                                />
                              </g>
                            ))}

                            <defs>
                              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* X-axis labels */}
                          <div className="flex justify-between px-2 pt-2 text-[8px] font-bold text-muted-foreground">
                            {chartPoints.map((p, idx) => (
                              <span key={idx} className="w-8 text-center truncate">{p.date}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg text-center p-4">
                          <span className="text-[10px] text-muted font-bold">No progress graph updates available.</span>
                          <button onClick={seedWalletData} className="text-[9px] text-primary hover:underline font-bold mt-1">
                            Seed test transaction logs
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Recent 5 Transactions */}
                    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black tracking-wider text-foreground uppercase">Recent Transactions</h3>
                        <button 
                          onClick={() => setCurrentTab('transactions')}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          View All History
                        </button>
                      </div>

                      {transactions.length > 0 ? (
                        <div className="divide-y divide-border/60">
                          {transactions.slice(0, 5).map((tx) => (
                            <div 
                              key={tx.id}
                              onClick={() => setSelectedTx(tx)}
                              className="flex items-center justify-between py-3 hover:bg-white/5 transition-all px-2 rounded-lg cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2 ${
                                  tx.direction === 'CREDIT' 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {tx.direction === 'CREDIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                </div>
                                <div>
                                  <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors block">{tx.title}</span>
                                  <span className="text-[10px] text-muted-foreground">{tx.description}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-black ${
                                  tx.direction === 'CREDIT' ? 'text-green-400' : 'text-foreground'
                                } block`}>
                                  {tx.direction === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                </span>
                                <span className="text-[9px] text-muted">{new Date(tx.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center border border-dashed border-border/60 rounded-lg text-muted">
                          <p className="text-xs font-bold">No transaction history seeded.</p>
                          <button onClick={seedWalletData} className="text-[10px] text-primary hover:underline font-bold mt-1">
                            Click to Load Seed Data
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right block: promo code box & Dev controls */}
                  <div className="space-y-6">
                    {/* Promo Code Card */}
                    <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4">
                      <div>
                        <h3 className="text-xs font-black tracking-wider text-foreground uppercase">Claim Promo Code</h3>
                        <p className="text-[10px] text-muted">Enter a mock key to credit balance</p>
                      </div>

                      <form onSubmit={handleClaimPromo} className="space-y-3">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder="e.g. WELCOME100"
                          className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-xs font-mono uppercase outline-none focus:border-primary/50"
                        />
                        {promoError && <p className="text-[10px] text-red-400">{promoError}</p>}
                        {promoSuccess && <p className="text-[10px] text-green-400">{promoSuccess}</p>}

                        <button
                          type="submit"
                          className="w-full rounded-lg bg-primary/20 border border-primary/30 text-primary py-2 text-xs font-bold hover:bg-primary/35 transition-colors"
                        >
                          Apply Code
                        </button>
                      </form>
                    </div>

                    {/* Developer controls */}
                    <DemoWalletControls />
                  </div>
                </div>
              )}

              {/* Tab 2: TRANSACTION HISTORY */}
              {currentTab === 'transactions' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filters column (desktop) */}
                  <div className="lg:col-span-1 hidden lg:block space-y-5 rounded-xl border border-border/80 bg-card p-5 h-fit">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-xs font-black tracking-wider text-foreground uppercase">Filter Hub</span>
                      <button onClick={clearFilters} className="text-[10px] text-primary hover:underline font-bold">
                        Clear All
                      </button>
                    </div>

                    {/* Search */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Search</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                        <input
                          type="text"
                          value={filters.searchQuery}
                          onChange={(e) => updateFilter('searchQuery', e.target.value)}
                          placeholder="Title, Ref ID, Tourney..."
                          className="w-full rounded border border-border bg-white/5 py-1.5 pl-8 pr-3 text-[11px] outline-none"
                        />
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Tx Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => updateFilter('type', e.target.value as WalletFilter['type'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="ALL">All Types</option>
                        <option value="DEMO_CREDIT">Demo Load Added</option>
                        <option value="ENTRY_FEE">Entry Fees Paid</option>
                        <option value="PRIZE_WINNING">Prize Winnings</option>
                        <option value="REFUND">Refunds</option>
                        <option value="BONUS">Claimed Bonuses</option>
                        <option value="PROMOTIONAL_CREDIT">Promotional Credits</option>
                        <option value="PENALTY">Penalties</option>
                        <option value="ADJUSTMENT">Adjustments</option>
                      </select>
                    </div>

                    {/* Direction Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Direction</label>
                      <select
                        value={filters.direction}
                        onChange={(e) => updateFilter('direction', e.target.value as WalletFilter['direction'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="ALL">All Directions</option>
                        <option value="CREDIT">Credits (+)</option>
                        <option value="DEBIT">Debits (-)</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value as WalletFilter['status'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Successful</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => updateFilter('dateRange', e.target.value as WalletFilter['dateRange'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="ALL_TIME">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="LAST_7_DAYS">Last 7 Days</option>
                        <option value="LAST_30_DAYS">Last 30 Days</option>
                        <option value="THIS_MONTH">This Month</option>
                      </select>
                    </div>

                    {/* Amount Range Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Amount Range</label>
                      <select
                        value={filters.amountRange}
                        onChange={(e) => updateFilter('amountRange', e.target.value as WalletFilter['amountRange'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="ALL">All Amounts</option>
                        <option value="0_100">₹0 – ₹100</option>
                        <option value="101_500">₹101 – ₹500</option>
                        <option value="501_1000">₹501 – ₹1,000</option>
                        <option value="1001_5000">₹1,001 – ₹5,000</option>
                        <option value="5000_PLUS">₹5,000+</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted uppercase">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value as WalletFilter['sortBy'])}
                        className="w-full rounded border border-border bg-card py-1.5 px-2 text-[11px] outline-none"
                      >
                        <option value="NEWEST">Newest First</option>
                        <option value="OLDEST">Oldest First</option>
                        <option value="HIGHEST_AMOUNT">Highest Amount</option>
                        <option value="LOWEST_AMOUNT">Lowest Amount</option>
                      </select>
                    </div>
                  </div>

                  {/* Desktop Tables & Mobile lists list block */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Mobile Filters Trigger Bar */}
                    <div className="lg:hidden flex items-center gap-2 w-full">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                        <input
                          type="text"
                          value={filters.searchQuery}
                          onChange={(e) => updateFilter('searchQuery', e.target.value)}
                          placeholder="Search title, Ref ID..."
                          className="w-full rounded border border-border bg-white/5 py-2 pl-8 pr-3 text-xs outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setShowFiltersMobile(true)}
                        className="rounded border border-border bg-card p-2 text-muted hover:text-foreground"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* List Content */}
                    {filteredTxs.length > 0 ? (
                      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                        <div className="divide-y divide-border/60">
                          {filteredTxs.map((tx) => (
                            <div
                              key={tx.id}
                              onClick={() => setSelectedTx(tx)}
                              className="flex items-center justify-between p-4 hover:bg-white/5 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`rounded-xl p-2.5 ${
                                  tx.direction === 'CREDIT'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {tx.direction === 'CREDIT' ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                                      {tx.title}
                                    </span>
                                    <span className={`text-[8px] font-black px-1 py-0.5 rounded tracking-wider uppercase ${
                                      tx.status === 'SUCCESS' || tx.status === 'SIMULATED'
                                        ? 'bg-green-500/10 text-green-400'
                                        : tx.status === 'PENDING'
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'bg-red-500/10 text-red-400'
                                    }`}>
                                      {tx.status}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
                                    <span>{tx.description}</span>
                                    <span>•</span>
                                    <span className="font-mono text-muted">{tx.referenceId}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right space-y-0.5">
                                <span className={`text-xs font-black ${
                                  tx.direction === 'CREDIT' ? 'text-green-400' : 'text-foreground'
                                }`}>
                                  {tx.direction === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                </span>
                                <span className="text-[9px] text-muted block">
                                  {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 border border-dashed border-border/80 rounded-xl space-y-3">
                        <span className="text-sm font-bold text-muted block">No transactions match your filters.</span>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={clearFilters}
                            className="rounded border border-border bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold"
                          >
                            Reset Filters
                          </button>
                          <button
                            onClick={seedWalletData}
                            className="rounded bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 text-xs font-bold"
                          >
                            Seed Demo Data
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: PRIZE CREDITS SECTION */}
              {currentTab === 'prizes' && (
                <div className="space-y-6">
                  {/* Prize statistics panel */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="rounded-xl border border-border/80 bg-card p-4">
                      <span className="text-[9px] font-black text-muted uppercase block">Total Prize Won</span>
                      <span className="text-lg font-black text-yellow-400">₹{totalPrizeWon}</span>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-card p-4">
                      <span className="text-[9px] font-black text-muted uppercase block">Wins Count</span>
                      <span className="text-lg font-black text-foreground">{prizeCredits.length}</span>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-card p-4 col-span-2 md:col-span-1">
                      <span className="text-[9px] font-black text-muted uppercase block">Highest Winnings</span>
                      <span className="text-lg font-black text-foreground">
                        ₹{prizeCredits.length > 0 ? Math.max(...prizeCredits.map((tx) => tx.amount)) : 0}
                      </span>
                    </div>
                  </div>

                  {/* List of Winnings */}
                  {prizeCredits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prizeCredits.map((tx) => {
                        const category = (tx.metadata?.category as string) || 'Winner Prize';
                        return (
                          <div 
                            key={tx.id}
                            className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-card p-5 space-y-4"
                          >
                            {/* Gold Trophy Glow Icon */}
                            <div className="absolute right-0 top-0 -mr-3 -mt-3 text-yellow-500/10 scale-150">
                              <Trophy className="h-24 w-24" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs font-black text-yellow-500 uppercase tracking-wider">{category}</span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground truncate">{tx.tournamentName || 'BGMI Tournament Placement'}</h4>
                              <p className="text-[10px] text-muted-foreground">{tx.description}</p>
                            </div>

                            <div className="flex justify-between items-end pt-2 border-t border-border/60">
                              <div className="text-[10px] text-muted">
                                <span>Credited {new Date(tx.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-black text-yellow-400">+₹{tx.amount}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-border/80 rounded-xl space-y-2">
                      <Trophy className="h-8 w-8 text-muted mx-auto" />
                      <span className="text-sm font-bold text-muted block">No winnings credited yet.</span>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Winnings are automatically credited here as simulated funds upon completion of custom-room matches.
                      </p>
                      <button
                        onClick={() => {
                          creditPrize(
                            300,
                            'Prize Winnings Credited',
                            'Per-Kill Bonus Reward (Simulated)',
                            'Per-Kill Reward',
                            'tour-1',
                            'Miramar Sniper Showdown'
                          );
                        }}
                        className="rounded bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 px-4 py-2 text-xs font-bold text-yellow-400 mt-3"
                      >
                        Claim Dev Winnings Demo (₹300)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: REFUNDS SECTION */}
              {currentTab === 'refunds' && (
                <div className="space-y-6">
                  {/* Refund Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border/80 bg-card p-4">
                      <span className="text-[9px] font-black text-muted uppercase block">Total Refunds</span>
                      <span className="text-lg font-black text-blue-400">₹{totalRefunds}</span>
                    </div>
                    <div className="rounded-xl border border-border/80 bg-card p-4">
                      <span className="text-[9px] font-black text-muted uppercase block">Refund Count</span>
                      <span className="text-lg font-black text-foreground">{refunds.length}</span>
                    </div>
                  </div>

                  {/* Refunds List */}
                  {refunds.length > 0 ? (
                    <div className="space-y-3">
                      {refunds.map((tx) => {
                        const reason = (tx.metadata?.reason as string) || 'Tournament Cancelled';
                        return (
                          <div 
                            key={tx.id}
                            className="rounded-xl border border-border/80 bg-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500/30 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400 tracking-wider uppercase">
                                  {reason}
                                </span>
                                <span className="text-[10px] text-muted-foreground">Ref ID: {tx.referenceId}</span>
                              </div>
                              <h4 className="text-xs font-bold text-foreground">{tx.tournamentName || 'Tournament Refunder'}</h4>
                              <p className="text-[10px] text-muted">{tx.description}</p>
                            </div>

                            <div className="text-left md:text-right space-y-1 w-full md:w-auto">
                              <span className="text-sm font-black text-blue-400 block">+₹{tx.amount}</span>
                              <span className="text-[9px] text-muted block">Processed {new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-border/80 rounded-xl space-y-2">
                      <RotateCcw className="h-8 w-8 text-muted mx-auto" />
                      <span className="text-sm font-bold text-muted block">No refunds recorded yet.</span>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        If a tournament is cancelled by the organizers or your registration is rejected, entry fees are refunded instantly to your balance.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: PROMO BONUSES */}
              {currentTab === 'bonuses' && (
                <div className="space-y-6">
                  {/* Stats Panel */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border/80 bg-card p-4">
                      <span className="text-[9px] font-black text-muted uppercase block">Total Bonuses Claimed</span>
                      <span className="text-lg font-black text-purple-400">₹{totalBonusClaimed}</span>
                    </div>
                  </div>

                  {/* Grid of Claimable Preset Items */}
                  <div>
                    <h3 className="text-xs font-black tracking-wider text-muted uppercase mb-4">Claimable Welcome Bonuses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {predefinedBonuses.map((bonus) => {
                        const isClaimed = claimedBonusIds.includes(bonus.id);
                        return (
                          <div 
                            key={bonus.id} 
                            className={`rounded-xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                              isClaimed 
                                ? 'border-border/60 bg-white/2 opacity-70' 
                                : 'border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-card hover:border-purple-500/40'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">{bonus.name}</span>
                                <span className="text-sm font-black text-foreground">₹{bonus.amount}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{bonus.description}</p>
                              <div className="pt-2 text-[10px] text-muted">
                                <span>Code: <strong>{bonus.code}</strong></span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleClaimPresetBonus(bonus)}
                              disabled={isClaimed}
                              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                                isClaimed 
                                  ? 'bg-white/5 text-muted-foreground cursor-not-allowed border border-transparent' 
                                  : 'bg-purple-600 text-white hover:bg-purple-500'
                              }`}
                            >
                              {isClaimed ? 'Already Claimed' : 'Claim Promo Credit'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card/95 text-card-foreground shadow-2xl p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/60 pb-3">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">{selectedTx.type.replace('_', ' ')}</span>
                <h4 className="text-sm font-black text-foreground">{selectedTx.title}</h4>
              </div>
              <button onClick={() => setSelectedTx(null)} className="rounded p-1 hover:bg-white/10 text-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted">Transaction Amount</span>
                <span className={`font-black ${selectedTx.direction === 'CREDIT' ? 'text-green-400' : 'text-foreground'}`}>
                  {selectedTx.direction === 'CREDIT' ? '+' : '-'}₹{selectedTx.amount}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted">Reference ID</span>
                <span className="font-mono text-foreground font-semibold">{selectedTx.referenceId}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted">Created Date</span>
                <span className="text-foreground">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted">Status Badge</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  selectedTx.status === 'SUCCESS' || selectedTx.status === 'SIMULATED'
                    ? 'bg-green-500/20 text-green-400'
                    : selectedTx.status === 'PENDING'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted">Before / After Balance</span>
                <span className="text-foreground">₹{selectedTx.balanceBefore} → ₹{selectedTx.balanceAfter}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-border/40 py-2">
                <span className="text-muted">Details Description</span>
                <span className="text-foreground leading-relaxed">{selectedTx.description}</span>
              </div>
              {selectedTx.tournamentName && (
                <div className="flex justify-between py-2">
                  <span className="text-muted">Linked Tournament</span>
                  <span className="text-primary font-bold">{selectedTx.tournamentName}</span>
                </div>
              )}
            </div>

            {/* Simulated disclaimer notice */}
            <div className="flex gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-[10px] text-yellow-500">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <p className="leading-relaxed">
                This is a simulated transaction created for the VONK Tournaments frontend demonstration. No real banking payment was processed.
              </p>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full rounded-lg bg-white/5 hover:bg-white/10 border border-border py-2 text-xs font-bold text-foreground transition-all"
            >
              Close Details
            </button>
          </motion.div>
        </div>
      )}

      {/* Mobile Filters Modal */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowFiltersMobile(false)} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full rounded-t-xl bg-card border-t border-border p-5 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-xs font-black uppercase text-foreground">Filters</span>
              <button onClick={() => setShowFiltersMobile(false)} className="rounded hover:bg-white/10 p-1">
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted uppercase">Tx Type</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value as WalletFilter['type'])}
                className="w-full rounded border border-border bg-white/5 py-2 px-3 text-xs outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="DEMO_CREDIT">Demo Load Added</option>
                <option value="ENTRY_FEE">Entry Fees Paid</option>
                <option value="PRIZE_WINNING">Prize Winnings</option>
                <option value="REFUND">Refunds</option>
                <option value="BONUS">Claimed Bonuses</option>
                <option value="PROMOTIONAL_CREDIT">Promotional Credits</option>
                <option value="PENALTY">Penalties</option>
                <option value="ADJUSTMENT">Adjustments</option>
              </select>
            </div>

            {/* Direction */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted uppercase">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => updateFilter('direction', e.target.value as WalletFilter['direction'])}
                className="w-full rounded border border-border bg-white/5 py-2 px-3 text-xs outline-none"
              >
                <option value="ALL">All Directions</option>
                <option value="CREDIT">Credits (+)</option>
                <option value="DEBIT">Debits (-)</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted uppercase">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value as WalletFilter['status'])}
                className="w-full rounded border border-border bg-white/5 py-2 px-3 text-xs outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted uppercase">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value as WalletFilter['dateRange'])}
                className="w-full rounded border border-border bg-white/5 py-2 px-3 text-xs outline-none"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  clearFilters();
                  setShowFiltersMobile(false);
                }}
                className="flex-1 py-2.5 rounded border border-border bg-white/5 text-xs font-bold text-center"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="flex-1 py-2.5 rounded bg-primary text-primary-foreground text-xs font-black text-center"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Demo Balance Dialog Modal */}
      <AddDemoBalanceDialog 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </div>
  );
};
