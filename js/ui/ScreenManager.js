/**
 * Screen Manager - Handles screen transitions
 */
class ScreenManager {
    constructor() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('menu-screen'),
            settings: document.getElementById('settings-screen'),
            select: document.getElementById('select-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            victory: document.getElementById('victory-screen')
        };
        
        this.currentScreen = 'loading';
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Menu buttons
        const playBtn = document.getElementById('play-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const creditsBtn = document.getElementById('credits-btn');
        const settingsBackBtn = document.getElementById('settings-back-btn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.showScreen('select'));
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showScreen('settings'));
        }
        
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => {
                alert('Fighting Arena\nVersion 1.0\n\nCreated with passion for fighting game fans!');
            });
        }
        
        if (settingsBackBtn) {
            settingsBackBtn.addEventListener('click', () => this.showScreen('menu'));
        }
        
        // Setup volume slider
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                volumeValue.textContent = `${value}%`;
                if (window.musicManager) {
                    window.musicManager.setVolume(value / 100);
                }
            });
        }
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Show selected screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
            console.log(`Screen changed to: ${screenName}`);
        } else {
            console.error(`Screen ${screenName} not found`);
        }
    }
    
    showLoading(show) {
        if (show) {
            this.showScreen('loading');
        } else if (this.currentScreen === 'loading') {
            this.showScreen('menu');
        }
    }
    
    hideScreen(screenName) {
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('active');
        }
    }
    
    getCurrentScreen() {
        return this.currentScreen;
    }
}
