/**
 * Music Manager - Handles background music and sound effects
 * Simple but extensible implementation
 */
class MusicManager {
    constructor() {
        this.backgroundMusic = null;
        this.currentTrack = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.isLooping = true;
        this.defaultMusicUrl = null;
    }
    
    init() {
        if (!window.Audio) {
            console.warn('Audio not supported in this browser');
            return false;
        }
        console.log('MusicManager initialized successfully');
        return true;
    }
    
    setDefaultMusicUrl(url) {
        this.defaultMusicUrl = url;
        console.log('Default music URL set:', url);
    }
    
    async playBackgroundMusic(url, loop = true) {
        try {
            this.stopBackgroundMusic();
            
            if (!url) {
                console.warn('No music URL provided');
                return;
            }
            
            this.isLooping = loop;
            this.backgroundMusic = new Audio(url);
            this.backgroundMusic.loop = loop;
            this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
            
            await this.backgroundMusic.play();
            this.currentTrack = url;
            console.log('Background music started');
        } catch (error) {
            console.error('Failed to play background music:', error);
        }
    }
    
    playGameMusic() {
        if (this.defaultMusicUrl) {
            this.playBackgroundMusic(this.defaultMusicUrl, true);
        } else {
            console.warn('No default music URL configured');
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
            this.currentTrack = null;
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
    }
    
    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(e => console.warn('Resume failed:', e));
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        }
        console.log('Volume set to:', this.volume);
    }
    
    getVolume() {
        return this.volume;
    }
    
    setMuted(muted) {
        this.isMuted = muted;
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = muted ? 0 : this.volume;
        }
    }
    
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
    
    isPlaying() {
        return this.backgroundMusic !== null && !this.backgroundMusic.paused;
    }
    
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
}
