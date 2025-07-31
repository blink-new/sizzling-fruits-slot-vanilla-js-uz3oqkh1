class SlotMachine3D {
    constructor() {
        this.credits = 1000;
        this.currentBet = 10;
        this.winAmount = 0;
        this.totalWinnings = 0;
        this.jackpotAmount = 5000;
        this.winStreak = 0;
        this.isSpinning = false;
        this.soundEnabled = true;
        this.turboMode = false;
        this.autoSpinCount = 0;
        this.autoSpinActive = false;
        
        // Enhanced 3D Fruit symbols with premium graphics
        this.symbols = [
            { name: 'cherry', value: 2, weight: 25, html: '<div class="fruit-3d cherry-3d"></div>' },
            { name: 'lemon', value: 3, weight: 20, html: '<div class="fruit-3d lemon-3d"></div>' },
            { name: 'orange', value: 4, weight: 18, html: '<div class="fruit-3d orange-3d"></div>' },
            { name: 'grape', value: 5, weight: 15, html: '<div class="fruit-3d grape-3d"><div class="grape-berry"></div><div class="grape-berry"></div><div class="grape-berry"></div><div class="grape-berry"></div><div class="grape-berry"></div><div class="grape-berry"></div><div class="grape-berry"></div></div>' },
            { name: 'watermelon', value: 8, weight: 12, html: '<div class="fruit-3d watermelon-3d"></div>' },
            { name: 'star', value: 15, weight: 8, html: '<div class="fruit-3d star-3d"></div>' },
            { name: 'bell', value: 25, weight: 5, html: '<div class="fruit-3d bell-3d"></div>' },
            { name: 'seven', value: 100, weight: 2, html: '<div class="fruit-3d seven-3d">7</div>' }
        ];
        
        this.reels = [];
        this.audioContext = null;
        this.sounds = {};
        this.winLines = [];
        
        this.init();
    }
    
    async init() {
        this.createBackground3D();
        this.createReels();
        this.setupEventListeners();
        this.setupEnhancedAudio();
        this.updateDisplay();
        this.startJackpotTimer();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1500);
    }
    
    createBackground3D() {
        const background = document.getElementById('background3d');
        
        // Create floating 3D cubes
        for (let i = 0; i < 25; i++) {
            const cube = document.createElement('div');
            cube.className = 'floating-cube';
            cube.style.left = Math.random() * 100 + '%';
            cube.style.animationDelay = Math.random() * 8 + 's';
            cube.style.animationDuration = (8 + Math.random() * 4) + 's';
            background.appendChild(cube);
        }
    }
    
    createReels() {
        const container = document.getElementById('reelsContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel${i}`;
            
            const reelStrip = document.createElement('div');
            reelStrip.className = 'reel-strip';
            
            // Create extended reel strip for smooth animation
            const reelSymbols = [];
            for (let j = 0; j < 25; j++) {
                const symbol = this.getRandomSymbol();
                reelSymbols.push(symbol);
            }
            
            reelSymbols.forEach((symbol, index) => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'symbol';
                symbolDiv.innerHTML = symbol.html;
                symbolDiv.dataset.symbol = symbol.name;
                symbolDiv.dataset.value = symbol.value;
                reelStrip.appendChild(symbolDiv);
            });
            
            reel.appendChild(reelStrip);
            container.appendChild(reel);
            this.reels.push({ element: reel, strip: reelStrip, symbols: reelSymbols });
        }
    }
    
    getRandomSymbol() {
        const totalWeight = this.symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const symbol of this.symbols) {
            random -= symbol.weight;
            if (random <= 0) {
                return symbol;
            }
        }
        
        return this.symbols[0];
    }
    
    setupEventListeners() {
        // Spin button
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        
        // Bet controls - Updated max bet to 100
        document.getElementById('betDown').addEventListener('click', () => this.adjustBet(-1));
        document.getElementById('betUp').addEventListener('click', () => this.adjustBet(1));
        document.getElementById('betMax').addEventListener('click', () => this.setMaxBet());
        
        // Turbo mode
        document.getElementById('turboBtn').addEventListener('click', () => this.toggleTurbo());
        
        // Auto spin
        document.getElementById('auto10').addEventListener('click', () => this.startAutoSpin(10));
        document.getElementById('auto25').addEventListener('click', () => this.startAutoSpin(25));
        document.getElementById('autoStop').addEventListener('click', () => this.stopAutoSpin());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Modal buttons
        document.getElementById('restartGame').addEventListener('click', () => this.restartGame());
        document.getElementById('jackpotContinue').addEventListener('click', () => this.closeJackpotModal());
        
        // Enhanced keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.spin();
            } else if (e.code === 'KeyT') {
                this.toggleTurbo();
            } else if (e.code === 'KeyA') {
                this.startAutoSpin(10);
            } else if (e.code === 'KeyS') {
                this.stopAutoSpin();
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                this.adjustBet(1);
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.adjustBet(-1);
            } else if (e.code === 'KeyM') {
                this.setMaxBet();
            }
        });
    }
    
    setupEnhancedAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createEnhancedSounds();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    createEnhancedSounds() {
        // Enhanced sound system with more variety
        this.sounds = {
            spin: () => this.playSpinSound(),
            reelStop: () => this.playTone(180, 0.08, 'square'),
            win: () => this.playWinSound(),
            bigWin: () => this.playBigWinSound(),
            megaWin: () => this.playMegaWinSound(),
            jackpot: () => this.playJackpotSound(),
            button: () => this.playTone(320, 0.04, 'sine'),
            turbo: () => this.playTurboSound(),
            coin: () => this.playCoinSound()
        };
    }
    
    playTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playSpinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Enhanced spinning sound with frequency sweep
        const duration = this.turboMode ? 0.8 : 1.5;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playWinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const frequencies = [262, 330, 392, 523, 659];
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.12), index * 80);
        });
    }
    
    playBigWinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const frequencies = [523, 659, 784, 1047, 1319];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.35, 'sine', 0.15);
                this.playTone(freq * 0.5, 0.35, 'triangle', 0.08);
            }, index * 120);
        });
    }
    
    playMegaWinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Epic win sound for massive wins
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.playTone(523 + (i * 60), 0.4, 'sine', 0.18);
                this.playTone(659 + (i * 60), 0.4, 'triangle', 0.12);
                this.playTone(392 + (i * 40), 0.4, 'square', 0.08);
            }, i * 100);
        }
    }
    
    playJackpotSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Ultimate jackpot fanfare
        for (let i = 0; i < 16; i++) {
            setTimeout(() => {
                this.playTone(523 + (i * 50), 0.3, 'sine', 0.2);
                this.playTone(659 + (i * 50), 0.3, 'triangle', 0.15);
                this.playTone(784 + (i * 50), 0.3, 'square', 0.1);
            }, i * 80);
        }
    }
    
    playTurboSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        this.playTone(400, 0.1, 'square', 0.1);
        setTimeout(() => this.playTone(600, 0.1, 'square', 0.1), 50);
    }
    
    playCoinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        this.playTone(800, 0.1, 'sine', 0.08);
        setTimeout(() => this.playTone(1000, 0.05, 'sine', 0.06), 30);
    }
    
    adjustBet(change) {
        if (this.isSpinning) return;
        
        // Updated max bet to 100
        this.currentBet = Math.max(1, Math.min(100, this.currentBet + change));
        this.updateDisplay();
        this.sounds.button();
    }
    
    setMaxBet() {
        if (this.isSpinning) return;
        
        // Updated max bet to 100
        this.currentBet = Math.min(100, this.credits);
        this.updateDisplay();
        this.sounds.button();
    }
    
    toggleTurbo() {
        this.turboMode = !this.turboMode;
        const turboBtn = document.getElementById('turboBtn');
        const turboIndicator = document.getElementById('turboIndicator');
        
        if (this.turboMode) {
            turboBtn.classList.add('active');
            turboIndicator.classList.add('active');
            this.sounds.turbo();
        } else {
            turboBtn.classList.remove('active');
            turboIndicator.classList.remove('active');
            this.sounds.button();
        }
    }
    
    startAutoSpin(count) {
        if (this.isSpinning) return;
        
        this.autoSpinCount = count;
        this.autoSpinActive = true;
        
        const autoIndicator = document.getElementById('autoIndicator');
        autoIndicator.classList.add('active');
        
        this.autoSpin();
        this.sounds.button();
    }
    
    stopAutoSpin() {
        this.autoSpinActive = false;
        this.autoSpinCount = 0;
        
        const autoIndicator = document.getElementById('autoIndicator');
        autoIndicator.classList.remove('active');
        
        this.updateDisplay();
        this.sounds.button();
    }
    
    async autoSpin() {
        if (!this.autoSpinActive || this.autoSpinCount <= 0) {
            this.stopAutoSpin();
            return;
        }
        
        await this.spin();
        
        if (this.autoSpinActive && this.autoSpinCount > 0) {
            const delay = this.turboMode ? 400 : 800;
            setTimeout(() => this.autoSpin(), delay);
        }
    }
    
    async spin() {
        if (this.isSpinning || this.credits < this.currentBet) {
            if (this.credits < this.currentBet) {
                this.showGameOverModal();
            }
            return;
        }
        
        this.isSpinning = true;
        this.credits -= this.currentBet;
        this.winAmount = 0;
        
        // Update UI
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.classList.add('spinning');
        spinBtn.disabled = true;
        
        this.updateDisplay();
        this.sounds.spin();
        
        // Clear previous win highlights and lines
        this.clearWinHighlights();
        this.clearWinLines();
        
        // Start reel animations
        const spinDuration = this.turboMode ? 800 : 1800;
        const results = await this.animateReels(spinDuration);
        
        // Check for wins
        const winData = this.checkWins(results);
        
        if (winData.totalWin > 0) {
            this.winAmount = winData.totalWin;
            this.credits += this.winAmount;
            this.totalWinnings += this.winAmount;
            this.winStreak++;
            
            // Enhanced win highlighting and sound effects
            this.highlightWins(winData.winningLines);
            this.showWinLines(winData.winningLines);
            this.createEnhancedParticleExplosion();
            
            // Play appropriate win sound based on amount
            if (this.winAmount >= 1000) {
                this.sounds.megaWin();
            } else if (this.winAmount >= 500) {
                this.sounds.bigWin();
            } else {
                this.sounds.win();
            }
            
            // Check for jackpot
            if (this.isJackpot(results)) {
                this.winJackpot();
            }
            
            // Play coin sounds for credits
            for (let i = 0; i < Math.min(5, Math.floor(this.winAmount / 50)); i++) {
                setTimeout(() => this.sounds.coin(), i * 100);
            }
        } else {
            this.winStreak = 0;
        }
        
        // Update display
        this.updateDisplay();
        
        // Reset spin button
        spinBtn.classList.remove('spinning');
        spinBtn.disabled = false;
        this.isSpinning = false;
        
        // Continue auto spin
        if (this.autoSpinActive) {
            this.autoSpinCount--;
        }
    }
    
    async animateReels(duration) {
        const results = [];
        const promises = [];
        
        this.reels.forEach((reel, index) => {
            const promise = new Promise((resolve) => {
                const strip = reel.strip;
                const finalSymbols = [];
                
                // Generate final result
                for (let i = 0; i < 3; i++) {
                    finalSymbols.push(this.getRandomSymbol());
                }
                
                // Enhanced reel animation
                reel.element.classList.add('spinning');
                
                let spinDistance = 0;
                const spinSpeed = this.turboMode ? 25 : 12;
                const targetDistance = duration * 0.12;
                
                const animate = () => {
                    spinDistance += spinSpeed;
                    strip.style.transform = `translateY(-${spinDistance}px)`;
                    
                    if (spinDistance < targetDistance) {
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation and show final result
                        setTimeout(() => {
                            this.showFinalResult(reel, finalSymbols, index);
                            resolve(finalSymbols);
                        }, index * (this.turboMode ? 80 : 150));
                    }
                };
                
                animate();
            });
            
            promises.push(promise);
        });
        
        const allResults = await Promise.all(promises);
        
        // Play reel stop sounds with staggered timing
        this.reels.forEach((_, index) => {
            setTimeout(() => {
                this.sounds.reelStop();
            }, index * (this.turboMode ? 80 : 150));
        });
        
        return allResults;
    }
    
    showFinalResult(reel, symbols, reelIndex) {
        const strip = reel.strip;
        strip.innerHTML = '';
        
        symbols.forEach((symbol, index) => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.innerHTML = symbol.html;
            symbolDiv.dataset.symbol = symbol.name;
            symbolDiv.dataset.value = symbol.value;
            symbolDiv.style.transform = `translateY(${index * 80}px)`;
            strip.appendChild(symbolDiv);
        });
        
        reel.element.classList.remove('spinning');
        strip.style.transform = 'translateY(0)';
    }
    
    checkWins(results) {
        const winningLines = [];
        let totalWin = 0;
        
        // Check horizontal lines (3 rows)
        for (let row = 0; row < 3; row++) {
            const line = [];
            for (let col = 0; col < 5; col++) {
                line.push(results[col][row]);
            }
            
            const lineWin = this.checkLine(line);
            if (lineWin.win > 0) {
                winningLines.push({ 
                    type: 'horizontal', 
                    row, 
                    symbols: lineWin.symbols, 
                    win: lineWin.win,
                    count: lineWin.count
                });
                totalWin += lineWin.win;
            }
        }
        
        // Check diagonal lines
        const diagonal1 = [results[0][0], results[1][1], results[2][2], results[3][1], results[4][0]];
        const diagonal2 = [results[0][2], results[1][1], results[2][0], results[3][1], results[4][2]];
        
        const diag1Win = this.checkLine(diagonal1);
        if (diag1Win.win > 0) {
            winningLines.push({ 
                type: 'diagonal', 
                diagonal: 1, 
                symbols: diag1Win.symbols, 
                win: diag1Win.win,
                count: diag1Win.count
            });
            totalWin += diag1Win.win;
        }
        
        const diag2Win = this.checkLine(diagonal2);
        if (diag2Win.win > 0) {
            winningLines.push({ 
                type: 'diagonal', 
                diagonal: 2, 
                symbols: diag2Win.symbols, 
                win: diag2Win.win,
                count: diag2Win.count
            });
            totalWin += diag2Win.win;
        }
        
        return { totalWin, winningLines };
    }
    
    checkLine(line) {
        const symbolCounts = {};
        line.forEach(symbol => {
            symbolCounts[symbol.name] = (symbolCounts[symbol.name] || 0) + 1;
        });
        
        let bestWin = 0;
        let winningSymbol = null;
        let winCount = 0;
        
        for (const [symbolName, count] of Object.entries(symbolCounts)) {
            if (count >= 3) {
                const symbol = this.symbols.find(s => s.name === symbolName);
                let multiplier = 1;
                
                if (count === 4) multiplier = 4;
                else if (count === 5) multiplier = 15;
                
                const win = symbol.value * this.currentBet * multiplier;
                if (win > bestWin) {
                    bestWin = win;
                    winningSymbol = symbolName;
                    winCount = count;
                }
            }
        }
        
        return { win: bestWin, symbols: winningSymbol, count: winCount };
    }
    
    isJackpot(results) {
        // Check if all symbols in any line are lucky 7s
        for (let row = 0; row < 3; row++) {
            let sevenCount = 0;
            for (let col = 0; col < 5; col++) {
                if (results[col][row].name === 'seven') {
                    sevenCount++;
                }
            }
            if (sevenCount === 5) return true;
        }
        return false;
    }
    
    winJackpot() {
        this.credits += this.jackpotAmount;
        this.totalWinnings += this.jackpotAmount;
        
        document.getElementById('jackpotWin').textContent = this.jackpotAmount.toLocaleString();
        document.getElementById('jackpotModal').classList.add('show');
        
        this.sounds.jackpot();
        this.jackpotAmount = 5000; // Reset jackpot
    }
    
    highlightWins(winningLines) {
        winningLines.forEach((line, index) => {
            setTimeout(() => {
                if (line.type === 'horizontal') {
                    // Horizontal line
                    for (let col = 0; col < 5; col++) {
                        const reel = this.reels[col];
                        const symbol = reel.strip.children[line.row];
                        if (symbol) symbol.classList.add('winning');
                    }
                } else if (line.type === 'diagonal') {
                    // Diagonal line
                    const positions = line.diagonal === 1 
                        ? [[0,0], [1,1], [2,2], [3,1], [4,0]]
                        : [[0,2], [1,1], [2,0], [3,1], [4,2]];
                    
                    positions.forEach(([col, row]) => {
                        const reel = this.reels[col];
                        const symbol = reel.strip.children[row];
                        if (symbol) symbol.classList.add('winning');
                    });
                }
            }, index * 150);
        });
    }
    
    showWinLines(winningLines) {
        const winLinesContainer = document.getElementById('winLines');
        
        winningLines.forEach((line, index) => {
            setTimeout(() => {
                const winLine = document.createElement('div');
                winLine.className = 'win-line active';
                
                if (line.type === 'horizontal') {
                    winLine.classList.add('horizontal');
                    winLine.style.top = `${50 + line.row * 80}px`;
                } else if (line.type === 'diagonal') {
                    winLine.classList.add('diagonal');
                    winLine.classList.add(`diagonal-${line.diagonal}`);
                    winLine.style.top = '50%';
                    winLine.style.transform = `translateY(-50%) ${line.diagonal === 1 ? 'rotate(12deg)' : 'rotate(-12deg)'}`;
                }
                
                winLinesContainer.appendChild(winLine);
                this.winLines.push(winLine);
                
                // Remove win line after animation
                setTimeout(() => {
                    if (winLine.parentNode) {
                        winLine.remove();
                    }
                }, 3000);
            }, index * 200);
        });
    }
    
    clearWinHighlights() {
        document.querySelectorAll('.symbol.winning').forEach(symbol => {
            symbol.classList.remove('winning');
        });
    }
    
    clearWinLines() {
        const winLinesContainer = document.getElementById('winLines');
        winLinesContainer.innerHTML = '';
        this.winLines = [];
    }
    
    createEnhancedParticleExplosion() {
        const container = document.querySelector('.slot-machine');
        const explosion = document.createElement('div');
        explosion.className = 'particle-explosion';
        explosion.style.left = '50%';
        explosion.style.top = '50%';
        
        // Create more particles for bigger wins
        const particleCount = Math.min(30, 15 + Math.floor(this.winAmount / 100));
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 120 + Math.random() * 150;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.left = '0';
            particle.style.top = '0';
            
            // Vary particle colors based on win amount
            if (this.winAmount >= 1000) {
                particle.style.background = ['#ffd93d', '#ff6b6b', '#ff9f43', '#2ed573'][Math.floor(Math.random() * 4)];
            } else if (this.winAmount >= 500) {
                particle.style.background = ['#ffd93d', '#ff9f43'][Math.floor(Math.random() * 2)];
            } else {
                particle.style.background = '#ffd93d';
            }
            
            explosion.appendChild(particle);
        }
        
        container.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 1500);
    }
    
    startJackpotTimer() {
        setInterval(() => {
            this.jackpotAmount += Math.floor(Math.random() * 15) + 5;
            document.getElementById('jackpotAmount').textContent = this.jackpotAmount.toLocaleString();
        }, 1500);
    }
    
    updateDisplay() {
        document.getElementById('credits').textContent = this.credits.toLocaleString();
        document.getElementById('currentBet').textContent = this.currentBet;
        document.getElementById('winAmount').textContent = this.winAmount.toLocaleString();
        document.getElementById('totalWinnings').textContent = this.totalWinnings.toLocaleString();
        document.getElementById('autoCount').textContent = this.autoSpinCount;
        document.getElementById('streakCount').textContent = this.winStreak;
        
        // Update streak indicator
        const streakIndicator = document.getElementById('streakIndicator');
        if (this.winStreak > 0) {
            streakIndicator.classList.add('active');
        } else {
            streakIndicator.classList.remove('active');
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
        
        if (this.soundEnabled) {
            this.sounds.button();
        }
    }
    
    showGameOverModal() {
        document.getElementById('finalWinnings').textContent = this.totalWinnings.toLocaleString();
        document.getElementById('gameOverModal').classList.add('show');
    }
    
    restartGame() {
        this.credits = 1000;
        this.currentBet = 10;
        this.winAmount = 0;
        this.totalWinnings = 0;
        this.winStreak = 0;
        this.stopAutoSpin();
        
        document.getElementById('gameOverModal').classList.remove('show');
        this.updateDisplay();
        this.clearWinHighlights();
        this.clearWinLines();
        
        this.sounds.button();
    }
    
    closeJackpotModal() {
        document.getElementById('jackpotModal').classList.remove('show');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new SlotMachine3D();
});