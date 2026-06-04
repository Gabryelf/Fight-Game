class Fighter {
    constructor(playerId, characterData, x, y, isFacingRight = true) {
        this.playerId = playerId;
        this.character = characterData;
        
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = true;
        this.facingRight = isFacingRight;
        
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.attackTimer = 0;
        this.hurtTimer = 0;
        this.deathTimer = 0;
        this.attackDamage = 10;
        this.isSpecialAttack = false;
        this.hasHit = false; // Флаг для одноразового удара
        
        // Animation
        this.currentAnim = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        
        const config = window.GameConfig || { FIGHTER_WIDTH: 80, FIGHTER_HEIGHT: 120 };
        this.width = config.FIGHTER_WIDTH;
        this.height = config.FIGHTER_HEIGHT;
    }
    
    update(deltaTimeMs, input, opponent, effects) {
        if (this.isDead) {
            this.deathTimer += deltaTimeMs;
            return;
        }
        
        // Update timers
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTimeMs;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.hasHit = false;
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
        
        // DIRECT KEY CHECK FOR DEBUG
        const attackKey = this.playerId === 'PLAYER1' ? 'KeyF' : 'KeyK';
        const specialKey = this.playerId === 'PLAYER1' ? 'KeyG' : 'KeyL';
        const isAttackKeyDown = input.keys.get(attackKey) === true;
        const isSpecialKeyDown = input.keys.get(specialKey) === true;
        
        if (isAttackKeyDown && !this.isAttacking && !this.isHurt) {
            console.log(`🔴 DIRECT KEY CHECK: ${this.playerId} attack key is DOWN!`);
        }
        
        // Movement and attacks
        if (!this.isAttacking && !this.isHurt) {
            const moveDir = input.getMoveDirection(this.playerId);
            this.vx = moveDir * this.character.speed;
            
            // Jump
            if (input.isJustPressed(this.playerId, 'jump') && this.isGrounded) {
                this.vy = window.GameConfig.JUMP_POWER;
                this.isGrounded = false;
            }
            
            // DIRECT ATTACK TRIGGER - bypass isJustPressed for test
            if (isAttackKeyDown) {
                console.log(`🎮 DIRECT TRIGGER: ${this.playerId} attacking!`);
                this.attack(false);
                // Prevent multiple triggers in same frame
                input.keys.set(attackKey, false);
            }
            
            if (isSpecialKeyDown) {
                console.log(`🎮 DIRECT TRIGGER: ${this.playerId} special!`);
                this.attack(true);
                input.keys.set(specialKey, false);
            }
        } else {
            this.vx *= 0.95;
        }
        
        // Physics
        this.vy += window.GameConfig.GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        
        // Ground collision
        const groundY = window.GameConfig.GROUND_Y;
        if (this.y >= groundY - this.height) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // World bounds
        const worldWidth = window.GameConfig.WORLD_WIDTH;
        this.x = Math.max(50, Math.min(this.x, worldWidth - this.width - 50));
        
        // Update facing
        if (Math.abs(this.vx) > 0.5 && !this.isAttacking) {
            this.facingRight = this.vx > 0;
        } else if (opponent && !this.isAttacking) {
            this.facingRight = opponent.x > this.x;
        }
        
        // Update cooldowns
        this.character.updateCooldowns(deltaTimeMs);
        
        // Update animation
        this.updateAnimation(deltaTimeMs);
        
        // Check collision
        if (this.isAttacking && opponent && !this.hasHit) {
            this.checkAttackCollision(opponent, effects);
        }
    }
    
    attack(isSpecial) {
        console.log(`🎯 ATTACK METHOD CALLED: ${this.playerId}, special=${isSpecial}, isAttacking=${this.isAttacking}, isHurt=${this.isHurt}`);
        
        if (this.isAttacking || this.isHurt) {
            console.log(`❌ Attack blocked: isAttacking=${this.isAttacking}, isHurt=${this.isHurt}`);
            return;
        }
        
        if (isSpecial) {
            const damage = this.character.specialAttack();
            if (damage === null) {
                console.log(`❌ Special on cooldown`);
                return;
            }
            this.attackDamage = damage;
            this.isSpecialAttack = true;
        } else {
            this.attackDamage = this.character.normalAttackDamage();
            this.isSpecialAttack = false;
        }
        
        console.log(`✅ ATTACK STARTED! Damage: ${this.attackDamage}`);
        
        this.isAttacking = true;
        this.hasHit = false;
        this.attackTimer = window.GameConfig.NORMAL_ATTACK_COOLDOWN;
        this.currentAnim = 'attack';
        this.animFrame = 0;
    }
    
    checkAttackCollision(opponent, effects) {
        console.log(`🔍 CHECKING COLLISION: ${this.playerId} isAttacking=${this.isAttacking}, hasHit=${this.hasHit}`);
        
        if (!this.isAttacking || this.hasHit) return;
        if (opponent.isDead || opponent.isHurt) return;
        
        // Calculate distance
        const distance = Math.abs(this.x - opponent.x);
        const attackRange = 80;
        
        let inRange = false;
        if (this.facingRight) {
            inRange = opponent.x > this.x && distance < attackRange;
        } else {
            inRange = opponent.x < this.x && distance < attackRange;
        }
        
        console.log(`📏 Distance: ${distance}, AttackRange: ${attackRange}, FacingRight: ${this.facingRight}, InRange: ${inRange}`);
        
        if (inRange) {
            console.log(`💥 HIT! ${this.playerId} hits ${opponent.playerId}`);
            const actualDamage = opponent.character.takeDamage(this.attackDamage);
            console.log(`❤️ Damage: ${actualDamage}, ${opponent.playerId} HP: ${opponent.character.currentHealth}`);
            
            if (effects) {
                effects.addHitEffect(opponent.x + opponent.width/2, opponent.y + opponent.height/2, actualDamage);
                effects.addDamageNumber(opponent.x + opponent.width/2, opponent.y - 20, actualDamage);
            }
            
            opponent.takeHit();
            this.hasHit = true;
            
            // Knockback
            const knockbackDir = opponent.x < this.x ? 1 : -1;
            opponent.vx = knockbackDir * 8;
            opponent.vy = -6;
        }
    }
    
    checkAttackCollision(opponent, effects) {
        if (!this.isAttacking || opponent.isDead || opponent.isHurt) return;
        
        // Calculate distance to opponent
        const distance = Math.abs(this.x - opponent.x);
        const attackRange = 70;
        
        console.log(`${this.playerId} checking hit: distance=${distance}, range=${attackRange}, facingRight=${this.facingRight}`);
        
        // Check if opponent is in attack range based on facing direction
        let inRange = false;
        if (this.facingRight) {
            inRange = opponent.x > this.x && distance < attackRange;
        } else {
            inRange = opponent.x < this.x && distance < attackRange;
        }
        
        if (inRange) {
            console.log(`${this.playerId} HIT! Distance: ${distance}`);
            const actualDamage = opponent.character.takeDamage(this.attackDamage);
            console.log(`${this.playerId} dealt ${actualDamage} damage to ${opponent.playerId}`);
            
            if (effects) {
                effects.addHitEffect(opponent.x + opponent.width/2, opponent.y + opponent.height/2, actualDamage);
                effects.addDamageNumber(opponent.x + opponent.width/2, opponent.y - 20, actualDamage);
            }
            
            opponent.takeHit();
            this.hasHit = true; // Prevent multiple hits per attack
            
            // Knockback
            const knockbackDir = opponent.x < this.x ? 1 : -1;
            opponent.vx = knockbackDir * 8;
            opponent.vy = -6;
        }
    }
    
    takeHit() {
        if (this.isDead) return;
        console.log(`${this.playerId} took hit!`);
        this.isHurt = true;
        this.hurtTimer = 400;
        this.isAttacking = false;
        this.hasHit = false;
        this.attackTimer = 0;
        this.currentAnim = 'hurt';
        this.animFrame = 0;
        
        if (!this.character.isAlive()) {
            this.die();
        }
    }
    
    die() {
        console.log(`${this.playerId} died!`);
        this.isDead = true;
        this.isAttacking = false;
        this.isHurt = false;
        this.currentAnim = 'dead';
        this.vx = 0;
    }
    
    updateAnimation(deltaTimeMs) {
        this.animTimer += deltaTimeMs;
        const frameDelay = 150;
        
        if (this.animTimer >= frameDelay) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
        
        if (this.currentAnim === 'hurt' && !this.isHurt) {
            this.currentAnim = 'idle';
        }
        
        if (this.currentAnim === 'attack' && !this.isAttacking) {
            this.currentAnim = 'idle';
        }
    }
    
    draw(ctx, assets, camera) {
        if (!ctx || !camera) return;
        
        const screenPos = camera.worldToScreen(this.x, this.y);
        const drawWidth = this.width * camera.zoom;
        const drawHeight = this.height * camera.zoom;
        
        if (screenPos.x + drawWidth < 0 || screenPos.x > camera.canvasWidth || 
            screenPos.y + drawHeight < 0 || screenPos.y > camera.canvasHeight) {
            return;
        }
        
        ctx.save();
        
        ctx.translate(screenPos.x + drawWidth / 2, screenPos.y + drawHeight / 2);
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }
        
        // Draw character
        const spriteKey = `${this.character.id}_${this.currentAnim}`;
        let sprite = assets ? assets.get(spriteKey) : null;
        
        if (sprite && sprite.complete !== false && sprite.width > 0 && sprite.height > 0) {
            ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else {
            ctx.fillStyle = this.playerId === 'PLAYER1' ? '#ff4444' : '#4444ff';
            ctx.fillRect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
        
        // VISUAL ATTACK INDICATOR
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            if (this.facingRight) {
                ctx.fillRect(drawWidth / 2, -drawHeight / 4, 40, drawHeight / 2);
            } else {
                ctx.fillRect(-drawWidth / 2 - 40, -drawHeight / 4, 40, drawHeight / 2);
            }
            
            // Draw attack text
            ctx.fillStyle = 'red';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ATTACK!', 0, -drawHeight / 2 - 20);
        }
        
        // Health bar
        const healthPercent = this.character.currentHealth / this.character.maxHealth;
        const barWidth = drawWidth;
        const barHeight = 6 * camera.zoom;
        const barY = -drawHeight / 2 - 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = '#ff2a2a';
        ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Show HP number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${Math.floor(this.character.currentHealth)}/${this.character.maxHealth}`, 
                     -barWidth / 2, barY - 5);
        
        ctx.restore();
    }
    
    reset(startX) {
        this.x = startX;
        this.y = window.GameConfig.GROUND_Y - this.height;
        this.vx = 0;
        this.vy = 0;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.hasHit = false;
        this.attackTimer = 0;
        this.hurtTimer = 0;
        this.currentAnim = 'idle';
        this.character.resetHealth();
    }
}