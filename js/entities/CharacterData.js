/**
 * CharacterData - Represents character stats and ability data
 * Extensible for adding new moves/combos
 */
 class CharacterData {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.displayName = config.displayName;
        
        // Stats
        this.maxHealth = config.maxHealth;
        this.currentHealth = config.maxHealth;
        this.attack = config.attack;
        this.defense = config.defense;
        this.speed = config.speed;
        
        // Abilities
        this.specialCooldown = config.specialCooldown;
        this.specialDamage = config.specialDamage;
        this.specialCurrentCooldown = 0;
        
        // Sprite references
        this.sprites = config.sprites;
        this.themeColor = config.themeColor;
    }
    
    takeDamage(baseDamage) {
        const defenseReduction = this.defense / 200;
        const actualDamage = Math.max(1, Math.floor(baseDamage * (1 - defenseReduction)));
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }
    
    normalAttackDamage() {
        return Math.floor(this.attack * 0.12);
    }
    
    specialAttack() {
        if (this.specialCurrentCooldown > 0) return null;
        this.specialCurrentCooldown = this.specialCooldown;
        return Math.floor(this.specialDamage * (this.attack / 100));
    }
    
    updateCooldowns(deltaTimeMs) {
        if (this.specialCurrentCooldown > 0) {
            this.specialCurrentCooldown -= deltaTimeMs;
            if (this.specialCurrentCooldown < 0) this.specialCurrentCooldown = 0;
        }
    }
    
    getSpecialCooldownPercent() {
        return this.specialCurrentCooldown / this.specialCooldown;
    }
    
    resetHealth() {
        this.currentHealth = this.maxHealth;
        this.specialCurrentCooldown = 0;
    }
    
    isAlive() {
        return this.currentHealth > 0;
    }
}

// Make it available globally
window.CharacterData = CharacterData;