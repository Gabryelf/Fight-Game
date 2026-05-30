// Main entry point
(function() {
    const canvas = document.getElementById('game-canvas');
    const overlay = document.getElementById('ui-overlay');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const game = new Game(canvas, overlay);
    game.start();
    
    // Handle window resize
    function resizeGame() {
        const container = document.getElementById('game-container');
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 40;
        const scaleX = maxWidth / GameConfig.canvas.width;
        const scaleY = maxHeight / GameConfig.canvas.height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        container.style.width = `${GameConfig.canvas.width * scale}px`;
        container.style.height = `${GameConfig.canvas.height * scale}px`;
    }
    
    window.addEventListener('resize', resizeGame);
    resizeGame();
    
    console.log('Game initialized!');
})();