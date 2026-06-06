/**
 * Music Manager - Handles background music and sound effects
 * Simple but extensible implementation
 */
class MusicManager {
    constructor() {
        this.backgroundMusic = null;
        this.currentTrack = null;
        this.isMuted = false;
        this.volume = 0.5; // 0.0 to 1.0
        this.isLooping = true;
        this.audioContext = null;
        this.useWebAudio = false;
        
        // Track list for future expansion
        this.tracks = {
            menu: null,
            battle: null,
            victory: null,
            characterSelect: null
        };
    }
    
    /**
     * Initialize audio system
     */
    init() {
        // Check if browser supports audio
        if (!window.Audio) {
            console.warn('Audio not supported in this browser');
            return false;
        }
        
        // Try to use Web Audio API for better control (optional)
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                this.audioContext = new AudioContext();
                this.useWebAudio = true;
            }
        } catch (e) {
            console.log('Web Audio API not available, using standard Audio');
        }
        
        return true;
    }
    
    /**
     * Play background music from URL
     * @param {string} url - URL to the audio file
     * @param {boolean} loop - Whether to loop the music
     */
    async playBackgroundMusic(url, loop = true) {
        try {
            // Stop current music if playing
            this.stopBackgroundMusic();
            
            this.isLooping = loop;
            
            // Simple approach using standard Audio
            this.backgroundMusic = new Audio(url);
            this.backgroundMusic.loop = loop;
            this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
            
            // Load and play
            await this.backgroundMusic.play();
            this.currentTrack = url;
            
            console.log('Background music started');
            
        } catch (error) {
            console.error('Failed to play background music:', error);
        }
    }
    
    /**
     * Play music using your GitHub audio file
     */
    playGameMusic() {
        const musicUrl = 'https://raw.githubusercontent.com/Gabryelf/Atlas-Assets/main/assets/audio/music/loop/bandicam%202026-06-06%2009-43-06-730.mp3';
        this.playBackgroundMusic(musicUrl, true);
    }
    
    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
            this.currentTrack = null;
        }
    }
    
    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
    }
    
    /**
     * Resume background music
     */
    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(e => console.warn('Resume failed:', e));
        }
    }
    
    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        }
    }
    
    /**
     * Mute/unmute audio
     */
    setMuted(muted) {
        this.isMuted = muted;
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = muted ? 0 : this.volume;
        }
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
    
    /**
     * Check if music is currently playing
     */
    isPlaying() {
        return this.backgroundMusic !== null && !this.backgroundMusic.paused;
    }
    
    /**
     * Fade out music over specified duration (milliseconds)
     */
    fadeOut(duration = 1000) {
        if (!this.backgroundMusic) return;
        
        const startVolume = this.backgroundMusic.volume;
        const startTime = performance.now();
        
        const fade = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const newVolume = startVolume * (1 - progress);
            
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = newVolume;
            }
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                this.stopBackgroundMusic();
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    /**
     * Fade in music over specified duration
     */
    fadeIn(url, duration = 1000, loop = true) {
        this.playBackgroundMusic(url, loop).then(() => {
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = 0;
                const startTime = performance.now();
                
                const fade = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(1, elapsed / duration);
                    const newVolume = this.volume * progress;
                    
                    if (this.backgroundMusic) {
                        this.backgroundMusic.volume = newVolume;
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(fade);
                    }
                };
                
                requestAnimationFrame(fade);
            }
        });
    }
}
