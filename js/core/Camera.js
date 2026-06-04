/**
 * Camera - Handles viewport positioning, zoom, and parallax effects
 */
 class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = worldWidth;
        this.x = (worldWidth - canvasWidth) / 2;
        this.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.prevX = this.x;
        
        // Parallax offsets
        this.parallaxOffsets = [0, 0, 0];
    }
    
    update(fighter1, fighter2) {
        if (!fighter1 || !fighter2) return;
        
        // Calculate center point between fighters
        const centerX = (fighter1.x + fighter2.x) / 2;
        const distance = Math.abs(fighter1.x - fighter2.x);
        
        // Dynamic zoom based on distance
        let targetZoom = 1.0;
        if (distance > window.GameConfig.CAMERA_LEASH_DISTANCE) {
            targetZoom = Math.max(
                window.GameConfig.CAMERA_ZOOM_MIN,
                1.0 - (distance - window.GameConfig.CAMERA_LEASH_DISTANCE) * 0.001
            );
        }
        
        this.targetZoom = Math.max(window.GameConfig.CAMERA_ZOOM_MIN, 
                                   Math.min(window.GameConfig.CAMERA_ZOOM_MAX, targetZoom));
        this.zoom += (this.targetZoom - this.zoom) * window.GameConfig.CAMERA_ZOOM_SPEED;
        
        // Update camera X position (clamped to world bounds)
        let targetX = centerX - this.canvasWidth / 2;
        targetX = Math.max(0, Math.min(targetX, this.worldWidth - this.canvasWidth));
        this.x += (targetX - this.x) * 0.1;
        
        // Update parallax offsets
        const cameraDelta = this.x - this.prevX;
        for (let i = 0; i < this.parallaxOffsets.length; i++) {
            const speed = window.GameConfig.PARALLAX_LAYERS[i]?.speed || 0.1;
            this.parallaxOffsets[i] += cameraDelta * speed;
        }
        this.prevX = this.x;
    }
    
    /**
     * Convert world coordinates to screen coordinates
     */
     worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.x) * this.zoom;
        const screenY = (worldY - this.y) * this.zoom;
        return { x: screenX, y: screenY };
    }
    
    apply(ctx) {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    }
    
    restore(ctx) {
        ctx.restore();
    }
    
    drawParallaxBackground(ctx, assets) {
        ctx.save();
        ctx.resetTransform();
        
        // Fill with dark color
        ctx.fillStyle = '#0a0515';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Try to load background images from assets
        const bgFar = assets ? assets.get('bg_far') : null;
        const bgMid = assets ? assets.get('bg_mid') : null;
        const bgNear = assets ? assets.get('bg_near') : null;
        const groundImg = assets ? assets.get('ground') : null;
        
        // Far background layer
        if (bgFar && bgFar.complete !== false && bgFar.width > 0) {
            const farOffset = (this.parallaxOffsets[0] || 0) * 0.5;
            const bgWidth = bgFar.width;
            const xOffset = farOffset % bgWidth;
            for (let x = -bgWidth; x < this.canvasWidth + bgWidth; x += bgWidth) {
                ctx.drawImage(bgFar, x + xOffset, 0, bgWidth, this.canvasHeight);
            }
        } else {
            const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
            gradient.addColorStop(0, '#2a1a3a');
            gradient.addColorStop(0.5, '#1a0a2a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        // Mid background layer
        if (bgMid && bgMid.complete !== false && bgMid.width > 0) {
            const midOffset = (this.parallaxOffsets[1] || 0) * 0.7;
            const bgWidth = bgMid.width;
            const xOffset = midOffset % bgWidth;
            for (let x = -bgWidth; x < this.canvasWidth + bgWidth; x += bgWidth) {
                ctx.drawImage(bgMid, x + xOffset, 50, bgWidth, this.canvasHeight - 100);
            }
        }
        
        // Ground layer
        const groundY = window.GameConfig.GROUND_Y;
        if (groundImg && groundImg.complete !== false && groundImg.width > 0) {
            const groundOffset = (this.parallaxOffsets[2] || 0) * 1.2;
            const bgWidth = groundImg.width;
            const xOffset = groundOffset % bgWidth;
            for (let x = -bgWidth; x < this.canvasWidth + bgWidth; x += bgWidth) {
                ctx.drawImage(groundImg, x + xOffset, groundY, bgWidth, this.canvasHeight - groundY);
            }
        } else {
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(0, groundY, this.canvasWidth, this.canvasHeight - groundY);
            ctx.fillStyle = '#5a3a2a';
            for (let i = 0; i < 30; i++) {
                ctx.fillRect(i * 80, groundY + 5, 40, 5);
            }
        }
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, groundY, this.canvasWidth, 3);
        
        ctx.restore();
    }
    
    reset() {
        this.x = (this.worldWidth - this.canvasWidth) / 2;
        this.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.parallaxOffsets = [0, 0, 0];
        this.prevX = this.x;
    }
}