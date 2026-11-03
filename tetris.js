(function installed(){
  'use strict';
  const trigger = document.getElementById('tetris-toggle');
  const overlay = document.getElementById('tetris-overlay');
  if (!trigger || !overlay) return;

  const STORAGE = 'marco-cyber-tetris-top10-v1';
  const SETTINGS = 'marco-cyber-tetris-settings-v1';
  const COLS = 10, ROWS = 20, CELL = 24;
  const TONES = ['#a6ba76', '#243c2c', '#34533b', '#496a49', '#64855a'];
  const PIECES = [
    [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
    [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]],
    [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]
  ];
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const escapeHTML = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const safeStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const saveStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } };
  const safeScores = () => {
    const saved = safeStorage(STORAGE, []);
    if (!Array.isArray(saved)) return [];
    return saved.filter(x => x && typeof x.name === 'string' && Number.isFinite(x.score) && x.score >= 0)
      .map(x => ({name:x.name.slice(0,12), score:Math.floor(x.score), lines:clamp(Number(x.lines)||0,0,99999), difficulty:clamp(Number(x.difficulty)||1,1,10)}))
      .sort((a,b) => b.score - a.score).slice(0,10);
  };
  const storedSettings = safeStorage(SETTINGS, {});
  let difficulty = clamp(Number(storedSettings.difficulty)||1,1,10);
  let soundOn = storedSettings.sound !== false;
  let musicOn = storedSettings.music !== false;

  const styling = document.createElement('style');
  styling.id = 'tetris-extra-styles';
  styling.textContent = `
    #tetris-overlay .tetris-console {position:relative;max-width:590px}
    #tetris-overlay .tetris-screen {position:relative;min-height:330px}
    #tetris-overlay .tetris-menu-pane {position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;padding:12px;background:#9bad78;color:#24392a;overflow-y:auto}
    #tetris-overlay .tetris-menu-pane[hidden],#tetris-overlay .tetris-game-area[hidden],#tetris-overlay .tetris-actions[hidden],#tetris-overlay .tetris-controls[hidden],#tetris-overlay .tetris-help[hidden] {display:none!important}
    #tetris-overlay .tetris-menu-content {width:min(100%,340px);font-family:var(--mono);text-align:center}
    #tetris-overlay .tetris-menu-content h2 {font:900 clamp(20px,4vw,29px)/1.2 var(--mono);letter-spacing:2px;margin:0 0 6px;color:#21392b}
    #tetris-overlay .tetris-menu-content p {margin:3px 0 18px;font-size:11px;line-height:1.5}
    #tetris-overlay .tetris-menu-btn {display:flex;align-items:center;justify-content:center;width:100%;min-height:43px;margin:7px 0;padding:8px 11px;border:2px solid #314835;border-radius:2px;background:#b6c68a;color:#24392b;font:800 12px var(--mono);cursor:pointer;letter-spacing:.5px}
    #tetris-overlay .tetris-menu-btn:hover,#tetris-overlay .tetris-menu-btn:focus-visible {background:#324c38;color:#d4e5b2;outline:2px solid #7d9663;outline-offset:2px}
    #tetris-overlay .tetris-adjust {display:flex;align-items:center;gap:7px;margin:10px 0}
    #tetris-overlay .tetris-adjust>label {font:700 11px var(--mono);flex:1;text-align:left}
    #tetris-overlay .tetris-adjust .tetris-small {padding:5px 10px;min-width:36px;min-height:36px;font:800 17px var(--mono);border:2px solid #324735;color:#24392b;background:#bdd099;cursor:pointer}
    #tetris-overlay .tetris-adjust output {min-width:25px;font:900 20px var(--mono)}
    #tetris-overlay .tetris-toggles {display:flex;gap:8px}
    #tetris-overlay .tetris-toggles button {flex:1;font:700 10px var(--mono);background:#a6bb83;color:#223c29;border:1px solid #314835;padding:9px 5px;cursor:pointer}
    #tetris-overlay .tetris-scores {list-style:none;padding:0;margin:12px 0;text-align:left;max-height:265px;overflow:auto}
    #tetris-overlay .tetris-scores li {display:grid;grid-template-columns:26px 1fr auto;gap:8px;padding:7px 5px;border-bottom:1px solid #66805c;font:700 12px var(--mono)}
    #tetris-overlay .tetris-score-empty {font:12px var(--mono);margin:17px 0}
    #tetris-overlay .tetris-name {background:#d3dea8;color:#203b27;border:2px solid #345036;padding:10px;font:700 16px var(--mono);width:100%;text-align:center;outline-offset:2px;text-transform:uppercase}
    #tetris-overlay .tetris-name:focus {outline:2px solid #344b36}
    #tetris-overlay .tetris-game-area {display:flex;justify-content:center;gap:12px;width:100%}
    #tetris-overlay .tetris-game-area #tetris-board {flex-shrink:1}
    #tetris-overlay .tetris-screen:has(.tetris-menu-pane:not([hidden])) {min-height:380px}
    #tetris-overlay .tetris-menu-note {font-size:10px!important;margin-top:14px!important}
    @media(max-width:430px) {#tetris-overlay .tetris-menu-pane{padding:7px}#tetris-overlay .tetris-screen:has(.tetris-menu-pane:not([hidden])){min-height:350px}}
  `;
  document.head.append(styling);

  const screen = overlay.querySelector('.tetris-screen');
  const boardCanvas = overlay.querySelector('#tetris-board');
  const stats = overlay.querySelector('.tetris-stats');
  const nextCanvas = overlay.querySelector('#tetris-next');
  const scoreText = overlay.querySelector('#tetris-score');
  const levelText = overlay.querySelector('#tetris-level');
  const linesText = overlay.querySelector('#tetris-lines');
  const statusText = overlay.querySelector('#tetris-status');
  const pauseButton = overlay.querySelector('#tetris-pause');
  const newButton = overlay.querySelector('#tetris-new');
  const closeButton = overlay.querySelector('#tetris-close');
  const actions = overlay.querySelector('.tetris-actions');
  const controls = overlay.querySelector('.tetris-controls');
  const help = overlay.querySelector('.tetris-help');
  if (![screen,boardCanvas,stats,nextCanvas,scoreText,levelText,linesText,statusText,pauseButton,newButton,closeButton,actions,controls,help].every(Boolean)) return;
  const gameArea = document.createElement('div');
  gameArea.className='tetris-game-area';
  gameArea.hidden=true;
  gameArea.append(boardCanvas,stats);
  screen.append(gameArea);
  const menuPane = document.createElement('div');
  menuPane.className='tetris-menu-pane';
  screen.append(menuPane);

  const ctx=boardCanvas.getContext('2d');
  const nextCtx=nextCanvas.getContext('2d');
  let board=[], active=null, next=null, bag=[];
  let score=0, lines=0, level=0, dropMs=900, elapsed=0, previous=0, frame=0;
  let state='closed';
  let pendingEntry=false;
  let audio=null, melodyTimer=0, melodyStep=0;
  const melody = [0,3,7,10,7,3,2,5,9,12,9,5,0,4,7,11,7,4,2,5,9,14,9,5];

  function persistSettings(){saveStorage(SETTINGS,{difficulty,sound:soundOn,music:musicOn});}
  function audioEngine(){
    if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;audio=new AC();}
    if(audio.state==='suspended')audio.resume().catch(()=>{});
    return audio;
  }
  function tone(freq,duration=0.06,kind='square',gain=0.025,delay=0){
    const a=audioEngine();if(!a)return;
    const start=a.currentTime+delay;
    const osc=a.createOscillator(),amp=a.createGain();
    osc.type=kind;osc.frequency.setValueAtTime(freq,start);
    amp.gain.setValueAtTime(0.0001,start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002,gain),start+0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    osc.connect(amp);amp.connect(a.destination);osc.start(start);osc.stop(start+duration+0.015);
  }
  function effect(id){
    if(!soundOn)return;
    if(id==='move')tone(165,0.028,'square',0.009);
    if(id==='rotate')tone(330,0.048,'square',0.015);
    if(id==='lock')tone(110,0.1,'triangle',0.026);
    if(id==='line'){[392,523,659,784].forEach((hz,i)=>tone(hz,0.13,'square',0.022,i*0.065));}
    if(id==='drop')tone(145,0.12,'sawtooth',0.018);
    if(id==='over'){[329,261,196,130].forEach((hz,i)=>tone(hz,0.22,'triangle',0.035,i*0.16));}
    if(id==='start'){[220,330,440].forEach((hz,i)=>tone(hz,0.09,'square',0.021,i*0.09));}
  }
  function stopMusic(){clearInterval(melodyTimer);melodyTimer=0;}
  function startMusic(){
    stopMusic();if(!musicOn||state!=='playing')return;
    const beat=Math.max(110,215-(difficulty-1)*8);
    melodyTimer=setInterval(()=>{
      if(state!=='playing'||!musicOn)return;
      const note=melody[melodyStep++%melody.length];
      const frequency=220*Math.pow(2,note/12);
      tone(frequency,beat/1000*.65,'square',0.011);
      if(melodyStep%4===1)tone(110,0.07,'triangle',0.009);
    },beat);
  }
  function randomPiece(){
    if(!bag.length){bag=[0,1,2,3,4,5,6];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
    const type=bag.pop();return {matrix:PIECES[type].map(r=>r.slice()),type,x:0,y:0};
  }
  function intersects(piece,dx=0,dy=0,matrix=piece.matrix){
    for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix[y].length;x++){
      if(!matrix[y][x])continue;
      const nx=piece.x+x+dx,ny=piece.y+y+dy;
      if(nx<0||nx>=COLS||ny>=ROWS||(ny>=0&&board[ny][nx]))return true;
    }
    return false;
  }
  function spawn(){
    active=next||randomPiece();next=randomPiece();
    active.x=Math.floor((COLS-active.matrix[0].length)/2);active.y=0;
    if(intersects(active))endGame();
  }
  function updateStats(){
    scoreText.textContent=String(score).padStart(6,'0');
    levelText.textContent=String(difficulty+level).padStart(2,'0');
    linesText.textContent=String(lines).padStart(3,'0');
  }
  function speed(){
    return Math.max(55,Math.round((900-(difficulty-1)*82)*Math.pow(0.87,level)));
  }
  function reset(){
    board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
    bag=[];active=null;next=randomPiece();score=0;lines=0;level=0;elapsed=0;previous=0;
    pendingEntry=false;state='playing';spawn();updateStats();draw();
    statusText.textContent='PLAYING';pauseButton.textContent='PAUSE';
    gameArea.hidden=false;menuPane.hidden=true;actions.hidden=false;controls.hidden=false;help.hidden=false;
    effect('start');startMusic();cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);
  }
  function lock(){
    for(let y=0;y<active.matrix.length;y++)for(let x=0;x<active.matrix[y].length;x++){
      if(!active.matrix[y][x])continue;
      const py=active.y+y;
      if(py<0){endGame();return;}
      board[py][active.x+x]=1+(active.type%4);
    }
    let removed=0;
    for(let y=ROWS-1;y>=0;y--){
      if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(0));removed++;y++;}
    }
    if(removed){
      score+=[0,40,100,300,1200][removed]*(difficulty+level);
      lines+=removed;level=Math.floor(lines/10);effect('line');
    }else effect('lock');
    updateStats();spawn();
  }
  function fall(){if(!intersects(active,0,1))active.y++;else lock();}
  function move(dx){if(!intersects(active,dx,0)){active.x+=dx;effect('move');}}
  function rotate(direction){
    const m=active.matrix;
    const rotated=m[0].map((_,i)=>m.map(row=>row[i]));
    if(direction>0)rotated.forEach(row=>row.reverse());else rotated.reverse();
    for(const offset of [0,-1,1,-2,2]){
      if(!intersects(active,offset,0,rotated)){active.x+=offset;active.matrix=rotated;effect('rotate');return;}
    }
  }
  function hardDrop(){
    let cells=0;
    while(!intersects(active,0,1)){active.y++;cells++;}
    score+=cells*2;effect('drop');lock();updateStats();
  }
  function command(cmd){
    if(state!=='playing')return;
    if(cmd==='left')move(-1);
    else if(cmd==='right')move(1);
    else if(cmd==='rotate')rotate(1);
    else if(cmd==='rotate-back')rotate(-1);
    else if(cmd==='down'){if(!intersects(active,0,1)){active.y++;score++;updateStats();}else lock();}
    else if(cmd==='drop')hardDrop();
    draw();
  }
  function block(g,x,y,size,fill=1){
    g.fillStyle=TONES[fill]||TONES[1];g.fillRect(x+1,y+1,size-2,size-2);
    g.fillStyle='#d0dea1';g.fillRect(x+2,y+2,size-4,2);g.fillRect(x+2,y+2,2,size-4);
    g.fillStyle='#172c23';g.fillRect(x+size-4,y+4,2,size-6);g.fillRect(x+4,y+size-4,size-6,2);
    g.fillStyle='#819c69';g.fillRect(x+5,y+5,Math.max(2,size-11),Math.max(2,size-11));
  }
  function draw(){
    ctx.fillStyle=TONES[0];ctx.fillRect(0,0,boardCanvas.width,boardCanvas.height);
    ctx.strokeStyle='rgba(37,60,44,.12)';
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL,CELL);
      if(board[y]?.[x])block(ctx,x*CELL,y*CELL,CELL,board[y][x]);
    }
    if(active&&state!=='gameover')for(let y=0;y<active.matrix.length;y++)for(let x=0;x<active.matrix[y].length;x++){
      if(active.matrix[y][x])block(ctx,(active.x+x)*CELL,(active.y+y)*CELL,CELL,1+active.type%4);
    }
    nextCtx.fillStyle=TONES[0];nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
    if(next){
      const size=20,m=next.matrix,ox=(nextCanvas.width-m[0].length*size)/2,oy=(nextCanvas.height-m.length*size)/2;
      for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++)if(m[y][x])block(nextCtx,ox+x*size,oy+y*size,size,1+next.type%4);
    }
  }
  function tick(now){
    if(state==='closed')return;
    if(!previous)previous=now;
    const dt=Math.min(now-previous,100);previous=now;
    if(state==='playing'){
      elapsed+=dt;
      const delay=speed();
      if(elapsed>=delay){elapsed%=delay;fall();draw();}
    }
    frame=requestAnimationFrame(tick);
  }
  function togglePause(){
    if(state!=='playing'&&state!=='paused')return;
    state=state==='paused'?'playing':'paused';
    statusText.textContent=state==='paused'?'PAUSED':'PLAYING';
    pauseButton.textContent=state==='paused'?'RESUME':'PAUSE';
    if(state==='paused')stopMusic();else startMusic();
  }
  function switchScreen(){
    gameArea.hidden=true;actions.hidden=true;controls.hidden=true;help.hidden=true;
    menuPane.hidden=false;stopMusic();
  }
  function renderHome(){
    state='menu';switchScreen();
    menuPane.innerHTML=`<div class="tetris-menu-content">
      <h2>▦ BLOCKS</h2><p>RETRO HANDHELD EDITION</p>
      <button class="tetris-menu-btn" type="button" data-menu="new">▶ NEW GAME</button>
      <div class="tetris-adjust"><label for="tetris-difficulty-value">DIFFICULTY</label>
      <button class="tetris-small" type="button" data-menu="less" aria-label="Decrease difficulty">◀</button>
      <output id="tetris-difficulty-value" aria-live="polite">${difficulty}</output>
      <button class="tetris-small" type="button" data-menu="more" aria-label="Increase difficulty">▶</button></div>
      <button class="tetris-menu-btn" type="button" data-menu="scores">★ HIGH SCORES · TOP 10</button>
      <div class="tetris-toggles"><button type="button" data-menu="music">MUSIC: ${musicOn?'ON':'OFF'}</button>
      <button type="button" data-menu="sound">SFX: ${soundOn?'ON':'OFF'}</button></div>
      <p class="tetris-menu-note">Difficulty 1 = slowest · 10 = fastest<br>Saved locally on this browser</p>
    </div>`;
    menuPane.querySelector('[data-menu="new"]').focus();
  }
  function renderScores(){
    state='scores';switchScreen();
    const scores=safeScores();
    menuPane.innerHTML=`<div class="tetris-menu-content"><h2>HIGH SCORES</h2><p>TOP 10 · THIS BROWSER</p>
      ${scores.length?`<ol class="tetris-scores">${scores.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><span>${escapeHTML(s.name)}</span><span>${s.score.toLocaleString('en-US')}</span></li>`).join('')}</ol>`:'<p class="tetris-score-empty">NO SCORES YET</p>'}
      <button type="button" class="tetris-menu-btn" data-menu="back">← BACK TO MENU</button></div>`;
    menuPane.querySelector('[data-menu="back"]').focus();
  }
  function qualifies(){const scores=safeScores();return score>0&&(scores.length<10||score>scores[scores.length-1].score);}
  function endGame(){
    if(state==='gameover'||state==='closed')return;
    state='gameover';stopMusic();effect('over');statusText.textContent='GAME OVER';
    if(qualifies())renderEntry();else renderGameOver();
  }
  function renderGameOver(){
    state='gameover';switchScreen();
    menuPane.innerHTML=`<div class="tetris-menu-content"><h2>GAME OVER</h2>
      <p>SCORE: ${score.toLocaleString('en-US')} · LINES: ${lines}</p>
      <button type="button" class="tetris-menu-btn" data-menu="new">▶ PLAY AGAIN</button>
      <button type="button" class="tetris-menu-btn" data-menu="scores">★ HIGH SCORES</button>
      <button type="button" class="tetris-menu-btn" data-menu="back">← MAIN MENU</button></div>`;
    menuPane.querySelector('[data-menu="new"]').focus();
  }
  function renderEntry(){
    state='entry';switchScreen();pendingEntry=true;
    menuPane.innerHTML=`<div class="tetris-menu-content"><h2>NEW HIGH SCORE!</h2>
      <p>${score.toLocaleString('en-US')} POINTS · ${lines} LINES</p>
      <label for="tetris-nickname">ENTER NICKNAME (1–12 CHARACTERS)</label>
      <form id="tetris-score-form"><input class="tetris-name" id="tetris-nickname" maxlength="12" minlength="1" autocomplete="off" placeholder="PLAYER" required>
      <button type="submit" class="tetris-menu-btn">✓ SAVE SCORE</button></form>
      <button type="button" class="tetris-menu-btn" data-menu="skip">SKIP</button></div>`;
    menuPane.querySelector('#tetris-nickname').focus();
  }
  function submitScore(){
    if(!pendingEntry)return;
    const field=menuPane.querySelector('#tetris-nickname');
    const name=field?.value.trim().replace(/\s+/g,' ').slice(0,12).toUpperCase();
    if(!name){field?.focus();return;}
    const scores=safeScores();scores.push({name,score,lines,difficulty});
    scores.sort((a,b)=>b.score-a.score);saveStorage(STORAGE,scores.slice(0,10));
    pendingEntry=false;renderScores();
  }
  function open(){
    overlay.hidden=false;trigger.setAttribute('aria-expanded','true');
    if(innerWidth<=850){
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('scrim')?.classList.remove('open');
      document.getElementById('menu-button')?.setAttribute('aria-expanded','false');
    }
    renderHome();
  }
  function close(){
    if(pendingEntry){
      const field=menuPane.querySelector('#tetris-nickname');
      if(field?.value.trim()){submitScore();return;}
      renderEntry();return;
    }
    overlay.hidden=true;trigger.setAttribute('aria-expanded','false');
    state='closed';stopMusic();cancelAnimationFrame(frame);trigger.focus();
  }
  function adjustDifficulty(amount){difficulty=clamp(difficulty+amount,1,10);persistSettings();const el=menuPane.querySelector('#tetris-difficulty-value');if(el)el.value=String(difficulty);}
  trigger.addEventListener('click',()=>overlay.hidden?open():close());
  closeButton.addEventListener('click',close);
  newButton.textContent='MENU';
  newButton.addEventListener('click',renderHome);
  pauseButton.addEventListener('click',togglePause);
  menuPane.addEventListener('click',e=>{
    const button=e.target.closest('[data-menu]');if(!button)return;
    const action=button.dataset.menu;
    if(action==='new')reset();
    if(action==='less')adjustDifficulty(-1);
    if(action==='more')adjustDifficulty(1);
    if(action==='scores')renderScores();
    if(action==='back')renderHome();
    if(action==='skip'){pendingEntry=false;renderGameOver();}
    if(action==='music'){musicOn=!musicOn;persistSettings();renderHome();}
    if(action==='sound'){soundOn=!soundOn;persistSettings();renderHome();}
  });
  menuPane.addEventListener('submit',e=>{if(e.target.id==='tetris-score-form'){e.preventDefault();submitScore();}});
  overlay.querySelectorAll('[data-tetris]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();command(button.dataset.tetris);});
  });
  document.addEventListener('keydown',e=>{
    if(overlay.hidden)return;
    if(e.key==='Escape'){
      e.preventDefault();if(state==='playing'||state==='paused'){renderHome();}else if(state==='scores'||state==='gameover'){renderHome();}else if(state==='entry'){/* Save or skip explicitly. */}else close();return;
    }
    if(state==='menu'&&['ArrowLeft','ArrowRight'].includes(e.key)){
      const target=document.activeElement;
      if(target?.closest('.tetris-adjust')){e.preventDefault();adjustDifficulty(e.key==='ArrowLeft'?-1:1);}
      return;
    }
    if(state!=='playing'&&state!=='paused')return;
    if(e.key==='p'||e.key==='P'){e.preventDefault();togglePause();return;}
    const keys={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',x:'rotate',X:'rotate',z:'rotate-back',Z:'rotate-back',' ':'drop'};
    if(Object.hasOwn(keys,e.key)){e.preventDefault();command(keys[e.key]);}
  });
  window.addEventListener('hashchange',()=>{if(!overlay.hidden&&state!=='entry')close();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
})();
