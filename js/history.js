$("exp").addEventListener("click",()=>{
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(events,null,1)],{type:"application/json"}));
  a.download="ciclo-"+iso(new Date())+".json";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
$("imp").addEventListener("click",()=>$("file").click());
$("file").addEventListener("change",async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const d=JSON.parse(await f.text());
    if(!Array.isArray(d))throw new Error("formato");
    const ids=new Set(events.map(x=>x.id));let n=0;
    d.forEach(x=>{
      if(x&&x.title&&x.date&&Number.isFinite(x.start)&&Number.isFinite(x.end)&&CATS[x.cat]&&!ids.has(x.id)){
        events.push({id:/^[0-9a-f-]{36}$/i.test(x.id||"")?x.id:crypto.randomUUID(),title:String(x.title).slice(0,60),date:String(x.date),start:x.start,end:x.end,cat:x.cat,rem:x.rem==null?null:x.rem});n++;
      }
    });
    save();render(true);notify(n+" compromissos importados.");
  }catch(err){notify("Arquivo inválido. Use um backup exportado pelo Ciclo.")}
  e.target.value="";
});

function renderHist(){
  const q=$("hq").value.trim().toLowerCase(),now=Date.now();
  const past=events.filter(e=>{
    const d=parse(e.date);d.setMinutes(e.end);
    return d.getTime()<now&&e.title.toLowerCase().includes(q);
  }).sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start).slice(0,200);
  const ul=$("hlist");ul.replaceChildren();
  if(!past.length){
    const li=document.createElement("li");li.className="empty";
    li.textContent=q?"Nenhum compromisso encontrado.":"Você ainda não tem compromissos anteriores.";
    ul.appendChild(li);return;
  }
  let last="";
  past.forEach(e=>{
    if(e.date!==last){
      last=e.date;
      const h=document.createElement("li");h.className="hday";
      h.textContent=parse(e.date).toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
      ul.appendChild(h);
    }
    const li=document.createElement("li"),b=document.createElement("button"),box=document.createElement("div");
    b.type="button";b.className="item";b.style.setProperty("--cc",colorOf(e.cat));
    const t1=document.createElement("div");t1.className="t";t1.textContent=e.title;
    const m1=document.createElement("div");m1.className="m";m1.textContent=fmt(e.start)+" – "+fmt(e.end)+" · "+CATS[e.cat];
    box.append(t1,m1);b.appendChild(box);
    b.addEventListener("click",()=>{selected=e.date;$("hdlg").close();render(true)});
    li.appendChild(b);ul.appendChild(li);
  });
}
$("hist").addEventListener("click",()=>{$("hq").value="";renderHist();$("hdlg").showModal()});
$("hq").addEventListener("input",renderHist);
$("hclose").addEventListener("click",()=>$("hdlg").close());

