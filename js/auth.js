const enc=new TextEncoder();
const b64=u=>btoa(String.fromCharCode(...u));
const unb64=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
async function hashPw(pw,salt){
  const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
  return b64(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,256)));
}
const getUsers=()=>{try{return JSON.parse(localStorage.getItem(USERS))||{}}catch(e){return{}}};
const putUsers=u=>{try{localStorage.setItem(USERS,JSON.stringify(u))}catch(e){}};
let signup=false;
function authMode(v){
  signup=v;
  $("nameRow").style.display=v?"":"none";
  $("aGo").textContent=v?"Criar conta":"Entrar";
  $("aSwitch").textContent=v?"Já tenho conta":"Criar conta";
  $("aPass").autocomplete=v?"new-password":"current-password";
  $("aErr").textContent="";
}
$("aSwitch").addEventListener("click",()=>authMode(!signup));
$("aGuest").addEventListener("click",()=>{
  const all=getUsers();
  if(!all[GUEST]){all[GUEST]={name:"Visitante",created:Date.now(),salt:b64(new Uint8Array(16)),hash:"guest"};putUsers(all)}
  start(GUEST);
});
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const err=m=>{$("aErr").textContent=m};
  const mail=$("aMail").value.trim().toLowerCase(),pw=$("aPass").value,name=$("aName").value.trim();
  if(!/^\S+@\S+\.\S+$/.test(mail))return err("Digite um e-mail válido.");
  if(pw.length<6)return err("A senha precisa ter ao menos 6 caracteres.");
  if(CLOUD)return cloudAuth(mail,pw,name,err);
  if(!window.crypto||!crypto.subtle)return err("Abra a página por https ou localhost para usar o login.");
  const all=getUsers();
  if(signup){
    if(all[mail])return err("Este e-mail já tem conta. Toque em “Já tenho conta”.");
    if(!name)return err("Informe seu nome.");
    const salt=crypto.getRandomValues(new Uint8Array(16));
    all[mail]={name,created:Date.now(),salt:b64(salt),hash:await hashPw(pw,salt)};
    putUsers(all);
  }else{
    const u=all[mail];
    if(!u||await hashPw(pw,unb64(u.salt))!==u.hash)return err("E-mail ou senha incorretos.");
  }
  start(mail);
});
function start(mail){
  const u=getUsers()[mail];
  user={email:mail,name:u.name,created:u.created};
  try{localStorage.setItem(SESS,mail)}catch(e){}
  events=load();save();
  selected=iso(new Date());
  paintUser();
  $("aPass").value="";
  $("auth").hidden=true;
  render(true);
  checkReminders();
}
function logout(){
  if(user&&user.cloud&&sb)sb.auth.signOut();
  try{localStorage.removeItem(SESS)}catch(e){}
  user=null;events=[];authMode(false);$("auth").hidden=false;
}
$("out").addEventListener("click",logout);

