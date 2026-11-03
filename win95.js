/* Cyber/Lab OS 95 - isolated simulated desktop, no privileged shell. */
(()=>{'use strict';
const items=[['computer','My Computer','🖥️'],['presentation','Cybersecurity Presentation','📽️'],['dos','MS-DOS Prompt','⬛'],['arcade','Arcade','🕹️'],['notepad','Notepad','📝'],['cyber','Cyber Tools','🛡️'],['recycle','Recycle Bin','🗑️'],['back','Back to Normal','🚪']].map(([id,title,glyph])=>({id,title,glyph}));
const assignments=[['H0 - Hello, GitHub!','h0.md'],['H1 - CyberScience','h1-cyberscience.md'],['H2 - Current Cybersecurity Scene','H2_scene.md'],['H3 - Linux & Password Cracking','H3_Cyberlab.md'],['H4 - Feed Me','H4_FeedMe.md'],['H5 - Alice and Bob','H5_AliceAndBob.md'],['H6 - Assignment 06',null],['H7 - Assignment 07',null],['H8 - Assignment 08',null]];
const el=id=>document.getElementById(id), layer=el('window-layer'), start=el('start-menu'), startBtn=el('start-button'), taskbar=el('task-buttons'), windows=new Map();
let serial=0,z=30;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function back(){const route=new URLSearchParams(location.search).get('return')||'#home';location.href='./index.html'+(/^#(home|h[0-8])$/.test(route)?route:'#home');}
function icon(item,kind='desktop'){
 const b=document.createElement('button');b.type='button';b.className=kind==='desktop'?'desktop-icon':'file-icon';
 b.innerHTML='<span class="glyph" aria-hidden="true">'+item.glyph+'</span><span class="icon-title">'+esc(item.title)+'</span>';b.title=item.title;
 b.addEventListener('dblclick',()=>launch(item.id));
 b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();launch(item.id);}});
 let touch=0;b.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){if(Date.now()-touch<400){touch=0;launch(item.id);}else touch=Date.now();}});
 return b;
}
items.forEach(item=>el('desktop-icons').append(icon(item)));
items.forEach(item=>{const b=document.createElement('button');b.type='button';b.textContent=item.glyph+' '+item.title;b.onclick=()=>{hideStart();launch(item.id)};el('start-items').append(b);});
function hideStart(){start.hidden=true;startBtn.setAttribute('aria-expanded','false');}
startBtn.onclick=()=>{start.hidden=!start.hidden;startBtn.setAttribute('aria-expanded',String(!start.hidden));};
document.addEventListener('pointerdown',e=>{if(!start.hidden&&!start.contains(e.target)&&!startBtn.contains(e.target))hideStart();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideStart();});
function clock(){el('clock').textContent=new Date().toLocaleTimeString('fi-FI',{hour:'2-digit',minute:'2-digit'});}
clock();setInterval(clock,30000);
function focus(w){for(const x of windows.values()){x.el.classList.toggle('active',x===w);x.task.classList.toggle('active',x===w&&!x.minimized);}w.el.style.zIndex=++z;}
function close(id){const w=windows.get(id);if(!w)return;w.el.remove();w.task.remove();windows.delete(id);const others=[...windows.values()].filter(x=>!x.minimized);if(others.length)focus(others.at(-1));}
function restore(w){w.minimized=false;w.el.hidden=false;focus(w);}
function makeWindow(title,contents,config={}){
 const id=++serial,section=document.createElement('section');section.className='win';section.setAttribute('role','dialog');section.setAttribute('aria-label',title);
 section.style.left=Math.max(6,Math.min(100+(id%7)*31,innerWidth-380))+'px';section.style.top=38+(id%7)*20+'px';
 if(config.width)section.style.width=config.width;if(config.height)section.style.height=config.height;
 section.innerHTML='<header class="titlebar"><span class="title-text">'+esc(title)+'</span><span class="window-actions"><button class="window-btn" data-op="min" aria-label="Minimize">_</button><button class="window-btn" data-op="max" aria-label="Maximize">□</button><button class="window-btn" data-op="close" aria-label="Close">×</button></span></header><div class="win-body"></div><footer class="window-status">'+esc(config.status||'Ready')+'</footer>';
 const body=section.querySelector('.win-body');if(typeof contents==='string')body.innerHTML=contents;else if(contents)body.append(contents);
 layer.append(section);const button=document.createElement('button');button.type='button';button.className='task-button';button.title=title;button.textContent=title;taskbar.append(button);
 const w={id,el:section,body,task:button,minimized:false};windows.set(id,w);focus(w);
 section.addEventListener('pointerdown',()=>focus(w));
 button.onclick=()=>{if(w.minimized)restore(w);else if(section.classList.contains('active')){w.minimized=true;section.hidden=true;button.classList.remove('active');}else focus(w);};
 section.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{if(b.dataset.op==='close')close(id);if(b.dataset.op==='min'){w.minimized=true;section.hidden=true;button.classList.remove('active');}if(b.dataset.op==='max'){section.classList.toggle('maximized');focus(w);}});
 const bar=section.querySelector('.titlebar');bar.addEventListener('dblclick',e=>{if(!e.target.closest('button'))section.classList.toggle('maximized');});
 bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||section.classList.contains('maximized'))return;e.preventDefault();focus(w);const x=e.clientX,y=e.clientY,left=section.offsetLeft,top=section.offsetTop;bar.setPointerCapture(e.pointerId);
 const move=ev=>{section.style.left=Math.max(0,Math.min(innerWidth-70,left+ev.clientX-x))+'px';section.style.top=Math.max(0,Math.min(innerHeight-85,top+ev.clientY-y))+'px';};
 const stop=()=>{bar.removeEventListener('pointermove',move);bar.removeEventListener('pointerup',stop);bar.removeEventListener('pointercancel',stop);};
 bar.addEventListener('pointermove',move);bar.addEventListener('pointerup',stop);bar.addEventListener('pointercancel',stop);});
 return w;
}
function explorer(path='root'){
 const titles={root:'My Computer',c:'(C:) CYBER-LAB',assign:'Assignments',docs:'Documents',programs:'Programs'};
 const listing=path==='root'?[{id:'c',title:'(C:) CYBER-LAB',glyph:'💽'}]:path==='c'?[{id:'assign',title:'Assignments',glyph:'📂'},{id:'docs',title:'Documents',glyph:'📁'},{id:'programs',title:'Programs',glyph:'📁'}]:path==='assign'?assignments.map(([title,file])=>({id:'file',title,file,glyph:'📄'})):path==='programs'?items.filter(x=>['dos','arcade','notepad','cyber'].includes(x.id)):[{id:'presentation',title:'Cybersecurity Presentation',glyph:'📽️'},{id:'about',title:'About Cyber/Lab',glyph:'📄'}];
 const content=document.createElement('div');content.innerHTML='<div class="explorer-toolbar"><button class="up-folder">⬆ Up</button><b>Address:</b> '+esc(path==='root'?'My Computer':path==='c'?'C:\\':'C:\\'+titles[path])+'</div><div class="folder-list"></div>';
 const w=makeWindow(titles[path],content,{status:listing.length+' items'});
 content.querySelector('.up-folder').onclick=()=>{close(w.id);explorer(path==='root'?'root':path==='c'?'root':'c');};
 listing.forEach(item=>{const b=icon(item,'file');if(item.id==='file'){b.addEventListener('dblclick',()=>item.file?openAssignment(item):makeWindow(item.title,'<div class="welcome">Not yet published.</div>'));}if(matchMedia('(pointer:coarse)').matches){b.addEventListener('click',()=>item.id==='file'?(item.file?openAssignment(item):makeWindow(item.title,'<div class="welcome">Not yet published.</div>')):launch(item.id));}content.querySelector('.folder-list').append(b);});
}
async function openAssignment(item){
 const w=makeWindow(item.title,'<div class="welcome">Loading Markdown report…</div>',{status:item.file});
 try{const r=await fetch('./'+encodeURIComponent(item.file),{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);if(!window.marked||!window.DOMPurify)throw Error('Markdown libraries unavailable');const markdown=await r.text();if(!w.el.isConnected)return;
 w.body.innerHTML='<article class="doc-wrap">'+DOMPurify.sanitize(marked.parse(markdown),{USE_PROFILES:{html:true}})+'</article>';
 w.body.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}});
 }catch(e){if(w.el.isConnected)w.body.innerHTML='<div class="welcome">Unable to load '+esc(item.file)+': '+esc(e.message)+'</div>';}
}
function dos(){
 const content=document.createElement('div');content.className='dos';
 content.innerHTML='<div class="dos-output">Microsoft(R) MS-DOS 6.22 (simulated)\nCYBER/LAB 2026\nType HELP for commands.\n\n</div><form class="dos-inputline"><span>C:\\&gt;</span><input aria-label="DOS command" autocomplete="off" spellcheck="false"></form>';
 const output=content.querySelector('.dos-output'),input=content.querySelector('input');
 const w=makeWindow('MS-DOS Prompt',content,{width:'620px',status:'Simulated command interpreter'});
 content.querySelector('form').onsubmit=e=>{e.preventDefault();const original=input.value.trim(),cmd=original.toUpperCase();input.value='';if(!original)return;if(cmd==='CLS'){output.textContent='';return;}if(cmd==='EXIT'){close(w.id);return;}
 const commands={HELP:'HELP DIR CLS CD TYPE VER DATE TIME ECHO WHOAMI ABOUT EXIT',DIR:' Directory of C:\\\n ASSIGNMENTS  <DIR>\n DOCUMENTS    <DIR>\n PROGRAMS     <DIR>\n README.TXT',VER:'MS-DOS 6.22 · CYBER/LAB simulated',WHOAMI:'MARCO\\CYBER-LAB',ABOUT:'Cyber Security 2026 · Haaga-Helia','TYPE README.TXT':'Welcome to CYBER/LAB OS 95. Open My Computer for assignments.'};
 let result=commands[cmd];if(cmd.startsWith('ECHO '))result=original.slice(5);if(cmd.startsWith('CD '))result='Navigate with My Computer.';if(cmd==='DATE')result=new Date().toLocaleDateString('fi-FI');if(cmd==='TIME')result=new Date().toLocaleTimeString('fi-FI');
 output.textContent+='C:\\> '+original+'\n'+(result||'Bad command or file name')+'\n\n';content.scrollTop=content.scrollHeight;};input.focus();
}
function notepad(){
 const wrapper=document.createElement('div');wrapper.className='notepad';wrapper.innerHTML='<div class="toolbar"><button class="button95">Save</button> <button class="button95">Download .txt</button></div><textarea aria-label="Notepad content" placeholder="Write here…"></textarea>';
 const area=wrapper.querySelector('textarea');try{area.value=localStorage.getItem('cyberlab-win95-notepad')||'';}catch{}
 const w=makeWindow('Untitled - Notepad',wrapper,{status:'Browser-local notes'});
 wrapper.querySelectorAll('button')[0].onclick=()=>{try{localStorage.setItem('cyberlab-win95-notepad',area.value);w.el.querySelector('.window-status').textContent='Saved';}catch{w.el.querySelector('.window-status').textContent='Saving unavailable';}};
 wrapper.querySelectorAll('button')[1].onclick=()=>{const url=URL.createObjectURL(new Blob([area.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='cyberlab-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};area.focus();
}
function presentation(){const frame=document.createElement('iframe');frame.title='Cybersecurity in Hospitals';frame.className='presentation-frame';frame.src='./hospital-cybersecurity.html';const w=makeWindow('Cybersecurity Presentation',frame,{status:'hospital-cybersecurity.html',width:'850px',height:'580px'});w.el.classList.add('maximized');}
function arcade(){const c=document.createElement('div');c.className='arcade-wrap';c.innerHTML='<div>Select ▦ TETRIS in the embedded portfolio sidebar to play.</div>';const frame=document.createElement('iframe');frame.className='arcade-frame';frame.title='Tetris 2.0';frame.src='./index.html#home';c.append(frame);makeWindow('Arcade - Tetris 2.0',c,{status:'Tetris in portfolio',width:'850px',height:'580px'});}
function cyber(){
 const p=document.createElement('div');p.className='welcome';p.innerHTML='<h2>Cyber Tools</h2><p>Base64 is encoding, not encryption.</p><label>Input<textarea id="ct-input" style="display:block;width:100%;height:90px"></textarea></label><p><button class="button95" id="ct-enc">Encode Base64</button> <button class="button95" id="ct-dec">Decode Base64</button></p><label>Output<textarea readonly id="ct-output" style="display:block;width:100%;height:90px"></textarea></label>';
 makeWindow('Cyber Tools',p);const input=p.querySelector('#ct-input'),out=p.querySelector('#ct-output');
 p.querySelector('#ct-enc').onclick=()=>{try{const data=new TextEncoder().encode(input.value);out.value=btoa(Array.from(data,b=>String.fromCharCode(b)).join(''));}catch{out.value='Encoding error';}};
 p.querySelector('#ct-dec').onclick=()=>{try{out.value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(input.value.trim()),c=>c.charCodeAt(0)));}catch{out.value='Invalid Base64';}};
}
function launch(id){
 if(id==='back')return back();
 if(['computer','root','c','assign','docs','programs'].includes(id))return explorer(id==='computer'?'root':id);
 if(id==='presentation')return presentation();if(id==='arcade')return arcade();if(id==='dos')return dos();if(id==='notepad')return notepad();if(id==='cyber')return cyber();
 if(id==='recycle')return makeWindow('Recycle Bin','<div class="welcome">Recycle Bin is empty.</div>');
 if(id==='about')return makeWindow('About Cyber/Lab','<div class="welcome"><h2>Cyber/Lab OS 95</h2><p>Interactive retro desktop for Marco Brandt’s Cyber Security 2026 portfolio.</p><p>Browser simulation, not an actual operating system.</p></div>');
}
})();