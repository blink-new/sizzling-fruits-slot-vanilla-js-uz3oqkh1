// Sizzling Fruits Slot Machine - 3D Premium Casino Game
class SlotMachine {
    constructor() {
        // Game state
        this.credits = 1000;
        this.currentBet = 10;
        this.totalWinnings = 0;
        this.winStreak = 0;
        this.jackpot = 5000;
        this.isSpinning = false;
        this.autoSpinCount = 0;
        this.autoSpinActive = false;
        this.turboMode = false;
        this.soundEnabled = true;
        
        // Game symbols with 3D emojis and weights
        this.symbols = [
            { emoji: '🍒', name: 'cherry', weight: 25, payout: { 3: 5, 4: 15, 5: 50 } },
            { emoji: '🍋', name: 'lemon', weight: 20, payout: { 3: 8, 4: 20, 5: 75 } },
            { emoji: '🍊', name: 'orange', weight: 18, payout: { 3: 10, 4: 25, 5: 100 } },
            { emoji: '🍇', name: 'grape', weight: 15, payout: { 3: 15, 4: 40, 5: 150 } },
            { emoji: '🍉', name: 'watermelon', weight: 12, payout: { 3: 20, 4: 60, 5: 200 } },
            { emoji: '⭐', name: 'star', weight: 8, payout: { 3: 50, 4: 150, 5: 500 } },
            { emoji: '🔔', name: 'bell', weight: 5, payout: { 3: 75, 4: 200, 5: 750 } },
            { emoji: '7️⃣', name: 'seven', weight: 2, payout: { 3: 200, 4: 1000, 5: 'JACKPOT' } }
        ];
        
        // Create weighted symbol pool
        this.symbolPool = [];
        this.symbols.forEach(symbol => {
            for (let i = 0; i < symbol.weight; i++) {
                this.symbolPool.push(symbol);
            }
        });
        
        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.createReels();
        this.bindEvents();
        this.updateDisplay();
        this.startJackpotTimer();
        this.createBackgroundEffects();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createReels() {
        const reelsContainer = document.getElementById('reelsContainer');
        reelsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel${i}`;
            
            const reelStrip = document.createElement('div');
            reelStrip.className = 'reel-strip';
            
            // Create extended symbol strip for smooth animation
            for (let j = 0; j < 20; j++) {
                const symbol = this.getRandomSymbol();
                const symbolElement = document.createElement('div');
                symbolElement.className = `symbol ${symbol.name}`;
                symbolElement.textContent = symbol.emoji;
                symbolElement.dataset.symbol = symbol.name;
                reelStrip.appendChild(symbolElement);
            }
            
            reel.appendChild(reelStrip);
            reelsContainer.appendChild(reel);
        }
    }
    
    getRandomSymbol() {
        return this.symbolPool[Math.floor(Math.random() * this.symbolPool.length)];
    }
    
    bindEvents() {
        // Spin button
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        
        // Bet controls
        document.getElementById('betDown').addEventListener('click', () => this.adjustBet(-1));
        document.getElementById('betUp').addEventListener('click', () => this.adjustBet(1));
        document.getElementById('betMax').addEventListener('click', () => this.setBetMax());
        
        // Auto spin controls
        document.getElementById('auto10').addEventListener('click', () => this.startAutoSpin(10));
        document.getElementById('auto25').addEventListener('click', () => this.startAutoSpin(25));
        document.getElementById('autoStop').addEventListener('click', () => this.stopAutoSpin());
        
        // Turbo mode
        document.getElementById('turboBtn').addEventListener('click', () => this.toggleTurbo());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Modal controls
        document.getElementById('restartGame').addEventListener('click', () => this.restartGame());
        document.getElementById('jackpotContinue').addEventListener('click', () => this.hideModal('jackpotModal'));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.spin();
            } else if (e.code === 'KeyA') {
                this.startAutoSpin(10);
            } else if (e.code === 'KeyS') {
                this.stopAutoSpin();
            } else if (e.code === 'KeyT') {
                this.toggleTurbo();
            }
        });
    }
    
    adjustBet(change) {
        const newBet = this.currentBet + change;
        if (newBet >= 1 && newBet <= Math.min(100, this.credits)) {
            this.currentBet = newBet;
            this.updateDisplay();
            this.playSound(400, 0.1);
        }
    }
    
    setBetMax() {
        this.currentBet = Math.min(100, this.credits);
        this.updateDisplay();
        this.playSound(600, 0.2);
    }
    
    toggleTurbo() {
        this.turboMode = !this.turboMode;
        const turboBtn = document.getElementById('turboBtn');
        const turboIndicator = document.getElementById('turboIndicator');
        
        if (this.turboMode) {
            turboBtn.classList.add('active');
            turboIndicator.classList.add('active');
            this.playSound(800, 0.3);
        } else {
            turboBtn.classList.remove('active');
            turboIndicator.classList.remove('active');
            this.playSound(400, 0.2);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundBtn.classList.toggle('muted', !this.soundEnabled);
    }
    
    startAutoSpin(count) {
        this.autoSpinCount = count;
        this.autoSpinActive = true;
        document.getElementById('autoIndicator').classList.add('active');
        this.updateAutoSpinDisplay();
        this.playSound(500, 0.3);
        
        if (!this.isSpinning) {
            this.spin();
        }
    }
    
    stopAutoSpin() {
        this.autoSpinActive = false;
        this.autoSpinCount = 0;
        document.getElementById('autoIndicator').classList.remove('active');
        this.updateAutoSpinDisplay();
        this.playSound(300, 0.2);
    }
    
    updateAutoSpinDisplay() {
        document.getElementById('autoCount').textContent = this.autoSpinCount;
    }
    
    async spin() {
        if (this.isSpinning || this.credits < this.currentBet) {
            return;
        }
        
        this.isSpinning = true;
        this.credits -= this.currentBet;
        
        // Update UI
        document.getElementById('spinBtn').classList.add('spinning');
        document.getElementById('winAmount').textContent = '0';
        this.clearWinEffects();
        
        // Play spin sound
        this.playSpinSound();
        
        // Animate reels
        const spinDuration = this.turboMode ? 1000 : 2000;
        const results = await this.animateReels(spinDuration);
        
        // Check for wins
        const winData = this.checkWins(results);
        
        if (winData.totalWin > 0) {
            this.handleWin(winData);
        } else {
            this.handleLoss();
        }
        
        this.isSpinning = false;
        document.getElementById('spinBtn').classList.remove('spinning');
        this.updateDisplay();
        
        // Handle auto spin
        if (this.autoSpinActive && this.autoSpinCount > 0) {
            this.autoSpinCount--;
            this.updateAutoSpinDisplay();
            
            if (this.autoSpinCount === 0) {
                this.stopAutoSpin();
            } else if (this.credits >= this.currentBet) {
                setTimeout(() => this.spin(), this.turboMode ? 500 : 1000);
            } else {
                this.stopAutoSpin();
            }
        }
        
        // Check game over
        if (this.credits < 1) {
            setTimeout(() => this.showGameOver(), 1000);
        }
    }
    
    playSpinSound() {
        if (!this.soundEnabled) return;
        
        // Create spinning sound effect
        const duration = this.turboMode ? 1.0 : 2.0;
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.playSound(200 + i * 50, 0.1, 'square');
            }, i * (duration * 100));
        }
    }
    
    async animateReels(duration) {
        const reels = document.querySelectorAll('.reel');
        const results = [];
        
        // Start spinning animation
        reels.forEach(reel => {
            reel.classList.add('spinning');
            const strip = reel.querySelector('.reel-strip');
            strip.style.transition = 'none';
            strip.style.transform = 'translateY(0px)';
        });
        
        // Generate final results
        for (let i = 0; i < 5; i++) {
            const reelResult = [];
            for (let j = 0; j < 3; j++) {
                reelResult.push(this.getRandomSymbol());
            }
            results.push(reelResult);
        }
        
        // Stop reels with staggered timing
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    this.stopReel(i, results[i]);
                    this.playSound(300 + i * 100, 0.2);
                    resolve();
                }, (duration / 5) * (i + 1));
            });
        }
        
        return results;
    }
    
    stopReel(reelIndex, symbols) {
        const reel = document.getElementById(`reel${reelIndex}`);
        const strip = reel.querySelector('.reel-strip');
        
        // Clear existing symbols
        strip.innerHTML = '';
        
        // Add buffer symbols above
        for (let i = 0; i < 2; i++) {
            const bufferSymbol = this.getRandomSymbol();
            const symbolElement = document.createElement('div');
            symbolElement.className = `symbol ${bufferSymbol.name}`;
            symbolElement.textContent = bufferSymbol.emoji;
            symbolElement.dataset.symbol = bufferSymbol.name;
            strip.appendChild(symbolElement);
        }
        
        // Add visible symbols
        symbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = `symbol ${symbol.name}`;
            symbolElement.textContent = symbol.emoji;
            symbolElement.dataset.symbol = symbol.name;
            strip.appendChild(symbolElement);
        });
        
        // Add buffer symbols below
        for (let i = 0; i < 2; i++) {
            const bufferSymbol = this.getRandomSymbol();
            const symbolElement = document.createElement('div');
            symbolElement.className = `symbol ${bufferSymbol.name}`;
            symbolElement.textContent = bufferSymbol.emoji;
            symbolElement.dataset.symbol = bufferSymbol.name;
            strip.appendChild(symbolElement);
        }
        
        // Animate to final position
        strip.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        strip.style.transform = 'translateY(-164px)'; // Position to show middle 3 symbols
        
        reel.classList.remove('spinning');
    }
    
    checkWins(results) {
        const winData = {
            lines: [],
            totalWin: 0,
            isJackpot: false
        };
        
        // Check horizontal lines
        for (let row = 0; row < 3; row++) {
            const line = [];
            for (let col = 0; col < 5; col++) {
                line.push(results[col][row]);
            }
            
            const lineWin = this.checkLine(line);
            if (lineWin.win > 0) {
                winData.lines.push({
                    type: 'horizontal',
                    row: row,
                    symbols: lineWin.count,
                    symbol: lineWin.symbol,
                    win: lineWin.win,
                    isJackpot: lineWin.isJackpot
                });
                winData.totalWin += lineWin.win;
                if (lineWin.isJackpot) {
                    winData.isJackpot = true;
                }
            }
        }
        
        // Check diagonal lines
        const diagonals = [
            [results[0][0], results[1][1], results[2][2], results[3][1], results[4][0]], // Top-left to bottom-right
            [results[0][2], results[1][1], results[2][0], results[3][1], results[4][2]]  // Bottom-left to top-right
        ];
        
        diagonals.forEach((line, index) => {
            const lineWin = this.checkLine(line);
            if (lineWin.win > 0) {
                winData.lines.push({
                    type: 'diagonal',
                    index: index,
                    symbols: lineWin.count,
                    symbol: lineWin.symbol,
                    win: lineWin.win,
                    isJackpot: lineWin.isJackpot
                });
                winData.totalWin += lineWin.win;
                if (lineWin.isJackpot) {
                    winData.isJackpot = true;
                }
            }
        });
        
        return winData;
    }
    
    checkLine(line) {
        const symbolCounts = {};
        
        // Count consecutive symbols from left
        let consecutiveCount = 1;
        let currentSymbol = line[0].name;
        
        for (let i = 1; i < line.length; i++) {
            if (line[i].name === currentSymbol) {
                consecutiveCount++;
            } else {
                break;
            }
        }
        
        if (consecutiveCount >= 3) {
            const symbol = this.symbols.find(s => s.name === currentSymbol);
            const payout = symbol.payout[consecutiveCount];
            
            if (payout === 'JACKPOT') {
                return {
                    win: this.jackpot,
                    count: consecutiveCount,
                    symbol: currentSymbol,
                    isJackpot: true
                };
            } else if (payout) {
                return {
                    win: payout * this.currentBet,
                    count: consecutiveCount,
                    symbol: currentSymbol,
                    isJackpot: false
                };
            }
        }
        
        return { win: 0, count: 0, symbol: null, isJackpot: false };
    }
    
    handleWin(winData) {
        this.credits += winData.totalWin;
        this.totalWinnings += winData.totalWin;
        this.winStreak++;
        
        // Update display
        document.getElementById('winAmount').textContent = winData.totalWin;
        document.getElementById('streakCount').textContent = this.winStreak;
        document.getElementById('streakIndicator').classList.add('active');
        
        // Show win effects
        this.showWinEffects(winData);
        
        // Play win sound
        if (winData.isJackpot) {
            this.playJackpotSound();
            this.showJackpot(winData.totalWin);
            this.resetJackpot();
        } else if (winData.totalWin >= 100) {
            this.playBigWinSound();
        } else {
            this.playWinSound();
        }
        
        // Create particle effects
        this.createWinParticles(winData.totalWin);
    }
    
    handleLoss() {
        this.winStreak = 0;
        document.getElementById('streakCount').textContent = '0';
        document.getElementById('streakIndicator').classList.remove('active');
        this.playSound(150, 0.5, 'sawtooth');
    }
    
    showWinEffects(winData) {
        // Highlight winning symbols
        winData.lines.forEach(line => {
            if (line.type === 'horizontal') {
                this.highlightHorizontalLine(line.row, line.symbols);
            } else if (line.type === 'diagonal') {
                this.highlightDiagonalLine(line.index, line.symbols);
            }
        });
        
        // Show win lines
        this.showWinLines(winData.lines);
    }
    
    highlightHorizontalLine(row, symbolCount) {
        for (let col = 0; col < symbolCount; col++) {
            const reel = document.getElementById(`reel${col}`);
            const symbols = reel.querySelectorAll('.symbol');
            const targetSymbol = symbols[row + 2]; // Offset for buffer symbols
            if (targetSymbol) {
                targetSymbol.classList.add('winning');
            }
        }
    }
    
    highlightDiagonalLine(diagonalIndex, symbolCount) {
        const positions = diagonalIndex === 0 
            ? [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]]  // Top-left to bottom-right
            : [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]]; // Bottom-left to top-right
        
        for (let i = 0; i < symbolCount; i++) {
            const [col, row] = positions[i];
            const reel = document.getElementById(`reel${col}`);
            const symbols = reel.querySelectorAll('.symbol');
            const targetSymbol = symbols[row + 2]; // Offset for buffer symbols
            if (targetSymbol) {
                targetSymbol.classList.add('winning');
            }
        }
    }
    
    showWinLines(lines) {
        const winLinesContainer = document.getElementById('winLines');
        winLinesContainer.innerHTML = '';
        
        lines.forEach(line => {
            const winLine = document.createElement('div');
            winLine.className = 'win-line';
            
            if (line.type === 'horizontal') {
                winLine.style.top = `${30 + line.row * 80}%`;
                winLine.style.left = '10%';
                winLine.style.width = `${line.symbols * 18}%`;
            }
            // Add diagonal line positioning logic here if needed
            
            winLinesContainer.appendChild(winLine);
        });
    }
    
    clearWinEffects() {
        // Remove winning class from all symbols
        document.querySelectorAll('.symbol.winning').forEach(symbol => {
            symbol.classList.remove('winning');
        });
        
        // Clear win lines
        document.getElementById('winLines').innerHTML = '';
    }
    
    createWinParticles(winAmount) {
        const bonusEffects = document.getElementById('bonusEffects');
        const particleCount = Math.min(20, Math.floor(winAmount / 10));
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle-explosion';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
                particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 200}px`);
                
                bonusEffects.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }, i * 50);
        }
    }
    
    playWinSound() {
        if (!this.soundEnabled) return;
        this.playSound(523, 0.2); // C5
        setTimeout(() => this.playSound(659, 0.2), 100); // E5
        setTimeout(() => this.playSound(784, 0.3), 200); // G5
    }
    
    playBigWinSound() {
        if (!this.soundEnabled) return;
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playSound(523 + i * 100, 0.3);
            }, i * 100);
        }
    }
    
    playJackpotSound() {
        if (!this.soundEnabled) return;
        const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playSound(note, 0.5);
            }, index * 200);
        });
    }
    
    showJackpot(amount) {
        document.getElementById('jackpotWin').textContent = amount;
        this.showModal('jackpotModal');
    }
    
    showGameOver() {
        document.getElementById('finalWinnings').textContent = this.totalWinnings;
        this.showModal('gameOverModal');
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    restartGame() {
        this.credits = 1000;
        this.currentBet = 10;
        this.totalWinnings = 0;
        this.winStreak = 0;
        this.jackpot = 5000;
        this.stopAutoSpin();
        this.updateDisplay();
        this.hideModal('gameOverModal');
        this.clearWinEffects();
    }
    
    updateDisplay() {
        document.getElementById('credits').textContent = this.credits;
        document.getElementById('currentBet').textContent = this.currentBet;
        document.getElementById('totalWinnings').textContent = this.totalWinnings;
        document.getElementById('jackpotAmount').textContent = this.jackpot.toLocaleString();
    }
    
    startJackpotTimer() {
        setInterval(() => {
            this.jackpot += Math.floor(Math.random() * 5) + 1;
            document.getElementById('jackpotAmount').textContent = this.jackpot.toLocaleString();
        }, 3000);
    }
    
    resetJackpot() {
        this.jackpot = 5000;
    }
    
    createBackgroundEffects() {
        // Create floating particles
        const particlesContainer = document.querySelector('.background-particles');
        
        setInterval(() => {
            if (document.querySelectorAll('.floating-particle').length < 10) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)]};
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: 100%;
                    animation: floatUp 8s linear forwards;
                    pointer-events: none;
                `;
                
                particlesContainer.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 8000);
            }
        }, 500);
        
        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachine();
});