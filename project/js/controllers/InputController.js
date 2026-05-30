// Input Controller
class InputController {
    constructor() {
        this.keys = new Map();
        this.player1Inputs = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            block: false
        };
        this.player2Inputs = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            block: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            this.keys.set(code, true);
            this.processInput(code, true);
            
            // Prevent default behavior for game keys
            if (this.isGameKey(code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const code = e.code;
            this.keys.set(code, false);
            this.processInput(code, false);
            
            if (this.isGameKey(code)) {
                e.preventDefault();
            }
        });
    }
    
    isGameKey(code) {
        const gameKeys = [
            ...Object.values(CONFIG.controls.player1),
            ...Object.values(CONFIG.controls.player2)
        ];
        return gameKeys.includes(code);
    }
    
    processInput(code, isPressed) {
        // Player 1 inputs
        if (code === CONFIG.controls.player1.left) {
            this.player1Inputs.left = isPressed;
        } else if (code === CONFIG.controls.player1.right) {
            this.player1Inputs.right = isPressed;
        } else if (code === CONFIG.controls.player1.jump) {
            this.player1Inputs.jump = isPressed;
        } else if (code === CONFIG.controls.player1.punch) {
            this.player1Inputs.punch = isPressed;
        } else if (code === CONFIG.controls.player1.kick) {
            this.player1Inputs.kick = isPressed;
        } else if (code === CONFIG.controls.player1.block) {
            this.player1Inputs.block = isPressed;
        }
        
        // Player 2 inputs
        if (code === CONFIG.controls.player2.left) {
            this.player2Inputs.left = isPressed;
        } else if (code === CONFIG.controls.player2.right) {
            this.player2Inputs.right = isPressed;
        } else if (code === CONFIG.controls.player2.jump) {
            this.player2Inputs.jump = isPressed;
        } else if (code === CONFIG.controls.player2.punch) {
            this.player2Inputs.punch = isPressed;
        } else if (code === CONFIG.controls.player2.kick) {
            this.player2Inputs.kick = isPressed;
        } else if (code === CONFIG.controls.player2.block) {
            this.player2Inputs.block = isPressed;
        }
    }
    
    getPlayer1Inputs() {
        return { ...this.player1Inputs };
    }
    
    getPlayer2Inputs() {
        return { ...this.player2Inputs };
    }
    
    reset() {
        this.player1Inputs = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            block: false
        };
        this.player2Inputs = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            block: false
        };
        this.keys.clear();
    }
}