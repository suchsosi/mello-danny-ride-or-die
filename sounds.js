// Audio System - Generate sounds procedurally
class GameAudio {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
    }

    playSound(type) {
        try {
            switch(type) {
                case 'hit':
                    this.playHitSound();
                    break;
                case 'collect':
                    this.playCollectSound();
                    break;
                case 'boost':
                    this.playBoostSound();
                    break;
            }
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playHitSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        
        gain.gain.setValueAtTime(this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playCollectSound() {
        const now = this.audioContext.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const freq = 600 + (i * 150);
            osc.frequency.setValueAtTime(freq, now + (i * 0.05));
            
            gain.gain.setValueAtTime(this.masterVolume, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.1);
            
            osc.start(now + (i * 0.05));
            osc.stop(now + (i * 0.05) + 0.1);
        }
    }

    playBoostSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        
        gain.gain.setValueAtTime(this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playBackgroundMusic() {
        // Synthwave-inspired procedural music
        this.playMelody();
    }

    playMelody() {
        const now = this.audioContext.currentTime;
        const notes = [440, 494, 523, 587, 659, 740, 831]; // A4 to A5
        
        let time = now;
        for (let i = 0; i < 8; i++) {
            const freq = notes[i % notes.length];
            this.playNote(freq, time, 0.3);
            time += 0.4;
        }
        
        // Loop
        this.audioContext.createPeriodicWave = this.audioContext.createPeriodicWave || (() => {});
    }

    playNote(frequency, startTime, duration) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, startTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
}

// Initialize audio on first user interaction
window.gameAudio = null;

document.addEventListener('click', () => {
    if (!window.gameAudio) {
        window.gameAudio = new GameAudio();
    }
}, { once: true });

document.addEventListener('keydown', () => {
    if (!window.gameAudio) {
        window.gameAudio = new GameAudio();
    }
}, { once: true });