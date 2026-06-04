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
            idle: 'https://raw.githubusercontent.com/your-repo/assets/main/shadow_idle.png',
            walk: 'https://raw.githubusercontent.com/your-repo/assets/main/shadow_walk.png',
            attack: 'https://raw.githubusercontent.com/your-repo/assets/main/shadow_attack.png',
            hurt: 'https://raw.githubusercontent.com/your-repo/assets/main/shadow_hurt.png',
            dead: 'https://raw.githubusercontent.com/your-repo/assets/main/shadow_dead.png'
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
            idle: 'https://raw.githubusercontent.com/your-repo/assets/main/titan_idle.png',
            walk: 'https://raw.githubusercontent.com/your-repo/assets/main/titan_walk.png',
            attack: 'https://raw.githubusercontent.com/your-repo/assets/main/titan_attack.png',
            hurt: 'https://raw.githubusercontent.com/your-repo/assets/main/titan_hurt.png',
            dead: 'https://raw.githubusercontent.com/your-repo/assets/main/titan_dead.png'
        },
        
        themeColor: '#ff6a3a'
    }
};

// Background assets
window.BackgroundAssets = {
    bgFar: 'https://raw.githubusercontent.com/your-repo/assets/main/bg_far.png',
    bgMid: 'https://raw.githubusercontent.com/your-repo/assets/main/bg_mid.png',
    bgNear: 'https://raw.githubusercontent.com/your-repo/assets/main/bg_near.png',
    ground: 'https://raw.githubusercontent.com/your-repo/assets/main/ground.png'
};