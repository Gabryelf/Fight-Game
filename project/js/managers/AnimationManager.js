// Animation Manager
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.currentAnimations = new Map();
        this.spriteSheets = new Map();
    }
    
    loadAnimation(name, frames, frameTime, loop) {
        this.animations.set(name, {
            frames: frames,
            frameTime: frameTime,
            loop: loop,
            currentFrame: 0,
            timer: 0
        });
    }
    
    loadSpriteSheet(name, imagePath, frameWidth, frameHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.spriteSheets.set(name, {
                    image: img,
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                    cols: img.width / frameWidth
                });
                resolve();
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }
    
    playAnimation(entityId, animationName) {
        const anim = this.animations.get(animationName);
        if (anim) {
            this.currentAnimations.set(entityId, {
                name: animationName,
                ...anim,
                currentFrame: 0,
                timer: 0
            });
        }
    }
    
    update(entityId, deltaTime) {
        const currentAnim = this.currentAnimations.get(entityId);
        if (!currentAnim) return null;
        
        currentAnim.timer += deltaTime;
        
        if (currentAnim.timer >= currentAnim.frameTime) {
            currentAnim.timer = 0;
            currentAnim.currentFrame++;
            
            if (currentAnim.currentFrame >= currentAnim.frames) {
                if (currentAnim.loop) {
                    currentAnim.currentFrame = 0;
                } else {
                    this.currentAnimations.delete(entityId);
                    return null;
                }
            }
        }
        
        return currentAnim;
    }
    
    drawSprite(ctx, spriteName, frame, x, y, width, height, flip = false) {
        const sprite = this.spriteSheets.get(spriteName);
        if (!sprite) return false;
        
        const col = frame % sprite.cols;
        const row = Math.floor(frame / sprite.cols);
        const sx = col * sprite.frameWidth;
        const sy = row * sprite.frameHeight;
        
        ctx.save();
        
        if (flip) {
            ctx.translate(x + width, y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite.image, sx, sy, sprite.frameWidth, sprite.frameHeight, 
                         0, 0, width, height);
        } else {
            ctx.drawImage(sprite.image, sx, sy, sprite.frameWidth, sprite.frameHeight, 
                         x, y, width, height);
        }
        
        ctx.restore();
        return true;
    }
    
    getCurrentFrame(entityId) {
        const currentAnim = this.currentAnimations.get(entityId);
        return currentAnim ? currentAnim.currentFrame : 0;
    }
}