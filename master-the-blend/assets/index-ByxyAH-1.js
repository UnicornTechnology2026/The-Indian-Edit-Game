(() => {
  document.addEventListener('DOMContentLoaded', init);

  function init(){

    /* ---------- Background particle canvas ---------- */
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) {
      console.warn('[indian-edit] #bgCanvas not found — skipping background particle effect.');
    } else {
      const ctx = canvas.getContext('2d');
      let cw, ch, particles = [];
      function resizeCanvas(){
        cw = canvas.width = window.innerWidth;
        ch = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      const colors = ['rgba(230,202,133,', 'rgba(201,161,90,', 'rgba(242,234,217,', 'rgba(165,106,63,'];
      const count = Math.min(38, Math.floor((cw*ch)/32000));
      for(let i=0;i<count;i++){
        particles.push({
          x:Math.random()*cw, y:Math.random()*ch, r:Math.random()*1.8+0.6,
          alpha:Math.random()*0.45+0.15, vx:(Math.random()-0.5)*0.25, vy:-Math.random()*0.35-0.08,
          color:colors[Math.floor(Math.random()*colors.length)]
        });
      }
      // No fillRect vignette here — canvas stays fully transparent, only the particles are drawn.
      function animateBg(){
        ctx.clearRect(0,0,cw,ch);
        particles.forEach(p=>{
          p.x += p.vx; p.y += p.vy;
          if(p.y < -10){ p.y = ch+10; p.x = Math.random()*cw; }
          if(p.x < -10) p.x = cw+10; if(p.x > cw+10) p.x = -10;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle = p.color + Math.max(0.05,Math.min(0.8,p.alpha)) + ')';
          ctx.fill();
        });
        requestAnimationFrame(animateBg);
      }
      animateBg();
    }

    /* ---------- Audio ---------- */
    const Audio_ = {
      ctx:null, enabled:true,
      getCtx(){
        if(!this.enabled) return null;
        if(!this.ctx){
          const C = window.AudioContext || window.webkitAudioContext;
          if(C) this.ctx = new C();
        }
        if(this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      },
      tone(freq, start, dur, type='sine', gain=0.09){
        const c = this.getCtx(); if(!c) return;
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, c.currentTime+start);
        g.gain.setValueAtTime(0.0001, c.currentTime+start);
        g.gain.exponentialRampToValueAtTime(gain, c.currentTime+start+0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+start+dur);
        o.connect(g); g.connect(c.destination);
        o.start(c.currentTime+start); o.stop(c.currentTime+start+dur+0.05);
      },
      playStart(){ [293.66,440,587.33,739.99].forEach((f,i)=>this.tone(f,i*0.08,1.8)); },
      playDrag(){ this.tone(380,0,0.1,'sine',0.02); },
      playCorrect(){ [880,1318.51,1760].forEach((f,i)=>this.tone(f,0,0.9,i===0?'sine':'triangle',0.1/(i+1))); },
      playIncorrect(){
        const c = this.getCtx(); if(!c) return;
        const o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain();
        o.type='sine'; o.frequency.setValueAtTime(140,c.currentTime);
        o.frequency.exponentialRampToValueAtTime(95,c.currentTime+0.22);
        f.type='lowpass'; f.frequency.setValueAtTime(250,c.currentTime);
        g.gain.setValueAtTime(0.0001,c.currentTime);
        g.gain.linearRampToValueAtTime(0.08,c.currentTime+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.3);
        o.connect(f); f.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime+0.32);
      },
      playComplete(){ [146.83,220,293.66,369.99,440,587.33].forEach((f,i)=>this.tone(f,i*0.12,2.9,'sine',0.09)); }
    };

    /* ---------- Game data ---------- */
    const INGREDIENTS = [
      {id:'indian-malt', name:'INDIAN MALT', origin:'Indian origin', icon:'🇮🇳', correct:true},
      {id:'indian-grain', name:'INDIAN GRAIN', origin:'Indian origin', icon:'🇮🇳', correct:true},
      {id:'scotch-malt', name:'SCOTCH MALT', origin:'Scottish origin', icon:'🏴', correct:true},
      {id:'american-oak', name:'AMERICAN OAK', origin:'Oak craft note', icon:'🪵', correct:false},
      {id:'european-barrel', name:'EUROPEAN BARREL', origin:'Continental note', icon:'🏛️', correct:false},
      {id:'botanical-note', name:'BOTANICAL NOTE', origin:'Aromatic profile', icon:'🌿', correct:false},
      {id:'aged-grain', name:'AGED GRAIN', origin:'Matured character', icon:'🌾', correct:false},
      {id:'cask-influence', name:'CASK INFLUENCE', origin:'Wood resonance', icon:'⏳', correct:false}
    ];
    const REQUIRED = ['indian-malt','indian-grain','scotch-malt'];

    function shuffle(arr){
      const a = [...arr];
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
      }
      return a;
    }

    /* ---------- App state ---------- */
    const state = {
      screen:'intro',
      soundOn:true,
      collected:[],
      score:0,
      timeLeft:30,
      timerId:null,
      startedAt:0,
      incorrectAttempts:0,
      lastResult:null
    };

    /* ---------- Screen elements ---------- */
    const screens = {
      intro: document.getElementById('introScreen'),
      playing: document.getElementById('gameScreen'),
      completed: document.getElementById('completedScreen'),
      timeout: document.getElementById('timeoutScreen')
    };
    const missingScreens = Object.entries(screens).filter(([, el]) => !el).map(([name]) => name);
    if (missingScreens.length) {
      console.warn(`[indian-edit] Missing screen element(s): ${missingScreens.join(', ')}.`);
    }
    function showScreen(name){
      Object.values(screens).forEach(s=>s?.classList.add('hidden'));
      screens[name]?.classList.remove('hidden');
      state.screen = name;
    }

    /* ---------- Header controls ---------- */
    document.getElementById('soundBtn')?.addEventListener('click', ()=>{
      state.soundOn = !state.soundOn;
      Audio_.enabled = state.soundOn;
      const btn = document.getElementById('soundBtn');
      if (btn) btn.textContent = state.soundOn ? '🔊' : '🔇';
    });
    document.getElementById('restartBtn')?.addEventListener('click', resetToIntro);
    document.getElementById('helpBtn')?.addEventListener('click', ()=>document.getElementById('helpModal')?.classList.remove('hidden'));
    document.getElementById('closeHelp')?.addEventListener('click', ()=>document.getElementById('helpModal')?.classList.add('hidden'));
    document.getElementById('gotItBtn')?.addEventListener('click', ()=>document.getElementById('helpModal')?.classList.add('hidden'));

    document.getElementById('startBtn')?.addEventListener('click', ()=>{
      Audio_.playStart();
      startGame();
    });
    document.getElementById('playAgainBtn')?.addEventListener('click', ()=>{ Audio_.playStart(); startGame(); });
    document.getElementById('retryBtn')?.addEventListener('click', ()=>{ Audio_.playStart(); startGame(); });
    document.getElementById('proceedBtn')?.addEventListener('click', ()=>{
  window.parent.postMessage({ source: 'master-the-blend', type: 'PROCEED_TO_LEVEL_5' }, '*');
});
    document.getElementById('shareBtn')?.addEventListener('click', shareScore);

    function resetToIntro(){
      clearInterval(state.timerId);
      showScreen('intro');
    }

    /* ---------- Game logic ---------- */
    let order = [];

    function startGame(){
      order = shuffle(INGREDIENTS);
      state.collected = [];
      state.score = 0;
      state.timeLeft = 30;
      state.incorrectAttempts = 0;
      state.startedAt = Date.now();
      renderIngredients();
      updateHud();
      updateVessel();
      const feedbackEl = document.getElementById('feedback');
      if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = ''; }
      showScreen('playing');
      clearInterval(state.timerId);
      state.timerId = setInterval(()=>{
        state.timeLeft--;
        updateHud();
        if(state.timeLeft <= 0){
          clearInterval(state.timerId);
          Audio_.playIncorrect();
          finishTimeout();
        }
      },1000);
    }

    function renderIngredients(){
      const list = document.getElementById('ingredientsList');
      if (!list) { console.warn('[indian-edit] #ingredientsList not found.'); return; }
      list.innerHTML = '';
      order.forEach(ing=>{
        const el = document.createElement('div');
        el.className = 'ingredient';
        el.draggable = true;
        el.dataset.id = ing.id;
        el.innerHTML = `
          <div class="ing-left">
            <div class="ing-icon">${ing.icon}</div>
            <div>
              <span class="ing-name">${ing.name}</span>
              <span class="ing-origin">${ing.origin}</span>
            </div>
          </div>
          <div class="check-circle">✓</div>
        `;
        el.addEventListener('click', ()=>attemptAdd(ing, el));
        el.addEventListener('dragstart', (e)=>{
          e.dataTransfer.setData('text/plain', ing.id);
          Audio_.playDrag();
        });
        list.appendChild(el);
      });
    }

    const vessel = document.getElementById('vessel');
    if (!vessel) {
      console.warn('[indian-edit] #vessel not found — drag-and-drop into the bottle unavailable.');
    } else {
      vessel.addEventListener('dragover', e=>{ e.preventDefault(); vessel.classList.add('hover'); });
      vessel.addEventListener('dragleave', ()=> vessel.classList.remove('hover'));
      vessel.addEventListener('drop', e=>{
        e.preventDefault();
        vessel.classList.remove('hover');
        const id = e.dataTransfer.getData('text/plain');
        const ing = order.find(i=>i.id === id);
        const el = document.querySelector(`.ingredient[data-id="${id}"]`);
        if(ing) attemptAdd(ing, el);
      });
    }

    function attemptAdd(ing, el){
      if(state.screen !== 'playing') return;
      if(state.collected.some(c=>c.id===ing.id)) return;

      if(ing.correct){
        Audio_.playCorrect();
        state.collected.push(ing);
        state.score += 100;
        el.classList.add('collected');
        const check = el.querySelector('.check-circle');
        check.classList.add('done');

        if(REQUIRED.every(id=>state.collected.some(c=>c.id===id))){
          clearInterval(state.timerId);
          const elapsed = Math.min(30, Math.round((Date.now()-state.startedAt)/1000));
          const bonus = state.timeLeft >= 15 ? 50 : 0;
          const base = state.score;
          const total = base + bonus;
          Audio_.playComplete();
          setTimeout(()=>finishCompleted(total, base, bonus, elapsed), 1200);
        }
      } else {
        Audio_.playIncorrect();
        state.score = Math.max(0, state.score - 25);
        state.incorrectAttempts++;
        showFeedback(`${ing.name} is not part of this edit. (-25)`, false);
        el.classList.add('shake');
        setTimeout(()=>el.classList.remove('shake'), 450);
      }
      updateHud();
      updateVessel();
    }

    function showFeedback(text, success){
      const fb = document.getElementById('feedback');
      if (!fb) return;
      fb.textContent = text;
      fb.className = success ? 'success' : '';
      clearTimeout(showFeedback._t);
      showFeedback._t = setTimeout(()=>{ fb.textContent=''; fb.className=''; }, 1600);
    }

    function updateHud(){
      const scoreEl = document.getElementById('scoreValue');
      if (scoreEl) scoreEl.textContent = state.score;
      const m = String(Math.floor(state.timeLeft/60)).padStart(2,'0');
      const s = String(state.timeLeft%60).padStart(2,'0');
      const tv = document.getElementById('timerValue');
      if (tv) {
        tv.textContent = `${m}:${s}`;
        tv.classList.toggle('warn', state.timeLeft <= 10);
      }
    }

    function updateVessel(){
      const n = state.collected.length;
      const pct = n===0?0:n===1?33.33:n===2?66.66:100;
      const fillEl = document.getElementById('vesselFill');
      if (fillEl) fillEl.style.height = pct+'%';
      document.querySelectorAll('.vessel-dot').forEach((d,i)=>d.classList.toggle('filled', n>i));
      const labelEl = document.getElementById('vesselLabel');
      if (labelEl) {
        labelEl.textContent =
          n===0?'DRAG OR TAP CRAFT INTO BOTTLE':
          n===1?'1/3 BLENDED • ADD NEXT ORIGIN':
          n===2?'2/3 BLENDED • FINAL ORIGIN AWAITED':
          'HARMONIOUS BLEND ACHIEVED';
      }
    }

    function finishCompleted(total, base, bonus, elapsed){
      const finalScoreEl = document.getElementById('finalScore');
      if (finalScoreEl) finalScoreEl.textContent = total;
      const statBaseEl = document.getElementById('statBase');
      if (statBaseEl) statBaseEl.textContent = base+' pts';
      const statBonusEl = document.getElementById('statBonus');
      if (statBonusEl) statBonusEl.textContent = bonus>0?`+${bonus} pts`:'—';
      const statTimeEl = document.getElementById('statTime');
      if (statTimeEl) statTimeEl.textContent = elapsed+'s';
      state.lastResult = { score: total, elapsed };
      showScreen('completed');
    }

    function finishTimeout(){
      const timeoutScoreEl = document.getElementById('timeoutScore');
      if (timeoutScoreEl) timeoutScoreEl.textContent = state.score+' pts';
      state.lastResult = { score: state.score, elapsed: 30 };
      showScreen('timeout');
    }

    function shareScore(){
      const r = state.lastResult || {score: state.score, elapsed: 0};
      const text = `I mastered the blend with a score of ${r.score} pts in ${r.elapsed}s! Discover The Indian Edit: Different origins. One distinctive edit. — ${window.location.href}`;
      if(navigator.share){
        navigator.share({title:'Master The Blend | The Indian Edit', text, url:window.location.href}).catch(()=>{});
      } else if(navigator.clipboard){
        navigator.clipboard.writeText(text);
        const btn = document.getElementById('shareBtn');
        const orig = btn.textContent;
        btn.textContent = '✓ Score Copied!';
        setTimeout(()=>btn.textContent = orig, 2500);
      }
    }

    showScreen('intro');
  }
})();