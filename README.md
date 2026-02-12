# Glow Beats - Refactored Architecture

## Overview
The visualizers have been refactored into a reusable, config-driven architecture using an `AudioVisualizer` base class. This makes it extremely easy to add new visualizer effects.

## File Structure

```
glow-beats/
├── index.html                 # Main menu & module loader
├── 1.html                     # Hyperspace (3D visualizer)
├── 2.html                     # Neon Glitch (2D visualizer)
├── visualizer-template.js     # Base AudioVisualizer class (SHARED)
└── README.md                  # This file
```

## How It Works

### Base Class: `AudioVisualizer` (visualizer-template.js)

The `AudioVisualizer` class handles all common functionality:
- **Audio Input**: File selection, audio context setup, playback
- **Frequency Analysis**: Bass, Mid, Treble extraction
- **Beat Detection**: Configurable beat thresholds
- **UI Setup**: Dynamic title, button text, colors
- **Helper Methods**: Frequency averaging, beat checking, value mapping

### How Each Visualizer Works

Each HTML file (1.html, 2.html) extends the base class:

```javascript
class HyperspaceVisualizer extends AudioVisualizer {
    constructor() {
        super({
            // Configuration object
        });
    }

    setupCanvas() {
        // Custom canvas setup (called once)
    }

    draw() {
        // Custom drawing logic (called every frame)
    }
}
```

## Configuration Object

Each visualizer accepts a config object with these properties:

```javascript
{
    canvasMode: 'WEBGL' or '2D',
    colors: {
        primary: '#fff',           // Main text/border color
        background: 'rgba(...)',   // UI background
        border: '#fff'             // UI border color
    },
    ui: {
        title: 'VISUALIZER NAME',
        buttonText: 'PLAY',
        titleLetterSpacing: '20px'
    },
    audio: {
        fftSize: 512,              // FFT resolution
        beatThreshold: 220,        // Beat sensitivity (0-255)
        bassRange: { start: 0, end: 10 },
        midRange: { start: 20, end: 60 },
        trebleRange: { start: 100, end: 180 }
    }
}
```

## Available Methods in AudioVisualizer

```javascript
// Audio analysis
getBass()              // Returns average bass frequency (0-255)
getMid()               // Returns average mid frequency (0-255)
getTreble()            // Returns average treble frequency (0-255)
isBeat()               // Returns true if current bass > beatThreshold

// Utilities
mapValue(value, inMin, inMax, outMin, outMax)  // Like p5.js map()
getAverageFrequency(start, end)                // Get avg of frequency range

// State Variables (read-only)
analyzer              // Web Audio AnalyserNode
dataArray             // Uint8Array of frequency data
audioCtx              // AudioContext
isPlaying             // Boolean playback state
```

## How to Create a NEW Visualizer

### Step 1: Create new HTML file (e.g., `3.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vibe Pulse | My Visualizer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script src="visualizer-template.js"></script>
    <style>
        body { margin: 0; background: #000; overflow: hidden; }
        #ui { 
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            z-index: 100; text-align: center; font-family: 'Courier New', monospace; 
            opacity: 1; pointer-events: auto; transition: opacity 0.3s;
            background: rgba(0, 0, 50, 0.7);
            padding: 40px 60px;
            border: 2px solid #0088FF;
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }
        #ui h1 { margin: 0 0 30px 0; font-size: 32px; color: #0088FF; }
        .btn { 
            padding: 16px 50px; border: 2px solid #0088FF; background: none; 
            color: #0088FF; cursor: pointer; letter-spacing: 4px; 
            font-weight: bold; text-transform: uppercase;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            border-radius: 5px;
            transition: all 0.3s;
        }
        .btn:hover { 
            background: #0088FF; 
            color: #000; 
            box-shadow: 0 0 50px #0088FF;
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div id="ui">
        <h1>MY VISUALIZER</h1>
        <input type="file" id="loader" accept="audio/*" style="display:none">
        <label for="loader" class="btn">LAUNCH</label>
    </div>

    <audio id="audio-element" crossorigin="anonymous"></audio>

    <script>
        class MyVisualizer extends AudioVisualizer {
            constructor() {
                super({
                    canvasMode: 'WEBGL',  // or '2D'
                    colors: {
                        primary: '#0088FF',
                        background: 'rgba(0, 0, 50, 0.7)',
                        border: '#0088FF'
                    },
                    ui: {
                        title: 'MY VISUALIZER',
                        buttonText: 'LAUNCH',
                        titleLetterSpacing: '15px'
                    },
                    audio: {
                        fftSize: 512,
                        beatThreshold: 220,
                        bassRange: { start: 0, end: 10 },
                        midRange: { start: 20, end: 60 },
                        trebleRange: { start: 100, end: 180 }
                    }
                });
            }

            setupCanvas() {
                createCanvas(windowWidth, windowHeight, WEBGL);
                colorMode(RGB, 255, 255, 255, 255);
            }

            draw() {
                background(0, 20);

                if (this.isPlaying && this.analyzer) {
                    this.analyzer.getByteFrequencyData(this.dataArray);

                    const bass = this.getBass();
                    const mid = this.getMid();
                    const treble = this.getTreble();
                    const isBeat = this.isBeat();

                    // ===== YOUR CUSTOM VISUALIZATION CODE HERE =====
                    
                    // Example: Draw a simple sphere that responds to audio
                    push();
                    fill(bass, mid, treble);
                    sphere(map(bass, 0, 255, 50, 200));
                    pop();
                }
            }
        }

        let visualizer;
        function setup() {
            visualizer = new MyVisualizer();
            visualizer.setupCanvas();
        }

        function draw() {
            visualizer.draw();
        }

        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
        }
    </script>
</body>
</html>
```

### Step 2: Register in index.html

In `index.html`, add to the `files` array:

```javascript
const files = [
    { name: "1 | HYPERSPACE", url: "1.html" },
    { name: "2 | NEON GLITCH", url: "2.html" },
    { name: "3 | MY VISUALIZER", url: "3.html" },  // ADD THIS
];
```

That's it! Your new visualizer will automatically:
- ✅ Load in the menu
- ✅ Accept audio files  
- ✅ Handle audio analysis
- ✅ Respond to beats
- ✅ Have proper styling
- ✅ Be responsive
- ✅ Support keyboard navigation

## Benefits of This Architecture

✨ **Code Reuse**: 80% less duplication  
✨ **Easy to Extend**: Just override `draw()` method  
✨ **Consistent UI**: All visualizers have matching theme  
✨ **Configuration-Driven**: Change behavior without code duplication  
✨ **Maintainable**: Bug fixes in base class apply to all visualizers  
✨ **Scalable**: Add infinite visualizers without touching core code  

## Example: Create a "Particle System" Visualizer

```javascript
class ParticleVisualizer extends AudioVisualizer {
    constructor() {
        super({ /* config */ });
        this.particles = [];
    }

    setupCanvas() {
        createCanvas(windowWidth, windowHeight);
    }

    draw() {
        background(0, 10);

        if (this.isPlaying && this.analyzer) {
            this.analyzer.getByteFrequencyData(this.dataArray);
            const bass = this.getBass();

            // Spawn particles on beat
            if (this.isBeat()) {
                for (let i = 0; i < 5; i++) {
                    this.particles.push({
                        x: width/2,
                        y: height/2,
                        vx: random(-10, 10),
                        vy: random(-10, 10),
                        life: 255
                    });
                }
            }

            // Update and draw particles
            for (let p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 5;

                stroke(bass, p.life);
                strokeWeight(2);
                point(p.x, p.y);
            }

            this.particles = this.particles.filter(p => p.life > 0);
        }
    }
}
```

## Troubleshooting

**Visualizer doesn't load?**
- Check that `visualizer-template.js` is in the same directory
- Ensure `<script src="visualizer-template.js"></script>` is included

**Audio not playing?**
- Check browser console for CORS errors
- Ensure file path in `<audio>` element is correct

**Frequency data looks weird?**
- Adjust `fftSize` (256, 512, 1024, 2048, 4096)
- Adjust freq frequency ranges in config

---

**Happy Creating!** 🎨🔊
