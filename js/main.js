/**
 * Main Entry Point
 * Initializes all systems and coordinates the game startup
 */
 (function() {
    'use strict';
    
    // Core instances
    let assetManager = null;
    let inputManager = null;
    let uiManager = null;
    let screenManager = null;
    let characterSelect = null;
    let gameEngine = null;
    
    // Register all assets for loading
    function registerAssets() {
        // Register character sprites
        for (const [charId, charData] of Object.entries(CharactersConfig)) {
            for (const [animType, url] of Object.entries(charData.sprites)) {
                const assetKey = `${charId}_${animType}`;
                assetManager.registerAsset(assetKey, url);
            }
        }
        
        // Register background assets
        assetManager.registerAsset('bg_far', BackgroundAssets.bgFar);
        assetManager.registerAsset('bg_mid', BackgroundAssets.bgMid);
        assetManager.registerAsset('bg_near', BackgroundAssets.bgNear);
        assetManager.registerAsset('ground', BackgroundAssets.ground);
        
        // Register parallax layers
        for (let i = 0; i < GameConfig.PARALLAX_LAYERS.length; i++) {
            assetManager.registerAsset(`bg_layer_${i}`, i === 0 ? BackgroundAssets.bgFar : 
                                       (i === 1 ? BackgroundAssets.bgMid : BackgroundAssets.bgNear));
        }
    }
    
    // Loading screen updates
    function updateLoadingProgress(percent) {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingBar) {
            loadingBar.style.width = `${percent}%`;
        }
        if (loadingText) {
            loadingText.textContent = `Loading assets... ${percent}%`;
        }
    }
    
    // Initialize game after loading
    async function initGame() {
        assetManager = new AssetManager();
        registerAssets();
        
        // Show loading screen
        screenManager = new ScreenManager();
        screenManager.showLoading(true);
        
        // Load all assets
        await assetManager.loadAll(updateLoadingProgress);
        
        // Initialize managers
        inputManager = new InputManager();
        uiManager = new UIManager();
        
        const canvas = document.getElementById('game-canvas');
        gameEngine = new GameEngine(canvas, assetManager, inputManager, uiManager, screenManager);
        
        setTimeout(() => {
            if (gameEngine) {
                gameEngine.resizeCanvas();
                gameEngine.render();
                console.log('Canvas resized and rendered');
            }
        }, 100);
        
        // Setup character select event
        characterSelect = new CharacterSelect();
        
        document.addEventListener('charactersSelected', (e) => {
            const { p1, p2 } = e.detail;
            gameEngine.initGame(p1, p2);
            gameEngine.start();
            screenManager.showScreen('game');
        });
        
        document.addEventListener('backToMenu', () => {
            screenManager.showScreen('menu');
            characterSelect.reset();
            if (gameEngine) gameEngine.stop();
        });
        
        document.addEventListener('gameQuit', () => {
            if (gameEngine) {
                gameEngine.stop();
                characterSelect.reset();
            }
        });
        
        document.addEventListener('gameRematch', () => {
            if (gameEngine) {
                gameEngine.rematch();
                gameEngine.start();
            }
        });

        document.addEventListener('gameResume', () => {
            if (gameEngine) {
                gameEngine.resume();
                screenManager.hideScreen('pause');
            }
        });
        
        document.addEventListener('gamePause', () => {
            if (gameEngine) {
                gameEngine.pause();
            }
        });
        
        // Hide loading, show menu
        setTimeout(() => {
            screenManager.showLoading(false);
            screenManager.showScreen('menu');
        }, 500);
    }
    
    // Start the application
    initGame().catch(console.error);
})();