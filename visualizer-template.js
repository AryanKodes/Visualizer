/**
 * Reusable Visualizer Template
 * Configure this object to create new visualizers easily
 */

class AudioVisualizer {
    constructor(config) {
        this.config = {
            canvasMode: 'WEBGL', // 'WEBGL' for 3D, '2D' for 2D
            colors: {
                primary: '#fff',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '#fff'
            },
            ui: {
                title: 'VISUALIZER',
                buttonText: 'PLAY',
                titleLetterSpacing: '20px'
            },
            audio: {
                fftSize: 512,
                beatThreshold: 220,
                bassRange: { start: 0, end: 10 },
                midRange: { start: 20, end: 60 },
                trebleRange: { start: 100, end: 180 }
            },
            canvas: {
                backgroundAlpha: 30,
                fps: 60
            },
            ...config
        };

        // State variables
        this.analyzer = null;
        this.dataArray = null;
        this.audioCtx = null;
        this.source = null;
        this.isPlaying = false;

        this.init();
    }

    init() {
        this.setupUI();
        this.setupAudio();
        this.setupCanvas();
    }

    setupUI() {
        const ui = document.getElementById('ui');
        const title = ui.querySelector('h1');
        const btn = ui.querySelector('.btn');
        const loader = document.getElementById('loader');

        title.textContent = this.config.ui.title;
        title.style.letterSpacing = this.config.ui.titleLetterSpacing;
        btn.textContent = this.config.ui.buttonText;

        // Apply colors to UI
        ui.style.color = this.config.colors.primary;
        ui.style.borderColor = this.config.colors.primary;
        ui.style.backgroundColor = this.config.colors.background;

        // File input handler
        loader.onchange = (e) => this.handleFileSelect(e);
    }

    setupAudio() {
        // Audio context will be created on first play
    }

    setupCanvas() {
        // Override in subclass for custom setup
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        const audio = document.getElementById('audio-element');
        audio.src = url;
        this.startAudio();
        document.getElementById('ui').style.opacity = 0;
        document.getElementById('ui').style.pointerEvents = 'none';
    }

    startAudio() {
        const audio = document.getElementById('audio-element');
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioCtx.createAnalyser();
            this.source = this.audioCtx.createMediaElementSource(audio);
            this.source.connect(this.analyzer);
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
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += this.dataArray[i];
        }
        return sum / (end - start);
    }

    getBass() {
        return this.getAverageFrequency(
            this.config.audio.bassRange.start,
            this.config.audio.bassRange.end
        );
    }

    getMid() {
        return this.getAverageFrequency(
            this.config.audio.midRange.start,
            this.config.audio.midRange.end
        );
    }

    getTreble() {
        return this.getAverageFrequency(
            this.config.audio.trebleRange.start,
            this.config.audio.trebleRange.end
        );
    }

    isBeat() {
        return this.getBass() > this.config.audio.beatThreshold;
    }

    // Override this method in subclass for custom drawing logic
    draw() {
        console.warn('draw() method not implemented');
    }

    // Helper for p5.js map function
    mapValue(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
}

// Export for use in HTML files
window.AudioVisualizer = AudioVisualizer;
