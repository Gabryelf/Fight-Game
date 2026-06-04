/**
 * UIManager - Handles all UI updates (health bars, cooldowns, etc.)
 */
 class UIManager {
    constructor() {
        this.elements = {};
        this.cacheElements();
    }
    
    cacheElements() {
        this.elements.p1HealthFill = document.getElementById('p1-health-fill');
        this.elements.p2HealthFill = document.getElementById('p2-health-fill');
        this.elements.p1HealthText = document.getElementById('p1-health-text');
        this.elements.p2HealthText = document.getElementById('p2-health-text');
        this.elements.p1Cd = document.getElementById('p1-cd');
        this.elements.p2Cd = document.getElementById('p2-cd');
    }
    
    /**
     * Update health bars display
     * @param {CharacterData} p1Char 
     * @param {CharacterData} p2Char 
     */
    updateHealth(p1Char, p2Char) {
        const p1Percent = (p1Char.currentHealth / p1Char.maxHealth) * 100;
        const p2Percent = (p2Char.currentHealth / p2Char.maxHealth) * 100;
        
        if (this.elements.p1HealthFill) {
            this.elements.p1HealthFill.style.width = `${p1Percent}%`;
        }
        if (this.elements.p2HealthFill) {
            this.elements.p2HealthFill.style.width = `${p2Percent}%`;
        }
        if (this.elements.p1HealthText) {
            this.elements.p1HealthText.textContent = `❤ ${Math.floor(p1Char.currentHealth)}`;
        }
        if (this.elements.p2HealthText) {
            this.elements.p2HealthText.textContent = `❤ ${Math.floor(p2Char.currentHealth)}`;
        }
    }
    
    /**
     * Update cooldown displays
     * @param {CharacterData} p1Char 
     * @param {CharacterData} p2Char 
     */
    updateCooldowns(p1Char, p2Char) {
        const p1CdPercent = p1Char.getSpecialCooldownPercent();
        const p2CdPercent = p2Char.getSpecialCooldownPercent();
        
        if (this.elements.p1Cd) {
            if (p1CdPercent > 0) {
                this.elements.p1Cd.textContent = `⏳ ${Math.ceil(p1Char.specialCurrentCooldown / 1000)}s`;
                this.elements.p1Cd.classList.add('cooldown-active');
            } else {
                this.elements.p1Cd.textContent = '⚡ SPECIAL READY';
                this.elements.p1Cd.classList.remove('cooldown-active');
            }
        }
        
        if (this.elements.p2Cd) {
            if (p2CdPercent > 0) {
                this.elements.p2Cd.textContent = `⏳ ${Math.ceil(p2Char.specialCurrentCooldown / 1000)}s`;
                this.elements.p2Cd.classList.add('cooldown-active');
            } else {
                this.elements.p2Cd.textContent = '⚡ SPECIAL READY';
                this.elements.p2Cd.classList.remove('cooldown-active');
            }
        }
    }
    
    /**
     * Show victory screen with winner name
     * @param {string} winnerName 
     */
    showVictory(winnerName) {
        const victoryText = document.getElementById('victory-text');
        if (victoryText) {
            victoryText.textContent = `${winnerName} VICTORY!`;
        }
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.add('active');
        }
    }
    
    hideVictory() {
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.remove('active');
        }
    }
    
    /**
     * Show/hide pause screen
     * @param {boolean} show 
     */
    showPause(show) {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            if (show) {
                pauseScreen.classList.add('active');
            } else {
                pauseScreen.classList.remove('active');
            }
        }
    }
}