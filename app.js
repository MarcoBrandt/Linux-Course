// GitHub Pages course portfolio — Markdown-driven assignment routing.
const tasks = [
  {id:'h0',name:'Hello, GitHub!',detail:'Markdown, Git and version control',file:'h0.md'},
  {id:'h1',name:'CyberScience',detail:'Research, review and threat modelling',file:'h1-cyberscience.md'},
  {id:'h2',name:'Current Cybersecurity Scene',detail:'Podcast, threat landscape and research',file:'H2_scene.md'},
  {id:'h3',name:'Linux & Password Cracking',detail:'Debian 13, Hashcat and John the Ripper Jumbo',file:'H3_Cyberlab.md'},
  {id:'h4',name:'Assignment 04',detail:'Upcoming course assignment',file:null},
  {id:'h5',name:'Assignment 05',detail:'Upcoming course assignment',file:null},
  {id:'h6',name:'Assignment 06',detail:'Upcoming course assignment',file:null},
  {id:'h7',name:'Assignment 07',detail:'Upcoming course assignment',file:null},
  {id:'h8',name:'Assignment 08',detail:'Upcoming course assignment',file:null}
];
const page = document.getElementById('page-content');
const nav = document.getElementById('assignment-nav');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menu-button');
const escapeHtml = str => String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
nav.innerHTML = tasks.map(t => t.file
  ? `<a class="nav-link" href="#${t.id}" data-page="${t.id}"><span class="task-number">${t.id.toUpperCase()}</span><span>${escapeHtml(t.name)}</span><span class="nav-tag">READY</span></a>`
  : `<span class="nav-link disabled" aria-disabled="true"><span class="task-number">${t.id.toUpperCase()}</span><span>${escapeHtml(t.name)}</span><span class="nav-tag">SOON</span></span>`
).join('');
function setMenu(open){sidebar.classList.toggle('open',open);scrim.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open));}
menuBtn.addEventListener('click',()=>setMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click',()=>setMenu(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
function overview(){
  const ready=tasks.filter(t=>t.file);
  return `<div class="eyebrow">HAAGA-HELIA / CYBER SECURITY 2026</div>
  <h1 class="hero-title">Cybersecurity<br><span class="highlight">Studies.</span></h1>
  <p class="hero-description">My coursework, notes and practical exercises in cybersecurity. Learning through research and hands-on experience.</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#h3">Explore assignments <span>↗</span></a><a class="btn btn-ghost" href="https://github.com/MarcoBrandt/Linux-Course" target="_blank" rel="noopener noreferrer">Source repository <span>↗</span></a></div>
  <div class="metrics"><div class="metric"><div class="metric-kicker">ASSIGNMENTS PUBLISHED</div><div class="metric-value">${String(ready.length).padStart(2,'0')} <small>/ 09</small></div></div><div class="metric"><div class="metric-kicker">CURRENT MODULE</div><div class="metric-value">H3 <small>LINUX LAB</small></div></div><div class="metric"><div class="metric-kicker">ACADEMIC TERM</div><div class="metric-value">2026 <small>AUTUMN</small></div></div></div>
  <div class="section-top"><div><div class="section-label">// THE ARCHIVE</div><h2 class="section-title">Assignment library</h2></div><span class="section-note">${ready.length} PUBLISHED · ${tasks.length-ready.length} UPCOMING</span></div>
  <div class="cards">${tasks.map(t=>`<${t.file?'a':'div'} class="assignment-card ${t.file?'':'future'}" ${t.file?`href="#${t.id}"`:''}><div class="card-top"><span class="card-index">// ${t.id.toUpperCase()}</span><span class="card-badge ${t.file?'':'soon'}">${t.file?'PUBLISHED':'COMING SOON'}</span></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.detail)}</p><span class="card-arrow">${t.file?'OPEN REPORT ↗':'AWAITING RELEASE ···'}</span></${t.file?'a':'div'}>`).join('')}</div>`;
}
async function render(){
  const route=(window.location.hash||'#home').slice(1).split('/')[0];
  const task=tasks.find(t=>t.id===route && t.file);
  const selected=task?task.id:'home';
  document.querySelectorAll('.nav-link[data-page]').forEach(el=>{const active=el.dataset.page===selected;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  const homeNav = document.querySelector('#main-nav .nav-link[data-page="home"]');
  if(homeNav){homeNav.classList.toggle('active',!task);if(!task)homeNav.setAttribute('aria-current','page');else homeNav.removeAttribute('aria-current');}
  document.getElementById('current-crumb').textContent=(task?task.id+' / '+task.name:'OVERVIEW').toUpperCase();
  setMenu(false);
  if(!task){page.innerHTML=overview();window.scrollTo(0,0);return;}
  page.innerHTML=`<div class="loader" role="status">Loading ${escapeHtml(task.name)}…</div>`;
  window.scrollTo(0,0);
  try{
    const response=await fetch('./'+encodeURIComponent(task.file),{cache:'no-cache'});
    if(!response.ok)throw Error(`HTTP ${response.status}`);
    const md=await response.text();
    if(!window.marked||!window.DOMPurify)throw Error('Markdown libraries unavailable');
    marked.setOptions({gfm:true,breaks:false});
    const safe=DOMPurify.sanitize(marked.parse(md),{USE_PROFILES:{html:true}});
    if((window.location.hash||'#home').slice(1).split('/')[0]!==task.id)return;
    page.innerHTML=`<section class="doc-heading"><a class="doc-back" href="#home">← Back to overview</a><div class="eyebrow">DOCUMENTATION / ${task.id.toUpperCase()}</div><h1 class="doc-title">${escapeHtml(task.name)}</h1><p class="doc-subtitle">${escapeHtml(task.detail)} — Cyber Security 2026</p><div class="doc-toolbar"><span class="pill">${task.id.toUpperCase()}</span><span>MARKDOWN REPORT</span><a href="https://github.com/MarcoBrandt/Linux-Course/blob/main/${encodeURIComponent(task.file)}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a></div></section><article class="markdown-body">${safe}</article>`;
    page.querySelectorAll('.markdown-body a').forEach(a=>{if(a.href && new URL(a.href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}});
  }catch(err){page.innerHTML=`<div class="error"><h2>Unable to load report</h2><p>${escapeHtml(err.message)}</p><p>The Markdown file may not exist yet, or a content CDN may be blocked.</p><a href="https://github.com/MarcoBrandt/Linux-Course" target="_blank" rel="noopener noreferrer">Open repository ↗</a></div>`;}
}
window.addEventListener('hashchange',render);
render();
