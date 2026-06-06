/**
 * Characters Configuration
 * Easily extendable for new fighters
 */
 window.CharactersConfig = {
    shadow: {
        id: 'shadow',
        name: 'Shadow Blade',
        displayName: 'SHADOW BLADE',
        
        // Stats
        maxHealth: 120,
        attack: 85,
        defense: 70,
        speed: 6,
        
        // Abilities
        specialCooldown: 3000,
        specialDamage: 25,
        
        // Sprite URLs (from GitHub - placeholder CDN)
        sprites: {
            idle: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player1/idle.png',
            walk: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player1/walk1.png',
            attack: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player1/attack2.png',
            hurt: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player1/hurt1.png',
            dead: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player1/dead3.png'
        },
        
        // Color theme for UI
        themeColor: '#8a6eff'
    },
    
    titan: {
        id: 'titan',
        name: 'Titan Fist',
        displayName: 'TITAN FIST',
        
        maxHealth: 140,
        attack: 75,
        defense: 90,
        speed: 4,
        
        specialCooldown: 3500,
        specialDamage: 30,
        
        sprites: {
            idle: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player2/idle1.png',
            walk: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player2/walk1.png',
            attack: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player2/attack2.png',
            hurt: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player2/hurt1.png',
            dead: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/fighting-pixel/player2/dead3.png'
        },
        
        themeColor: '#ff6a3a'
    }
};

// Background assets
window.BackgroundAssets = {
    bgFar: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/pixels-bg/Ruins-far.png',
    bgMid: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/pixels-bg/Ruins-middle.png',
    bgNear: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/pixels-bg/Ruins-near.png',
    ground: 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/sets/pixels-bg/Ruins-ground.png'
};