function animateArc(p,ri,ro,e,i){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const D=e.end-e.start,t0=performance.now()+i*90,dur=700;
  p.setAttribute("d","");
  (function f(now){
    if(!p.isConnected)return;
    const t=Math.min(1,Math.max(0,(now-t0)/dur)),k=1-Math.pow(1-t,3);
    p.setAttribute("d",t>0?arc(ri,ro,e.start,e.start+Math.max(1,D*k)):"");
    if(t<1)requestAnimationFrame(f);else p.setAttribute("d",arc(ri,ro,e.start,e.end));
  })(performance.now());
}
function renderDial(grow){
  const svg=$("dial");
  svg.replaceChildren();
  s("circle",{cx:C,cy:C,r:R2+4,fill:"var(--surface)",stroke:"var(--line)"},svg);
  s("path",{d:arc(R1,R2,360,1320),fill:"rgba(255,190,70,.16)"},svg);
  s("path",{d:arc(R1,R2,1320,1440),fill:"rgba(43,80,255,.13)"},svg);
  s("path",{d:arc(R1,R2,0,360),fill:"rgba(43,80,255,.13)"},svg);
  s("circle",{cx:C,cy:C,r:R1,fill:"var(--surface)",stroke:"var(--line)"},svg);
  for(let h=0;h<24;h++){
    const major=h%3===0;
    const [x1,y1]=pt(R2+8,h*60),[x2,y2]=pt(R2+(major?20:14),h*60);
    s("line",{x1,y1,x2,y2,stroke:"var(--muted)","stroke-width":major?2:1},svg);
    if(major){
      const [tx,ty]=pt(R2+38,h*60);
      const t=s("text",{x:tx,y:ty,"text-anchor":"middle","dominant-baseline":"central",fill:"var(--muted)","font-size":15},svg);
      t.textContent=pad(h);
    }
  }
  const list=dayEvents(selected),{out,n}=lanes(list),h=(R2-R1)/n;let k=0;
  list.forEach(e=>{
    const ro=R2-out[e.id]*h-1,ri=ro-h+2;
    const p=s("path",{d:arc(ri,ro,e.start,e.end),fill:colorOf(e.cat),class:"ev",tabindex:0,role:"button"},svg);
    const delay=(grow===true||grow===e.id)?k*90+500:0;
    if(grow===true||grow===e.id)animateArc(p,ri,ro,e,k);
    k++;
    s("title",{},p).textContent=e.title+", "+fmt(e.start)+" às "+fmt(e.end);
    p.setAttribute("aria-label",e.title+", "+fmt(e.start)+" às "+fmt(e.end)+", "+CATS[e.cat]);
    p.addEventListener("click",()=>openDialog(e));
    p.addEventListener("keydown",k=>{if(k.key==="Enter")openDialog(e)});
    if(e.end-e.start>=60&&h>38){
      const [tx,ty]=pt((ro+ri)/2,(e.start+e.end)/2);
      const t=s("text",{x:tx,y:ty,"text-anchor":"middle","dominant-baseline":"central",fill:"#fff","font-size":12,"font-weight":600,"pointer-events":"none",class:delay?"lbl":"",style:"animation-delay:"+delay+"ms"},svg);
      t.textContent=e.title.length>12?e.title.slice(0,11)+"…":e.title;
    }
  });
  s("path",{id:"preview",d:"",fill:"var(--accent)","fill-opacity":.3,"pointer-events":"none"},svg);
  if(selected===iso(new Date())){
    const d=new Date(),m=d.getHours()*60+d.getMinutes();
    const [x1,y1]=pt(R1-10,m),[x2,y2]=pt(R2+8,m);
    s("line",{x1,y1,x2,y2,stroke:"var(--c-saude)","stroke-width":2.5,"stroke-linecap":"round","pointer-events":"none"},svg);
    s("circle",{cx:x1,cy:y1,r:5,fill:"var(--c-saude)","pointer-events":"none"},svg);
  }
}

function renderCenter(){
  const list=dayEvents(selected),d=parse(selected),isToday=selected===iso(new Date());
  if(isToday){
    const n=new Date(),m=n.getHours()*60+n.getMinutes();
    $("cBig").textContent=fmt(m);
    const cur=list.find(e=>e.start<=m&&m<e.end),next=list.find(e=>e.start>m);
    $("cSub").textContent=cur?"Agora: "+cur.title:next?"Próximo: "+next.title+" em "+dur(next.start-m):"Livre pelo resto do dia";
  }else{
    $("cBig").textContent=d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","");
    const busy=list.reduce((a,e)=>a+e.end-e.start,0);
    $("cSub").textContent=list.length?list.length+" compromissos · "+dur(busy)+" ocupadas":"Dia livre";
  }
}

function renderSide(grow){
  const d=parse(selected);
  $("dateLabel").textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const week=$("week");week.replaceChildren();
  const start=new Date(d.getFullYear(),d.getMonth(),d.getDate()-d.getDay()),todayIso=iso(new Date());
  for(let i=0;i<7;i++){
    const x=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),k=iso(x);
    const b=document.createElement("button");
    b.type="button";b.className="day"+(k===selected?" sel":"")+(k===todayIso?" today":"");
    const w=document.createElement("span");w.textContent=x.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","");
    const n=document.createElement("b");n.textContent=x.getDate();
    const dots=document.createElement("div");dots.className="dots";
    dayEvents(k).slice(0,3).forEach(e=>{const i=document.createElement("i");i.style.setProperty("--cc",colorOf(e.cat));dots.appendChild(i)});
    b.append(w,n,dots);
    b.addEventListener("click",()=>{selected=k;render(true)});
    week.appendChild(b);
  }
  const ul=$("list");ul.replaceChildren();ul.className="list"+(grow===true?" in":"");
  const list=dayEvents(selected);
  if(!list.length){const p=document.createElement("li");p.className="empty";p.textContent="Nada marcado para este dia. Arraste no círculo ou use “Novo compromisso”.";ul.appendChild(p);return}
  list.forEach((e,idx)=>{
    const li=document.createElement("li"),b=document.createElement("button");
    li.style.setProperty("--i",idx);
    b.type="button";b.className="item";b.style.setProperty("--cc",colorOf(e.cat));
    const box=document.createElement("div");
    const t=document.createElement("div");t.className="t";t.textContent=e.title;
    const m=document.createElement("div");m.className="m";m.textContent=fmt(e.start)+" – "+fmt(e.end)+" · "+CATS[e.cat];
    box.append(t,m);b.appendChild(box);
    b.addEventListener("click",()=>openDialog(e));
    li.appendChild(b);ul.appendChild(li);
  });
}

function render(grow){renderDial(grow);renderCenter();renderSide(grow)}

