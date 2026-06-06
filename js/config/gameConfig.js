window.GameConfig = {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    WORLD_WIDTH: 2000,
    GROUND_Y: 550,
    
    CAMERA_ZOOM_NORMAL: 1.0,
    CAMERA_ZOOM_MIN: 0.6,
    CAMERA_ZOOM_MAX: 1.0,
    CAMERA_ZOOM_SPEED: 0.05,
    CAMERA_LEASH_DISTANCE: 300,
    
    GRAVITY: 0.8,
    JUMP_POWER: -12,
    BASE_SPEED: 5,
    
    NORMAL_ATTACK_DAMAGE: 10,
    NORMAL_ATTACK_COOLDOWN: 500, // 500ms = 0.5 секунды
    
    FIGHTER_WIDTH: 60,
    FIGHTER_HEIGHT: 90,
    
    ANIMATION_FRAMERATE: 100,
    
    PARALLAX_LAYERS: [
        { speed: 0.1, image: null, width: 2048 },
        { speed: 0.3, image: null, width: 2048 },
        { speed: 0.6, image: null, width: 2048 }
    ]
};