import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Play, RotateCcw, Trophy, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import type { GameCoupon } from '../types';

interface CarGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimCoupon: (coupon: GameCoupon) => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  type: 'car' | 'coin';
}

export function CarGameModal({ isOpen, onClose, onClaimCoupon }: CarGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gentouch_game_highscore') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wonCoupon, setWonCoupon] = useState<GameCoupon | null>(null);

  // Audio Context for Sound Effects
  const playSound = (type: 'coin' | 'crash' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'coin') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Game loop & physics references
  const gameRef = useRef({
    playerX: 155, // center lane
    playerY: 380,
    playerWidth: 44,
    playerHeight: 70,
    speed: 4.5,
    obstacles: [] as Obstacle[],
    roadOffset: 0,
    keys: { left: false, right: false },
    score: 0,
    animId: 0,
    spawnTimer: 0,
  });

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setWonCoupon(null);
    gameRef.current.playerX = 155;
    gameRef.current.speed = 4.5;
    gameRef.current.obstacles = [];
    gameRef.current.score = 0;
    gameRef.current.spawnTimer = 0;
  };

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CW = 360;
    const CH = 500;
    canvas.width = CW;
    canvas.height = CH;

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      const g = gameRef.current;

      // 1. Clear background
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, CW, CH);

      // 2. Draw Road Grass Borders
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, 35, CH);
      ctx.fillRect(CW - 35, 0, 35, CH);

      // 3. Draw Road Surface
      ctx.fillStyle = '#1c1f2b';
      ctx.fillRect(35, 0, CW - 70, CH);

      // Road boundary lines (Red neon)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(35, 0, 4, CH);
      ctx.fillRect(CW - 39, 0, 4, CH);

      // Road dash lines
      g.roadOffset = (g.roadOffset + (gameState === 'playing' ? g.speed : 1.5)) % 40;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let y = -40 + g.roadOffset; y < CH; y += 40) {
        ctx.fillRect(130, y, 6, 20);
        ctx.fillRect(225, y, 6, 20);
      }

      if (gameState === 'playing') {
        // Handle input
        if (g.keys.left && g.playerX > 45) {
          g.playerX -= 6;
        }
        if (g.keys.right && g.playerX < CW - 45 - g.playerWidth) {
          g.playerX += 6;
        }

        // Score increment
        g.score += 1;
        if (g.score % 10 === 0) {
          setScore(g.score);
        }

        // Increase speed slightly
        if (g.score > 0 && g.score % 200 === 0 && g.speed < 9) {
          g.speed += 0.4;
        }

        // Spawn obstacles & coins
        g.spawnTimer++;
        if (g.spawnTimer > Math.max(35, 75 - Math.floor(g.score / 60))) {
          g.spawnTimer = 0;
          const lanes = [55, 155, 255];
          const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
          const isCoin = Math.random() < 0.35;

          if (isCoin) {
            g.obstacles.push({
              x: chosenLane + 10,
              y: -40,
              width: 24,
              height: 24,
              speed: g.speed * 0.9,
              color: '#eab308',
              type: 'coin',
            });
          } else {
            const carColors = ['#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f97316'];
            g.obstacles.push({
              x: chosenLane,
              y: -80,
              width: 44,
              height: 70,
              speed: g.speed * (0.85 + Math.random() * 0.3),
              color: carColors[Math.floor(Math.random() * carColors.length)],
              type: 'car',
            });
          }
        }

        // Check Win Condition (Score reaches 1,000)
        if (g.score >= 1000 && !wonCoupon) {
          playSound('win');
          const coupon: GameCoupon = {
            code: 'TURBO30',
            discountAmount: 30,
            earnedDate: new Date().toISOString().split('T')[0],
            score: g.score,
            isUsed: false,
          };
          setWonCoupon(coupon);
          setGameState('won');
          if (g.score > highScore) {
            setHighScore(g.score);
            localStorage.setItem('gentouch_game_highscore', g.score.toString());
          }
        }

        // Update & Render Obstacles
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.y += obs.speed;

          // Draw obstacle
          if (obs.type === 'coin') {
            ctx.save();
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(obs.x + 12, obs.y + 12, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('৳', obs.x + 12, obs.y + 16);
            ctx.restore();
          } else {
            // Traffic Car
            ctx.save();
            ctx.fillStyle = obs.color;
            // Rounded body
            ctx.beginPath();
            ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
            ctx.fill();
            // Roof
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(obs.x + 6, obs.y + 18, obs.width - 12, obs.height - 36);
            // Headlights
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(obs.x + 4, obs.y + obs.height - 6, 8, 4);
            ctx.fillRect(obs.x + obs.width - 12, obs.y + obs.height - 6, 8, 4);
            ctx.restore();
          }

          // Collision Detection
          const padding = 6;
          if (
            g.playerX + padding < obs.x + obs.width - padding &&
            g.playerX + g.playerWidth - padding > obs.x + padding &&
            g.playerY + padding < obs.y + obs.height - padding &&
            g.playerY + g.playerHeight - padding > obs.y + padding
          ) {
            if (obs.type === 'coin') {
              // Collected Coin
              playSound('coin');
              g.score += 75;
              setScore(g.score);
              g.obstacles.splice(i, 1);
            } else {
              // Crashed
              playSound('crash');
              setGameState('gameover');
              if (g.score > highScore) {
                setHighScore(g.score);
                localStorage.setItem('gentouch_game_highscore', g.score.toString());
              }
              return;
            }
          }

          // Remove off-screen obstacles
          if (obs.y > CH + 50) {
            g.obstacles.splice(i, 1);
          }
        }
      }

      // Draw Player's GEN-TOUCH Supercar
      ctx.save();
      ctx.fillStyle = '#dc2626'; // Red Sports Car
      ctx.beginPath();
      ctx.roundRect(g.playerX, g.playerY, g.playerWidth, g.playerHeight, 10);
      ctx.fill();

      // Cockpit / Windshield
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(g.playerX + 5, g.playerY + 16, g.playerWidth - 10, 24, 4);
      ctx.fill();

      // Neon Headlights (Yellow/White beams)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(g.playerX + 4, g.playerY + 2, 8, 4);
      ctx.fillRect(g.playerX + g.playerWidth - 12, g.playerY + 2, 8, 4);

      // Tail lights
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(g.playerX + 4, g.playerY + g.playerHeight - 4, 8, 3);
      ctx.fillRect(g.playerX + g.playerWidth - 12, g.playerY + g.playerHeight - 4, 8, 3);

      // Spoiler
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(g.playerX + 2, g.playerY + g.playerHeight - 2, g.playerWidth - 4, 3);
      ctx.restore();

      g.animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      isRunning = false;
      cancelAnimationFrame(gameRef.current.animId);
    };
  }, [isOpen, gameState, soundEnabled, highScore, wonCoupon]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-[390px] bg-[#12141c] border border-red-900/40 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-600/30">
              GT
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1">
                Turbo Race <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </h3>
              <p className="text-[10px] text-gray-400">Score 1,000+ to win ৳30 discount!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-gray-400 hover:text-white bg-[#1a1d28] rounded-lg transition"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-[#1a1d28] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scoreboard Bar */}
        <div className="w-full flex items-center justify-between py-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-gray-300">
            <span>Score:</span>
            <span className="text-yellow-400 font-bold text-sm">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>High: <strong className="text-white">{highScore}</strong></span>
          </div>
        </div>

        {/* Canvas & Overlay Container */}
        <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-gray-800 bg-[#0f1117] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />

          {/* Idle / Start Overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20 animate-pulse">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">GEN-TOUCH Turbo Race</h4>
                <p className="text-xs text-gray-300 mt-1 max-w-[220px]">
                  Dodge traffic & collect golden ৳ coins! Reach 1,000 points to win an immediate ৳30 coupon!
                </p>
              </div>

              <button
                onClick={startGame}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" /> Start Race Now
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-500">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Crash! Game Over</h4>
                <p className="text-xs text-gray-400 mt-1">
                  You scored <strong className="text-yellow-400 font-mono text-sm">{score}</strong> points.
                </p>
                {score < 1000 && (
                  <p className="text-[11px] text-red-400 mt-1">
                    Need {1000 - score} more points for ৳30 discount!
                  </p>
                )}
              </div>

              <button
                onClick={startGame}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {/* Win Overlay (Unlocked ৳30 Coupon) */}
          {gameState === 'won' && wonCoupon && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-yellow-400">Congratulations!</h4>
                <p className="text-xs text-gray-200 mt-1">
                  You achieved 1,000+ points and won a ৳30 Discount Coupon!
                </p>
              </div>

              <div className="p-3 bg-[#1c202d] border border-yellow-500/40 rounded-xl w-full">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Your Coupon Code</span>
                <p className="text-lg font-black font-mono text-yellow-300 tracking-wider">
                  {wonCoupon.code}
                </p>
                <span className="text-[10px] text-green-400 font-medium">Flat ৳30 Off on Checkout</span>
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    onClaimCoupon(wonCoupon);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-lg shadow-green-600/30 transition active:scale-95"
                >
                  Apply & Open Cart
                </button>
                <button
                  onClick={startGame}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Screen Touch Controls */}
        <div className="w-full flex items-center justify-between gap-3 pt-3">
          <button
            onMouseDown={() => { gameRef.current.keys.left = true; }}
            onMouseUp={() => { gameRef.current.keys.left = false; }}
            onTouchStart={() => { gameRef.current.keys.left = true; }}
            onTouchEnd={() => { gameRef.current.keys.left = false; }}
            className="flex-1 py-2.5 bg-[#1a1e29] active:bg-red-600 text-white rounded-xl border border-gray-700 flex items-center justify-center font-bold text-xs gap-1 select-none"
          >
            <ChevronLeft className="w-4 h-4" /> Left
          </button>
          <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">Use Arrow Keys / A D</span>
          <button
            onMouseDown={() => { gameRef.current.keys.right = true; }}
            onMouseUp={() => { gameRef.current.keys.right = false; }}
            onTouchStart={() => { gameRef.current.keys.right = true; }}
            onTouchEnd={() => { gameRef.current.keys.right = false; }}
            className="flex-1 py-2.5 bg-[#1a1e29] active:bg-red-600 text-white rounded-xl border border-gray-700 flex items-center justify-center font-bold text-xs gap-1 select-none"
          >
            Right <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
export default CarGameModal;