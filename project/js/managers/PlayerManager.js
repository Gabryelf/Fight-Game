// Player Manager
class PlayerManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.players = new Map();
        this.activePlayer = null;
        this.round = 1;
        this.scores = { player1: 0, player2: 0 };
        this.roundActive = true;
        this.roundTimer = CONFIG.game.roundTime;
        this.timerInterval = null;
    }
    
    createPlayer(id, config, isPlayer1) {
        const fighter = new Fighter(id, config, isPlayer1);
        this.players.set(id, fighter);
        return fighter;
    }
    
    getPlayer(id) {
        return this.players.get(id);
    }
    
    update() {
        if (!this.roundActive) return;
        
        const player1 = this.players.get('player1');
        const player2 = this.players.get('player2');
        
        if (!player1 || !player2) return;
        
        // Update fighters
        player1.update();
        player2.update();
        
        // Check hits
        this.checkHits(player1, player2);
        this.checkHits(player2, player1);
        
        // Check round end
        if (player1.health <= 0 || player2.health <= 0) {
            this.endRound();
        }
    }
    
    checkHits(attacker, defender) {
        if (attacker.checkHit(defender)) {
            const isDead = defender.takeDamage(attacker.damage, attacker);
            
            // Visual feedback
            if (window.UIManager) {
                window.UIManager.showDamageNumber(defender.x, defender.y, attacker.damage);
            }
            
            if (isDead) {
                this.handleDefeat(defender.id);
            }
        }
    }
    
    handleDefeat(loserId) {
        this.roundActive = false;
        const winnerId = loserId === 'player1' ? 'player2' : 'player1';
        this.scores[winnerId]++;
        
        // Show victory message
        const winner = this.players.get(winnerId);
        winner.state = 'victory';
        
        if (window.UIManager) {
            const message = `${winner.name} WINS!`;
            window.UIManager.showGameMessage(message);
        }
        
        // Check for match win
        if (this.scores[winnerId] >= CONFIG.game.victoryRounds) {
            this.endMatch(winnerId);
        } else {
            setTimeout(() => this.nextRound(), 3000);
        }
    }
    
    endRound() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    nextRound() {
        this.round++;
        this.roundActive = true;
        this.roundTimer = CONFIG.game.roundTime;
        
        // Reset fighters
        const player1 = this.players.get('player1');
        const player2 = this.players.get('player2');
        
        player1.reset(CONFIG.fighter.player1.x);
        player2.reset(CONFIG.fighter.player2.x);
        
        if (window.UIManager) {
            window.UIManager.updateRound(this.round);
            window.UIManager.startTimer(this.roundTimer, (time) => {
                this.roundTimer = time;
                if (time <= 0) {
                    this.handleTimeout();
                }
            });
        }
    }
    
    handleTimeout() {
        if (!this.roundActive) return;
        
        this.roundActive = false;
        const player1 = this.players.get('player1');
        const player2 = this.players.get('player2');
        
        // Determine winner by health
        let winnerId;
        if (player1.health > player2.health) {
            winnerId = 'player1';
        } else if (player2.health > player1.health) {
            winnerId = 'player2';
        } else {
            // Draw - player1 wins by default (can be changed)
            winnerId = 'player1';
        }
        
        this.scores[winnerId]++;
        
        if (window.UIManager) {
            const winner = this.players.get(winnerId);
            window.UIManager.showGameMessage(`TIME OVER! ${winner.name} WINS!`);
        }
        
        if (this.scores[winnerId] >= CONFIG.game.victoryRounds) {
            this.endMatch(winnerId);
        } else {
            setTimeout(() => this.nextRound(), 3000);
        }
    }
    
    endMatch(winnerId) {
        const winner = this.players.get(winnerId);
        if (window.UIManager) {
            window.UIManager.showGameMessage(`${winner.name} WINS THE MATCH!`);
            window.UIManager.showGameOver(winnerId);
        }
        this.roundActive = false;
    }
    
    startMatch() {
        this.round = 1;
        this.scores = { player1: 0, player2: 0 };
        this.roundActive = true;
        this.roundTimer = CONFIG.game.roundTime;
        
        const player1 = this.players.get('player1');
        const player2 = this.players.get('player2');
        
        player1.reset(CONFIG.fighter.player1.x);
        player2.reset(CONFIG.fighter.player2.x);
        
        if (window.UIManager) {
            window.UIManager.updateRound(this.round);
            window.UIManager.startTimer(this.roundTimer, (time) => {
                this.roundTimer = time;
                if (time <= 0 && this.roundActive) {
                    this.handleTimeout();
                }
            });
        }
    }
    
    draw(ctx, animationManager) {
        const player1 = this.players.get('player1');
        const player2 = this.players.get('player2');
        
        player1.draw(ctx, animationManager);
        player2.draw(ctx, animationManager);
    }
}