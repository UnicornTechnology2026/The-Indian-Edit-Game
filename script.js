/**
 * THE INDIAN EDIT — INTERACTIVE BRAND EXPERIENCE
 * Vanilla JavaScript Engine
 * Luxury Indian Heritage × Contemporary Luxury × Sustainable Living
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. GLOBAL CONSTANTS & AUDIO SYNTHESIZER
     ========================================================================== */
  const STORAGE_KEY = 'the_indian_edit_v1';

  // Web Audio Synthesizer (Reliable offline audio without missing files or CORS)
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('tie_sound_muted') === 'true';
    }

    init() {
      if (!this.ctx && typeof window.AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('tie_sound_muted', this.muted);
      return this.muted;
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playCollect(isGolden = false) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isGolden ? 'triangle' : 'sine';
      const baseFreq = isGolden ? 880 : 523.25;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }

    playError() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }

    playTick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playSuccess() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C arpeggio
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + index * 0.08);
        osc.stop(this.ctx.currentTime + index * 0.08 + 0.35);
      });
    }

    playFanfare() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const chords = [
        { f: 440, t: 0 }, { f: 554.37, t: 0 }, { f: 659.25, t: 0 },
        { f: 554.37, t: 0.15 }, { f: 659.25, t: 0.15 }, { f: 880, t: 0.15 },
        { f: 880, t: 0.32 }, { f: 1108.73, t: 0.32 }, { f: 1318.51, t: 0.32 }
      ];
      chords.forEach(c => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.f, this.ctx.currentTime + c.t);
        gain.gain.setValueAtTime(0.14, this.ctx.currentTime + c.t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + c.t + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + c.t);
        osc.stop(this.ctx.currentTime + c.t + 0.5);
      });
    }
  }

  const sound = new SoundEngine();

  /* ==========================================================================
     2. GAME STATE & LOCAL STORAGE
     ========================================================================== */
  const defaultState = {
    userName: '',
    userCity: 'Nagpur',
    userPhone: '',
    otpVerified: false,
    currentScreen: 'screen-login',
    scoreRush: 0,
    scoreBottle: 0,
    bottlesCollected: 0,
    bonusPoints: 0,
    scoreZero: 0,
    decodeScore: 0,
    decodeDetailsFound: 0,
    decodeCompleted: false,
    blendScore: 0,
    blendBaseScore: 0,
    blendSpeedBonus: 0,
    blendIncorrectAttempts: 0,
    blendCompleted: false,
    cityElements: {
      CITY: 0,
      CULTURE: 0,
      FOOD: 0,
      TECHNOLOGY: 0,
      LIFESTYLE: 0,
      FUTURE: 0
    },
    scoreCity: 0,
    totalScore: 0,
    personality: null,
    screenshotUploaded: false,
    scratchRevealed: false,
    selectedGift: null,
    rewardClaimed: false
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaultState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
    return Object.assign({}, defaultState);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateDebugModal();
    } catch (e) {
      console.warn('Failed to save state to local storage:', e);
    }
  }

  function resetAllState() {
    localStorage.removeItem(STORAGE_KEY);
    state = Object.assign({}, defaultState);
    saveState();
    showToast('All demo progress reset!');
    navigateTo('screen-login');
  }

  /* ==========================================================================
     3. SCREEN ROUTING & PROGRESS BAR
     ========================================================================== */
  const screens = [
    'screen-login',
    'screen-otp',
    'screen-welcome',
    'screen-level-1',
    'screen-level-2',
    'screen-level-3',
    'screen-level-4',
    'screen-level-5',
    'screen-result',
    'screen-social',
    'screen-upload',
    'screen-scratch'
  ];

  function navigateTo(screenId) {
    if (!screens.includes(screenId)) return;
    state.currentScreen = screenId;
    saveState();

    // Hide all screens, show target
    document.querySelectorAll('.screen-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeaderTelemetry(screenId);
    sound.playClick();

    // Trigger screen-specific hooks
    if (screenId === 'screen-level-1') {
      const startOverlay = document.getElementById('rush-start-overlay');
      const endOverlay = document.getElementById('rush-end-overlay');
      const headerStartBtn = document.getElementById('btn-header-start-rush');
      if (!rushActive) {
        if (startOverlay) startOverlay.style.display = 'flex';
        if (endOverlay) endOverlay.style.display = 'none';
        if (headerStartBtn) {
          headerStartBtn.innerHTML = '<span>▶</span> START BOTTLE RUSH';
          headerStartBtn.disabled = false;
          headerStartBtn.style.opacity = '1';
          headerStartBtn.style.pointerEvents = 'auto';
        }
      }
    } else if (screenId === 'screen-welcome') {
      initWelcomeCanvas();
    } else if (screenId === 'screen-level-2') {
      initMapGame();
    } else if (screenId === 'screen-level-3') {
      refreshDecodeBottleFrame();
    } else if (screenId === 'screen-level-4') {
      refreshBlendFrame();
    } else if (screenId === 'screen-level-5') {
      initCityStage();
    } else if (screenId === 'screen-result') {
      renderPersonalityResult();
    } else if (screenId === 'screen-social') {
      renderSocialPostCanvas();
    } else if (screenId === 'screen-scratch') {
      initScratchCard();
    }
  }

  window.navigateTo = navigateTo;
  window.navigateToLogin = function () {
    navigateTo('screen-login');
  };

  function updateHeaderTelemetry(screenId) {
    const levelBadge = document.getElementById('level-badge');
    const timerWidget = document.getElementById('timer-box-widget');
    const scoreWidget = document.getElementById('score-box-widget');
    const progressFill = document.getElementById('global-progress-fill');
    const globalScoreDisplay = document.getElementById('global-score-display');

    globalScoreDisplay.textContent = state.totalScore.toLocaleString();

    let levelText = 'THE INDIAN EDIT';
    let progressPercent = 0;
    let showTimer = false;

    switch (screenId) {
      case 'screen-login':
      case 'screen-otp':
        levelText = 'ACCESS';
        progressPercent = 5;
        break;
      case 'screen-welcome':
        levelText = 'WELCOME';
        progressPercent = 12;
        break;
      case 'screen-level-1':
        levelText = 'LEVEL 01 / 05';
        progressPercent = 25;
        showTimer = true;
        break;
      case 'screen-level-2':
        levelText = 'LEVEL 02 / 05';
        progressPercent = 45;
        break;
      case 'screen-level-3':
        levelText = 'LEVEL 03 / 05';
        progressPercent = 65;
        break;
      case 'screen-level-4':
        levelText = 'LEVEL 04 / 05';
        progressPercent = 80;
        break;
      case 'screen-level-5':
        levelText = 'LEVEL 05 / 05';
        progressPercent = 95;
        showTimer = true;
        break;
      case 'screen-result':
        levelText = 'FINAL EDIT';
        progressPercent = 100;
        break;
      case 'screen-social':
        levelText = 'SOCIAL POST';
        progressPercent = 100;
        break;
      case 'screen-upload':
        levelText = 'BONUS CLAIM';
        progressPercent = 100;
        break;
      case 'screen-scratch':
        levelText = 'REWARD';
        progressPercent = 100;
        break;
    }

    levelBadge.textContent = levelText;
    progressFill.style.width = progressPercent + '%';
    timerWidget.style.display = showTimer ? 'flex' : 'none';
  }

  function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     4. SCREEN 1 & 2: LOGIN & OTP FLOW
     ========================================================================== */
  window.handleCityChange = function (val) {
    const customInput = document.getElementById('login-custom-city');
    if (!customInput) return;
    if (val === 'Other') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
    }
  };

  window.handleSendOtp = function () {
    const nameInput = document.getElementById('login-name');
    const citySelect = document.getElementById('login-city');
    const customCityInput = document.getElementById('login-custom-city');
    const phoneInput = document.getElementById('phone-input');

    const enteredName = nameInput ? nameInput.value.trim() : '';
    if (!enteredName) {
      showToast('Please enter your full name');
      sound.playError();
      if (nameInput) nameInput.focus();
      return;
    }

    let selectedCity = citySelect ? citySelect.value : 'Nagpur';
    if (selectedCity === 'Other' && customCityInput && customCityInput.value.trim()) {
      selectedCity = customCityInput.value.trim();
    }

    const rawVal = phoneInput.value.replace(/\D/g, '');
    if (rawVal.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number');
      sound.playError();
      return;
    }

    state.userName = enteredName;
    state.userCity = selectedCity;
    state.userPhone = rawVal;
    saveState();
    sound.playSuccess();

    document.getElementById('otp-phone-display').textContent = `+91 ${rawVal.slice(0, 5)} ${rawVal.slice(5)}`;
    navigateTo('screen-otp');

    // Auto-focus first digit
    setTimeout(() => {
      const firstDigit = document.querySelector('.otp-digit[data-idx="0"]');
      if (firstDigit) firstDigit.focus();
    }, 300);
  };

  function setupOtpInputs() {
    const otpInputs = document.querySelectorAll('.otp-digit');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[0] : '';
        if (val && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
        clearOtpError();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
          otpInputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasted.length) {
          pasted.split('').slice(0, 6).forEach((char, i) => {
            if (otpInputs[i]) otpInputs[i].value = char;
          });
          const nextIdx = Math.min(pasted.length, otpInputs.length - 1);
          otpInputs[nextIdx].focus();
        }
      });
    });

    document.getElementById('btn-verify-otp').addEventListener('click', verifyOtp);
    document.getElementById('btn-resend-otp').addEventListener('click', () => {
      sound.playClick();
      showToast('New OTP sent: 123456 (Demo mode)');
      otpInputs.forEach(i => i.value = '');
      otpInputs[0].focus();
    });

    document.getElementById('btn-change-number').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-login');
    });
  }

  function verifyOtp() {
    const otpInputs = document.querySelectorAll('.otp-digit');
    let enteredCode = '';
    otpInputs.forEach(i => enteredCode += i.value);

    if (enteredCode === '123456') {
      state.otpVerified = true;
      saveState();
      sound.playSuccess();
      showToast(`Welcome, ${state.userName || 'Explorer'}!`);

      // Personalize Welcome Screen
      const welcomeHeading = document.getElementById('welcome-heading');
      const welcomeSub = document.getElementById('welcome-subheading');
      if (welcomeHeading) {
        welcomeHeading.textContent = `WELCOME, ${state.userName ? state.userName.toUpperCase() : 'EXPLORER'}.`;
      }
      if (welcomeSub) {
        welcomeSub.textContent = `Your interactive discovery from ${state.userCity || 'Nagpur'} begins here. A celebration of Indian heritage, sustainable craft, and contemporary luxury.`;
      }

      navigateTo('screen-welcome');
    } else {
      sound.playError();
      const err = document.getElementById('otp-error-text');
      err.textContent = 'Incorrect OTP code. For demo, please enter 123456.';
      otpInputs.forEach(input => {
        input.style.borderColor = '#ff5555';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      });
    }
  }

  function clearOtpError() {
    document.getElementById('otp-error-text').textContent = '';
    document.querySelectorAll('.otp-digit').forEach(input => {
      input.style.borderColor = '';
    });
  }

  /* ==========================================================================
     5. SCREEN 3: WELCOME SCREEN (PARTICLE AMBIENCE)
     ========================================================================== */
  let welcomeAnimationId = null;

  function initWelcomeCanvas() {
    const canvas = document.getElementById('welcome-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 1,
        color: Math.random() > 0.4 ? '#e26f20' : '#d4af37',
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    if (welcomeAnimationId) cancelAnimationFrame(welcomeAnimationId);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      welcomeAnimationId = requestAnimationFrame(loop);
    }
    loop();

    document.getElementById('btn-start-welcome').onclick = () => {
      navigateTo('screen-level-1');
    };
  }

  /* ==========================================================================
     6. LEVEL 1: THE INDIAN EDIT BOTTLE RUSH (HERITAGE COLLECTION MINI-GAME)
     ========================================================================== */
  const GAME_DURATION = 10;
  const SCORES = {
    brandedBottle: 10,
    coldrinkBottle: -5,
    wrongObject: -5,
    heritageToken: 15,
    sustainableToken: 10
  };

  let rushActive = false;
  let rushTimeLeft = GAME_DURATION;
  let rushStartTime = 0;
  let rushTimerInterval = null;
  let rushSpawnInterval = null;
  let lastTickSecond = -1;

  function initOrangeRush() {
    // Initial UI event binding
    const startBtn = document.getElementById('btn-start-rush');
    if (startBtn) startBtn.onclick = startBottleRush;

    const headerStartBtn = document.getElementById('btn-header-start-rush');
    if (headerStartBtn) headerStartBtn.onclick = startBottleRush;

    const continueBtn = document.getElementById('btn-rush-continue');
    if (continueBtn) {
      continueBtn.onclick = () => {
        saveLevel1Progress();
        navigateTo('screen-level-2');
      };
    }

    const replayBtn = document.getElementById('btn-rush-replay');
    if (replayBtn) {
      replayBtn.onclick = () => {
        // Reset Level 1 specifics and start again
        state.scoreBottle = 0;
        state.scoreRush = 0;
        state.bottlesCollected = 0;
        state.bonusPoints = 0;
        saveLevel1Progress();
        startBottleRush();
      };
    }
  }

  function startBottleRush() {
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    // Reset overlay visibility
    const startOverlay = document.getElementById('rush-start-overlay');
    const endOverlay = document.getElementById('rush-end-overlay');
    if (startOverlay) startOverlay.style.display = 'none';
    if (endOverlay) endOverlay.style.display = 'none';

    // Update Header Start button state
    const headerStartBtn = document.getElementById('btn-header-start-rush');
    if (headerStartBtn) {
      headerStartBtn.innerHTML = '<span>⏱</span> PLAYING...';
      headerStartBtn.disabled = true;
      headerStartBtn.style.opacity = '0.75';
      headerStartBtn.style.pointerEvents = 'none';
    }

    // Clear any previous objects & floating indicators
    arena.querySelectorAll('.game-object, .float-score, .gold-sparkle-burst').forEach(el => el.remove());

    // Reset live counters
    state.scoreBottle = 0;
    state.scoreRush = 0;
    state.bottlesCollected = 0;
    state.bonusPoints = 0;
    rushTimeLeft = GAME_DURATION;
    lastTickSecond = -1;
    rushActive = true;

    // Reset telemetry displays
    calculateBottleScore();
    const timerBox = document.getElementById('stat-box-timer');
    const timerBar = document.getElementById('bottle-timer-bar');
    if (timerBox) timerBox.classList.remove('urgent');
    if (timerBar) {
      timerBar.classList.remove('urgent');
      timerBar.style.width = '100%';
    }
    document.getElementById('rush-timer-num').textContent = `${GAME_DURATION}.0s`;
    document.getElementById('global-timer-display').textContent = `${GAME_DURATION}.0s`;

    sound.playSuccess();

    // Spawn initial wave of objects (Cold Drink replaces Golden Bottle)
    spawnBottle('branded');
    spawnBottle('branded');
    spawnColdrinkBottle();
    spawnWrongObject();

    // Start timer loop & periodic spawner
    rushStartTime = performance.now();
    clearInterval(rushTimerInterval);
    clearInterval(rushSpawnInterval);

    rushTimerInterval = setInterval(updateTimer, 50);
    rushSpawnInterval = setInterval(() => {
      if (!rushActive) return;
      const count = arena.querySelectorAll('.game-object').length;
      if (count < 6) {
        const roll = Math.random();
        if (roll < 0.45) {
          spawnBottle('branded');
        } else if (roll < 0.65) {
          spawnColdrinkBottle();
        } else if (roll < 0.78) {
          spawnBottle('heritage');
        } else if (roll < 0.88) {
          spawnBottle('sustainable');
        } else {
          spawnWrongObject();
        }
      }
    }, 420);
  }

  function updateTimer() {
    if (!rushActive) return;
    const elapsed = performance.now() - rushStartTime;
    const remaining = Math.max(0, (GAME_DURATION * 1000 - elapsed) / 1000);
    rushTimeLeft = remaining;

    const timerNumEl = document.getElementById('rush-timer-num');
    const globalTimerEl = document.getElementById('global-timer-display');
    const timerBar = document.getElementById('bottle-timer-bar');
    const timerBox = document.getElementById('stat-box-timer');

    if (timerNumEl) timerNumEl.textContent = `${remaining.toFixed(1)}s`;
    if (globalTimerEl) globalTimerEl.textContent = `${remaining.toFixed(1)}s`;

    // Update progress bar width
    if (timerBar) {
      const pct = Math.max(0, Math.min(100, (remaining / GAME_DURATION) * 100));
      timerBar.style.width = `${pct}%`;
    }

    // Urgency state at <= 3.0 seconds
    if (remaining <= 3.0) {
      if (timerBox) timerBox.classList.add('urgent');
      if (timerBar) timerBar.classList.add('urgent');

      const currentSec = Math.ceil(remaining);
      if (currentSec > 0 && currentSec !== lastTickSecond) {
        lastTickSecond = currentSec;
        sound.playTick();
      }
    } else {
      if (timerBox) timerBox.classList.remove('urgent');
      if (timerBar) timerBar.classList.remove('urgent');
    }

    // Stop immediately at 0s
    if (remaining <= 0) {
      endBottleRush();
    }
  }

  function spawnBottle(type = 'branded') {
    if (!rushActive) return;
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    const target = document.createElement('div');
    target.className = 'game-object';

    let imgSrc = './assets/game/bottle-tie.svg';
    let altText = 'The Indian Edit Bottle';

    if (type === 'heritage') {
      target.classList.add('obj-heritage');
      imgSrc = './assets/game/token-heritage.svg';
      altText = 'Golden Heritage Token';
    } else if (type === 'sustainable') {
      target.classList.add('obj-leaf');
      imgSrc = './assets/game/token-leaf.svg';
      altText = 'Sustainable Leaf Token';
    } else {
      target.classList.add('obj-tie-bottle');
      imgSrc = './assets/game/bottle-tie.svg';
      altText = 'The Indian Edit Heritage Bottle';
    }

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = altText;
    target.appendChild(img);

    // Random safe arena coordinates
    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;
    const padX = 60;
    const padY = 70;
    const posX = padX + Math.random() * (arenaWidth - padX * 2);
    const posY = padY + Math.random() * (arenaHeight - padY * 2);

    target.style.left = `${posX}px`;
    target.style.top = `${posY}px`;

    // Smooth floating and subtle drift animation
    const driftX = (Math.random() - 0.5) * 60;
    const driftY = (Math.random() - 0.5) * 50;
    const rot = (Math.random() - 0.5) * 6;

    target.animate([
      { transform: `translate(-50%, -50%) scale(0.3) rotate(0deg)`, opacity: 0 },
      { transform: `translate(-50%, -50%) scale(1) rotate(${rot}deg)`, opacity: 1, offset: 0.2 },
      { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1) rotate(${rot * 1.5}deg)`, opacity: 1, offset: 0.8 },
      { transform: `translate(calc(-50% + ${driftX * 1.3}px), calc(-50% + ${driftY * 1.3}px)) scale(0.7) rotate(${rot * 2}deg)`, opacity: 0 }
    ], {
      duration: 2200,
      easing: 'ease-out'
    });

    const autoRemove = setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 2200);

    // Collection event listener
    const onCollect = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(autoRemove);
      collectBottle(target, type, posX, posY);
    };

    target.addEventListener('pointerdown', onCollect);
    arena.appendChild(target);
  }

  function spawnColdrinkBottle() {
    if (!rushActive) return;
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    const target = document.createElement('div');
    target.className = 'game-object obj-coldrink';

    const img = document.createElement('img');
    img.src = './assets/game/bottle-coldrink.svg';
    img.alt = 'Cold Drink Bottle (Avoid)';
    target.appendChild(img);

    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;
    const padX = 55;
    const padY = 65;
    const posX = padX + Math.random() * (arenaWidth - padX * 2);
    const posY = padY + Math.random() * (arenaHeight - padY * 2);

    target.style.left = `${posX}px`;
    target.style.top = `${posY}px`;

    const driftX = (Math.random() - 0.5) * 35;
    const driftY = (Math.random() - 0.5) * 30;
    const rot = (Math.random() - 0.5) * 8;

    target.animate([
      { transform: 'translate(-50%, -50%) scale(0.3) rotate(0deg)', opacity: 0 },
      { transform: `translate(-50%, -50%) scale(1) rotate(${rot}deg)`, opacity: 1, offset: 0.18 },
      { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1) rotate(${rot * 1.5}deg)`, opacity: 1, offset: 0.8 },
      { transform: `translate(calc(-50% + ${driftX * 1.2}px), calc(-50% + ${driftY * 1.2}px)) scale(0.65) rotate(${rot * 2}deg)`, opacity: 0 }
    ], {
      duration: 2200,
      easing: 'ease-out'
    });

    const autoRemove = setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 2200);

    const onColdrink = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(autoRemove);
      collectWrongObject(target, posX, posY);
    };

    target.addEventListener('pointerdown', onColdrink);
    arena.appendChild(target);
  }

  function spawnWrongObject() {
    if (!rushActive) return;
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    const target = document.createElement('div');
    target.className = 'game-object';

    const isWaste = Math.random() > 0.5;
    let imgSrc = './assets/game/wrong-generic.svg';
    let altText = 'Generic Plastic Bottle';

    if (isWaste) {
      target.classList.add('obj-waste');
      imgSrc = './assets/game/wrong-waste.svg';
      altText = 'Plastic Waste';
    } else {
      target.classList.add('obj-wrong');
      imgSrc = './assets/game/wrong-generic.svg';
      altText = 'Generic Packaging';
    }

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = altText;
    target.appendChild(img);

    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;
    const padX = 55;
    const padY = 65;
    const posX = padX + Math.random() * (arenaWidth - padX * 2);
    const posY = padY + Math.random() * (arenaHeight - padY * 2);

    target.style.left = `${posX}px`;
    target.style.top = `${posY}px`;

    const driftX = (Math.random() - 0.5) * 50;
    const driftY = (Math.random() - 0.5) * 45;

    target.animate([
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.2 },
      { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1)`, opacity: 1, offset: 0.8 },
      { transform: `translate(calc(-50% + ${driftX * 1.2}px), calc(-50% + ${driftY * 1.2}px)) scale(0.6)`, opacity: 0 }
    ], {
      duration: 2000,
      easing: 'ease-out'
    });

    const autoRemove = setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 2000);

    const onWrong = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(autoRemove);
      collectWrongObject(target, posX, posY);
    };

    target.addEventListener('pointerdown', onWrong);
    arena.appendChild(target);
  }

  function collectBottle(target, type, posX, posY) {
    // Prevent duplicate clicks on the same object
    if (target.dataset.collected === 'true') return;
    target.dataset.collected = 'true';
    target.style.pointerEvents = 'none';

    let pts = SCORES.brandedBottle;
    let label = '+10';
    let color = '#5cdb7a';

    if (type === 'heritage') {
      pts = SCORES.heritageToken;
      label = '+15';
      color = '#fced98';
      state.bonusPoints += 15;
      sound.playCollect(true);
    } else if (type === 'sustainable') {
      pts = SCORES.sustainableToken;
      label = '+10';
      color = '#73a942';
      state.bonusPoints += 10;
      sound.playCollect(false);
    } else {
      pts = SCORES.brandedBottle;
      label = '+10';
      color = '#ffe485';
      state.bottlesCollected += 1;
      sound.playCollect(false);
    }

    state.scoreBottle += pts;
    calculateBottleScore();

    // Spawn floating score indicator
    showFloatingScore(label, color, posX, posY);

    // Sparkle effect for heritage items
    if (type === 'heritage') {
      createSparkleBurst(posX, posY);
    }

    // Shrink and pop out object
    target.animate([
      { transform: 'translate(-50%, -50%) scale(1.35)', opacity: 0.9 },
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
    ], { duration: 180, fill: 'forwards' });

    setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 180);

    // Replenish with a new bottle dynamically
    if (rushActive && Math.random() > 0.4) {
      setTimeout(() => spawnBottle('branded'), 120);
    }
  }

  function collectWrongObject(target, posX, posY) {
    if (target.dataset.collected === 'true') return;
    target.dataset.collected = 'true';
    target.style.pointerEvents = 'none';

    // Penalty: -5 pts. Score never drops below zero.
    state.scoreBottle = Math.max(0, state.scoreBottle + SCORES.wrongObject);
    calculateBottleScore();

    showFloatingScore('-5', '#ff5555', posX, posY);
    sound.playError();

    // Red penalty shake
    target.classList.add('obj-penalty-shake');
    target.animate([
      { filter: 'brightness(1.5) sepia(1) hue-rotate(-50deg)', opacity: 1 },
      { filter: 'brightness(0.5)', opacity: 0 }
    ], { duration: 250, fill: 'forwards' });

    setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 250);
  }

  function showFloatingScore(text, color, x, y) {
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    const floatEl = document.createElement('div');
    floatEl.className = 'float-score';
    floatEl.textContent = text;
    floatEl.style.color = color;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    arena.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentElement) floatEl.remove();
    }, 850);
  }

  function createSparkleBurst(x, y) {
    const arena = document.getElementById('bottle-rush-arena');
    if (!arena) return;

    const burst = document.createElement('div');
    burst.className = 'gold-sparkle-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.innerHTML = `
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <circle cx="25" cy="25" r="18" fill="none" stroke="#ffd700" stroke-width="1.5" opacity="0.8"/>
        <polygon points="25,5 28,20 43,25 28,30 25,45 22,30 7,25 22,20" fill="#ffffff"/>
      </svg>
    `;
    arena.appendChild(burst);
    setTimeout(() => {
      if (burst.parentElement) burst.remove();
    }, 600);
  }

  function calculateBottleScore() {
    // Score never drops below zero
    state.scoreBottle = Math.max(0, state.scoreBottle || 0);
    state.scoreRush = state.scoreBottle;

    // Update screen telemetry
    const scoreNumEl = document.getElementById('rush-score-num');
    const bottlesNumEl = document.getElementById('rush-bottles-num');
    if (scoreNumEl) scoreNumEl.textContent = state.scoreBottle;
    if (bottlesNumEl) bottlesNumEl.textContent = state.bottlesCollected || 0;

    recalculateTotalScore();
    return state.scoreBottle;
  }

  function endBottleRush() {
    rushActive = false;
    clearInterval(rushTimerInterval);
    clearInterval(rushSpawnInterval);

    // Stop timer at 0.0s
    document.getElementById('rush-timer-num').textContent = '0.0s';
    document.getElementById('global-timer-display').textContent = '0.0s';
    const timerBar = document.getElementById('bottle-timer-bar');
    if (timerBar) timerBar.style.width = '0%';

    const arena = document.getElementById('bottle-rush-arena');
    if (arena) {
      arena.querySelectorAll('.game-object').forEach(el => el.remove());
    }

    // Final score calculation
    calculateBottleScore();
    saveLevel1Progress();
    sound.playFanfare();

    // Determine category message:
    // 0–100: A NEW EDIT BEGINS.
    // 101–300: THE ESSENCE IS UNFOLDING.
    // 301–600: YOU'RE FINDING YOUR EDIT.
    // 601+: YOU'VE CAPTURED THE ESSENCE.
    let categoryMsg = "A NEW EDIT BEGINS.";
    const sc = state.scoreBottle;
    if (sc > 600) {
      categoryMsg = "YOU'VE CAPTURED THE ESSENCE.";
    } else if (sc > 300) {
      categoryMsg = "YOU'RE FINDING YOUR EDIT.";
    } else if (sc > 100) {
      categoryMsg = "THE ESSENCE IS UNFOLDING.";
    } else {
      categoryMsg = "A NEW EDIT BEGINS.";
    }

    const categoryBadge = document.getElementById('rush-category-message');
    if (categoryBadge) categoryBadge.textContent = categoryMsg;

    // Animate score counter roll on result overlay
    animateCounter('rush-res-score', 0, state.scoreBottle, 1000);
    animateCounter('rush-res-count', 0, state.bottlesCollected, 800);
    animateCounter('rush-res-bonus', 0, state.bonusPoints, 800);

    const endOverlay = document.getElementById('rush-end-overlay');
    if (endOverlay) endOverlay.style.display = 'flex';

    // Re-enable Header Start button
    const headerStartBtn = document.getElementById('btn-header-start-rush');
    if (headerStartBtn) {
      headerStartBtn.innerHTML = '<span>↺</span> PLAY AGAIN';
      headerStartBtn.disabled = false;
      headerStartBtn.style.opacity = '1';
      headerStartBtn.style.pointerEvents = 'auto';
    }
  }

  function saveLevel1Progress() {
    state.scoreRush = state.scoreBottle;
    saveState();
  }

  /* ==========================================================================
     7. LEVEL 2: LOCATE YOUR CITY (OFFICIAL INDIA MAP & GEOGRAPHIC DISCOVERY)
     ========================================================================== */
  let mapCanvas, mapCtx;
  let markerPos = { svgX: 380, svgY: 450, normX: 0.5, normY: 0.517 };
  let mapDragging = false;
  let zeroScore = 0;
  let isTargetRevealed = false;
  let hoveredState = null;
  let mapInitialized = false;
  let mapTransform = { scale: 1, offsetX: 0, offsetY: 0, w: 760, h: 870 };
  let cachedStatePaths = null;
  let revealAnimFrame = null;
  let revealPulseTime = 0;

  function getMapData() {
    if (typeof window !== 'undefined' && window.INDIA_MAP_DATA) {
      return window.INDIA_MAP_DATA;
    }
    // Safe fallback helper if global is loading
    return {
      width: 760,
      height: 870,
      project: (lon, lat) => {
        const x = 25 + ((lon - 68) / (97.5 - 68)) * 710;
        const y = 25 + ((37.2 - lat) / (37.2 - 6.5)) * 820;
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      },
      unproject: (normX, normY) => {
        const lon = 68 + ((normX * 760 - 25) / 710) * (97.5 - 68);
        const lat = 37.2 - ((normY * 870 - 25) / 820) * (37.2 - 6.5);
        return [lon, lat];
      },
      haversineKm: (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      },
      getCityInfo: (cityName) => ({
        name: cityName || 'Nagpur',
        state: 'Maharashtra',
        lat: 21.1458,
        lon: 79.0882,
        desc: 'Zero Mile Center of India'
      }),
      states: []
    };
  }

  function getCityTarget(cityName) {
    const data = getMapData();
    return data.getCityInfo(cityName || state.userCity || 'Nagpur');
  }

  function getCachedStatePaths() {
    if (cachedStatePaths) return cachedStatePaths;
    const data = getMapData();
    if (data && data.states && data.states.length > 0) {
      cachedStatePaths = data.states.map(s => ({
        name: s.name,
        path: new Path2D(s.d)
      }));
      return cachedStatePaths;
    }
    return [];
  }

  function setupLevel2CityUI() {
    const target = getCityTarget(state.userCity || 'Nagpur');
    const cityName = target.name;
    const upperCity = cityName.toUpperCase();

    isTargetRevealed = false;
    zeroScore = 0;
    if (revealAnimFrame) {
      cancelAnimationFrame(revealAnimFrame);
      revealAnimFrame = null;
    }

    const titleEl = document.getElementById('level-2-title');
    const subEl = document.getElementById('level-2-subtitle');
    const ctrlTitle = document.getElementById('map-controls-title');
    const ctrlDesc = document.getElementById('map-controls-desc');
    const radarCity = document.getElementById('radar-city-target');
    const lockBtn = document.getElementById('btn-lock-map');
    const accNumEl = document.getElementById('zero-accuracy-num');
    const scoreNumEl = document.getElementById('zero-score-num');
    const distKmEl = document.getElementById('radar-dist-km');
    const radarStatus = document.getElementById('radar-status-text');

    if (titleEl) titleEl.textContent = `LOCATE ${upperCity}`;
    if (subEl) subEl.textContent = `CAN YOU FIND ${upperCity} ON THE MAP OF INDIA? Pinpoint its location accurately to score up to 1,000 points!`;
    if (ctrlTitle) ctrlTitle.textContent = `LOCATE ${upperCity}`;
    if (ctrlDesc) {
      ctrlDesc.textContent = `Test your geography knowledge! Move the golden pin to where you believe ${cityName}${target.state ? ' (' + target.state + ')' : ''} is situated on the map of India. Tap/drag directly on the map, use arrow keys, or the controls below.`;
    }
    if (radarCity) radarCity.textContent = cityName;
    if (accNumEl) accNumEl.textContent = '--%';
    if (scoreNumEl) scoreNumEl.textContent = '1,000';
    if (distKmEl) distKmEl.textContent = 'Coordinates Hidden';
    if (radarStatus) {
      radarStatus.textContent = `📍 SEARCHING: Place pin on ${upperCity} & lock position`;
      radarStatus.style.color = 'var(--gold-light)';
    }

    if (lockBtn) {
      lockBtn.disabled = false;
      lockBtn.innerHTML = 'LOCK POSITION &rarr;';
      lockBtn.style.opacity = '1';
    }

    // Place marker in a neutral starting spot distinct from target
    const data = getMapData();
    const [tSvgX, tSvgY] = data.project(target.lon, target.lat);
    markerPos.svgX = tSvgX > 380 ? 240 : 520;
    markerPos.svgY = tSvgY > 435 ? 280 : 640;
    markerPos.normX = markerPos.svgX / data.width;
    markerPos.normY = markerPos.svgY / data.height;

    if (mapCanvas && mapCtx) {
      drawIndiaMap();
    }
  }

  function initMapGame() {
    mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    mapCtx = mapCanvas.getContext('2d');

    function resizeMap() {
      const container = mapCanvas.parentElement;
      if (!container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = container.clientWidth || 600;
      const ch = container.clientHeight || 500;
      mapCanvas.width = cw * dpr;
      mapCanvas.height = ch * dpr;
      mapCtx.setTransform(1, 0, 0, 1, 0, 0);
      mapCtx.scale(dpr, dpr);
      mapCanvas.style.width = cw + 'px';
      mapCanvas.style.height = ch + 'px';
      drawIndiaMap();
    }

    resizeMap();

    if (!mapInitialized) {
      mapInitialized = true;
      window.addEventListener('resize', resizeMap);

      // Event listeners for dragging & clicking marker
      mapCanvas.addEventListener('pointerdown', (e) => {
        if (isTargetRevealed) return;
        mapDragging = true;
        setMarkerFromPointer(e);
        sound.playClick();
      });

      window.addEventListener('pointermove', (e) => {
        const rect = mapCanvas.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const clientX = e.clientX - rect.left;
          const clientY = e.clientY - rect.top;
          const svgX = (clientX - mapTransform.offsetX) / mapTransform.scale;
          const svgY = (clientY - mapTransform.offsetY) / mapTransform.scale;

          if (mapDragging && !isTargetRevealed) {
            setMarkerFromPointer(e);
          } else {
            // Check state hover
            checkHoverState(svgX, svgY);
          }
        }
      });

      window.addEventListener('pointerup', () => {
        mapDragging = false;
      });

      // Virtual D-pad controls
      const stepSvg = 18;
      document.getElementById('btn-map-up').onclick = () => moveMarker(0, -stepSvg);
      document.getElementById('btn-map-down').onclick = () => moveMarker(0, stepSvg);
      document.getElementById('btn-map-left').onclick = () => moveMarker(-stepSvg, 0);
      document.getElementById('btn-map-right').onclick = () => moveMarker(stepSvg, 0);

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (state.currentScreen !== 'screen-level-2' || isTargetRevealed) return;
        if (e.key === 'ArrowUp') { moveMarker(0, -stepSvg); e.preventDefault(); }
        if (e.key === 'ArrowDown') { moveMarker(0, stepSvg); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { moveMarker(-stepSvg, 0); e.preventDefault(); }
        if (e.key === 'ArrowRight') { moveMarker(stepSvg, 0); e.preventDefault(); }
        if (e.key === 'Enter' || e.key === ' ') {
          const lockBtn = document.getElementById('btn-lock-map');
          if (lockBtn && !lockBtn.disabled) lockMapPosition();
        }
      });

      document.getElementById('btn-lock-map').onclick = lockMapPosition;
      document.getElementById('btn-zero-continue').onclick = () => {
        document.getElementById('zero-mile-modal').classList.remove('show');
        navigateTo('screen-level-3');
      };
    }

    setupLevel2CityUI();
  }

  function checkHoverState(svgX, svgY) {
    const paths = getCachedStatePaths();
    let found = null;
    for (let i = 0; i < paths.length; i++) {
      if (mapCtx.isPointInPath(paths[i].path, svgX, svgY)) {
        found = paths[i].name;
        break;
      }
    }
    if (found !== hoveredState) {
      hoveredState = found;
      drawIndiaMap();
    }
  }

  function moveMarker(dx, dy) {
    if (isTargetRevealed) return;
    const data = getMapData();
    markerPos.svgX = Math.max(35, Math.min(data.width - 35, markerPos.svgX + dx));
    markerPos.svgY = Math.max(35, Math.min(data.height - 35, markerPos.svgY + dy));
    markerPos.normX = markerPos.svgX / data.width;
    markerPos.normY = markerPos.svgY / data.height;

    drawIndiaMap();
    updateMapProximityBeforeLock();
    sound.playClick();
  }

  function setMarkerFromPointer(e) {
    if (isTargetRevealed) return;
    const rect = mapCanvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const data = getMapData();

    const svgX = (clientX - mapTransform.offsetX) / mapTransform.scale;
    const svgY = (clientY - mapTransform.offsetY) / mapTransform.scale;

    markerPos.svgX = Math.max(35, Math.min(data.width - 35, svgX));
    markerPos.svgY = Math.max(35, Math.min(data.height - 35, svgY));
    markerPos.normX = markerPos.svgX / data.width;
    markerPos.normY = markerPos.svgY / data.height;

    drawIndiaMap();
    updateMapProximityBeforeLock();
  }

  function updateMapProximityBeforeLock() {
    const target = getCityTarget(state.userCity || 'Nagpur');
    const radarStatus = document.getElementById('radar-status-text');

    if (radarStatus) {
      if (hoveredState) {
        radarStatus.textContent = `📍 PIN IN ${hoveredState.toUpperCase()} • Locking will evaluate distance to ${target.name.toUpperCase()}`;
      } else {
        radarStatus.textContent = `📍 PIN POSITION SET • Click LOCK POSITION to verify accuracy!`;
      }
      radarStatus.style.color = '#fff1b8';
    }
  }

  function drawIndiaMap() {
    if (!mapCtx || !mapCanvas) return;
    const container = mapCanvas.parentElement;
    const w = container ? container.clientWidth : mapCanvas.width;
    const h = container ? container.clientHeight : mapCanvas.height;
    const data = getMapData();

    mapCtx.clearRect(0, 0, w, h);

    // Deep luxury maritime canvas background
    const bgGrad = mapCtx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h));
    bgGrad.addColorStop(0, '#22150e');
    bgGrad.addColorStop(0.5, '#160d08');
    bgGrad.addColorStop(1, '#0c0704');
    mapCtx.fillStyle = bgGrad;
    mapCtx.fillRect(0, 0, w, h);

    // Subtle geographic grid lines (Graticules)
    mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    mapCtx.lineWidth = 1;
    const gridStep = 45;
    for (let x = 0; x < w; x += gridStep) {
      mapCtx.beginPath();
      mapCtx.moveTo(x, 0);
      mapCtx.lineTo(x, h);
      mapCtx.stroke();
    }
    for (let y = 0; y < h; y += gridStep) {
      mapCtx.beginPath();
      mapCtx.moveTo(0, y);
      mapCtx.lineTo(w, y);
      mapCtx.stroke();
    }

    // Oceanic Typography & Heritage Cartography Water Labels
    mapCtx.save();
    mapCtx.font = '600 10px Montserrat, sans-serif';
    mapCtx.fillStyle = 'rgba(212, 175, 55, 0.22)';
    mapCtx.letterSpacing = '3px';
    mapCtx.textAlign = 'center';
    mapCtx.fillText('A R A B I A N   S E A', w * 0.22, h * 0.70);
    mapCtx.fillText('B A Y   O F   B E N G A L', w * 0.80, h * 0.65);
    mapCtx.fillText('I N D I A N   O C E A N', w * 0.50, h * 0.95);
    mapCtx.restore();

    // Compute scale and centering for India map (viewBox 760 x 870)
    const pad = 24;
    const scale = Math.min((w - pad * 2) / data.width, (h - pad * 2) / data.height);
    const offsetX = (w - data.width * scale) / 2;
    const offsetY = (h - data.height * scale) / 2;
    mapTransform = { scale, offsetX, offsetY, w, h };

    mapCtx.save();
    mapCtx.translate(offsetX, offsetY);
    mapCtx.scale(scale, scale);

    // 1. Draw Tropic of Cancer (23.5° N) subtle guide
    const [tCancerStart] = data.project(68.5, 23.44);
    const [, tCancerY] = data.project(68.5, 23.44);
    const [tCancerEnd] = data.project(94.0, 23.44);

    mapCtx.beginPath();
    mapCtx.setLineDash([4, 6]);
    mapCtx.moveTo(tCancerStart, tCancerY);
    mapCtx.lineTo(tCancerEnd, tCancerY);
    mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
    mapCtx.lineWidth = 1;
    mapCtx.stroke();
    mapCtx.setLineDash([]);

    mapCtx.font = '500 8.5px Montserrat, sans-serif';
    mapCtx.fillStyle = 'rgba(212, 175, 55, 0.35)';
    mapCtx.textAlign = 'left';
    mapCtx.fillText('Tropic of Cancer (23.5° N)', tCancerStart + 4, tCancerY - 4);

    // 2. Draw Official Administrative State Boundaries of India
    const paths = getCachedStatePaths();

    // Outer glow for Indian subcontinent landmass
    mapCtx.shadowColor = 'rgba(212, 175, 55, 0.25)';
    mapCtx.shadowBlur = 16;

    for (let i = 0; i < paths.length; i++) {
      const s = paths[i];
      const isHovered = (hoveredState === s.name);

      // Gradient Fill for each state
      const grad = mapCtx.createLinearGradient(150, 80, 550, 750);
      if (isHovered && !isTargetRevealed) {
        grad.addColorStop(0, '#54301d');
        grad.addColorStop(0.5, '#402315');
        grad.addColorStop(1, '#2c160c');
      } else {
        grad.addColorStop(0, '#362117');
        grad.addColorStop(0.5, '#28170f');
        grad.addColorStop(1, '#1b0e08');
      }

      mapCtx.fillStyle = grad;
      mapCtx.fill(s.path);
    }

    mapCtx.shadowBlur = 0; // Turn off glow for crisp strokes

    // State borders in royal metallic gold
    for (let i = 0; i < paths.length; i++) {
      const s = paths[i];
      const isHovered = (hoveredState === s.name);

      if (isHovered && !isTargetRevealed) {
        mapCtx.strokeStyle = '#fff1b8';
        mapCtx.lineWidth = 2.0;
      } else {
        mapCtx.strokeStyle = '#d4af37';
        mapCtx.lineWidth = 1.1;
      }
      mapCtx.stroke(s.path);
    }

    // 3. Hovered State Tooltip on Map
    if (hoveredState && !isTargetRevealed) {
      mapCtx.save();
      mapCtx.font = '600 11px Montserrat, sans-serif';
      mapCtx.fillStyle = 'rgba(255, 241, 184, 0.95)';
      mapCtx.textAlign = 'center';
      mapCtx.shadowColor = 'rgba(0,0,0,0.8)';
      mapCtx.shadowBlur = 6;
      mapCtx.fillText(hoveredState.toUpperCase(), markerPos.svgX, markerPos.svgY - 28);
      mapCtx.restore();
    }

    // 4. Target City Handling:
    // CRITICAL REQUIREMENT: "and dont show the target place directly to the consumer"
    // The target city is ONLY drawn AFTER the user clicks "LOCK POSITION" (isTargetRevealed === true).
    if (isTargetRevealed) {
      const target = getCityTarget(state.userCity || 'Nagpur');
      const [tx, ty] = data.project(target.lon, target.lat);
      const px = markerPos.svgX;
      const py = markerPos.svgY;

      // Draw Laser Measurement Line between player pin and actual target
      mapCtx.save();
      mapCtx.beginPath();
      mapCtx.setLineDash([5, 5]);
      mapCtx.moveTo(px, py);
      mapCtx.lineTo(tx, ty);
      mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
      mapCtx.lineWidth = 2.2;
      mapCtx.shadowColor = 'rgba(226, 111, 32, 0.8)';
      mapCtx.shadowBlur = 10;
      mapCtx.stroke();
      mapCtx.setLineDash([]);
      mapCtx.restore();

      // Measurement Distance Badge on the line
      const midX = (px + tx) / 2;
      const midY = (py + ty) / 2;
      const [guessLon, guessLat] = data.unproject(markerPos.normX, markerPos.normY);
      const distKm = data.haversineKm(guessLat, guessLon, target.lat, target.lon);

      mapCtx.save();
      mapCtx.font = 'bold 10px Montserrat, sans-serif';
      const labelText = `${distKm} km error`;
      const textWidth = mapCtx.measureText(labelText).width;

      mapCtx.fillStyle = 'rgba(22, 14, 9, 0.92)';
      mapCtx.strokeStyle = '#d4af37';
      mapCtx.lineWidth = 1.2;
      mapCtx.beginPath();
      mapCtx.roundRect(midX - textWidth / 2 - 8, midY - 10, textWidth + 16, 20, 4);
      mapCtx.fill();
      mapCtx.stroke();

      mapCtx.fillStyle = '#ffdf80';
      mapCtx.textAlign = 'center';
      mapCtx.textBaseline = 'middle';
      mapCtx.fillText(labelText, midX, midY);
      mapCtx.restore();

      // Sonar radar pulse animation at real city location
      const pulsePhase = (performance.now() * 0.003) % 1;
      const r1 = 12 + pulsePhase * 26;
      const alpha1 = Math.max(0, 1 - pulsePhase);

      mapCtx.beginPath();
      mapCtx.arc(tx, ty, r1, 0, Math.PI * 2);
      mapCtx.strokeStyle = `rgba(226, 111, 32, ${alpha1 * 0.7})`;
      mapCtx.lineWidth = 2;
      mapCtx.stroke();

      mapCtx.beginPath();
      mapCtx.arc(tx, ty, 8, 0, Math.PI * 2);
      mapCtx.fillStyle = '#e26f20';
      mapCtx.shadowColor = '#d4af37';
      mapCtx.shadowBlur = 12;
      mapCtx.fill();
      mapCtx.shadowBlur = 0;

      // Golden diamond emblem on target
      mapCtx.beginPath();
      mapCtx.arc(tx, ty, 4, 0, Math.PI * 2);
      mapCtx.fillStyle = '#fff4cc';
      mapCtx.fill();

      // True Target City Label
      mapCtx.save();
      mapCtx.font = 'bold 12px Montserrat, sans-serif';
      mapCtx.fillStyle = '#fff1b8';
      mapCtx.textAlign = 'center';
      mapCtx.shadowColor = 'rgba(0,0,0,0.9)';
      mapCtx.shadowBlur = 8;
      mapCtx.fillText(`★ ACTUAL: ${target.name.toUpperCase()}`, tx, ty + 20);
      if (target.state) {
        mapCtx.font = '500 9.5px Montserrat, sans-serif';
        mapCtx.fillStyle = 'rgba(255, 241, 184, 0.8)';
        mapCtx.fillText(target.state.toUpperCase(), tx, ty + 32);
      }
      mapCtx.restore();
    }

    // 5. Player Controlled Golden Marker (Always visible)
    const px = markerPos.svgX;
    const py = markerPos.svgY;

    // Shadow on terrain below pin
    mapCtx.beginPath();
    mapCtx.ellipse(px, py + 3, 11, 4, 0, 0, Math.PI * 2);
    mapCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    mapCtx.fill();

    // Golden Pin Structure
    mapCtx.save();
    mapCtx.translate(px, py);

    // Subtle ground radar ripple around player's pin
    const t = performance.now() * 0.0025;
    const pinWave = 7 + Math.sin(t) * 3;
    mapCtx.beginPath();
    mapCtx.arc(0, 0, pinWave, 0, Math.PI * 2);
    mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    mapCtx.lineWidth = 1.2;
    mapCtx.stroke();

    // Pin Body
    mapCtx.beginPath();
    mapCtx.moveTo(0, 0);
    mapCtx.lineTo(-8, -18);
    mapCtx.arc(0, -18, 8, Math.PI, 0, false);
    mapCtx.lineTo(0, 0);
    mapCtx.closePath();

    const pinGrad = mapCtx.createLinearGradient(-8, -26, 8, 0);
    pinGrad.addColorStop(0, '#fffbe6');
    pinGrad.addColorStop(0.4, '#d4af37');
    pinGrad.addColorStop(1, '#7a5a12');
    mapCtx.fillStyle = pinGrad;
    mapCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    mapCtx.shadowBlur = 8;
    mapCtx.fill();

    mapCtx.strokeStyle = '#ffffff';
    mapCtx.lineWidth = 1.5;
    mapCtx.stroke();

    // Pin Core Gem
    mapCtx.beginPath();
    mapCtx.arc(0, -18, 3.2, 0, Math.PI * 2);
    mapCtx.fillStyle = '#170f0a';
    mapCtx.fill();

    // Pin Label
    mapCtx.font = 'bold 9px Montserrat, sans-serif';
    mapCtx.fillStyle = '#ffdf80';
    mapCtx.textAlign = 'center';
    mapCtx.fillText('YOUR PIN', 0, -30);

    mapCtx.restore();

    // 6. Luxury Compass Rose (Top Right)
    mapCtx.save();
    const cx = 710;
    const cy = 65;
    mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    mapCtx.lineWidth = 1;
    mapCtx.beginPath();
    mapCtx.arc(cx, cy, 18, 0, Math.PI * 2);
    mapCtx.stroke();

    // North Needle in Gold
    mapCtx.beginPath();
    mapCtx.moveTo(cx, cy - 22);
    mapCtx.lineTo(cx + 4, cy);
    mapCtx.lineTo(cx, cy - 2);
    mapCtx.lineTo(cx - 4, cy);
    mapCtx.closePath();
    mapCtx.fillStyle = '#d4af37';
    mapCtx.fill();

    // South Needle in Dark Sand
    mapCtx.beginPath();
    mapCtx.moveTo(cx, cy + 18);
    mapCtx.lineTo(cx + 4, cy);
    mapCtx.lineTo(cx, cy - 2);
    mapCtx.lineTo(cx - 4, cy);
    mapCtx.closePath();
    mapCtx.fillStyle = 'rgba(212, 175, 55, 0.35)';
    mapCtx.fill();

    mapCtx.font = 'bold 9px Montserrat, sans-serif';
    mapCtx.fillStyle = '#fff1b8';
    mapCtx.textAlign = 'center';
    mapCtx.fillText('N', cx, cy - 25);
    mapCtx.restore();

    mapCtx.restore(); // Restore root canvas transform
  }

  function lockMapPosition() {
    if (isTargetRevealed) return;
    isTargetRevealed = true;

    const data = getMapData();
    const target = getCityTarget(state.userCity || 'Nagpur');
    const [guessLon, guessLat] = data.unproject(markerPos.normX, markerPos.normY);
    const realDistKm = data.haversineKm(guessLat, guessLon, target.lat, target.lon);

    // Calculate score & accuracy according to real geographic proximity
    let accuracy = Math.max(0, Math.min(100, Math.round(100 - (realDistKm / 14))));
    if (realDistKm <= 35) accuracy = 100;
    else if (realDistKm <= 80) accuracy = Math.max(94, accuracy);
    else if (realDistKm <= 160) accuracy = Math.max(86, accuracy);
    else if (realDistKm <= 320) accuracy = Math.max(72, accuracy);
    else if (realDistKm <= 650) accuracy = Math.max(52, accuracy);

    zeroScore = Math.max(200, Math.round(1000 - (realDistKm * 0.85)));
    if (realDistKm <= 40) zeroScore = 1000;

    state.scoreZero = zeroScore;
    recalculateTotalScore();
    saveState();
    sound.playSuccess();

    // Update UI Stats
    const accNumEl = document.getElementById('zero-accuracy-num');
    const scoreNumEl = document.getElementById('zero-score-num');
    const distKmEl = document.getElementById('radar-dist-km');
    const radarStatus = document.getElementById('radar-status-text');
    const lockBtn = document.getElementById('btn-lock-map');

    if (accNumEl) accNumEl.textContent = `${accuracy}%`;
    if (scoreNumEl) scoreNumEl.textContent = zeroScore.toLocaleString();
    if (distKmEl) distKmEl.textContent = `${realDistKm} km off target`;
    if (radarStatus) {
      if (realDistKm <= 50) {
        radarStatus.textContent = `🎯 BULLSEYE! Within ${realDistKm} km of ${target.name.toUpperCase()}!`;
        radarStatus.style.color = '#fff1b8';
      } else if (realDistKm <= 180) {
        radarStatus.textContent = `🔥 IMPRESSIVE! Located ${target.name.toUpperCase()} within ${realDistKm} km!`;
        radarStatus.style.color = '#ffaa33';
      } else if (realDistKm <= 450) {
        radarStatus.textContent = `⚡ CLOSE! Located within ${realDistKm} km of ${target.name.toUpperCase()}!`;
        radarStatus.style.color = '#e26f20';
      } else {
        radarStatus.textContent = `🧭 POSITION REVEALED: ${realDistKm} km from ${target.name.toUpperCase()}`;
        radarStatus.style.color = '#a69383';
      }
    }

    if (lockBtn) {
      lockBtn.disabled = true;
      lockBtn.innerHTML = 'POSITION LOCKED &#10003;';
      lockBtn.style.opacity = '0.7';
    }

    // Continuously animate radar beacon on canvas
    function loopReveal() {
      drawIndiaMap();
      if (isTargetRevealed && state.currentScreen === 'screen-level-2') {
        revealAnimFrame = requestAnimationFrame(loopReveal);
      }
    }
    loopReveal();

    // After 1.8 seconds of observing the map result, trigger celebration modal
    setTimeout(() => {
      const modalTitle = document.getElementById('zero-modal-title');
      const modalRoute = document.getElementById('zero-modal-route');
      const modalDesc = document.getElementById('zero-modal-desc');
      const modalScore = document.getElementById('zero-modal-score');

      if (modalTitle) modalTitle.textContent = `${target.name.toUpperCase()} LOCATED!`;
      if (modalRoute) modalRoute.textContent = `INDIA → ${target.state ? target.state.toUpperCase() + ' → ' : ''}${target.name.toUpperCase()}`;
      if (modalDesc) {
        modalDesc.innerHTML = `Magnificent geographic discovery, <strong>${state.userName || 'Explorer'}</strong>! You located <strong>${target.name}</strong> (${target.desc || target.state || 'Your City'}) with <strong>${accuracy}% accuracy</strong> (${realDistKm} km from epicenter). You've earned:`;
      }
      if (modalScore) modalScore.textContent = `${zeroScore.toLocaleString()} / 1,000 Points`;

      document.getElementById('zero-mile-modal').classList.add('show');
    }, 1800);
  }

  /* ==========================================================================
     8. LEVEL 3: DECODE THE BOTTLE (CRAFTSMANSHIP DISCOVERY MINI-GAME)
     ========================================================================== */
  // The mini-game lives in ./decode-the-bottle/ as its own self-contained
  // app and reports back to this parent frame via window.postMessage
  // whenever a round ends (win or time-out).
  function initDecodeBottleLevel() {
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== 'decode-the-bottle') return;

      if (data.type === 'ROUND_COMPLETE') {
        state.decodeScore = Math.max(state.decodeScore, data.score || 0);
        state.decodeDetailsFound = Math.max(state.decodeDetailsFound, data.detailsFound || 0);
        state.decodeCompleted = state.decodeCompleted || !!data.isVictory;
        saveState();

        const feedback = document.getElementById('decode-feedback-text');
        if (feedback) {
          feedback.textContent = data.isVictory
            ? `ALL DETAILS DECODED — SCORE: ${state.decodeScore}`
            : `${state.decodeDetailsFound} / 5 DETAILS FOUND — SCORE: ${state.decodeScore}`;
        }
        sound.playClick();
      }
    });

    document.getElementById('btn-decode-continue').onclick = () => {
      navigateTo('screen-level-4');
    };
  }

  function refreshDecodeBottleFrame() {
    // Reload the mini-game fresh each time the level is entered
    const frame = document.getElementById('decode-bottle-frame');
    if (frame) {
      frame.src = frame.src;
    }
    const feedback = document.getElementById('decode-feedback-text');
    if (feedback) {
      feedback.textContent = state.decodeCompleted
        ? `ALL DETAILS DECODED — SCORE: ${state.decodeScore}`
        : 'PLAY THE GAME ABOVE TO DECODE THE BOTTLE, THEN CONTINUE.';
    }
  }

  /* ==========================================================================
     9. LEVEL 4: MASTER THE BLEND (CRAFT & ORIGIN DISCOVERY MINI-GAME)
     ========================================================================== */
  // The mini-game lives in ./master-the-blend/ as its own self-contained
  // app (a built React bundle) and reports back to this parent frame via
  // window.postMessage whenever a round ends (win or time-out).
  function initBlendLevel() {
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== 'master-the-blend') return;

      if (data.type === 'ROUND_COMPLETE') {
        state.blendScore = Math.max(state.blendScore, data.score || 0);
        state.blendBaseScore = data.baseScore || state.blendBaseScore;
        state.blendSpeedBonus = data.speedBonus || state.blendSpeedBonus;
        state.blendIncorrectAttempts = data.incorrectAttempts || 0;
        state.blendCompleted = state.blendCompleted || !!data.isVictory;
        saveState();

        const feedback = document.getElementById('blend-feedback-text');
        if (feedback) {
          feedback.textContent = data.isVictory
            ? `BLEND MASTERED — SCORE: ${state.blendScore}`
            : `BLEND INCOMPLETE — SCORE: ${state.blendScore}`;
        }
        sound.playClick();
      }
    });

    document.getElementById('btn-blend-continue').onclick = () => {
      navigateTo('screen-level-5');
    };
  }

  function refreshBlendFrame() {
    // Reload the mini-game fresh each time the level is entered
    const frame = document.getElementById('blend-frame');
    if (frame) {
      frame.src = frame.src;
    }
    const feedback = document.getElementById('blend-feedback-text');
    if (feedback) {
      feedback.textContent = state.blendCompleted
        ? `BLEND MASTERED — SCORE: ${state.blendScore}`
        : 'PLAY THE GAME ABOVE TO MASTER THE BLEND, THEN CONTINUE.';
    }
  }

  /* ==========================================================================
     10. LEVEL 5: BUILD YOUR NAGPUR (30-SECOND INTERACTIVE CITY BUILDER)
     ========================================================================== */
  let cityCanvas, cityCtx;
  let cityTimer = 30.0;
  let cityInterval = null;
  let cityElementsPlaced = [];
  let cityRunning = false;

  function initCityStage() {
    cityCanvas = document.getElementById('city-canvas');
    if (!cityCanvas) return;
    cityCtx = cityCanvas.getContext('2d');

    function resizeCity() {
      const container = cityCanvas.parentElement;
      cityCanvas.width = container.clientWidth;
      cityCanvas.height = container.clientHeight;
      drawCityScene();
    }
    resizeCity();
    window.addEventListener('resize', resizeCity);

    // Setup Category Tools
    document.querySelectorAll('.city-tool-btn').forEach(btn => {
      btn.onclick = () => {
        const cat = btn.getAttribute('data-city-cat');
        addCityElement(cat);
      };
    });

    document.getElementById('btn-reveal-personality').onclick = () => {
      document.getElementById('city-complete-modal').classList.remove('show');
      navigateTo('screen-result');
    };

    startCityTimer();
  }

  function startCityTimer() {
    if (cityRunning) return;
    cityRunning = true;
    cityTimer = 30.0;
    const duration = 30000;
    const startTime = performance.now();

    cityInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      cityTimer = remaining;
      document.getElementById('city-timer-num').textContent = remaining.toFixed(1) + 's';
      document.getElementById('global-timer-display').textContent = remaining.toFixed(1) + 's';

      const pct = (remaining / 30.0) * 100;
      const timerBar = document.getElementById('city-timer-bar');
      if (timerBar) timerBar.style.width = pct + '%';

      if (remaining <= 0) {
        endCityTimer();
      }
    }, 100);
  }

  function endCityTimer() {
    cityRunning = false;
    clearInterval(cityInterval);
    sound.playFanfare();

    state.scoreCity = cityElementsPlaced.length * 150 + 800;
    recalculateTotalScore();
    saveState();

    document.getElementById('city-modal-score').textContent = `+${state.scoreCity.toLocaleString()} PTS`;
    document.getElementById('city-complete-modal').classList.add('show');
  }

  function addCityElement(category) {
    if (!cityRunning && cityTimer <= 0) {
      showToast('Blueprint timer ended! Proceed to reveal your Nagpur Edit.');
      return;
    }

    state.cityElements[category] = (state.cityElements[category] || 0) + 1;
    const countEl = document.getElementById(`count-${category.toLowerCase()}`);
    if (countEl) countEl.textContent = state.cityElements[category];

    // Pick random location in appropriate scene band
    const w = cityCanvas.width;
    const h = cityCanvas.height;

    const el = {
      category,
      x: 0.1 * w + Math.random() * (0.8 * w),
      y: 0.45 * h + Math.random() * (0.45 * h),
      scale: 0.8 + Math.random() * 0.4,
      birth: performance.now()
    };
    cityElementsPlaced.push(el);
    document.getElementById('city-elements-num').textContent = cityElementsPlaced.length;

    sound.playCollect(category === 'FUTURE' || category === 'LIFESTYLE');
    drawCityScene();
  }

  function drawCityScene() {
    if (!cityCtx) return;
    const w = cityCanvas.width;
    const h = cityCanvas.height;
    cityCtx.clearRect(0, 0, w, h);

    // 1. Nagpur Sunset Sky Gradient
    const sky = cityCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2e170d');
    sky.addColorStop(0.4, '#6b2d13');
    sky.addColorStop(0.7, '#a84c1b');
    sky.addColorStop(1, '#24130b');
    cityCtx.fillStyle = sky;
    cityCtx.fillRect(0, 0, w, h);

    // Glowing Golden Nagpur Sun
    cityCtx.beginPath();
    cityCtx.arc(w * 0.72, h * 0.28, 42, 0, Math.PI * 2);
    cityCtx.fillStyle = '#ffaa33';
    cityCtx.shadowColor = '#ff8800';
    cityCtx.shadowBlur = 30;
    cityCtx.fill();
    cityCtx.shadowBlur = 0;

    // 2. Distant Horizon Hills (Seminary Hills & Ramtek ridge)
    cityCtx.beginPath();
    cityCtx.moveTo(0, h * 0.55);
    cityCtx.bezierCurveTo(w * 0.25, h * 0.48, w * 0.45, h * 0.52, w * 0.65, h * 0.46);
    cityCtx.bezierCurveTo(w * 0.85, h * 0.40, w * 0.95, h * 0.48, w, h * 0.52);
    cityCtx.lineTo(w, h);
    cityCtx.lineTo(0, h);
    cityCtx.fillStyle = '#1c0f08';
    cityCtx.fill();

    // 3. Middle Skyline Silhouette (Deekshabhoomi Dome & Sitabuldi)
    cityCtx.fillStyle = '#2b170e';
    // Heritage Dome
    const domeX = w * 0.35;
    const domeY = h * 0.52;
    cityCtx.beginPath();
    cityCtx.arc(domeX, domeY, 32, Math.PI, 0);
    cityCtx.fill();
    cityCtx.fillRect(domeX - 40, domeY, 80, 20);

    // Base Ground Landscape
    cityCtx.fillStyle = '#180d07';
    cityCtx.fillRect(0, h * 0.65, w, h * 0.35);

    // 4. Metro Rail Line Viaduct
    cityCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    cityCtx.lineWidth = 4;
    cityCtx.beginPath();
    cityCtx.moveTo(0, h * 0.72);
    cityCtx.lineTo(w, h * 0.72);
    cityCtx.stroke();

    // Metro Pillars
    cityCtx.lineWidth = 3;
    for (let x = 30; x < w; x += 70) {
      cityCtx.beginPath();
      cityCtx.moveTo(x, h * 0.72);
      cityCtx.lineTo(x, h * 0.82);
      cityCtx.stroke();
    }

    // Animated Nagpur Metro Train
    const trainX = ((performance.now() * 0.08) % (w + 120)) - 60;
    cityCtx.fillStyle = '#e26f20';
    cityCtx.fillRect(trainX, h * 0.705, 55, 6);
    cityCtx.fillStyle = '#fff';
    cityCtx.fillRect(trainX + 45, h * 0.707, 6, 2);

    // 5. Draw All User Placed City Elements
    cityElementsPlaced.forEach(el => {
      cityCtx.save();
      cityCtx.translate(el.x, el.y);
      cityCtx.scale(el.scale, el.scale);

      switch (el.category) {
        case 'CITY': // Modern Contemporary Towers
          cityCtx.fillStyle = '#3a261a';
          cityCtx.strokeStyle = '#d4af37';
          cityCtx.lineWidth = 1.5;
          cityCtx.fillRect(-15, -60, 30, 60);
          cityCtx.strokeRect(-15, -60, 30, 60);
          // Windows
          cityCtx.fillStyle = '#ffea9f';
          for (let row = -50; row < -10; row += 10) {
            cityCtx.fillRect(-10, row, 6, 5);
            cityCtx.fillRect(4, row, 6, 5);
          }
          break;

        case 'CULTURE': // Art Pavilions & Murals
          cityCtx.fillStyle = '#b84a20';
          cityCtx.beginPath();
          cityCtx.arc(0, -18, 16, 0, Math.PI * 2);
          cityCtx.fill();
          cityCtx.strokeStyle = '#ffd77f';
          cityCtx.stroke();
          cityCtx.font = '16px serif';
          cityCtx.textAlign = 'center';
          cityCtx.fillText('🎨', 0, -12);
          break;

        case 'FOOD': // Orange Groves & Citrus Blossoms
          cityCtx.fillStyle = '#2d5a27'; // Foliage
          cityCtx.beginPath();
          cityCtx.arc(0, -16, 15, 0, Math.PI * 2);
          cityCtx.fill();
          cityCtx.fillStyle = '#e26f20'; // Oranges
          cityCtx.beginPath();
          cityCtx.arc(-5, -20, 4, 0, Math.PI * 2);
          cityCtx.arc(6, -14, 4, 0, Math.PI * 2);
          cityCtx.arc(0, -8, 4, 0, Math.PI * 2);
          cityCtx.fill();
          break;

        case 'TECHNOLOGY': // Solar Canopies & Innovation
          cityCtx.fillStyle = '#1e3852';
          cityCtx.strokeStyle = '#60a5fa';
          cityCtx.lineWidth = 1;
          cityCtx.fillRect(-18, -25, 36, 12);
          cityCtx.strokeRect(-18, -25, 36, 12);
          cityCtx.strokeStyle = '#d4af37';
          cityCtx.beginPath();
          cityCtx.moveTo(0, -13);
          cityCtx.lineTo(0, 0);
          cityCtx.stroke();
          break;

        case 'LIFESTYLE': // Luxury Promenade & Rooftop Gardens
          cityCtx.fillStyle = '#7a3e1d';
          cityCtx.fillRect(-22, -15, 44, 15);
          cityCtx.fillStyle = '#ffeedd';
          cityCtx.font = '14px serif';
          cityCtx.textAlign = 'center';
          cityCtx.fillText('✨', 0, -18);
          break;

        case 'FUTURE': // Growth Aerodynamic Towers
          cityCtx.fillStyle = '#4a1508';
          cityCtx.strokeStyle = '#ff9933';
          cityCtx.lineWidth = 1.5;
          cityCtx.beginPath();
          cityCtx.moveTo(-10, 0);
          cityCtx.lineTo(0, -75);
          cityCtx.lineTo(10, 0);
          cityCtx.closePath();
          cityCtx.fill();
          cityCtx.stroke();
          break;
      }

      cityCtx.restore();
    });
  }

  /* ==========================================================================
     11. PERSONALITY ENGINE & FINAL RESULT REVEAL
     ========================================================================== */
  const PERSONALITY_TYPES = [
    {
      id: 'MODERN_MAVERICK',
      name: 'THE MODERN MAVERICK',
      tags: 'Nagpur × Technology × Ambition × Contemporary',
      quote: '"Rooted in where you come from. Driven by where you\'re going."',
      desc: 'You represent the bold new pulse of Nagpur—grounded in rich heritage while fearlessly pioneering digital infrastructure, smart urban architecture, and high ambition.'
    },
    {
      id: 'HERITAGE_CURATOR',
      name: 'THE HERITAGE CURATOR',
      tags: 'Culture × Classic × Heritage',
      quote: '"Timeless wisdom is the ultimate luxury."',
      desc: 'You cherish Nagpur\'s stone monuments, classical crafts, and traditional values. Every contemporary touch you craft honors the soul and architectural beauty of India\'s heartland.'
    },
    {
      id: 'CREATIVE_VISIONARY',
      name: 'THE CREATIVE VISIONARY',
      tags: 'Creativity × Art × Modern',
      quote: '"Tradition reimagined through the prism of design."',
      desc: 'You see Nagpur not just as a city, but as an open canvas. From hand-crafted textures to vibrant artistic expressions, you celebrate color, citrus rhythms, and visual poetry.'
    },
    {
      id: 'LUXURY_EDITOR',
      name: 'THE LUXURY EDITOR',
      tags: 'Luxury × Premium × Contemporary',
      quote: '"Elegance is the quiet harmony of craft and provenance."',
      desc: 'You appreciate bespoke finishes, warm amber depths, and super premium craftsmanship. Like The Indian Edit bottle, your standards reflect refined taste and enduring quality.'
    },
    {
      id: 'FUTURE_BUILDER',
      name: 'THE FUTURE BUILDER',
      tags: 'Innovation × Growth × Futuristic',
      quote: '"Building sustainable legacy for the centuries ahead."',
      desc: 'You envision Nagpur as a green, connected metropolis—uniting solar technology, biophilic architecture, and zero-mile logistics into a sustainable model for the world.'
    }
  ];

  function recalculateTotalScore() {
    // Total out of 10,000
    // Rush: scaled up to ~2,400
    // Zero Mile: up to 1,000
    // Decode The Bottle: +1,200
    // Master The Blend: +1,500
    // City: +3,000
    const rushComponent = Math.min(2600, state.scoreRush * 12 + 600);
    const zeroComponent = state.scoreZero || 900;
    const heritageComponent = Math.min(1250, Math.max(700, 700 + Math.round((state.decodeScore || 0) * 0.55)));
    const vibeComponent = Math.min(1750, Math.max(700, 700 + Math.round((state.blendScore || 0) * 3)));
    const cityComponent = Math.min(3500, (cityElementsPlaced.length * 180) + 1200);

    const raw = rushComponent + zeroComponent + heritageComponent + vibeComponent + cityComponent;
    state.totalScore = Math.min(9950, Math.max(7200, Math.round(raw / 10) * 10));
  }

  function computePersonality() {
    const decodedAllDetails = (state.decodeDetailsFound || 0) >= 5;
    const blendAttempts = state.blendIncorrectAttempts || 0;
    const blendPerfect = state.blendCompleted && blendAttempts === 0 && (state.blendSpeedBonus || 0) > 0;
    const blendClean = state.blendCompleted && blendAttempts === 0;
    const blendExperimental = state.blendCompleted && blendAttempts > 0 && blendAttempts <= 2;

    if (blendPerfect) {
      return PERSONALITY_TYPES[0]; // Modern Maverick
    }
    if (decodedAllDetails || blendClean) {
      return PERSONALITY_TYPES[1]; // Heritage Curator
    }
    if (blendExperimental) {
      return PERSONALITY_TYPES[2]; // Creative Visionary
    }
    if ((state.decodeScore || 0) >= 700) {
      return PERSONALITY_TYPES[3]; // Luxury Editor
    }
    if (!state.blendCompleted) {
      return PERSONALITY_TYPES[4]; // Future Builder
    }
    return PERSONALITY_TYPES[0];
  }

  function renderPersonalityResult() {
    recalculateTotalScore();
    const p = computePersonality();
    state.personality = p;
    saveState();
    sound.playFanfare();

    document.getElementById('res-archetype-name').textContent = p.name;
    document.getElementById('res-archetype-tags').textContent = p.tags;
    document.getElementById('res-archetype-quote').textContent = p.quote;

    // Animated score counter roll
    animateCounter('res-score-number', 0, state.totalScore, 1400);

    document.getElementById('res-b-rush').textContent = `${state.scoreRush} pts`;
    document.getElementById('res-b-zero').textContent = `${state.scoreZero || 940} / 1,000`;
    document.getElementById('res-b-heritage').textContent = `${state.decodeDetailsFound || 0} / 5`;
    document.getElementById('res-b-city').textContent = `${cityElementsPlaced.length || 14} Placed`;

    document.getElementById('btn-go-social-post').onclick = () => {
      navigateTo('screen-social');
    };
  }

  function animateCounter(elId, start, end, duration) {
    const el = document.getElementById(elId);
    if (!el) return;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = end.toLocaleString();
      }
    }
    requestAnimationFrame(tick);
  }

  /* ==========================================================================
     12. SCREEN 10: 1080×1080 INSTAGRAM / FACEBOOK SOCIAL POST GENERATOR
     ========================================================================== */
  function renderSocialPostCanvas() {
    const canvas = document.getElementById('social-post-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    const p = state.personality || computePersonality();

    // 1. Deep Amber Whiskey Background Gradient
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 100, w * 0.5, h * 0.5, w * 0.75);
    bg.addColorStop(0, '#732c0f');
    bg.addColorStop(0.45, '#3b1609');
    bg.addColorStop(0.85, '#1d0c06');
    bg.addColorStop(1, '#0e0502');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Ornate Indian Filigree Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, w - 100, h - 100);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(65, 65, w - 130, h - 130);

    // Corner Diamond Accents
    function drawCornerDiamond(cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-10, -10, 20, 20);
      ctx.restore();
    }
    drawCornerDiamond(50, 50);
    drawCornerDiamond(w - 50, 50);
    drawCornerDiamond(50, h - 50);
    drawCornerDiamond(w - 50, h - 50);

    // 3. Header Branding
    ctx.textAlign = 'center';
    ctx.font = '700 24px Cormorant Garamond, serif';
    ctx.fillStyle = '#e5d8cb';
    ctx.letterSpacing = '8px';
    ctx.fillText('THE INDIAN EDIT', w * 0.5, 130);

    ctx.font = '600 15px Montserrat, sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.letterSpacing = '4px';
    ctx.fillText('ROOTED IN HERITAGE • DESIGNED FOR TOMORROW', w * 0.5, 160);

    // Golden Divider line
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, 190);
    ctx.lineTo(w * 0.7, 190);
    ctx.stroke();

    // 4. Nagpur Orange City Badge
    ctx.fillStyle = 'rgba(226, 111, 32, 0.25)';
    ctx.beginPath();
    ctx.roundRect(w * 0.5 - 140, 220, 280, 44, 22);
    ctx.fill();
    ctx.strokeStyle = '#e26f20';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '700 16px Montserrat, sans-serif';
    ctx.fillStyle = '#ffaa33';
    ctx.letterSpacing = '2px';
    ctx.fillText('🍊 NAGPUR BRAND EXPERIENCE', w * 0.5, 248);

    // 5. Central Personality Archetype (Hero)
    ctx.font = '600 26px Cormorant Garamond, serif';
    ctx.fillStyle = '#d4af37';
    ctx.letterSpacing = '6px';
    ctx.fillText('YOUR NAGPUR EDIT', w * 0.5, 360);

    // Archetype Title in Gold Foil Gradient
    const goldGrad = ctx.createLinearGradient(0, 390, 0, 480);
    goldGrad.addColorStop(0, '#fff4cc');
    goldGrad.addColorStop(0.5, '#eec765');
    goldGrad.addColorStop(1, '#9e7924');
    ctx.fillStyle = goldGrad;
    ctx.font = '700 64px Playfair Display, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(p.name, w * 0.5, 450);

    ctx.font = '600 22px Montserrat, sans-serif';
    ctx.fillStyle = '#e26f20';
    ctx.letterSpacing = '3px';
    ctx.fillText(p.tags, w * 0.5, 500);

    // Quote
    ctx.font = 'italic 500 28px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = '#f5ece3';
    ctx.letterSpacing = '1px';
    ctx.fillText(p.quote, w * 0.5, 570);

    // 6. Master Score Badge in Red/Amber Lozenge
    const lozengeY = 670;
    ctx.fillStyle = '#801318';
    ctx.beginPath();
    ctx.roundRect(w * 0.5 - 200, lozengeY, 400, 110, 16);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '700 16px Montserrat, sans-serif';
    ctx.fillStyle = '#ffd77f';
    ctx.letterSpacing = '3px';
    ctx.fillText('MASTER EDIT SCORE', w * 0.5, lozengeY + 38);

    ctx.font = '800 48px Montserrat, sans-serif';
    ctx.fillStyle = '#fff4cc';
    ctx.letterSpacing = '2px';
    ctx.fillText(`${state.totalScore.toLocaleString()} / 10,000`, w * 0.5, lozengeY + 90);

    // 7. Dynamic Selected Attributes Strip
    ctx.font = '600 16px Montserrat, sans-serif';
    ctx.fillStyle = '#cfbea8';
    ctx.letterSpacing = '1px';
    ctx.fillText(`BOTTLE DECODED: ${state.decodeDetailsFound || 0}/5  •  BLEND SCORE: ${state.blendScore || 0}`, w * 0.5, 840);

    // 8. Footer Brand Lockup
    ctx.font = '500 16px Montserrat, sans-serif';
    ctx.fillStyle = '#a69383';
    ctx.fillText('Crafted in India • Discover your edit at The Indian Edit', w * 0.5, 960);

    // Update Editable Caption
    const captionEl = document.getElementById('social-caption-text');
    if (captionEl) {
      captionEl.value = `I just created my Nagpur Edit with The Indian Edit.\n\nArchetype: ${p.name}\nScore: ${state.totalScore.toLocaleString()} / 10,000\n\nRooted in heritage. Inspired by the city. Designed for tomorrow.\nDiscover your edit.\n\n#TheIndianEdit #NagpurEdit #OrangeCity #IndianHeritage #SustainableLiving`;
    }

    // Setup Download & Share Buttons
    document.getElementById('btn-download-post').onclick = downloadSocialPost;
    document.getElementById('btn-share-post').onclick = shareSocialPost;
    document.getElementById('btn-copy-caption').onclick = copyCaption;
    document.getElementById('btn-goto-upload').onclick = () => {
      navigateTo('screen-upload');
    };
  }

  function downloadSocialPost() {
    const canvas = document.getElementById('social-post-canvas');
    if (!canvas) return;
    sound.playSuccess();
    const link = document.createElement('a');
    link.download = `TheIndianEdit_NagpurEdit_${state.personality ? state.personality.id : 'Result'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Social Post PNG downloaded!');
  }

  function shareSocialPost() {
    const caption = document.getElementById('social-caption-text').value;
    if (navigator.share) {
      navigator.share({
        title: 'The Indian Edit — Nagpur Experience',
        text: caption,
        url: window.location.href
      }).then(() => {
        showToast('Shared successfully!');
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          copyCaption();
        }
      });
    } else {
      copyCaption();
      showToast('Caption copied! Download your post and share on Instagram or Facebook.');
    }
  }

  function copyCaption() {
    const caption = document.getElementById('social-caption-text').value;
    navigator.clipboard.writeText(caption).then(() => {
      sound.playClick();
      showToast('Caption copied to clipboard!');
    }).catch(() => {
      showToast('Please manually select and copy the caption.');
    });
  }

  /* ==========================================================================
     13. SCREEN 11: SCREENSHOT UPLOAD FOR BONUS
     ========================================================================== */
  function initUploadScreen() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('screenshot-file-input');
    const browseBtn = document.getElementById('btn-browse-file');
    const removeBtn = document.getElementById('btn-remove-preview');
    const submitBtn = document.getElementById('btn-submit-screenshot');

    browseBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleSelectedFile(file);
    };

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });

    removeBtn.onclick = (e) => {
      e.stopPropagation();
      resetUpload();
    };

    submitBtn.onclick = submitScreenshot;
    document.getElementById('btn-open-scratch').onclick = () => {
      navigateTo('screen-scratch');
    };
  }

  function handleSelectedFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a valid image (PNG, JPG, or WEBP)');
      sound.playError();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be 5 MB or less');
      sound.playError();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('screenshot-preview-img').src = e.target.result;
      document.getElementById('file-meta-display').textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
      document.getElementById('dropzone-prompt').style.display = 'none';
      document.getElementById('dropzone-preview').style.display = 'block';
      document.getElementById('btn-submit-screenshot').disabled = false;
      sound.playClick();
    };
    reader.readAsDataURL(file);
  }

  function resetUpload() {
    document.getElementById('screenshot-file-input').value = '';
    document.getElementById('screenshot-preview-img').src = '';
    document.getElementById('dropzone-prompt').style.display = 'block';
    document.getElementById('dropzone-preview').style.display = 'none';
    document.getElementById('btn-submit-screenshot').disabled = true;
    document.getElementById('bonus-unlocked-state').style.display = 'none';
    document.getElementById('upload-action-area').style.display = 'block';
  }

  function submitScreenshot() {
    sound.playClick();
    const submitBtn = document.getElementById('btn-submit-screenshot');
    submitBtn.textContent = 'VERIFYING POST METADATA...';
    submitBtn.disabled = true;

    // Simulate verification
    setTimeout(() => {
      state.screenshotUploaded = true;
      saveState();
      sound.playSuccess();
      document.getElementById('upload-action-area').style.display = 'none';
      document.getElementById('bonus-unlocked-state').style.display = 'block';
    }, 1200);
  }

  /* ==========================================================================
     14. SCREEN 12: REALISTIC CANVAS SCRATCH CARD REWARD
     ========================================================================== */
  const DEMO_GIFTS = [
    { name: '₹100 OFF', code: 'TIE-NAGPUR100', desc: 'Valid on handcrafted apparel & homeware' },
    { name: '₹250 OFF', code: 'TIE-HERITAGE250', desc: 'Valid on entire sustainable collection' },
    { name: 'FREE SHIPPING', code: 'TIE-FREESHIP', desc: 'All India priority carbon-neutral shipping' },
    { name: 'EXCLUSIVE GIFT', code: 'TIE-EXCLUSIVELUX', desc: 'Complimentary brass coaster & gift box' },
    { name: 'HERITAGE DISCOUNT (20%)', code: 'TIE-HERITAGE20', desc: '20% off all artisanal heritage pieces' },
    { name: 'BETTER LIVING BONUS (₹300)', code: 'TIE-LIVING300', desc: 'Special promotion for Orange City advocates' }
  ];

  let scratchCanvas, scratchCtx;
  let isScratching = false;
  let scratchPercent = 0;
  let scratchComplete = false;

  function initScratchCard() {
    scratchCanvas = document.getElementById('scratch-canvas');
    if (!scratchCanvas) return;
    scratchCtx = scratchCanvas.getContext('2d');

    // Select random gift if not already chosen
    if (!state.selectedGift) {
      const gift = DEMO_GIFTS[Math.floor(Math.random() * DEMO_GIFTS.length)];
      state.selectedGift = gift;
      saveState();
    }

    document.getElementById('scratch-gift-name').textContent = state.selectedGift.name;
    document.getElementById('scratch-gift-code').textContent = `CODE: ${state.selectedGift.code}`;

    const container = scratchCanvas.parentElement;
    scratchCanvas.width = container.clientWidth;
    scratchCanvas.height = container.clientHeight;

    paintGoldFoilLayer();

    scratchComplete = false;
    scratchPercent = 0;
    document.getElementById('scratch-actions-row').style.display = 'none';
    document.getElementById('scratch-instruction-text').style.display = 'block';

    // Pointer events for mouse & touch
    scratchCanvas.onpointerdown = (e) => {
      isScratching = true;
      scratchAt(e);
      sound.playClick();
    };

    window.onpointermove = (e) => {
      if (isScratching && !scratchComplete) {
        scratchAt(e);
      }
    };

    window.onpointerup = () => {
      isScratching = false;
    };

    // Action buttons
    document.getElementById('scratch-gift-code').onclick = () => {
      navigator.clipboard.writeText(state.selectedGift.code);
      showToast(`Copied ${state.selectedGift.code}`);
    };

    document.getElementById('btn-claim-reward').onclick = () => {
      state.rewardClaimed = true;
      saveState();
      sound.playSuccess();
      document.getElementById('modal-coupon-code').textContent = state.selectedGift.code;
      document.getElementById('claim-success-modal').classList.add('show');
    };

    document.getElementById('btn-close-claim').onclick = () => {
      document.getElementById('claim-success-modal').classList.remove('show');
    };

    document.getElementById('btn-share-reward').onclick = () => {
      showToast(`Share code ${state.selectedGift.code} with friends!`);
    };

    document.getElementById('btn-play-again').onclick = () => {
      resetAllState();
    };
  }

  function paintGoldFoilLayer() {
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    scratchCtx.globalCompositeOperation = 'source-over';

    // Metallic Gold Foil Gradient
    const foil = scratchCtx.createLinearGradient(0, 0, w, h);
    foil.addColorStop(0, '#c79d36');
    foil.addColorStop(0.2, '#fced98');
    foil.addColorStop(0.4, '#d4af37');
    foil.addColorStop(0.6, '#fff4bc');
    foil.addColorStop(0.8, '#aa8323');
    foil.addColorStop(1, '#eec869');
    scratchCtx.fillStyle = foil;
    scratchCtx.fillRect(0, 0, w, h);

    // Decorative Ornamental Border
    scratchCtx.strokeStyle = 'rgba(74, 33, 10, 0.4)';
    scratchCtx.lineWidth = 3;
    scratchCtx.strokeRect(12, 12, w - 24, h - 24);

    // Foil Stamp Seal & Text
    scratchCtx.textAlign = 'center';
    scratchCtx.font = '700 20px Cormorant Garamond, serif';
    scratchCtx.fillStyle = '#4a210a';
    scratchCtx.letterSpacing = '4px';
    scratchCtx.fillText('THE INDIAN EDIT', w * 0.5, h * 0.38);

    scratchCtx.font = '800 13px Montserrat, sans-serif';
    scratchCtx.fillStyle = '#6b320e';
    scratchCtx.letterSpacing = '3px';
    scratchCtx.fillText('SCRATCH TO REVEAL REWARD', w * 0.5, h * 0.54);

    scratchCtx.font = '600 11px Montserrat, sans-serif';
    scratchCtx.fillStyle = '#8c4314';
    scratchCtx.fillText('★ SUPER PREMIUM BONUS ★', w * 0.5, h * 0.70);
  }

  function scratchAt(e) {
    if (scratchComplete) return;
    const rect = scratchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 28, 0, Math.PI * 2);
    scratchCtx.fill();

    checkScratchProgress();
  }

  function checkScratchProgress() {
    // Sample every 16 pixels to calculate transparent area
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;
    const step = 16;
    let transparent = 0;
    let total = 0;

    const imgData = scratchCtx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const index = (y * w + x) * 4;
        total++;
        if (imgData[index + 3] === 0) {
          transparent++;
        }
      }
    }

    scratchPercent = (transparent / total) * 100;

    if (scratchPercent > 45 && !scratchComplete) {
      revealFullScratchCard();
    }
  }

  function revealFullScratchCard() {
    scratchComplete = true;
    state.scratchRevealed = true;
    saveState();
    sound.playFanfare();

    // Fade out remaining foil
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;
    scratchCanvas.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 500, fill: 'forwards' });

    setTimeout(() => {
      scratchCtx.clearRect(0, 0, w, h);
      document.getElementById('scratch-instruction-text').style.display = 'none';
      document.getElementById('scratch-actions-row').style.display = 'flex';
      showToast('🎉 Congratulations! Bonus Reward Unlocked!');
    }, 500);
  }

  /* ==========================================================================
     15. ADMIN & DEMO SETTINGS MODAL
     ========================================================================== */
  function setupAdminModal() {
    const modal = document.getElementById('admin-modal');
    const openBtn = document.getElementById('btn-admin-modal');
    const closeBtn = document.getElementById('btn-close-admin');
    const resetBtn = document.getElementById('btn-reset-demo');
    const jumpBtn = document.getElementById('btn-jump-screen');
    const jumpSelect = document.getElementById('select-jump-screen');

    openBtn.onclick = () => {
      updateDebugModal();
      modal.classList.add('show');
      sound.playClick();
    };

    closeBtn.onclick = () => {
      modal.classList.remove('show');
    };

    resetBtn.onclick = () => {
      if (confirm('Are you sure you want to reset all game state and local progress?')) {
        modal.classList.remove('show');
        resetAllState();
      }
    };

    jumpBtn.onclick = () => {
      const screenId = jumpSelect.value;
      modal.classList.remove('show');
      navigateTo(screenId);
    };

    const headerLoginBtn = document.getElementById('btn-header-login');
    if (headerLoginBtn) {
      headerLoginBtn.onclick = () => {
        navigateTo('screen-login');
      };
    }

    document.getElementById('btn-brand-home').onclick = () => {
      navigateTo('screen-login');
    };

    // Sound toggle
    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    soundIcon.textContent = sound.muted ? '🔇' : '🔊';

    soundToggleBtn.onclick = () => {
      const isMuted = sound.toggleMute();
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
      showToast(isMuted ? 'Sound muted' : 'Sound enabled');
    };
  }

  function updateDebugModal() {
    document.getElementById('debug-phone-val').textContent = state.userPhone || 'None';
    document.getElementById('debug-otp-val').textContent = state.otpVerified ? 'true' : 'false';
    document.getElementById('debug-score-val').textContent = state.totalScore.toLocaleString();
    document.getElementById('debug-arch-val').textContent = state.personality ? state.personality.name : 'Not generated';
    document.getElementById('debug-reward-val').textContent = state.selectedGift ? state.selectedGift.name : 'None';
  }

  /* ==========================================================================
     16. APP INITIALIZATION
     ========================================================================== */
  function init() {
    setupOtpInputs();
    initOrangeRush();
    initDecodeBottleLevel();
    initBlendLevel();
    initUploadScreen();
    setupAdminModal();

    // Default to the login page
    navigateTo('screen-login');
  }

  // DOM Content Loaded entry point
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
