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
        // Register character sprites
        for (const [charId, charData] of Object.entries(CharactersConfig)) {
            for (const [animType, url] of Object.entries(charData.sprites)) {
                const assetKey = `${charId}_${animType}`;
                assetManager.registerAsset(assetKey, url);
            }
        }
        
        // Register background assets
        if (typeof BackgroundAssets !== 'undefined') {
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
    
    // Initialize music controls
    function initMusicControls() {
        if (!musicManager) {
            console.warn('MusicManager not available');
            return;
        }
        
        // Add mute button listener if exists
        const muteBtn = document.getElementById('mute-music-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = musicManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇 MUSIC OFF' : '🔊 MUSIC ON';
            });
        }
        
        // Add volume slider if exists
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
    
    // Initialize game after loading
    async function initGame() {
        console.log('Initializing game...');
        
        // Initialize Music Manager with error handling
        try {
            if (typeof MusicManager !== 'undefined') {
                musicManager = new MusicManager();
                musicManager.init();
                
                if (typeof GameConfig !== 'undefined' && GameConfig.DEFAULT_MUSIC_URL) {
                    if (typeof musicManager.setDefaultMusicUrl === 'function') {
                        musicManager.setDefaultMusicUrl(GameConfig.DEFAULT_MUSIC_URL);
                        musicManager.setVolume(GameConfig.MUSIC_VOLUME || 0.5);
                    } else {
                        console.warn('setDefaultMusicUrl method not found, using direct play');
                        // Direct approach if method doesn't exist
                        musicManager.defaultMusicUrl = GameConfig.DEFAULT_MUSIC_URL;
                    }
                }
            } else {
                console.warn('MusicManager class not found, creating fallback');
                musicManager = createFallbackMusicManager();
            }
        } catch (error) {
            console.error('Error initializing MusicManager:', error);
            musicManager = createFallbackMusicManager();
        }
        
        // Initialize AssetManager
        if (typeof AssetManager === 'undefined') {
            console.error('AssetManager not found!');
            return;
        }
        
        assetManager = new AssetManager();
        registerAssets();
        
        // Show loading screen
        if (typeof ScreenManager !== 'undefined') {
            screenManager = new ScreenManager();
            screenManager.showLoading(true);
        } else {
            console.error('ScreenManager not found!');
        }
        
        // Load all assets
        if (assetManager && typeof assetManager.loadAll === 'function') {
            await assetManager.loadAll(updateLoadingProgress);
        }
        
        // Initialize managers
        if (typeof InputManager !== 'undefined') {
            inputManager = new InputManager();
        }
        
        if (typeof UIManager !== 'undefined') {
            uiManager = new UIManager();
        }
        
        const canvas = document.getElementById('game-canvas');
        if (canvas && typeof GameEngine !== 'undefined') {
            gameEngine = new GameEngine(canvas, assetManager, inputManager, uiManager, screenManager);
            
            setTimeout(() => {
                if (gameEngine) {
                    if (typeof gameEngine.resizeCanvas === 'function') {
                        gameEngine.resizeCanvas();
                    }
                    if (typeof gameEngine.render === 'function') {
                        gameEngine.render();
                    }
                    console.log('Canvas resized and rendered');
                }
            }, 100);
        }
        
        // Setup character select event
        if (typeof CharacterSelect !== 'undefined') {
            characterSelect = new CharacterSelect();
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize music controls
        initMusicControls();
        
        // Start menu music with user interaction handling
        startMusicWithUserInteraction();
        
        // Hide loading, show menu
        setTimeout(() => {
            if (screenManager) {
                screenManager.showLoading(false);
                if (typeof screenManager.showScreen === 'function') {
                    screenManager.showScreen('menu');
                }
            }
        }, 500);
    }
    
    // Fallback MusicManager if class doesn't exist
    function createFallbackMusicManager() {
        return {
            init: function() { console.log('Fallback MusicManager initialized'); return true; },
            setDefaultMusicUrl: function(url) { this.defaultMusicUrl = url; },
            playGameMusic: function() { 
                console.log('Fallback: Would play music if available');
                // Try to play directly
                if (this.defaultMusicUrl) {
                    const audio = new Audio(this.defaultMusicUrl);
                    audio.loop = true;
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log('Autoplay blocked:', e));
                    this.backgroundMusic = audio;
                }
            },
            setVolume: function(vol) { this.volume = vol; },
            getVolume: function() { return this.volume || 0.5; },
            toggleMute: function() { this.isMuted = !this.isMuted; return this.isMuted; },
            pauseBackgroundMusic: function() { if (this.backgroundMusic) this.backgroundMusic.pause(); },
            resumeBackgroundMusic: function() { if (this.backgroundMusic) this.backgroundMusic.play(); },
            stopBackgroundMusic: function() { if (this.backgroundMusic) this.backgroundMusic.pause(); },
            fadeOut: function() { this.stopBackgroundMusic(); },
            volume: 0.5,
            isMuted: false,
            backgroundMusic: null,
            defaultMusicUrl: null
        };
    }
    
    // Handle browser autoplay policies
    function startMusicWithUserInteraction() {
        // Try to play immediately
        if (musicManager && typeof musicManager.playGameMusic === 'function') {
            musicManager.playGameMusic();
        }
        
        // Some browsers require user interaction first
        const startMusicOnInteraction = () => {
            if (musicManager && musicManager.backgroundMusic && musicManager.backgroundMusic.paused) {
                console.log('User interaction detected, starting music...');
                if (typeof musicManager.playGameMusic === 'function') {
                    musicManager.playGameMusic();
                } else if (musicManager.defaultMusicUrl) {
                    const audio = new Audio(musicManager.defaultMusicUrl);
                    audio.loop = true;
                    audio.volume = musicManager.volume || 0.5;
                    audio.play().catch(e => console.log('Play failed:', e));
                    musicManager.backgroundMusic = audio;
                }
            }
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('keydown', startMusicOnInteraction);
        };
        
        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('keydown', startMusicOnInteraction);
    }
    
    // Setup all event listeners
    function setupEventListeners() {
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
        
        document.addEventListener('gameRematch', () => {
            if (gameEngine && typeof gameEngine.rematch === 'function') {
                gameEngine.rematch();
                gameEngine.start();
            }
        });

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
