/**
 * InputManager - Handles keyboard input with key mapping
 * Supports multiple control schemes for P1 and P2
 */
 class InputManager {
    constructor() {
        this.keys = new Map();
        this.keyState = new Map();
        
        // Control mappings
        this.controls = {
            PLAYER1: {
                left: 'KeyA',
                right: 'KeyD',
                jump: 'KeyW',
                attack: 'KeyF',
                special: 'KeyG'
            },
            PLAYER2: {
                left: 'ArrowLeft',
                right: 'ArrowRight',
                jump: 'ArrowUp',
                attack: 'KeyK',
                special: 'KeyL'
            }
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
            this.keyState.set(e.code, 'down');
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.keyState.set(e.code, 'up');
        });
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} player - 'PLAYER1' or 'PLAYER2'
     * @param {string} action - 'left', 'right', 'jump', 'attack', 'special'
     * @returns {boolean}
     */
    isPressed(player, action) {
        const keyCode = this.controls[player]?.[action];
        return keyCode ? this.keys.get(keyCode) === true : false;
    }
    
    /**
     * Check if a key was just pressed this frame (edge detection)
     * @param {string} player 
     * @param {string} action 
     * @returns {boolean}
     */
    isJustPressed(player, action) {
        const keyCode = this.controls[player]?.[action];
        if (!keyCode) return false;
        const state = this.keyState.get(keyCode);
        if (state === 'down') {
            this.keyState.set(keyCode, 'held');
            return true;
        }
        return false;
    }
    
    /**
     * Update input states (call once per frame)
     */
    update() {
        // Reset edge detection for keys that are still held
        for (let [key, state] of this.keyState) {
            if (state === 'down' && this.keys.get(key)) {
                this.keyState.set(key, 'held');
            }
            if (state === 'up') {
                this.keyState.set(key, null);
            }
        }
    }
    
    /**
     * Get movement direction for player
     * @param {string} player 
     * @returns {number} -1 (left), 0, 1 (right)
     */
    getMoveDirection(player) {
        let direction = 0;
        if (this.isPressed(player, 'left')) direction = -1;
        if (this.isPressed(player, 'right')) direction = 1;
        return direction;
    }
}