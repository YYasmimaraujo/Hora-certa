function minAt(e){
  const r=$("dial").getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*640-C,y=(e.clientY-r.top)/r.height*640-C;
  if(Math.hypot(x,y)<R1-10)return null;
  let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=2*Math.PI;
  return Math.round(a/(2*Math.PI)*96)%96*15;
}
function range(){
  let a=drag.a,b=drag.b;
  if(b===0&&a>0)b=1440;
  if(a>b)[a,b]=[b,a];
  if(b-a<15)b=Math.min(1440,a+15);
  return[a,b];
}
function drawPreview(){const [a,b]=range();$("preview").setAttribute("d",arc(R1,R2,a,Math.min(b,1439.9)))}
const dial=$("dial");
let hold=null;
const cancelDrag=()=>{clearTimeout(hold);drag=null;const p=$("preview");if(p)p.setAttribute("d","")};
dial.addEventListener("pointerdown",e=>{
  if(!user||e.target.classList.contains("ev"))return;
  const m=minAt(e);if(m===null)return;
  drag={a:m,b:m,moved:false,x:e.clientX,y:e.clientY,on:e.pointerType!=="touch"};
  if(drag.on){dial.setPointerCapture(e.pointerId);drawPreview()}
  else hold=setTimeout(()=>{if(drag){drag.on=true;navigator.vibrate&&navigator.vibrate(15);drawPreview()}},280);
});
dial.addEventListener("pointermove",e=>{
  if(!drag)return;
  if(!drag.on){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)cancelDrag();return}
  const m=minAt(e);if(m===null)return;
  if(m!==drag.b){drag.b=m;drag.moved=true;drawPreview()}
});
dial.addEventListener("pointerup",()=>{
  if(!drag)return;
  clearTimeout(hold);
  if(!drag.on){drag=null;return}
  let [a,b]=range();
  if(!drag.moved)b=Math.min(1440,a+60);
  drag=null;
  openDialog(null,{start:a,end:b});
});
dial.addEventListener("pointercancel",cancelDrag);
dial.addEventListener("contextmenu",e=>e.preventDefault());
dial.addEventListener("touchmove",e=>{if(drag&&drag.on&&e.cancelable)e.preventDefault()},{passive:false});
if(matchMedia("(pointer:coarse)").matches)$("hint").textContent="Segure e arraste no círculo para criar um compromisso. Toque em um arco para editar.";

