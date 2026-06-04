/**
 * ScreenManager - Controls screen visibility and transitions
 */
 class ScreenManager {
    constructor() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('menu-screen'),
            select: document.getElementById('select-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            victory: document.getElementById('victory-screen')
        };
        
        this.setupMenuButtons();
    }
    
    setupMenuButtons() {
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.showScreen('select'));
        }
        
        const quitBtn = document.getElementById('quit-to-menu-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.showScreen('menu');
                const quitEvent = new CustomEvent('gameQuit');
                document.dispatchEvent(quitEvent);
            });
        }
        
        const rematchBtn = document.getElementById('rematch-btn');
        if (rematchBtn) {
            rematchBtn.addEventListener('click', () => {
                this.hideScreen('victory');
                const rematchEvent = new CustomEvent('gameRematch');
                document.dispatchEvent(rematchEvent);
            });
        }
        
        const victoryMenuBtn = document.getElementById('victory-menu-btn');
        if (victoryMenuBtn) {
            victoryMenuBtn.addEventListener('click', () => {
                this.showScreen('menu');
                const menuEvent = new CustomEvent('gameQuit');
                document.dispatchEvent(menuEvent);
            });
        }
        
        // Pause button in game
        const pauseGameBtn = document.getElementById('pause-btn');
        if (pauseGameBtn) {
            pauseGameBtn.addEventListener('click', () => {
                const pauseEvent = new CustomEvent('gamePause');
                document.dispatchEvent(pauseEvent);
                this.showScreen('pause');
            });
        }
        
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.hideScreen('pause');
                const resumeEvent = new CustomEvent('gameResume');
                document.dispatchEvent(resumeEvent);
            });
        }
    }
    
    showScreen(screenName) {
        for (const [name, element] of Object.entries(this.screens)) {
            if (element) {
                if (name === screenName) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            }
        }
    }
    
    hideScreen(screenName) {
        const screen = this.screens[screenName];
        if (screen) {
            screen.classList.remove('active');
        }
    }
    
    showLoading(show) {
        if (show) {
            this.showScreen('loading');
        } else {
            this.hideScreen('loading');
        }
    }
}