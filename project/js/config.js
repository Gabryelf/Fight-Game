// Game Configuration
const CONFIG = {
    canvas: {
        width: 1280,
        height: 720
    },
    
    game: {
        roundTime: 99,
        victoryRounds: 2,
        gravity: 0.8,
        groundY: 600
    },
    
    fighter: {
        player1: {
            x: 200,
            name: "Scorpion",
            health: 100,
            damage: 10,
            speed: 5
        },
        player2: {
            x: 1080,
            name: "Sub-Zero",
            health: 100,
            damage: 10,
            speed: 5
        },
        size: {
            width: 80,
            height: 120
        },
        attackRange: 50,
        pushbackOnHit: 20,
        stunDuration: 15
    },
    
    controls: {
        player1: {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            punch: 'KeyF',
            kick: 'KeyG',
            block: 'KeyS'
        },
        player2: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            punch: 'Period',
            kick: 'Slash',
            block: 'ArrowDown'
        }
    },
    
    animations: {
        idle: { frames: 4, frameTime: 100, loop: true },
        walk: { frames: 6, frameTime: 80, loop: true },
        jump: { frames: 3, frameTime: 100, loop: false },
        punch: { frames: 4, frameTime: 60, loop: false },
        kick: { frames: 5, frameTime: 60, loop: false },
        hit: { frames: 3, frameTime: 80, loop: false },
        block: { frames: 2, frameTime: 100, loop: true },
        victory: { frames: 6, frameTime: 100, loop: false },
        defeat: { frames: 4, frameTime: 120, loop: false }
    }
};