// Scene Manager
class SceneManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentScene = 'game';
        this.background = null;
        this.foreground = null;
        this.particles = [];
        this.camera = {
            x: 0,
            y: 0,
            shake: 0
        };
    }
    
    loadBackground(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.background = img;
                resolve();
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }
    
    addParticle(x, y, vx, vy, life, color) {
        this.particles.push({
            x, y, vx, vy, life, color,
            maxLife: life
        });
    }
    
    updateParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
    
    shakeCamera(intensity, duration) {
        this.camera.shake = intensity;
        setTimeout(() => {
            this.camera.shake = 0;
        }, duration);
    }
    
    drawBackground() {
        if (this.background) {
            // Draw tiled or stretched background
            this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Draw gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#2a1a0a');
            gradient.addColorStop(1, '#1a0a00');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw ground
            this.ctx.fillStyle = '#3a2a1a';
            this.ctx.fillRect(0, CONFIG.fighter.groundY, this.canvas.width, this.canvas.height - CONFIG.fighter.groundY);
            
            // Draw grid on ground
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < this.canvas.width; i += 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, CONFIG.fighter.groundY);
                this.ctx.lineTo(i, this.canvas.height);
                this.ctx.stroke();
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillRect(p.x, p.y, 4, 4);
        }
        this.ctx.globalAlpha = 1;
    }
    
    applyCamera() {
        if (this.camera.shake > 0) {
            const shakeX = (Math.random() - 0.5) * this.camera.shake;
            const shakeY = (Math.random() - 0.5) * this.camera.shake;
            this.ctx.translate(shakeX, shakeY);
        }
    }
    
    render(gameObjects) {
        // Apply camera shake
        this.ctx.save();
        this.applyCamera();
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects (fighters)
        if (gameObjects && gameObjects.draw) {
            gameObjects.draw(this.ctx);
        }
        
        // Draw particles
        this.drawParticles();
        
        this.ctx.restore();
    }
    
    changeScene(sceneName) {
        this.currentScene = sceneName;
        // Clear particles when changing scene
        this.particles = [];
    }
}