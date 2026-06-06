/**
 * Game Configuration
 * Centralized game settings
 */
const GameConfig = {
    // Canvas settings
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // Game settings
    GRAVITY: 0.8,
    GROUND_Y: 600,
    
    // Parallax layers
    PARALLAX_LAYERS: [
        { speed: 0.2, y: 0 },      // Far background
        { speed: 0.5, y: 0 },      // Mid background
        { speed: 1.0, y: 0 }       // Near background
    ],
    
    // Audio settings
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.7,
    DEFAULT_MUSIC_URL: 'https://raw.githubusercontent.com/Gabryelf/Atlas-Assets/main/assets/audio/music/loop/bandicam%202026-06-06%2009-43-06-730.mp3',
    
    // Combat settings
    COMBO_WINDOW: 30, // frames
    HIT_STUN_DURATION: 10,
    
    // UI settings
    UI_UPDATE_INTERVAL: 16, // ms
    
    // Match settings
    MAX_ROUNDS: 3,
    ROUND_TIME: 99, // seconds
    TIME_BETWEEN_ROUNDS: 3, // seconds
    MAX_HEALTH: 120
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
