function openDialog(ev,preset){
  if(ev)ev=events.find(x=>x.id===ev.id)||ev;
  editingId=ev?ev.id:null;
  $("dlgTitle").textContent=ev?"Editar compromisso":"Novo compromisso";
  const st=ev?ev.start:preset?preset.start:540,en=ev?ev.end:preset?preset.end:600;
  $("fTitle").value=ev?ev.title:"";
  $("fStart").value=fmt(st);$("fEnd").value=fmt(en);
  $("fCat").value=ev?ev.cat:"trabalho";
  $("fRem").value=ev&&ev.rem!=null?String(ev.rem):"";
  $("del").style.display=ev?"":"none";
  $("err").textContent="";
  $("dlg").showModal();$("fTitle").focus();
}
$("form").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("fTitle").value.trim();
  if(!title){$("err").textContent="Informe um título para o compromisso.";return}
  if(!$("fStart").value||!$("fEnd").value){$("err").textContent="Preencha início e fim.";return}
  const start=toMin($("fStart").value);let end=toMin($("fEnd").value);
  if(end===start){$("err").textContent="Início e fim não podem ser iguais.";return}
  if(end<start)end+=1440;
  const data={title,start,end,cat:$("fCat").value,date:selected,rem:$("fRem").value===""?null:+$("fRem").value};
  if(data.rem!==null&&"Notification" in window&&Notification.permission==="default")Notification.requestPermission();
  let id=editingId;
  if(id)events=events.map(x=>x.id===id?{...x,...data}:x);
  else{id=crypto.randomUUID();events.push({id,...data})}
  save();$("dlg").close();render(id);
});
$("del").addEventListener("click",()=>{
  events=events.filter(x=>x.id!==editingId);save();$("dlg").close();render();
});
$("cancel").addEventListener("click",()=>$("dlg").close());
Object.entries(CATS).forEach(([k,v])=>{const o=document.createElement("option");o.value=k;o.textContent=v;$("fCat").appendChild(o)});

const shift=n=>{const d=parse(selected);selected=iso(new Date(d.getFullYear(),d.getMonth(),d.getDate()+n));render(true)};
$("prev").addEventListener("click",()=>shift(-1));
$("next").addEventListener("click",()=>shift(1));
$("today").addEventListener("click",()=>{selected=iso(new Date());render(true)});
$("add").addEventListener("click",()=>{const n=new Date(),h=(n.getHours()+1)%23;openDialog(null,{start:h*60,end:h*60+60})});

setInterval(()=>{if(!drag&&!$("dlg").open){renderDial();renderCenter()}},30000);

