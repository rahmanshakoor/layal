// ===== State Management =====
const state = {
    currentScene: 0,
    soundEnabled: false,
    userPhoto: null,
    heartAnimationId: null
};

// ===== Constants =====
const DEFAULT_QUEEN_PHOTO = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<rect fill="#FF1493" width="200" height="200"/>' +
    '<text x="100" y="110" text-anchor="middle" fill="white" font-size="80">👸</text>' +
    '</svg>'
);

// ===== DOM Elements =====
const elements = {
    particles: document.getElementById('particles'),
    bootLog: document.getElementById('boot-log'),
    authSection: document.getElementById('auth-section'),
    camera: document.getElementById('camera'),
    uploadedPhoto: document.getElementById('uploaded-photo'),
    cameraBtn: document.getElementById('camera-btn'),
    uploadBtn: document.getElementById('upload-btn'),
    fileInput: document.getElementById('file-input'),
    authResult: document.getElementById('auth-result'),
    scanLine: document.querySelector('.scan-line'),
    continueJourney: document.getElementById('continue-journey'),
    messageLog: document.getElementById('message-log'),
    continueToHeart: document.getElementById('continue-to-heart'),
    heartCanvas: document.getElementById('heart-canvas'),
    hDisplay: document.getElementById('h-display'),
    continueToWish: document.getElementById('continue-to-wish'),
    blowBtn: document.getElementById('blow-btn'),
    flames: document.querySelectorAll('.flame'),
    queenPhoto: document.getElementById('queen-photo'),
    confetti: document.getElementById('confetti'),
    bgMusic: document.getElementById('bg-music'),
    blowSound: document.getElementById('blow-sound'),
    celebrationSound: document.getElementById('celebration-sound'),
    soundToggle: document.getElementById('sound-toggle'),
    photoCanvas: document.getElementById('photo-canvas'),
    blowParticles: document.getElementById('blow-particles')
};

// ===== Particle Background =====
function initParticles() {
    const canvas = elements.particles;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.1;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '#FF1493' : '#FFB6C1';
        }
        
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            
            if (this.y < 0) {
                this.y = canvas.height;
                this.x = Math.random() * canvas.width;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===== Scene Navigation =====
function showScene(sceneNumber) {
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach((scene, index) => {
        if (index === sceneNumber) {
            scene.classList.add('active');
            scene.style.display = 'flex';
            setTimeout(() => {
                scene.style.opacity = '1';
            }, 50);
        } else {
            scene.style.opacity = '0';
            setTimeout(() => {
                scene.classList.remove('active');
                scene.style.display = 'none';
            }, 800);
        }
    });
    state.currentScene = sceneNumber;
}

// ===== Scene 0: Boot Sequence =====
const bootMessages = [
    { text: '> Initializing Birthday Protocol...', class: 'info', delay: 500 },
    { text: '> Loading Emotional Modules... [OK]', class: 'success', delay: 800 },
    { text: '> Connecting to Heart Database...', class: 'info', delay: 600 },
    { text: '> Friendship Level: MAXIMUM', class: 'highlight', delay: 700 },
    { text: '> Loading Celebration Assets...', class: 'info', delay: 500 },
    { text: '> Happiness.dll loaded successfully', class: 'success', delay: 600 },
    { text: '> Preparing special memories...', class: 'info', delay: 800 },
    { text: '> Authenticating Subject...', class: 'warning', delay: 1000 },
];

async function runBootSequence() {
    for (let i = 0; i < bootMessages.length; i++) {
        await addLogLine(elements.bootLog, bootMessages[i].text, bootMessages[i].class);
        await sleep(bootMessages[i].delay);
    }
    
    // Show auth section after boot
    await sleep(500);
    elements.authSection.classList.remove('hidden');
    elements.authSection.style.animation = 'fadeInUp 0.5s ease-out forwards';
}

function addLogLine(container, text, className = '') {
    return new Promise(resolve => {
        const line = document.createElement('div');
        line.className = `log-line ${className}`;
        line.textContent = text;
        container.appendChild(line);
        container.scrollTop = container.scrollHeight;
        resolve();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Camera & Photo Upload =====
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        elements.camera.srcObject = stream;
        elements.camera.classList.add('active');
        elements.uploadedPhoto.classList.remove('active');
        elements.scanLine.classList.add('active');
        
        // Start face scan animation
        await sleep(3000);
        completeAuthentication();
    } catch (err) {
        console.error('Camera access denied:', err);
        alert('Camera access denied. Please upload a photo instead.');
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            state.userPhoto = e.target.result;
            elements.uploadedPhoto.src = e.target.result;
            elements.uploadedPhoto.classList.add('active');
            elements.camera.classList.remove('active');
            elements.scanLine.classList.add('active');
            
            // Start face scan animation
            await sleep(3000);
            completeAuthentication();
        };
        reader.readAsDataURL(file);
    }
}

async function completeAuthentication() {
    elements.scanLine.classList.remove('active');
    elements.authResult.classList.remove('hidden');
    elements.authResult.style.animation = 'fadeInUp 0.5s ease-out forwards';
    
    // Play success sound if enabled
    if (state.soundEnabled) {
        playSound(elements.celebrationSound, 0.3);
    }
    
    await sleep(2500);
    
    // Store the photo for finale
    if (!state.userPhoto && elements.camera.srcObject) {
        capturePhotoFromCamera();
    }
    
    showScene(1);
    
    // Start background music
    if (state.soundEnabled) {
        elements.bgMusic.volume = 0.3;
        elements.bgMusic.play().catch(() => {});
    }
}

function capturePhotoFromCamera() {
    const canvas = elements.photoCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = elements.camera.videoWidth || 280;
    canvas.height = elements.camera.videoHeight || 280;
    ctx.drawImage(elements.camera, 0, 0, canvas.width, canvas.height);
    state.userPhoto = canvas.toDataURL('image/jpeg');
    
    // Stop camera stream
    const stream = elements.camera.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ===== Scene 2: Message =====
const messageLines = [
    { text: '[LOG 01] Sender: Rahman', class: 'sender' },
    { text: '[LOG 02] Priority: Heartfelt', class: 'priority' },
    { text: '[LOG 03] Message:', class: 'info' },
];

const messageContent = `Happy Birthday Layal 🤍
You are one of the kindest, brightest souls I know.
May this year bring you joy, strength, and beautiful surprises.`;

async function typeMessage() {
    // Type log lines
    for (const line of messageLines) {
        const div = document.createElement('div');
        div.className = `message-line ${line.class}`;
        div.textContent = line.text;
        elements.messageLog.appendChild(div);
        await sleep(500);
    }
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-text';
    elements.messageLog.appendChild(messageDiv);
    
    // Type message character by character
    for (const char of messageContent) {
        messageDiv.textContent += char;
        await sleep(40);
    }
    
    // Add glow effect
    messageDiv.classList.add('complete');
    
    // Show continue button
    await sleep(1000);
    elements.continueToHeart.classList.remove('hidden');
    elements.continueToHeart.style.animation = 'fadeInUp 0.5s ease-out forwards';
}

// ===== Scene 3: Heart Equation =====
// Constants for heart animation
const HEART_H_BASE = 2.25;        // Base h value
const HEART_H_AMPLITUDE = 1.75;   // h oscillation amplitude (h ranges from 0.5 to 4)
const HEART_BREATHING_SPEED = 0.5; // Speed of breathing animation
const HEART_HUE_BASE = 330;       // Base hue for pink color
const HEART_HUE_SHIFT = 20;       // Hue shift range
const HEART_LIGHTNESS_BASE = 55;  // Base lightness percentage
const HEART_LIGHTNESS_SHIFT = 10; // Lightness shift range

function animateExplanationLines() {
    const lines = document.querySelectorAll('.explanation-line');
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, index * 800);
    });
    
    // Show emotional overlay after explanations
    setTimeout(() => {
        const overlay = document.getElementById('emotional-overlay');
        if (overlay) {
            overlay.classList.add('visible');
        }
    }, lines.length * 800 + 1000);
}

function initHeartCanvas() {
    const canvas = elements.heartCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 6;
    
    let time = 0;
    
    // Function: f(x) = x^(2/3) + sqrt(5-x^2) * sin(h*pi*x)
    function f(x, h) {
        const coreCurve = Math.pow(Math.abs(x), 2/3);
        const inner = 5 - x * x;
        if (inner < 0) return null;
        const oscillation = Math.sqrt(inner) * Math.sin(h * Math.PI * x);
        return coreCurve + oscillation;
    }
    
    function drawHeart() {
        // Clear canvas with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        bgGradient.addColorStop(0.5, 'rgba(30, 0, 50, 0.95)');
        bgGradient.addColorStop(1, 'rgba(75, 0, 130, 0.95)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Calculate h using a breathing sinusoidal wave (0.5 to 4)
        const h = HEART_H_BASE + HEART_H_AMPLITUDE * Math.sin(time * HEART_BREATHING_SPEED);
        
        // Draw grid lines with subtle pink glow
        ctx.strokeStyle = 'rgba(255, 20, 147, 0.1)';
        ctx.lineWidth = 0.5;
        const gridSize = 20;
        
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw glowing axes
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 20, 147, 0.5)';
        ctx.strokeStyle = 'rgba(255, 20, 147, 0.4)';
        ctx.lineWidth = 2;
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Calculate glow intensity based on h (more intense when h is higher)
        const hMin = HEART_H_BASE - HEART_H_AMPLITUDE; // 0.5
        const glowIntensity = 10 + (h - hMin) * 8;
        const lineWidth = 2 + (h - hMin) * 0.5;
        
        // Create color gradient based on h (neon pink → rose → soft magenta)
        const hRange = HEART_H_AMPLITUDE * 2; // 3.5
        const hueShift = (h - hMin) / hRange;
        const mainColor = `hsl(${HEART_HUE_BASE + hueShift * HEART_HUE_SHIFT}, 100%, ${HEART_LIGHTNESS_BASE + hueShift * HEART_LIGHTNESS_SHIFT}%)`;
        
        // Draw the heart curve (upper part: +sqrt, lower part: -sqrt for full heart shape)
        // We need to draw both f(x) with + and - for the sqrt term
        
        // Draw upper curve
        ctx.beginPath();
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = mainColor;
        
        const domain = Math.sqrt(5); // x from -sqrt(5) to sqrt(5)
        let firstPoint = true;
        
        for (let px = 0; px <= width; px += 1) {
            const x = (px - centerX) / scale;
            if (Math.abs(x) > domain) continue;
            
            const y = f(x, h);
            if (y === null) continue;
            
            const drawY = centerY - y * scale;
            
            if (firstPoint) {
                ctx.moveTo(px, drawY);
                firstPoint = false;
            } else {
                ctx.lineTo(px, drawY);
            }
        }
        ctx.stroke();
        
        // Draw lower curve (mirrored for the -sqrt part of heart shape)
        ctx.beginPath();
        firstPoint = true;
        
        for (let px = 0; px <= width; px += 1) {
            const x = (px - centerX) / scale;
            if (Math.abs(x) > domain) continue;
            
            const inner = 5 - x * x;
            if (inner < 0) continue;
            
            // Lower curve: x^(2/3) - sqrt(5-x^2) * sin(h*pi*x)
            const term1 = Math.pow(Math.abs(x), 2/3);
            const term2 = Math.sqrt(inner) * Math.sin(h * Math.PI * x);
            const y = term1 - term2;
            
            const drawY = centerY - y * scale;
            
            if (firstPoint) {
                ctx.moveTo(px, drawY);
                firstPoint = false;
            } else {
                ctx.lineTo(px, drawY);
            }
        }
        ctx.stroke();
        
        // Add glow fill effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 2);
        gradient.addColorStop(0, `rgba(255, 20, 147, ${0.1 + (h - 0.5) * 0.05})`);
        gradient.addColorStop(0.5, `rgba(255, 105, 180, ${0.05 + (h - 0.5) * 0.03})`);
        gradient.addColorStop(1, 'rgba(255, 20, 147, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add sparkles when h is high
        if (h > 2.5) {
            const numSparkles = Math.floor((h - 2.5) * 5);
            for (let i = 0; i < numSparkles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = scale * (0.8 + Math.random() * 1.2);
                const sparkleX = centerX + Math.cos(angle) * radius;
                const sparkleY = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 182, 193, ${0.5 + Math.random() * 0.5})`;
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#FFB6C1';
                ctx.fill();
            }
        }
        
        ctx.shadowBlur = 0;
        
        // Update display
        elements.hDisplay.textContent = h.toFixed(2);
        
        time += 0.02;
        
        state.heartAnimationId = requestAnimationFrame(drawHeart);
    }
    
    // Start explanation animation
    animateExplanationLines();
    
    drawHeart();
}

function stopHeartAnimation() {
    if (state.heartAnimationId) {
        cancelAnimationFrame(state.heartAnimationId);
        state.heartAnimationId = null;
    }
}

// ===== Scene 4: Blow Candles =====
function blowCandles() {
    elements.blowBtn.disabled = true;
    
    // Play blow sound
    if (state.soundEnabled) {
        playSound(elements.blowSound, 0.5);
    }
    
    // Extinguish flames one by one
    elements.flames.forEach((flame, index) => {
        setTimeout(() => {
            flame.classList.add('out');
        }, index * 200);
    });
    
    // Create particle burst
    createBlowParticles();
    
    // Transition to finale
    setTimeout(() => {
        if (state.soundEnabled) {
            playSound(elements.celebrationSound, 0.5);
        }
        showScene(5);
        initFinale();
    }, 2000);
}

function createBlowParticles() {
    const container = elements.blowParticles;
    const colors = ['#FFD700', '#FF6B00', '#FF1493', '#FFB6C1'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            top: 50%;
            left: 50%;
            pointer-events: none;
            animation: blowParticle 1s ease-out forwards;
            --tx: ${(Math.random() - 0.5) * 200}px;
            --ty: ${-Math.random() * 200 - 50}px;
        `;
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

// ===== Scene 5: Finale =====
function initFinale() {
    // Set queen photo
    if (state.userPhoto) {
        elements.queenPhoto.src = state.userPhoto;
    } else {
        // Default placeholder
        elements.queenPhoto.src = DEFAULT_QUEEN_PHOTO;
    }
    
    // Start confetti
    initConfetti();
}

function initConfetti() {
    const canvas = elements.confetti;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const colors = ['#FF1493', '#FFB6C1', '#FF00FF', '#9B30FF', '#FFD700', '#B76E79'];
    
    class Confetti {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 10 + 5;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            
            if (this.shape === 'rect') {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
        confettiPieces.push(new Confetti());
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiPieces.forEach(piece => {
            piece.update();
            piece.draw();
        });
        requestAnimationFrame(animateConfetti);
    }
    
    animateConfetti();
}

// ===== Sound Management =====
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    elements.soundToggle.textContent = state.soundEnabled ? '🔊' : '🔇';
    elements.soundToggle.classList.toggle('muted', !state.soundEnabled);
    
    if (state.soundEnabled && state.currentScene > 0) {
        elements.bgMusic.volume = 0.3;
        elements.bgMusic.play().catch(() => {});
    } else {
        elements.bgMusic.pause();
    }
}

function playSound(audio, volume = 0.5) {
    if (state.soundEnabled) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

// ===== Event Listeners =====
function initEventListeners() {
    // Scene 0: Authentication
    elements.cameraBtn.addEventListener('click', initCamera);
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileUpload);
    
    // Scene 1: Journey
    elements.continueJourney.addEventListener('click', () => {
        showScene(2);
        typeMessage();
    });
    
    // Scene 2: Message
    elements.continueToHeart.addEventListener('click', () => {
        showScene(3);
        setTimeout(initHeartCanvas, 500);
    });
    
    // Scene 3: Heart
    elements.continueToWish.addEventListener('click', () => {
        stopHeartAnimation();
        showScene(4);
    });
    
    // Scene 4: Wish
    elements.blowBtn.addEventListener('click', blowCandles);
    
    // Sound toggle
    elements.soundToggle.addEventListener('click', toggleSound);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (state.currentScene === 3 && state.heartAnimationId) {
            stopHeartAnimation();
            initHeartCanvas();
        }
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEventListeners();
    runBootSequence();
});
