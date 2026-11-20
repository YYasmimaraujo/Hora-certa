/* Início */
authMode(false);
(async()=>{
  if(CLOUD&&sb){
    const {data}=await sb.auth.getSession();
    if(data.session){await startCloud(data.session.user);return}
  }
  let sess=null;try{sess=localStorage.getItem(SESS)}catch(e){}
  if(sess&&getUsers()[sess]&&(!CLOUD||sess===GUEST))start(sess);
})();

document.addEventListener("keydown",e=>{
  if(!user||e.altKey||e.ctrlKey||e.metaKey)return;
  const tag=(e.target.tagName||"").toLowerCase();
  if(["input","select","textarea"].includes(tag)||document.querySelector("dialog[open]"))return;
  if(e.key==="ArrowLeft")shift(-1);
  else if(e.key==="ArrowRight")shift(1);
  else if(e.key==="n"||e.key==="N"){e.preventDefault();$("add").click()}
});

if("serviceWorker" in navigator&&location.protocol!=="file:"){
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
