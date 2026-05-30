// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        // Initialize managers
        this.sceneManager = new SceneManager(this.canvas, this.ctx);
        this.uiManager = new UIManager();
        this.playerManager = new PlayerManager(this.sceneManager);
        this.inputController = new InputController();
        this.animationManager = new AnimationManager();
        
        // Make managers globally accessible
        window.UIManager = this.uiManager;
        window.gameInstance = this;
        window.DEBUG = true; // Set to false to hide hitboxes
        
        this.gameRunning = true;
        this.initialized = false;
        
        this.init();
    }
    
    async init() {
        console.log("Initializing game...");
        
        // Create fighters
        const player1Config = {
            ...CONFIG.fighter.player1,
            health: CONFIG.fighter.player1.health
        };
        const player2Config = {
            ...CONFIG.fighter.player2,
            health: CONFIG.fighter.player2.health
        };
        
        const player1 = this.playerManager.createPlayer('player1', player1Config, true);
        const player2 = this.playerManager.createPlayer('player2', player2Config, false);
        
        // Load sprites for Scorpion (Player 1)
        console.log("Loading Scorpion sprites...");
        await player1.loadSprites('scorpion');
        
        // For Player 2, you can either load Sub-Zero sprites or use same Scorpion
        // Create a copy of sprites for player2 or load different character
        player2.sprites = player1.sprites; // Share sprites for now
        player2.spritesLoaded = true;
        
        console.log("Sprites loaded!");
        
        // Start match
        this.playerManager.startMatch();
        
        // Start game loop
        this.gameRunning = true;
        this.initialized = true;
        this.gameLoop();
        
        // Log controls
        console.log("Game Ready! Controls:");
        console.log("Player 1: A/D - Move, W - Jump, F - Punch, G - Kick, S - Block");
        console.log("Player 2: Arrow Keys - Move, Up - Jump, . - Punch, / - Kick, Down - Block");
    }
    
    update() {
        if (!this.initialized || !this.playerManager.roundActive) return;
        
        // Get inputs
        const player1Inputs = this.inputController.getPlayer1Inputs();
        const player2Inputs = this.inputController.getPlayer2Inputs();
        
        // Set inputs for fighters
        const player1 = this.playerManager.getPlayer('player1');
        const player2 = this.playerManager.getPlayer('player2');
        
        player1.setInputs(player1Inputs);
        player2.setInputs(player2Inputs);
        
        // Update player manager (handles combat, physics, etc.)
        this.playerManager.update();
        
        // Update scene particles
        this.sceneManager.updateParticles();
        
        // Update UI
        this.uiManager.updateHealth('player1', player1.health, player1.maxHealth);
        this.uiManager.updateHealth('player2', player2.health, player2.maxHealth);
        
        // Add hit effects when attacks land
        if (player1.isAttacking && player1.attackTimer === 10) {
            this.addHitEffect(player1);
        }
        if (player2.isAttacking && player2.attackTimer === 10) {
            this.addHitEffect(player2);
        }
    }
    
    addHitEffect(attacker) {
        const target = attacker.id === 'player1' ? 
            this.playerManager.getPlayer('player2') : 
            this.playerManager.getPlayer('player1');
        
        const x = target.x + target.width / 2;
        const y = target.y + 50;
        
        for (let i = 0; i < 10; i++) {
            this.sceneManager.addParticle(x, y, 
                (Math.random() - 0.5) * 8, 
                (Math.random() - 0.5) * 8 - 2, 
                30, 
                '#ff6600');
        }
        this.sceneManager.shakeCamera(8, 150);
        
        // Play hit sound effect placeholder
        if (window.playHitSound) window.playHitSound();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render scene with fighters
        this.sceneManager.render({
            draw: (ctx) => {
                this.playerManager.draw(ctx, this.animationManager);
            }
        });
        
        // Draw additional UI elements on canvas
        this.drawCanvasUI();
    }
    
    drawCanvasUI() {
        const player1 = this.playerManager.getPlayer('player1');
        const player2 = this.playerManager.getPlayer('player2');
        
        if (!player1 || !player2) return;
        
        // Draw instruction text
        this.ctx.font = '12px "Courier New"';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillText('P1: A/D/W/F/G/S', 20, this.canvas.height - 20);
        this.ctx.fillText('P2: Arrows/./?/Down', this.canvas.width - 180, this.canvas.height - 20);
        
        // Debug info
        if (window.DEBUG) {
            this.ctx.font = '10px monospace';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(`P1 State: ${player1.state} Frame: ${player1.animationFrame}`, 20, 60);
            this.ctx.fillText(`P2 State: ${player2.state} Frame: ${player2.animationFrame}`, 20, 80);
            this.ctx.fillText(`P1 Pos: ${Math.floor(player1.x)} P2 Pos: ${Math.floor(player2.x)}`, 20, 100);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resetGame() {
        // Reset all game state
        this.playerManager.round = 1;
        this.playerManager.scores = { player1: 0, player2: 0 };
        this.playerManager.roundActive = true;
        
        const player1 = this.playerManager.getPlayer('player1');
        const player2 = this.playerManager.getPlayer('player2');
        
        player1.reset(CONFIG.fighter.player1.x);
        player2.reset(CONFIG.fighter.player2.x);
        player1.health = player1.maxHealth;
        player2.health = player2.maxHealth;
        
        this.inputController.reset();
        this.uiManager.stopTimer();
        this.playerManager.startMatch();
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    console.log("Page loaded, starting game...");
    new Game();
});