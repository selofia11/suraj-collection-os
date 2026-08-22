
const $=s=>document.querySelector(s);
let DATA,BASE=[],view="home",player=null,filter="All",selectedPlayer="All",collapsed={},modal=null,addMode="owned";
const LOCAL_KEY="scv_owned_local",WATCH_KEY="scv_watch_local",IMG_DB="SurajsCardVaultImages";
const OVERRIDE_KEY="scv_master_override",SYNC_KEY="scv_last_sync";
const overrideMaster=()=>JSON.parse(localStorage.getItem(OVERRIDE_KEY)||"null");
function effectiveBase(){return overrideMaster()||BASE}
const fmt=n=>"£"+Number(n||0).toLocaleString("en-GB",{maximumFractionDigits:0});
const initials=p=>(p||"?").split(" ").map(x=>x[0]).join("").slice(0,2);
const localOwned=()=>JSON.parse(localStorage.getItem(LOCAL_KEY)||"[]");
const localWatch=()=>JSON.parse(localStorage.getItem(WATCH_KEY)||"[]");
const cards=()=>[...effectiveBase(),...localOwned()];
function val(c){return Number(c.current_value??c.paid??0)}
function prev(c){return Number(c.previous_value??c.current_value??c.paid??0)}
function trend(c){let a=val(c),b=prev(c);if(a>b)return {sym:"▲",cls:"up",pct:b?((a-b)/b*100):0};if(a<b)return {sym:"▼",cls:"down",pct:b?((a-b)/b*100):0};return {sym:"→",cls:"flat",pct:0}}
function stars(n){n=Number(n||3);return "★".repeat(Math.max(0,Math.min(5,n)))+"☆".repeat(Math.max(0,5-n))}
function safeImg(c,cls="miniArt"){
  const src=c.local_image||c.image;
  if(!src)return `<div class="${cls}"><span>${initials(c.player)}</span></div>`;
  return `<div class="${cls}"><img src="${src}" alt="" loading="lazy" onerror="this.remove();this.parentElement.innerHTML='<span>${initials(c.player)}</span>'"></div>`;
}
function score(c){
  let s=50;
  if(c.year_type==="Rookie")s+=10;
  if(c.grader==="PSA"&&String(c.grade)==="10")s+=10;
  if(c.crown)s+=8;
  s+=Math.min(10,Number(c.conviction||0));
  s+=Math.min(7,Number(c.moat||0)*.7);
  if(c.serial||/\/\d+/.test(c.parallel||""))s+=5;
  return Math.min(99,Math.round(s));
}
fetch("cards.json?v=260").then(r=>{
  if(!r.ok) throw new Error("cards.json "+r.status);
  return r.json()
}).then(d=>{
  DATA=d;BASE=d.cards||[];render();
}).catch(err=>{
  console.error(err);
  document.querySelector("#app").innerHTML=`<div style="padding:40px;color:white;font-family:-apple-system"><h1>Suraj’s Card Vault</h1><p>Build 2.6 loaded, but collection data could not load.</p><pre style="white-space:pre-wrap;color:#9fb0c7">${String(err)}</pre></div>`;
});

function calc(){
 const c=cards(),players=[...new Set(c.map(x=>x.player))],psa=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10").length,raw=c.filter(x=>String(x.grade).toLowerCase()==="raw"||!x.grader).length,crown=c.filter(x=>x.crown).length;
 return {c,players,psa,raw,crown,value:c.reduce((a,x)=>a+val(x),0)};
}
function header(){let s=localStorage.getItem(SYNC_KEY)||"Not synced yet";return `<div class=top><div><div class=eyebrow>Collection intelligence</div><div class=brand>Suraj’s Card Vault</div><div class=sub>${cards().length} owned · build 2.6</div><div class=sub>Last GitHub sync: ${s}</div></div><button class=iconbtn onclick="openTools()">⋯</button></div>`}
function nav(){return `<div class=bottom><button class="${view==="home"?"on":""}" onclick="go('home')"><b>⌂</b>Home</button><button class="${view==="vault"||view==="player"?"on":""}" onclick="go('vault')"><b>◇</b>Vault</button><button class="${view==="insights"?"on":""}" onclick="go('insights')"><b>◫</b>Insights</button><button class="${view==="sniper"?"on":""}" onclick="go('sniper')"><b>◎</b>Sniper</button></div>`}
window.go=v=>{view=v;player=null;modal=null;render();scrollTo(0,0)};
window.openPlayer=p=>{player=p;view="player";render();scrollTo(0,0)};
window.openCard=id=>{modal=cards().find(x=>x.id===id)||localWatch().find(x=>x.id===id);render()};
window.closeModal=()=>{modal=null;render()};

function home(){
 const s=calc(),j=s.c.filter(x=>x.crown).sort((a,b)=>score(b)-score(a)).slice(0,8);
 return `<div class=hero><div class=eyebrow>Collection dashboard</div><h1>Premium cards, tracked visually.</h1><p>This recovery build keeps the proven 2.4.1 foundation and adds lightweight thumbnails that cannot stop the app from loading.</p><div class=metricGrid>
 <button class=metricBtn onclick="go('vault')"><small>Portfolio value</small><b>${fmt(s.value)}</b><div class=micro>Open master list</div></button>
 <button class=metricBtn onclick="go('vault')"><small>Unique holdings</small><b>${s.c.length}</b><div class=micro>Open master list</div></button>
 <button class=metricBtn onclick="filterJump('PSA 10')"><small>PSA 10</small><b>${s.psa}</b><div class=micro>Filter Vault</div></button>
 <button class=metricBtn onclick="filterJump('Crown')"><small>Crown jewels</small><b>${s.crown}</b><div class=micro>Open high-conviction list</div></button></div></div>
 <div class=sectionHead><h2>Crown Jewels</h2><span>real thumbnails</span></div><div class=crownList>${j.map(c=>{let t=trend(c);return `<button class=crownRow onclick="openCard('${c.id}')">${safeImg(c,"crownMini")}<div class=crownInfo><div class=stars>${stars(c.stars||3)} <span class=scoreBadge>${score(c)}</span></div><h3>${c.player} · ${c.parallel}</h3><p>${c.set} ${c.card_no||""}<br>${c.grader?c.grader+" ":""}${c.grade}</p></div><div class=crownValue><b>${fmt(val(c))}</b><span class="trend ${t.cls}">${t.sym} ${Math.abs(t.pct).toFixed(1)}%</span></div></button>`}).join("")}</div>`;
}
window.filterJump=f=>{filter=f;view="vault";render();scrollTo(0,0)}

function row(c){let t=trend(c);return `<button class=cardRow onclick="openCard('${c.id}')">${safeImg(c)}<div><h3>${c.parallel} ${c.card_no||""}</h3><p>${c.set}</p><p>${c.grader?c.grader+" "+c.grade:c.grade} ${c.serial?" · "+c.serial:""}</p><div class=stars>${stars(c.stars||3)}</div></div><div class=cardValue><span class=scoreBadge>${score(c)}</span><b>${fmt(val(c))}</b><span class="trend ${t.cls}">${t.sym}</span></div></button>`}

function galleryCard(c){return `<button class=galleryCard onclick="openCard('${c.id}')">${safeImg(c,"galleryImg")}<div class=galleryMeta><div class=stars>${stars(c.stars||3)}</div><b>${c.player}</b><span>${c.parallel} ${c.card_no||""}</span><small>${c.grader?c.grader+" "+c.grade:c.grade} · ${fmt(val(c))} · Score ${score(c)}</small></div></button>`}

function filteredCards(){
 let c=cards();
 if(filter==="PSA 10")c=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10");
 if(filter==="Rookie")c=c.filter(x=>x.year_type==="Rookie");
 if(filter==="Raw")c=c.filter(x=>String(x.grade).toLowerCase()==="raw"||!x.grader);
 if(filter==="Numbered")c=c.filter(x=>x.serial||/\/\d+/.test(x.parallel||""));
 if(filter==="Crown")c=c.filter(x=>x.crown);
 if(selectedPlayer!=="All")c=c.filter(x=>x.player===selectedPlayer);
 return c;
}
function vault(){
 let c=filteredCards(),players=[...new Set(cards().map(x=>x.player))],groups=[...new Set(c.map(x=>x.player))];
 return `<div class=vaultTop><div><div class=eyebrow>Visual collection</div><h1>Vault</h1></div><button class=iconbtn onclick="toggleVaultMode()">${localStorage.getItem("scv_mode")==="list"?"Gallery":"List"}</button></div>
 <input class=search placeholder="Search player, set, cert, parallel…" oninput="vaultSearch(this.value)">
 <div class=chips>${["All","PSA 10","Rookie","Raw","Numbered","Crown"].map(x=>`<button class="chip ${filter===x?"on":""}" onclick="setFilter('${x}')">${x}</button>`).join("")}</div>
 <div class=playerBar>${["All",...players].map(p=>`<button class="playerPick ${selectedPlayer===p?"on":""}" onclick="setPlayer('${p.replaceAll("'","\\'")}')">${p}</button>`).join("")}</div>
 ${localStorage.getItem("scv_mode")==="list"?`<div class=vaultControls><button onclick="expandAll()">Expand all</button><button onclick="collapseAll()">Collapse all</button></div><div id=vaultList>${groups.map(p=>groupHtml(p,c.filter(x=>x.player===p))).join("")}</div>`:`<div id=vaultList class=galleryGrid>${c.map(galleryCard).join("")}</div>`}`;
}
window.toggleVaultMode=()=>{localStorage.setItem("scv_mode",localStorage.getItem("scv_mode")==="list"?"gallery":"list");render()}
function groupHtml(p,c){let is=collapsed[p];return `<div class=group><button class=groupHead onclick="toggleGroup('${p.replaceAll("'","\\'")}')"><div><b>${p}</b><br><span>${c.length} cards · ${fmt(c.reduce((a,x)=>a+val(x),0))}</span></div><b>${is?"＋":"−"}</b></button>${is?"":`<div class=list>${c.map(row).join("")}</div>`}</div>`}
window.toggleGroup=p=>{collapsed[p]=!collapsed[p];render()};
window.expandAll=()=>{[...new Set(filteredCards().map(x=>x.player))].forEach(p=>collapsed[p]=false);render()};
window.collapseAll=()=>{[...new Set(filteredCards().map(x=>x.player))].forEach(p=>collapsed[p]=true);render()};
window.setFilter=x=>{filter=x;render()};
window.setPlayer=p=>{selectedPlayer=p;render()};
window.vaultSearch=q=>{q=q.toLowerCase();let c=cards().filter(x=>JSON.stringify(x).toLowerCase().includes(q));$("#vaultList").innerHTML=localStorage.getItem("scv_mode")==="list"?[...new Set(c.map(x=>x.player))].map(p=>groupHtml(p,c.filter(x=>x.player===p))).join(""):c.map(galleryCard).join("")}

function playerPage(){let c=cards().filter(x=>x.player===player).sort((a,b)=>score(b)-score(a)),v=c.reduce((a,x)=>a+val(x),0),psa=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10").length,best=c[0],avg=Math.round(c.reduce((a,x)=>a+score(x),0)/Math.max(1,c.length));return `<button class=back onclick="go('vault')">← Vault</button><div class=playerHero><div class=eyebrow>${c[0]?.sport||""}</div><h1>${player}</h1><div class=sub>${c.length} holdings · visual player dashboard</div><div class=detailMetrics><div class=dmetric><small>Tracked value</small><b>${fmt(v)}</b></div><div class=dmetric><small>Avg score</small><b>${avg}</b></div><div class=dmetric><small>PSA 10</small><b>${psa}</b></div></div></div>${best?`<div class=bestCard onclick="openCard('${best.id}')"><div><div class=eyebrow>Highest ranked holding</div><h2>${best.parallel} ${best.card_no||""}</h2><p>Score ${score(best)} · Conviction ${best.conviction||"—"}/10</p></div><span>›</span></div>`:""}<div class=sectionHead><h2>Card gallery</h2><span>${c.length} holdings</span></div><div class=galleryGrid>${c.map(galleryCard).join("")}</div>`}

function insights(){
 let c=cards(),rook=Math.round(c.filter(x=>x.year_type==="Rookie").length/c.length*100),psa=Math.round(c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10").length/c.length*100),raw=Math.round(c.filter(x=>String(x.grade).toLowerCase()==="raw"||!x.grader).length/c.length*100),numbered=Math.round(c.filter(x=>x.serial||/\/\d+/.test(x.parallel||"")).length/c.length*100);
 return `<div class=hero><div class=eyebrow>Collection intelligence</div><h1>What the portfolio is telling you.</h1><p>Scores use rookie status, grade, Crown Jewel status, conviction, moat and scarcity.</p></div><div class=insightGrid><div class=insight><small>Rookie exposure</small><b>${rook}%</b></div><div class=insight><small>PSA 10 share</small><b>${psa}%</b></div><div class=insight><small>Raw share</small><b>${raw}%</b></div><div class=insight><small>Numbered</small><b>${numbered}%</b></div></div><div class=sectionHead><h2>Top holdings</h2><span>by score</span></div><div class=list>${[...c].sort((a,b)=>score(b)-score(a)).slice(0,5).map(row).join("")}</div>`;
}
function sniper(){let w=localWatch();return `<div class=hero><div class=eyebrow>Watchlist</div><h1>Sniper board</h1><p>Cards here are watched, not owned.</p></div><div class=sectionHead><h2>Core targets</h2></div>${(DATA.sniper||[]).map(x=>{let q=encodeURIComponent(x.ebay_query||x.target);return `<div class=sniper><h3>${x.target}</h3><p>${x.reason}</p><div class=max>Max ${fmt(x.max)} · ${x.priority}</div><div class=links><a target=_blank href="https://www.ebay.co.uk/sch/i.html?_nkw=${q}">Search eBay</a></div></div>`}).join("")}<div class=sectionHead><h2>Your watch cards</h2><span>${w.length}</span></div><div class=list>${w.map(row).join("")}</div>`}

function detail(c){let src=c.local_image||c.image;return `<div class=modalWrap onclick="closeModal()"><div class=sheet onclick="event.stopPropagation()"><button class=iconbtn style="float:right" onclick="closeModal()">✕</button><div class=eyebrow>${c.crown?"Crown Jewel":(c.tier||"Holding")}</div><h1>${c.player}</h1><div class=sub>${c.set}</div><div class=bigArt>${src?`<img src="${src}" onerror="this.remove();this.parentElement.innerHTML='<div class=monogram>${initials(c.player)}</div>'">`:`<div class=monogram>${initials(c.player)}</div>`}</div><h2>${c.parallel} ${c.card_no||""}</h2><div class=detailGrid><div><small>Vault Score</small><b>${score(c)}/100</b></div><div><small>Current value</small><b>${fmt(val(c))}</b></div><div><small>Paid</small><b>${fmt(c.paid)}</b></div><div><small>Grade</small><b>${c.grader?c.grader+" ":""}${c.grade}</b></div><div><small>PSA total pop</small><b>${c.population||"Not synced"}</b></div><div><small>PSA cert</small><b>${c.cert||"—"}</b></div><div><small>Serial</small><b>${c.serial||"—"}</b></div><div><small>Conviction</small><b>${c.conviction||"—"}/10</b></div></div><div class=thesis><small>Card insight</small><p>${c.why||c.thesis||"No thesis recorded yet."}</p></div></div></div>`}

window.addCard=()=>{addMode=view==="sniper"?"watch":"owned";modal={add:true};render()}
function addForm(){return `<div class=modalWrap onclick="closeModal()"><form class="sheet form" onclick="event.stopPropagation()" onsubmit="saveAdd(event)"><button type=button class=iconbtn style="float:right" onclick="closeModal()">✕</button><div class=eyebrow>${addMode==="watch"?"Watch card":"Owned card"}</div><h1>${addMode==="watch"?"Add to Sniper":"Add to Vault"}</h1><label>Player</label><input name=player required><label>Set</label><input name=set required><label>Parallel / card</label><input name=parallel required><label>Grade</label><input name=grade placeholder="PSA 10 / Raw"><label>Value (£)</label><input name=current type=number step=.01><label>Paid (£)</label><input name=paid type=number step=.01><button class=save>Save</button></form></div>`}
window.saveAdd=e=>{e.preventDefault();let f=new FormData(e.target),id=(addMode==="watch"?"WATCH-":"LOCAL-")+Date.now(),obj={id,player:f.get("player"),sport:"",set:f.get("set"),card_no:"",parallel:f.get("parallel"),year_type:"Rookie",grade:f.get("grade")||"Raw",grader:(f.get("grade")||"").toUpperCase().includes("PSA")?"PSA":"",cert:"",paid:+f.get("paid")||0,current_value:+f.get("current")||(+f.get("paid")||0),status:addMode==="watch"?"Watch":"Hold",tier:addMode==="watch"?"Watch":"Growth",investment_grade:"",conviction:7,moat:6,crown:false,population:null,serial:"",why:addMode==="watch"?"Watching, not owned":"Added in app",stars:3};let key=addMode==="watch"?WATCH_KEY:LOCAL_KEY,a=JSON.parse(localStorage.getItem(key)||"[]");a.push(obj);localStorage.setItem(key,JSON.stringify(a));modal=null;render()}

window.openTools=()=>{modal={tools:true};render()}
function toolsSheet(){return `<div class=modalWrap onclick="closeModal()"><div class=sheet onclick="event.stopPropagation()"><button class=iconbtn style="float:right" onclick="closeModal()">✕</button><div class=eyebrow>GitHub master workflow</div><h1>Sync & Backup</h1><div class=market><b>Export Master</b><p>Combines GitHub master with cards added on this iPhone.</p><button class=save onclick="exportMaster()">Export cards.json</button></div><div class=market><b>Mark synced</b><button class=save onclick="markSynced()">Mark GitHub as synced</button></div></div></div>`}
window.exportMaster=()=>{let merged=[...cards()];let payload={...DATA,version:"2.6-export",cards:merged,owned_count:merged.length,exported_at:new Date().toISOString()};let blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cards.json";document.body.appendChild(a);a.click();a.remove()}
window.markSynced=()=>{localStorage.setItem(SYNC_KEY,new Date().toLocaleString("en-GB"));localStorage.removeItem(LOCAL_KEY);modal=null;render()}

function render(){
 if(!DATA)return;
 let body=view==="home"?home():view==="vault"?vault():view==="player"?playerPage():view==="insights"?insights():sniper();
 $("#app").innerHTML=`<div class=shell>${header()}${body}<button class=fab onclick="addCard()">+</button>${nav()}</div>`+(modal?(modal.add?addForm():modal.tools?toolsSheet():detail(modal)):"");
}
