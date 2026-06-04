/**
 * Fighter - Game entity representing a combatant on the arena
 * Handles movement, animations, and combat actions
 */
 class Fighter {
    constructor(playerId, characterData, x, y, isFacingRight = true) {
        this.playerId = playerId;
        this.character = characterData;
        
        // Position & physics
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = true;
        this.facingRight = isFacingRight;
        
        // Combat state
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.attackTimer = 0;
        this.hurtTimer = 0;
        this.deathTimer = 0;
        
        // Animation
        this.currentAnim = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        
        // Dimensions
        this.width = GameConfig.FIGHTER_WIDTH;
        this.height = GameConfig.FIGHTER_HEIGHT;
    }
    
    /**
     * Update fighter logic
     * @param {number} deltaTimeMs 
     * @param {InputManager} input 
     * @param {Fighter} opponent 
     * @param {EffectManager} effects 
     */
    update(deltaTimeMs, input, opponent, effects) {
        if (this.isDead) {
            this.deathTimer += deltaTimeMs;
            return;
        }
        
        const deltaSec = deltaTimeMs / 1000;
        
        // Update timers
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTimeMs;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.currentAnim = 'idle';
            }
        }
        
        if (this.hurtTimer > 0) {
            this.hurtTimer -= deltaTimeMs;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
                this.currentAnim = 'idle';
            }
        }
        
        // Movement (only if not attacking/hurt)
        if (!this.isAttacking && !this.isHurt) {
            const moveDir = input.getMoveDirection(this.playerId);
            this.vx = moveDir * this.character.speed;
            
            // Jump
            if (input.isJustPressed(this.playerId, 'jump') && this.isGrounded) {
                this.vy = GameConfig.JUMP_POWER;
                this.isGrounded = false;
            }
            
            // Attacks
            if (input.isJustPressed(this.playerId, 'attack')) {
                this.attack(false);
            }
            
            if (input.isJustPressed(this.playerId, 'special')) {
                this.attack(true);
            }
        } else {
            this.vx *= 0.95;
        }
        
        // Physics
        this.vy += GameConfig.GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        if (this.y >= GameConfig.GROUND_Y - this.height) {
            this.y = GameConfig.GROUND_Y - this.height;
            this.vy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // World bounds
        this.x = Math.max(50, Math.min(this.x, GameConfig.WORLD_WIDTH - this.width - 50));
        
        // Update facing direction
        if (Math.abs(this.vx) > 0.5 && !this.isAttacking) {
            this.facingRight = this.vx > 0;
        }
        
        // Update animation
        this.updateAnimation(deltaTimeMs);
        
        // Update cooldowns
        this.character.updateCooldowns(deltaTimeMs);
        
        // Check collision and deal damage
        this.checkAttackCollision(opponent, effects);
    }
    
    /**
     * Perform attack
     * @param {boolean} isSpecial 
     */
    attack(isSpecial) {
        if (this.isAttacking || this.isHurt) return;
        
        if (isSpecial) {
            const damage = this.character.specialAttack();
            if (damage === null) return; // On cooldown
            this.attackDamage = damage;
            this.isSpecialAttack = true;
        } else {
            this.attackDamage = this.character.normalAttackDamage();
            this.isSpecialAttack = false;
        }
        
        this.isAttacking = true;
        this.attackTimer = GameConfig.NORMAL_ATTACK_COOLDOWN;
        this.currentAnim = 'attack';
        this.animFrame = 0;
    }
    
    /**
     * Check if attack hits opponent
     * @param {Fighter} opponent 
     * @param {EffectManager} effects 
     */
    checkAttackCollision(opponent, effects) {
        if (!this.isAttacking || opponent.isDead || opponent.isHurt) return;
        
        // Attack hitbox in front of fighter
        const hitX = this.x + (this.facingRight ? this.width : -30);
        const hitY = this.y + this.height / 2;
        
        const opponentCenterX = opponent.x + opponent.width / 2;
        const opponentCenterY = opponent.y + opponent.height / 2;
        
        const dx = Math.abs(hitX - opponentCenterX);
        const dy = Math.abs(hitY - opponentCenterY);
        
        if (dx < 60 && dy < 70) {
            // Hit!
            const actualDamage = opponent.character.takeDamage(this.attackDamage);
            effects.addHitEffect(opponentCenterX, opponentCenterY, actualDamage);
            effects.addDamageNumber(opponentCenterX, opponentCenterY - 30, actualDamage);
            
            opponent.takeHit();
            this.isAttacking = false;
            this.attackTimer = 0;
            
            // Knockback
            const knockbackDir = opponent.x < this.x ? 1 : -1;
            opponent.vx = knockbackDir * 8;
            opponent.vy = -5;
        }
    }
    
    /**
     * Handle being hit
     */
    takeHit() {
        if (this.isDead) return;
        this.isHurt = true;
        this.hurtTimer = 400;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.currentAnim = 'hurt';
        this.animFrame = 0;
        
        if (!this.character.isAlive()) {
            this.die();
        }
    }
    
    /**
     * Handle death
     */
    die() {
        this.isDead = true;
        this.isAttacking = false;
        this.isHurt = false;
        this.currentAnim = 'dead';
        this.vx = 0;
    }
    
    /**
     * Update animation frame
     * @param {number} deltaTimeMs 
     */
    updateAnimation(deltaTimeMs) {
        this.animTimer += deltaTimeMs;
        if (this.animTimer >= GameConfig.ANIMATION_FRAMERATE) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4; // 4 frames per animation
        }
        
        // Auto-transition from hurt to idle
        if (this.currentAnim === 'hurt' && !this.isHurt) {
            this.currentAnim = 'idle';
        }
        
        if (this.currentAnim === 'dead' && this.deathTimer > 2000) {
            // Death animation finished
        }
    }
    
    /**
     * Draw fighter on canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {AssetManager} assets 
     * @param {Camera} camera 
     */
    draw(ctx, assets, camera) {
        const screenX = (this.x - camera.x) * camera.zoom + camera.canvasWidth / 2;
        const screenY = (this.y - camera.y) * camera.zoom + camera.canvasHeight / 2;
        const drawWidth = this.width * camera.zoom;
        const drawHeight = this.height * camera.zoom;
        
        ctx.save();
        ctx.translate(screenX + drawWidth / 2, screenY + drawHeight / 2);
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }
        
        // Get sprite based on current animation
        const spriteKey = `${this.character.id}_${this.currentAnim}`;
        let sprite = assets.get(spriteKey);
        
        if (!sprite) {
            // Fallback: draw colored rectangle
            ctx.fillStyle = this.character.themeColor;
            ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            
            // Draw name
            ctx.fillStyle = 'white';
            ctx.font = `${Math.floor(14 * camera.zoom)}px Arial`;
            ctx.fillText(this.character.name, -30, -drawHeight / 2 - 10);
        } else {
            ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
        
        // Draw health bar above fighter
        const healthPercent = this.character.currentHealth / this.character.maxHealth;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-drawWidth / 2, -drawHeight / 2 - 15, drawWidth, 8);
        ctx.fillStyle = '#ff2a2a';
        ctx.fillRect(-drawWidth / 2, -drawHeight / 2 - 15, drawWidth * healthPercent, 8);
        
        ctx.restore();
    }
    
    /**
     * Reset fighter for rematch
     * @param {number} startX 
     */
    reset(startX) {
        this.x = startX;
        this.y = GameConfig.GROUND_Y - this.height;
        this.vx = 0;
        this.vy = 0;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.attackTimer = 0;
        this.hurtTimer = 0;
        this.currentAnim = 'idle';
        this.character.resetHealth();
    }
}