/**
 * GameEngine - Core game loop and main coordination
 */
 class GameEngine {
    constructor(canvas, assetManager, inputManager, uiManager, screenManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assets = assetManager;
        this.input = inputManager;
        this.ui = uiManager;
        this.screenManager = screenManager;
        
        this.camera = null;
        this.effects = null;
        this.fighters = [];
        this.gameStateManager = null;
        
        this.lastTimestamp = 0;
        this.animationId = null;
        this.isRunning = false;
        this.isPaused = false;
        
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        this.canvas.width = window.GameConfig.CANVAS_WIDTH;
        this.canvas.height = window.GameConfig.CANVAS_HEIGHT;
        this.camera = new Camera(this.canvas.width, this.canvas.height, window.GameConfig.WORLD_WIDTH);
        this.effects = new EffectManager();
        this.gameStateManager = new GameStateManager();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }
    
    setupEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            }
        });
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;
            
            // Update camera dimensions
            if (this.camera) {
                this.camera.canvasWidth = this.canvas.width;
                this.camera.canvasHeight = this.canvas.height;
            }
            
            // Force re-render
            if (this.isRunning) {
                this.render();
            }
        }
    }
    
    initGame(p1CharId, p2CharId) {
        console.log('Initializing game with:', p1CharId, p2CharId);
        
        const p1Config = window.CharactersConfig[p1CharId];
        const p2Config = window.CharactersConfig[p2CharId];
        
        const p1Char = new window.CharacterData(p1Config);
        const p2Char = new window.CharacterData(p2Config);
        
        const startX1 = 400;
        const startX2 = 700;
        const groundY = window.GameConfig.GROUND_Y;
        const fighterHeight = window.GameConfig.FIGHTER_HEIGHT;
        
        this.fighters = [
            new Fighter('PLAYER1', p1Char, startX1, groundY - fighterHeight, true),
            new Fighter('PLAYER2', p2Char, startX2, groundY - fighterHeight, false)
        ];
        
        this.camera.reset();
        this.effects.clear();
        this.isPaused = false;
        if (this.gameStateManager) {
            this.gameStateManager.setState('fighting');
        }
        
        // Initial render
        this.render();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    pause() {
        if (!this.isRunning) return;
        this.isPaused = true;
        if (this.gameStateManager) {
            this.gameStateManager.setState('paused');
        }
        console.log('Game paused');
    }
    
    resume() {
        if (!this.isRunning) return;
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        if (this.gameStateManager) {
            this.gameStateManager.setState('fighting');
        }
        console.log('Game resumed');
        // Force re-render
        this.render();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        let deltaTime = Math.min(100, now - this.lastTimestamp);
        this.lastTimestamp = now;
        
        // ALWAYS update input first
        if (this.input) {
            this.input.update();
        }
        
        if (!this.isPaused && this.gameStateManager && this.gameStateManager.isFighting()) {
            this.update(deltaTime);
        }
        
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTimeMs) {
        if (!this.input || !this.fighters.length) return;
        
        // Update input first
        this.input.update();
        
        const p1 = this.fighters[0];
        const p2 = this.fighters[1];
        
        // Update both fighters
        if (p1 && !p1.isDead) {
            p1.update(deltaTimeMs, this.input, p2, this.effects);
        }
        
        if (p2 && !p2.isDead) {
            p2.update(deltaTimeMs, this.input, p1, this.effects);
        }
        
        // Update camera
        if (this.camera && p1 && p2) {
            this.camera.update(p1, p2);
        }
        
        // Update effects
        if (this.effects) {
            this.effects.update(deltaTimeMs / 1000);
        }
        
        // Update UI
        if (this.ui && p1 && p2) {
            this.ui.updateHealth(p1.character, p2.character);
            this.ui.updateCooldowns(p1.character, p2.character);
        }
        
        this.checkGameOver();
    }
    
    checkGameOver() {
        if (!this.fighters.length >= 2) return;
        const p1 = this.fighters[0];
        const p2 = this.fighters[1];
        
        if (!p1.character.isAlive()) {
            if (this.gameStateManager) this.gameStateManager.setState('gameOver');
            if (this.ui) this.ui.showVictory(p2.character.name);
            this.isPaused = true;
        } else if (!p2.character.isAlive()) {
            if (this.gameStateManager) this.gameStateManager.setState('gameOver');
            if (this.ui) this.ui.showVictory(p1.character.name);
            this.isPaused = true;
        }
    }
    
    render() {
        if (!this.ctx || !this.camera) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#0a0515';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background with parallax
        this.camera.drawParallaxBackground(this.ctx, this.assets);
        
        // Apply camera transform for game objects
        this.camera.apply(this.ctx);
        
        // Draw ground line
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, window.GameConfig.GROUND_Y - 3, window.GameConfig.WORLD_WIDTH, 3);
        
        // Draw fighters
        if (this.fighters && this.fighters.length >= 2) {
            this.fighters.forEach((fighter) => {
                if (fighter) {
                    fighter.draw(this.ctx, this.assets, this.camera);
                }
            });
        }
        
        // Draw effects
        if (this.effects) {
            this.effects.draw(this.ctx, this.camera);
        }
        
        // Restore camera transform
        this.camera.restore(this.ctx);
        
        // Draw pause indicator if paused
        if (this.isPaused && this.gameStateManager && this.gameStateManager.getState() !== 'gameOver') {
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
            this.ctx.shadowBlur = 0;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }
    
    rematch() {
        if (this.fighters.length >= 2) {
            const p1CharId = this.fighters[0].character.id;
            const p2CharId = this.fighters[1].character.id;
            this.initGame(p1CharId, p2CharId);
        }
        if (this.camera) this.camera.reset();
        if (this.effects) this.effects.clear();
        if (this.gameStateManager) this.gameStateManager.setState('fighting');
        if (this.ui) this.ui.hideVictory();
        this.isPaused = false;
        this.start();
    }
}