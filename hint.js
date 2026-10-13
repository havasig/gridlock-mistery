// Gridlock hint engine: logical deduction with human-readable steps.
// Works on candidate sets; never uses the solution.
(function(root){
"use strict";
const VICTIM="Áldozat";
const OCC=new Set(["chair","bench"]);
const K=(r,c)=>r+","+c, P=k=>k.split(",").map(Number);

function makeCtx(M,pz){
  const N=M.n, OBJ={};
  M.obj.split(";").forEach(s=>{const [k,t]=s.trim().split(" "); OBJ[k]=t;});
  const area=(r,c)=>M.rows[r-1][c-1];
  const people=pz.people.map(p=>p.name).concat([VICTIM]);
  const blocked=k=>!!OBJ[k]&&!OCC.has(OBJ[k]);
  const nb=(r,c)=>[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[r+a,c+b]).filter(([a,b])=>a>=1&&a<=N&&b>=1&&b<=N&&area(a,b)===area(r,c));
  const beside=(r,c,t)=>nb(r,c).some(([a,b])=>OBJ[K(a,b)]===t);
  const colhas=(c,t)=>{for(let r=1;r<=N;r++) if(OBJ[K(r,c)]===t) return true; return false;};
  const rowhas=(r,t)=>{for(let c=1;c<=N;c++) if(OBJ[K(r,c)]===t) return true; return false;};
  return {M,pz,N,OBJ,area,people,blocked,beside,colhas,rowhas,rules:pz.rules||[],areaName:a=>M.areas[a][0]};
}
function unaryOK(ctx,rule,r,c){
  const [k,,x]=rule;
  switch(k){
    case "in": return ctx.area(r,c)===x;
    case "notin": return ctx.area(r,c)!==x;
    case "beside": return ctx.beside(r,c,x);
    case "notbeside": return !ctx.beside(r,c,x);
    case "on": return ctx.OBJ[K(r,c)]===x;
    case "nocol": return !ctx.colhas(c,x);
    case "norow": return !ctx.rowhas(r,x);
  }
  return true;
}
function initialCands(ctx,fixed){
  const C={};
  for(const n of ctx.people){
    C[n]=new Set();
    if(fixed[n]){C[n].add(K(...fixed[n])); continue;}
    for(let r=1;r<=ctx.N;r++)for(let c=1;c<=ctx.N;c++){
      const k=K(r,c); if(ctx.blocked(k)) continue;
      if(ctx.rules.every(ru=>ru[1]!==n||unaryOK(ctx,ru,r,c))) C[n].add(k);
    }
  }
  return C;
}
const clone=C=>{const o={}; for(const n in C) o[n]=new Set(C[n]); return o;};

// One propagation pass of a single technique. Returns {msg, focus:[cells], who:[names]} if it changed something, else null.
function stepRowCol(ctx,C){
  for(const n of ctx.people){ if(C[n].size!==1) continue; const [r,c]=P([...C[n]][0]); let ch=false;
    for(const m of ctx.people){ if(m===n) continue; for(const k of [...C[m]]){ const [a,b]=P(k); if(a===r||b===c){C[m].delete(k); ch=true;} } }
    if(ch) return {tech:"Sor és oszlop", msg:`${n} helye biztos (R${r} C${c}), így a sorából és az oszlopából mindenki más kiesik.`, who:[n], cells:[K(r,c)]};
  }
  return null;
}
function stepSingle(ctx,C,fixed){
  for(const n of ctx.people){ if(fixed[n]||C[n].size!==1) continue;
    return {tech:"Egyetlen jelölt", msg:`${n} már csak egyetlen mezőre kerülhet.`, who:[n], cells:[...C[n]], place:[n,[...C[n]][0]]}; }
  return null;
}
function stepHidden(ctx,C,fixed){
  for(const dim of [0,1]) for(let i=1;i<=ctx.N;i++){
    const can=ctx.people.filter(n=>[...C[n]].some(k=>P(k)[dim]===i));
    if(can.length===1){ const n=can[0]; if(fixed[n]) continue; const keep=[...C[n]].filter(k=>P(k)[dim]===i);
      if(keep.length<C[n].size){ C[n]=new Set(keep);
        return {tech:"Rejtett egyes", msg:`${dim?"A(z) "+i+". oszlopba":"Az R"+i+". sorba"} csak ${n} kerülhet, tehát ő ott van.`, who:[n], cells:keep}; } }
  }
  return null;
}
function combos(arr,k,start=0,acc=[],out=[]){ if(acc.length===k){out.push(acc.slice()); return out;} for(let i=start;i<arr.length;i++){acc.push(arr[i]); combos(arr,k,i+1,acc,out); acc.pop();} return out; }
function stepSubset(ctx,C){
  const open=ctx.people.filter(n=>C[n].size>1);
  for(const k of [2,3]) for(const dim of [1,0]) for(const grp of combos(open,k)){
    const lines=new Set(); grp.forEach(n=>C[n].forEach(c=>lines.add(P(c)[dim])));
    if(lines.size!==k) continue;
    let ch=false, cells=[];
    for(const m of ctx.people){ if(grp.includes(m)) continue; for(const c of [...C[m]]) if(lines.has(P(c)[dim])){C[m].delete(c); ch=true; cells.push(c);} }
    if(ch){ const L=[...lines].sort((a,b)=>a-b); const lab=dim?`${L.join(". és ")}. oszlop`:`R${L.join(" és R")} sor`;
      return {tech:"Zárt csoport", msg:`${grp.join(" és ")} csak a(z) ${lab}ban lehetnek, így ${k===2?"ezt a két":"ezt a három"} ${dim?"oszlopot":"sort"} ők foglalják el — mások ott nem lehetnek.`, who:grp, cells:grp.flatMap(n=>[...C[n]])}; }
  }
  return null;
}
function stepRelations(ctx,C){
  const need=(a,b,test)=>{ let ch=false; for(const k of [...C[a]]){ const [r,c]=P(k); if(![...C[b]].some(k2=>{const [r2,c2]=P(k2); return r2!==r&&c2!==c&&test(r,c,r2,c2);})){C[a].delete(k); ch=true;} } return ch; };
  for(const ru of ctx.rules){
    const [t,a,b,n]=ru; let f=null, txt="";
    if(t==="north"){ f=(r,c,r2)=>r<r2; txt=`${a} északabbra van, mint ${b}`; }
    else if(t==="west"){ f=(r,c,r2,c2)=>c<c2; txt=`${a} nyugatabbra van, mint ${b}`; }
    else if(t==="rowsN"){ f=(r,c,r2)=>r2-r===n; txt=`${a} pontosan ${n} sorral északabbra van, mint ${b}`; }
    else if(t==="samearea"){ f=(r,c,r2,c2)=>ctx.area(r,c)===ctx.area(r2,c2); txt=`${a} és ${b} ugyanabban a területben van`; }
    else continue;
    const before=C[a].size+C[b].size;
    const ch1=need(a,b,f), ch2=need(b,a,(r2,c2,r,c)=>f(r,c,r2,c2));
    if(ch1||ch2){ return {tech:"Viszonylagos nyom", msg:`Mivel ${txt}, a lehetséges helyeik szűkülnek (${before} → ${C[a].size+C[b].size} jelölt).`, who:[a,b], cells:[...C[a],...C[b]]}; }
  }
  return null;
}
function stepVictim(ctx,C){
  const sus=ctx.people.filter(n=>n!==VICTIM);
  const inArea=(n,A)=>[...C[n]].some(k=>ctx.area(...P(k))===A), allIn=(n,A)=>[...C[n]].every(k=>ctx.area(...P(k))===A);
  let ch=false; const removed=[];
  for(const k of [...C[VICTIM]]){ const A=ctx.area(...P(k));
    const forced=sus.filter(n=>allIn(n,A)).length, possible=sus.filter(n=>inArea(n,A)).length;
    if(forced>1||possible===0){ C[VICTIM].delete(k); ch=true; removed.push(A); } }
  if(ch){ const names=[...new Set(removed)].map(a=>ctx.areaName(a)); return {tech:"Áldozat-szabály", msg:`Az áldozat területén pontosan egy gyanúsított van. ${names.join(", ")}: ott ez nem teljesülhet, így az áldozat nem lehet ott.`, who:[VICTIM], cells:[...C[VICTIM]]}; }
  const vAreas=new Set([...C[VICTIM]].map(k=>ctx.area(...P(k))));
  if(vAreas.size===1){ const A=[...vAreas][0]; const f=sus.filter(n=>allIn(n,A));
    if(f.length===1){ for(const n of sus){ if(n===f[0]) continue; for(const k of [...C[n]]) if(ctx.area(...P(k))===A){C[n].delete(k); ch=true;} }
      if(ch) return {tech:"Áldozat-szabály", msg:`Az áldozat biztosan itt van: ${ctx.areaName(A)}, és ${f[0]} is ott van — rajta kívül más gyanúsított nem lehet ebben a területben.`, who:[VICTIM,f[0]], cells:[...C[VICTIM]]}; } }
  return null;
}
const BASIC=[stepRowCol,stepHidden,stepRelations,stepSubset,stepVictim];
function bad(ctx,C){
  if(ctx.people.some(n=>C[n].size===0)) return true;
  for(const dim of [0,1]) for(let i=1;i<=ctx.N;i++) if(!ctx.people.some(n=>[...C[n]].some(k=>P(k)[dim]===i))) return true;
  return false;
}
function propagate(ctx,C,maxIter=200){
  for(let it=0;it<maxIter;it++){ if(bad(ctx,C)) return false; let any=false; for(const s of BASIC){ if(s(ctx,C,{})){any=true; break;} } if(!any) return !bad(ctx,C); }
  return !bad(ctx,C);
}
function stepTrial(ctx,C){
  const open=ctx.people.filter(n=>C[n].size>1).sort((a,b)=>C[a].size-C[b].size);
  for(const n of open){ for(const k of [...C[n]]){
    const T=clone(C); T[n]=new Set([k]);
    if(!propagate(ctx,T)){
      const why=ctx.people.find(m=>T[m].size===0);
      C[n].delete(k); const [r,c]=P(k);
      return {tech:"Ellentmondás", msg:`Ha ${n} az R${r} C${c} mezőn lenne, ${why?why+" számára nem maradna hely":"valamelyik sor vagy oszlop üresen maradna"}. Tehát ${n} nem lehet ott.`, who:[n], cells:[k], elim:[n,k]}; }
  } }
  return null;
}
// Find the next hint from the current placements. Returns {steps:[...], target:{name,cell}} or {stuck:true}
function nextHint(M,pz,fixed){
  const ctx=makeCtx(M,pz); const C=initialCands(ctx,fixed); const steps=[];
  const unplaced=ctx.people.filter(n=>!fixed[n]);
  // a person whose clue alone leaves one cell
  for(const n of unplaced) if(C[n].size===1) return {steps:[{tech:"Közvetlen nyom", msg:`${n} nyoma alapján csak egyetlen mező jöhet szóba.`, who:[n], cells:[...C[n]]}], target:{name:n,cell:[...C[n]][0]}};
  for(let guard=0;guard<400;guard++){
    if(bad(ctx,C)) return {conflict:true};
    for(const n of unplaced) if(C[n].size===1){ return {steps, target:{name:n,cell:[...C[n]][0]}}; }
    let s=null; for(const f of BASIC){ s=f(ctx,C,fixed); if(s) break; }
    if(!s) s=stepTrial(ctx,C);
    if(!s) return {stuck:true, steps};
    steps.push(s);
  }
  return {stuck:true, steps};
}
root.GridlockHint={nextHint,makeCtx,initialCands};
})(typeof window!=="undefined"?window:globalThis);
