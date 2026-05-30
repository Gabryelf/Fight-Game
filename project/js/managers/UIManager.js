// UI Manager
class UIManager {
    constructor() {
        this.healthBars = {
            player1: document.getElementById('player1Health'),
            player2: document.getElementById('player2Health')
        };
        this.timerElement = document.getElementById('timer');
        this.roundIndicator = document.getElementById('roundIndicator');
        this.gameMessage = document.getElementById('gameMessage');
        
        this.timer = null;
        this.currentTime = 0;
        this.onTimerUpdate = null;
        
        this.damageNumbers = [];
    }
    
    updateHealth(playerId, health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        if (this.healthBars[playerId]) {
            this.healthBars[playerId].style.width = `${percentage}%`;
            
            // Change color based on health
            if (percentage < 30) {
                this.healthBars[playerId].style.background = 'linear-gradient(90deg, #ff6600, #ff0000)';
            } else if (percentage < 60) {
                this.healthBars[playerId].style.background = 'linear-gradient(90deg, #ffcc00, #ff6600)';
            } else {
                this.healthBars[playerId].style.background = 'linear-gradient(90deg, #ff0000, #cc0000)';
            }
        }
    }
    
    startTimer(initialTime, onUpdate) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.currentTime = initialTime;
        this.onTimerUpdate = onUpdate;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateTimerDisplay();
                if (this.onTimerUpdate) {
                    this.onTimerUpdate(this.currentTime);
                }
            } else {
                this.stopTimer();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateTimerDisplay() {
        if (this.timerElement) {
            this.timerElement.textContent = this.currentTime;
            
            // Blink when time is low
            if (this.currentTime <= 10) {
                this.timerElement.style.animation = 'blink 0.5s infinite';
            } else {
                this.timerElement.style.animation = 'none';
            }
        }
    }
    
    updateRound(round) {
        if (this.roundIndicator) {
            this.roundIndicator.textContent = `ROUND ${round}`;
            this.roundIndicator.style.animation = 'fadeInOut 1s';
            setTimeout(() => {
                this.roundIndicator.style.animation = '';
            }, 1000);
        }
    }
    
    showGameMessage(message) {
        if (this.gameMessage) {
            this.gameMessage.textContent = message;
            this.gameMessage.style.display = 'block';
            this.gameMessage.classList.remove('fade-out');
            
            setTimeout(() => {
                this.gameMessage.classList.add('fade-out');
                setTimeout(() => {
                    this.gameMessage.style.display = 'none';
                }, 2000);
            }, 2000);
        }
    }
    
    showDamageNumber(x, y, damage) {
        const damageNumber = {
            x: x,
            y: y,
            value: damage,
            life: 60,
            id: Date.now() + Math.random()
        };
        this.damageNumbers.push(damageNumber);
        
        // Create DOM element for damage number
        const div = document.createElement('div');
        div.className = 'damage-number';
        div.textContent = damage;
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.color = '#ff0';
        div.style.fontSize = '24px';
        div.style.fontWeight = 'bold';
        div.style.textShadow = '2px 2px 0 #000';
        div.style.pointerEvents = 'none';
        div.style.zIndex = '200';
        
        document.querySelector('.game-container').appendChild(div);
        
        setTimeout(() => {
            div.style.animation = 'floatUp 1s forwards';
            setTimeout(() => div.remove(), 1000);
        }, 10);
    }
    
    showGameOver(winnerId) {
        const message = winnerId === 'player1' ? 'PLAYER 1 VICTORY!' : 'PLAYER 2 VICTORY!';
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h1>${message}</h1>
                <button id="rematchBtn">REMATCH</button>
            </div>
        `;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';
        
        document.querySelector('.game-container').appendChild(overlay);
        
        document.getElementById('rematchBtn').onclick = () => {
            overlay.remove();
            if (window.gameInstance) {
                window.gameInstance.resetGame();
            }
        };
    }
    
    updateUI(player1, player2, round, time) {
        this.updateHealth('player1', player1.health, player1.maxHealth);
        this.updateHealth('player2', player2.health, player2.maxHealth);
        this.updateRound(round);
        if (time !== undefined) {
            this.currentTime = time;
            this.updateTimerDisplay();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(1); }
    }
    
    @keyframes floatUp {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-50px); }
    }
    
    .damage-number {
        position: absolute;
        font-family: monospace;
        pointer-events: none;
        animation: floatUp 1s forwards;
    }
    
    .game-over-overlay button {
        background: linear-gradient(135deg, #ff0, #ff6600);
        color: #000;
        border: none;
        padding: 15px 30px;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        border-radius: 5px;
        margin-top: 20px;
        transition: transform 0.2s;
    }
    
    .game-over-overlay button:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);