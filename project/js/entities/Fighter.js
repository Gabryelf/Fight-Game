// Fighter Entity Class with Sprite Support
class Fighter {
    constructor(id, config, isPlayer1) {
        this.id = id;
        this.name = config.name;
        this.x = config.x;
        this.y = CONFIG.fighter.groundY;
        this.width = CONFIG.fighter.size.width;
        this.height = CONFIG.fighter.size.height;
        
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.speed = config.speed;
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.facingRight = isPlayer1;
        
        this.state = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.isBlocking = false;
        this.isStunned = false;
        this.stunTimer = 0;
        this.canAct = true;
        
        this.attackHitbox = {
            x: 0,
            y: 0,
            width: 60,
            height: 80
        };
        
        this.inputs = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            block: false
        };
        
        // Sprite loading flag
        this.spritesLoaded = false;
        this.sprites = {};
    }
    
    async loadSprites(characterName) {
        const spriteNames = ['idle', 'walk', 'jump', 'punch', 'kick', 'hurt'];
        
        for (const spriteName of spriteNames) {
            const img = new Image();
            const path = `assets/sprites/${characterName}/${spriteName}.png`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log(`Loaded: ${path}`);
                    this.sprites[spriteName] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load: ${path}, using fallback`);
                    // Create fallback colored rectangle
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = this.id === 'player1' ? '#ff4444' : '#4444ff';
                    ctx.fillRect(0, 0, this.width, this.height);
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 20px Arial';
                    ctx.fillText(this.name, 10, 40);
                    this.sprites[spriteName] = canvas;
                    resolve();
                };
                img.src = path;
            });
        }
        
        this.spritesLoaded = true;
    }
    
    update() {
        if (this.health <= 0) {
            this.state = 'defeat';
            return;
        }
        
        this.updateStun();
        this.updateAttack();
        this.updatePhysics();
        this.updateState();
        this.updateAnimation();
        this.updateHitbox();
    }
    
    updateStun() {
        if (this.isStunned) {
            this.stunTimer--;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.canAct = true;
            }
        }
    }
    
    updateAttack() {
        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                if (this.state === 'punch' || this.state === 'kick') {
                    this.state = 'idle';
                }
            }
        }
    }
    
    updatePhysics() {
        // Apply gravity
        if (this.y + this.height < CONFIG.fighter.groundY) {
            this.velocityY += CONFIG.game.gravity;
            this.isGrounded = false;
        } else {
            this.y = CONFIG.fighter.groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        }
        
        // Apply horizontal movement
        if (!this.isStunned && !this.isAttacking && this.canAct) {
            let move = 0;
            if (this.inputs.left) move = -1;
            if (this.inputs.right) move = 1;
            
            this.velocityX = move * this.speed;
        } else {
            this.velocityX *= 0.9;
        }
        
        // Apply movement
        this.x += this.velocityX;
        
        // Boundaries
        if (this.id === 'player1') {
            this.x = Math.max(50, Math.min(this.x, CONFIG.canvas.width / 2 - 100));
        } else {
            this.x = Math.max(CONFIG.canvas.width / 2 + 100, Math.min(this.x, CONFIG.canvas.width - 150));
        }
        
        // Update facing direction based on movement
        if (Math.abs(this.velocityX) > 1) {
            this.facingRight = this.velocityX > 0;
        }
        
        // For player1 (left side), always face right. For player2 (right side), always face left
        if (this.id === 'player1') {
            this.facingRight = true;
        } else {
            this.facingRight = false;
        }
    }
    
    updateState() {
        if (this.isStunned || this.isAttacking || this.health <= 0) return;
        
        if (!this.isGrounded) {
            this.state = 'jump';
        } else if (Math.abs(this.velocityX) > 1) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }
        
        if (this.inputs.block && this.isGrounded && !this.isAttacking) {
            this.state = 'block';
            this.isBlocking = true;
        } else {
            this.isBlocking = false;
        }
        
        if (this.inputs.punch && this.canAct && !this.isBlocking) {
            this.attack('punch');
        } else if (this.inputs.kick && this.canAct && !this.isBlocking) {
            this.attack('kick');
        }
        
        if (this.inputs.jump && this.isGrounded && !this.isAttacking && !this.isBlocking) {
            this.jump();
        }
    }
    
    attack(type) {
        if (this.isAttacking || this.isStunned) return;
        
        this.isAttacking = true;
        this.state = type;
        this.attackTimer = 20;
        this.canAct = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Reset attack input to prevent multiple attacks
        if (type === 'punch') this.inputs.punch = false;
        if (type === 'kick') this.inputs.kick = false;
        
        setTimeout(() => {
            this.canAct = true;
        }, 400);
    }
    
    jump() {
        if (!this.isGrounded || this.isAttacking) return;
        this.velocityY = -12;
        this.isGrounded = false;
        this.inputs.jump = false;
        this.state = 'jump';
    }
    
    takeDamage(amount, attacker) {
        if (this.isBlocking) {
            amount *= 0.3;
        }
        
        this.health = Math.max(0, this.health - amount);
        this.isStunned = true;
        this.stunTimer = CONFIG.fighter.stunDuration;
        this.isAttacking = false;
        
        if (this.health > 0) {
            this.state = 'hurt';
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
        
        // Push back
        const direction = this.x < attacker.x ? -1 : 1;
        this.velocityX = direction * CONFIG.fighter.pushbackOnHit;
        
        // Reset stun after animation
        setTimeout(() => {
            if (this.state === 'hurt') {
                this.state = 'idle';
                this.isStunned = false;
                this.canAct = true;
            }
        }, 300);
        
        return this.health <= 0;
    }
    
    updateAnimation() {
        const animDurations = {
            idle: 150,
            walk: 100,
            jump: 200,
            punch: 80,
            kick: 80,
            hurt: 100,
            block: 150,
            defeat: 200
        };
        
        const frameCounts = {
            idle: 4,
            walk: 6,
            jump: 3,
            punch: 4,
            kick: 5,
            hurt: 3,
            block: 2,
            defeat: 4
        };
        
        const duration = animDurations[this.state] || 100;
        const frameCount = frameCounts[this.state] || 4;
        
        if (this.animationTimer <= 0) {
            this.animationFrame = (this.animationFrame + 1) % frameCount;
            this.animationTimer = duration;
        } else {
            this.animationTimer--;
        }
    }
    
    updateHitbox() {
        const hitX = this.facingRight ? this.x + this.width : this.x - this.attackHitbox.width;
        this.attackHitbox.x = hitX;
        this.attackHitbox.y = this.y + 40;
    }
    
    checkHit(other) {
        if (!this.isAttacking || this.attackTimer > 12) return false;
        
        const hitbox = this.attackHitbox;
        const otherHitbox = {
            x: other.x,
            y: other.y,
            width: other.width,
            height: other.height
        };
        
        if (hitbox.x < otherHitbox.x + otherHitbox.width &&
            hitbox.x + hitbox.width > otherHitbox.x &&
            hitbox.y < otherHitbox.y + otherHitbox.height &&
            hitbox.y + hitbox.height > otherHitbox.y) {
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Apply flip for player2 (facing left)
        if (!this.facingRight) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        }
        
        // Draw sprite or fallback
        const sprite = this.sprites[this.state];
        if (sprite && this.spritesLoaded) {
            // Draw sprite
            const frameWidth = sprite.width / (this.state === 'walk' ? 6 : 
                                               this.state === 'idle' ? 4 :
                                               this.state === 'kick' ? 5 :
                                               this.state === 'punch' ? 4 : 4);
            const frameHeight = sprite.height;
            const sx = this.animationFrame * frameWidth;
            
            ctx.drawImage(sprite, sx, 0, frameWidth, frameHeight, 
                         0, 0, this.width, this.height);
        } else {
            // Fallback rectangle
            ctx.fillStyle = this.id === 'player1' ? '#ff4444' : '#4444ff';
            ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw name
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px "Courier New"';
            ctx.shadowBlur = 0;
            ctx.fillText(this.name, this.width / 2 - 30, -10);
            
            // Draw state and health
            ctx.font = '10px monospace';
            ctx.fillStyle = 'yellow';
            ctx.fillText(`${this.state}`, this.width / 2 - 20, -25);
            ctx.fillStyle = 'red';
            ctx.fillText(`${Math.floor(this.health)}`, this.width / 2 - 15, 20);
        }
        
        // Draw attack hitbox when attacking (debug)
        if (this.isAttacking && window.DEBUG) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(this.attackHitbox.x - (this.facingRight ? 0 : this.attackHitbox.width), 
                        this.attackHitbox.y, 
                        this.attackHitbox.width, 
                        this.attackHitbox.height);
        }
        
        ctx.restore();
    }
    
    setInputs(inputs) {
        this.inputs = { ...inputs };
    }
    
    reset(position) {
        this.x = position;
        this.y = CONFIG.fighter.groundY - this.height;
        this.health = this.maxHealth;
        this.state = 'idle';
        this.isAttacking = false;
        this.isStunned = false;
        this.canAct = true;
        this.velocityX = 0;
        this.velocityY = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
}