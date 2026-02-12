/**
 * FIXED VIBE OS Visualizer Template
 */
class AudioVisualizer {
    constructor(config) {
        this.config = {
            canvasMode: '2D',
            colors: { primary: '#00FF00', background: 'rgba(0, 0, 0, 1)' },
            ui: { title: 'SYSTEM_ACTIVE', buttonText: 'INITIALIZE' },
            audio: {
                fftSize: 512,
                beatThreshold: 220,
                bassRange: { start: 0, end: 10 },
                midRange: { start: 20, end: 60 },
                trebleRange: { start: 100, end: 180 }
            },
            ...config
        };

        this.analyzer = null;
        this.dataArray = null;
        this.audioCtx = null;
        this.isPlaying = false;
        
        // Safety: Only init UI if the DOM is ready
        if (document.readyState === 'complete') {
            this.init();
        } else {
            window.addEventListener('load', () => this.init());
        }
    }

    init() {
        this.setupUI();
    }

    setupUI() {
        const ui = document.getElementById('ui');
        if (!ui) return; // Prevent crash if UI isn't found yet

        const title = ui.querySelector('h1');
        const btn = ui.querySelector('.btn');
        const loader = document.getElementById('loader');

        if (title) title.textContent = this.config.ui.title;
        if (btn) btn.textContent = this.config.ui.buttonText;

        // Apply theme colors
        ui.style.color = this.config.colors.primary;
        ui.style.borderColor = this.config.colors.primary;

        loader.onchange = (e) => this.handleFileSelect(e);
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        const audio = document.getElementById('audio-element');
        audio.src = url;
        
        this.startAudio(audio);
        
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.opacity = 0;
            ui.style.pointerEvents = 'none';
        }
    }

    startAudio(audio) {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioCtx.createAnalyser();
            const source = this.audioCtx.createMediaElementSource(audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioCtx.destination);
            this.analyzer.fftSize = this.config.audio.fftSize;
            this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        }
        
        this.audioCtx.resume().then(() => {
            audio.play();
            this.isPlaying = true;
        });
    }

    getAverageFrequency(start, end) {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = start; i < end; i++) sum += this.dataArray[i];
        return sum / (end - start);
    }

    getBass() { return this.getAverageFrequency(this.config.audio.bassRange.start, this.config.audio.bassRange.end); }
    getMid() { return this.getAverageFrequency(this.config.audio.midRange.start, this.config.audio.midRange.end); }
    getTreble() { return this.getAverageFrequency(this.config.audio.trebleRange.start, this.config.audio.trebleRange.end); }
    isBeat() { return this.getBass() > this.config.audio.beatThreshold; }

    setupCanvas() { /* Overridden in subclasses */ }
    draw() { /* Overridden in subclasses */ }
}

window.AudioVisualizer = AudioVisualizer;
