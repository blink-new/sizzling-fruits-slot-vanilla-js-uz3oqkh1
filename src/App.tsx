import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

// Enhanced crypto-themed symbols with bonus features
const SYMBOLS = [
  { 
    id: 'bitcoin', 
    emoji: '₿', 
    color: '#F7931A',
    name: 'Bitcoin', 
    multiplier: 1, 
    weight: 35,
    bgColor: '#FFF3E0',
    rarity: 'common'
  },
  { 
    id: 'ethereum', 
    emoji: 'Ξ', 
    color: '#627EEA',
    name: 'Ethereum', 
    multiplier: 2, 
    weight: 25,
    bgColor: '#E8EAF6',
    rarity: 'common'
  },
  { 
    id: 'usdt', 
    emoji: '🪙', 
    color: '#26A17B',
    name: 'USDT', 
    multiplier: 2.5, 
    weight: 20,
    bgColor: '#E8F5E8',
    rarity: 'uncommon'
  },
  { 
    id: 'ai', 
    emoji: '🧠', 
    color: '#9C27B0',
    name: 'AI Coin', 
    multiplier: 3, 
    weight: 12,
    bgColor: '#F3E5F5',
    rarity: 'uncommon'
  },
  { 
    id: 'vault', 
    emoji: '🏦', 
    color: '#FF9800',
    name: 'Crypto Vault', 
    multiplier: 4, 
    weight: 5,
    bgColor: '#FFF8E1',
    rarity: 'rare'
  },
  { 
    id: 'rocket', 
    emoji: '🚀', 
    color: '#E91E63',
    name: 'Rocket', 
    multiplier: 5, 
    weight: 2.5,
    bgColor: '#FCE4EC',
    rarity: 'rare'
  },
  { 
    id: 'golden', 
    emoji: '👑', 
    color: '#FFD700',
    name: 'Golden Bitcoin', 
    multiplier: 10, 
    weight: 0.5,
    bgColor: '#FFFDE7',
    rarity: 'legendary'
  }
];

const PAYLINES = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row  
  [6, 7, 8], // Bottom row
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface GameStats {
  totalSpins: number;
  totalWins: number;
  totalWinAmount: number;
  biggestWin: number;
  winStreak: number;
  currentStreak: number;
  totalLosses: number;
  gamesPlayed: number;
}

interface GameState {
  balance: number;
  bet: number;
  lastWin: number;
  isSpinning: boolean;
  reels: string[][];
  winningLines: number[];
  winningPositions: number[];
  gameOver: boolean;
  autoSpinCount: number;
  isAutoSpinning: boolean;
  bonusMode: boolean;
  bonusSpinsLeft: number;
  multiplier: number;
  achievements: Achievement[];
  stats: GameStats;
  showStats: boolean;
  showAchievements: boolean;
  turboMode: boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: 'First Blood', description: 'Win your first spin', icon: '🎯', unlocked: false, progress: 0, target: 1 },
  { id: 'big_win', name: 'Big Winner', description: 'Win 500+ credits in a single spin', icon: '💰', unlocked: false, progress: 0, target: 1 },
  { id: 'mega_win', name: 'Mega Winner', description: 'Win 1000+ credits in a single spin', icon: '🏆', unlocked: false, progress: 0, target: 1 },
  { id: 'golden_touch', name: 'Golden Touch', description: 'Hit 5 Golden Bitcoins', icon: '👑', unlocked: false, progress: 0, target: 1 },
  { id: 'rocket_man', name: 'Rocket Man', description: 'Hit 5 Rocket scatters', icon: '🚀', unlocked: false, progress: 0, target: 1 },
  { id: 'spin_master', name: 'Spin Master', description: 'Complete 100 spins', icon: '🎰', unlocked: false, progress: 0, target: 100 },
  { id: 'win_streak', name: 'Hot Streak', description: 'Win 5 spins in a row', icon: '🔥', unlocked: false, progress: 0, target: 5 },
  { id: 'high_roller', name: 'High Roller', description: 'Bet max 50 times', icon: '💎', unlocked: false, progress: 0, target: 50 }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    balance: 1000,
    bet: 10,
    lastWin: 0,
    isSpinning: false,
    reels: Array(5).fill(null).map(() => Array(3).fill('bitcoin')),
    winningLines: [],
    winningPositions: [],
    gameOver: false,
    autoSpinCount: 0,
    isAutoSpinning: false,
    bonusMode: false,
    bonusSpinsLeft: 0,
    multiplier: 1,
    achievements: INITIAL_ACHIEVEMENTS,
    stats: {
      totalSpins: 0,
      totalWins: 0,
      totalWinAmount: 0,
      biggestWin: 0,
      winStreak: 0,
      currentStreak: 0,
      totalLosses: 0,
      gamesPlayed: 1
    },
    showStats: false,
    showAchievements: false,
    turboMode: false
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled, audioContext]);

  // Enhanced sound effects
  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Sound playback failed');
    }
  }, [soundEnabled, audioContext]);

  // Check and unlock achievements
  const checkAchievements = useCallback((winAmount: number, symbols: string[][]) => {
    setGameState(prev => {
      const newAchievements = [...prev.achievements];
      let hasNewAchievement = false;

      // First win
      if (winAmount > 0 && !newAchievements.find(a => a.id === 'first_win')?.unlocked) {
        const achievement = newAchievements.find(a => a.id === 'first_win');
        if (achievement) {
          achievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Big win
      if (winAmount >= 500 && !newAchievements.find(a => a.id === 'big_win')?.unlocked) {
        const achievement = newAchievements.find(a => a.id === 'big_win');
        if (achievement) {
          achievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Mega win
      if (winAmount >= 1000 && !newAchievements.find(a => a.id === 'mega_win')?.unlocked) {
        const achievement = newAchievements.find(a => a.id === 'mega_win');
        if (achievement) {
          achievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Golden Bitcoin achievement
      const goldenCount = symbols.flat().filter(s => s === 'golden').length;
      if (goldenCount >= 5) {
        const achievement = newAchievements.find(a => a.id === 'golden_touch');
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Rocket achievement
      const rocketCount = symbols.flat().filter(s => s === 'rocket').length;
      if (rocketCount >= 5) {
        const achievement = newAchievements.find(a => a.id === 'rocket_man');
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Spin master
      const spinAchievement = newAchievements.find(a => a.id === 'spin_master');
      if (spinAchievement) {
        spinAchievement.progress = prev.stats.totalSpins + 1;
        if (spinAchievement.progress >= spinAchievement.target && !spinAchievement.unlocked) {
          spinAchievement.unlocked = true;
          hasNewAchievement = true;
        }
      }

      // Win streak
      const streakAchievement = newAchievements.find(a => a.id === 'win_streak');
      if (streakAchievement && prev.stats.currentStreak >= 5 && !streakAchievement.unlocked) {
        streakAchievement.unlocked = true;
        hasNewAchievement = true;
      }

      if (hasNewAchievement) {
        // Play achievement sound
        setTimeout(() => {
          playSound(600, 0.5, 'sine');
          setTimeout(() => playSound(800, 0.5, 'sine'), 200);
        }, 100);
      }

      return { ...prev, achievements: newAchievements };
    });
  }, [playSound]);

  // Weighted random symbol selection with bonus mode consideration
  const getRandomSymbol = useCallback(() => {
    let symbols = [...SYMBOLS];
    
    // In bonus mode, increase rare symbol chances
    if (gameState.bonusMode) {
      symbols = symbols.map(symbol => ({
        ...symbol,
        weight: symbol.rarity === 'rare' || symbol.rarity === 'legendary' 
          ? symbol.weight * 2 
          : symbol.weight
      }));
    }

    const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of symbols) {
      random -= symbol.weight;
      if (random <= 0) {
        return symbol.id;
      }
    }
    return symbols[0].id;
  }, [gameState.bonusMode]);

  const playSpinSound = useCallback(() => {
    if (gameState.turboMode) {
      playSound(300, 0.05, 'triangle');
    } else {
      playSound(200, 0.1, 'triangle');
      setTimeout(() => playSound(250, 0.1, 'triangle'), 100);
      setTimeout(() => playSound(300, 0.1, 'triangle'), 200);
    }
  }, [playSound, gameState.turboMode]);

  const playWinSound = useCallback((winAmount: number) => {
    if (winAmount >= 1000) {
      // Mega win
      for (let i = 0; i < 8; i++) {
        setTimeout(() => playSound(500 + i * 50, 0.3, 'sine'), i * 80);
      }
    } else if (winAmount >= 500) {
      // Big win
      for (let i = 0; i < 5; i++) {
        setTimeout(() => playSound(400 + i * 100, 0.2, 'sine'), i * 100);
      }
    } else if (winAmount >= 100) {
      // Medium win
      playSound(400, 0.3, 'sine');
      setTimeout(() => playSound(500, 0.3, 'sine'), 150);
    } else {
      // Small win
      playSound(350, 0.2, 'sine');
    }
  }, [playSound]);

  const playLoseSound = useCallback(() => {
    playSound(150, 0.5, 'triangle');
  }, [playSound]);

  const playBonusSound = useCallback(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => playSound(400 + i * 100, 0.4, 'sine'), i * 100);
    }
  }, [playSound]);

  // Enhanced win detection with diagonal paylines
  const checkWins = useCallback((reels: string[][]) => {
    const winningLines: number[] = [];
    const winningPositions: number[] = [];
    let totalWin = 0;

    // Check all paylines (including diagonals)
    PAYLINES.forEach((payline, lineIndex) => {
      const symbols = payline.map(pos => {
        const reel = Math.floor(pos / 3);
        const row = pos % 3;
        return reels[reel][row];
      });

      // Check for consecutive matching symbols from left to right
      for (let matchLength = 5; matchLength >= 3; matchLength--) {
        const firstSymbol = symbols[0];
        let consecutive = 1;
        
        for (let i = 1; i < matchLength; i++) {
          if (symbols[i] === firstSymbol) {
            consecutive++;
          } else {
            break;
          }
        }

        if (consecutive === matchLength) {
          const symbol = SYMBOLS.find(s => s.id === firstSymbol);
          if (symbol) {
            let multiplier = symbol.multiplier * gameState.multiplier;
            if (matchLength === 4) multiplier *= 3;
            if (matchLength === 5) multiplier *= 8;
            
            const winAmount = gameState.bet * multiplier;
            totalWin += winAmount;
            winningLines.push(lineIndex);
            
            // Add winning positions
            for (let i = 0; i < matchLength; i++) {
              winningPositions.push(payline[i]);
            }
          }
          break;
        }
      }
    });

    // Check for scatter symbols (rockets) - any 3+ anywhere
    const rocketPositions: number[] = [];
    reels.forEach((reel, reelIndex) => {
      reel.forEach((symbol, rowIndex) => {
        if (symbol === 'rocket') {
          rocketPositions.push(reelIndex * 3 + rowIndex);
        }
      });
    });

    if (rocketPositions.length >= 3) {
      const rocketSymbol = SYMBOLS.find(s => s.id === 'rocket');
      if (rocketSymbol) {
        const scatterWin = gameState.bet * rocketSymbol.multiplier * rocketPositions.length * gameState.multiplier;
        totalWin += scatterWin;
        winningPositions.push(...rocketPositions);

        // Trigger bonus mode if 4+ rockets
        if (rocketPositions.length >= 4 && !gameState.bonusMode) {
          setGameState(prev => ({
            ...prev,
            bonusMode: true,
            bonusSpinsLeft: 10,
            multiplier: 2
          }));
          setTimeout(() => playBonusSound(), 500);
        }
      }
    }

    return { totalWin, winningLines, winningPositions };
  }, [gameState.bet, gameState.multiplier, gameState.bonusMode, playBonusSound]);

  // Enhanced spin function with turbo mode and bonus features
  const spin = useCallback(() => {
    if (gameState.isSpinning || (gameState.balance < gameState.bet && !gameState.bonusMode)) return;

    playSpinSound();

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      balance: prev.bonusMode ? prev.balance : prev.balance - prev.bet,
      lastWin: 0,
      winningLines: [],
      winningPositions: [],
      stats: {
        ...prev.stats,
        totalSpins: prev.stats.totalSpins + 1
      }
    }));

    // Turbo mode has faster animations
    const spinDuration = gameState.turboMode ? 1000 : 2500;
    const reelStopDelays = gameState.turboMode 
      ? [0, 100, 200, 300, 400]
      : [0, 300, 600, 900, 1200];
    
    const finalReels = Array(5).fill(null).map(() => 
      Array(3).fill(null).map(() => getRandomSymbol())
    );

    // Animate each reel separately
    reelStopDelays.forEach((delay, reelIndex) => {
      setTimeout(() => {
        setGameState(prev => {
          const newReels = [...prev.reels];
          newReels[reelIndex] = finalReels[reelIndex];
          return { ...prev, reels: newReels };
        });
      }, delay);
    });

    // Final result after all reels stop
    setTimeout(() => {
      const { totalWin, winningLines, winningPositions } = checkWins(finalReels);

      setGameState(prev => {
        const newStats = { ...prev.stats };
        let newBonusSpinsLeft = prev.bonusSpinsLeft;
        let newBonusMode = prev.bonusMode;
        let newMultiplier = prev.multiplier;

        if (totalWin > 0) {
          newStats.totalWins += 1;
          newStats.totalWinAmount += totalWin;
          newStats.biggestWin = Math.max(newStats.biggestWin, totalWin);
          newStats.currentStreak += 1;
          newStats.winStreak = Math.max(newStats.winStreak, newStats.currentStreak);
        } else {
          newStats.totalLosses += 1;
          newStats.currentStreak = 0;
        }

        // Handle bonus mode
        if (prev.bonusMode) {
          newBonusSpinsLeft -= 1;
          if (newBonusSpinsLeft <= 0) {
            newBonusMode = false;
            newMultiplier = 1;
          }
        }

        const newBalance = prev.balance + totalWin;
        const newGameOver = newBalance < prev.bet && !newBonusMode;

        return {
          ...prev,
          isSpinning: false,
          reels: finalReels,
          lastWin: totalWin,
          balance: newBalance,
          winningLines,
          winningPositions,
          gameOver: newGameOver,
          stats: newStats,
          bonusSpinsLeft: newBonusSpinsLeft,
          bonusMode: newBonusMode,
          multiplier: newMultiplier
        };
      });

      // Check achievements
      checkAchievements(totalWin, finalReels);

      // Play win/lose sound
      setTimeout(() => {
        if (totalWin > 0) {
          playWinSound(totalWin);
        } else {
          playLoseSound();
        }
      }, gameState.turboMode ? 100 : 300);

      // Handle auto-spin
      if (gameState.isAutoSpinning && gameState.autoSpinCount > 1) {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            autoSpinCount: prev.autoSpinCount - 1
          }));
          spin();
        }, gameState.turboMode ? 500 : 1500);
      } else if (gameState.isAutoSpinning) {
        setGameState(prev => ({
          ...prev,
          isAutoSpinning: false,
          autoSpinCount: 0
        }));
      }
    }, spinDuration);
  }, [gameState.isSpinning, gameState.balance, gameState.bet, gameState.bonusMode, gameState.turboMode, gameState.isAutoSpinning, gameState.autoSpinCount, getRandomSymbol, checkWins, playSpinSound, playWinSound, playLoseSound, checkAchievements]);

  // Auto-spin functionality
  const startAutoSpin = useCallback((count: number) => {
    setGameState(prev => ({
      ...prev,
      isAutoSpinning: true,
      autoSpinCount: count
    }));
    spin();
  }, [spin]);

  const stopAutoSpin = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isAutoSpinning: false,
      autoSpinCount: 0
    }));
  }, []);

  // Bet controls
  const adjustBet = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(1, Math.min(1000, prev.bet + amount))
    }));
  }, []);

  const setBetMax = useCallback(() => {
    setGameState(prev => {
      const newStats = { ...prev.stats };
      const maxBetAchievement = prev.achievements.find(a => a.id === 'high_roller');
      if (maxBetAchievement) {
        maxBetAchievement.progress += 1;
        if (maxBetAchievement.progress >= maxBetAchievement.target && !maxBetAchievement.unlocked) {
          maxBetAchievement.unlocked = true;
          setTimeout(() => {
            playSound(600, 0.5, 'sine');
            setTimeout(() => playSound(800, 0.5, 'sine'), 200);
          }, 100);
        }
      }

      return {
        ...prev,
        bet: 100,
        stats: newStats
      };
    });
  }, [playSound]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      balance: 1000,
      bet: 10,
      lastWin: 0,
      isSpinning: false,
      reels: Array(5).fill(null).map(() => Array(3).fill('bitcoin')),
      winningLines: [],
      winningPositions: [],
      gameOver: false,
      autoSpinCount: 0,
      isAutoSpinning: false,
      bonusMode: false,
      bonusSpinsLeft: 0,
      multiplier: 1,
      stats: {
        ...prev.stats,
        gamesPlayed: prev.stats.gamesPlayed + 1
      }
    }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (!gameState.isAutoSpinning) spin();
          break;
        case 'ArrowUp':
          event.preventDefault();
          adjustBet(5);
          break;
        case 'ArrowDown':
          event.preventDefault();
          adjustBet(-5);
          break;
        case 'KeyM':
          setBetMax();
          break;
        case 'KeyS':
          setSoundEnabled(prev => !prev);
          break;
        case 'KeyT':
          setGameState(prev => ({ ...prev, turboMode: !prev.turboMode }));
          break;
        case 'KeyA':
          if (!gameState.isAutoSpinning) {
            startAutoSpin(10);
          } else {
            stopAutoSpin();
          }
          break;
        case 'Escape':
          if (gameState.isAutoSpinning) stopAutoSpin();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spin, adjustBet, setBetMax, gameState.isAutoSpinning, startAutoSpin, stopAutoSpin]);

  // Enhanced symbol grid with crypto styling
  const symbolGrid = useMemo(() => {
    return gameState.reels.map((reel, reelIndex) =>
      reel.map((symbolId, rowIndex) => {
        const symbol = SYMBOLS.find(s => s.id === symbolId);
        const position = reelIndex * 3 + rowIndex;
        const isWinning = gameState.winningPositions.includes(position);
        
        return (
          <div
            key={`${reelIndex}-${rowIndex}`}
            className={`crypto-symbol ${isWinning ? 'winning' : ''} ${gameState.isSpinning ? 'spinning' : ''} ${symbol?.rarity}`}
            style={{
              backgroundColor: symbol?.bgColor,
              borderColor: symbol?.color,
              color: symbol?.color
            }}
          >
            <div className="symbol-content">
              <span className="symbol-emoji">{symbol?.emoji}</span>
              <span className="symbol-name">{symbol?.name}</span>
              <span className="symbol-multiplier">x{symbol?.multiplier}</span>
            </div>
            {isWinning && <div className="win-glow" />}
            {symbol?.rarity === 'legendary' && <div className="legendary-glow" />}
          </div>
        );
      })
    );
  }, [gameState.reels, gameState.winningPositions, gameState.isSpinning]);

  return (
    <div className="crypto-slot-machine">
      {/* Animated Crypto Background */}
      <div className="crypto-background">
        {Array.from({ length: 15 }, (_, i) => (
          <div 
            key={i} 
            className="floating-crypto-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }}
          >
            {SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].emoji}
          </div>
        ))}
      </div>

      {/* Header with enhanced info */}
      <header className="crypto-header">
        <h1 className="crypto-title">
          <span className="title-crypto">₿</span>
          CRYPTO SLOTS
          <span className="title-crypto">Ξ</span>
        </h1>
        <div className="header-info">
          <div className="balance-container">
            <div className="balance-display">
              <span className="balance-label">BALANCE</span>
              <span className="balance-amount">{gameState.balance.toLocaleString()}</span>
              <span className="balance-currency">CREDITS</span>
            </div>
          </div>
          
          {/* Bonus Mode Indicator */}
          {gameState.bonusMode && (
            <div className="bonus-indicator">
              <span className="bonus-text">BONUS MODE</span>
              <span className="bonus-spins">{gameState.bonusSpinsLeft} FREE SPINS</span>
              <span className="bonus-multiplier">{gameState.multiplier}x MULTIPLIER</span>
            </div>
          )}

          {/* Stats and Achievement Buttons */}
          <div className="header-buttons">
            <button 
              className="crypto-button header-button"
              onClick={() => setGameState(prev => ({ ...prev, showStats: !prev.showStats }))}
            >
              📊 STATS
            </button>
            <button 
              className="crypto-button header-button"
              onClick={() => setGameState(prev => ({ ...prev, showAchievements: !prev.showAchievements }))}
            >
              🏆 ACHIEVEMENTS
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="crypto-game-main">
        {/* Reels Container */}
        <div className="crypto-reels-container">
          <div className="crypto-reels-grid">
            {symbolGrid.map((reel, reelIndex) => (
              <div key={reelIndex} className="crypto-reel">
                {reel}
              </div>
            ))}
          </div>

          {/* Enhanced Win Lines */}
          {gameState.winningLines.map(lineIndex => (
            <div 
              key={lineIndex} 
              className={`crypto-win-line crypto-win-line-${lineIndex}`}
            />
          ))}
        </div>

        {/* Enhanced Win Display */}
        {gameState.lastWin > 0 && (
          <div className="crypto-win-display">
            <div className="win-explosion">
              {Array.from({ length: Math.min(20, Math.floor(gameState.lastWin / 50) + 5) }, (_, i) => (
                <div key={i} className="win-particle" />
              ))}
            </div>
            <span className="win-text">
              {gameState.lastWin >= 1000 ? 'MEGA WIN!' : 
               gameState.lastWin >= 500 ? 'BIG WIN!' : 'WIN!'}
            </span>
            <span className="win-amount">+{gameState.lastWin.toLocaleString()}</span>
            {gameState.multiplier > 1 && (
              <span className="win-multiplier">{gameState.multiplier}x MULTIPLIER</span>
            )}
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="crypto-controls">
          <div className="bet-section">
            <div className="bet-controls">
              <button 
                className="crypto-button bet-button"
                onClick={() => adjustBet(-5)}
                disabled={gameState.isSpinning || gameState.isAutoSpinning}
              >
                BET -
              </button>
              <div className="bet-display">
                <span className="bet-label">BET</span>
                <span className="bet-amount">{gameState.bet}</span>
              </div>
              <button 
                className="crypto-button bet-button"
                onClick={() => adjustBet(5)}
                disabled={gameState.isSpinning || gameState.isAutoSpinning}
              >
                BET +
              </button>
            </div>

            <button 
              className="crypto-button bet-max-button"
              onClick={setBetMax}
              disabled={gameState.isSpinning || gameState.isAutoSpinning}
            >
              BET MAX
            </button>
          </div>

          {/* Auto Spin Controls */}
          <div className="auto-spin-section">
            {!gameState.isAutoSpinning ? (
              <>
                <button 
                  className="crypto-button auto-spin-button"
                  onClick={() => startAutoSpin(10)}
                  disabled={gameState.isSpinning || gameState.balance < gameState.bet}
                >
                  AUTO 10
                </button>
                <button 
                  className="crypto-button auto-spin-button"
                  onClick={() => startAutoSpin(25)}
                  disabled={gameState.isSpinning || gameState.balance < gameState.bet}
                >
                  AUTO 25
                </button>
              </>
            ) : (
              <button 
                className="crypto-button stop-auto-button"
                onClick={stopAutoSpin}
              >
                STOP AUTO ({gameState.autoSpinCount})
              </button>
            )}
          </div>

          <button 
            className={`crypto-spin-button ${gameState.isSpinning ? 'spinning' : ''} ${gameState.isAutoSpinning ? 'auto-spinning' : ''}`}
            onClick={spin}
            disabled={gameState.isSpinning || (gameState.balance < gameState.bet && !gameState.bonusMode)}
          >
            <span className="spin-text">
              {gameState.isAutoSpinning ? `AUTO (${gameState.autoSpinCount})` :
               gameState.isSpinning ? 'SPINNING...' : 
               gameState.bonusMode ? 'FREE SPIN' : 'SPIN'}
            </span>
            <div className="spin-glow" />
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="feature-toggles">
          <button 
            className={`crypto-button feature-toggle ${gameState.turboMode ? 'active' : ''}`}
            onClick={() => setGameState(prev => ({ ...prev, turboMode: !prev.turboMode }))}
          >
            ⚡ TURBO
          </button>
          <button 
            className="crypto-button feature-toggle"
            onClick={() => setSoundEnabled(prev => !prev)}
          >
            {soundEnabled ? '🔊' : '🔇'} SOUND
          </button>
        </div>
      </main>

      {/* Stats Panel */}
      {gameState.showStats && (
        <div className="crypto-stats-panel">
          <div className="stats-content">
            <h3>📊 GAME STATISTICS</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Spins</span>
                <span className="stat-value">{gameState.stats.totalSpins}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Wins</span>
                <span className="stat-value">{gameState.stats.totalWins}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">
                  {gameState.stats.totalSpins > 0 
                    ? `${((gameState.stats.totalWins / gameState.stats.totalSpins) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Won</span>
                <span className="stat-value">{gameState.stats.totalWinAmount.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Biggest Win</span>
                <span className="stat-value">{gameState.stats.biggestWin.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Streak</span>
                <span className="stat-value">{gameState.stats.winStreak}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Streak</span>
                <span className="stat-value">{gameState.stats.currentStreak} 🔥</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{gameState.stats.gamesPlayed}</span>
              </div>
            </div>
            <button 
              className="crypto-button close-panel-button"
              onClick={() => setGameState(prev => ({ ...prev, showStats: false }))}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Achievements Panel */}
      {gameState.showAchievements && (
        <div className="crypto-achievements-panel">
          <div className="achievements-content">
            <h3>🏆 ACHIEVEMENTS</h3>
            <div className="achievements-grid">
              {gameState.achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div className="achievement-info">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-description">{achievement.description}</span>
                    {!achievement.unlocked && achievement.progress > 0 && (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && <span className="achievement-check">✓</span>}
                </div>
              ))}
            </div>
            <button 
              className="crypto-button close-panel-button"
              onClick={() => setGameState(prev => ({ ...prev, showAchievements: false }))}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Symbol Legend */}
      <div className="crypto-legend">
        <h3 className="legend-title">CRYPTO SYMBOL VALUES</h3>
        <div className="legend-grid">
          {SYMBOLS.map(symbol => (
            <div key={symbol.id} className={`legend-item ${symbol.rarity}`} style={{ borderColor: symbol.color }}>
              <span className="legend-symbol" style={{ color: symbol.color }}>
                {symbol.emoji}
              </span>
              <div className="legend-info">
                <span className="legend-name">{symbol.name}</span>
                <span className="legend-multiplier" style={{ color: symbol.color }}>
                  x{symbol.multiplier}
                </span>
                <span className="legend-rarity">{symbol.rarity}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="legend-note">
          <p>🚀 Rocket = Scatter Symbol (wins anywhere!) | 4+ Rockets = Bonus Mode!</p>
          <p>3 symbols = base payout | 4 symbols = 3x | 5 symbols = 8x</p>
          <p>Bonus Mode: 10 free spins with 2x multiplier!</p>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="crypto-game-over">
          <div className="game-over-content">
            <h2>GAME OVER</h2>
            <p>Your crypto wallet is empty!</p>
            <div className="final-stats">
              <p>Total Spins: {gameState.stats.totalSpins}</p>
              <p>Total Won: {gameState.stats.totalWinAmount.toLocaleString()}</p>
              <p>Biggest Win: {gameState.stats.biggestWin.toLocaleString()}</p>
            </div>
            <button className="crypto-button reset-button" onClick={resetGame}>
              RESTART TRADING
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Controls Help */}
      <div className="crypto-controls-help">
        <p><strong>Controls:</strong> Space = Spin | ↑↓ = Bet | M = Max | A = Auto | T = Turbo | S = Sound | ESC = Stop Auto</p>
      </div>
    </div>
  );
};

export default App;