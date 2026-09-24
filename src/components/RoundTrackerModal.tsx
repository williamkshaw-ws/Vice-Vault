import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  History, 
  BarChart3, 
  Play, 
  Calendar, 
  MapPin, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Skull,
  ChevronDown,
  Box,
  XCircle
} from 'lucide-react';
import { GolfBall, BallCondition, CatalogItem, BundleItem } from '../types';
import BallVisual from './BallVisual';
import { nativeHaptics } from '../utils/native';
import { getBundleItemsForBall } from '../utils/bagUtils';

export interface RoundBallInPlay {
  id: string; // unique item id in this round
  ballId: string; // reference to locker ball (or parent bundle)
  parentBundleId?: string; // id of parent variety pack/bundle in locker
  bundleCatalogId?: string; // catalogId of sub-ball in variety pack
  model: string;
  color: string;
  originalCondition: BallCondition;
  customImage?: string;
  customImageSleeve?: string;
  customImageBox?: string;
  packageType?: 'ea' | 'sleeve' | 'box';
  customNumber?: number;
  year?: string;
  name?: string;
  variation?: string;
  status: 'survived' | 'damaged' | 'lost' | 'scuffed';
  lostHole?: number;
  hazard?: string;
  hazardDetail?: string;
}

export interface PackedBallItem {
  ball: GolfBall;
  count: number;
  parentBundleBallId?: string;
  bundleCatalogId?: string;
  fromBundleTitle?: string;
}

export interface GolfRound {
  id: string;
  date: string;
  courseName: string;
  holes: 9 | 18;
  balls: RoundBallInPlay[];
  status: 'active' | 'completed';
  completedAt?: string;
}

const ACTIVE_ROUND_KEY = 'golf_ball_vault_active_round';
const ROUND_HISTORY_KEY = 'golf_ball_vault_round_history';

// Helper to render authentic ball color swatch dot in compact logs
const getMiniBallSwatch = (color: string) => {
  const c = (color || '').toLowerCase().trim();
  if (c.includes('fireball')) {
    return 'radial-gradient(circle at 35% 35%, #ff3b6c 0%, #ff8533 50%, #ffea00 100%)';
  }
  if (c.includes('lime') || c.includes('neon')) {
    return 'radial-gradient(circle at 35% 35%, #e1ff00 0%, #a6d200 100%)';
  }
  if (c.includes('red') || c.includes('coral') || c.includes('pink')) {
    return 'radial-gradient(circle at 35% 35%, #ff3b6c 0%, #b3002d 100%)';
  }
  if (c.includes('blue') || c.includes('cyan')) {
    return 'radial-gradient(circle at 35% 35%, #2ef2ff 0%, #00939d 100%)';
  }
  if (c.includes('gold') || c.includes('yellow')) {
    return 'radial-gradient(circle at 35% 35%, #ffea00 0%, #d4a000 100%)';
  }
  if (c.includes('orange')) {
    return 'radial-gradient(circle at 35% 35%, #fb923c 0%, #c2410c 100%)';
  }
  if (c.includes('black') || c.includes('charcoal')) {
    return 'radial-gradient(circle at 35% 35%, #4b5563 0%, #111827 100%)';
  }
  return 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e5e5e5 70%, #cccccc 100%)';
};

interface RoundTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  balls: GolfBall[];
  catalog?: CatalogItem[];
  onApplyInventoryChanges: (ballsInPlay: RoundBallInPlay[]) => void;
  activeRound: GolfRound | null;
  setActiveRound: React.Dispatch<React.SetStateAction<GolfRound | null>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function RoundTrackerModal({
  isOpen,
  onClose,
  balls,
  catalog = [],
  onApplyInventoryChanges,
  activeRound,
  setActiveRound,
  showToast
}: RoundTrackerModalProps) {
  const [tab, setTab] = useState<'round' | 'history'>('round');
  const [roundHistory, setRoundHistory] = useState<GolfRound[]>([]);
  const [expandedRoundSection, setExpandedRoundSection] = useState<{ roundId: string; filter: 'survived' | 'damaged' | 'lost' | 'all' } | null>(null);
  const [roundToDelete, setRoundToDelete] = useState<GolfRound | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Setup / Pack bag state (when starting a new round)
  const [courseInput, setCourseInput] = useState('');
  const [holesInput, setHolesInput] = useState<9 | 18>(18);
  const [packedBalls, setPackedBalls] = useState<PackedBallItem[]>([]);
  const [expandedBundleIds, setExpandedBundleIds] = useState<Record<string, boolean>>({});

  // Filter out balls marked "Not for play" (Display / Collection only)
  const playableBalls = useMemo(() => balls.filter(b => !b.notForPlay), [balls]);

  const toggleBundleExpand = (ballId: string) => {
    setExpandedBundleIds(prev => ({
      ...prev,
      [ballId]: prev[ballId] === undefined ? false : !prev[ballId]
    }));
  };

  // Post-round celebration summary state
  const [justCompletedRound, setJustCompletedRound] = useState<GolfRound | null>(null);

  // Load round history on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(ROUND_HISTORY_KEY);
      if (savedHistory) {
        setRoundHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load round history:', e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: GolfRound[]) => {
    setRoundHistory(newHistory);
    try {
      localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to persist round history:', e);
    }
  };

  // Add ball to packed list (regular ball)
  const handlePackBall = (ball: GolfBall) => {
    nativeHaptics.impactLight();
    const existing = packedBalls.find(p => p.ball.id === ball.id && !p.parentBundleBallId);
    const available = ball.quantity;
    const currentPacked = existing ? existing.count : 0;

    if (currentPacked >= available) {
      showToast(`You only have ${available} in your locker!`, 'info');
      return;
    }

    if (existing) {
      setPackedBalls(packedBalls.map(p => p.ball.id === ball.id && !p.parentBundleBallId ? { ...p, count: p.count + 1 } : p));
    } else {
      setPackedBalls([...packedBalls, { ball, count: 1 }]);
    }
  };

  // Add specific sub-ball from variety pack
  const handlePackSubBall = (parentBall: GolfBall, bundleItem: BundleItem, catItem: CatalogItem) => {
    nativeHaptics.impactLight();
    const existing = packedBalls.find(p => p.parentBundleBallId === parentBall.id && p.bundleCatalogId === bundleItem.catalogId);
    const available = bundleItem.qty;
    const currentPacked = existing ? existing.count : 0;

    if (currentPacked >= available) {
      showToast(`Only ${available} ${catItem.model} available in this pack!`, 'info');
      return;
    }

    if (existing) {
      setPackedBalls(packedBalls.map(p => 
        (p.parentBundleBallId === parentBall.id && p.bundleCatalogId === bundleItem.catalogId) 
          ? { ...p, count: p.count + 1 } 
          : p
      ));
    } else {
      const virtualBall: GolfBall = {
        id: `${parentBall.id}__sub__${bundleItem.catalogId}`,
        model: catItem.model,
        color: catItem.color,
        quantity: bundleItem.qty,
        condition: parentBall.condition,
        customNumber: parentBall.customNumber || 1,
        notes: parentBall.notes,
        dateAdded: parentBall.dateAdded,
        customImage: catItem.customImage || parentBall.customImage,
        name: catItem.name,
        variation: catItem.variation,
        packageType: 'ea'
      };

      setPackedBalls([
        ...packedBalls,
        {
          ball: virtualBall,
          count: 1,
          parentBundleBallId: parentBall.id,
          bundleCatalogId: bundleItem.catalogId,
          fromBundleTitle: parentBall.name || parentBall.model || 'Variety Pack'
        }
      ]);
    }
  };

  // Remove / decrement ball from packed list
  const handleUnpackBall = (ballId: string) => {
    nativeHaptics.impactLight();
    const existing = packedBalls.find(p => p.ball.id === ballId);
    if (!existing) return;

    if (existing.count > 1) {
      setPackedBalls(packedBalls.map(p => p.ball.id === ballId ? { ...p, count: p.count - 1 } : p));
    } else {
      setPackedBalls(packedBalls.filter(p => p.ball.id !== ballId));
    }
  };

  // Start round
  const handleStartRound = () => {
    if (packedBalls.length === 0) {
      showToast('Pack at least 1 ball into your bag to start!', 'error');
      return;
    }

    nativeHaptics.notificationSuccess();

    // Expand packed balls into individual tracked items
    const ballsInPlay: RoundBallInPlay[] = [];
    packedBalls.forEach(({ ball, count, parentBundleBallId, bundleCatalogId }) => {
      for (let i = 0; i < count; i++) {
        ballsInPlay.push({
          id: `inplay-${ball.id}-${i}-${Date.now()}`,
          ballId: parentBundleBallId || ball.id,
          parentBundleId: parentBundleBallId,
          bundleCatalogId: bundleCatalogId,
          model: ball.model,
          color: ball.color,
          originalCondition: ball.condition,
          customImage: ball.customImage,
          customImageSleeve: ball.customImageSleeve,
          customImageBox: ball.customImageBox,
          packageType: ball.packageType,
          customNumber: ball.customNumber,
          year: ball.year,
          name: ball.name,
          variation: ball.variation,
          status: 'survived' // default to survived until marked otherwise
        });
      }
    });

    const newRound: GolfRound = {
      id: `round-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      courseName: courseInput.trim() || 'My Golf Round',
      holes: holesInput,
      balls: ballsInPlay,
      status: 'active'
    };

    setActiveRound(newRound);
    try {
      localStorage.setItem(ACTIVE_ROUND_KEY, JSON.stringify(newRound));
    } catch (e) {}

    setCourseInput('');
    setPackedBalls([]);
    setJustCompletedRound(null);
    showToast('Tee off! Round started.', 'success');
  };

  // Update in-play ball status
  const handleSetBallStatus = (itemId: string, status: 'survived' | 'damaged' | 'lost') => {
    if (!activeRound) return;
    nativeHaptics.selectionChanged();

    const updatedBalls = activeRound.balls.map(b => {
      if (b.id === itemId) {
        return {
          ...b,
          status,
          // default hole if newly lost
          lostHole: status === 'lost' ? (b.lostHole || 1) : undefined
        };
      }
      return b;
    });

    const updatedRound = { ...activeRound, balls: updatedBalls };
    setActiveRound(updatedRound);
    try {
      localStorage.setItem(ACTIVE_ROUND_KEY, JSON.stringify(updatedRound));
    } catch (e) {}
  };

  // Update lost hole, hazard, or custom detail
  const handleUpdateLostDetails = (itemId: string, hole?: number, hazard?: string, hazardDetail?: string) => {
    if (!activeRound) return;
    const updatedBalls = activeRound.balls.map(b => {
      if (b.id === itemId) {
        return {
          ...b,
          lostHole: hole !== undefined ? hole : b.lostHole,
          hazard: hazard !== undefined ? hazard : b.hazard,
          hazardDetail: hazardDetail !== undefined 
            ? hazardDetail 
            : (hazard && hazard !== 'Other' ? undefined : b.hazardDetail)
        };
      }
      return b;
    });

    const updatedRound = { ...activeRound, balls: updatedBalls };
    setActiveRound(updatedRound);
    try {
      localStorage.setItem(ACTIVE_ROUND_KEY, JSON.stringify(updatedRound));
    } catch (e) {}
  };

  // Finish and complete round
  const handleCompleteRound = () => {
    if (!activeRound) return;
    nativeHaptics.notificationSuccess();

    const completedRound: GolfRound = {
      ...activeRound,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    // Apply inventory deductions and downgrades to locker
    onApplyInventoryChanges(completedRound.balls);

    // Save to history
    const updatedHistory = [completedRound, ...roundHistory];
    saveHistory(updatedHistory);

    // Clear active round
    setActiveRound(null);
    try {
      localStorage.removeItem(ACTIVE_ROUND_KEY);
    } catch (e) {}

    setJustCompletedRound(completedRound);
    showToast('Round completed! Locker inventory updated.', 'success');
  };

  // Abandon active round
  const handleAbandonRound = () => {
    setActiveRound(null);
    try {
      localStorage.removeItem(ACTIVE_ROUND_KEY);
    } catch (e) {}
    setShowDiscardConfirm(false);
    showToast('Active round discarded.', 'info');
  };

  // Delete past round from history
  const handleDeleteHistoryRound = (roundId: string) => {
    const updated = roundHistory.filter(r => r.id !== roundId);
    saveHistory(updated);
    showToast('Round removed from history.', 'info');
  };

  // Total packed balls count
  const totalPackedCount = packedBalls.reduce((sum, p) => sum + p.count, 0);

  // Active round live counts (Survived + Damaged + Lost = Total Included)
  const activeStats = useMemo(() => {
    if (!activeRound) return { total: 0, survived: 0, damaged: 0, lost: 0 };
    const total = activeRound.balls.length;
    let survived = 0;
    let damaged = 0;
    let lost = 0;
    activeRound.balls.forEach(b => {
      if (b.status === 'lost') lost++;
      else if (b.status === 'damaged' || b.status === 'scuffed') damaged++;
      else survived++;
    });
    return { total, survived, damaged, lost };
  }, [activeRound]);

  // Completed round summary counts (Survived + Damaged + Lost = Total Included)
  const completedStats = useMemo(() => {
    if (!justCompletedRound) return { total: 0, survived: 0, damaged: 0, lost: 0 };
    const total = justCompletedRound.balls.length;
    let survived = 0;
    let damaged = 0;
    let lost = 0;
    justCompletedRound.balls.forEach(b => {
      if (b.status === 'lost') lost++;
      else if (b.status === 'damaged' || b.status === 'scuffed') damaged++;
      else survived++;
    });
    return { total, survived, damaged, lost };
  }, [justCompletedRound]);

  // Statistics calculation for History tab
  const stats = useMemo(() => {
    const totalRounds = roundHistory.length;
    let totalPutInPlay = 0;
    let totalLost = 0;
    let totalDamaged = 0;
    let totalSurvived = 0;

    const modelStats: Record<string, { inPlay: number; lost: number; damaged: number; survived: number }> = {};

    roundHistory.forEach(r => {
      r.balls.forEach(b => {
        totalPutInPlay++;
        const isDamaged = b.status === 'damaged' || b.status === 'scuffed';
        if (b.status === 'lost') totalLost++;
        else if (isDamaged) totalDamaged++;
        else totalSurvived++;

        const key = b.model;
        if (!modelStats[key]) {
          modelStats[key] = { inPlay: 0, lost: 0, damaged: 0, survived: 0 };
        }
        modelStats[key].inPlay++;
        if (b.status === 'lost') modelStats[key].lost++;
        else if (isDamaged) modelStats[key].damaged++;
        else modelStats[key].survived++;
      });
    });

    const avgLostPerRound = totalRounds > 0 ? (totalLost / totalRounds).toFixed(1) : '0.0';
    const avgDamagedPerRound = totalRounds > 0 ? (totalDamaged / totalRounds).toFixed(1) : '0.0';
    const survivalRate = totalPutInPlay > 0 ? Math.round((totalSurvived / totalPutInPlay) * 100) : 100;

    return {
      totalRounds,
      totalPutInPlay,
      totalLost,
      totalDamaged,
      totalSurvived,
      avgLostPerRound,
      avgDamagedPerRound,
      survivalRate,
      modelStats
    };
  }, [roundHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Flag size={20} className="fill-accent/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-sans">
                  Round Mode
                </h2>
                {activeRound && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Round
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                Track balls in play, log losses & cart path scuffs, and auto-sync your locker.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-5">
          <button
            type="button"
            onClick={() => {
              nativeHaptics.selectionChanged();
              setTab('round');
            }}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'round'
                ? 'border-accent text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Play size={13} className={tab === 'round' ? 'text-accent fill-accent' : ''} />
            <span>{activeRound ? 'Active Round' : 'Start Round'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              nativeHaptics.selectionChanged();
              setTab('history');
            }}
            className={`py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'history'
                ? 'border-accent text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <History size={13} className={tab === 'history' ? 'text-accent' : ''} />
            <span>History & Stats ({roundHistory.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">

          {/* TAB 1: ROUND TRACKER */}
          {tab === 'round' && (
            <>
              {/* Completed Round Celebration Summary Screen */}
              {justCompletedRound && !activeRound && (
                <div className="bg-gradient-to-b from-emerald-950/30 to-neutral-950 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-white text-lg uppercase tracking-wider">
                      Round Complete!
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono mt-1">
                      {justCompletedRound.courseName} • {justCompletedRound.holes} Holes
                    </p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto font-mono text-xs">
                    {/* 3 Outcome Breakdown: Survived, Damaged, Lost */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-emerald-50 border border-emerald-300 dark:bg-neutral-900 dark:border-emerald-500/30 p-3 rounded-xl">
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase block font-bold">Survived</span>
                        <span className="text-xl font-black text-emerald-900 dark:text-emerald-400 font-sans">
                          {completedStats.survived}
                        </span>
                      </div>
                      <div className="bg-amber-50 border border-amber-300 dark:bg-neutral-900 dark:border-amber-500/30 p-3 rounded-xl">
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase block font-bold">Damaged</span>
                        <span className="text-xl font-black text-amber-900 dark:text-amber-400 font-sans">
                          {completedStats.damaged}
                        </span>
                      </div>
                      <div className="bg-rose-50 border border-rose-300 dark:bg-neutral-900 dark:border-rose-500/30 p-3 rounded-xl">
                        <span className="text-[10px] text-rose-800 dark:text-rose-400 uppercase block font-bold">Lost</span>
                        <span className="text-xl font-black text-rose-900 dark:text-rose-400 font-sans">
                          {completedStats.lost}
                        </span>
                      </div>
                    </div>

                    {/* Formula Verification Pill */}
                    <div className="px-3 py-1.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedStats.survived} Survived</span>
                      <span className="text-neutral-500">+</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{completedStats.damaged} Damaged</span>
                      <span className="text-neutral-500">+</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{completedStats.lost} Lost</span>
                      <span className="text-neutral-500">=</span>
                      <span className="text-white font-extrabold">{completedStats.total} Total Included</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-mono bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850">
                    ✨ Your locker inventory was automatically updated: lost balls were deducted and damaged balls were moved to Damaged condition.
                  </p>

                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setJustCompletedRound(null)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Pack Another Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('history')}
                      className="px-4 py-2 bg-accent hover:bg-[#b5e000] text-black font-extrabold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      View Stats
                    </button>
                  </div>
                </div>
              )}

              {/* State A: ACTIVE ROUND IN PROGRESS */}
              {activeRound && (
                <div className="space-y-5">
                  {/* Round Overview Card */}
                  <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl space-y-3 font-mono text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <span className="font-sans font-black text-white text-sm block">
                            {activeRound.courseName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {activeRound.date} • {activeRound.holes} Holes
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-bold">
                          {activeStats.total} Balls In Play
                        </span>
                      </div>
                    </div>

                    {/* Live Tally: Survived + Damaged + Lost = Total Included */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-850 text-center">
                      <div className="bg-neutral-900/60 border border-neutral-800 p-2 rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Included</span>
                        <span className="text-base font-black text-white font-sans">{activeStats.total}</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">Survived</span>
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-sans">{activeStats.survived}</span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">Damaged</span>
                        <span className="text-base font-black text-amber-700 dark:text-amber-400 font-sans">{activeStats.damaged}</span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block">Lost</span>
                        <span className="text-base font-black text-rose-700 dark:text-rose-400 font-sans">{activeStats.lost}</span>
                      </div>
                    </div>

                    {/* Formula Confirmation Pill */}
                    <div className="px-2.5 py-1 rounded-lg bg-neutral-900/40 border border-neutral-850 text-[10px] text-neutral-400 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeStats.survived} Survived</span>
                      <span>+</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{activeStats.damaged} Damaged</span>
                      <span>+</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{activeStats.lost} Lost</span>
                      <span>=</span>
                      <span className="text-white font-bold">{activeStats.total} Total</span>
                    </div>
                  </div>

                  {/* Balls in Play list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-black uppercase text-neutral-700 dark:text-neutral-300 tracking-wider">
                        Balls in Play ({activeRound.balls.length})
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Select outcome for each ball
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeRound.balls.map((item, idx) => {
                        const isDamaged = item.status === 'damaged' || item.status === 'scuffed';
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                              item.status === 'lost'
                                ? 'bg-rose-50/60 border-rose-300 dark:bg-rose-950/20 dark:border-rose-900/50'
                                : isDamaged
                                ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/50'
                                : 'bg-neutral-950 border-neutral-850'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <BallVisual
                                  color={item.color}
                                  model={item.model}
                                  size="sm"
                                  customImage={item.customImage}
                                  customImageSleeve={item.customImageSleeve}
                                  customImageBox={item.customImageBox}
                                  packageType={item.packageType}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-white font-bold text-xs truncate">
                                      #{idx + 1} {item.model}
                                    </span>
                                    {item.bundleCatalogId && (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[8px] font-bold uppercase truncate max-w-[120px]">
                                        Variety Pack
                                      </span>
                                    )}
                                    {item.customNumber && (
                                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-neutral-600 dark:text-neutral-400 font-bold">
                                        play #{item.customNumber}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-neutral-500 font-mono block">
                                    {item.color} • Start condition: {item.originalCondition}
                                  </span>
                                </div>
                              </div>

                              {/* Status Toggle Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleSetBallStatus(item.id, 'survived')}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    item.status === 'survived'
                                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-300 shadow-sm'
                                      : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-600 dark:text-neutral-400 dark:hover:text-white'
                                  }`}
                                  title="Ball survived without major damage"
                                >
                                  <ShieldCheck size={12} />
                                  <span>Survived</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetBallStatus(item.id, 'damaged')}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isDamaged
                                      ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300 shadow-sm'
                                      : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-600 dark:text-neutral-400 dark:hover:text-white'
                                  }`}
                                  title="Damaged or scuffed on cart path / trees (downgrades to Damaged condition in locker)"
                                >
                                  <AlertTriangle size={12} />
                                  <span>Damaged</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetBallStatus(item.id, 'lost')}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    item.status === 'lost'
                                      ? 'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300 shadow-sm'
                                      : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-600 dark:text-neutral-400 dark:hover:text-white'
                                  }`}
                                  title="Ball was lost (deducts 1 from your locker)"
                                >
                                  <Skull size={12} />
                                  <span>Lost</span>
                                </button>
                              </div>
                            </div>

                            {/* Extra details when lost */}
                            {item.status === 'lost' && (
                              <div className="pt-2 border-t border-rose-200 dark:border-rose-950/40 flex flex-wrap items-center gap-2.5 text-[10px] font-mono">
                                <span className="text-rose-700 dark:text-rose-400 font-bold">Lost Details:</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-neutral-300">Hole:</span>
                                  <select
                                    value={item.lostHole || 1}
                                    onChange={(e) => handleUpdateLostDetails(item.id, parseInt(e.target.value, 10))}
                                    className="bg-neutral-900 border border-neutral-800 text-white font-medium rounded px-1.5 py-0.5 cursor-pointer outline-none focus:border-rose-500"
                                  >
                                    {Array.from({ length: activeRound.holes }, (_, i) => i + 1).map(h => (
                                      <option key={h} value={h} className="bg-neutral-900 text-white">Hole {h}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-neutral-300">Hazard:</span>
                                  <select
                                    value={item.hazard || 'Water Hazard'}
                                    onChange={(e) => handleUpdateLostDetails(item.id, undefined, e.target.value)}
                                    className="bg-neutral-900 border border-neutral-800 text-white font-medium rounded px-1.5 py-0.5 cursor-pointer outline-none focus:border-rose-500"
                                  >
                                    <option value="Water Hazard" className="bg-neutral-900 text-white">Water Hazard</option>
                                    <option value="Woods / Trees" className="bg-neutral-900 text-white">Woods / Trees</option>
                                    <option value="Deep Rough" className="bg-neutral-900 text-white">Deep Rough</option>
                                    <option value="Out of Bounds" className="bg-neutral-900 text-white">Out of Bounds</option>
                                    <option value="Cart Path" className="bg-neutral-900 text-white">Cart Path Bounce</option>
                                    <option value="Other" className="bg-neutral-900 text-white">Other</option>
                                  </select>
                                </div>
                                {item.hazard === 'Other' && (
                                  <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                    <span className="font-semibold text-neutral-300">Reason:</span>
                                    <input
                                      type="text"
                                      value={item.hazardDetail || ''}
                                      onChange={(e) => handleUpdateLostDetails(item.id, undefined, undefined, e.target.value)}
                                      placeholder="Specify reason..."
                                      className="bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded px-2 py-0.5 text-[10px] font-mono outline-none focus:border-rose-500 w-36 sm:w-48"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {isDamaged && (
                              <div className="pt-2 border-t border-amber-200 dark:border-amber-950/40 text-[10px] font-mono text-amber-900 dark:text-amber-300 font-medium">
                                ℹ️ Will be moved to <span className="font-bold text-amber-950 dark:text-amber-200 underline decoration-amber-400/60">Damaged</span> condition in your locker.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Finish Round Actions */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDiscardConfirm(true)}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-300 dark:hover:border-rose-900 text-neutral-600 hover:text-rose-700 dark:text-neutral-400 dark:hover:text-rose-400 rounded-xl font-mono text-xs transition-all cursor-pointer"
                    >
                      Discard Round
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteRound}
                      className="px-5 py-2.5 bg-accent hover:bg-[#b5e000] text-black font-extrabold rounded-xl font-sans text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle2 size={16} />
                      <span>Complete Round & Update Locker</span>
                    </button>
                  </div>
                </div>
              )}

              {/* State B: START NEW ROUND (Pack Bag) */}
              {!activeRound && !justCompletedRound && (
                <div className="space-y-6">
                  {/* Setup Inputs */}
                  <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-4">
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider">
                      1. Course & Round Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] uppercase text-neutral-400 mb-1 font-bold">
                          Course Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={courseInput}
                          onChange={(e) => setCourseInput(e.target.value)}
                          placeholder="e.g. Pebble Beach, Local Muni"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-600 focus:border-accent outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase text-neutral-400 mb-1 font-bold">
                          Holes
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setHolesInput(9)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              holesInput === 9
                                ? 'bg-accent text-black font-extrabold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            9 Holes
                          </button>
                          <button
                            type="button"
                            onClick={() => setHolesInput(18)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              holesInput === 18
                                ? 'bg-accent text-black font-extrabold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            18 Holes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Packed Bag Tray */}
                  <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider flex items-center gap-2">
                        <span>2. Packed in Your Bag</span>
                        <span className="px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold">
                          {totalPackedCount} Balls
                        </span>
                      </h3>
                      {packedBalls.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPackedBalls([])}
                          className="text-[10px] font-mono text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {packedBalls.length === 0 ? (
                      <div className="py-6 text-center border border-dashed border-neutral-850 rounded-xl text-neutral-500 font-mono text-xs">
                        No balls packed yet. Click <span className="text-accent font-bold">+</span> below to add balls from your locker.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {packedBalls.map(({ ball, count, parentBundleBallId, bundleCatalogId, fromBundleTitle }) => (
                          <div
                            key={ball.id}
                            className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl flex items-center justify-between gap-2.5 font-mono text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <BallVisual
                                color={ball.color}
                                model={ball.model}
                                size="sm"
                                customImage={ball.customImage}
                                customImageSleeve={ball.customImageSleeve}
                                customImageBox={ball.customImageBox}
                                packageType={ball.packageType}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-white font-bold block truncate text-xs">
                                    {ball.model}
                                  </span>
                                  {fromBundleTitle && (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold uppercase truncate max-w-[110px]" title={`From ${fromBundleTitle}`}>
                                      {fromBundleTitle}
                                    </span>
                                  )}
                                </div>
                                <span className="text-neutral-500 text-[10px] truncate block">
                                  {ball.variation || ball.color} • {ball.condition}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUnpackBall(ball.id)}
                                className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-white font-bold text-xs">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (parentBundleBallId && bundleCatalogId) {
                                    const parent = balls.find(b => b.id === parentBundleBallId);
                                    const bItems = parent ? getBundleItemsForBall(parent, catalog) : [];
                                    const sub = bItems.find(s => s.catalogId === bundleCatalogId);
                                    const cat = (catalog || []).find(c => c.id === bundleCatalogId) || { id: bundleCatalogId, model: ball.model, color: ball.color };
                                    if (parent && sub) handlePackSubBall(parent, sub, cat as any);
                                  } else {
                                    handlePackBall(ball);
                                  }
                                }}
                                className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white font-extrabold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Locker Balls Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider">
                        Available in Locker ({playableBalls.length})
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Tap + to pack for round
                      </span>
                    </div>

                    {playableBalls.length === 0 ? (
                      <div className="py-8 text-center bg-neutral-950/40 border border-neutral-850 rounded-2xl text-neutral-500 font-mono text-xs px-4">
                        {balls.length > 0 
                          ? "All balls in your locker are marked 'Not for play' (Display Only)."
                          : "Your locker has no balls yet! Add balls from the Catalog first."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
                        {playableBalls.map((ball) => {
                          const bundleItems = getBundleItemsForBall(ball, catalog);
                          const isBundle = bundleItems.length > 0;

                          if (isBundle) {
                            const isExpanded = !!expandedBundleIds[ball.id];
                            const totalInBundle = bundleItems.reduce((sum, item) => sum + item.qty, 0);
                            const packedFromThisBundle = packedBalls
                              .filter(p => p.parentBundleBallId === ball.id)
                              .reduce((sum, p) => sum + p.count, 0);
                            const bundleAvailableLeft = Math.max(0, totalInBundle - packedFromThisBundle);

                            return (
                              <div
                                key={ball.id}
                                className={`col-span-1 bg-neutral-950 border border-neutral-850 hover:border-neutral-750 p-2.5 rounded-xl font-mono text-xs transition-colors ${
                                  isExpanded ? 'space-y-2.5' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <BallVisual
                                      color={ball.color}
                                      model={ball.model}
                                      size="sm"
                                      customImage={ball.customImage}
                                      customImageSleeve={ball.customImageSleeve}
                                      customImageBox={ball.customImageBox || (catalog.find(c => c.id === ball.catalogId || (c.model === ball.model && c.name === ball.name))?.customImageBox)}
                                      packageType={ball.packageType || 'box'}
                                    />
                                    <div className="min-w-0">
                                      <span className="text-white font-bold block truncate text-xs">
                                        {ball.name || ball.model}
                                      </span>
                                      <span className="text-neutral-500 text-[10px] truncate block">
                                        {ball.color && ball.color.toLowerCase() !== 'mixed' ? `${ball.color} • ` : ''}{bundleAvailableLeft} avail
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleBundleExpand(ball.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                                  >
                                    <span>{isExpanded ? 'Hide' : `Contains ${totalInBundle}`}</span>
                                    <ChevronDown size={12} className={`transition-transform duration-200 text-neutral-400 ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                </div>

                                {/* Expanded sub-balls inside variety pack (compact list matching bag card) */}
                                {isExpanded && (
                                  <div className="pt-2 border-t border-neutral-850 space-y-1.5 animate-in fade-in duration-150">
                                    {bundleItems.map((item) => {
                                      const catItem = (catalog || []).find(c => c.id === item.catalogId) || {
                                        id: item.catalogId,
                                        model: item.catalogId,
                                        color: 'White'
                                      };
                                      const packed = packedBalls.find(p => p.parentBundleBallId === ball.id && p.bundleCatalogId === item.catalogId);
                                      const currentPacked = packed ? packed.count : 0;
                                      const left = Math.max(0, item.qty - currentPacked);

                                      // If all balls in this bundle share the same color (e.g. all White variation packs like Eat This)
                                      const bundleColors = bundleItems.map(bi => {
                                        const cat = (catalog || []).find(c => c.id === bi.catalogId);
                                        return (cat?.color || '').trim().toLowerCase();
                                      }).filter(Boolean);
                                      const isSameColorBundle = bundleColors.length > 0 && new Set(bundleColors).size === 1;

                                      // When constituent balls share the same color, omit the color from the pill so it only shows the variation (e.g. "Eat This")
                                      const badgeText = (isSameColorBundle && catItem.variation)
                                        ? catItem.variation
                                        : (catItem.variation ? `${catItem.color} • ${catItem.variation}` : catItem.color);

                                      return (
                                        <div
                                          key={item.catalogId}
                                          className="p-1.5 px-2 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-between gap-2 text-xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="font-bold text-neutral-500 font-mono text-[11px] shrink-0 w-5">{left}x</span>
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                                              <span className="font-sans font-bold text-white text-[11px] truncate">
                                                {catItem.model}{catItem.name && catItem.name !== 'Standard' ? ` - ${catItem.name}` : ''}
                                              </span>
                                              {badgeText && (
                                                <span className="text-[10px] text-neutral-400 font-mono bg-neutral-950 border border-neutral-800 px-1.5 py-0.5 rounded truncate">
                                                  {badgeText}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            disabled={left <= 0}
                                            onClick={() => handlePackSubBall(ball, item, catItem as any)}
                                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                                              left > 0
                                                ? 'bg-accent hover:bg-[#b5e000] text-black font-extrabold shadow-xs'
                                                : 'bg-neutral-850 text-neutral-600 cursor-not-allowed opacity-50'
                                            }`}
                                          >
                                            + Pack
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Regular ball in locker
                          const packed = packedBalls.find(p => p.ball.id === ball.id && !p.parentBundleBallId);
                          const packedCount = packed ? packed.count : 0;
                          const availableLeft = Math.max(0, ball.quantity - packedCount);

                          return (
                            <div
                              key={ball.id}
                              className="bg-neutral-950 border border-neutral-850 hover:border-neutral-750 p-2.5 rounded-xl flex items-center justify-between gap-2.5 font-mono text-xs transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <BallVisual
                                  color={ball.color}
                                  model={ball.model}
                                  size="sm"
                                  customImage={ball.customImage}
                                  customImageSleeve={ball.customImageSleeve}
                                  customImageBox={ball.customImageBox}
                                  packageType={ball.packageType}
                                />
                                <div className="min-w-0">
                                  <span className="text-white font-bold block truncate text-xs">
                                    {ball.model}
                                  </span>
                                  <span className="text-neutral-500 text-[10px] truncate block">
                                    {ball.color} • {availableLeft} avail
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={availableLeft <= 0}
                                onClick={() => handlePackBall(ball)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                                  availableLeft <= 0
                                    ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-850'
                                    : 'bg-neutral-900 hover:bg-accent hover:text-black border border-neutral-800 text-neutral-300'
                                }`}
                              >
                                <Plus size={11} />
                                <span>Pack</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Start Round Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={totalPackedCount === 0}
                      onClick={handleStartRound}
                      className="w-full py-3 bg-accent hover:bg-[#b5e000] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl font-sans text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Play size={14} className="fill-current" />
                      <span>Start Round ({totalPackedCount} Balls Packed)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: HISTORY & STATS */}
          {tab === 'history' && (
            <div className="space-y-6">
              {/* High-level performance metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono">
                <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-neutral-500 uppercase block font-bold">Rounds</span>
                  <span className="text-xl font-black text-white font-sans mt-0.5 block">
                    {stats.totalRounds}
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 dark:bg-neutral-950 dark:border-neutral-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase block font-bold">Survived</span>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-400 font-sans mt-0.5 block">
                    {stats.totalSurvived}
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-300 dark:bg-neutral-950 dark:border-neutral-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase block font-bold">Damaged</span>
                  <span className="text-xl font-black text-amber-900 dark:text-amber-400 font-sans mt-0.5 block">
                    {stats.totalDamaged}
                  </span>
                </div>

                <div className="bg-rose-50 border border-rose-300 dark:bg-neutral-950 dark:border-neutral-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-rose-800 dark:text-rose-400 uppercase block font-bold">Lost</span>
                  <span className="text-xl font-black text-rose-900 dark:text-rose-400 font-sans mt-0.5 block">
                    {stats.totalLost}
                  </span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-accent uppercase block font-bold">Survival</span>
                  <span className="text-xl font-black text-accent font-sans mt-0.5 block">
                    {stats.survivalRate}%
                  </span>
                </div>
              </div>

              {/* Ball Durability breakdown */}
              {Object.keys(stats.modelStats).length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3 font-mono text-xs">
                  <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider flex items-center gap-2">
                    <BarChart3 size={14} className="text-accent" />
                    <span>Ball Model Durability</span>
                  </h3>

                  <div className="space-y-2">
                    {(Object.entries(stats.modelStats) as [string, { inPlay: number; lost: number; damaged: number; survived: number }][]).map(([model, data]) => {
                      const rate = data.inPlay > 0 ? Math.round((data.survived / data.inPlay) * 100) : 100;
                      return (
                        <div key={model} className="bg-neutral-900 border border-neutral-850 p-2.5 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-white font-bold">{model}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{data.survived} survived</span>
                              {' • '}
                              <span className="text-amber-700 dark:text-amber-400 font-semibold">{data.damaged} damaged</span>
                              {' • '}
                              <span className="text-rose-700 dark:text-rose-400 font-semibold">{data.lost} lost</span>
                              {` (${rate}%)`}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all duration-500"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past Rounds List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black uppercase text-neutral-300 tracking-wider">
                    Past Rounds Log ({roundHistory.length})
                  </h3>
                  {roundHistory.length > 0 && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      Chronological log
                    </span>
                  )}
                </div>

                {roundHistory.length === 0 ? (
                  <div className="py-12 text-center bg-neutral-950 border border-dashed border-neutral-850 rounded-2xl text-neutral-500 font-mono text-xs">
                    No rounds logged yet! Start a round before your next tee time.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {roundHistory.map((round) => {
                      const lostCount = round.balls.filter(b => b.status === 'lost').length;
                      const damagedCount = round.balls.filter(b => b.status === 'damaged' || b.status === 'scuffed').length;
                      const survivedCount = round.balls.filter(b => b.status !== 'lost' && b.status !== 'damaged' && b.status !== 'scuffed').length;

                      const isThisRoundExpanded = expandedRoundSection?.roundId === round.id;
                      const activeFilter = isThisRoundExpanded ? expandedRoundSection.filter : null;

                      const isSurvivedActive = isThisRoundExpanded && activeFilter === 'survived';
                      const isDamagedActive = isThisRoundExpanded && activeFilter === 'damaged';
                      const isLostActive = isThisRoundExpanded && activeFilter === 'lost';

                      const handleToggleFilter = (filter: 'survived' | 'damaged' | 'lost') => {
                        if (isThisRoundExpanded && activeFilter === filter) {
                          setExpandedRoundSection(null);
                        } else {
                          setExpandedRoundSection({ roundId: round.id, filter });
                        }
                      };

                      return (
                        <div
                          key={round.id}
                          className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="min-w-0 pr-2">
                              <span className="text-white font-bold font-sans block text-sm truncate">
                                {round.courseName}
                              </span>
                              <span className="text-[10px] text-neutral-500 block truncate">
                                {round.date} • {round.holes} Holes • {round.balls.length} Balls
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                              {/* Survived Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFilter('survived')}
                                disabled={survivedCount === 0}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                  isSurvivedActive
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/40 cursor-pointer'
                                    : survivedCount > 0
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20 cursor-pointer'
                                    : 'opacity-40 cursor-default bg-neutral-900 border-neutral-800 text-neutral-500'
                                }`}
                                title={survivedCount > 0 ? (isSurvivedActive ? 'Click to collapse survived balls' : 'Click to inspect survived balls') : 'No survived balls'}
                              >
                                <span>{survivedCount} Survived</span>
                                {survivedCount > 0 && (
                                  <ChevronDown size={11} className={`transition-transform duration-200 ${isSurvivedActive ? 'rotate-180' : ''}`} />
                                )}
                              </button>

                              {/* Damaged Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFilter('damaged')}
                                disabled={damagedCount === 0}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                  isDamagedActive
                                    ? 'bg-amber-500 text-amber-950 border-amber-600 font-extrabold shadow-sm ring-2 ring-amber-400/50 cursor-pointer'
                                    : damagedCount > 0
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/20 cursor-pointer'
                                    : 'opacity-40 cursor-default bg-neutral-900 border-neutral-800 text-neutral-500'
                                }`}
                                title={damagedCount > 0 ? (isDamagedActive ? 'Click to collapse damaged balls' : 'Click to inspect damaged balls') : 'No damaged balls'}
                              >
                                <span>{damagedCount} Damaged</span>
                                {damagedCount > 0 && (
                                  <ChevronDown size={11} className={`transition-transform duration-200 ${isDamagedActive ? 'rotate-180' : ''}`} />
                                )}
                              </button>

                              {/* Lost Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFilter('lost')}
                                disabled={lostCount === 0}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                  isLostActive
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-500/40 cursor-pointer'
                                    : lostCount > 0
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/20 cursor-pointer'
                                    : 'opacity-40 cursor-default bg-neutral-900 border-neutral-800 text-neutral-500'
                                }`}
                                title={lostCount > 0 ? (isLostActive ? 'Click to collapse lost balls' : 'Click to inspect lost balls') : 'No lost balls'}
                              >
                                <span>{lostCount} Lost</span>
                                {lostCount > 0 && (
                                  <ChevronDown size={11} className={`transition-transform duration-200 ${isLostActive ? 'rotate-180' : ''}`} />
                                )}
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => setRoundToDelete(round)}
                                className="p-1 text-neutral-400 hover:text-rose-600 dark:text-neutral-600 dark:hover:text-rose-400 transition-colors cursor-pointer ml-0.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                title="Delete round record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Expandable detailed drawer when a category is tapped */}
                          {isThisRoundExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-neutral-850 space-y-2 animate-in fade-in duration-200">
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mr-1">
                                    Showing:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRoundSection({ roundId: round.id, filter: 'survived' })}
                                    disabled={survivedCount === 0}
                                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      activeFilter === 'survived'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 disabled:opacity-40 disabled:cursor-default'
                                    }`}
                                  >
                                    <CheckCircle2 size={10} />
                                    <span>Survived ({survivedCount})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedRoundSection({ roundId: round.id, filter: 'damaged' })}
                                    disabled={damagedCount === 0}
                                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      activeFilter === 'damaged'
                                        ? 'bg-amber-500 text-amber-950 font-extrabold shadow-xs'
                                        : 'text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 disabled:opacity-40 disabled:cursor-default'
                                    }`}
                                  >
                                    <AlertTriangle size={10} />
                                    <span>Damaged ({damagedCount})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedRoundSection({ roundId: round.id, filter: 'lost' })}
                                    disabled={lostCount === 0}
                                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      activeFilter === 'lost'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'text-rose-800 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 disabled:opacity-40 disabled:cursor-default'
                                    }`}
                                  >
                                    <Skull size={10} />
                                    <span>Lost ({lostCount})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedRoundSection({ roundId: round.id, filter: 'all' })}
                                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                      activeFilter === 'all'
                                        ? 'bg-neutral-800 text-white shadow-xs'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-850 dark:hover:bg-neutral-800'
                                    }`}
                                  >
                                    All ({round.balls.length})
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setExpandedRoundSection(null)}
                                  className="text-[10px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-mono transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-neutral-850 dark:hover:bg-neutral-800"
                                >
                                  Close ✕
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {round.balls
                                  .filter((b) => {
                                    const isDamaged = b.status === 'damaged' || b.status === 'scuffed';
                                    const isLost = b.status === 'lost';
                                    const isSurvived = !isLost && !isDamaged;

                                    if (activeFilter === 'survived') return isSurvived;
                                    if (activeFilter === 'damaged') return isDamaged;
                                    if (activeFilter === 'lost') return isLost;
                                    return true;
                                  })
                                  .map((b, i) => {
                                    const isDamaged = b.status === 'damaged' || b.status === 'scuffed';
                                    const isLost = b.status === 'lost';
                                    const colorDisplay = b.color && b.color.toLowerCase() !== 'white' ? b.color : '';

                                    return (
                                      <div
                                        key={i}
                                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[10px] transition-colors ${
                                          isLost
                                            ? 'bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                                            : isDamaged
                                            ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40'
                                            : 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span
                                            className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shrink-0 inline-block shadow-xs"
                                            style={{ background: getMiniBallSwatch(b.color) }}
                                          />
                                          <div className="min-w-0">
                                            <div className="font-bold text-white truncate">
                                              {b.model} {colorDisplay ? `• ${colorDisplay}` : ''} {b.customNumber ? `(#${b.customNumber})` : ''}
                                            </div>
                                            <div className="text-neutral-500 text-[9px] truncate">
                                              Start: {b.originalCondition}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="shrink-0 font-bold text-right text-[10px]">
                                          {isLost ? (
                                            <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1 font-extrabold">
                                              <Skull size={11} />
                                              Lost {b.lostHole ? `H${b.lostHole}` : ''} {b.hazard ? `(${b.hazard === 'Other' && (b as any).hazardDetail ? (b as any).hazardDetail : b.hazard})` : ''}
                                            </span>
                                          ) : isDamaged ? (
                                            <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1 font-extrabold">
                                              <AlertTriangle size={11} />
                                              Damaged
                                            </span>
                                          ) : (
                                            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-extrabold">
                                              <CheckCircle2 size={11} />
                                              Survived
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-950/60">
          <div className="text-[10px] font-mono text-neutral-500">
            Golf Ball Vault • Round Tracker
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold font-sans"
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation Prompt Modal */}
        {roundToDelete && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-base font-sans">
                    Delete Round Record?
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-mono block truncate">
                    {roundToDelete.courseName} • {roundToDelete.date}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed px-0.5">
                  Are you sure you want to delete this round log? This will permanently remove the record from your past round history.
                </p>

                {/* Warning about locker inventory in red */}
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 flex items-start gap-2.5 text-[11px] leading-snug">
                  <AlertTriangle size={15} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-950 dark:text-rose-100 block mb-0.5">Inventory Notice:</span>
                    <span>Your current locker inventory will <span className="underline font-bold">not</span> be changed or restored.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setRoundToDelete(null)}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    nativeHaptics.notificationWarning();
                    handleDeleteHistoryRound(roundToDelete.id);
                    setRoundToDelete(null);
                  }}
                  className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer font-bold shadow-md shadow-rose-950/40"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Active Round Confirmation Prompt Modal */}
        {showDiscardConfirm && activeRound && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-base font-sans">
                    Discard Active Round?
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-mono block truncate">
                    {activeRound.courseName} • {activeRound.holes} Holes
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed px-0.5">
                  Are you sure you want to discard this active round? Your current round progress will be cancelled.
                </p>

                {/* Locker status notice in green */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200 flex items-start gap-2.5 text-[11px] leading-snug">
                  <ShieldCheck size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950 dark:text-emerald-100 block mb-0.5">Locker Notice:</span>
                    <span>Your locker inventory will <span className="underline font-bold">remain unchanged</span>. No balls will be deducted or downgraded.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    nativeHaptics.notificationWarning();
                    handleAbandonRound();
                  }}
                  className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer font-bold shadow-md shadow-rose-950/40"
                >
                  Discard Round
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
