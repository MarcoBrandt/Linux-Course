/* Standalone, dependency-free Game Boy-inspired Tetris overlay. */
(() => {
  "use strict";
  const openButton = document.getElementById("tetris-toggle");
  const overlay = document.getElementById("tetris-overlay");
  if (!openButton || !overlay) return;
  const canvas = overlay.querySelector("#tetris-board");
  const preview = overlay.querySelector("#tetris-next");
  const ctx = canvas.getContext("2d");
  const nextCtx = preview.getContext("2d");
  const scoreEl = overlay.querySelector("#tetris-score");
  const levelEl = overlay.querySelector("#tetris-level");
  const linesEl = overlay.querySelector("#tetris-lines");
  const statusEl = overlay.querySelector("#tetris-status");
  const pauseButton = overlay.querySelector("#tetris-pause");
  const closeButton = overlay.querySelector("#tetris-close");
  const newButton = overlay.querySelector("#tetris-new");
  const W = 10, H = 20, CELL = 24;
  const COLORS = ["#a6ba76", "#243c2c", "#34533b", "#496a49", "#64855a"];
  const FORMS = [
    [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
    [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]],
    [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]
  ];
  const SPEED = [48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2];
  let board, active, next, score, lines, level, running=false, paused=false, over=false;
  let lastTime=0, accumulator=0, raf=0;
  function randomPiece() {
    const type = Math.floor(Math.random()*FORMS.length);
    return {matrix:FORMS[type].map(r=>r.slice()), type, x:0, y:0};
  }
  function collides(p, dx=0, dy=0, matrix=p.matrix) {
    for(let y=0;y<matrix.length;y++) for(let x=0;x<matrix[y].length;x++) {
      if (!matrix[y][x]) continue;
      const px=p.x+x+dx, py=p.y+y+dy;
      if(px<0 || px>=W || py>=H || (py>=0 && board[py][px])) return true;
    }
    return false;
  }
  function spawn() {
    active=next || randomPiece();
    next=randomPiece();
    active.x=Math.floor((W-active.matrix[0].length)/2);
    active.y=0;
    if(collides(active)){over=true;paused=false;statusEl.textContent="GAME OVER";pauseButton.textContent="PAUSE";}
  }
  function reset() {
    board=Array.from({length:H},()=>Array(W).fill(0));
    score=0;lines=0;level=0;over=false;paused=false;running=true;
    next=randomPiece();spawn();accumulator=0;lastTime=0;
    statusEl.textContent="PLAYING";pauseButton.textContent="PAUSE";
    updateStats();draw();
    cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
  }
  function updateStats() {
    scoreEl.textContent=String(score).padStart(6,"0");
    levelEl.textContent=String(level).padStart(2,"0");
    linesEl.textContent=String(lines).padStart(3,"0");
  }
  function lock() {
    for(let y=0;y<active.matrix.length;y++) for(let x=0;x<active.matrix[y].length;x++) {
      if(!active.matrix[y][x])continue;
      const by=active.y+y;
      if(by<0){over=true;statusEl.textContent="GAME OVER";return;}
      board[by][active.x+x]=1+active.type%4;
    }
    let cleared=0;
    for(let y=H-1;y>=0;y--){
      if(board[y].every(Boolean)){
        board.splice(y,1);board.unshift(Array(W).fill(0));cleared++;y++;
      }
    }
    if(cleared){
      score += [0,40,100,300,1200][cleared]*(level+1);
      lines += cleared;level=Math.min(20,Math.floor(lines/10));
      updateStats();
    }
    spawn();
  }
  function step() {
    if(!collides(active,0,1))active.y++;
    else lock();
  }
  function move(dx) {
    if(collides(active,dx,0))return;
    active.x+=dx;
  }
  function rotate(direction) {
    const old=active.matrix;
    const rotated=old[0].map((_,i)=>old.map(row=>row[i]));
    if(direction===1)rotated.forEach(row=>row.reverse());
    else rotated.reverse();
    for(const dx of [0,-1,1,-2,2]){
      if(!collides(active,dx,0,rotated)){active.x+=dx;active.matrix=rotated;return;}
    }
  }
  function drop() {
    while(!collides(active,0,1))active.y++;
    lock();
  }
  function input(command) {
    if(!running || over || paused)return;
    if(command==="left")move(-1);
    else if(command==="right")move(1);
    else if(command==="down"){if(!collides(active,0,1)){active.y++;score++;updateStats();}else lock();}
    else if(command==="rotate")rotate(1);
    else if(command==="rotate-back")rotate(-1);
    else if(command==="drop")drop();
    draw();
  }
  function block(context,x,y,s= CELL,filled=1){
    context.fillStyle=COLORS[filled]||COLORS[1];
    context.fillRect(x+1,y+1,s-2,s-2);
    context.fillStyle="#d0dea1";context.fillRect(x+2,y+2,s-4,2);context.fillRect(x+2,y+2,2,s-4);
    context.fillStyle="#172c23";context.fillRect(x+s-4,y+4,2,s-6);context.fillRect(x+4,y+s-4,s-6,2);
    context.fillStyle="#819c69";context.fillRect(x+5,y+5,s-11,s-11);
  }
  function draw(){
    ctx.fillStyle=COLORS[0];ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="rgba(37,60,44,.12)";
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL,CELL);
      if(board[y][x])block(ctx,x*CELL,y*CELL,CELL,board[y][x]);
    }
    if(active && !over)for(let y=0;y<active.matrix.length;y++)for(let x=0;x<active.matrix[y].length;x++){
      if(active.matrix[y][x])block(ctx,(active.x+x)*CELL,(active.y+y)*CELL,CELL,1+active.type%4);
    }
    nextCtx.fillStyle=COLORS[0];nextCtx.fillRect(0,0,preview.width,preview.height);
    if(next){
      const size=20,m=next.matrix;
      const ox=(preview.width-m[0].length*size)/2,oy=(preview.height-m.length*size)/2;
      for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++)if(m[y][x])block(nextCtx,ox+x*size,oy+y*size,size,1+next.type%4);
    }
  }
  function tick(time){
    if(!running)return;
    if(!lastTime)lastTime=time;
    const delta=Math.min(time-lastTime,100);lastTime=time;
    if(!paused && !over){
      accumulator+=delta;
      const delay=(SPEED[Math.min(level,20)]||2)*1000/60;
      if(accumulator>=delay){step();accumulator%=delay;draw();}
    }
    raf=requestAnimationFrame(tick);
  }
  function setPaused(){
    if(over||!running)return;
    paused=!paused;statusEl.textContent=paused?"PAUSED":"PLAYING";
    pauseButton.textContent=paused?"RESUME":"PAUSE";
  }
  function open(){
    overlay.hidden=false;openButton.setAttribute("aria-expanded","true");
    if(window.innerWidth<=850){
      document.getElementById("sidebar")?.classList.remove("open");
      document.getElementById("scrim")?.classList.remove("open");
      document.getElementById("menu-button")?.setAttribute("aria-expanded","false");
    }
    reset();closeButton.focus();
  }
  function close(){
    overlay.hidden=true;openButton.setAttribute("aria-expanded","false");
    running=false;cancelAnimationFrame(raf);openButton.focus();
  }
  openButton.addEventListener("click",()=>overlay.hidden?open():close());
  closeButton.addEventListener("click",close);
  newButton.addEventListener("click",reset);
  pauseButton.addEventListener("click",setPaused);
  document.addEventListener("keydown",e=>{
    if(overlay.hidden)return;
    if(e.key==="Escape"){e.preventDefault();close();return;}
    const keys={ArrowLeft:"left",ArrowRight:"right",ArrowDown:"down",ArrowUp:"rotate",x:"rotate",X:"rotate",z:"rotate-back",Z:"rotate-back"," ":"drop"};
    if(e.key==="p"||e.key==="P"){e.preventDefault();setPaused();return;}
    const command=keys[e.key];
    if(command){e.preventDefault();input(command);}
  });
  overlay.querySelectorAll("[data-tetris]").forEach(btn=>{
    btn.addEventListener("pointerdown",e=>{e.preventDefault();input(btn.dataset.tetris);});
  });
  window.addEventListener("hashchange",()=>{if(!overlay.hidden)close();});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden && !overlay.hidden && !paused && !over)setPaused();
  });
})();
