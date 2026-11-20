const CATS={trabalho:"Trabalho",estudo:"Estudo",pessoal:"Pessoal",saude:"Saúde"};
const GUEST="visitante@demo.ciclo", USERS="ciclo:users", SESS="ciclo:session", NS="http://www.w3.org/2000/svg";
const C=320, R1=118, R2=268;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmt=m=>pad(Math.floor(m/60)%24)+":"+pad(m%60);
const toMin=t=>{const [h,m]=t.split(":").map(Number);return h*60+m};
const dur=m=>(m>=60?Math.floor(m/60)+"h":"")+(m%60?pad(m%60)+"min":"");
const colorOf=c=>"var(--c-"+c+")";

let memory=null;
function demoSeed(){
  const out=[],now=new Date();
  const plan=[["Foco no projeto",480,660,"trabalho",15],["Reunião",630,690,"trabalho",15],["Almoço",720,780,"pessoal",null],["Estudar JavaScript",1020,1110,"estudo",15],["Treino",1170,1230,"saude",30]];
  for(let i=-10;i<=3;i++){
    const date=iso(new Date(now.getFullYear(),now.getMonth(),now.getDate()+i));
    plan.forEach((p,k)=>{if((i+k)%3!==2||i===0)out.push({id:crypto.randomUUID(),title:p[0],date,start:p[1],end:p[2],cat:p[3],rem:p[4]})});
    if(i%2===0)out.push({id:crypto.randomUUID(),title:"Sono",date,start:1380,end:1860,cat:"pessoal",rem:null});
  }
  return out;
}
function seed(){
  if(user&&user.email===GUEST)return demoSeed();
  const t=iso(new Date());
  const mk=(title,start,end,cat)=>({id:crypto.randomUUID(),title,date:t,start,end,cat});
  return [mk("Foco no projeto",480,600,"trabalho"),mk("Reunião",540,630,"trabalho"),mk("Almoço",720,780,"pessoal"),mk("Treino",1080,1140,"saude"),mk("Inglês",1170,1230,"estudo")];
}
function load(){try{const r=localStorage.getItem(evKey());return r?JSON.parse(r):seed()}catch(e){return memory||seed()}}
function save(){if(user&&user.cloud){cloudSave();return}try{localStorage.setItem(evKey(),JSON.stringify(events))}catch(e){memory=events}}

let events=[], selected=iso(new Date()), drag=null, editingId=null, user=null;
const evKey=()=>"ciclo:eventos:"+user.email;
const dayEvents=d=>{
  const x=parse(d),prev=iso(new Date(x.getFullYear(),x.getMonth(),x.getDate()-1)),out=[];
  events.forEach(e=>{
    if(e.date===d)out.push(e.end>1440?{...e,end:1440}:e);
    else if(e.end>1440&&e.date===prev)out.push({...e,start:0,end:e.end-1440});
  });
  return out.sort((a,b)=>a.start-b.start);
};

function s(tag,attrs,parent){
  const n=document.createElementNS(NS,tag);
  for(const k in attrs)n.setAttribute(k,attrs[k]);
  if(parent)parent.appendChild(n);
  return n;
}
function pt(r,m){const a=m/1440*2*Math.PI-Math.PI/2;return[C+r*Math.cos(a),C+r*Math.sin(a)]}
function arc(r1,r2,m1,m2){
  const [x1,y1]=pt(r2,m1),[x2,y2]=pt(r2,m2),[x3,y3]=pt(r1,m2),[x4,y4]=pt(r1,m1);
  const lg=(m2-m1)>720?1:0;
  return `M${x1} ${y1}A${r2} ${r2} 0 ${lg} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${lg} 0 ${x4} ${y4}Z`;
}
function lanes(list){
  const ends=[],out={};
  list.forEach(e=>{
    let i=ends.findIndex(x=>x<=e.start);
    if(i<0){i=ends.length;ends.push(0)}
    ends[i]=e.end;out[e.id]=i;
  });
  return{out,n:Math.max(1,ends.length)};
}

