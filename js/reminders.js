const fired=new Set();
function notify(msg){
  const t=$("toast");t.textContent=msg;t.classList.add("on");
  clearTimeout(notify.t);notify.t=setTimeout(()=>t.classList.remove("on"),9000);
  if(navigator.vibrate)navigator.vibrate([120,60,120]);
  try{if("Notification" in window&&Notification.permission==="granted")new Notification("Ciclo",{body:msg})}catch(e){}
}
function checkReminders(){
  if(!user)return;
  const n=new Date(),today=iso(n),m=n.getHours()*60+n.getMinutes();
  events.forEach(e=>{
    if(e.date!==today||e.rem==null)return;
    const id=e.id+today+e.start+e.rem;
    if(fired.has(id)||m<e.start-e.rem||m>e.start+5)return;
    fired.add(id);
    const diff=e.start-m;
    notify((diff>0?"Em "+dur(diff)+": ":"Agora: ")+e.title);
  });
}
setInterval(checkReminders,15000);

