/**
 * Camera - Handles viewport positioning, zoom, and parallax effects
 * Dynamically adjusts zoom based on fighter distance
 */
 class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth) {
        this.x = 0;
        this.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = worldWidth;
        
        // Parallax offsets
        this.parallaxOffsets = [0, 0, 0];
    }
    
    /**
     * Update camera position and zoom based on fighters
     * @param {Object} fighter1 - Player 1 position
     * @param {Object} fighter2 - Player 2 position
     */
    update(fighter1, fighter2) {
        if (!fighter1 || !fighter2) return;
        
        // Calculate center point between fighters
        const centerX = (fighter1.x + fighter2.x) / 2;
        const distance = Math.abs(fighter1.x - fighter2.x);
        
        // Dynamic zoom based on distance
        const zoomFactor = Math.max(
            GameConfig.CAMERA_ZOOM_MIN,
            Math.min(GameConfig.CAMERA_ZOOM_MAX, 
                GameConfig.CAMERA_ZOOM_MAX - (distance - GameConfig.CAMERA_LEASH_DISTANCE) * 0.002)
        );
        
        this.targetZoom = Math.max(GameConfig.CAMERA_ZOOM_MIN, Math.min(GameConfig.CAMERA_ZOOM_MAX, zoomFactor));
        this.zoom += (this.targetZoom - this.zoom) * GameConfig.CAMERA_ZOOM_SPEED;
        
        // Update camera X position (clamped to world bounds)
        let targetX = centerX - (this.canvasWidth / 2) / this.zoom;
        targetX = Math.max(0, Math.min(targetX, this.worldWidth - this.canvasWidth / this.zoom));
        this.x += (targetX - this.x) * 0.1;
        
        // Update parallax offsets based on camera movement
        const cameraDelta = this.x - (this.prevX || this.x);
        for (let i = 0; i < this.parallaxOffsets.length; i++) {
            const speed = GameConfig.PARALLAX_LAYERS[i]?.speed || 0.1;
            this.parallaxOffsets[i] += cameraDelta * speed;
        }
        this.prevX = this.x;
    }
    
    /**
     * Apply camera transformation to canvas context
     * @param {CanvasRenderingContext2D} ctx 
     */
    apply(ctx) {
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x - this.canvasWidth / 2 / this.zoom, -this.y);
    }
    
    /**
     * Restore canvas context
     * @param {CanvasRenderingContext2D} ctx 
     */
    restore(ctx) {
        ctx.restore();
    }
    
    /**
     * Draw parallax background layers
     * @param {CanvasRenderingContext2D} ctx 
     * @param {AssetManager} assets 
     */
    drawParallaxBackground(ctx, assets) {
        // Draw without camera transform for background
        ctx.save();
        ctx.resetTransform();
        
        for (let i = 0; i < GameConfig.PARALLAX_LAYERS.length; i++) {
            const layer = GameConfig.PARALLAX_LAYERS[i];
            const offset = this.parallaxOffsets[i] || 0;
            const speed = layer.speed;
            const bgImage = assets.get(`bg_layer_${i}`) || assets.get('bg_far');
            
            if (bgImage) {
                const bgWidth = layer.width;
                const xOffset = (offset % bgWidth) - bgWidth;
                
                for (let x = xOffset; x < this.canvasWidth + bgWidth; x += bgWidth) {
                    ctx.drawImage(bgImage, x, 0, bgWidth, this.canvasHeight);
                }
            }
        }
        
        // Draw ground
        const groundImg = assets.get('ground');
        if (groundImg) {
            const groundY = GameConfig.GROUND_Y;
            const pattern = ctx.createPattern(groundImg, 'repeat-x');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, groundY, this.canvasWidth, this.canvasHeight - groundY);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Reset camera to default state
     */
    reset() {
        this.x = GameConfig.WORLD_WIDTH / 2 - this.canvasWidth / 2;
        this.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.parallaxOffsets = [0, 0, 0];
    }
}