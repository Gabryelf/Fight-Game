/**
 * EffectManager - Handles visual effects (hit flashes, numbers, etc.)
 */
 class EffectManager {
    constructor() {
        this.effects = [];
    }
    
    /**
     * Add hit flash effect
     * @param {number} x 
     * @param {number} y 
     * @param {number} damage 
     */
    addHitEffect(x, y, damage) {
        this.effects.push({
            type: 'hit',
            x, y,
            damage: damage,
            life: 0.5,
            alpha: 1
        });
    }
    
    /**
     * Add floating damage number
     * @param {number} x 
     * @param {number} y 
     * @param {number} damage 
     */
    addDamageNumber(x, y, damage) {
        this.effects.push({
            type: 'damage',
            x, y,
            damage: Math.floor(damage),
            life: 1.0,
            floatY: 0
        });
    }
    
    /**
     * Update all effects
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= deltaTime;
            
            if (effect.type === 'damage') {
                effect.floatY -= 50 * deltaTime;
            }
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw all effects
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    draw(ctx, camera) {
        for (const effect of this.effects) {
            const screenX = (effect.x - camera.x) * camera.zoom + camera.canvasWidth / 2;
            const screenY = (effect.y - camera.y) * camera.zoom + camera.canvasHeight / 2;
            
            if (effect.type === 'hit') {
                ctx.save();
                ctx.globalAlpha = effect.life;
                ctx.fillStyle = `rgba(255, 100, 100, ${effect.life})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 20 * (1 - effect.life), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (effect.type === 'damage') {
                ctx.save();
                ctx.font = `bold ${Math.floor(24 * camera.zoom)}px Arial`;
                ctx.fillStyle = `rgba(255, 50, 50, ${effect.life})`;
                ctx.shadowBlur = 0;
                ctx.fillText(
                    `-${effect.damage}`, 
                    screenX, 
                    screenY + effect.floatY * camera.zoom
                );
                ctx.restore();
            }
        }
    }
    
    clear() {
        this.effects = [];
    }
}