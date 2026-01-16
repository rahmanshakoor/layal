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
    const scale = Math.min(width, height) / 5;
    
    let h = 0;
    let increasing = true;
    
    function drawHeart() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw coordinate plane
        ctx.strokeStyle = 'rgba(255, 20, 147, 0.2)';
        ctx.lineWidth = 1;
        
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
        
        // Draw heart curve using parametric equations
        ctx.beginPath();
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 2 + h;
        ctx.shadowBlur = 15 + h * 5;
        ctx.shadowColor = '#FF1493';
        
        for (let t = 0; t <= Math.PI * 2; t += 0.01) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            
            const drawX = centerX + x * (scale / 16) * (0.5 + h * 0.5);
            const drawY = centerY + y * (scale / 16) * (0.5 + h * 0.5);
            
            if (t === 0) {
                ctx.moveTo(drawX, drawY);
            } else {
                ctx.lineTo(drawX, drawY);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale);
        gradient.addColorStop(0, `rgba(255, 20, 147, ${0.3 + h * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 20, 147, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add sparkles
        if (h > 0.5) {
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = scale * (0.8 + Math.random() * 0.4);
                const sparkleX = centerX + Math.cos(angle) * radius;
                const sparkleY = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#FFB6C1';
                ctx.fill();
            }
        }
        
        // Update h value
        if (increasing) {
            h += 0.005;
            if (h >= 1) {
                increasing = false;
            }
        } else {
            h -= 0.005;
            if (h <= 0.2) {
                increasing = true;
            }
        }
        
        elements.hDisplay.textContent = h.toFixed(2);
        
        state.heartAnimationId = requestAnimationFrame(drawHeart);
    }
    
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
