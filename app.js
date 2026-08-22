
const $=s=>document.querySelector(s); let BASE=[], view="home", player=null, activeFilter="All", modal=null;
const custom=()=>JSON.parse(localStorage.getItem("cv_custom")||"[]");
const cards=()=>[...BASE,...custom()];
const fmt=n=>"£"+Number(n||0).toLocaleString("en-GB",{maximumFractionDigits:0});
fetch("cards.json?v=11").then(r=>r.json()).then(d=>{BASE=d.cards; window.SNIPER=d.sniper; render();});
function stats(){
 const c=cards(), players=[...new Set(c.map(x=>x.player))];
 const cost=c.reduce((a,x)=>a+(Number(x.paid)||0),0);
 const psa10=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10").length;
 const rook=c.filter(x=>x.year_type==="Rookie").length;
 const numbered=c.filter(x=>x.serial||/\/\d+/.test(x.parallel||"")).length;
 const crowns=c.filter(x=>x.crown).length;
 let score=Math.round(Math.min(100,55+(psa10/c.length)*18+(rook/c.length)*12+(numbered/c.length)*10+(crowns/c.length)*10));
 return {c,players,cost,psa10,rook,numbered,crowns,score};
}
function topbar(){return `<div class=top><div><div class=eyebrow>Private Collection</div><div class=brand>Card Vault</div><div class=sub>Updated 22 Aug 2026</div></div><button class=iconbtn onclick="openSearch()">⌕</button></div>`}
function bottom(){return `<div class=bottom>
<button class="${view==="home"?"on":""}" onclick="go('home')"><b>⌂</b>Home</button>
<button class="${view==="vault"||view==="player"?"on":""}" onclick="go('vault')"><b>◇</b>Vault</button>
<button class="${view==="insights"?"on":""}" onclick="go('insights')"><b>◫</b>Insights</button>
<button class="${view==="sniper"?"on":""}" onclick="go('sniper')"><b>◎</b>Sniper</button></div>`}
window.go=v=>{view=v;player=null;render(); scrollTo(0,0)};
window.openPlayer=p=>{player=p;view="player";render();scrollTo(0,0)};
window.openCard=id=>{modal=cards().find(x=>x.id===id);render()};
window.closeModal=()=>{modal=null;render()};
function home(){
 const s=stats(); const crown=s.c.filter(x=>x.crown).sort((a,b)=>(b.conviction||0)-(a.conviction||0)).slice(0,5);
 return `<div class=hero><div class=eyebrow>Portfolio quality</div><div class=score>${s.score}<small>/100</small></div><h2>${s.c.length} cards. ${s.crowns} crown jewels.</h2><div class=stats>
 <div class=stat><span>Cost basis</span><b>${fmt(s.cost)}</b></div><div class=stat><span>PSA 10s</span><b>${s.psa10}</b></div>
 <div class=stat><span>Rookie cards</span><b>${s.rook}</b></div><div class=stat><span>Numbered</span><b>${s.numbered}</b></div></div></div>
 <div class=sectionTitle><h3>Crown Jewels</h3><span>Swipe</span></div><div class=featuredRow>${crown.map((x,i)=>`<button class=feature onclick="openCard('${x.id}')"><div class=rank>#${i+1} • ${x.player}</div><h4>${x.parallel} ${x.card_no||""}</h4><p>${x.set} · ${x.grader?x.grader+" ":""}${x.grade}</p></button>`).join("")}</div>
 <div class=sectionTitle><h3>Collection</h3><span>${s.players.length} players</span></div><div class=playerGrid>${s.players.map(p=>{let pc=s.c.filter(x=>x.player===p);return `<button class=playerTile onclick="openPlayer('${p.replaceAll("'","\\'")}')"><small>${pc[0]?.sport||""}</small><b>${p}</b><span class=count>${pc.length}</span><small> cards</small></button>`}).join("")}</div>`;
}
function vault(){
 const c=cards(); let filtered=c;
 if(activeFilter==="PSA 10") filtered=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10");
 if(activeFilter==="Rookie") filtered=c.filter(x=>x.year_type==="Rookie");
 if(activeFilter==="Numbered") filtered=c.filter(x=>x.serial||/\/\d+/.test(x.parallel||""));
 if(activeFilter==="Crown") filtered=c.filter(x=>x.crown);
 return `<input class=search placeholder="Search player, set, parallel…" oninput="searchVault(this.value)">
 <div class=chips>${["All","PSA 10","Rookie","Numbered","Crown"].map(x=>`<button class="chip ${activeFilter===x?"on":""}" onclick="filterVault('${x}')">${x}</button>`).join("")}</div>
 <div id=vaultList class=cardList>${filtered.map(cardRow).join("")}</div>`;
}
window.filterVault=x=>{activeFilter=x;render()};
window.searchVault=q=>{q=q.toLowerCase(); $("#vaultList").innerHTML=cards().filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(cardRow).join("")};
function initials(p){return p.split(" ").map(x=>x[0]).join("").slice(0,2)}
function cardRow(x){return `<button class=cardRow onclick="openCard('${x.id}')"><div class=thumb>${initials(x.player)}</div><div><h4>${x.player} · ${x.parallel}</h4><p>${x.set} ${x.card_no||""}</p><p>${x.grader?x.grader+" "+x.grade:x.grade} ${x.serial?" · "+x.serial:""}</p></div><span class="pill ${x.crown?"crown":""}">${x.crown?"★":"›"}</span></button>`}
function playerPage(){
 let c=cards().filter(x=>x.player===player), cost=c.reduce((a,x)=>a+(x.paid||0),0), psa=c.filter(x=>x.grader==="PSA"&&String(x.grade)==="10").length;
 return `<button class=back onclick="go('vault')">← Vault</button><div class=sectionTitle><h3>${player}</h3><span>${c.length} cards</span></div>
 <div class=analyticsGrid><div class=insight><span>Cost basis</span><b>${fmt(cost)}</b></div><div class=insight><span>PSA 10</span><b>${psa}</b></div></div>
 <div class=cardList style="margin-top:14px">${c.sort((a,b)=>(a.importance||99)-(b.importance||99)).map(cardRow).join("")}</div>`;
}
function insights(){
 const s=stats(), by={}; s.c.forEach(x=>by[x.player]=(by[x.player]||0)+1); let max=Math.max(...Object.values(by));
 let top=[...s.c].sort((a,b)=>(b.conviction||0)-(a.conviction||0)||((b.moat||0)-(a.moat||0))).slice(0,3);
 return `<div class=hero><div class=eyebrow>Portfolio intelligence</div><h2>Strong rookie concentration with premium-grade bias.</h2><p class=sub>${Math.round(s.rook/s.c.length*100)}% rookie cards · ${Math.round(s.psa10/s.c.length*100)}% PSA 10 · ${s.numbered} numbered cards.</p></div>
 <div class=sectionTitle><h3>Player concentration</h3><span>${s.c.length} cards</span></div>${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([p,n])=>`<div class=insight style="margin-bottom:9px"><span>${p}</span><b>${n} cards</b><div class=bar><i style="width:${n/max*100}%"></i></div></div>`).join("")}
 <div class=sectionTitle><h3>Highest conviction</h3></div><div class=cardList>${top.map(cardRow).join("")}</div>
 <div class=sectionTitle><h3>Data health</h3></div><div class=insight><span>Needs reconciliation</span><b>Wemby / Ohtani</b><p class=sub>Your current master workbook has empty player tabs for these. We should import them from PSA or your older workbook instead of inventing records.</p></div>`;
}
function sniper(){return `<div class=hero><div class=eyebrow>Acquisition discipline</div><h2>Sniper</h2><p class=sub>Targets where we wait for price, scarcity and portfolio fit to align.</p></div><div class=sectionTitle><h3>Active targets</h3></div>${(window.SNIPER||[]).map(x=>`<div class=sniperCard><h4>${x.target}</h4><p>${x.priority} priority</p><div class=max>Max ${fmt(x.max)}</div></div>`).join("")}`}
function detail(x){
 return `<div class=sheetWrap onclick="closeModal()"><div class=sheet onclick="event.stopPropagation()"><button class=iconbtn style="float:right" onclick="closeModal()">✕</button>
 <div class=eyebrow>${x.crown?"Crown Jewel":"Owned"}</div><h2>${x.player}</h2><div class=sub>${x.set}</div>
 <div class=detailHero>${initials(x.player)}</div><h3>${x.parallel} ${x.card_no||""}</h3>
 <div class=kv><div><small>Grade</small><b>${x.grader?x.grader+" ":""}${x.grade}</b></div><div><small>Paid</small><b>${fmt(x.paid)}</b></div><div><small>Serial</small><b>${x.serial||"—"}</b></div><div><small>Year</small><b>${x.year_type}</b></div><div><small>Conviction</small><b>${x.conviction||"—"}/10</b></div><div><small>Cert</small><b>${x.cert||"—"}</b></div></div>
 <p class=sub style="margin-top:14px">${x.notes||""}</p><div class=actions><button onclick="editCustom('${x.id}')">Edit</button>${x.id.startsWith("CUSTOM")?`<button class=danger onclick="deleteCustom('${x.id}')">Delete</button>`:""}</div></div></div>`;
}
window.addCard=()=>{modal={__add:true};render()};
function addSheet(){return `<div class=sheetWrap onclick="closeModal()"><form class=sheet onclick="event.stopPropagation()" onsubmit="saveAdd(event)"><button type=button class=iconbtn style="float:right" onclick="closeModal()">✕</button><div class=eyebrow>Add to collection</div><h2>New Card</h2>
<label>Player</label><input name=player required><label>Set</label><input name=set required><label>Card / Parallel</label><input name=parallel required><label>Grade</label><input name=grade placeholder="PSA 10 or Raw"><label>Purchase price (£)</label><input name=paid type=number step=.01><label>Serial number</label><input name=serial placeholder="22/99"><button class=save>Add card</button></form></div>`}
window.saveAdd=e=>{e.preventDefault();let f=new FormData(e.target), arr=custom();arr.push({id:"CUSTOM-"+Date.now(),player:f.get("player"),sport:"",set:f.get("set"),card_no:"",parallel:f.get("parallel"),year_type:"Rookie",grade:f.get("grade")||"Raw",grader:(f.get("grade")||"").toUpperCase().includes("PSA")?"PSA":"",cert:"",paid:Number(f.get("paid")||0),status:"Hold",tier:"Growth",investment_grade:"",conviction:7,moat:6,crown:false,serial:f.get("serial"),notes:"Added in Card Vault"});localStorage.setItem("cv_custom",JSON.stringify(arr));modal=null;render()}
window.deleteCustom=id=>{let arr=custom().filter(x=>x.id!==id);localStorage.setItem("cv_custom",JSON.stringify(arr));modal=null;render()}
window.editCustom=id=>{alert("Core master records are read-only in this version. Locally added cards can be deleted/re-added. GitHub/PSA sync comes next.")};
window.openSearch=()=>{view="vault";render();setTimeout(()=>$(".search")?.focus(),50)}
function render(){let content=view==="home"?home():view==="vault"?vault():view==="player"?playerPage():view==="insights"?insights():sniper();$("#app").innerHTML=`<div class=shell>${topbar()}${content}<button class=fab onclick="addCard()">+</button>${bottom()}</div>`+(modal?(modal.__add?addSheet():detail(modal)):"")}
