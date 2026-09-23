/**
 * THE INDIAN EDIT — DECODE THE BOTTLE
 * Premium Luxury Brand Interactive Browser Game
 * Pure Vanilla JavaScript (ES6+) — No external frameworks
 */

(function () {
  'use strict';

  // ===================================================================
  // 1. GAME DATA & CONFIGURATION
  // ===================================================================

  const GAME_CONFIG = {
    totalTime: 30,
    pointsDiscovery: 50,
    pointsCorrect: 100,
    pointsWrong: -25,
    pointsCompletion: 250,
    maxScore: 1000,
    zoomMin: 1.0,
    zoomMax: 1.8,
    zoomStep: 0.2
  };

  const HOTSPOTS_DATA = [
    {
      id: 'cap',
      number: 1,
      label: 'THE CROWN DETAIL',
      tooltip: 'Explore this detail',
      position: { top: '10%', left: '50%' },
      question: 'What does this detail contribute to the bottle\'s premium visual identity?',
      answers: [
        { key: 'A', text: 'A crown-inspired premium appearance', correct: true },
        { key: 'B', text: 'A sports-inspired appearance', correct: false },
        { key: 'C', text: 'A futuristic digital appearance', correct: false },
        { key: 'D', text: 'A minimal plain appearance', correct: false }
      ]
    },
    {
      id: 'identity',
      number: 2,
      label: 'THE INDIAN IDENTITY',
      tooltip: 'Explore this detail',
      position: { top: '44%', left: '50%' },
      question: 'Which visual idea is most strongly communicated by the main \'THE INDIAN EDIT\' presentation?',
      answers: [
        { key: 'A', text: 'Indian identity and contemporary luxury', correct: true },
        { key: 'B', text: 'European sports culture', correct: false },
        { key: 'C', text: 'Tropical beach culture', correct: false },
        { key: 'D', text: 'Technology branding', correct: false }
      ]
    },
    {
      id: 'typography',
      number: 3,
      label: 'THE EDIT',
      tooltip: 'Explore this detail',
      position: { top: '52%', left: '50%' },
      question: 'What is the key typography phrase displayed prominently on the bottle?',
      answers: [
        { key: 'A', text: 'THE INDIAN EDIT', correct: true },
        { key: 'B', text: 'THE ROYAL EDIT', correct: false },
        { key: 'C', text: 'INDIA SELECT', correct: false },
        { key: 'D', text: 'INDIAN RESERVE', correct: false }
      ]
    },
    {
      id: 'signature',
      number: 4,
      label: 'THE SIGNATURE CREST',
      tooltip: 'Explore this detail',
      position: { top: '70%', left: '50%' },
      question: 'What visual combination creates a strong premium contrast on this section?',
      answers: [
        { key: 'A', text: 'Red and gold', correct: true },
        { key: 'B', text: 'Blue and green', correct: false },
        { key: 'C', text: 'Purple and white', correct: false },
        { key: 'D', text: 'Orange and blue', correct: false }
      ]
    },
    {
      id: 'closer',
      number: 5,
      label: 'EMBOSSED BASE',
      tooltip: 'Explore this detail',
      position: { top: '89%', left: '50%' },
      question: 'Which approach is central to this game experience?',
      answers: [
        { key: 'A', text: 'Discovering details through interaction', correct: true },
        { key: 'B', text: 'Racing a car', correct: false },
        { key: 'C', text: 'Solving mathematical problems', correct: false },
        { key: 'D', text: 'Matching random colors', correct: false }
      ]
    }
  ];

  // ===================================================================
  // 2. GAME STATE
  // ===================================================================

  const gameState = {
    score: 0,
    displayScore: 0,
    timeLeft: GAME_CONFIG.totalTime,
    timerInterval: null,
    discovered: [], // list of hotspot ids
    completed: [],  // list of hotspot ids with answered questions
    gameStarted: false,
    gameOver: false,
    soundEnabled: true,
    zoomLevel: 1.0,
    activeModalHotspot: null,
    scoreAnimationId: null
  };

  // ===================================================================
  // 3. SYNTHESIZED WEB AUDIO API (NO EXTERNAL ASSETS NEEDED)
  // ===================================================================

  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainStart, gainEnd = 0.001) {
    if (!gameState.soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainStart, now);
      gain.gain.exponentialRampToValueAtTime(gainEnd, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio fallback gracefully silent
    }
  }

  function playStartGameSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    // Elegant luxury major arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.6, 0.18, 0.001);
      }, idx * 110);
    });
  }

  function playHoverSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    playTone(880, 'triangle', 0.05, 0.03, 0.001);
  }

  function playDiscoverySound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    // Warm chime
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.45, 0.16, 0.001);
      }, idx * 80);
    });
  }

  function playCorrectSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    // Triumphant golden chord
    [523.25, 659.25, 783.99].forEach((f) => {
      playTone(f, 'triangle', 0.7, 0.22, 0.001);
    });
  }

  function playWrongSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    // Subtle low tone
    playTone(220, 'sawtooth', 0.25, 0.12, 0.001);
    setTimeout(() => {
      playTone(196, 'sawtooth', 0.35, 0.14, 0.001);
    }, 120);
  }

  function playWarningSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    playTone(440, 'sine', 0.08, 0.12, 0.001);
  }

  function playCompletedSound() {
    if (!gameState.soundEnabled || !audioCtx) return;
    // Grand celebration cascade
    const chord = [392.00, 523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 'sine', 1.2, 0.2, 0.001);
      }, i * 140);
    });
  }

  // ===================================================================
  // 4. PARTICLE SYSTEM (HIGH PERFORMANCE HTML5 CANVAS)
  // ===================================================================

  let canvas = null;
  let ctx = null;
  let particles = [];
  const MAX_PARTICLES = 50;

  function initParticleCanvas() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initial ambient embers
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(createAmbientParticle(true));
    }

    requestAnimationFrame(renderParticles);
  }

  function createAmbientParticle(randomY = false) {
    return {
      x: Math.random() * (canvas ? canvas.width : window.innerWidth),
      y: randomY ? Math.random() * (canvas ? canvas.height : window.innerHeight) : (canvas ? canvas.height + 10 : window.innerHeight),
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.7 + 0.25,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      fadeSpeed: Math.random() * 0.005 + 0.002,
      color: Math.random() > 0.3 ? 'rgba(212, 175, 55, ' : 'rgba(247, 232, 182, '
    };
  }

  function burstParticles(originX, originY, count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 4 + 1.5;
      particles.push({
        x: originX,
        y: originY,
        size: Math.random() * 3 + 1.5,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity - 1,
        opacity: 1,
        fadeSpeed: 0.02 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? 'rgba(255, 215, 0, ' : 'rgba(224, 44, 50, '
      });
    }
  }

  function renderParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0 || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
        particles.splice(i, 1);
        if (particles.length < MAX_PARTICLES) {
          particles.push(createAmbientParticle(false));
        }
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  // ===================================================================
  // 5. DOM ELEMENTS CACHE
  // ===================================================================

  const DOM = {
    screenIntro: null,
    screenGame: null,
    screenCompletion: null,
    screenTimeout: null,
    btnStart: null,
    btnPlayAgain: null,
    btnTryAgain: null,
    btnSoundToggle: null,
    soundIcon: null,
    timerDigits: null,
    timerBox: null,
    scoreValue: null,
    progressCount: null,
    progressIndicators: null,
    bottleContainer: null,
    bottleImage: null,
    pedestalGlow: null,
    modalOverlay: null,
    modalCard: null,
    modalTag: null,
    modalTitle: null,
    modalHotspotLabel: null,
    questionText: null,
    optionsGrid: null,
    modalFeedback: null,
    discoveryToast: null,
    zoomInBtn: null,
    zoomOutBtn: null,
    zoomResetBtn: null,
    leaderboardModal: null,
    leaderboardList: null,
    btnOpenLeaderboard: null,
    btnCloseLeaderboard: null,
    formSubmitScore: null,
    inputPlayerName: null,
    completionScore: null,
    completionDetails: null,
    completionTime: null,
    timeoutScore: null,
    timeoutDetails: null
  };

  function cacheDOMElements() {
    DOM.screenIntro = document.getElementById('screen-intro');
    DOM.screenGame = document.getElementById('screen-game');
    DOM.screenCompletion = document.getElementById('screen-completion');
    DOM.screenTimeout = document.getElementById('screen-timeout');
    DOM.btnStart = document.getElementById('btn-start');
    DOM.btnPlayAgain = document.getElementById('btn-play-again');
    DOM.btnTryAgain = document.getElementById('btn-try-again');
    DOM.btnSoundToggle = document.getElementById('btn-sound-toggle');
    DOM.soundIcon = document.getElementById('sound-icon');
    DOM.timerDigits = document.getElementById('timer-digits');
    DOM.timerBox = document.getElementById('top-bar-timer');
    DOM.scoreValue = document.getElementById('score-value');
    DOM.progressCount = document.getElementById('progress-count');
    DOM.progressIndicators = document.getElementById('progress-indicators');
    DOM.bottleContainer = document.getElementById('bottle-container');
    DOM.bottleImage = document.getElementById('bottle-image');
    DOM.pedestalGlow = document.getElementById('pedestal-glow');
    DOM.modalOverlay = document.getElementById('question-modal');
    DOM.modalCard = document.getElementById('modal-card');
    DOM.modalTag = document.getElementById('modal-tag');
    DOM.modalTitle = document.getElementById('modal-title');
    DOM.modalHotspotLabel = document.getElementById('modal-hotspot-label');
    DOM.questionText = document.getElementById('question-text');
    DOM.optionsGrid = document.getElementById('options-grid');
    DOM.modalFeedback = document.getElementById('modal-feedback');
    DOM.discoveryToast = document.getElementById('discovery-toast');
    DOM.zoomInBtn = document.getElementById('btn-zoom-in');
    DOM.zoomOutBtn = document.getElementById('btn-zoom-out');
    DOM.zoomResetBtn = document.getElementById('btn-zoom-reset');
    DOM.leaderboardModal = document.getElementById('leaderboard-modal');
    DOM.leaderboardList = document.getElementById('leaderboard-list');
    DOM.btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
    DOM.btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    DOM.formSubmitScore = document.getElementById('form-submit-score');
    DOM.inputPlayerName = document.getElementById('player-name');
    DOM.completionScore = document.getElementById('completion-score');
    DOM.completionDetails = document.getElementById('completion-details');
    DOM.completionTime = document.getElementById('completion-time');
    DOM.timeoutScore = document.getElementById('timeout-score');
    DOM.timeoutDetails = document.getElementById('timeout-details');
  }

  // ===================================================================
  // 6. SCREEN MANAGEMENT
  // ===================================================================

  function showScreen(screenEl) {
    const screens = [DOM.screenIntro, DOM.screenGame, DOM.screenCompletion, DOM.screenTimeout];
    screens.forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (screenEl) {
      screenEl.classList.add('active');
    }
  }

  // ===================================================================
  // 7. HOTSPOT CREATION & POSITIONING
  // ===================================================================

  function renderHotspots() {
    if (!DOM.bottleContainer) return;

    // Remove existing hotspots if any
    const existing = DOM.bottleContainer.querySelectorAll('.hotspot');
    existing.forEach(e => e.remove());

    HOTSPOTS_DATA.forEach(data => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.id = `hotspot-${data.id}`;
      btn.style.top = data.position.top;
      btn.style.left = data.position.left;
      btn.setAttribute('aria-label', `${data.label}: ${data.tooltip}`);
      btn.setAttribute('data-id', data.id);

      btn.innerHTML = `
        <div class="hotspot-beacon">
          <svg class="hotspot-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2" fill="none"/>
            <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="hotspot-tooltip">${data.label}</div>
      `;

      btn.addEventListener('mouseenter', () => {
        if (!gameState.discovered.includes(data.id)) {
          playHoverSound();
        }
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleHotspotClick(data.id, btn);
      });

      DOM.bottleContainer.appendChild(btn);
    });
  }

  // ===================================================================
  // 8. INTERACTIVE 3D PARALLAX & ZOOM INSPECTOR
  // ===================================================================

  function setupBottleInteractions() {
    const stage = document.querySelector('.game-main-stage');
    if (!stage || !DOM.bottleContainer) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    // Subtle desktop parallax
    stage.addEventListener('mousemove', (e) => {
      if (gameState.zoomLevel > 1.2) return; // disable tilt during high zoom
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotY = x * 8; // Max 4 deg Y
      targetRotX = -y * 8; // Max 4 deg X
    });

    stage.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    function updateParallax() {
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      if (DOM.bottleContainer) {
        DOM.bottleContainer.style.transform = `scale(${gameState.zoomLevel}) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      }
      requestAnimationFrame(updateParallax);
    }
    requestAnimationFrame(updateParallax);

    // Zoom Controls
    if (DOM.zoomInBtn) {
      DOM.zoomInBtn.addEventListener('click', () => {
        setZoom(gameState.zoomLevel + GAME_CONFIG.zoomStep);
      });
    }

    if (DOM.zoomOutBtn) {
      DOM.zoomOutBtn.addEventListener('click', () => {
        setZoom(gameState.zoomLevel - GAME_CONFIG.zoomStep);
      });
    }

    if (DOM.zoomResetBtn) {
      DOM.zoomResetBtn.addEventListener('click', () => {
        setZoom(1.0);
      });
    }
  }

  function setZoom(level) {
    const clamped = Math.min(GAME_CONFIG.zoomMax, Math.max(GAME_CONFIG.zoomMin, Math.round(level * 10) / 10));
    gameState.zoomLevel = clamped;
    if (DOM.bottleContainer) {
      DOM.bottleContainer.style.transform = `scale(${gameState.zoomLevel})`;
    }
    playHoverSound();
  }

  // ===================================================================
  // 9. TIMER ENGINE & URGENCY STATES
  // ===================================================================

  function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timeLeft = GAME_CONFIG.totalTime;
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
      if (!gameState.gameStarted || gameState.gameOver) {
        clearInterval(gameState.timerInterval);
        return;
      }

      gameState.timeLeft--;
      updateTimerDisplay();

      // Sound warning at critical seconds
      if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
        playWarningSound();
      }

      if (gameState.timeLeft <= 0) {
        clearInterval(gameState.timerInterval);
        endGame(false);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!DOM.timerDigits) return;
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    DOM.timerDigits.textContent = formatted;

    if (DOM.timerBox) {
      if (gameState.timeLeft <= 5) {
        DOM.timerBox.className = 'top-bar-center timer-critical';
      } else if (gameState.timeLeft <= 10) {
        DOM.timerBox.className = 'top-bar-center timer-warning';
      } else {
        DOM.timerBox.className = 'top-bar-center';
      }
    }
  }

  // ===================================================================
  // 10. SCORE TICKER & POPUP ENGINE
  // ===================================================================

  function updateScore(delta) {
    const prevScore = gameState.score;
    gameState.score = Math.max(0, Math.min(GAME_CONFIG.maxScore, gameState.score + delta));

    // Show floating score notification
    showScorePop(delta);

    // Animate score ticker counting
    animateScoreCount(prevScore, gameState.score);
  }

  function animateScoreCount(from, to) {
    if (!DOM.scoreValue) return;
    if (gameState.scoreAnimationId) {
      cancelAnimationFrame(gameState.scoreAnimationId);
    }

    const duration = 500;
    const startTime = performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.round(from + (to - from) * progress);
      DOM.scoreValue.textContent = String(current).padStart(4, '0');

      if (progress < 1) {
        gameState.scoreAnimationId = requestAnimationFrame(step);
      } else {
        DOM.scoreValue.textContent = String(to).padStart(4, '0');
      }
    }
    gameState.scoreAnimationId = requestAnimationFrame(step);
  }

  function showScorePop(delta) {
    const parent = document.querySelector('.score-display');
    if (!parent) return;

    const pop = document.createElement('div');
    pop.className = `score-floating-pop ${delta >= 0 ? 'positive' : 'negative'}`;
    pop.textContent = (delta >= 0 ? '+' : '') + delta;
    parent.appendChild(pop);

    setTimeout(() => {
      pop.remove();
    }, 1200);
  }

  // ===================================================================
  // 11. PROGRESS INDICATORS
  // ===================================================================

  function updateProgress() {
    const total = HOTSPOTS_DATA.length;
    const completedCount = gameState.completed.length;

    if (DOM.progressCount) {
      DOM.progressCount.textContent = `${completedCount} / ${total}`;
    }

    if (DOM.progressIndicators) {
      const dots = DOM.progressIndicators.querySelectorAll('.indicator-dot');
      dots.forEach((dot, index) => {
        const hotspot = HOTSPOTS_DATA[index];
        if (gameState.completed.includes(hotspot.id)) {
          dot.className = 'indicator-dot completed';
        } else if (gameState.discovered.includes(hotspot.id)) {
          dot.className = 'indicator-dot discovered';
        } else {
          dot.className = 'indicator-dot';
        }
      });
    }
  }

  // ===================================================================
  // 12. HOTSPOT CLICK, DISCOVERY & QUESTION FLOW
  // ===================================================================

  function handleHotspotClick(id, buttonEl) {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const hotspot = HOTSPOTS_DATA.find(h => h.id === id);
    if (!hotspot) return;

    // Check if already completed (prevent duplicate scoring)
    if (gameState.completed.includes(id)) {
      return;
    }

    // Check if discovering for the first time
    if (!gameState.discovered.includes(id)) {
      discoverDetail(hotspot, buttonEl);
    } else {
      // Re-open question modal if already discovered but not completed
      showQuestion(hotspot);
    }
  }

  function discoverDetail(hotspot, buttonEl) {
    gameState.discovered.push(hotspot.id);

    // Audio & particles
    playDiscoverySound();

    if (buttonEl) {
      buttonEl.classList.add('discovered');
      const rect = buttonEl.getBoundingClientRect();
      burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
    }

    // Bottle glow enhancement
    if (DOM.bottleImage) {
      DOM.bottleImage.classList.add('illuminated');
      setTimeout(() => {
        DOM.bottleImage.classList.remove('illuminated');
      }, 1000);
    }

    // Award +50 discovery points
    updateScore(GAME_CONFIG.pointsDiscovery);
    updateProgress();

    // Show discovery toast notification
    showDiscoveryToast(hotspot.label);

    // Open question modal after small cinematic beat
    setTimeout(() => {
      showQuestion(hotspot);
    }, 600);
  }

  function showDiscoveryToast(label) {
    if (!DOM.discoveryToast) return;
    const textEl = DOM.discoveryToast.querySelector('.toast-text');
    if (textEl) {
      textEl.textContent = `${label} DISCOVERED`;
    }
    DOM.discoveryToast.classList.add('show');
    setTimeout(() => {
      DOM.discoveryToast.classList.remove('show');
    }, 2000);
  }

  // ===================================================================
  // 13. QUESTION MODAL LOGIC
  // ===================================================================

  function showQuestion(hotspot) {
    gameState.activeModalHotspot = hotspot;

    if (DOM.modalTag) DOM.modalTag.textContent = `HOTSPOT ${hotspot.number} OF ${HOTSPOTS_DATA.length}`;
    if (DOM.modalHotspotLabel) DOM.modalHotspotLabel.textContent = hotspot.label;
    if (DOM.questionText) DOM.questionText.textContent = hotspot.question;

    if (DOM.modalFeedback) {
      DOM.modalFeedback.className = 'modal-feedback';
      DOM.modalFeedback.textContent = '';
    }

    // Render option buttons
    if (DOM.optionsGrid) {
      DOM.optionsGrid.innerHTML = '';

      hotspot.answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
          <span class="option-letter">${ans.key}</span>
          <span class="option-text">${ans.text}</span>
        `;

        btn.addEventListener('click', () => {
          checkAnswer(ans, btn, hotspot);
        });

        DOM.optionsGrid.appendChild(btn);
      });
    }

    if (DOM.modalOverlay) {
      DOM.modalOverlay.classList.add('active');
    }
  }

  function checkAnswer(selectedOption, buttonEl, hotspot) {
    // Disable all options while answering
    const allBtns = DOM.optionsGrid ? DOM.optionsGrid.querySelectorAll('.option-btn') : [];

    if (selectedOption.correct) {
      handleCorrectAnswer(buttonEl, hotspot, allBtns);
    } else {
      handleWrongAnswer(buttonEl, hotspot, allBtns);
    }
  }

  function handleCorrectAnswer(buttonEl, hotspot, allBtns) {
    playCorrectSound();
    buttonEl.classList.add('correct');
    allBtns.forEach(b => b.disabled = true);

    // Show correct feedback
    if (DOM.modalFeedback) {
      DOM.modalFeedback.className = 'modal-feedback show-correct';
      DOM.modalFeedback.textContent = '✓ CORRECT (+100 POINTS)';
    }

    // Award +100 points
    updateScore(GAME_CONFIG.pointsCorrect);

    // Complete the hotspot
    completeDetail(hotspot);

    // Particle burst inside modal
    const rect = buttonEl.getBoundingClientRect();
    burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

    // Close modal automatically after approx 1 second
    setTimeout(() => {
      closeQuestionModal();

      // Check if all 5 completed
      if (gameState.completed.length >= HOTSPOTS_DATA.length) {
        endGame(true);
      }
    }, 1100);
  }

  function handleWrongAnswer(buttonEl, hotspot, allBtns) {
    playWrongSound();
    buttonEl.classList.add('wrong');
    buttonEl.disabled = true;

    // Shake modal
    if (DOM.modalCard) {
      DOM.modalCard.classList.add('shake');
      setTimeout(() => {
        DOM.modalCard.classList.remove('shake');
      }, 500);
    }

    // Show wrong feedback
    if (DOM.modalFeedback) {
      DOM.modalFeedback.className = 'modal-feedback show-wrong';
      DOM.modalFeedback.textContent = '✕ NOT QUITE (-25 POINTS)';
    }

    // Deduct 25 points
    updateScore(GAME_CONFIG.pointsWrong);
  }

  function completeDetail(hotspot) {
    if (!gameState.completed.includes(hotspot.id)) {
      gameState.completed.push(hotspot.id);
    }

    const btn = document.getElementById(`hotspot-${hotspot.id}`);
    if (btn) {
      btn.className = 'hotspot completed';
      btn.setAttribute('aria-label', `${hotspot.label}: Completed`);
    }

    updateProgress();
  }

  function closeQuestionModal() {
    if (DOM.modalOverlay) {
      DOM.modalOverlay.classList.remove('active');
    }
    gameState.activeModalHotspot = null;
  }

  // ===================================================================
  // 14. GAME COMPLETION & TIME-OUT
  // ===================================================================

  function endGame(isVictory) {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    clearInterval(gameState.timerInterval);

    // Close any open question modal
    closeQuestionModal();

    if (isVictory) {
      // Award completion bonus +250 points
      updateScore(GAME_CONFIG.pointsCompletion);
      playCompletedSound();

      // Confetti / particle rain
      if (canvas) {
        for (let i = 0; i < 50; i++) {
          burstParticles(Math.random() * canvas.width, Math.random() * (canvas.height * 0.5), 10);
        }
      }

      showCompletionScreen();
    } else {
      showTimeoutScreen();
    }
  }

  function showCompletionScreen() {
    if (DOM.completionScore) {
      DOM.completionScore.textContent = gameState.score;
    }
    if (DOM.completionDetails) {
      DOM.completionDetails.textContent = `${gameState.completed.length} / ${HOTSPOTS_DATA.length}`;
    }
    if (DOM.completionTime) {
      DOM.completionTime.textContent = `${gameState.timeLeft}s`;
    }

    showScreen(DOM.screenCompletion);
    notifyParentOfRoundEnd(true);
  }

  function showTimeoutScreen() {
    if (DOM.timeoutScore) {
      DOM.timeoutScore.textContent = gameState.score;
    }
    if (DOM.timeoutDetails) {
      DOM.timeoutDetails.textContent = `${gameState.completed.length} / ${HOTSPOTS_DATA.length}`;
    }

    showScreen(DOM.screenTimeout);
    notifyParentOfRoundEnd(false);
  }

  // Report the round result to a hosting parent page (e.g. when this game
  // is embedded as a level inside a larger brand experience via iframe).
  // Safe no-op when loaded standalone (window.parent === window).
  function notifyParentOfRoundEnd(isVictory) {
    if (window.parent === window) return;
    try {
      window.parent.postMessage({
        source: 'decode-the-bottle',
        type: 'ROUND_COMPLETE',
        isVictory: isVictory,
        score: gameState.score,
        detailsFound: gameState.completed.length,
        totalDetails: HOTSPOTS_DATA.length,
        timeLeft: gameState.timeLeft
      }, '*');
    } catch (e) {
      // Ignore cross-origin/postMessage errors
    }
  }

  // ===================================================================
  // 15. START, RESTART & RESET GAME
  // ===================================================================

  function startGame() {
    initAudioContext();
    playStartGameSound();

    gameState.score = 0;
    gameState.displayScore = 0;
    gameState.timeLeft = GAME_CONFIG.totalTime;
    gameState.discovered = [];
    gameState.completed = [];
    gameState.gameStarted = true;
    gameState.gameOver = false;
    gameState.zoomLevel = 1.0;

    if (DOM.scoreValue) DOM.scoreValue.textContent = '0000';
    updateProgress();
    renderHotspots();
    setZoom(1.0);

    showScreen(DOM.screenGame);
    startTimer();
  }

  function restartGame() {
    startGame();
  }

  function resetGame() {
    clearInterval(gameState.timerInterval);
    gameState.gameStarted = false;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.timeLeft = GAME_CONFIG.totalTime;
    gameState.discovered = [];
    gameState.completed = [];
    showScreen(DOM.screenIntro);
  }

  // ===================================================================
  // 16. LOCALSTORAGE LEADERBOARD
  // ===================================================================

  const LEADERBOARD_KEY = 'the_indian_edit_leaderboard_v1';

  const DEFAULT_LEADERBOARD = [
    { name: 'Master Blender', score: 975, detailsFound: 5, timeRemaining: 18, date: '2026-09-14' },
    { name: 'Royal Connoisseur', score: 925, detailsFound: 5, timeRemaining: 14, date: '2026-09-13' },
    { name: 'Whisky Sommelier', score: 850, detailsFound: 5, timeRemaining: 9, date: '2026-09-12' },
    { name: 'Heritage Decoder', score: 775, detailsFound: 4, timeRemaining: 0, date: '2026-09-11' },
    { name: 'Spirits Explorer', score: 650, detailsFound: 3, timeRemaining: 0, date: '2026-09-10' }
  ];

  function loadLeaderboard() {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }
    return DEFAULT_LEADERBOARD;
  }

  function saveScore(name) {
    if (!name || !name.trim()) name = 'Anonymous Decoder';
    const current = loadLeaderboard();

    const entry = {
      name: name.trim().slice(0, 20),
      score: gameState.score,
      detailsFound: gameState.completed.length,
      timeRemaining: gameState.timeLeft,
      date: new Date().toISOString().split('T')[0]
    };

    current.push(entry);
    current.sort((a, b) => b.score - a.score || b.timeRemaining - a.timeRemaining);
    const top10 = current.slice(0, 10);

    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
    } catch (e) {
      console.warn('Failed to save score');
    }

    renderLeaderboard();
  }

  function renderLeaderboard() {
    if (!DOM.leaderboardList) return;
    const scores = loadLeaderboard();
    DOM.leaderboardList.innerHTML = '';

    scores.forEach((entry, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'top-1' : rank === 2 ? 'top-2' : rank === 3 ? 'top-3' : '';

      const item = document.createElement('div');
      item.className = 'leader-item';
      item.innerHTML = `
        <div class="leader-left">
          <span class="leader-rank ${rankClass}">${rank}</span>
          <span class="leader-name">${escapeHtml(entry.name)}</span>
        </div>
        <div class="leader-right">
          <span class="leader-details">${entry.detailsFound}/5 Details • ${entry.timeRemaining}s</span>
          <span class="leader-score">${entry.score}</span>
        </div>
      `;
      DOM.leaderboardList.appendChild(item);
    });
  }

  function openLeaderboard() {
    renderLeaderboard();
    if (DOM.leaderboardModal) {
      DOM.leaderboardModal.classList.add('active');
    }
    playHoverSound();
  }

  function closeLeaderboard() {
    if (DOM.leaderboardModal) {
      DOM.leaderboardModal.classList.remove('active');
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===================================================================
  // 17. AUDIO TOGGLE
  // ===================================================================

  function toggleSound() {
    initAudioContext();
    gameState.soundEnabled = !gameState.soundEnabled;
    if (DOM.soundIcon) {
      DOM.soundIcon.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    }
    if (gameState.soundEnabled) {
      playHoverSound();
    }
  }

  // ===================================================================
  // 18. INITIALIZATION & EVENT LISTENERS
  // ===================================================================

  function init() {
    cacheDOMElements();
    initParticleCanvas();
    setupBottleInteractions();

    // Start Button
    if (DOM.btnStart) {
      DOM.btnStart.addEventListener('click', startGame);
    }

    // Play Again / Try Again Buttons
    if (DOM.btnPlayAgain) {
      DOM.btnPlayAgain.addEventListener('click', restartGame);
    }

    if (DOM.btnTryAgain) {
      DOM.btnTryAgain.addEventListener('click', restartGame);
    }

    // Sound toggle buttons
    if (DOM.btnSoundToggle) {
      DOM.btnSoundToggle.addEventListener('click', toggleSound);
    }

    // Leaderboard controls
    if (DOM.btnOpenLeaderboard) {
      DOM.btnOpenLeaderboard.addEventListener('click', openLeaderboard);
    }

    const introLeaderboardBtn = document.getElementById('btn-intro-leaderboard');
    if (introLeaderboardBtn) {
      introLeaderboardBtn.addEventListener('click', openLeaderboard);
    }

    const completionLeaderboardBtn = document.getElementById('btn-completion-leaderboard');
    if (completionLeaderboardBtn) {
      completionLeaderboardBtn.addEventListener('click', openLeaderboard);
    }

    const timeoutLeaderboardBtn = document.getElementById('btn-timeout-leaderboard');
    if (timeoutLeaderboardBtn) {
      timeoutLeaderboardBtn.addEventListener('click', openLeaderboard);
    }

    if (DOM.btnCloseLeaderboard) {
      DOM.btnCloseLeaderboard.addEventListener('click', closeLeaderboard);
    }

    if (DOM.leaderboardModal) {
      DOM.leaderboardModal.addEventListener('click', (e) => {
        if (e.target === DOM.leaderboardModal) {
          closeLeaderboard();
        }
      });
    }

    // Score form submission
    if (DOM.formSubmitScore) {
      DOM.formSubmitScore.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = DOM.inputPlayerName ? DOM.inputPlayerName.value : '';
        saveScore(name);
        if (DOM.inputPlayerName) DOM.inputPlayerName.value = '';
      });
    }

    // Modal background click close (disabled while question active for focus)
    if (DOM.modalOverlay) {
      DOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.modalOverlay && gameState.activeModalHotspot) {
          // Allow closing without penalty if desired
          closeQuestionModal();
        }
      });
    }

    // Keyboard navigation (Escape key closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.leaderboardModal && DOM.leaderboardModal.classList.contains('active')) {
          closeLeaderboard();
        }
      }
    });

    // Initial state: Intro Screen
    showScreen(DOM.screenIntro);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
