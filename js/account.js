const AV=["#2B50FF","#8A3FFC","#008F66","#FF4A3D","#D9480F"];
function paintUser(){
  const ini=user.name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
  const col=AV[[...user.email].reduce((a,c)=>a+c.charCodeAt(0),0)%AV.length];
  ["avSm","avBig"].forEach(id=>{const a=$(id);a.textContent=ini;a.style.setProperty("--av",col)});
  $("hello").textContent="Olá, "+user.name.split(" ")[0];
}
function renderAccount(){
  $("aName2").textContent=user.name;$("aMail2").textContent=user.email;
  $("aSince").textContent=user.email===GUEST?"Conta de demonstração":user.created?"Membro desde "+new Date(user.created).toLocaleDateString("pt-BR",{month:"long",year:"numeric"}):"";
  $("nNew").value=user.name;
  const now=Date.now(),endAt=e=>{const x=parse(e.date);x.setMinutes(e.end);return x.getTime()};
  const past=events.filter(e=>endAt(e)<now).length,mins={};let total=0;
  events.forEach(e=>{mins[e.cat]=(mins[e.cat]||0)+e.end-e.start;total+=e.end-e.start});
  const tiles=[["Compromissos",events.length,"trabalho"],["Próximos",events.length-past,"pessoal"],["Anteriores",past,"estudo"],["Horas planejadas",Math.round(total/60),"saude"]];
  const st=$("stats");st.replaceChildren();
  tiles.forEach(([l,v,c])=>{
    const box=document.createElement("div");box.className="stat";box.style.setProperty("--cc",colorOf(c));
    const b=document.createElement("b");b.textContent=v;
    const lab=document.createElement("span");lab.textContent=l;
    box.append(b,lab);st.appendChild(box);
  });
  const bars=$("bars");bars.replaceChildren();
  const max=Math.max(1,...Object.values(mins));
  Object.keys(CATS).forEach(c=>{
    const m=mins[c]||0,row=document.createElement("div");
    row.className="bar";row.style.setProperty("--cc",colorOf(c));
    const nm=document.createElement("span");nm.textContent=CATS[c];
    const tr=document.createElement("div");tr.className="t";
    const fill=document.createElement("i");tr.appendChild(fill);
    const hrs=document.createElement("span");hrs.textContent=dur(m)||"0h";
    row.append(nm,tr,hrs);bars.appendChild(row);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{fill.style.width=(m/max*100)+"%"}));
  });
}
$("me").addEventListener("click",()=>{$("pwForm").reset();$("pwErr").textContent="";renderAccount();$("adlg").showModal()});
$("aClose").addEventListener("click",()=>$("adlg").close());
$("nameForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const n=$("nNew").value.trim();if(!n)return;
  if(user.cloud){
    const {error}=await sb.auth.updateUser({data:{name:n}});
    if(error)return notify("Não foi possível salvar o nome agora.");
  }else{const all=getUsers();all[user.email].name=n;putUsers(all)}
  user.name=n;paintUser();renderAccount();notify("Nome atualizado.");
});
$("pwForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const err=m=>{$("pwErr").textContent=m};
  const cur=$("pOld").value,nw=$("pNew").value;
  if(user.cloud){
    const chk=await sb.auth.signInWithPassword({email:user.email,password:cur});
    if(chk.error)return err("A senha atual está incorreta.");
    if(nw.length<6)return err("A nova senha precisa ter ao menos 6 caracteres.");
    const up=await sb.auth.updateUser({password:nw});
    if(up.error)return err("Não foi possível trocar a senha agora.");
  }else{
    const all=getUsers(),u=all[user.email];
    if(await hashPw(cur,unb64(u.salt))!==u.hash)return err("A senha atual está incorreta.");
    if(nw.length<6)return err("A nova senha precisa ter ao menos 6 caracteres.");
    const salt=crypto.getRandomValues(new Uint8Array(16));
    u.salt=b64(salt);u.hash=await hashPw(nw,salt);putUsers(all);
  }
  $("pwForm").reset();err("");notify("Senha alterada.");
});
$("delAcc").addEventListener("click",async()=>{
  if(!confirm("Excluir sua conta e todos os compromissos? Isso não pode ser desfeito."))return;
  if(user.cloud){
    const {error}=await sb.rpc("delete_my_account");
    if(error)return notify("Não foi possível excluir a conta agora.");
  }else{
    const all=getUsers();delete all[user.email];putUsers(all);
    try{localStorage.removeItem(evKey())}catch(e){}
  }
  $("adlg").close();logout();
});

