class InputManager {
    constructor() {
        this.keys = new Map();
        this.justPressed = new Map(); // Separate map for just pressed
        this.justReleased = new Map();
        
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
            // Prevent default for game keys
            const gameKeys = ['KeyA', 'KeyD', 'KeyW', 'KeyF', 'KeyG', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyK', 'KeyL'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
            
            // If key wasn't pressed before, mark as just pressed
            if (!this.keys.get(e.code)) {
                this.justPressed.set(e.code, true);
                console.log(`🔴 Key DOWN (first time): ${e.code}`);
            }
            this.keys.set(e.code, true);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.justReleased.set(e.code, true);
            console.log(`Key UP: ${e.code}`);
        });
    }
    
    isPressed(player, action) {
        const keyCode = this.controls[player]?.[action];
        return keyCode ? this.keys.get(keyCode) === true : false;
    }
    
    isJustPressed(player, action) {
        const keyCode = this.controls[player]?.[action];
        if (!keyCode) return false;
        
        const pressed = this.justPressed.get(keyCode) === true;
        if (pressed && action === 'attack') {
            console.log(`⚔️ ${player} JUST PRESSED ATTACK! Returning true`);
        }
        return pressed;
    }
    
    isJustReleased(player, action) {
        const keyCode = this.controls[player]?.[action];
        if (!keyCode) return false;
        return this.justReleased.get(keyCode) === true;
    }
    
    update() {
        // Clear just-pressed and just-released flags
        this.justPressed.clear();
        this.justReleased.clear();
    }
    
    getMoveDirection(player) {
        let direction = 0;
        if (this.isPressed(player, 'left')) direction = -1;
        if (this.isPressed(player, 'right')) direction = 1;
        return direction;
    }
}