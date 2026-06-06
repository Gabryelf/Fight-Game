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
    let musicManager = null;
    
    // Register all assets for loading
    function registerAssets() {
        if (!assetManager) return;
        
        // Register character sprites
        if (typeof CharactersConfig !== 'undefined') {
            for (const [charId, charData] of Object.entries(CharactersConfig)) {
                if (charData.sprites) {
                    for (const [animType, url] of Object.entries(charData.sprites)) {
                        const assetKey = `${charId}_${animType}`;
                        assetManager.registerAsset(assetKey, url);
                    }
                }
            }
        }
        
        // Register background assets
        if (typeof BackgroundAssets !== 'undefined') {
            if (BackgroundAssets.bgFar) assetManager.registerAsset('bg_far', BackgroundAssets.bgFar);
            if (BackgroundAssets.bgMid) assetManager.registerAsset('bg_mid', BackgroundAssets.bgMid);
            if (BackgroundAssets.bgNear) assetManager.registerAsset('bg_near', BackgroundAssets.bgNear);
            if (BackgroundAssets.ground) assetManager.registerAsset('ground', BackgroundAssets.ground);
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
            loadingText.textContent = `Loading assets... ${Math.floor(percent)}%`;
        }
    }
    
    // Initialize game after loading
    async function initGame() {
        console.log('Initializing game...');
        
        // 1. Initialize Music Manager
        if (typeof MusicManager !== 'undefined') {
            musicManager = new MusicManager();
            musicManager.init();
            
            if (typeof GameConfig !== 'undefined' && GameConfig.DEFAULT_MUSIC_URL) {
                musicManager.setDefaultMusicUrl(GameConfig.DEFAULT_MUSIC_URL);
                musicManager.setVolume(GameConfig.MUSIC_VOLUME || 0.5);
            }
        } else {
            console.warn('MusicManager not found');
        }
        
        // 2. Initialize Asset Manager
        if (typeof AssetManager !== 'undefined') {
            assetManager = new AssetManager();
            registerAssets();
        } else {
            console.error('AssetManager not found!');
            return;
        }
        
        // 3. Initialize Screen Manager
        if (typeof ScreenManager !== 'undefined') {
            screenManager = new ScreenManager();
            screenManager.showLoading(true);
        } else {
            console.error('ScreenManager not found!');
            return;
        }
        
        // 4. Load all assets
        if (assetManager && typeof assetManager.loadAll === 'function') {
            await assetManager.loadAll(updateLoadingProgress);
        }
        
        // 5. Initialize other managers
        if (typeof InputManager !== 'undefined') {
            inputManager = new InputManager();
        }
        
        if (typeof UIManager !== 'undefined') {
            uiManager = new UIManager();
        }
        
        // 6. Initialize Game Engine
        const canvas = document.getElementById('game-canvas');
        if (canvas && typeof GameEngine !== 'undefined') {
            gameEngine = new GameEngine(canvas, assetManager, inputManager, uiManager, screenManager);
            
            setTimeout(() => {
                if (gameEngine && typeof gameEngine.resizeCanvas === 'function') {
                    gameEngine.resizeCanvas();
                }
            }, 100);
        }
        
        // 7. Setup character select
        if (typeof CharacterSelect !== 'undefined') {
            characterSelect = new CharacterSelect();
        }
        
        // 8. Setup event listeners
        setupEventListeners();
        
        // 9. Setup music controls
        setupMusicControls();
        
        // 10. Start menu music
        if (musicManager && typeof musicManager.playGameMusic === 'function') {
            setTimeout(() => {
                musicManager.playGameMusic();
            }, 100);
        }
        
        // 11. Hide loading, show menu
        setTimeout(() => {
            if (screenManager) {
                screenManager.showLoading(false);
                if (typeof screenManager.showScreen === 'function') {
                    screenManager.showScreen('menu');
                }
            }
        }, 500);
    }
    
    // Setup music UI controls
    function setupMusicControls() {
        if (!musicManager) return;
        
        const muteBtn = document.getElementById('mute-music-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = musicManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇 MUSIC OFF' : '🔊 MUSIC ON';
            });
        }
        
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = musicManager.getVolume() * 100;
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                musicManager.setVolume(volume);
                const volumeValue = document.getElementById('volume-value');
                if (volumeValue) {
                    volumeValue.textContent = `${e.target.value}%`;
                }
            });
        }
    }
    
    // Setup all game event listeners
    function setupEventListeners() {
        // Character selection completed
        document.addEventListener('charactersSelected', (e) => {
            const { p1, p2 } = e.detail;
            if (gameEngine && typeof gameEngine.initGame === 'function') {
                gameEngine.initGame(p1, p2);
                gameEngine.start();
            }
            if (screenManager && typeof screenManager.showScreen === 'function') {
                screenManager.showScreen('game');
            }
        });
        
        // Back to menu
        document.addEventListener('backToMenu', () => {
            if (screenManager && typeof screenManager.showScreen === 'function') {
                screenManager.showScreen('menu');
            }
            if (characterSelect && typeof characterSelect.reset === 'function') {
                characterSelect.reset();
            }
            if (gameEngine && typeof gameEngine.stop === 'function') {
                gameEngine.stop();
            }
            if (musicManager && typeof musicManager.playGameMusic === 'function') {
                musicManager.playGameMusic();
            }
        });
        
        // Game quit
        document.addEventListener('gameQuit', () => {
            if (gameEngine && typeof gameEngine.stop === 'function') {
                gameEngine.stop();
            }
            if (characterSelect && typeof characterSelect.reset === 'function') {
                characterSelect.reset();
            }
            if (musicManager && typeof musicManager.fadeOut === 'function') {
                musicManager.fadeOut(1000);
            }
            setTimeout(() => {
                if (musicManager && typeof musicManager.playGameMusic === 'function') {
                    musicManager.playGameMusic();
                }
            }, 1100);
        });
        
        // Game rematch
        document.addEventListener('gameRematch', () => {
            if (gameEngine && typeof gameEngine.rematch === 'function') {
                gameEngine.rematch();
            }
        });
        
        // Game resume
        document.addEventListener('gameResume', () => {
            if (gameEngine && typeof gameEngine.resume === 'function') {
                gameEngine.resume();
            }
            if (screenManager && typeof screenManager.hideScreen === 'function') {
                screenManager.hideScreen('pause');
            }
            if (musicManager && typeof musicManager.resumeBackgroundMusic === 'function') {
                musicManager.resumeBackgroundMusic();
            }
        });
        
        // Game pause
        document.addEventListener('gamePause', () => {
            if (gameEngine && typeof gameEngine.pause === 'function') {
                gameEngine.pause();
            }
            if (musicManager && typeof musicManager.pauseBackgroundMusic === 'function') {
                musicManager.pauseBackgroundMusic();
            }
        });
    }
    
    // Start the application
    initGame().catch(error => {
        console.error('Failed to initialize game:', error);
    });
})();
