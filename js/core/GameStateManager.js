/**
 * GameStateManager - Manages game states (menu, fighting, paused, game over)
 */
 class GameStateManager {
    constructor() {
        this.state = 'menu'; // menu, selecting, fighting, paused, gameOver
        this.listeners = [];
    }
    
    setState(newState) {
        this.state = newState;
        this.notifyListeners();
    }
    
    getState() {
        return this.state;
    }
    
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.state));
    }
    
    isFighting() {
        return this.state === 'fighting';
    }
    
    isPaused() {
        return this.state === 'paused';
    }
}