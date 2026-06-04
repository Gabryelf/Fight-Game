/**
 * AssetManager - Handles loading of all game assets (images)
 * Provides loading progress callbacks and asset caching
 */
 class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loadingQueue = [];
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    /**
     * Register assets to be loaded
     * @param {string} key - Asset identifier
     * @param {string} url - Asset URL
     */
    registerAsset(key, url) {
        this.loadingQueue.push({ key, url });
        this.totalAssets++;
    }
    
    /**
     * Load all registered assets with progress callback
     * @param {Function} onProgress - Callback for progress updates (0-100)
     * @returns {Promise} - Resolves when all assets loaded
     */
    async loadAll(onProgress) {
        const promises = this.loadingQueue.map(item => {
            return this.loadImage(item.key, item.url);
        });
        
        let loaded = 0;
        for (const promise of promises) {
            await promise;
            loaded++;
            if (onProgress) {
                onProgress(Math.floor((loaded / this.totalAssets) * 100));
            }
        }
        
        console.log('All assets loaded successfully');
        return this.assets;
    }
    
    /**
     * Load single image asset
     * @param {string} key - Asset key
     * @param {string} url - Image URL
     * @returns {Promise}
     */
    loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(key, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load: ${url}, using fallback`);
                // Create colored fallback canvas
                const fallback = this.createFallbackImage(key);
                this.assets.set(key, fallback);
                resolve(fallback);
            };
            img.src = url;
        });
    }
    
    /**
     * Create fallback colored rectangle for missing sprites
     * @param {string} key - Asset key for color hint
     * @returns {HTMLCanvasElement}
     */
    createFallbackImage(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        let color = '#8a6eff';
        if (key.includes('titan')) color = '#ff6a3a';
        if (key.includes('shadow')) color = '#8a6eff';
        if (key.includes('bg')) color = '#2a1a2a';
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(key.substring(0, 8), 10, 60);
        
        return canvas;
    }
    
    /**
     * Get loaded asset by key
     * @param {string} key 
     * @returns {HTMLImageElement|HTMLCanvasElement}
     */
    get(key) {
        return this.assets.get(key);
    }
    
    /**
     * Check if asset is loaded
     * @param {string} key 
     * @returns {boolean}
     */
    isLoaded(key) {
        return this.assets.has(key);
    }
}