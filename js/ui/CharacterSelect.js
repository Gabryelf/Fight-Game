/**
 * CharacterSelect - Manages character selection UI and state
 */
 class CharacterSelect {
    constructor() {
        this.selectedCharacters = {
            PLAYER1: null,
            PLAYER2: null
        };
        this.currentSelector = 'PLAYER1'; // Which player is currently selecting
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Use event delegation for dynamic buttons
        const container = document.querySelector('.select-container');
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.select-char-btn');
            if (btn) {
                const characterId = btn.dataset.character;
                this.handleCharacterSelect(characterId);
            }
        });
        
        // Handle start fight
        const startBtn = document.getElementById('start-fight-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.selectedCharacters.PLAYER1 && this.selectedCharacters.PLAYER2) {
                    const event = new CustomEvent('charactersSelected', {
                        detail: {
                            p1: this.selectedCharacters.PLAYER1,
                            p2: this.selectedCharacters.PLAYER2
                        }
                    });
                    document.dispatchEvent(event);
                }
            });
        }
        
        // Back button
        const backBtn = document.getElementById('back-to-menu-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const event = new CustomEvent('backToMenu');
                document.dispatchEvent(event);
            });
        }
    }
    
    handleCharacterSelect(characterId) {
        // Store selection for current player
        this.selectedCharacters[this.currentSelector] = characterId;
        
        // Visual feedback
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            if (card.dataset.character === characterId) {
                if (this.currentSelector === 'PLAYER1') {
                    card.style.border = '3px solid #ff6a6a';
                    card.style.boxShadow = '0 0 20px rgba(255, 100, 100, 0.5)';
                } else {
                    card.style.border = '3px solid #6a6aff';
                    card.style.boxShadow = '0 0 20px rgba(100, 100, 255, 0.5)';
                }
            }
        });
        
        // Update button text to show which player selected
        const btns = document.querySelectorAll('.select-char-btn');
        btns.forEach(btn => {
            if (btn.dataset.character === characterId) {
                btn.textContent = this.currentSelector === 'PLAYER1' ? '✓ P1 SELECTED' : '✓ P2 SELECTED';
                btn.disabled = true;
            }
        });
        
        // Switch to next player if needed
        if (this.currentSelector === 'PLAYER1' && !this.selectedCharacters.PLAYER2) {
            this.currentSelector = 'PLAYER2';
            this.updateSelectionStatus();
            this.showNextPlayerPrompt();
        } else if (this.currentSelector === 'PLAYER2' && !this.selectedCharacters.PLAYER1) {
            this.currentSelector = 'PLAYER1';
            this.updateSelectionStatus();
            this.showNextPlayerPrompt();
        }
        
        this.updateSelectionStatus();
        this.checkStartEnabled();
    }
    
    showNextPlayerPrompt() {
        const statusDiv = document.getElementById('selection-status');
        if (statusDiv) {
            const message = this.currentSelector === 'PLAYER1' 
                ? '🎮 PLAYER 1 - Choose your fighter! 🎮' 
                : '🎮 PLAYER 2 - Choose your fighter! 🎮';
            statusDiv.innerHTML = `<span style="color:#ffaa66; font-size:1.2rem;">${message}</span><br>
                ${this.getSelectionDisplay()}`;
        }
    }
    
    getSelectionDisplay() {
        const p1Name = this.selectedCharacters.PLAYER1 ? 
            window.CharactersConfig[this.selectedCharacters.PLAYER1].displayName : '❌ Not selected';
        const p2Name = this.selectedCharacters.PLAYER2 ? 
            window.CharactersConfig[this.selectedCharacters.PLAYER2].displayName : '❌ Not selected';
        return `Player 1: ${p1Name} | Player 2: ${p2Name}`;
    }
    
    updateSelectionStatus() {
        const statusDiv = document.getElementById('selection-status');
        if (statusDiv) {
            statusDiv.innerHTML = this.getSelectionDisplay();
        }
    }
    
    checkStartEnabled() {
        const startBtn = document.getElementById('start-fight-btn');
        if (startBtn) {
            const bothSelected = this.selectedCharacters.PLAYER1 && this.selectedCharacters.PLAYER2;
            startBtn.disabled = !bothSelected;
            if (bothSelected) {
                startBtn.style.opacity = '1';
                startBtn.style.transform = 'scale(1.05)';
            } else {
                startBtn.style.opacity = '0.5';
                startBtn.style.transform = 'scale(1)';
            }
        }
    }
    
    reset() {
        this.selectedCharacters = { PLAYER1: null, PLAYER2: null };
        this.currentSelector = 'PLAYER1';
        
        const startBtn = document.getElementById('start-fight-btn');
        if (startBtn) startBtn.disabled = true;
        
        const btns = document.querySelectorAll('.select-char-btn');
        btns.forEach(btn => {
            const charId = btn.dataset.character;
            const charConfig = window.CharactersConfig[charId];
            btn.textContent = `SELECT ${charConfig ? charConfig.displayName : 'P1'}`;
            btn.disabled = false;
        });
        
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            card.style.border = '2px solid #ff3a3a';
            card.style.boxShadow = 'none';
        });
        
        this.updateSelectionStatus();
        this.showNextPlayerPrompt();
    }
}