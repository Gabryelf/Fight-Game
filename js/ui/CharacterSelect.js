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
        const selectBtns = document.querySelectorAll('.select-char-btn');
        selectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const characterId = btn.dataset.character;
                const currentSelectorText = this.currentSelector;
                this.selectCharacter(currentSelectorText, characterId);
                
                // Switch to next player if P1 just selected
                if (this.currentSelector === 'PLAYER1' && !this.selectedCharacters.PLAYER2) {
                    this.currentSelector = 'PLAYER2';
                    this.updateSelectionStatus();
                    
                    // Highlight next player
                    document.querySelectorAll('.character-card').forEach(card => {
                        card.style.opacity = '0.7';
                    });
                } else if (this.currentSelector === 'PLAYER2' && !this.selectedCharacters.PLAYER1) {
                    this.currentSelector = 'PLAYER1';
                    this.updateSelectionStatus();
                }
                
                // Enable start button if both selected
                const startBtn = document.getElementById('start-fight-btn');
                if (this.selectedCharacters.PLAYER1 && this.selectedCharacters.PLAYER2 && startBtn) {
                    startBtn.disabled = false;
                }
            });
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
    
    selectCharacter(player, characterId) {
        this.selectedCharacters[player] = characterId;
        this.updateSelectionStatus();
        
        // Visual feedback on selected card
        document.querySelectorAll('.character-card').forEach(card => {
            if (card.dataset.character === characterId) {
                card.style.border = '3px solid gold';
            }
        });
    }
    
    updateSelectionStatus() {
        const statusDiv = document.getElementById('selection-status');
        if (statusDiv) {
            const p1Name = this.selectedCharacters.PLAYER1 ? 
                CharactersConfig[this.selectedCharacters.PLAYER1].displayName : 'Not selected';
            const p2Name = this.selectedCharacters.PLAYER2 ? 
                CharactersConfig[this.selectedCharacters.PLAYER2].displayName : 'Not selected';
            statusDiv.innerHTML = `Player 1: ${p1Name} | Player 2: ${p2Name}<br>
                <span style="font-size:0.8rem;color:#ffaa66;">${this.currentSelector === 'PLAYER1' ? '→ Player 1 is choosing ←' : '→ Player 2 is choosing ←'}</span>`;
        }
    }
    
    reset() {
        this.selectedCharacters = { PLAYER1: null, PLAYER2: null };
        this.currentSelector = 'PLAYER1';
        this.updateSelectionStatus();
        
        const startBtn = document.getElementById('start-fight-btn');
        if (startBtn) startBtn.disabled = true;
        
        document.querySelectorAll('.character-card').forEach(card => {
            card.style.border = '2px solid #ff3a3a';
        });
    }
}