/* ============ STATE ============ */
const DEFAULTS={
  v:1,
  people:[
    {name:'Igor',sex:'m',age:35,ft:5,in:10,lb:185,goalLb:0,act:1.55,def:0.15,pf:1.8,example:true},
    {name:'Wife',sex:'f',age:33,ft:5,in:5,lb:145,goalLb:0,act:1.55,def:0.15,pf:1.8,example:true}
  ],
  plan:{
    b1:{breakfast:'oats',lunch:'burrito',dinner:'salmon',snack:'yogurt'},
    b2:{breakfast:'hash',lunch:'bulgogi',dinner:'meatballs',snack:'shake'}
  },
  swaps:{}, // key `${block}.${slot}` -> {C:id,P:id}
  skiHours:5,
  startDate:'2026-10-05',
  pantry:{}, unit:'lb', store:'mix', monthStart:'2026-10-04', shopSel:'cur', staples:{}, wswaps:{},
  ui:'aurora', log:{}, tlog:{}, tfreq:3, tlevel:{}, tplace:{def:'gym',d:{}}, meals:4, sunday:false, photos:{},
  train:{} // `${week}.${person}.${session}` -> true
};
let S=clone(DEFAULTS);
function clone(o){return JSON.parse(JSON.stringify(o))}
function merge(base,over){const out=clone(base);for(const k in over){if(over[k]&&typeof over[k]==='object'&&!Array.isArray(over[k])&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))out[k]=merge(base[k],over[k]);else out[k]=over[k];}return out}

/* ============ MATH ============ */
const r5=x=>Math.round(x/5)*5, r0=Math.round, r1=x=>Math.round(x*10)/10;
function targets(pp){
  const kg=pp.lb*0.45359, cm=(pp.ft*12+ +pp.in)*2.54;
  const bmr=10*kg+6.25*cm-5*pp.age+(pp.sex==='m'?5:-161);
  const tdee=bmr*pp.act, aggr=pp.def>=0.25;
  /* Aggressive cut: 25% deficit, but never below BMR or 1,500 (men) / 1,200 (women) kcal. */
  let kcal=Math.round(tdee*(1-pp.def)/10)*10, floored=false;
  if(aggr){const floor=Math.max(bmr,pp.sex==='m'?1500:1200);if(kcal<floor){kcal=Math.round(floor/10)*10;floored=true}}
  const protKg=pp.goalLb>0?pp.goalLb*0.45359:kg;
  /* Bigger deficits need more protein to protect muscle: at least 2.2 g/kg in aggressive mode. */
  const p=Math.round((aggr?Math.max(pp.pf,2.2):pp.pf)*protKg);
  /* Aggressive mode lowers the fat floor (0.6 g/kg, ≥20% of calories) so carbs stay available for training. */
  const f=Math.round(aggr?Math.max(0.6*kg,0.2*kcal/9):Math.max(0.8*kg,0.25*kcal/9));
  const c=Math.max(0,Math.round((kcal-p*4-f*9)/4));
  const fib=Math.round(kcal/1000*14);
  // ski day: downhill skiing ~5.3 MET during active time (~50% of the day on the hill)
  const skiExtra=Math.round((5.3-1)*kg*(S.skiHours*0.5)/10)*10;
  const lbWeek=(tdee-kcal)*7/3500, pctWeek=lbWeek/pp.lb*100;
  return {kg,bmr:Math.round(bmr),tdee:Math.round(tdee),kcal,p,c,f,fib,skiExtra,aggr,floored,lbWeek,pctWeek,
    ski:(()=>{const add=Math.max(0,tdee-kcal)+skiExtra;return {kcal:Math.round((kcal+add)/10)*10,p,c:c+Math.round(add*0.8/4),f:f+Math.round(add*0.2/9)}})()};
}
function macrosOf(items){ // items [[foodId,g]]
  const t={k:0,p:0,c:0,f:0,fib:0};
  for(const [id,g] of items){const x=F[id];t.k+=x.k*g/100;t.p+=x.p*g/100;t.c+=x.c*g/100;t.f+=x.f*g/100;t.fib+=x.fib*g/100;}
  return t;
}
// small linear solver
function solveLin(A,b){const n=b.length;const M=A.map((r,i)=>[...r,b[i]]);
  for(let i=0;i<n;i++){let mx=i;for(let k=i+1;k<n;k++)if(Math.abs(M[k][i])>Math.abs(M[mx][i]))mx=k;[M[i],M[mx]]=[M[mx],M[i]];
    if(Math.abs(M[i][i])<1e-12)return null;for(let k=0;k<n;k++){if(k===i)continue;const fct=M[k][i]/M[i][i];for(let j=i;j<=n;j++)M[k][j]-=fct*M[i][j];}}
  return M.map((r,i)=>r[n]/r[i]);}
/* Portion solver: find grams of the P, C and F ingredients so the serving hits the protein/carb/fat target.
   Non-negative least squares over all subsets, with errors weighted by calories (4/4/9 kcal per g). */
function portion(recipe,tgt,Pid,Cid){
  const vars=[Pid||recipe.P,Cid||recipe.C,recipe.F];
  const fx=macrosOf(recipe.fixed);
  const w=[4,4,9];
  const res=[tgt.p-fx.p,tgt.c-fx.c,tgt.f-fx.f].map((v,i)=>v*w[i]);
  const cols=vars.map(id=>[F[id].p/100*w[0],F[id].c/100*w[1],F[id].f/100*w[2]]);
  let best=null;
  for(let mask=1;mask<8;mask++){
    const idx=[0,1,2].filter(i=>mask&(1<<i));
    const A=idx.map(i=>idx.map(j=>cols[i].reduce((s,_,k)=>s+cols[i][k]*cols[j][k],0)));
    const b=idx.map(i=>cols[i].reduce((s,v,k)=>s+v*res[k],0));
    const sol=solveLin(A,b); if(!sol||sol.some(v=>v<0))continue;
    const x=[0,0,0];idx.forEach((i,j)=>x[i]=sol[j]);
    const err=[0,1,2].reduce((s,k)=>{const e=cols.reduce((a,col,i)=>a+col[k]*x[i],0)-res[k];return s+e*e},0);
    if(!best||err<best.err-1e-9)best={x,err};
  }
  const x=best?best.x:[0,0,0];
  const items=[...vars.map((id,i)=>[id,roundG(id,x[i])]),...recipe.fixed.map(([id,g])=>[id,g])];
  return {items,vars,tot:macrosOf(items)};
}
function roundG(id,g){const cat=F[id].cat;return cat==='fat'?Math.max(0,Math.round(g)):Math.max(0,r5(g));}
function slotTarget(t,share){return {p:t.p*share,c:t.c*share,f:t.f*share,k:t.kcal*share}}
const lb=g=>g/453.59, oz=g=>g/28.35;
function fmtWeight(g){if(g>=454)return lb(g).toFixed(1)+' lb';return Math.round(oz(g)*10)/10+' oz'}
function rawOf(id,g){const x=F[id];return x.y&&Math.abs(x.y-1)>0.01?g/x.y:null}

/* ============ PERSISTENCE (shared db when available, else this device) ============ */
let db=null, ref=null, saveTimer=null, writing=Promise.resolve(), canWrite=true, inFlight=0, lastWritten=null, synced=null, docExists=false;
function setSync(t){document.getElementById('sync').textContent=t}
function loadLocal(){try{const s=localStorage.getItem('slope-ready');if(s)S=merge(DEFAULTS,JSON.parse(s));}catch(e){}}
/* Only the top-level fields that changed are written, so two phones editing different things never overwrite each other. */
function changedKeys(){if(!synced)return Object.keys(S);return Object.keys(S).filter(k=>JSON.stringify(S[k])!==JSON.stringify(synced[k]))}
/* update() merges nested objects, so it can never drop a key: un-ticking a meal or removing a pantry item needs a full write. */
function hasRemoval(a,b){if(!a||typeof a!=='object'||Array.isArray(a))return false;if(!b||typeof b!=='object'||Array.isArray(b))return true;for(const k in a){if(!(k in b))return true;if(hasRemoval(a[k],b[k]))return true}return false}
function flush(){
  if(!ref||!canWrite)return;clearTimeout(saveTimer);saveTimer=null;
  const keys=changedKeys();if(!keys.length){setSync('Saved · shared');return}
  const patch={};for(const k of keys)patch[k]=clone(S[k]);inFlight++;
  const full=clone(S),existed=docExists,removal=keys.some(k=>hasRemoval(synced&&synced[k],S[k]));writing=writing.then(()=>existed&&!removal?ref.update(patch):ref.set(full)).then(()=>{docExists=true;synced=existed?Object.assign(clone(synced||{}),patch):full;lastWritten=JSON.stringify(S);setSync('Saved · shared')})
    .catch(e=>{if(e&&e.code==='invalid_argument'&&!existed){canWrite=false;setSync('View only')}else if(e&&e.code==='invalid_argument'){docExists=false;setSync('Not saved, try again')}else setSync('Not saved, try again')})
    .finally(()=>{inFlight--});
}
function save(){
  try{localStorage.setItem('slope-ready',JSON.stringify(S))}catch(e){}
  if(!ref||!canWrite)return;
  clearTimeout(saveTimer);setSync('Saving…');saveTimer=setTimeout(flush,500);
}
document.addEventListener('focusout',e=>{if(saveTimer&&e.target.matches&&e.target.matches('input,select'))flush()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&saveTimer)flush()});
window.addEventListener('pagehide',()=>{if(saveTimer)flush()});
/* Apply another device's change without clobbering what this viewer is typing. */
function applyRemote(next){
  const a=document.activeElement, id=a&&a.id, sel=(a&&typeof a.selectionStart==='number')?[a.selectionStart,a.selectionEnd]:null;
  S=next;renderAll();
  if(id){const el=document.getElementById(id);if(el){el.focus();if(sel&&el.setSelectionRange)try{el.setSelectionRange(sel[0],sel[1])}catch(e){}}}
}
let assets=null;
async function connectAssets(){try{if(window.claude&&window.claude.use){assets=await window.claude.use('assets');if(assets){renderMeals();renderToday();}}}catch(e){assets=null}}
async function connect(){
  try{
    if(!window.claude||!window.claude.use)return;
    db=await window.claude.use('db'); if(!db)return;
    ref=db.doc('plan/state');
    ref.onSnapshot(snap=>{
      if(!snap.exists){docExists=false;setSync('Shared plan · edit anything to save');return}
      docExists=true;
      if(snap.metadata.hasPendingWrites)return;
      const remote=snap.data();
      const mine=new Set((saveTimer||inFlight>0)?changedKeys():[]);
      synced=clone(remote);
      const next=clone(S);let changed=false;
      for(const k of Object.keys(remote)){if(mine.has(k))continue;if(JSON.stringify(next[k])!==JSON.stringify(remote[k])){next[k]=clone(remote[k]);changed=true}}
      if(!changed){setSync('Saved · shared');return}
      applyRemote(merge(DEFAULTS,next));setSync('Updated from the shared plan');
    },()=>setSync('Saved on this device'));
  }catch(e){}
}

/* ============ RENDER ============ */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let UI='aurora';
function applyUI(){UI=S.ui||'aurora';document.documentElement.setAttribute('data-ui',UI);const sel=document.getElementById('uiSel');if(sel)sel.value=UI;}
let V={who:0,block:'b1'};
try{const v=localStorage.getItem('slope-ready-view');if(v)V=Object.assign(V,JSON.parse(v))}catch(e){}
function saveV(){try{localStorage.setItem('slope-ready-view',JSON.stringify(V))}catch(e){}}
function shown(){return V.who==='both'?S.people.map((p,i)=>i):[+V.who]}
function chips(){
  $('whoSeg').innerHTML=S.people.map((pp,i)=>`<button type="button" data-who="${i}" aria-pressed="${String(V.who)===String(i)}">${esc(pp.name)}</button>`).join('')+`<button type="button" data-who="both" aria-pressed="${V.who==='both'}">Both</button>`;
}
const ACTS=[[1.2,'Desk job, little exercise'],[1.375,'Light: 1–3 workouts/wk'],[1.55,'Moderate: 3–5 workouts/wk'],[1.725,'Very active: 6–7 hard days/wk']];
const DEFS=[[0,'Maintain (ski-season fuel)'],[0.10,'Recomp: −10%'],[0.15,'Lean + strong: −15%'],[0.20,'Faster fat loss: −20%'],[0.25,'Aggressive cut: −25% (short-term)']];
function renderTargets(){
  const el=$('tab-targets');
  el.innerHTML=`
  <div class="intro"><h2>Your numbers</h2>
  <p class="muted">Enter both of your stats. Every portion in the meal plan, swap calculator and grocery list is rebuilt from these numbers.</p></div>
  <div class="grid2">${S.people.map((pp,i)=>personForm(pp,i)).join('')}</div>
  <div class="glass"><h3>Ski days</h3>
    <p class="muted small">Downhill skiing burns about 5.3 METs while you are moving. Assuming about half your time on the mountain is spent skiing (the rest is lifts and lines), this is what to add back. On ski days, eat at maintenance: no deficit.</p>
    <div class="row"><div class="field"><label class="label" for="skiHours">Hours on the mountain</label><input id="skiHours" type="number" min="1" max="10" step="0.5" value="${S.skiHours}"></div></div>
    <div class="tw" style="margin-top:12px"><table id="skiTable"></table></div>
  </div><div class="glass" id="looksBox"></div><div id="energyBox" style="display:grid;gap:18px"></div>`;
  renderTargetResults();
}
function personForm(pp,i){
  const o=(arr,val)=>arr.map(([v,l])=>`<option value="${v}" ${+v===+val?'selected':''}>${l}</option>`).join('');
  return `<div class="glass" data-person="${i}">
   <div class="row" style="justify-content:space-between;align-items:center"><div class="field"><label class="label" for="name${i}">Name</label><input id="name${i}" data-k="name" value="${esc(pp.name)}" style="width:150px"></div><span class="ex" id="ex${i}" ${pp.example?'':'hidden'}>Example stats: replace with yours</span></div>
   <div class="row" style="margin-top:10px">
    <div class="field"><label class="label" for="sex${i}">Sex</label><select id="sex${i}" data-k="sex"><option value="m" ${pp.sex==='m'?'selected':''}>Male</option><option value="f" ${pp.sex==='f'?'selected':''}>Female</option></select></div>
    <div class="field"><label class="label" for="age${i}">Age</label><input id="age${i}" type="number" data-k="age" value="${pp.age}" min="16" max="90"></div>
    <div class="field"><label class="label" for="ft${i}">Height ft</label><input id="ft${i}" type="number" data-k="ft" value="${pp.ft}" min="4" max="7"></div>
    <div class="field"><label class="label" for="in${i}">in</label><input id="in${i}" type="number" data-k="in" value="${pp.in}" min="0" max="11"></div>
    <div class="field"><label class="label" for="lb${i}">Weight lb</label><input id="lb${i}" type="number" data-k="lb" value="${pp.lb}" min="80" max="450"></div>
    <div class="field"><label class="label" for="goal${i}">Goal lb <span style="text-transform:none">(optional)</span></label><input id="goal${i}" type="number" data-k="goalLb" value="${pp.goalLb||''}" min="0" max="450"></div>
   </div>
   <div class="row" style="margin-top:10px">
    <div class="field wide" style="flex:1 1 200px"><label class="label" for="act${i}">Activity</label><select id="act${i}" data-k="act">${o(ACTS,pp.act)}</select></div>
    <div class="field wide" style="flex:1 1 200px"><label class="label" for="def${i}">Goal</label><select id="def${i}" data-k="def">${o(DEFS,pp.def)}</select></div>
    <div class="field wide" style="flex:1 1 140px"><label class="label" for="pf${i}">Protein g per kg</label><select id="pf${i}" data-k="pf">${o([[1.6,'1.6 (minimum)'],[1.8,'1.8 (default)'],[2.0,'2.0'],[2.2,'2.2 (high)']],pp.pf)}</select></div>
   </div>
   <div id="res${i}"></div>
  </div>`;
}
function renderTargetResults(){
  S.people.forEach((pp,i)=>{
    const t=targets(pp);const kp=t.p*4,kc=t.c*4,kf=t.f*9,tot=kp+kc+kf;
    const perLb=(pp.def>0?(t.tdee-t.kcal)*7/3500:0);
    $('res'+i).innerHTML=`<div class="stats">
      <div class="stat k"><div class="label">Calories</div><div class="v">${t.kcal}</div></div>
      <div class="stat p"><div class="label">Protein</div><div class="v">${t.p} g</div></div>
      <div class="stat c"><div class="label">Carbs</div><div class="v">${t.c} g</div></div>
      <div class="stat f"><div class="label">Fat</div><div class="v">${t.f} g</div></div>
      <div class="stat"><div class="label">Fiber</div><div class="v">${t.fib}+ g</div></div></div>
      <div class="bar" aria-hidden="true"><span style="width:${kp/tot*100}%;background:var(--p)"></span><span style="width:${kc/tot*100}%;background:var(--c)"></span><span style="width:${kf/tot*100}%;background:var(--f)"></span></div>
      <p class="small muted" style="margin-top:8px">BMR ${t.bmr} · maintenance ≈ ${t.tdee} kcal · expected loss ≈ ${perLb.toFixed(1)} lb/week${pp.def>0?' (most of it fat, if protein and strength training stay high)':''}. Per meal: breakfast 25%, lunch 30%, dinner 30%, snack 15%.</p>${t.aggr?`<div class="note warn small" style="margin-top:10px"><b>Aggressive cut rules.</b> Protein is raised to ${t.p} g to protect muscle${t.floored?`, and calories are held at ${t.kcal} so they don't drop below your basal metabolic rate`:''}. Expected loss is about ${t.lbWeek.toFixed(1)} lb a week (${t.pctWeek.toFixed(1)}% of body weight)${t.pctWeek>1?`, which is above the 1%-a-week limit for keeping muscle, so consider −20% instead`:''}. Use it for 6–8 weeks at most, then eat at maintenance for 1–2 weeks. Ski days stay at maintenance. Step back to −20% if sleep, mood or your lifts get worse two weeks in a row.</div>`:''}`;
    $('ex'+i).hidden=!pp.example;
  });
  const t=S.people.map(targets);
  $('skiTable').innerHTML=`<thead><tr><th></th>${S.people.map(p=>`<th class="n">${esc(p.name)}</th>`).join('')}</tr></thead><tbody>
   <tr><td>Extra burn on the hill</td>${t.map(x=>`<td class="n">+${x.skiExtra} kcal</td>`).join('')}</tr>
   <tr><td>Ski-day calories (maintenance + the hill)</td>${t.map(x=>`<td class="n">${x.ski.kcal}</td>`).join('')}</tr>
   <tr><td>Ski-day carbs (+80% of extra)</td>${t.map(x=>`<td class="n">${x.ski.c} g</td>`).join('')}</tr>
   <tr><td>Ski-day fat (+20% of extra)</td>${t.map(x=>`<td class="n">${x.ski.f} g</td>`).join('')}</tr>
   <tr><td>On-lift fuel (eat every 90–120 min)</td>${t.map(x=>`<td class="n">${Math.round((x.ski.c-x.c)/Math.max(1,Math.round(S.skiHours/1.75)))} g carbs each</td>`).join('')}</tr></tbody>`;
}

function slotKey(b,s){return b+'.'+s}
function viewWeek(){return (V.week===undefined||V.week===null)?curWeek():+V.week}
function renderMeals(){
  const el=$('tab-meals');
  const opts=(type,val)=>Object.entries(R).filter(([,r])=>type==='breakfast'?r.type==='breakfast':type==='snack'?r.type==='snack':r.type==='main').map(([id,r])=>`<option value="${id}" ${id===val?'selected':''}>${r.name}${r.src?` · ★${r.src.rating} (${r.src.count})`:''}</option>`).join('');
  const B=BLOCKS.find(x=>x.id===V.block)||BLOCKS[0];
  const W=viewWeek(), CW=curWeek();
  let h=`<div class="intro"><h2>Monthly meal plan</h2>
   <p class="muted">Plan four weeks of dishes. Each week has two cook days covering ${S.sunday?'the whole week':'six days'}. Pick any recipe, carb or protein and the gram amounts re-solve so ${V.who==='both'?'each of you':esc(S.people[+V.who].name)} still hits protein, carbs and fat. The Shop tab builds its list from exactly these dishes.</p></div>
   <div class="glass"><div class="row" style="justify-content:space-between;align-items:center"><h3>Month at a glance</h3><div class="field"><label class="label" for="monthStart">Week 1 starts (Sunday)</label><input id="monthStart" type="date" value="${S.monthStart}"></div></div>
    <div class="month">${[0,1,2,3].map(w=>`<button type="button" class="mweek" data-week="${w}" aria-pressed="${w===W}"><span class="mw-h"><b>Week ${w+1}</b><span class="small muted">${weekRange(w)}${w===CW?' · this week':''}</span></span>${BLOCKS.map(Bk=>`<span class="mw-b"><span class="small muted">${Bk.name}</span>${slots().map(([sid])=>`<span class="mw-d">${esc(recOf(w,Bk.id,sid).name)}${recOf(w,Bk.id,sid).pm?.mode==='fresh'?' <span class="small muted">· fresh</span>':''}</span>`).join('')}</span>`).join('')}</button>`).join('')}</div>
    <div class="row" style="margin-top:12px;align-items:center"><button type="button" class="btn sm" data-copyweek="${W}">Copy week ${W+1} into the next week</button><span class="small muted" id="copyWeekMsg"></span></div></div>
   <h3 style="padding-inline:4px">Week ${W+1} · ${weekRange(W)}</h3>
   <div class="row" style="align-items:center"><div class="seg" role="group" aria-label="Prep day">${BLOCKS.map(x=>`<button type="button" data-block="${x.id}" aria-pressed="${x.id===B.id}">${x.name}</button>`).join('')}</div><span class="small muted">${B.covers} · ${B.days} days × ${S.people.length} people</span></div>
   <div class="row" style="align-items:center;gap:16px"><div class="row" style="align-items:center;gap:8px"><span class="label">Meals a day</span><div class="seg" role="group" aria-label="Meals a day"><button type="button" data-meals="3" aria-pressed="${S.meals===3}">3</button><button type="button" data-meals="4" aria-pressed="${S.meals!==3}">4 with snack</button></div></div>
   <div class="row" style="align-items:center;gap:8px"><span class="label">Sunday</span><div class="seg" role="group" aria-label="Sunday"><button type="button" data-sunday="0" aria-pressed="${!S.sunday}">Cook fresh</button><button type="button" data-sunday="1" aria-pressed="${!!S.sunday}">From Wednesday prep</button></div></div></div>`;
  for(const [sid,sname,share] of slots()){
    const rec=recOf(W,B.id,sid), rid=recIdOf(W,B.id,sid), key=W+'.'+B.id+'.'+sid, sw=swOf(W,B.id,sid);
    const [Pid,Cid]=eff(rec,sw);
    const type=sid==='breakfast'?'breakfast':sid==='snack'?'snack':'main';
    h+=`<article class="glass slot"><div class="slothead"><div class="dishhead">${dishThumb(rid,'hero')}<div><div class="when">${sname}</div><h3>${esc(dishName(rec,Pid,Cid))}</h3>${rec.src?`<p class="small muted" style="margin:.2rem 0 0">★ ${rec.src.rating} from ${rec.src.count.toLocaleString()} ratings · <a href="${rec.src.url}" target="_blank" rel="noopener">${esc(rec.src.site)} recipe</a></p>`:'<p class="small muted" style="margin:.2rem 0 0">House staple</p>'}
        <div class="photo-actions">${rec.src?`<a class="small" href="${rec.src.url}" target="_blank" rel="noopener">See the photo on ${esc(rec.src.site)} ↗</a>`:''}${assets?`<label class="small linkish">${photoUrl(rid)?'Replace':'Add'} your photo<input type="file" accept="image/*" data-photo="${rid}" hidden></label>${photoUrl(rid)?`<button type="button" class="linkish small" data-rmphoto="${rid}">Remove photo</button>`:''}`:''}</div></div></div></div>
      <div class="swaps">
       <div class="field"><span class="label">Dish</span><button type="button" class="pickbtn" id="r-${key}" data-pick="${key}" data-type="${type}">${dishThumb(rid,'pt')}<span>Change dish</span></button></div>
       <div class="field"><label class="label" for="c-${key}">Carb</label><select id="c-${key}" data-swap="${key}" data-role="C" ${rec.lockC?'disabled':''}>${CARBS.map(x=>`<option value="${x.id}" ${x.id===Cid?'selected':''}>${x.name}</option>`).join('')}</select></div>
       <div class="field"><label class="label" for="p-${key}">Protein</label><select id="p-${key}" data-swap="${key}" data-role="P" ${rec.lockP?'disabled':''}>${pOpts(rec,Pid).map(x=>`<option value="${x.id}" ${x.id===Pid?'selected':''}>${x.name}</option>`).join('')}</select></div>
      </div>
      ${lockNote(rec)}
      ${portionTables(rec,share,Pid,Cid,B.days,shown())}
      ${Cid!==rec.C||Pid!==rec.P?swapNote(rec,share,Pid,Cid):''}
      <details><summary>How to make it</summary>${rec.adapt?`<p class="small note" style="margin:.6rem 0">Adapted for your targets: ${esc(rec.adapt)}</p>`:''}<ol class="small">${methodSteps(rec,Pid,Cid).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${rec.store?`<p class="small"><b>Storage:</b> ${esc(rec.store)}</p>`:''}<p class="small muted">${esc(rec.tip)}${rec.src?` Full recipe and quantities: <a href="${rec.src.url}" target="_blank" rel="noopener">${esc(rec.src.site)}</a>.`:''}</p></details>
    </article>`;
  }
  const dishes=slots().map(([sid])=>{const r=recOf(W,B.id,sid);return esc(dishName(r,...eff(r,swOf(W,B.id,sid))))});
  const skip=slots().map(([sid])=>recOf(W,B.id,sid)).filter(r=>r.pm&&r.pm.mode==='fresh');
  const cookD=slots().map(([sid])=>{const r=recOf(W,B.id,sid);return r.pm&&r.pm.mode==='fresh'?null:esc(dishName(r,...eff(r,swOf(W,B.id,sid))))}).filter(Boolean);
  h+=`<details class="glass"><summary>${B.name} game plan (about 2 hours)</summary><p class="small">You're making: <b>${cookD.join('</b>, <b>')}</b>.${skip.length?` Skip <b>${skip.map(r=>esc(r.name)).join('</b> and <b>')}</b> on prep day; it takes about 2 minutes to make fresh each time.`:''} Each dish's own steps are in its card above; this is the order that gets it all done at once.</p><ol class="small">
    <li>Oven to 425 °F. Start whatever roasts longest first (potatoes, sweet potatoes, chicken thighs).</li>
    <li>Rice cooker or pot going for grains; pasta last, 1 minute short of al dente.</li>
    <li>Proteins on sheet pans. Check with a thermometer: chicken 165 °F, ground turkey 165 °F, ground beef 160 °F, fish 145 °F.</li>
    <li>Steam or roast the vegetables while proteins cook.</li>
    <li>While the oven runs, do the no-cook items (overnight oats or chia jars, dips) and anything on the stovetop. Keep bananas, berries and avocado whole; add them when you eat.</li>
    <li>Freezer items (burritos, sandwiches, pancakes, muffins): cool completely, wrap and freeze the servings for later in the week.</li>
    <li>Weigh the whole cooked batch, then portion into labeled containers (person + day) using the gram numbers. Cool food fast (spread on a tray) and refrigerate within 1–2 hours. It keeps 3–4 days.</li>
   </ol><p class="small muted">Weights in the tables are cooked unless marked raw or dry.</p></details>`;
  el.innerHTML=h;
}
/* ---------- Today ---------- */
function todayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function todayBlock(){const wd=new Date().getDay();return wd===0?(S.sunday?BLOCKS[1]:null):(wd<=3?BLOCKS[0]:BLOCKS[1])}
function ring(val,max,color,label,unit){const r=41,c=2*Math.PI*r,pct=Math.min(1,max?val/max:0);
  return `<div class="ring" role="img" aria-label="${label}: ${Math.round(val)} of ${Math.round(max)} ${unit}"><svg viewBox="0 0 96 96"><circle class="trk" cx="48" cy="48" r="${r}"/><circle class="val" cx="48" cy="48" r="${r}" stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c*(1-pct)}"/></svg><div><b>${Math.round(val)}</b><span>of ${Math.round(max)}${unit==='g'?' g':''}</span><span style="display:block">${label}</span></div></div>`}
function mbar(val,max,color,label,unit,big){const pct=Math.min(100,max?val/max*100:0);return `<div class="mbar${big?' big':''}"><div class="top"><span>${label}</span><span><b>${Math.round(val).toLocaleString()}</b> / ${Math.round(max).toLocaleString()}${unit}</span></div><div class="track"><div class="fill" style="background:${color}" data-w="${pct}"></div></div></div>`}
function macroViz(got,t){if(UI==='swiss'||UI==='perf')return `<div class="bars">${mbar(got.k,t.kcal,'var(--accent)','Calories','',true)}${mbar(got.p,t.p,'var(--p)','Protein',' g')}${mbar(got.c,t.c,'var(--c)','Carbs',' g')}${mbar(got.f,t.f,'var(--f)','Fat',' g')}</div>`;
  return `<div class="rings">${ring(got.k,t.kcal,'var(--accent)','kcal','')}${ring(got.p,t.p,'var(--p)','protein','g')}${ring(got.c,t.c,'var(--c)','carbs','g')}${ring(got.f,t.f,'var(--f)','fat','g')}</div>`}
function nextSession(pi){for(let w=1;w<=8;w++)for(const [k,n] of SESS)if(!S.train[`${w}.${pi}.${k}`])return {w,k,n};return null}
function renderToday(){
  const el=$('tab-today'), B=todayBlock(), day=todayKey(), log=(S.log[day]||{});
  const hr=new Date().getHours(), greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const who=shown(), names=who.map(i=>esc(S.people[i].name)).join(' and ');
  const wd=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  let h=`<div class="hello"><span class="muted">${wd}</span><h1>${greet}, ${names}</h1><p class="muted">${B?`${B.name} menu today. Tap each meal as you eat it.`:'Sunday: cook fresh or eat out, then run the Sunday prep for the week. (Meals tab → Sunday → From Wednesday prep, if you\'d rather not cook today.)'}</p></div>`;
  for(const i of who){const pp=S.people[i], t=targets(pp), got={k:0,p:0,c:0,f:0};
    if(B)for(const [sid,,share] of slots()){if(!(log[i]||{})[sid])continue;const cw=curWeek(),rec=recOf(cw,B.id,sid),sw=swOf(cw,B.id,sid);const m=mpFor(i,rec,share,...eff(rec,sw)).tot;got.k+=m.k;got.p+=m.p;got.c+=m.c;got.f+=m.f;}
    h+=`<div class="glass daycard"><div>${who.length>1?`<h3 style="margin-bottom:10px">${esc(pp.name)}</h3>`:''}${macroViz(got,t)}</div>
    <ul class="meal-list">${B?slots().map(([sid,sname,share])=>{const cw=curWeek(),rec=recOf(cw,B.id,sid),sw=swOf(cw,B.id,sid);const mp=mealPlan(rec,share,...eff(rec,sw)),me=mp.people[i],sol={tot:me.tot};const done=!!(log[i]||{})[sid];
      const g=[...mp.mixes.filter(x=>me.mixG[x.name]>0).map(x=>`${me.mixG[x.name]} g ${esc(x.name.replace(/ \(.*\)/,'').toLowerCase())}`),...mp.sepIds.filter(id=>(me.sep[id]||0)>0).map(id=>`${me.sep[id]} g ${esc(bn(id).toLowerCase().replace(/ \(.*\)/,''))}`)].slice(0,4).join(' · ');
      return `<li class="meal-row ${done?'done':''}"><div class="tm">${dishThumb(recIdOf(cw,B.id,sid),'tt')}<div style="min-width:0"><div class="slot-name">${sname} · ${r0(sol.tot.k)} kcal${rec.pm&&rec.pm.mode==='fresh'?` · <span class="tag-fresh">make now, ${rec.pm.min} min</span>`:''}</div><div class="dish">${esc(dishName(rec,...eff(rec,sw)))}</div><div class="grams">${g}</div></div></div><button class="eat" type="button" data-eat="${i}.${sid}" aria-pressed="${done}" aria-label="${done?'Eaten':'Mark eaten'}: ${esc(sname)} for ${esc(pp.name)}"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></button></li>`}).join(''):`<li class="meal-row"><div><div class="dish">No prepped meals on Sundays</div><div class="grams">Aim for a protein-forward meal and use the targets on the You tab.</div></div><button class="btn" type="button" data-go="meals">Open prep plan</button></li>`}</ul></div>`;
  }
  const pi=who[0], tp=trainPos(), tday=DAYS[tp.d], tz=dayDone(tp.w,tp.d,pi);
  h+= tp.after?`<div class="island"><h3>All 8 weeks done. Go ski.</h3></div>`:`<div class="island"><div><div class="label">${tp.before?`Training starts ${dayDate(1,0).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}`:`Today's workout · week ${tp.w} · ${esc(S.people[pi].name)}`}</div><h3>${tp.before?'Strength A: squat and hinge':esc(tday[1])+(WORK[tday[0]]?': '+esc(WORK[tday[0]].title.split(': ')[1]):'')}</h3>${tp.before?'':`<span class="small" style="opacity:.8">${tz.done} of ${tz.total} done</span>`}</div><div class="row"><button class="btn primary" type="button" data-go="train">${tz.done&&tz.done<tz.total?'Continue workout':'Open workout'}</button></div></div>`;
  const need=needForWeeks([curWeek()]).tot,pan=S.pantry||{};const toBuy=Object.keys(need).filter(id=>need[id]-(pan[id]||0)>1).length;
  h+=`<div class="quick">
    <button type="button" data-go="grocery"><span class="label">Shopping list</span><b>${toBuy} items</b><span class="small muted">for this week's dishes, minus what's at home</span></button>
    <button type="button" data-go="swap"><span class="label">Swap a carb</span><b>Rice → potato</b><span class="small muted">exact grams for any swap</span></button>
    <button type="button" data-go="targets"><span class="label">Ski day?</span><b>+${targets(S.people[pi]).skiExtra} kcal</b><span class="small muted">for ${S.skiHours} h on the mountain</span></button></div>`;
  el.innerHTML=h;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.querySelectorAll('.ring .val').forEach(c=>c.style.strokeDashoffset=c.dataset.off);el.querySelectorAll('.mbar .fill').forEach(b=>b.style.width=b.dataset.w+'%')}));
}
/* Portion tables built from the shared batch. who = person indexes to show. */
function portionTables(rec,share,Pid,Cid,days,who){
  const mp=mealPlan(rec,share,Pid,Cid), ppl=who.map(i=>S.people[i]), P=who.map(i=>mp.people[i]);
  const d=(a,b)=>{const x=a-b;return Math.abs(x)<4?'<span class="okc">on target</span>':`<span class="wrn">${x>0?'+':''}${r0(x)} g</span>`};
  const nPeople=S.people.length;
  const cookRow=(id,g)=>{const tot=Math.round(g*days),raw=rawOf(id,tot);return `<tr><td>${esc(bn(id))}</td><td class="n"><b>${raw?Math.round(raw)+' g':tot+' g'}</b>${raw?` ${F[id].rawLabel}<br><span class="muted small">makes ${tot} g cooked</span>`:''}</td></tr>`};
  let cook='';
  for(const x of mp.mixes){const tot=mp.people.reduce((a,pp)=>a+pp.mixG[x.name],0)*days;
    cook+=`<tr class="grp"><td colspan="2"><b>${esc(x.name)}</b> <span class="muted small">· cook together, makes about ${Math.round(tot)} g</span></td></tr>`+x.ids.filter(id=>mp.batch[id]>0.5).map(id=>cookRow(id,mp.people.reduce((a,pp)=>a+pp.mixG[x.name]*x.ratio[id],0))).join('');}
  const seps=mp.sepIds.filter(id=>mp.people.some(pp=>(pp.sep[id]||0)>0));
  if(seps.length)cook+=`<tr class="grp"><td colspan="2"><b>Cooked or served on their own</b></td></tr>`+seps.map(id=>cookRow(id,mp.people.reduce((a,pp)=>a+(pp.sep[id]||0),0))).join('');
  const cell=v=>`<td class="n">${v} g</td>`, pm=rec.pm;
  const freshTag=id=>!pm&&ADD_FRESH.has(id)?' <span class="tag-fresh">add when eating</span>':'';
  let por=mp.mixes.map(x=>`<tr><td><b>${esc(x.name)}</b></td>${P.map(pp=>cell(pp.mixG[x.name])).join('')}</tr>`).join('');
  por+=seps.map(id=>`<tr><td>${esc(F[id].name)}${freshTag(id)}</td>${P.map(pp=>cell(pp.sep[id]||0)).join('')}</tr>`).join('');
  const mac=(k,lab)=>`<tr class="tot"><td>${lab}</td>${P.map(pp=>`<td class="n">${r0(pp.tot[k])} g<br><span class="delta">${d(pp.tot[k],pp.tg[k])}</span></td>`).join('')}</tr>`;
  const macRows=`<tr class="tot"><td>Calories</td>${P.map(pp=>`<td class="n">${r0(pp.tot.k)}</td>`).join('')}</tr>${mac('p','<span class="tp">Protein</span>')}${mac('c','<span class="tc">Carbs</span>')}${mac('f','<span class="tf">Fat</span>')}`;
  if(pm){const fresh=pm.mode==='fresh';
    return `<div class="pmnote ${pm.mode}"><b>${fresh?`No prep needed · about ${pm.min} min to make`:`No cooking · about ${pm.min} min a jar`}</b><span>${esc(pm.why)}</span></div>
    <div><h4>${fresh?'Make it fresh each time':'Fill each jar'} <span class="small muted">(${fresh?`weigh straight into the ${pm.into}`:`${days} jars each for this block`})</span></h4><div class="tw"><table><thead><tr><th>Weigh in</th>${ppl.map(pp=>`<th class="n">${esc(pp.name)}</th>`).join('')}</tr></thead><tbody>${por}${macRows}</tbody></table></div>
    <p class="small muted" style="margin:.3rem 0 0">Nothing is cooked, so every ingredient is weighed on its own and the numbers are exact.${fresh?' The Shop tab still buys enough for every day of the block.':''}</p></div>`;}
  return `<div class="both">
   <div><h4>1 · Cook together <span class="small muted">(${days} days × ${nPeople} people)</span></h4><div class="tw"><table><thead><tr><th>Ingredient</th><th class="n">Cook</th></tr></thead><tbody>${cook}</tbody></table></div>
    <p class="small muted" style="margin:.3rem 0 0">Raw or dry amounts. Ingredients under the same heading go in the same pan or pot.</p></div>
   <div><h4>2 · Portion each meal <span class="small muted">(weigh after cooking)</span></h4><div class="tw"><table><thead><tr><th>Weigh out</th>${ppl.map(pp=>`<th class="n">${esc(pp.name)}</th>`).join('')}</tr></thead><tbody>${por}
    ${macRows}</tbody></table></div>
    ${mp.mixes.length?`<p class="small muted" style="margin:.3rem 0 0">Mixed dishes are one weight each: stir the batch, then weigh your portion. The separate items make up the difference so each of you still hits your numbers.</p>`:''}</div>
  </div>`;
}
function lockNote(rec){if(!rec.lockC&&!rec.lockP)return '';
  const what=rec.lockC&&rec.lockP?`The ${sn(rec.C)} and ${sn(rec.P)} are`:rec.lockC?`The ${sn(rec.C)} ${/s$/.test(sn(rec.C))?'are':'is'}`:`The ${sn(rec.P)} ${/s$/.test(sn(rec.P))?'are':'is'}`;
  return `<p class="small muted" style="margin:-4px 0 0">${what} the base of this recipe, so ${rec.lockC&&rec.lockP?'they':'it'} can't be swapped. Pick a different recipe for a different ${rec.lockC&&rec.lockP?'carb or protein':rec.lockC?'carb':'protein'}.</p>`}
function swapNote(rec,share,Pid,Cid){
  const i0=shown()[0], pp=S.people[i0], a=mpFor(i0,rec,share), b=mpFor(i0,rec,share,Pid,Cid), parts=[];
  if(Cid!==rec.C)parts.push(`${r0(a.items[rec.C]||0)} g ${sn(rec.C)} becomes ${r0(b.items[Cid]||0)} g ${sn(Cid)}`);
  if(Pid!==rec.P)parts.push(`${r0(a.items[rec.P]||0)} g ${sn(rec.P)} becomes ${r0(b.items[Pid]||0)} g ${sn(Pid)}`);
  return `<p class="small note">Swapped: ${esc(pp.name)}'s ${parts.join(', and ')}. The other amounts were re-solved so the meal still hits target, and the steps below now cover cooking the ${[Pid!==rec.P?sn(Pid):'',Cid!==rec.C?sn(Cid):''].filter(Boolean).join(' and ')}.</p>`;
}

/* swap calculator */
let SW={from:'white_rice',to:'potato',g:200,unit:'cooked',mode:'carbs'};
try{const s=localStorage.getItem('slope-ready-swap');if(s)SW=Object.assign(SW,JSON.parse(s))}catch(e){}
function renderSwap(){
  const el=$('tab-swap');
  const o=v=>CARBS.map(x=>`<option value="${x.id}" ${x.id===v?'selected':''}>${x.name}</option>`).join('');
  el.innerHTML=`<div class="intro"><h2>Carb swap calculator</h2><p class="muted">Replace any carb with another and get the exact weight that keeps your carbs (or calories) the same. Any protein or fat difference is shown with the fix.</p></div>
  <div class="glass"><div class="row">
    <div class="field"><label class="label" for="swG">Amount</label><input id="swG" type="number" min="1" value="${SW.g}"></div>
    <div class="field"><label class="label" for="swU">Weighed</label><select id="swU"><option value="cooked" ${SW.unit==='cooked'?'selected':''}>cooked / as eaten</option><option value="raw" ${SW.unit==='raw'?'selected':''}>raw / dry</option></select></div>
    <div class="field wide" style="flex:1 1 220px"><label class="label" for="swF">Swap out</label><select id="swF">${o(SW.from)}</select></div>
    <div class="field wide" style="flex:1 1 220px"><label class="label" for="swT">Swap in</label><select id="swT">${o(SW.to)}</select></div>
  </div>
  <div class="row" style="margin-top:12px;align-items:center"><span class="label">Match</span><div class="seg" role="group" aria-label="Match mode"><button data-mode="carbs" aria-pressed="${SW.mode==='carbs'}">Same carbs</button><button data-mode="kcal" aria-pressed="${SW.mode==='kcal'}">Same calories</button></div></div>
  <div id="swOut" style="margin-top:18px"></div></div>
  <div class="glass"><h3>Equivalents: 50 g of carbs from each food</h3><p class="small muted">About one fist-size portion of rice. Sorted by calories: foods near the top give the same carbs for fewer calories.</p>
   <div class="tw"><table id="eqTable"></table></div></div>`;
  renderSwapOut();
  const rows=CARBS.map(x=>{const g=50/(x.c/100);return {x,g,raw:rawOf(x.id,g),k:x.k*g/100,p:x.p*g/100,f:x.f*g/100,fib:x.fib*g/100}}).sort((a,b)=>a.k-b.k);
  $('eqTable').innerHTML=`<thead><tr><th>Food</th><th class="n">Cooked g</th><th class="n">Raw/dry g</th><th class="n">kcal</th><th class="n">Protein</th><th class="n">Fat</th><th class="n">Fiber</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.x.id===SW.from||r.x.id===SW.to?'hl':''}"><td>${esc(r.x.name)}</td><td class="n">${r0(r.g)}</td><td class="n">${r.raw?r0(r.raw):'–'}</td><td class="n">${r0(r.k)}</td><td class="n">${r1(r.p)}</td><td class="n">${r1(r.f)}</td><td class="n">${r1(r.fib)}</td></tr>`).join('')}</tbody>`;
}
function renderSwapOut(){
  const a=F[SW.from], b=F[SW.to];
  const gA=SW.unit==='raw'?SW.g*a.y:SW.g; // cooked grams of A
  const mA=macrosOf([[a.id,gA]]);
  const gB=SW.mode==='carbs'?mA.c/(b.c/100):mA.k/(b.k/100);
  const mB=macrosOf([[b.id,gB]]);
  const rawB=rawOf(b.id,gB);
  const dP=mB.p-mA.p,dF=mB.f-mA.f,dC=mB.c-mA.c,dK=mB.k-mA.k;
  const fixes=[];
  if(SW.mode==='carbs'&&dK<-40)fixes.push(`This swap saves ${r0(-dK)} kcal. Keep the savings (fat-loss days) or add ${r0(-dK/8.84)} g olive oil to hold calories level.`);
  if(dF>2)fixes.push(`Fat is up ${r1(dF)} g: use ${r0(dF)} g less oil, cheese or avocado in the meal.`);
  if(dF<-2)fixes.push(`Fat is down ${r1(-dF)} g: add ${r0(-dF)} g olive oil (about ${r1(-dF/13.5)} tbsp).`);
  if(dP>3)fixes.push(`Protein is up ${r1(dP)} g: you can trim ${r5(dP/0.31)} g of cooked chicken breast if you want to hold calories.`);
  if(dP<-3)fixes.push(`Protein is down ${r1(-dP)} g: add ${r5(-dP/0.31)} g cooked chicken breast or ${r5(-dP/0.102)} g Greek yogurt.`);
  if(SW.mode==='kcal'&&Math.abs(dC)>4)fixes.push(`Carbs change by ${dC>0?'+':''}${r0(dC)} g at equal calories.`);
  if(mB.fib-mA.fib>2)fixes.push(`Bonus: +${r1(mB.fib-mA.fib)} g fiber, which slows digestion and helps steady energy.`);
  $('swOut').innerHTML=`<div class="answer">${r0(gB)} g <small>${esc(b.name.toLowerCase())}${rawB?` · ${r0(rawB)} g ${b.rawLabel}`:''} · ${fmtWeight(gB)}</small></div>
   <div class="tw" style="margin-top:14px"><table><thead><tr><th></th><th class="n">Grams</th><th class="n">kcal</th><th class="n">Carbs</th><th class="n">Protein</th><th class="n">Fat</th><th class="n">Fiber</th></tr></thead><tbody>
    <tr><td>${esc(bn(a.id))}</td><td class="n">${r0(gA)}</td><td class="n">${r0(mA.k)}</td><td class="n">${r1(mA.c)}</td><td class="n">${r1(mA.p)}</td><td class="n">${r1(mA.f)}</td><td class="n">${r1(mA.fib)}</td></tr>
    <tr><td>${esc(bn(b.id))}</td><td class="n">${r0(gB)}</td><td class="n">${r0(mB.k)}</td><td class="n">${r1(mB.c)}</td><td class="n">${r1(mB.p)}</td><td class="n">${r1(mB.f)}</td><td class="n">${r1(mB.fib)}</td></tr>
    <tr class="tot"><td>Difference</td><td></td><td class="n">${dK>0?'+':''}${r0(dK)}</td><td class="n">${dC>0?'+':''}${r1(dC)}</td><td class="n">${dP>0?'+':''}${r1(dP)}</td><td class="n">${dF>0?'+':''}${r1(dF)}</td><td class="n">${mB.fib-mA.fib>0?'+':''}${r1(mB.fib-mA.fib)}</td></tr></tbody></table></div>
   ${fixes.length?`<ul class="tight small" style="margin-top:10px">${fixes.map(f=>`<li>${f}</li>`).join('')}</ul>`:'<p class="small okc" style="margin-top:10px">Macros line up. No other changes needed.</p>'}`;
}

/* grocery + pantry */
function bn(id){return F[id].name.replace(/, (cooked|baked with skin|roasted with skin|boiled in skin|roasted)$/,'').replace(' (weigh dry)','')}
function buyG(id,g){const x=F[id];return x.y&&Math.abs(x.y-1)>0.01?g/x.y:g} // cooked -> what you buy (raw/dry)
/* What the chosen weeks' dishes need, in package (raw/dry) weight, with which dishes use each item. */
function needForWeeks(ws){
  const tot={}, uses={}, sp={};
  for(const w of ws)for(const B of BLOCKS)for(const [sid,,share] of slots()){
    const rec=recOf(w,B.id,sid), sw=swOf(w,B.id,sid);
    {const mp=mealPlan(rec,share,...eff(rec,sw));
      for(const id in mp.batch){const g=mp.batch[id];if(g<=0.5||F[id].made)continue;tot[id]=(tot[id]||0)+buyG(id,g)*B.days;(uses[id]=uses[id]||new Set()).add(dishName(rec,...eff(rec,sw)));}}
    for(const x of (rec.sp||[]))(sp[x]=sp[x]||new Set()).add(rec.name);
  }
  return {tot,uses,sp};
}
function blockNeed(w,bi){const tot={};const B=BLOCKS[bi];
  for(const [sid,,share] of slots()){const rec=recOf(w,B.id,sid), sw=swOf(w,B.id,sid);
    {const mp=mealPlan(rec,share,...eff(rec,sw));
      for(const id in mp.batch){const g=mp.batch[id];if(g>0.5&&!F[id].made)tot[id]=(tot[id]||0)+buyG(id,g)*B.days;}}}
  return tot;}
function shopWeeks(){const sel=S.shopSel;if(sel==='month')return [0,1,2,3];if(sel==='next2'){const c=curWeek();return [c,(c+1)%4]}if(sel==='cur'||sel===undefined)return [curWeek()];return [+sel]}
function shopLabel(){const sel=S.shopSel;if(sel==='month')return 'the whole month';if(sel==='next2')return 'this week and next';const w=shopWeeks()[0];return `week ${w+1} (${weekRange(w)})`}
const UNITS={g:1,oz:28.35,lb:453.59};
function toU(g){const u=S.unit;const v=g/UNITS[u];return u==='g'?Math.round(v):Math.round(v*10)/10}
function fmtU(g){if(S.unit==='lb'&&g<113)return Math.round(g/28.35*10)/10+' oz';return toU(g)+' '+S.unit}
function countNote(id,g){return id==='eggs'?` (${Math.ceil(g/50)} eggs)`:id==='corn_tortilla'?` (${Math.ceil(g/26)} tortillas)`:id==='banana'?` (~${Math.ceil(g/118)} bananas)`:id==='avocado'?` (~${Math.ceil(g/136)} avocados)`:id==='flour_tortilla'?` (${Math.ceil(g/45)} tortillas)`:id==='eng_muffin'?` (${Math.ceil(g/66)} muffins)`:id==='pita'?` (${Math.ceil(g/64)} pitas)`:''}
/* ---------- Store packages & prices (researched Sep 29 2026; King Soopers shelf prices from a Colorado store,
   Costco from member-reported averages; `est` = estimated). [store, product, size, grams, price, est, unit, edible] ---------- */
const PK={"chicken_breast":[["King Soopers","Heritage Farm boneless skinless chicken breast","per lb",453.6,2.59,0,"lb",1],["King Soopers","Kroger frozen chicken breast","3 lb bag",1361,9.99,0,"pk",1],["Costco","Kirkland boneless skinless chicken breast tray","~6.5 lb tray",2948,19.44,0,"pk",1]],"chicken_thigh":[["King Soopers","Heritage Farm boneless skinless thighs","~3 lb pack",1338,11.77,0,"pk",1],["King Soopers","Kroger frozen boneless skinless thighs","3 lb bag",1361,9.99,0,"pk",1],["Costco","Kirkland boneless skinless thighs","per lb",453.6,3.19,0,"lb",1]],"beef93":[["King Soopers","Kroger 93/7 ground beef","1 lb",453.6,9.49,0,"pk",1],["King Soopers","Kroger 93/7 ground beef","3 lb tray",1361,28.99,0,"pk",1],["Costco","Kirkland 93% lean ground beef","4 lb (3 packs)",1814,25.99,1,"pk",1]],"turkey93":[["King Soopers","Kroger 93/7 ground turkey","1 lb",453.6,5.49,0,"pk",1],["Costco","Butterball 93/7 ground turkey","4 × 1.7 lb",3084,25.84,0,"pk",1]],"turkey99":[["King Soopers","Kroger 99% fat-free ground turkey breast","1 lb",453.6,6.99,0,"pk",1],["King Soopers","Jennie-O 99% lean ground turkey","1 lb",453.6,8.49,0,"pk",1]],"salmon":[["King Soopers","Kroger frozen Atlantic salmon portions","2 lb bag",907,19.99,0,"pk",1],["King Soopers","Fresh Atlantic salmon fillet","per lb",453.6,9.99,0,"lb",1],["Costco","Kirkland frozen Atlantic salmon, individually wrapped","3 lb bag",1361,33.78,0,"pk",1]],"cod":[["King Soopers","Kroger frozen wild Pacific cod","2 lb bag",907,18.99,0,"pk",1],["King Soopers","Kroger frozen wild Alaskan cod","1 lb bag",453.6,12.0,0,"pk",1],["Costco","Kirkland wild Alaskan cod","2 lb bag",907,35.06,0,"pk",1]],"shrimp":[["King Soopers","Kroger frozen raw shrimp, peeled, tail-off","2 lb bag",907,15.98,0,"pk",1],["Costco","Kirkland 31/40 raw shrimp, tail-off","2 lb bag",907,14.17,0,"pk",1]],"pork_tender":[["King Soopers","Kroger pork tenderloin (sale $3.99/lb)","~2.3 lb pack",1061,9.34,0,"pk",1],["Costco","Pork tenderloin 2-pack","~4 lb",1814,12.24,0,"pk",1]],"tofu":[["King Soopers","Simple Truth Organic extra-firm tofu","14 oz",397,1.99,0,"pk",1],["Costco","Kirkland organic extra-firm tofu","4 × 16 oz",1814,5.89,0,"pk",1]],"eggs":[["King Soopers","Kroger cage-free large eggs","18 ct",900,5.19,0,"pk",1],["King Soopers","Kroger cage-free large eggs","60 ct",3000,15.49,0,"pk",1],["Costco","Kirkland cage-free large eggs","24 ct",1200,3.66,0,"pk",1]],"egg_whites":[["King Soopers","Kroger liquid egg whites","32 oz carton",907,6.79,0,"pk",1],["King Soopers","Simple Truth Organic liquid egg whites","16 oz carton",454,3.99,0,"pk",1],["Costco","Kirkland liquid egg whites","6 × 16 oz cartons",2722,11.58,0,"pk",1]],"greek_yogurt":[["King Soopers","Simple Truth Organic nonfat plain Greek yogurt","32 oz tub",907,4.49,0,"pk",1],["King Soopers","Kroger nonfat plain Greek yogurt","32 oz tub",907,4.99,0,"pk",1],["Costco","Kirkland nonfat plain Greek yogurt","48 oz tub",1361,4.95,0,"pk",1]],"cottage":[["King Soopers","Kroger 2% cottage cheese","24 oz",680,3.19,0,"pk",1],["King Soopers","Kroger 2% cottage cheese","16 oz",454,2.59,0,"pk",1],["Costco","Daisy 2% cottage cheese","48 oz",1361,7.25,0,"pk",1]],"whey":[["Costco","Kirkland whey protein (70 servings)","5.4 lb tub",2449,52.59,0,"pk",1],["King Soopers","Optimum Nutrition Gold Standard whey","1.5 lb",680,37.99,0,"pk",1],["Costco","Optimum Nutrition Gold Standard whey","5.47 lb",2481,63.99,0,"pk",1]],"ham":[["King Soopers","Kroger cubed ham","8 oz",227,2.99,0,"pk",1],["King Soopers","Kroger smoked ham, deli sliced","12 oz",340,5.0,0,"pk",1],["Safeway","Signature Select 97% fat-free ham","28 oz",794,7.99,1,"pk",1]],"chicken_sausage":[["King Soopers","Simple Truth chicken sausage links","12 oz (4 ct)",340,5.49,0,"pk",1],["Costco","Kirkland chicken sausage","3 lb",1361,12.99,0,"pk",1],["Costco","Aidells chicken & apple sausage","3 lb (15 links)",1361,14.89,0,"pk",1]],"cheddar":[["King Soopers","Kroger shredded cheddar","8 oz",227,2.0,0,"pk",1],["King Soopers","Kroger shredded cheddar","16 oz",454,3.69,0,"pk",1],["Costco","Kirkland shredded sharp cheddar","2 × 2.5 lb",2268,13.75,0,"pk",1]],"feta":[["King Soopers","Private Selection crumbled feta","4 oz",113,2.99,0,"pk",1],["King Soopers","Private Selection feta crumbles","6 oz",170,4.99,0,"pk",1],["Costco","Président crumbled feta","24 oz",680,6.29,0,"pk",1]],"gruyere":[["King Soopers","Private Selection Swiss & Gruyère blend","8 oz",227,3.99,0,"pk",1],["King Soopers","Boar's Head Gruyère","8 oz",227,8.49,0,"pk",1],["Costco","Emmi Le Gruyère block","16 oz",454,13.97,0,"pk",1]],"parmesan":[["King Soopers","Kroger grated Parmesan","8 oz",227,3.49,0,"pk",1],["King Soopers","Kroger shredded Parmesan","6 oz",170,3.99,0,"pk",1],["Costco","Kirkland shredded Parmigiano Reggiano","16 oz",454,20.01,0,"pk",1]],"mozzarella":[["King Soopers","Kroger part-skim mozzarella, shredded","16 oz",454,3.69,0,"pk",1],["Costco","Kirkland part-skim mozzarella, shredded","2 × 2.5 lb",2268,12.74,0,"pk",1]],"milk":[["King Soopers","King Soopers 2% milk","½ gallon",1950,2.79,0,"pk",1],["King Soopers","King Soopers 2% milk","1 gallon",3899,4.49,0,"pk",1],["Costco","Kirkland 2% milk","2 × 1 gallon",7798,6.6,0,"pk",1]],"almond_milk":[["King Soopers","Simple Truth unsweetened almond milk","64 fl oz",1893,2.69,0,"pk",1],["Costco","Kirkland unsweetened almond milk (shelf-stable)","12 × 32 fl oz",11356,14.43,0,"pk",1]],"heavy_cream":[["King Soopers","Kroger heavy whipping cream","1 pint",473,3.39,0,"pk",1],["King Soopers","Kroger heavy whipping cream","1 quart",946,5.49,0,"pk",1]],"potato":[["King Soopers","Kroger russet potatoes","5 lb bag",2268,2.69,0,"pk",1],["Costco","Russet baking potatoes","10 lb bag",4536,6.99,1,"pk",1],["King Soopers","Russet potatoes, loose","per lb",453.6,0.99,1,"lb",1]],"red_potato":[["King Soopers","Yukon gold potatoes","3 lb bag",1361,3.99,1,"pk",1],["Costco","Gold potatoes","10 lb bag",4536,6.99,0,"pk",1],["Safeway","Signature Farms red potatoes","5 lb bag",2268,4.28,1,"pk",1]],"sweet_potato":[["King Soopers","Sweet potatoes, loose","each (~0.75 lb)",340,1.49,0,"ea",1],["Costco","Sweet potatoes","5 lb bag",2268,5.99,1,"pk",1]],"banana":[["King Soopers","Bananas","per lb",453.6,0.59,0,"lb",0.65],["Costco","Bananas","3 lb bunch",1361,1.49,0,"pk",0.65]],"berries":[["King Soopers","Kroger frozen blueberries","16 oz bag",454,3.29,0,"pk",1],["King Soopers","Private Selection frozen blueberries","48 oz bag",1361,8.99,0,"pk",1],["Costco","Kirkland frozen blueberries","5 lb bag",2268,11.99,0,"pk",1],["Costco","Fresh blueberries","18 oz clamshell",510,5.89,0,"pk",1]],"butternut":[["King Soopers","Butternut squash, loose","per lb",453.6,1.29,1,"lb",0.8],["Costco","Organic squash, cubed","3.5 lb",1588,6.99,1,"pk",1]],"cauli_rice":[["King Soopers","Kroger frozen cauliflower rice","12 oz bag",340,2.49,0,"pk",1],["Costco","Via Emilia organic riced cauliflower","4 × 1 lb bags",1814,7.69,0,"pk",1]],"avocado":[["King Soopers","Hass avocado, medium","each",200,0.88,0,"ea",0.75],["Costco","Hass avocados","6 ct bag",1200,4.99,0,"pk",0.75]],"broccoli":[["King Soopers","Kroger frozen broccoli florets","12 oz bag",340,1.59,0,"pk",1],["King Soopers","Broccoli crown, fresh","each (~0.8 lb)",350,1.57,0,"ea",0.85],["Costco","Kirkland frozen broccoli florets","4 lb bag",1814,9.49,1,"pk",1]],"green_beans":[["King Soopers","Kroger frozen cut green beans","12 oz bag",340,1.29,0,"pk",1],["King Soopers","Fresh green beans","1 lb bag",454,2.19,0,"pk",0.95],["Costco","Fresh green beans","2 lb bag",907,4.99,1,"pk",0.95]],"bell_pepper":[["King Soopers","Green bell pepper","each",170,0.79,1,"ea",0.85],["King Soopers","Red bell pepper","each",170,1.59,0,"ea",0.85],["Costco","Organic mixed bell peppers","6 ct",1020,9.99,0,"pk",0.85]],"onion":[["King Soopers","Kroger yellow onions","3 lb bag",1361,2.89,0,"pk",0.9],["Costco","Yellow onions","10 lb bag",4536,6.99,1,"pk",0.9]],"spinach":[["King Soopers","Kroger baby spinach","10 oz tub",283,3.99,0,"pk",1],["King Soopers","Simple Truth Organic baby spinach","5 oz",142,3.49,0,"pk",1],["Costco","Organic baby spinach","16 oz",454,4.69,0,"pk",1]],"zucchini":[["King Soopers","Zucchini","each",250,0.85,0,"ea",0.95]],"brussels":[["King Soopers","Brussels sprouts, loose","per lb",453.6,3.99,0,"lb",0.9],["Costco","Brussels sprouts","2 lb bag",907,5.99,0,"pk",0.9]],"romaine":[["King Soopers","Kroger romaine hearts","3 ct (18 oz)",510,4.79,0,"pk",0.9],["King Soopers","Kroger shredded lettuce","8 oz bag",227,2.39,0,"pk",1],["Costco","Romaine hearts","6 ct",1000,4.99,0,"pk",0.9]],"carrot":[["King Soopers","Kroger whole carrots","2 lb bag",907,2.29,0,"pk",0.9],["Costco","Organic carrots","6 lb bag",2722,6.49,0,"pk",0.9]],"cucumber":[["King Soopers","Cucumber","each",300,0.79,0,"ea",0.95],["Costco","Mini cucumbers","1.5 lb bag",680,6.49,0,"pk",0.95]],"celery":[["King Soopers","Celery bunch","each",600,1.79,1,"ea",0.85],["Costco","Organic celery sticks","2.5 lb bag",1134,6.99,0,"pk",1]],"tomato":[["King Soopers","Roma tomatoes","each (~$1.29/lb)",100,0.31,0,"ea",0.95],["King Soopers","Cherry/grape tomatoes","1 pint",300,2.99,1,"pk",1],["Costco","Grape tomatoes","2 lb",907,5.99,0,"pk",1]],"peas":[["King Soopers","Kroger frozen sweet peas","12 oz bag",340,1.29,0,"pk",1],["Costco","Organic frozen peas","5 lb bag",2268,8.49,1,"pk",1]],"corn":[["King Soopers","Kroger frozen super sweet corn","12 oz bag",340,1.29,0,"pk",1],["Costco","Organic frozen sweet corn","5 lb bag",2268,8.49,1,"pk",1]],"white_rice":[["King Soopers","Kroger long-grain white rice","2 lb bag",907,1.79,0,"pk",1],["King Soopers","Kroger jasmine rice","5 lb bag",2268,7.99,0,"pk",1],["Costco","Kirkland jasmine rice","25 lb bag",11340,19.99,0,"pk",1]],"brown_rice":[["King Soopers","Kroger long-grain brown rice","1 lb bag",454,0.99,0,"pk",1],["King Soopers","Kroger long-grain brown rice","2 lb bag",907,1.79,0,"pk",1]],"quinoa":[["King Soopers","Kroger quinoa","1 lb bag",454,3.49,0,"pk",1],["Costco","Kirkland organic quinoa","4.5 lb bag",2041,10.49,0,"pk",1]],"pasta":[["King Soopers","Kroger spaghetti or penne","1 lb box",454,1.33,0,"pk",1]],"ww_pasta":[["King Soopers","Kroger 100% whole-grain pasta","1 lb box",454,1.33,0,"pk",1],["King Soopers","Simple Truth Organic whole-wheat spaghetti","1 lb box",454,1.69,0,"pk",1]],"couscous":[["King Soopers","Kroger couscous","7 oz box",198,2.49,0,"pk",1],["King Soopers","RiceSelect pearl couscous","24.5 oz jar",695,5.99,0,"pk",1]],"barley":[["King Soopers","Bob's Red Mill pearl barley","30 oz bag",850,3.99,0,"pk",1]],"rice_noodles":[["King Soopers","Kroger rice noodles (linguine width)","16 oz",454,3.99,0,"pk",1],["King Soopers","Kroger vermicelli rice noodles","8 oz",227,2.49,0,"pk",1]],"oats":[["King Soopers","Kroger old-fashioned oats","42 oz canister",1191,4.49,0,"pk",1],["King Soopers","Kroger old-fashioned oats","18 oz canister",510,2.79,0,"pk",1],["Costco","Quaker old-fashioned oats","2 × 5 lb bags",4536,7.59,0,"pk",1]],"ww_bread":[["King Soopers","Kroger 100% whole-wheat bread","24 oz loaf (~20 slices)",680,2.49,0,"pk",1],["King Soopers","Kroger 100% whole-wheat bread","16 oz loaf",454,2.19,0,"pk",1]],"corn_tortilla":[["King Soopers","Kroger white corn tortillas","30 ct",700,1.99,0,"pk",1],["Costco","Mission 6\" corn tortillas","100 ct",2400,10.79,0,"pk",1]],"flour_tortilla":[["King Soopers","Kroger soft taco flour tortillas","10 ct",496,1.99,0,"pk",1],["King Soopers","Kroger soft taco flour tortillas","20 ct",990,3.79,0,"pk",1],["Costco","Mission 8\" flour tortillas","40 ct",1950,5.29,0,"pk",1]],"eng_muffin":[["King Soopers","Kroger 100% whole-wheat English muffins","6 ct",369,1.79,0,"pk",1]],"pita":[["King Soopers","Joseph's flax & whole-wheat pita","6 ct",270,2.99,0,"pk",1],["King Soopers","Father Sam's wheat pita pockets","6 ct",397,3.99,0,"pk",1]],"black_beans":[["King Soopers","Kroger black beans","15.5 oz can",439,0.88,0,"pk",0.57],["Costco","S&W organic black beans","8 × 15 oz cans",3402,8.69,0,"pk",0.57]],"kidney_beans":[["King Soopers","Kroger light red kidney beans","15.5 oz can",439,0.88,0,"pk",0.57]],"chickpeas":[["King Soopers","Kroger garbanzo beans","15.5 oz can",439,0.88,0,"pk",0.57]],"lentils":[["King Soopers","Kroger dry lentils","1 lb bag",454,2.29,0,"pk",1]],"tomato_crushed":[["King Soopers","Kroger crushed tomatoes","28 oz can",794,1.89,0,"pk",1],["King Soopers","Kroger crushed tomatoes","15 oz can",425,1.0,0,"pk",1]],"tomato_sauce":[["King Soopers","Kroger tomato sauce","8 oz can",227,0.59,0,"pk",1],["King Soopers","Kroger tomato sauce","15 oz can",425,1.0,0,"pk",1]],"salsa":[["King Soopers","Kroger medium salsa","16 oz jar",454,2.19,0,"pk",1],["King Soopers","Kroger medium salsa","24 oz jar",680,2.99,0,"pk",1]],"coconut_light":[["King Soopers","Simple Truth Organic lite coconut milk","13.5 fl oz can",399,1.99,0,"pk",1]],"olive_oil":[["King Soopers","Kroger extra-virgin olive oil","500 ml",455,6.49,0,"pk",1],["King Soopers","Kroger extra-virgin olive oil","750 ml",683,9.49,0,"pk",1],["Costco","Kirkland organic extra-virgin olive oil","2 L",1820,16.79,0,"pk",1]],"sesame_oil":[["King Soopers","Kroger pure sesame oil","7.5 fl oz",202,3.99,0,"pk",1]],"peanut_butter":[["King Soopers","Kroger natural creamy peanut butter","15 oz jar",425,2.29,0,"pk",1],["King Soopers","Kroger creamy peanut butter","40 oz jar",1134,4.99,0,"pk",1],["Costco","Kirkland organic peanut butter","2 × 28 oz jars",1588,9.79,0,"pk",1]],"almonds":[["King Soopers","Kroger whole almonds","1 lb bag",454,13.49,0,"pk",1],["Costco","Kirkland whole almonds","3 lb bag",1361,12.49,0,"pk",1]],"pecans":[["King Soopers","Kroger pecan halves","4 oz bag",113,4.49,0,"pk",1],["King Soopers","Kroger pecan halves","8 oz bag",227,7.49,0,"pk",1],["Costco","Kirkland pecan halves","2 lb bag",907,13.69,0,"pk",1]],"chia":[["King Soopers","Simple Truth Organic chia seeds","12 oz bag",340,4.79,0,"pk",1],["King Soopers","Simple Truth Organic chia seeds","5 oz",142,3.99,0,"pk",1]],"olives":[["King Soopers","Simple Truth pitted kalamata olives","10.2 oz jar",289,3.99,0,"pk",1]],"maple":[["King Soopers","Simple Truth Organic maple syrup","8 fl oz",313,4.99,0,"pk",1],["Costco","Kirkland organic maple syrup","1 L",1320,12.59,0,"pk",1]],"honey":[["King Soopers","Kroger clover honey bear","12 oz",340,4.0,0,"pk",1],["Costco","Kirkland raw honey","3 lb",1361,9.59,0,"pk",1]]};
const STORES=['King Soopers','Costco'];
function storeOpts(id,store){const all=(PK[id]||[]);if(store==='mix'){const m=all.filter(o=>STORES.includes(o[0]));return m.length?m:all}const f=all.filter(o=>o[0]===store);return f.length?f:all}
/* Cheapest way to cover `needG` usable grams with real packages (always rounds UP to whole packs). */
function packFor(id,needG,store){
  if(!(needG>0))return null;let best=null;
  for(const o of storeOpts(id,store)){const [st,prod,size,g,price,est,unit,ed]=o;const usable=g*ed;let qty,cost,got,label;
    if(unit==='lb'){const lbs=Math.ceil(needG/ed/453.6*4)/4;qty=lbs;cost=lbs*price;got=lbs*453.6*ed;label=`about ${lbs} lb`;}
    else{qty=Math.ceil(needG/usable-1e-9);cost=qty*price;got=qty*usable;label=`${qty} × ${size}`;}
    const c={o,st,prod,size,unit,qty,cost,got,left:got-needG,label,est};
    if(!best||c.cost<best.cost-0.005||(Math.abs(c.cost-best.cost)<0.005&&c.left<best.left))best=c;}
  return best;
}
function fmtMoney(x){return '$'+x.toFixed(2)}
function leftoverText(p){if(!p||p.left<1)return '';const o=p.o;if(p.unit==='pk'||p.unit==='ea'){const frac=p.left/(o[3]*o[7]);return frac>=0.1?`~${frac>=1?Math.round(frac*10)/10:Math.round(frac*100)+'% of a'} ${p.unit==='ea'?'piece':'package'} left for the pantry`:''}return ''}
/* Plan purchases for a list of weeks, carrying leftovers forward like a real pantry. */
function planShopping(ws,store,startPantry){
  const pan=clone(startPantry||S.pantry||{}), perWeek=[];
  for(const w of ws){const N=needForWeeks([w]);let cost=0;const buys={};
    for(const id in N.tot){const need=Math.max(0,N.tot[id]-(pan[id]||0));pan[id]=Math.max(0,(pan[id]||0)-N.tot[id]);
      if(need>1){const p=packFor(id,need,store);if(p){buys[id]=p;cost+=p.cost;pan[id]+=p.got-need;}}}
    perWeek.push({w,cost,buys});}
  return perWeek;
}
/* Rough price per seasoning/extra: fresh produce ~$1, sauces and broths ~$2.50, spice jars ~$3.50 (Kroger jar $2.99–3.99). */
function spPrice(n){n=n.toLowerCase();if(/muffin batch|optional/.test(n))return 0;if(/lemon|garlic$|^garlic|fresh|scallion|jalape|cilantro|lemongrass|lime leaves|thai basil/.test(n))return 1;if(/sauce|broth|vinegar|paste|mustard|sugar|cornstarch|breadcrumbs|sour cream|butter|spray|bags|chips|flour|gochujang|sriracha|oil/.test(n))return 2.5;return 3.5}
function renderGrocery(){
  const ws=shopWeeks(), N=needForWeeks(ws), need=N.tot, pan=S.pantry||{}, CW=curWeek(), store=S.store||'mix';
  const cats=[['protein','Protein'],['carb','Carbs and fruit'],['veg','Vegetables'],['fat','Fats, nuts and cheese'],['extra','Dairy and pantry']];
  const opt=(v,l)=>`<option value="${v}" ${String(S.shopSel||'cur')===String(v)?'selected':''}>${l}</option>`;
  const ids=Object.keys(need), buys={};let total=0;
  for(const id of ids){const b=Math.max(0,need[id]-(pan[id]||0));if(b>1){const p=packFor(id,b,store);if(p){buys[id]=p;total+=p.cost}}}
  const altTot=st=>ids.reduce((t,id)=>{const b=Math.max(0,need[id]-(pan[id]||0));const p=b>1?packFor(id,b,st):null;return t+(p?p.cost:0)},0);
  const spNames=Object.keys(N.sp).sort(), spMissing=spNames.filter(n=>!S.staples[n]), spCost=spMissing.reduce((t,n)=>t+spPrice(n),0);
  const days=(S.sunday?7:6)*ws.length, perPD=total/Math.max(1,days*S.people.length);
  let h=`<div class="intro"><h2>Shopping list</h2><p class="muted">Built only from the dishes in your meal plan, minus what's at home, rounded up to whole packages the way stores sell them.</p></div>
  <div class="glass"><div class="row">
    <div class="field wide" style="flex:1 1 230px"><label class="label" for="shopSel">Shop for</label><select id="shopSel">${opt('cur',`This week (week ${CW+1}, ${weekRange(CW)})`)}${opt('next2','This week and next')}${[0,1,2,3].map(w=>opt(w,`Week ${w+1} · ${weekRange(w)}`)).join('')}${opt('month','Whole month (4 weeks)')}</select></div>
    <div class="field wide" style="flex:1 1 170px"><label class="label" for="storeSel">Store</label><select id="storeSel">${[['mix','Cheapest of both'],['King Soopers','King Soopers'],['Costco','Costco']].map(([v,l])=>`<option value="${v}" ${store===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label class="label" for="unit">Units</label><select id="unit">${['lb','oz','g'].map(u=>`<option ${u===S.unit?'selected':''}>${u}</option>`).join('')}</select></div>
    <button class="btn primary" data-act="copy" type="button">Copy shopping list</button><span class="small muted" id="copyMsg"></span></div>
   <div class="cost"><div><span class="label">Estimated groceries</span><b>${fmtMoney(total)}</b><span class="small muted">for ${shopLabel()} · about ${fmtMoney(perPD)} per person per day</span></div>
    <div class="small">${store!=='King Soopers'?`All at King Soopers: <b>${fmtMoney(altTot('King Soopers'))}</b><br>`:''}${store!=='Costco'?`All at Costco: <b>${fmtMoney(altTot('Costco'))}</b><br>`:''}${store!=='mix'?`Cheapest of both: <b>${fmtMoney(altTot('mix'))}</b><br>`:''}${spMissing.length?`Plus seasonings you don't have: ~${fmtMoney(spCost)} (${spMissing.length} items, one-time)`:''}</div></div>
   <p class="small muted" style="margin:8px 0 0">Prices checked Sep 29, 2026: King Soopers shelf prices at a Colorado store, Costco member-reported averages. Safeway and Sprouts block price lookups; expect their store brands to run about 10–30% above King Soopers. Leftover package amounts go to your pantry when you tap "Got it".</p></div>
  <div class="grid2">`;
  for(const [c,cn] of cats){
    const list=ids.filter(id=>F[id].cat===c).sort((a,b)=>(!!buys[b])-(!!buys[a])||need[b]-need[a]);
    if(!list.length)continue;
    h+=`<div class="glass"><h3>${cn}</h3><ul class="shop">${list.map(id=>{
      const n=need[id], have=pan[id]||0, p=buys[id];
      const other=p?STORES.filter(st=>st!==p.st).map(st=>{const q=packFor(id,Math.max(0,n-have),st);return q&&q.st===st?`${st}: ${q.label} ${fmtMoney(q.cost)}`:''}).filter(Boolean).join(' · '):'';
      return `<li class="${p?'':'covered'}"><div class="si"><b>${esc(bn(id))}</b>${p?`<span class="buyline"><b class="tbuy">${p.label}</b> · ${esc(p.prod)} <span class="store">${esc(p.st)}</span> <b>${fmtMoney(p.cost)}</b>${p.est?' <span class="small muted">(est.)</span>':''}</span><span class="small muted">Need ${fmtU(n)}${F[id].rawLabel?' '+F[id].rawLabel:''}${countNote(id,n)}${have?`, have ${fmtU(have)}`:''}${leftoverText(p)?' · '+leftoverText(p):''}</span>${other?`<span class="for">Or ${esc(other)}</span>`:''}`:`<span class="small muted"><span class="okc">Covered by your pantry</span> · need ${fmtU(n)}</span>`}<span class="for">For ${[...N.uses[id]].map(esc).join(', ')}</span></div>
       <label class="have"><span class="small muted">Have</span><input class="pin" type="number" min="0" step="any" id="pan-${id}" data-pantry="${id}" value="${have?toU(have):''}" placeholder="0" aria-label="${esc(bn(id))} at home, ${S.unit}"></label>
       ${p?`<button class="btn sm" type="button" data-got="${id}">Got it</button>`:'<span class="okc small" style="justify-self:center">✓</span>'}</li>`}).join('')}</ul></div>`;
  }
  h+=`</div>`;
  // budget by week
  const order=[0,1,2,3].map(i=>(CW+i)%4), plan=planShopping(order,store), month=plan.reduce((t,x)=>t+x.cost,0);
  h+=`<div class="glass"><h3>Grocery budget</h3><p class="small muted">Each week is bought separately; leftovers from one week's packages cover the next week before anything new is bought. Prices use the store choice above.</p>
   <div class="tw"><table><thead><tr><th>Week</th><th>Dates</th><th class="n">Groceries</th><th class="n">Per person / day</th></tr></thead><tbody>${plan.map(x=>`<tr${x.w===CW?' class="hl"':''}><td>Week ${x.w+1}${x.w===CW?' · this week':''}</td><td>${weekRange(x.w)}</td><td class="n">${fmtMoney(x.cost)}</td><td class="n">${fmtMoney(x.cost/((S.sunday?7:6)*S.people.length))}</td></tr>`).join('')}
   <tr class="tot"><td>4 weeks</td><td></td><td class="n">${fmtMoney(month)}</td><td class="n">${fmtMoney(month/(4*(S.sunday?7:6)*S.people.length))}</td></tr></tbody></table></div>
   <p class="small muted">Average ${fmtMoney(month/4)} per week for ${S.people.length} people. The first week usually costs more because it stocks staples like oil, oats and spices.</p></div>
  <div class="glass"><h3>Seasonings, sauces and extras</h3><p class="small muted">Only what your chosen dishes call for. Tick what you already have; unticked items go on the copied list. Budget about $3–4 per spice jar.</p>
   <ul class="staples">${spNames.map(n=>`<li><label class="${S.staples[n]?'have-it':''}"><input type="checkbox" data-staple="${esc(n)}" ${S.staples[n]?'checked':''}><span>${esc(n)}<br><span class="for">${[...N.sp[n]].map(esc).join(', ')}</span></span></label></li>`).join('')}</ul></div>`;
  const extra=Object.keys(pan).filter(id=>pan[id]>0), wk=needForWeeks([CW]).tot, dd=S.sunday?7:6, useW=ws.length===1?ws[0]:CW;
  h+=`<div class="glass"><h3>Pantry</h3><p class="small muted">What you have at home. "Got it" adds the whole packages you bought. After each cook day, subtract what you used so the next list stays accurate.</p>
   <div class="row" style="margin:8px 0 12px"><button class="btn" type="button" data-use="0" data-useweek="${useW}">Cooked week ${useW+1} Sunday prep: subtract it</button><button class="btn" type="button" data-use="1" data-useweek="${useW}">Cooked week ${useW+1} Wednesday prep: subtract it</button><span class="small muted" id="useMsg"></span></div>
   ${extra.length?`<div class="tw"><table><thead><tr><th>Item</th><th class="n">Amount</th><th class="n">Lasts</th><th></th></tr></thead><tbody>${extra.sort((a,b)=>bn(a).localeCompare(bn(b))).map(id=>{const perDay=(wk[id]||0)/dd;return `<tr><td>${esc(bn(id))}</td><td class="n">${fmtU(pan[id])}${countNote(id,pan[id])}</td><td class="n muted">${perDay>0?(d=>d+(d===1?' day':' days'))(Math.floor(pan[id]/perDay)):'not this week'}</td><td><button class="btn sm" type="button" data-clear="${id}">Remove</button></td></tr>`}).join('')}</tbody></table></div>`:`<p class="small">Nothing logged yet. Type amounts into the "Have" boxes above, tap "Got it" after shopping, or add anything else below.</p>`}
   <div class="row" style="margin-top:12px"><div class="field wide" style="flex:1 1 240px"><label class="label" for="addFood">Add something you have</label><select id="addFood">${Object.values(F).filter(x=>!x.made).sort((a,b)=>bn(a.id).localeCompare(bn(b.id))).map(x=>`<option value="${x.id}">${esc(bn(x.id))}${x.rawLabel?' ('+x.rawLabel+')':''}</option>`).join('')}</select></div>
   <div class="field"><label class="label" for="addAmt">Amount (${S.unit})</label><input id="addAmt" type="number" min="0" step="any"></div><button class="btn" type="button" data-act="add">Add</button></div>
  </div>`;
  $('tab-grocery').innerHTML=h;
}
function shoppingText(){const ws=shopWeeks(),N=needForWeeks(ws),need=N.tot,pan=S.pantry||{},store=S.store||'mix';const by={};let total=0;
  for(const id of Object.keys(need)){const b=Math.max(0,need[id]-(pan[id]||0));if(b<=1)continue;const p=packFor(id,b,store);if(!p)continue;total+=p.cost;(by[p.st]=by[p.st]||[]).push(`- ${bn(id)}: ${p.label} (${p.prod}) ${fmtMoney(p.cost)}`);}
  const lines=[`Shopping list · ${shopLabel()} · est. ${fmtMoney(total)}`];
  for(const st of Object.keys(by)){lines.push('',st.toUpperCase(),...by[st]);}
  const miss=Object.keys(N.sp).sort().filter(n=>!S.staples[n]);if(miss.length){lines.push('','SEASONINGS & EXTRAS');miss.forEach(n=>lines.push('- '+n));}
  return lines.join('\n');}

/* training */
const SESS=[['A','Strength A'],['B','Strength B'],['C','Power + core'],['Z1','Cardio 1'],['Z2','Cardio 2']];
const PH=[
 {cls:'green',name:'Green circle · Foundation',weeks:[1,2,3],rx:'2–3 sets, bodyweight or light dumbbells, finish every set with 2–3 reps left in the tank. Learn the positions: knees tracking over toes, hips back, soft landings.'},
 {cls:'blue',name:'Blue square · Strength and power',weeks:[4,5,6],rx:'3–4 sets, add weight (dumbbells, kettlebell or a backpack). Slow 3-second lowering on squats and lunges. Jumps get higher and faster, landings stay quiet.'},
 {cls:'black',name:'Black diamond · Ski-specific endurance',weeks:[7,8],rx:'Circuits that mimic a run: 45 s work / 45 s rest × 6 rounds of wall sit → skater hops → squat pulses. Add one interval cardio day. Week 8 is lighter so you arrive at opening day fresh.'}
];
const WORK={
 A:{title:'Strength A: squat and hinge',items:[
   ['Goblet squat','3 × 8–12','Hold a weight at your chest, sit hips back and down, knees out over toes. Builds the quads that hold a ski stance.'],
   ['Romanian deadlift','3 × 10','Soft knees, push hips back until you feel the hamstrings; flat back. Protects the back and balances the quads.'],
   ['Reverse lunge','3 × 8 / leg','Step back, drop the back knee toward the floor, drive through the front heel.'],
   ['Lateral lunge','2 × 8 / leg','Big step sideways, sit into that hip, other leg straight. Trains the side-to-side load of carving and the inner thigh.'],
   ['Wall sit','3 × 30–60 s','Thighs near parallel. The single most ski-like hold; add 10 s each week.'],
   ['Tibialis raise + calf raise','2 × 15 each','Back against a wall, lift toes up; then heels up (straight knee and bent knee). Ankles and shins live in ski boots all day.'],
   ['Side plank','2 × 20–40 s / side','Straight line from head to heels.']]},
 B:{title:'Strength B: single leg and stability',items:[
   ['Rear-foot-elevated split squat','3 × 8 / leg','Back foot on a bench. Fixes left/right imbalances; keep the front knee over the middle toes.'],
   ['Single-leg Romanian deadlift','3 × 8 / leg','Reach and hinge on one leg. Ankle, knee and hip stability in one move.'],
   ['Glute bridge with ball squeeze','3 × 12','Pillow or ball between the knees; squeeze and hold 2 s at the top. Glutes and inner thighs.'],
   ['Banded monster walk','3 × 8 steps each way','Band above the knees, half squat, walk forward and back without knees caving in. Trains the muscles that protect the knee.'],
   ['Copenhagen plank (knees)','2 × 15–25 s / side','Side plank with the top knee on a bench. Adductor strength lowers groin strain risk.'],
   ['Single-leg balance','3 × 30 s / leg','Progress: eyes closed, then on a folded towel or pillow. Builds the ankle reflexes you use on uneven snow.'],
   ['Dead bug','3 × 8 / side','Low back pressed down while opposite arm and leg extend.']]},
 C:{title:'Power + core',items:[
   ['Lateral skater hops','3 × 10 / side','Bound sideways onto one foot, stick the landing for 1 s. Edge-to-edge power.'],
   ['Drop landings','3 × 6','Step off a 6–12 in box, land on both feet, knees over toes, hips back, silent. Landing mechanics are central to ACL-injury prevention programs.'],
   ['Squat jumps','3 × 6','Explode up, land soft, reset. Phase 3: continuous for 20 s.'],
   ['Pallof press','3 × 10 / side','Band anchored at your side, press straight out and resist the twist. Trunk control when a ski catches.'],
   ['Bird dog','2 × 8 / side','Slow, hips level.'],
   ['Front plank','3 × 30–60 s','Glutes and abs tight.']]}
};
const MOB=[
 ['Knee-to-wall ankle rocks','10 / side','Foot a few inches from a wall, drive the knee to the wall with the heel down. Ski boots demand ankle bend.'],
 ['Calf and soleus stretch','30 s each, both legs','Straight knee (calf) then bent knee (soleus) against a wall.'],
 ['Couch stretch (hip flexor)','45 s / side','Back knee against the couch or wall, squeeze the glute. Opens hips tight from sitting and from ski stance.'],
 ['90/90 hip switches','8 / side','Sit with both knees bent at 90°, rotate side to side. Hip rotation for turns.'],
 ['Figure-4 or pigeon stretch','45 s / side','Glutes and piriformis.'],
 ['Hamstring stretch','45 s / side','Leg on a step, hinge at the hips with a flat back.'],
 ['Cat–cow','10 slow reps','Mobilizes the whole spine.'],
 ['Open book (thoracic rotation)','8 / side','Lying on your side, rotate the top arm open. Upper back rotation spares the lower back.'],
 ['Child\'s pose','45 s','Breathe into the low back.']
];
/* Home version: bodyweight plus things every home has (a wall, stairs or a sturdy chair, the couch, a towel, a backpack).
   Moves that already need no equipment stay the same; these replace the ones that need gym gear. */
const HOME_SWAP={
 'Goblet squat':['Tempo squat','3 × 12–15','Bodyweight squat, hands at your chest: 3 seconds down, 1-second pause at the bottom, stand up fast. Slowing it down makes bodyweight hard enough to build the quads that hold a ski stance.'],
 'Romanian deadlift':['Towel hamstring curl','3 × 8–10','On your back with your heels on a towel on a hard floor (socks work too). Lift your hips into a bridge, slide your heels out, then pull them back in without letting your hips drop. Strong hamstrings protect the knee, the same job the Romanian deadlift does.'],
 'Banded monster walk':['Side-lying hip abduction','3 × 15 / side','Lie on your side, bottom knee bent, top leg straight and slightly behind you with the toes pointing forward. Lift slowly and hold 2 s at the top. Works the same knee-protecting glute muscle as the band walk.'],
 'Pallof press':['Plank shoulder taps','3 × 10 / side','High plank on your hands, feet wider than hips. Tap the opposite shoulder without letting your hips rock. Same anti-twist trunk control as the Pallof press.']
};
const HOME_ADD={A:[['Step-up','3 × 10 / leg','Bottom stair, or a sturdy chair pushed against a wall. Drive through the whole top foot and don\'t push off with the back leg. Adds the single-leg load you\'d otherwise get from dumbbells.']]};
const HOME_DESC={
 'Rear-foot-elevated split squat':'Back foot on the couch or a sturdy chair. Fixes left/right imbalances; keep the front knee over the middle toes.',
 'Copenhagen plank (knees)':'Side plank with the top knee on the couch or a chair seat. Adductor strength lowers groin strain risk.',
 'Drop landings':'Step off the bottom stair, land on both feet, knees over toes, hips back, silent. Landing mechanics are central to ACL-injury prevention programs.',
 'Glute bridge with ball squeeze':'A folded pillow between the knees; squeeze and hold 2 s at the top. Glutes and inner thighs.'};
function placeOf(w,d){const t=S.tplace||{};return (t.d||{})[w+'.'+d]||t.def||'gym'}
function homeify(items,k){const out=[];items.forEach((x,i)=>{const h=HOME_SWAP[x[0]];out.push(h?[...h,'H'+k+i]:[x[0],x[1],HOME_DESC[x[0]]||x[2],k+i]);});(HOME_ADD[k]||[]).forEach((x,i)=>out.splice(3+i,0,[...x,'H'+k+'x'+i]));return out}
const ALLX=[...WORK.A.items,...WORK.B.items,...WORK.C.items,...Object.values(HOME_SWAP),...HOME_ADD.A];
function weekDates(w){const d=new Date(S.startDate+'T12:00:00');d.setDate(d.getDate()+(w-1)*7);const e=new Date(d);e.setDate(e.getDate()+6);const f=x=>x.toLocaleDateString(undefined,{month:'short',day:'numeric'});return f(d)+' – '+f(e)}
/* ---------- Training: day-by-day checklist ---------- */
const SCHED={3:[['A','Strength A','Squat and hinge'],['Z1','Cardio','Easy aerobic base'],['B','Strength B','Single leg and stability'],['M','Mobility','Recovery day'],['C','Power + core','Jumps, landings, trunk'],['Z2','Long cardio','Hike, bike or rower'],['R','Rest','Rest and meal prep']],
 2:[['A2','Strength A + power','Squat, hinge and jumps'],['Z1','Cardio','Easy aerobic base'],['M','Mobility','Recovery day'],['B2','Strength B + core','Single leg, stability and trunk'],['M','Mobility','Recovery day'],['Z2','Long cardio','Hike, bike or rower'],['R','Rest','Rest and meal prep']]};
let DAYS=SCHED[3];
function syncSched(){DAYS=SCHED[S.tfreq===2?2:3]}
/* Level: 1 green, 2 blue, 3 black. "auto" follows the calendar week. */
function lvlOf(w,pi){const o=(S.tlevel||{})[pi];if(o&&o!=='auto')return +o;return w<=3?1:w<=6?2:3}
const LV=[null,{cls:'green',name:'Green circle',sub:'Foundation'},{cls:'blue',name:'Blue square',sub:'Strength and power'},{cls:'black',name:'Black diamond',sub:'Ski-specific endurance'}];
const JUMPS=['Lateral skater hops','Drop landings','Squat jumps'], HOLDS=['Wall sit','Side plank','Front plank','Copenhagen plank (knees)','Single-leg balance'];
/* What an exercise looks like at each level: sets and a coaching cue. */
function levelRx(n,rx,lv,w,home){
  const reps=rx.replace(/^\d+ × /,'');const taper=w===8&&lv===3;
  if(JUMPS.includes(n))return lv===1?{rx:'2 × '+reps.replace(/\d+/,m=>Math.max(4,Math.round(m*0.6))),cue:'Small and controlled. Stick every landing for a full second before the next rep.'}:lv===2?{rx:'3 × '+reps,cue:'Jump higher and faster; landings stay quiet, knees over toes.'}:{rx:(taper?'2 × ':'3 × ')+reps,cue:'Continuous rhythm, like linking turns. Stop the set if landings get loud or knees cave in.'};
  if(HOLDS.includes(n))return lv===1?{rx:'2 × '+reps.replace(/(\d+)–(\d+)/,'$1'),cue:'Hold the lower time with perfect form.'}:lv===2?{rx:'3 × '+reps,cue:'Work toward the top of the range; add 5–10 s each week.'}:{rx:(taper?'2 × ':'3 × ')+reps.replace(/(\d+)–(\d+)/,'$2'),cue:home?'Hold the top of the range. Wall sits: hold a loaded backpack on your lap.':'Hold the top of the range. Wall sits: add a weight on your lap.'};
  if(home)return lv===1?{rx:'2–3 × '+reps,cue:'Bodyweight. Finish every set with 2–3 reps left in the tank.'}:lv===2?{rx:'3–4 × '+reps,cue:'No weights needed: take 3 seconds on the lowering part of every rep and pause 1 second. For squats, lunges and step-ups, wear a backpack loaded with books or water bottles to go harder.'}:{rx:(taper?'2 × ':'3 × ')+reps,cue:'Move fast on the way up, or do 1½ reps (down, halfway up, back down, then all the way up). Quality over fatigue.'};
  return lv===1?{rx:'2–3 × '+reps,cue:'Bodyweight or light dumbbells. Finish every set with 2–3 reps left in the tank.'}:lv===2?{rx:'3–4 × '+reps,cue:'Add weight (dumbbells, kettlebell or a loaded backpack). Lower for 3 seconds.'}:{rx:(taper?'2 × ':'3 × ')+reps,cue:'Moderate weight, move with speed on the way up. Quality over fatigue.'};
}
const DNAMES=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DTAG={A:'Legs A',B:'Legs B',C:'Power',A2:'Legs A',B2:'Legs B',Z1:'Cardio',Z2:'Cardio',M:'Stretch',R:'Rest'};
function startDay(){return dayMs(S.startDate)}
function trainPos(){const d=nowDay()-startDay();if(d<0)return {w:1,d:0,before:true,days:-d};const w=Math.floor(d/7)+1;return w>8?{w:8,d:6,after:true}:{w,d:d%7}}
function dayDate(w,d){return new Date((startDay()+(w-1)*7+d)*864e5+12*36e5)}
function phaseOf(w){return PH.find(p=>p.weeks.includes(w))}
function setsFor(rx,w){if(w<=3)return rx.replace(/^3 ×/,'2–3 ×');if(w===8)return rx.replace(/^3 ×/,'2 ×')+' (lighter week)';return rx.replace(/^2 ×/,'3 ×').replace(/^3 ×/,'3–4 ×')}
/* The checklist items for one day of one week. */
function dayItems(w,d,lv){
  lv=lv||lvlOf(w,0);const k=DAYS[d][0], items=[], home=placeOf(w,d)==='home';
  const add=(src,i,key)=>{const [n,rx,desc]=src;const L=levelRx(n,rx,lv,w,home);items.push({key,n,rx:L.rx,cue:L.cue,desc});};
  const set=(key)=>home?homeify(WORK[key].items,key):WORK[key].items.map((x,i)=>[...x,key+i]);
  const addAll=(arr,pick)=>arr.forEach((x,i)=>{if(!pick||pick.includes(i))add(x,i,x[3])});
  if(WORK[k])addAll(set(k));
  if(k==='A2'){addAll(set('A'));addAll(set('C'),[0,1]);}
  if(k==='B2'){addAll(set('B'));addAll(set('C'),[2,3]);}
  if((k==='C'||k==='B2')&&lv===3)items.push({key:'C_run',n:'Ski-run circuit',rx:w===8?'4 rounds':'6 rounds',cue:'Black diamond only.',desc:'45 s wall sit, then 45 s skater hops, then 45 s squat pulses, 45 s rest. Mimics a long run.'});
  if(k==='Z1')items.push(lv===3?{key:'Z1',n:'Intervals',rx:'6–8 × 1 min',cue:'Black diamond: intervals replace one easy session.',desc:home?'1 min hard, 1 min easy: stair climbs, high knees, jumping jacks or a hill sprint outside. Matches the stop-start effort of a ski run.':'1 min hard, 1 min easy on a bike, stairs or incline. Matches the stop-start effort of a ski run.'}:{key:'Z1',n:'Easy cardio',rx:'30–45 min',cue:'',desc:home?'A brisk walk or easy jog outside, walking the stairs, or jump rope, at a pace where you can talk in full sentences.':'Incline walk, bike or rower at a pace where you can talk in full sentences.'});
  if(k==='Z2')items.push({key:'Z2',n:'Long easy cardio',rx:lv>=2?'45–60 min':'30–45 min',cue:'',desc:home?'A hike, long walk or bike ride outside. Altitude helps; bring water.':'A hike, long bike ride or rower. Altitude helps; bring water.'});
  if(k!=='R')MOB.forEach(([n,rx,desc],i)=>items.push({key:'M'+i,n,rx,cue:'',desc,mob:true}));
  return items;
}
/* One verified how-to video per move (titles and channels checked via YouTube oEmbed, Sep 29 2026). */
const VIDS={"Goblet squat": [["https://www.youtube.com/watch?v=nfX7IFK9UNI", "How to do a Goblet Squat", "NASM"]], "Romanian deadlift": [["https://www.youtube.com/watch?v=aa57T45iFSE", "How to do a Dumbbell Romanian Deadlift", "NASM"]], "Reverse lunge": [["https://www.youtube.com/watch?v=94AXT7D3bKY", "How to Perform the Perfect Reverse Lunge", "Airrosti Rehab Centers"]], "Lateral lunge": [["https://www.youtube.com/watch?v=vwK7vZNQwUI", "Lateral lunge: how to do it right", "Revival Performance Physical Therapy"]], "Wall sit": [["https://www.youtube.com/watch?v=JaZNYM3zAP0", "How To Do a Wall Sit", "Well+Good"]], "Tibialis raise + calf raise": [["https://www.youtube.com/watch?v=dnxy5DhY0Ks", "Tibialis Raise (Against Wall)", "Wellth Coaching"], ["https://www.youtube.com/watch?v=76zqVhVfXBE", "Calf Raises: Straight & Bent Knee", "Treat My Achilles"]], "Side plank": [["https://www.youtube.com/watch?v=44ND4bOB-T0", "How to do a Side Plank", "NASM"]], "Rear-foot-elevated split squat": [["https://www.youtube.com/watch?v=GPhpkIWJeec", "Bulgarian Split Squat", "Orillia Sports Medicine and Rehabilitation"]], "Single-leg Romanian deadlift": [["https://www.youtube.com/watch?v=Zfr6wizR8rs", "The BEST Single-Leg RDL Tutorial", "Squat University"]], "Glute bridge with ball squeeze": [["https://www.youtube.com/watch?v=y6kquy65vnc", "Glute Bridge with Adductor Squeeze", "E3 Rehab"]], "Banded monster walk": [["https://www.youtube.com/watch?v=O_GEUdxQETA", "Monster Walks", "KOH Physical Therapy Lab"]], "Copenhagen plank (knees)": [["https://www.youtube.com/watch?v=nhGK-DxiGBE", "Short Lever Copenhagen Plank", "Physio Plus Fitness"]], "Single-leg balance": [["https://www.youtube.com/watch?v=T6Dc8ewTJ9A", "Single Leg Balance Progression", "BSR Physical Therapy"], ["https://www.youtube.com/watch?v=bHSf7d9DmJU", "Unstable surface, eyes closed", "StrongStrides"]], "Dead bug": [["https://www.youtube.com/watch?v=bxn9FBrt4-A", "How to do a Dead Bug", "NASM"]], "Lateral skater hops": [["https://www.youtube.com/watch?v=XDBHOQoAa3w", "Lateral Bound with Stick", "Champion Physical Therapy and Performance"]], "Drop landings": [["https://www.youtube.com/watch?v=dPj88DfrCeQ", "ACL Prevention: Double Leg Drop Land", "St. Elizabeth Healthcare"]], "Squat jumps": [["https://www.youtube.com/watch?v=tZSYZdtbONc", "How to do a Squat Jump", "NASM"]], "Pallof press": [["https://www.youtube.com/watch?v=5_8d8vHgZvU", "Pallof Press: How To + Variations", "Girls Gone Strong"]], "Bird dog": [["https://www.youtube.com/watch?v=xEDnlOxeJH4", "How to Do the Bird Dog Exercise", "Hinge Health (physical therapists)"]], "Front plank": [["https://www.youtube.com/watch?v=A2b2EmIg0dA", "How To Plank: Form, Cues, Progressions", "E3 Rehab"]], "Knee-to-wall ankle rocks": [["https://www.youtube.com/watch?v=NqgwyM9hXMI", "Knee-to-Wall Ankle Mobility Exercise", "Victoria Park Osteopaths"]], "Calf and soleus stretch": [["https://www.youtube.com/watch?v=s5YKoMvnYRE", "Gastrocnemius and Soleus Stretch", "Podiatry Professionals"]], "Couch stretch (hip flexor)": [["https://www.youtube.com/watch?v=KEnMxjF7ipk", "The Couch Stretch", "The Ready State (Kelly Starrett)"]], "90/90 hip switches": [["https://www.youtube.com/watch?v=qq_Z7sAmVrA", "90/90 Hip Switch", "Simone Sports Performance"]], "Figure-4 or pigeon stretch": [["https://www.youtube.com/watch?v=-g0nuyTHMrI", "Piriformis Figure 4 Stretch", "Ask Doctor Jo (physical therapist)"]], "Hamstring stretch": [["https://www.youtube.com/watch?v=LVY692zJK0A", "Standing Hamstring Stretch", "Baptist Health"]], "Cat–cow": [["https://www.youtube.com/watch?v=y39PrKY_4JM", "Cat-Cow Yoga Pose", "Yoga With Adriene"]], "Open book (thoracic rotation)": [["https://www.youtube.com/watch?v=OW6YHlxY6JI", "Open Book Stretch", "TSAOG Orthopaedics & Spine"]], "Child's pose": [["https://www.youtube.com/watch?v=fzM3uSrr4-g", "Child's Pose (Balasana) Tutorial", "High Desert Yogi"]], "Tempo squat": [["https://www.youtube.com/watch?v=l83R5PblSMA", "Leg exercise - How to bodyweight squat (add the 3-second lowering)", "PureGym"]], "Towel hamstring curl": [["https://www.youtube.com/watch?v=GJN8rLhJJ2c", "Slider Hamstring Curls (a towel on a hard floor works the same)", "Train With Cuz"]], "Side-lying hip abduction": [["https://www.youtube.com/watch?v=g9FtnmsIYgI", "Side Lying Hip Abduction", "Baptist Health"], ["https://www.youtube.com/watch?v=dBQXWsdrnfo", "Strengthen your gluteus medius with side-lying hip abduction", "Pain Science Physical Therapy"]], "Plank shoulder taps": [["https://www.youtube.com/watch?v=0PrTUpElJ44", "How to do Plank With Shoulder Tap", "Joanna Soh"]], "Step-up": [["https://www.youtube.com/watch?v=URHdW9js6DM", "Understanding Proper Step Up Form and Technique", "NASM"]], "Ski-run circuit": [["https://www.youtube.com/watch?v=JaZNYM3zAP0", "Wall sit", "Well+Good"], ["https://www.youtube.com/watch?v=XDBHOQoAa3w", "Skater hops (lateral bound)", "Champion Physical Therapy"], ["https://www.youtube.com/watch?v=tZSYZdtbONc", "Squat pulses: same stance as a squat jump, stay low", "NASM"]]};
/* Turn shorthand like "2–3 × 8–12" or "3 × 20–40 s / side" into plain words: sets, reps, seconds. */
function rxText(rx){
  let r=rx.trim(), extra='';
  const par=r.match(/\s*\((.*)\)$/);if(par){extra=' ('+par[1]+')';r=r.replace(/\s*\(.*\)$/,'');}
  const unit=t=>t.replace(/(\d)\s*s\b/g,'$1 seconds').replace(/\b1\s*min\b/g,'1 minute').replace(/(\d)\s*min\b/g,'$1 minutes').replace(/\s*\/\s*side/g,' per side').replace(/\s*\/\s*leg/g,' per leg');
  let m=r.match(/^(\d+(?:–\d+)?) × (.+)$/);
  if(m){const sets=m[1],rest=m[2],isSec=/\d\s*(s|min)\b/.test(rest),isSteps=/steps/.test(rest);
    if(/rounds|1 min$/.test(rest))return `${sets} rounds of ${unit(rest)}`+extra;
    const body=isSec||isSteps?unit(rest):unit(rest).replace(/^(\d+(?:–\d+)?)(?!\s*(?:seconds|minutes))/, '$1 reps');
    return `${sets} sets of ${body}`.replace(' reps each',' reps each')+extra;}
  if(/^\d+(?:–\d+)?\s*\/\s*(side|leg)$/.test(r))return unit(r.replace(/^(\d+(?:–\d+)?)/,'$1 reps'))+extra;
  return unit(r)+extra;
}
function tk(w,d,pi){return `${w}.${d}.${pi}`}
function dayDone(w,d,pi){const it=dayItems(w,d,lvlOf(w,pi)),log=(S.tlog||{})[tk(w,d,pi)]||{};return {done:it.filter(x=>log[x.key]).length,total:it.length}}
function renderTrain(){
  S.tlog=S.tlog||{};const pos=trainPos();
  if(V.tw==null||V.td==null){V.tw=pos.w;V.td=pos.d}
  const w=Math.min(8,Math.max(1,V.tw)), d=Math.min(6,Math.max(0,V.td)), who=shown(), ph=phaseOf(w), items=dayItems(w,d,lvlOf(w,who[0])), dk=DAYS[d], lvs=[...new Set(who.map(pi=>lvlOf(w,pi)))];
  const isToday=!pos.before&&!pos.after&&w===pos.w&&d===pos.d;
  const dateTxt=dayDate(w,d).toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
  let h=`<div class="intro"><h2>Leg, ankle, hip and back plan</h2><p class="muted">${pos.before?`Starts ${dayDate(1,0).toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})} (in ${pos.days} day${pos.days===1?'':'s'}). Here's a preview.`:pos.after?'All 8 weeks are done. Keep the mobility routine going through the season.':`You're in week ${pos.w} of 8.`} Tap each exercise as you finish it.</p></div>
  <div class="glass trainnav">
   <div class="wk"><button type="button" class="btn sm" data-tw="${w-1}" ${w<=1?'disabled':''} aria-label="Previous week">‹</button>
    <div><b>Week ${w} of 8</b> <span class="small muted">· calendar level <span class="mark ${ph.cls}" aria-hidden="true"></span>${esc(ph.name.split(' · ')[0])}</span></div>
    <button type="button" class="btn sm" data-tw="${w+1}" ${w>=8?'disabled':''} aria-label="Next week">›</button></div>
   <div class="days" role="tablist" aria-label="Days">${DAYS.map((x,i)=>{const st=who.map(pi=>dayDone(w,i,pi)),all=st.every(z=>z.done===z.total&&z.total>0),some=st.some(z=>z.done>0),today=!pos.before&&!pos.after&&w===pos.w&&i===pos.d;
     return `<button type="button" role="tab" class="day${i===d?' sel':''}${today?' today':''}" data-td="${i}" aria-selected="${i===d}"><span>${DNAMES[i]}</span><b>${dayDate(w,i).getDate()}</b><em class="dtag ${/^[ABC]/.test(x[0])?'str':''}">${DTAG[x[0]]}</em><i class="dot ${all?'full':some?'part':''}" aria-hidden="true"></i><span class="sr">${x[1]}${all?', done':some?', started':''}</span></button>`}).join('')}</div>
   <p class="small muted" style="margin:0">This week: <b>${DAYS.filter(x=>/^[ABC]/.test(x[0])).length} strength days</b> (${DAYS.map((x,i)=>/^[ABC]/.test(x[0])?DNAMES[i]:null).filter(Boolean).join(', ')}), 2 cardio days, stretching on the rest, Sunday off. Change it with "Strength days a week" below.</p>
   ${pos.before||pos.after||isToday?'':`<button type="button" class="linkish small" data-ttoday>Jump to today</button>`}
  </div>
  <div class="glass levels"><div class="row" style="justify-content:space-between;align-items:center"><h3>Your level</h3>
     <div class="row" style="align-items:center;gap:8px"><span class="label">Strength days a week</span><div class="seg" role="group" aria-label="Strength days a week"><button type="button" data-tfreq="2" aria-pressed="${S.tfreq===2}">2</button><button type="button" data-tfreq="3" aria-pressed="${S.tfreq!==2}">3 (recommended)</button></div></div></div>
    <div class="lvwho">${who.map(pi=>{const o=(S.tlevel||{})[pi]||'auto',L=LV[lvlOf(w,pi)];return `<div class="field"><label class="label" for="lv${pi}">${esc(S.people[pi].name)}: <span class="mark ${L.cls}" aria-hidden="true"></span>${L.name}</label><select id="lv${pi}" data-tlevel="${pi}"><option value="auto" ${o==='auto'?'selected':''}>Follow the calendar (recommended)</option><option value="1" ${o==='1'?'selected':''}>Stay at Green circle</option><option value="2" ${o==='2'?'selected':''}>Blue square</option><option value="3" ${o==='3'?'selected':''}>Black diamond</option></select></div>`}).join('')}</div>
    <details class="lvinfo"><summary>What changes at each level?</summary>
     <p class="small">You do the <b>same exercises</b> at every level. What changes is how hard: sets, weight, speed, and a few additions at Black diamond. Each exercise below shows what to do at your level.</p>
     <div class="grid3">${[1,2,3].map(l=>`<div class="phase ${LV[l].cls}"><h4><span class="mark ${LV[l].cls}" aria-hidden="true"></span>${LV[l].name} · ${LV[l].sub}</h4><p class="small muted">Calendar weeks ${l===1?'1–3':l===2?'4–6':'7–8'}</p><ul class="tight small">${l===1?'<li>Strength moves: 2–3 sets of each exercise, bodyweight or light weight</li><li>Jumps: small, stick every landing</li><li>Holds: the shorter time</li><li>Cardio: 30–45 min easy</li>':l===2?'<li>Strength moves: 3–4 sets of each exercise, add weight, 3-second lowering</li><li>Jumps: higher and faster</li><li>Holds: add 5–10 s a week</li><li>Long cardio: 45–60 min</li>':'<li>Strength moves: 3 sets of each exercise, move with speed</li><li>Jumps: continuous rhythm</li><li><b>Adds</b> the ski-run circuit on power day</li><li><b>Adds</b> intervals in place of one easy cardio</li><li>Week 8 is lighter so you start the season fresh</li>'}</ul></div>`).join('')}</div>
     <p class="small"><b>2 or 3 days?</b> 3 strength days (A, B and power) is the plan as designed. 2 days splits the power and core moves across the two strength days (skater hops and drop landings on day A; squat jumps and Pallof press on day B), so you still train every quality with less total volume. You move through the levels on the same calendar either way.</p>
     <p class="small"><b>Can I start harder?</b> Stay on the calendar unless a level feels easy: every set finished with 2–3 reps to spare and no joint pain. Jumping and landing at Black diamond intensity before your knees and ankles have adapted is the most common way to get hurt, so don't start there. If you miss a week or feel beat up, choose "Stay at" your current level until it feels easy again.</p></details>
  </div>
  <div class="glass daywork"><div class="dayhead"><div><div class="when">${isToday?'Today · ':''}${esc(dateTxt)}</div><h3>${esc(dk[1])}</h3><p class="small muted" style="margin:0">${esc(dk[2])}${w===8?' · lighter week before the season':''}</p></div>
    <div class="prog">${who.map(pi=>{const z=dayDone(w,d,pi);return `<span class="small"><b>${esc(S.people[pi].name)}</b> ${z.done}/${z.total}</span>`}).join('')}</div></div>
   ${dk[0]!=='R'?`<div class="placebar"><div class="seg" role="group" aria-label="Where are you training?"><button type="button" data-place="gym" aria-pressed="${placeOf(w,d)==='gym'}">Gym</button><button type="button" data-place="home" aria-pressed="${placeOf(w,d)==='home'}">Home, no equipment</button></div><span class="small muted">${placeOf(w,d)==='home'?'Bodyweight version: moves that need gym gear are swapped for home ones that train the same muscles.':'Uses dumbbells or a kettlebell, a bench, a resistance band and cardio machines.'}${(S.tplace.d||{})[w+'.'+d]&&S.tplace.d[w+'.'+d]!==S.tplace.def?` <button type="button" class="linkish small" data-placedef="${placeOf(w,d)}">Make ${placeOf(w,d)==='home'?'home':'gym'} my default</button>`:''}</span></div>`:''}
   ${dk[0]==='R'?`<p>Rest day. Walk if you like, and run the Sunday meal prep.</p>`:''}
   ${items.length?`<ul class="xlist">${items.map((it,ix)=>`${it.mob&&(ix===0||!items[ix-1].mob)?`<li class="xsec">Mobility · about 10 min</li>`:''}<li class="xrow"><div class="xchecks">${who.map(pi=>{const on=!!((S.tlog[tk(w,d,pi)]||{})[it.key]);return `<button type="button" class="xc" data-x="${w}|${d}|${pi}|${it.key}" aria-pressed="${on}" aria-label="${esc(S.people[pi].name)}: ${esc(it.n)} ${on?'done':'not done'}"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>${who.length>1?`<span>${esc(S.people[pi].name[0])}</span>`:''}</button>`}).join('')}</div>
     <details><summary><b>${esc(it.n)}</b><span class="rx">${esc(rxText(it.rx))}</span></summary>${it.cue?`<p class="small lvcue"><span class="mark ${LV[lvlOf(w,who[0])].cls}" aria-hidden="true"></span>${esc(it.cue)}</p>`:''}${lvs.length>1&&it.cue&&!it.mob?who.slice(1).filter(pi=>lvlOf(w,pi)!==lvlOf(w,who[0])).map(pi=>{const src=ALLX.find(x=>x[0]===it.n);if(!src)return '';const L=levelRx(src[0],src[1],lvlOf(w,pi),w,placeOf(w,d)==='home');return `<p class="small lvcue"><span class="mark ${LV[lvlOf(w,pi)].cls}" aria-hidden="true"></span>${esc(S.people[pi].name)}: ${esc(rxText(L.rx))}. ${esc(L.cue)}</p>`}).join(''):''}${figFor(it.n)}<p class="small muted">${esc(it.desc)}</p>${(VIDS[it.n]||[]).map(([u,t,c])=>`<a class="small vid" href="${u}" target="_blank" rel="noopener">▶ ${esc(t)} <span class="muted">· ${esc(c)}</span></a>`).join('')}${it.n==='Hamstring stretch'?'<span class="small muted" style="display:block">The video shows it standing; resting your heel on a low step works the same way.</span>':''}</details></li>`).join('')}</ul>`:''}
   ${items.length?`<div class="row" style="margin-top:12px">${who.map(pi=>`<button type="button" class="btn sm" data-xall="${w}|${d}|${pi}">Mark all done${who.length>1?' · '+esc(S.people[pi].name):''}</button>`).join('')}</div>`:''}
  </div>
  <div class="glass"><h3>8-week progress</h3><p class="small muted">Each square is a day. Tap one to open it.</p>
   <div class="heat">${who.map(pi=>`<div><span class="small"><b>${esc(S.people[pi].name)}</b></span><div class="hgrid">${[1,2,3,4,5,6,7,8].map(ww=>DAYS.map((x,i)=>{const z=dayDone(ww,i,pi),r=z.total?z.done/z.total:0,cur=ww===w&&i===d;return `<button type="button" class="hc${cur?' cur':''}" data-go-day="${ww}|${i}" style="--r:${r}" aria-label="Week ${ww} ${DNAMES[i]}: ${z.done} of ${z.total}"></button>`}).join('')).join('')}</div></div>`).join('')}</div></div>
  <details class="glass"><summary>About the plan: phases, start date and safety</summary>
   <div class="row" style="margin:10px 0"><div class="field"><label class="label" for="startDate">Week 1 starts (a Monday)</label><input id="startDate" type="date" value="${S.startDate}"></div></div>
   <div class="grid3">${PH.map(p=>`<div class="phase ${p.cls}"><h4><span class="mark ${p.cls}" aria-hidden="true"></span>${p.name}</h4><p class="small muted">Weeks ${p.weeks.join(', ')}</p><p class="small">${p.rx}</p></div>`).join('')}</div>
   <p class="note small" style="margin-top:12px">Warm up 5–10 min first. Skip or scale any move that causes sharp or joint pain. If either of you has a past knee, back or ankle injury, have a physical therapist check these moves first.</p></details>`;
  $('tab-train').innerHTML=h;
}
function renderEnergy(){
  $('energyBox').innerHTML=`<div class="intro"><h2>Eating to stay energized, not drained</h2><p class="muted">Why this plan is set up the way it is, and what to adjust if either of you feels flat.</p></div>
  <div class="grid2">
   <div class="glass"><h3>Built in</h3><ul class="tight">
    <li><b>A moderate deficit by default.</b> 10–20% below maintenance. Big cuts raise fatigue and cost muscle; slower loss preserves lean mass better. The optional aggressive cut (−25%) offsets that with more protein, a calorie floor and a 6–8 week limit.</li>
    <li><b>High protein at every meal.</b> 1.6–2.2 g per kg of body weight, spread over 4 eatings of roughly 25–45 g each. Protein keeps you full and protects muscle while you lose fat.</li>
    <li><b>Carbs stay in.</b> When calories and protein are matched, low-carb and higher-carb diets give similar fat loss. Carbs fuel the leg training and ski days, so the plan keeps them and lets you swap the source.</li>
    <li><b>Fiber target.</b> 14 g per 1,000 kcal. Beans, lentils, potatoes with skin, oats, whole-wheat pasta and vegetables slow digestion, which smooths out the post-lunch dip.</li>
    <li><b>Fat floor.</b> At least 0.8 g/kg (and 25% of calories) to support hormones and keep meals satisfying.</li></ul></div>
   <div class="glass"><h3>Day-to-day habits</h3><ul class="tight">
    <li><b>Front-load carbs</b> around training: breakfast and the meal after a workout get the bigger portions.</li>
    <li><b>Lunch:</b> pick higher-fiber carbs (brown rice, sweet potato, beans, whole-wheat pasta) over white rice or noodles if afternoons feel sleepy.</li>
    <li><b>Hydrate:</b> dry Colorado air and altitude increase water loss through breathing. Aim for pale-yellow urine; add electrolytes on ski and hard training days.</li>
    <li><b>Caffeine</b> before about 2 pm so it doesn't cost you sleep; 7–9 hours of sleep is when the legs adapt.</li>
    <li><b>Iron and vitamin D:</b> worth a routine blood test with your doctor before winter, especially if one of you feels tired despite eating enough. Red meat, lentils, spinach and beans are the iron sources in this plan.</li></ul></div>
   <div class="glass"><h3>Ski-day fueling</h3><ul class="tight">
    <li>Breakfast 2–3 h before first chair: the oats or potato hash with an extra banana.</li>
    <li>Every 90–120 min on the hill: 30–60 g carbs (banana + PB, a bar, trail mix) and water. The Targets tab shows how much to add back for your hours.</li>
    <li>After skiing: the shake or a full prep meal within about 2 hours.</li>
    <li>No deficit on ski days. Eat at maintenance so legs recover for day two.</li></ul></div>
   <div class="glass"><h3>Adjust every 2 weeks</h3><ul class="tight">
    <li>Weigh in 3–4 mornings a week and use the average.</li>
    <li>Losing more than 1% of body weight per week, or feeling flat: add 150–200 kcal, mostly carbs (about 40–50 g).</li>
    <li>No change after 3 weeks: drop 100–150 kcal from fat or carbs. Keep protein where it is.</li>
    <li>Strength going up and waist going down while the scale barely moves is recomposition, the goal you described. Track a waist measurement too.</li></ul></div>
  </div>
  <div class="glass"><h3>Sources</h3><ul class="src">
   <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5470183/" target="_blank" rel="noopener">ISSN position stand: diets and body composition (Aragon et al., 2017)</a></li>
   <li><a href="https://link.springer.com/article/10.1186/s12970-017-0177-8" target="_blank" rel="noopener">ISSN position stand: protein and exercise (Jäger et al., 2017)</a></li>
   <li><a href="https://www.sciencedirect.com/science/article/pii/S0002916522065595" target="_blank" rel="noopener">Higher protein during an energy deficit with training (Longland et al., AJCN 2016)</a></li>
   <li><a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener">USDA FoodData Central (all food values; SR Legacy entries)</a></li>
   <li><a href="https://www.dietaryguidelines.gov/" target="_blank" rel="noopener">Dietary Guidelines for Americans: fiber 14 g per 1,000 kcal</a></li>
   <li><a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety" target="_blank" rel="noopener">USDA FSIS: leftovers keep 3–4 days refrigerated</a></li>
   <li><a href="https://bsmfoundation.ca/knees4skis-8-essential-exercises-to-help-reduce-knee-injury/" target="_blank" rel="noopener">BSM Foundation: Knees4Skis injury-prevention exercises</a></li>
   <li><a href="https://www.rei.com/learn/expert-advice/how-to-train-for-skiing.html" target="_blank" rel="noopener">REI: how to train for skiing (6–8 weeks, 2–3×/week)</a></li>
   <li><a href="https://pacompendium.com/" target="_blank" rel="noopener">Compendium of Physical Activities: downhill skiing ≈ 5.3 METs</a></li>
  </ul><p class="small muted">This is general guidance, not medical advice. Check with a doctor before starting if either of you has a health condition.</p></div>`;
}

const LOOKS=[
 ['aurora','Aurora','Frosted glass over a soft color field',['#f0b394','#97d3b5','#0f4f5c'],'#d2dce3'],
 ['graphite','Graphite health','Clean off-white or true black, big numbers',['#141414','#e2462a','#e6e4df'],'#f5f4f1'],
 ['swiss','Swiss precision','White, black rules, one red, sharp grid',['#000000','#e3001b','#d0d0d0'],'#ffffff'],
 ['perf','Dark performance','Near-black, sport type, orange, dense',['#ff7a1a','#4fb3ff','#2a2a2e'],'#0b0b0c'],
 ['tonal','Tonal soft','Friendly tonal colors and soft shapes',['#4f46b8','#dcd8ff','#a2419a'],'#f7f2fa']];
function renderLooks(){const el=$('looksBox');if(!el)return;
  el.innerHTML=`<h3>App style</h3><p class="small muted">Pick a template and it becomes the standard: it's saved to your shared plan, so it opens this way for both of you until you change it. The Style menu at the top switches it too.</p>
  <div class="looks" style="margin-top:12px">${LOOKS.map(([id,n,d,c,bg])=>`<button type="button" class="look" data-look="${id}" aria-pressed="${(S.ui||'aurora')===id}"><div class="sw" style="background:${bg}">${c.map((x,i)=>`<i style="background:${x};height:${[34,54,24][i]}px"></i>`).join('')}</div><div class="meta"><b>${n}${(S.ui||'aurora')===id?' · standard':''}</b><span>${d}</span></div></button>`).join('')}</div>`;}
function renderAll(){normalize();syncBlocks();syncSched();applyUI();renderLooks();chips();renderTargets();renderLooks();renderEnergy();renderMeals();renderSwap();renderGrocery();renderTrain();renderToday();}

/* ============ EVENTS ============ */
$('tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(!b)return;showTab(b.dataset.tab);});
function showTab(t){if(t==='today')renderToday();if(t==='train'){const p=trainPos();V.tw=p.w;V.td=p.d;renderTrain();}document.querySelectorAll('#tabs button').forEach(x=>x.setAttribute('aria-selected',x.dataset.tab===t));document.querySelectorAll('section.tab').forEach(s=>s.hidden=s.id!=='tab-'+t);try{localStorage.setItem('slope-ready-tab',t)}catch(e){};window.scrollTo(0,0)}
const app=$('app');
app.addEventListener('input',e=>{
  const t=e.target;
  const pEl=t.closest('[data-person]');
  if(pEl&&t.dataset.k){const i=+pEl.dataset.person,k=t.dataset.k;let v=t.value;
    if(k!=='name'&&k!=='sex'){v=parseFloat(v);
      if(k==='goalLb'){if(t.value===''||v===0)v=0;else if(!(v>=80&&v<=450))return;}
      else{const lo=parseFloat(t.min),hi=parseFloat(t.max);if(!isFinite(v)||(isFinite(lo)&&v<lo)||(isFinite(hi)&&v>hi))return;}}
    if(k==='name'&&!v.trim())return;
    S.people[i][k]=v;S.people[i].example=false;
    chips();renderTargetResults();renderMeals();renderGrocery();renderToday();if(k==='name')renderTrain();save();return;}
  if(t.id==='skiHours'){S.skiHours=parseFloat(t.value)||0;renderTargetResults();save();return}
  if(t.id==='swG'){SW.g=parseFloat(t.value)||0;renderSwapOut();saveSW();return}
});
app.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.photo){addPhoto(t.dataset.photo,t.files&&t.files[0]);return}
  if(t.dataset.recipe){const [w,b,sl]=t.dataset.recipe.split('.');S.weeks[+w][b][sl]=t.value;delete S.wswaps[t.dataset.recipe];renderMeals();renderGrocery();renderToday();save();$('r-'+t.dataset.recipe)?.focus();return}
  if(t.dataset.swap){const key=t.dataset.swap;S.wswaps[key]=Object.assign({},S.wswaps[key],{[t.dataset.role]:t.value});renderMeals();renderGrocery();save();$((t.dataset.role==='C'?'c-':'p-')+key)?.focus();return}
  if(t.dataset.train){if(t.checked)S.train[t.dataset.train]=true;else delete S.train[t.dataset.train];renderToday();save();return}
  if(t.id==='monthStart'&&t.value){S.monthStart=t.value;renderMeals();renderGrocery();renderToday();save();return}
  if(t.id==='startDate'&&t.value){S.startDate=t.value;renderTrain();save();return}
  if(t.dataset.pantry){const v=parseFloat(t.value);S.pantry=S.pantry||{};if(v>0)S.pantry[t.dataset.pantry]=v*UNITS[S.unit];else delete S.pantry[t.dataset.pantry];renderGrocery();renderToday();save();$('pan-'+t.dataset.pantry)?.focus();return}
  if(t.dataset.tlevel!==undefined){S.tlevel=S.tlevel||{};S.tlevel[t.dataset.tlevel]=t.value;renderTrain();renderToday();save();return}
  if(t.id==='storeSel'){S.store=t.value;renderGrocery();save();return}
  if(t.id==='shopSel'){S.shopSel=t.value==='cur'||t.value==='month'||t.value==='next2'?t.value:+t.value;renderGrocery();save();return}
  if(t.dataset.staple!==undefined){if(t.checked)S.staples[t.dataset.staple]=true;else delete S.staples[t.dataset.staple];renderGrocery();save();return}
  if(t.id==='unit'){S.unit=t.value;renderGrocery();save();return}
  if(t.id==='swU'){SW.unit=t.value;renderSwapOut();saveSW()}
  if(t.id==='swF'){SW.from=t.value;renderSwap();saveSW()}
  if(t.id==='swT'){SW.to=t.value;renderSwap();saveSW()}
});
applyUI();
function setUI(v){S.ui=v;applyUI();renderToday();renderLooks();save();}
$('uiSel').addEventListener('change',e=>setUI(e.target.value));
$('whoSeg').addEventListener('click',e=>{const b=e.target.closest('[data-who]');if(!b)return;V.who=b.dataset.who==='both'?'both':+b.dataset.who;saveV();chips();renderMeals();renderToday();});
app.addEventListener('click',e=>{
  const xc=e.target.closest('[data-x]');if(xc){const [w,d,pi,key]=xc.dataset.x.split('|');const k=tk(w,d,pi);S.tlog=S.tlog||{};const lg=S.tlog[k]=S.tlog[k]||{};if(lg[key])delete lg[key];else lg[key]=true;renderTrain();renderToday();save();document.querySelector(`[data-x="${xc.dataset.x}"]`)?.focus();return}
  const xa=e.target.closest('[data-xall]');if(xa){const [w,d,pi]=xa.dataset.xall.split('|');const k=tk(w,d,pi);S.tlog=S.tlog||{};const lg=S.tlog[k]=S.tlog[k]||{};dayItems(+w,+d,lvlOf(+w,+pi)).forEach(it=>lg[it.key]=true);renderTrain();renderToday();save();return}
  const pl=e.target.closest('[data-place]');if(pl){const w=Math.min(8,Math.max(1,V.tw)),d=Math.min(6,Math.max(0,V.td)),v=pl.dataset.place;S.tplace=S.tplace||{def:'gym',d:{}};S.tplace.d=S.tplace.d||{};if(v===S.tplace.def)delete S.tplace.d[w+'.'+d];else S.tplace.d[w+'.'+d]=v;renderTrain();renderToday();save();return}
  const pd=e.target.closest('[data-placedef]');if(pd){const v=pd.dataset.placedef;S.tplace.def=v;for(const k in S.tplace.d)if(S.tplace.d[k]===v)delete S.tplace.d[k];renderTrain();renderToday();save();return}
  const tf=e.target.closest('[data-tfreq]');if(tf){S.tfreq=+tf.dataset.tfreq;syncSched();renderTrain();renderToday();save();return}
  const tw=e.target.closest('[data-tw]');if(tw){V.tw=+tw.dataset.tw;saveV();renderTrain();return}
  const td=e.target.closest('[data-td]');if(td){V.td=+td.dataset.td;saveV();renderTrain();return}
  const gd=e.target.closest('[data-go-day]');if(gd){const [w,d]=gd.dataset.goDay.split('|');V.tw=+w;V.td=+d;saveV();renderTrain();document.querySelector('.daywork')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest('[data-ttoday]')){const p=trainPos();V.tw=p.w;V.td=p.d;saveV();renderTrain();return}
  const pk=e.target.closest('[data-pick]');if(pk){openPicker(pk.dataset.pick,pk.dataset.type);return}
  const rp=e.target.closest('[data-rmphoto]');if(rp){const rid=rp.dataset.rmphoto,old=S.photos[rid];delete S.photos[rid];save();renderMeals();renderToday();if(assets&&old)assets.delete(old).catch(()=>{});return}
  const lk=e.target.closest('[data-look]');if(lk){setUI(lk.dataset.look);return}
  const g=e.target.closest('[data-go]');if(g){showTab(g.dataset.go);return}
  const ml=e.target.closest('[data-meals]');if(ml){S.meals=+ml.dataset.meals;renderMeals();renderGrocery();renderToday();save();return}
  const su=e.target.closest('[data-sunday]');if(su){S.sunday=su.dataset.sunday==='1';syncBlocks();renderMeals();renderGrocery();renderToday();save();return}
  const wk=e.target.closest('[data-week]');if(wk){V.week=+wk.dataset.week;saveV();renderMeals();return}
  const cpw=e.target.closest('[data-copyweek]');if(cpw){const w=+cpw.dataset.copyweek,n=(w+1)%4;S.weeks[n]=clone(S.weeks[w]);for(const k of Object.keys(S.wswaps))if(k.startsWith(n+'.'))delete S.wswaps[k];for(const k of Object.keys(S.wswaps))if(k.startsWith(w+'.'))S.wswaps[n+k.slice(1)]=clone(S.wswaps[k]);renderMeals();renderGrocery();save();$('copyWeekMsg').textContent=`Week ${w+1} copied into week ${n+1}.`;return}
  const bl=e.target.closest('[data-block]');if(bl){V.block=bl.dataset.block;saveV();renderMeals();return}
  const ea=e.target.closest('[data-eat]');if(ea){const [i,sid]=ea.dataset.eat.split('.');const d=todayKey();S.log=S.log||{};
    for(const k of Object.keys(S.log))if(k<new Date(Date.now()-14*864e5).toISOString().slice(0,10))delete S.log[k];
    S.log[d]=S.log[d]||{};S.log[d][i]=S.log[d][i]||{};if(S.log[d][i][sid])delete S.log[d][i][sid];else S.log[d][i][sid]=true;renderToday();save();$('app').querySelector(`[data-eat="${i}.${sid}"]`)?.focus();return}
  const m=e.target.closest('[data-mode]');if(m){SW.mode=m.dataset.mode;renderSwap();saveSW();return}
  const b=e.target.closest('button');if(!b)return;S.pantry=S.pantry||{};
  if(b.dataset.got){const id=b.dataset.got;const need=needForWeeks(shopWeeks()).tot[id]||0;const have=S.pantry[id]||0;const p=packFor(id,Math.max(0,need-have),S.store||'mix');S.pantry[id]=have+(p?p.got:Math.max(0,need-have));renderGrocery();renderToday();save();return}
  if(b.dataset.clear){delete S.pantry[b.dataset.clear];renderGrocery();renderToday();save();return}
  if(b.dataset.use){const bi=+b.dataset.use,used=blockNeed(+b.dataset.useweek,bi);let n=0;for(const id in used){if(S.pantry[id]){S.pantry[id]=Math.max(0,S.pantry[id]-used[id]);if(S.pantry[id]<1)delete S.pantry[id];n++}}renderGrocery();save();$('useMsg').textContent=n?`Subtracted week ${+b.dataset.useweek+1} ${BLOCKS[bi].name.toLowerCase()} amounts from ${n} items.`:'Nothing to subtract: none of those items were logged at home.';return}
  if(b.dataset.act==='add'){const id=$('addFood').value,v=parseFloat($('addAmt').value);if(!(v>0))return;S.pantry[id]=(S.pantry[id]||0)+v*UNITS[S.unit];renderGrocery();save();return}
  if(b.dataset.act==='copy'){const txt=shoppingText();const msg=$('copyMsg');
    const fallback=()=>{msg.innerHTML='';const ta=document.createElement('textarea');ta.value=txt;ta.rows=8;ta.style.width='100%';msg.appendChild(ta);ta.select();};
    try{navigator.clipboard.writeText(txt).then(()=>msg.textContent='Copied. Paste it into Notes or a text.',fallback)}catch(err){fallback()}return}
});
function saveSW(){try{localStorage.setItem('slope-ready-swap',JSON.stringify(SW))}catch(e){}}

/* ---------- dish picker with photos ---------- */
let pickKey=null;
function openPicker(key,type){pickKey=key;const [w,b,sl]=key.split('.');const cur=recIdOf(+w,b,sl);
  const list=Object.entries(R).filter(([,r])=>type==='breakfast'?r.type==='breakfast':type==='snack'?r.type==='snack':r.type==='main');
  $('pickTitle').textContent='Choose a '+(type==='main'?'lunch or dinner':type);
  $('pickGrid').innerHTML=list.map(([id,r])=>{const u=photoUrl(id),t=TINTS[r.type];return `<div class="pk-wrap"><button type="button" class="pk" data-choose="${id}" aria-current="${id===cur}">${u?`<img class="img" src="${u}" alt="" loading="lazy">`:`<span class="img ph" style="background:linear-gradient(135deg,${t[0]},${t[1]})">${initials(r.name)}</span>`}<span class="meta"><b>${esc(r.name)}</b><span>${r.src?`★ ${r.src.rating} · ${r.src.count.toLocaleString()} ratings · ${esc(r.src.site)}`:'House staple'}</span>${r.pm?`<span class="tag-fresh">${r.pm.mode==='fresh'?`No prep · ${r.pm.min} min`:'No cooking · jars'}</span>`:''}</span></button>${r.src&&!u?`<a class="pk-src" href="${r.src.url}" target="_blank" rel="noopener">See photo ↗</a>`:''}</div>`}).join('');
  const d=$('picker');try{d.showModal()}catch(e){d.setAttribute('open','')}
}
function closePicker(){const d=$('picker');try{d.close()}catch(e){d.removeAttribute('open')};if(pickKey)$('r-'+pickKey)?.focus();}
$('picker').addEventListener('click',e=>{
  if(e.target===$('picker')||e.target.closest('[data-closepick]')){closePicker();return}
  const c=e.target.closest('[data-choose]');if(c&&pickKey){const [w,b,sl]=pickKey.split('.');S.weeks[+w][b][sl]=c.dataset.choose;delete S.wswaps[pickKey];closePicker();renderMeals();renderGrocery();renderToday();save();$('r-'+pickKey)?.focus();}
});
/* Resize a photo in the browser before storing it, so pages stay fast. */
function shrink(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const m=1200,k=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);c.toBlob(b=>b?res(b):rej(new Error('encode')),'image/jpeg',0.84);URL.revokeObjectURL(img.src)};img.onerror=()=>rej(new Error('read'));img.src=URL.createObjectURL(file)})}
async function addPhoto(rid,file){if(!assets||!file)return;setSync('Uploading photo…');
  try{const blob=await shrink(file);const r=await assets.upload(blob,{type:'image/jpeg'});const old=(S.photos||{})[rid];S.photos=S.photos||{};S.photos[rid]=r.id;save();renderMeals();renderToday();setSync('Photo saved');
    if(old)try{await assets.delete(old)}catch(e){}}
  catch(e){setSync(e&&e.code==='quota_exceeded'?'Photo storage is full: remove a photo first':'Photo not saved. Try a JPG or PNG under 20 MB.')}}

/* ---------- Exercise diagrams: original stick figures, start → finish ----------
   Angles in degrees. Legs/arms: absolute angle from straight down (+ = toward the way the figure faces).
   t = torso angle from upright (+ = leaning forward). Poses auto-sit on the floor unless ng (no ground). */
const FL={torso:27,thigh:21,shin:21,foot:7,ua:14,fa:13,neck:9,head:5.5};
function fk(p){
  const r=d=>d*Math.PI/180, dir=(a)=>[Math.sin(r(a)),Math.cos(r(a))];
  const hip=[p.x||50,0], t=p.t||0, sh=[hip[0]+FL.torso*Math.sin(r(t)),hip[1]-FL.torso*Math.cos(r(t))];
  const hd=[sh[0]+FL.neck*Math.sin(r(t+(p.hd||0))),sh[1]-FL.neck*Math.cos(r(t+(p.hd||0)))];
  const leg=(L)=>{const k=[hip[0]+FL.thigh*dir(L[0])[0],hip[1]+FL.thigh*dir(L[0])[1]],an=[k[0]+FL.shin*dir(L[1])[0],k[1]+FL.shin*dir(L[1])[1]],fl=p.front?3.5:FL.foot,c=L[2]==null?(p.front?(L[0]>=0?90:-90):90):L[2],to=[an[0]+fl*dir(c)[0],an[1]+fl*dir(c)[1]];return [k,an,to]};
  const arm=(A)=>{const e=[sh[0]+FL.ua*dir(A[0])[0],sh[1]+FL.ua*dir(A[0])[1]],h=[e[0]+FL.fa*dir(A[1])[0],e[1]+FL.fa*dir(A[1])[1]];return [e,h]};
  const [kn1,an1,to1]=leg(p.l1),[kn2,an2,to2]=leg(p.l2||p.l1),[el1,ha1]=arm(p.a1||[0,0]),[el2,ha2]=arm(p.a2||p.a1||[0,0]);
  const P={hip,sh,hd,kn1,an1,to1,kn2,an2,to2,el1,ha1,el2,ha2};
  let dy;
  if(p.ng){dy=(p.y||50)-hip[1]}else{let m=-1e9;for(const k of ['an1','to1','an2','to2','kn1','kn2','ha1','ha2','el1','el2','sh','hip'])m=Math.max(m,P[k][1]);m=Math.max(m,hd[1]+FL.head);dy=88-(p.lift||0)-m;}
  const sc=p.sc||1;for(const k in P)P[k]=[50+(P[k][0]-50)*sc,88+(P[k][1]+dy-88)*sc];
  return P;
}
function figSVG(p,props,label){
  const P=fk(p), L=(a,b,c)=>`<path d="M${P[a][0].toFixed(1)} ${P[a][1].toFixed(1)}L${P[b][0].toFixed(1)} ${P[b][1].toFixed(1)}${c?`L${P[c][0].toFixed(1)} ${P[c][1].toFixed(1)}`:''}"/>`;
  const body=()=>{if(p.arch){const mx=(P.hip[0]+P.sh[0])/2,my=(P.hip[1]+P.sh[1])/2-p.arch;return `<path d="M${P.hip[0].toFixed(1)} ${P.hip[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${P.sh[0].toFixed(1)} ${P.sh[1].toFixed(1)}L${P.hd[0].toFixed(1)} ${P.hd[1].toFixed(1)}"/>`}return L('hip','sh','hd')};
  let pr='';
  for(const q of (props||[])){const at=q.at&&P[q.at];
    if(q.t==='wall')pr+=`<rect x="${q.x}" y="8" width="4" height="80" class="pr"/>`;
    if(q.t==='floor')pr+='';
    if(q.t==='bench'){const y=at[1]+2.5;pr+=`<rect x="${(at[0]-(q.w||16)/2).toFixed(1)}" y="${y.toFixed(1)}" width="${q.w||16}" height="${(88-y).toFixed(1)}" rx="1.5" class="pr"/>`}
    if(q.t==='box'){const y=at[1]+2.5;pr+=`<rect x="${(at[0]-11).toFixed(1)}" y="${y.toFixed(1)}" width="22" height="${(88-y).toFixed(1)}" rx="1.5" class="pr"/>`}
    if(q.t==='pad')pr+=`<ellipse cx="${at[0].toFixed(1)}" cy="${(at[1]+2.5).toFixed(1)}" rx="9" ry="2.5" class="pr"/>`;
    if(q.t==='db')pr+=`<rect x="${(at[0]-4.5).toFixed(1)}" y="${(at[1]-2).toFixed(1)}" width="9" height="4" rx="1.5" class="wt"/>`;
    if(q.t==='kb')pr+=`<circle cx="${at[0].toFixed(1)}" cy="${(at[1]+2).toFixed(1)}" r="4" class="wt"/>`;
    if(q.t==='ball')pr+=`<circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="3.5" class="ac"/>`;
    if(q.t==='band')pr+=`<path d="M${P[q.a][0].toFixed(1)} ${P[q.a][1].toFixed(1)}L${P[q.b][0].toFixed(1)} ${P[q.b][1].toFixed(1)}" class="bd"/>`;
    if(q.t==='anchor')pr+=`<rect x="${q.x}" y="20" width="3" height="68" class="pr"/><path d="M${q.x+3} ${at[1].toFixed(1)}L${at[0].toFixed(1)} ${at[1].toFixed(1)}" class="bd"/>`;
    if(q.t==='arrow'){const [x1,y1,x2,y2]=q.p;pr+=`<path d="M${x1} ${y1}L${x2} ${y2}" class="arw" marker-end="url(#ah)"/>`}
  }
  const far=`<g class="far">${L('hip','kn2','an2')}${L('an2','to2')}${L('sh','el2','ha2')}</g>`, near=`<g class="near">${L('hip','kn1','an1')}${L('an1','to1')}${L('sh','el1','ha1')}${body()}<circle cx="${P.hd[0].toFixed(1)}" cy="${P.hd[1].toFixed(1)}" r="${(FL.head*(p.sc||1)).toFixed(1)}" class="hd"/></g>`;
  return `<figure class="fig"><svg viewBox="0 0 100 94" role="img" aria-label="${label}"><defs><marker id="ah" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" class="arh"/></marker></defs><line x1="2" y1="88.5" x2="98" y2="88.5" class="gr"/>${pr}${far}${near}</svg><figcaption>${label}</figcaption></figure>`;
}
/* Standing basics */
const ST={t:0,l1:[0,0],l2:[0,0],a1:[5,5],a2:[-5,-5]};
const sp=(o)=>Object.assign({},ST,o);
const FIGS={
 'Goblet squat':[sp({a1:[25,165],a2:[25,165]}),{x:44,t:32,l1:[80,-25],l2:[80,-25],a1:[40,175],a2:[40,175]},[{t:'kb',at:'ha1'}],['Stand tall, weight at chest','Sit hips back and down']],
 'Romanian deadlift':[sp({l1:[4,0],l2:[4,0],a1:[0,0],a2:[0,0]}),{x:38,t:78,l1:[14,-4],l2:[14,-4],a1:[0,0],a2:[0,0]},[{t:'db',at:'ha1'}],['Soft knees, weights at thighs','Push hips back, flat back']],
 'Reverse lunge':[sp({}),{x:52,t:4,l1:[82,0],l2:[-22,-95,-15],a1:[3,3],a2:[-3,-3]},[],['Stand tall','Step back, back knee toward floor']],
 'Lateral lunge':[{front:1,t:0,l1:[12,12],l2:[-12,-12],a1:[20,60],a2:[-20,-60]},{front:1,x:62,t:18,l1:[62,-12],l2:[-58,-58],a1:[35,80],a2:[25,80]},[],['Feet together (front view)','Big step to the side, sit into that hip']],
 'Wall sit':[sp({x:44,a1:[10,10],a2:[10,10]}),{x:40,t:0,l1:[90,0],l2:[90,0],a1:[20,20],a2:[20,20]},[{t:'wall',x:31}],['Back against the wall','Slide down, thighs level']],
 'Tibialis raise + calf raise':[{x:48,t:-8,l1:[16,16,130],l2:[16,16,130],a1:[-10,-10],a2:[-10,-10]},sp({x:50,l1:[0,0,35],l2:[0,0,35],a1:[5,5]}),[{t:'wall',x:36}],['Tibialis: back on wall, lift toes','Calf raise: rise onto the balls of your feet']],
 'Side plank':[{x:48,t:78,l1:[-84,-84,-80],l2:[-84,-84,-80],a1:[4,92],a2:[178,178]},{x:48,t:68,l1:[-68,-68,-80],l2:[-68,-68,-80],a1:[0,90],a2:[178,178]},[],['On your forearm, hips down','Lift hips into a straight line']],
 'Rear-foot-elevated split squat':[{x:52,t:3,l1:[14,0],l2:[-32,-78,-50],a1:[3,3],a2:[-3,-3]},{x:50,t:10,l1:[76,-10],l2:[-12,-88,-50],a1:[5,5],a2:[-5,-5]},[{t:'bench',at:'to2',w:18}],['Back foot on a bench','Drop straight down, front knee over middle toes']],
 'Single-leg Romanian deadlift':[sp({x:50,l2:[-8,-8],a1:[0,0],a2:[0,0]}),{x:48,t:86,l1:[10,-4],l2:[-88,-88,-90],a1:[0,0],a2:[0,0]},[{t:'db',at:'ha1'}],['Stand on one leg','Hinge; back leg and chest move together']],
 'Glute bridge with ball squeeze':[{ng:1,y:84,x:52,t:-92,l1:[132,12],l2:[132,12],a1:[92,92],a2:[92,92],hd:0},{ng:1,y:72,x:54,t:-68,l1:[100,2],l2:[100,2],a1:[96,92],a2:[96,92]},[{t:'ball',at:'kn1'}],['On your back, ball between knees','Squeeze and lift hips']],
 'Banded monster walk':[{front:1,x:50,t:8,l1:[14,4],l2:[-14,-4],a1:[25,110],a2:[-25,-110]},{front:1,x:50,t:8,l1:[24,6],l2:[-24,-6],a1:[25,110],a2:[-25,-110]},[{t:'band',a:'kn1',b:'kn2'}],['Band above knees, half squat','Wide steps, knees push out']],
 'Copenhagen plank (knees)':[{x:46,t:80,l1:[-84,-84,-80],l2:[-30,5],a1:[4,92],a2:[140,140]},{x:46,t:70,l1:[-72,-72,-80],l2:[-40,-10],a1:[0,90],a2:[160,160]},[{t:'bench',at:'kn1',w:22}],['Top knee on bench, forearm down','Lift hips; bottom leg hangs']],
 'Single-leg balance':[sp({a1:[20,20],a2:[-20,-20]}),sp({l2:[70,0],a1:[70,80],a2:[-70,-80]}),[{t:'pad',at:'to1'}],['Stand tall','Lift one knee; progress to eyes closed or a cushion']],
 'Dead bug':[{ng:1,y:78,x:56,t:-90,l1:[178,92],l2:[178,92],a1:[178,178],a2:[178,178]},{ng:1,y:78,x:56,t:-90,l1:[178,92],l2:[100,95],a1:[-100,-100],a2:[178,178]},[],['On your back, arms up, knees over hips','Lower opposite arm and leg; back stays flat']],
 'Lateral skater hops':[{front:1,x:30,t:22,l1:[22,-12],l2:[-38,-80],a1:[-40,-60],a2:[30,60]},{front:1,x:70,t:-22,l1:[38,80],l2:[-22,12],a1:[40,60],a2:[-30,-60]},[{t:'arrow',p:[36,30,64,30]}],['Land on one foot, hold 1 second','Bound sideways to the other foot']],
 'Drop landings':[sp({x:34,lift:18,a1:[5,5],sc:0.78}),{x:66,t:28,l1:[62,-22],l2:[62,-22],a1:[60,70],a2:[60,70],sc:0.78},[{t:'box',at:'an1'},{t:'arrow',p:[38,20,56,34]}],['Stand on a low box','Step off, land softly, knees over toes']],
 'Squat jumps':[{x:48,t:30,l1:[78,-24],l2:[78,-24],a1:[-40,-30],a2:[-40,-30],sc:0.8},sp({x:50,lift:10,l1:[2,0,40],l2:[2,0,40],a1:[170,175],a2:[170,175],sc:0.8}),[],['Squat down, arms back','Jump, land soft, reset']],
 'Pallof press':[sp({x:54,t:0,l1:[8,0],l2:[-8,0],a1:[20,160],a2:[20,160]}),sp({x:54,t:0,l1:[8,0],l2:[-8,0],a1:[88,90],a2:[88,90]}),[{t:'anchor',x:12,at:'ha1'}],['Band at chest, anchor at your side','Press out; don\'t let it twist you']],
 'Bird dog':[{x:34,t:92,l1:[0,-90,-95],l2:[0,-90,-95],a1:[0,0],a2:[0,0]},{x:34,t:92,l1:[0,-90,-95],l2:[-92,-92,-95],a1:[0,0],a2:[92,92]},[],['Hands and knees, flat back','Reach opposite arm and leg; hips level']],
 'Front plank':[{x:40,t:82,l1:[-70,-95,-95],l2:[-70,-95,-95],a1:[0,90],a2:[0,90]},{x:40,t:82,l1:[-82,-82,-10],l2:[-82,-82,-10],a1:[0,90],a2:[0,90]},[],['Easier: on knees','Full plank: straight line, glutes tight']],
 'Knee-to-wall ankle rocks':[{x:40,t:6,l1:[45,6],l2:[-30,-30,70],a1:[70,80],a2:[70,80]},{x:43,t:6,l1:[60,30],l2:[-30,-30,70],a1:[70,80],a2:[70,80]},[{t:'wall',x:74}],['Foot a few inches from a wall','Drive knee to wall, heel stays down']],
 'Calf and soleus stretch':[{x:50,t:20,l1:[30,-6],l2:[-26,-26],a1:[75,80],a2:[75,80]},{x:50,t:14,l1:[40,-6],l2:[-10,-35],a1:[75,80],a2:[75,80]},[{t:'wall',x:80}],['Calf: back knee straight, heel down','Soleus: bend the back knee']],
 'Couch stretch (hip flexor)':[{x:50,t:32,l1:[84,0],l2:[-22,180],a1:[10,10],a2:[10,10]},{x:48,t:0,l1:[84,0],l2:[-22,180],a1:[10,10],a2:[10,10]},[{t:'wall',x:26}],['Back shin up the wall','Sit tall and squeeze your glute']],
 'Figure-4 or pigeon stretch':[{ng:1,y:84,x:52,t:-92,l1:[150,92],l2:[132,12],a1:[92,92],a2:[92,92]},{ng:1,y:84,x:52,t:-92,l1:[172,95],l2:[165,100],a1:[130,150],a2:[130,150]},[],['Ankle over opposite knee','Pull the thigh toward your chest']],
 'Hamstring stretch':[sp({x:44,l1:[62,62,150],l2:[0,0],a1:[5,5]}),{x:42,t:48,l1:[62,62,150],l2:[0,0],a1:[55,60],a2:[55,60]},[{t:'bench',at:'an1',w:14}],['Heel on a low step, leg straight','Hinge forward with a flat back']],
 'Cat–cow':[{x:34,t:92,arch:7,hd:40,l1:[0,-90,-95],l2:[0,-90,-95],a1:[0,0],a2:[0,0]},{x:34,t:92,arch:-6,hd:-40,l1:[0,-90,-95],l2:[0,-90,-95],a1:[0,0],a2:[0,0]},[],['Cat: round your back','Cow: drop belly, lift chest']],
 'Open book (thoracic rotation)':[{ng:1,y:44,x:64,t:-90,l1:[0,90,180],l2:[0,90,180],a1:[0,0],a2:[0,0],hd:0},{ng:1,y:44,x:64,t:-90,l1:[0,90,180],l2:[0,90,180],a1:[180,180],a2:[0,0]},[],['Lying on side, knees bent (seen from above)','Open the top arm to the other side']],
 'Tempo squat':[sp({a1:[25,165],a2:[25,165]}),{x:44,t:32,l1:[80,-25],l2:[80,-25],a1:[40,175],a2:[40,175]},[],['Stand tall, hands at chest','3 s down, pause, stand up fast']],
 'Towel hamstring curl':[{ng:1,y:72,x:54,t:-68,l1:[100,2],l2:[100,2],a1:[96,92],a2:[96,92]},{ng:1,y:76,x:42,t:-72,l1:[74,74,170],l2:[74,74,170],a1:[96,92],a2:[96,92]},[{t:'pad',at:'an1'}],['Hips up, heels on a towel','Slide heels out, then pull back in']],
 'Side-lying hip abduction':[{ng:1,y:80,x:52,t:-90,hd:0,l1:[90,90,180],l2:[92,92,180],a1:[-90,-90],a2:[-90,-90]},{ng:1,y:80,x:52,t:-90,hd:0,l1:[124,124,180],l2:[92,92,180],a1:[-90,-90],a2:[-90,-90]},[],['Lie on your side, legs long','Lift the top leg, hold 2 s']],
 'Plank shoulder taps':[{x:40,t:82,l1:[-82,-82,-10],l2:[-82,-82,-10],a1:[0,0],a2:[0,0]},{x:40,t:82,l1:[-82,-82,-10],l2:[-82,-82,-10],a1:[135,-95],a2:[0,0]},[],['High plank, feet wide','Tap the opposite shoulder, hips still']],
 'Step-up':[sp({x:40,l1:[80,0],a1:[5,5],a2:[-5,-5],sc:0.82}),sp({x:52,lift:16,l2:[60,-10],a1:[5,5],a2:[-5,-5],sc:0.82}),[{t:'box',at:'an1'}],['One foot on the step','Stand up tall on it; lower slowly']],
 'Child\'s pose':[{x:44,t:0,l1:[0,-90,-95],l2:[0,-90,-95],a1:[0,0],a2:[0,0]},{x:38,t:100,hd:15,l1:[78,-95,-95],l2:[78,-95,-95],a1:[96,90],a2:[96,90]},[],['Kneel, knees apart','Sit back, reach forward, breathe']]
};
function figFor(n){const f=FIGS[n];if(!f)return '';const [a,b,props,cap]=f;return `<div class="figs">${figSVG(a,props,'1. '+cap[0])}${figSVG(b,props,'2. '+cap[1])}</div>`}

loadLocal();
renderAll();
try{const t=localStorage.getItem('slope-ready-tab');if(t&&document.getElementById('tab-'+t))showTab(t)}catch(e){}
connect();
connectAssets();
