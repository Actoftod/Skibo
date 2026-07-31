import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player, PlayerProgression } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Shield, Sparkles, ArrowRight, RefreshCw, Star, Medal, Heart, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchRewardResult, getRankTier } from '../utils/rankingProgression';

interface GameOverModalProps {
  winner: Player;
  players: Player[];
  roundScoreGained: number;
  underdogPlayersNextRound: string[];
  matchReward?: MatchRewardResult | null;
  onNextRound: () => void;
  onNewMatch: () => void;
}

// Explosive vibrant cartoon palette for Teddy Hug celebration
const EXPLOSION_COLORS = [
  '#f59e0b', // amber-500
  '#facc15', // yellow-400
  '#f472b6', // pink-400
  '#ec4899', // pink-500
  '#38bdf8', // sky-400
  '#a3e635', // lime-400
  '#c084fc', // purple-400
  '#ffffff', // bright white
];

const HEART_EMOJIS = ['💖', '💕', '❤️', '💝', '💗', '🧸', '🐾', '✨', '⭐'];

// SVG Golden & Pink Particle Generator
interface SvgParticle {
  id: number;
  type: 'confetti-rect' | 'confetti-diamond' | 'confetti-circle' | 'starburst' | 'sparkle' | 'teddy-heart';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scale: number;
  rotation: number;
  rotationDelta: number;
  duration: number;
  delay: number;
  fill: string;
  size: number;
  emoji?: string;
}

const GOLD_PALETTE = ['url(#goldGradient1)', 'url(#pinkGradient)', '#f59e0b', '#fbbf24', '#f472b6', '#ffffff', '#eab308'];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  players,
  roundScoreGained,
  underdogPlayersNextRound,
  matchReward,
  onNextRound,
  onNewMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hugClickCount, setHugClickCount] = useState(0);

  // Generate SVG background floating particles
  const svgParticles = useMemo<SvgParticle[]>(() => {
    return Array.from({ length: 75 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 160 + Math.random() * 520;
      const types: SvgParticle['type'][] = ['confetti-rect', 'confetti-diamond', 'confetti-circle', 'starburst', 'sparkle', 'teddy-heart'];
      return {
        id: i,
        type: types[i % types.length],
        startX: 50,
        startY: 42,
        endX: 50 + Math.cos(angle) * (distance / 8),
        endY: 42 + Math.sin(angle) * (distance / 8) + (Math.random() * 25 - 5),
        scale: 0.6 + Math.random() * 1.3,
        rotation: Math.random() * 360,
        rotationDelta: (Math.random() - 0.5) * 720,
        duration: 2.2 + Math.random() * 2.0,
        delay: Math.random() * 0.7,
        fill: GOLD_PALETTE[i % GOLD_PALETTE.length],
        size: 10 + Math.random() * 16,
        emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
      };
    });
  }, []);

  // Screen-Wide Interactive 2D Canvas Particle Celebration System
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    decay: number;
    gravity: number;
    drag: number;
    rotation: number;
    vRot: number;
    shape: 'circle' | 'square' | 'star' | 'spark' | 'teddy' | 'heart' | 'paw';
    emoji?: string;
  }>>([]);

  const shockwavesRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
    lineWidth: number;
  }>>([]);

  const spawnBurst = (originX: number, originY: number, count = 70) => {
    shockwavesRef.current.push({
      x: originX,
      y: originY,
      radius: 4,
      maxRadius: 180 + Math.random() * 120,
      color: EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)],
      alpha: 1,
      lineWidth: 8,
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 18;
      const shapes: Array<'circle' | 'square' | 'star' | 'spark' | 'teddy' | 'heart' | 'paw'> = [
        'circle', 'square', 'star', 'spark', 'teddy', 'heart', 'paw', 'heart', 'teddy'
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: shape === 'teddy' || shape === 'heart' || shape === 'paw' ? 14 + Math.random() * 12 : 5 + Math.random() * 10,
        color: EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)],
        alpha: 1,
        decay: 0.006 + Math.random() * 0.012,
        gravity: 0.10 + Math.random() * 0.08,
        drag: 0.96 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        shape,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initial sequence of bursts
    spawnBurst(width * 0.5, height * 0.38, 90);
    const t1 = setTimeout(() => spawnBurst(width * 0.25, height * 0.3, 75), 250);
    const t2 = setTimeout(() => spawnBurst(width * 0.75, height * 0.3, 75), 500);
    const t3 = setTimeout(() => spawnBurst(width * 0.5, height * 0.6, 85), 750);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update shockwaves
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 8;
        sw.alpha -= 0.022;
        sw.lineWidth *= 0.96;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.lineWidth = sw.lineWidth;
        ctx.strokeStyle = sw.color;
        ctx.shadowBlur = 18;
        ctx.shadowColor = sw.color;
        ctx.stroke();
        ctx.restore();
      }

      // Render & update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'teddy') {
          ctx.font = `${p.size * 1.8}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧸', 0, 0);
        } else if (p.shape === 'heart') {
          ctx.font = `${p.size * 1.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji || '💖', 0, 0);
        } else if (p.shape === 'paw') {
          ctx.font = `${p.size * 1.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐾', 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'square') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === 'spark') {
            ctx.fillRect(-p.size * 0.8, -p.size * 0.2, p.size * 1.6, p.size * 0.4);
            ctx.fillRect(-p.size * 0.2, -p.size * 0.8, p.size * 0.4, p.size * 1.6);
          } else if (p.shape === 'star') {
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(
                Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size,
                -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size
              );
              ctx.lineTo(
                Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2),
                -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)
              );
            }
            ctx.closePath();
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    // Launch celebratory fireworks confetti
    const fireConfetti = () => {
      try {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.45, x: 0.5 },
          colors: ['#ffd700', '#f59e0b', '#f472b6', '#ffffff', '#ec4899', '#38bdf8'],
        });
      } catch (e) {}
    };

    fireConfetti();
    const timer1 = setTimeout(fireConfetti, 400);
    const timer2 = setTimeout(fireConfetti, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Handle click on screen/modal to trigger extra Teddy Hug bursts!
  const handleScreenClick = (e: React.MouseEvent) => {
    spawnBurst(e.clientX, e.clientY, 45);
    setHugClickCount((prev) => prev + 1);
  };

  return (
    <div
      onClick={handleScreenClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto cursor-pointer select-none"
    >
      {/* Screen-Wide Interactive 2D HTML Canvas Particle Explosion Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-10"
      />

      {/* High-Impact SVG Victory Particle System Overlay */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none z-10 overflow-hidden">
        <defs>
          <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fde047" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <filter id="svgGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Rotating Golden Sunburst Victory Rays */}
        <g transform="translate(50% 42%)">
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <path
                key={i}
                d="M 0 0 L -35 -800 L 35 -800 Z"
                fill="url(#goldGradient1)"
                opacity="0.08"
                transform={`rotate(${i * 22.5})`}
              />
            ))}
          </motion.g>
        </g>

        {/* SVG Particle System Spray */}
        {svgParticles.map((p) => (
          <motion.g
            key={p.id}
            initial={{
              x: `${p.startX}%`,
              y: `${p.startY}%`,
              scale: 0.1,
              opacity: 0,
              rotate: p.rotation,
            }}
            animate={{
              x: `${p.endX}%`,
              y: [`${p.startY}%`, `${p.endY - 10}%`, `${p.endY}%`],
              scale: [0.2, p.scale, p.scale * 0.8],
              opacity: [0, 1, 1, 0],
              rotate: p.rotation + p.rotationDelta,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            {p.type === 'confetti-rect' && (
              <rect
                x={-p.size / 2}
                y={-p.size / 4}
                width={p.size}
                height={p.size / 2}
                rx={1}
                fill={p.fill}
                filter="url(#svgGlow)"
              />
            )}
            {p.type === 'confetti-diamond' && (
              <polygon
                points={`0,${-p.size} ${p.size / 1.5},0 0,${p.size} ${-p.size / 1.5},0`}
                fill={p.fill}
                filter="url(#svgGlow)"
              />
            )}
            {p.type === 'confetti-circle' && (
              <circle r={p.size / 2.5} fill={p.fill} filter="url(#svgGlow)" />
            )}
            {p.type === 'starburst' && (
              <g filter="url(#svgGlow)">
                <path
                  d={`M 0 ${-p.size * 1.5} Q 0 0 ${p.size * 1.5} 0 Q 0 0 0 ${p.size * 1.5} Q 0 0 ${-p.size * 1.5} 0 Q 0 0 0 ${-p.size * 1.5} Z`}
                  fill="url(#goldGradient1)"
                />
                <circle r={p.size / 3} fill="url(#starGlow)" />
              </g>
            )}
            {p.type === 'sparkle' && (
              <g filter="url(#svgGlow)">
                <path
                  d={`M 0 ${-p.size} L ${p.size * 0.25} ${-p.size * 0.25} L ${p.size} 0 L ${p.size * 0.25} ${p.size * 0.25} L 0 ${p.size} L ${-p.size * 0.25} ${p.size * 0.25} L ${-p.size} 0 L ${-p.size * 0.25} ${-p.size * 0.25} Z`}
                  fill="#ffffff"
                />
              </g>
            )}
            {p.type === 'teddy-heart' && (
              <text textAnchor="middle" dominantBaseline="middle" fontSize={p.size * 1.4}>
                {p.emoji || '💖'}
              </text>
            )}
          </motion.g>
        ))}
      </svg>

      {/* Main Cartoon Victory Modal Box */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()} // Let button clicks handle action
        className="relative z-20 w-full max-w-lg rounded-3xl border-4 border-black bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 p-5 sm:p-6 shadow-[8px_8px_0_#000] text-center my-auto overflow-hidden"
      >
        {/* Slanted Cartoon Header Ribbon - Replaces Standard Victory Banner */}
        <div className="mb-4 inline-block transform -skew-x-6 bg-black border-3 border-yellow-400 px-5 py-2 rounded-2xl shadow-[4px_4px_0_#000]">
          <h2 className="text-base sm:text-xl font-black italic text-yellow-300 uppercase tracking-wider drop-shadow-[0_2px_0_#000]">
            STOCKPILE CLEARED! 🧸 TEDDY HUG!
          </h2>
        </div>

        {/* HERO FEATURE: Particle-based 'TEDDY HUG' Centerpiece Animation */}
        <div className="relative my-3 flex flex-col items-center justify-center">
          {/* Pulsing Heart Aura Shockwave Ring behind Teddy Hug */}
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute h-32 w-32 rounded-full bg-gradient-to-tr from-pink-500/40 via-yellow-400/30 to-purple-500/40 blur-md pointer-events-none"
          />

          {/* Animated Twin Teddy Bears Hugging Squeeze Visual */}
          <div className="relative z-10 flex items-center justify-center gap-1">
            {/* Left Teddy Bear */}
            <motion.div
              animate={{
                x: [0, 12, 0],
                rotate: [0, 8, 0],
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-black bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-[4px_4px_0_#000]"
            >
              <span className="text-4xl">{winner.avatar || '🧸'}</span>
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-xl drop-shadow-[0_2px_0_#000]"
              >
                💖
              </motion.span>
            </motion.div>

            {/* Center Heart Burst & Hug Squeeze Icon */}
            <motion.div
              animate={{
                scale: [1, 1.25, 0.95, 1.15, 1],
                rotate: [0, -10, 10, -5, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="z-20 -mx-3 flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-black bg-pink-500 text-white shadow-[3px_3px_0_#000]"
            >
              <span className="text-2xl">🤗</span>
            </motion.div>

            {/* Right Teddy Bear */}
            <motion.div
              animate={{
                x: [0, -12, 0],
                rotate: [0, -8, 0],
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-black bg-gradient-to-tr from-purple-500 via-pink-400 to-rose-300 shadow-[4px_4px_0_#000]"
            >
              <span className="text-4xl">🧸</span>
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                className="absolute -top-2 -left-2 text-xl drop-shadow-[0_2px_0_#000]"
              >
                ✨
              </motion.span>
            </motion.div>
          </div>

          {/* Winner Subtitle */}
          <div className="mt-3 flex flex-col items-center">
            <span className="rounded-xl border-2 border-black bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950 shadow-[2px_2px_0_#000]">
              {winner.name} CLEARED THE TABLE! 🎉
            </span>
            <p className="mt-1 text-[11px] font-black text-cyan-300 drop-shadow-[0_1px_0_#000]">
              Tap anywhere for a Teddy Heart Confetti burst! {hugClickCount > 0 && `(Bursts: ${hugClickCount})`}
            </p>
          </div>
        </div>

        {/* Score Breakdown Box */}
        <div className="my-3 rounded-2xl border-3 border-black bg-slate-950 p-3.5 text-left space-y-1.5 shadow-[3px_3px_0_#000]">
          <div className="flex justify-between items-center text-xs font-black text-slate-200 border-b-2 border-slate-800 pb-1.5">
            <span>Victory Points Earned</span>
            <span className="text-yellow-400 font-black text-sm drop-shadow-[0_1px_0_#000]">
              +{roundScoreGained} PTS
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            25 Base Stockpile Clear Bonus + 5 Points for every remaining card in opponents' stockpiles.
          </p>
        </div>

        {/* Rank & Level Rewards Box */}
        {matchReward && (
          <div className="mb-3 rounded-2xl border-3 border-black bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-3 text-left space-y-2 shadow-[3px_3px_0_#000]">
            <div className="flex justify-between items-center text-xs font-black text-yellow-300 border-b-2 border-black/50 pb-1">
              <span className="flex items-center gap-1">
                <Medal className="h-4 w-4 text-yellow-400" /> TROPHY ROAD REWARDS
              </span>
              {matchReward.leveledUp && (
                <span className="rounded-lg border-2 border-black bg-yellow-400 px-2 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-tighter animate-bounce shadow-[1px_1px_0_#000]">
                  LEVEL UP! Lv. {matchReward.newLevel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <div className="flex items-center gap-1.5 text-yellow-300 bg-slate-950 p-2 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span>
                  {matchReward.rpGained >= 0 ? `+${matchReward.rpGained}` : matchReward.rpGained} RP
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300 bg-slate-950 p-2 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>+{matchReward.xpGained} XP</span>
              </div>
            </div>

            {matchReward.starsEarned && matchReward.starsEarned > 0 ? (
              <div className="flex items-center justify-between text-xs font-black text-amber-200 pt-0.5">
                <span>SOLO STAGE CLEARED</span>
                <div className="flex gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current drop-shadow-[0_1px_0_#000]" />
                  <Star className="h-4 w-4 fill-current drop-shadow-[0_1px_0_#000]" />
                  <Star className="h-4 w-4 fill-current drop-shadow-[0_1px_0_#000]" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Underdog Bounce Perk Alert */}
        {underdogPlayersNextRound.length > 0 && (
          <div className="mb-3 rounded-2xl border-3 border-black bg-slate-900 p-2.5 text-left flex items-start gap-2 shadow-[3px_3px_0_#000]">
            <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                Underdog Bounce Activated!
              </div>
              <p className="text-[11px] font-bold text-slate-300 mt-0.5">
                Players with &gt;15 stockpile cards left gain a <strong className="text-white">6th Hand Slot</strong> next round!
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard Summary */}
        <div className="mb-4 space-y-1.5 text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Match Standings</span>
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-950 p-2 text-xs font-black border-2 border-black shadow-[2px_2px_0_#000]">
              <div className="flex items-center gap-2">
                <span>{p.avatar}</span>
                <span className="text-white">{p.name}</span>
                {p.id === winner.id && (
                  <span className="rounded-lg bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950 border border-black shadow-[1px_1px_0_#000]">
                    WINNER
                  </span>
                )}
              </div>
              <span className="text-yellow-400 font-black">{p.score} PTS</span>
            </div>
          ))}
        </div>

        {/* Actions - Chunky 3D Cartoon Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNewMatch();
            }}
            className="flex items-center gap-1.5 rounded-2xl border-3 border-black bg-slate-800 px-4 py-2.5 font-black text-slate-200 text-xs shadow-[0_3px_0_#000] active:translate-y-0.5 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>New Match</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNextRound();
            }}
            className="brawl-btn-yellow flex items-center gap-2 px-6 py-2.5 text-xs text-slate-950 uppercase tracking-wider shadow-[0_4px_0_#000] active:translate-y-0.5 cursor-pointer"
          >
            <span className="font-black">Next Round</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};


