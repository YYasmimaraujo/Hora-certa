const CLOUD=!!(SUPABASE_URL&&SUPABASE_KEY);
const sb=CLOUD&&window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
let synced=new Map(),pending=Promise.resolve(),dirty=false;

const toRow=e=>({id:e.id,title:e.title,date:e.date,start_min:e.start,end_min:e.end,cat:e.cat,rem:e.rem==null?null:e.rem});
const fromRow=r=>({id:r.id,title:r.title,date:r.date,start:r.start_min,end:r.end_min,cat:r.cat,rem:r.rem});
const snap=list=>new Map(list.map(e=>[e.id,JSON.stringify(toRow(e))]));

async function cloudLoad(){
  const rows=[];
  for(let from=0;;from+=1000){
    const {data,error}=await sb.from("events").select("*").order("date",{ascending:true}).range(from,from+999);
    if(error){notify("Não foi possível carregar seus compromissos.");return false}
    rows.push(...data);
    if(data.length<1000)break;
  }
  events=rows.map(fromRow);synced=snap(events);dirty=false;
  return true;
}

function cloudSave(){
  pending=pending.then(async()=>{
    const now=snap(events);
    const up=events.filter(e=>synced.get(e.id)!==now.get(e.id)).map(toRow);
    const del=[...synced.keys()].filter(id=>!now.has(id));
    if(!up.length&&!del.length)return;
    try{
      if(up.length){const {error}=await sb.from("events").upsert(up);if(error)throw error}
      if(del.length){const {error}=await sb.from("events").delete().in("id",del);if(error)throw error}
      synced=now;dirty=false;
    }catch(err){dirty=true;notify("Sem conexão: suas alterações serão enviadas assim que voltar.")}
  });
}

const trad=err=>{
  const m=(err.message||"").toLowerCase();
  if(m.includes("invalid login"))return "E-mail ou senha incorretos.";
  if(m.includes("already registered"))return "Este e-mail já tem conta. Toque em “Já tenho conta”.";
  if(m.includes("not confirmed"))return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if(err.status===429||m.includes("rate limit"))return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if(m.includes("fetch")||m.includes("network"))return "Sem conexão com o servidor.";
  return "Não foi possível concluir agora. Tente novamente.";
};

async function startCloud(u){
  user={email:u.email,name:(u.user_metadata&&u.user_metadata.name)||u.email.split("@")[0],created:Date.parse(u.created_at),cloud:true};
  events=[];synced=new Map();
  await cloudLoad();
  selected=iso(new Date());
  paintUser();
  $("aPass").value="";
  $("auth").hidden=true;
  render(true);
  checkReminders();
}

async function cloudAuth(mail,pw,name,err){
  if(!sb)return err("Não foi possível carregar o serviço de login. Verifique sua conexão.");
  const btn=$("aGo");btn.disabled=true;
  try{
    if(signup){
      if(!name)return err("Informe seu nome.");
      const {data,error}=await sb.auth.signUp({email:mail,password:pw,options:{data:{name}}});
      if(error)return err(trad(error));
      if(!data.session)return err("Enviamos um link de confirmação para o seu e-mail. Confirme e depois entre.");
      return startCloud(data.user);
    }
    const {data,error}=await sb.auth.signInWithPassword({email:mail,password:pw});
    if(error)return err(trad(error));
    return startCloud(data.user);
  }finally{btn.disabled=false}
}

if(CLOUD){
  $("aNote").textContent="Seus compromissos ficam salvos na nuvem e acompanham você em qualquer aparelho. Cada conta só enxerga os próprios dados.";
  $("aForgot").addEventListener("click",async()=>{
    const mail=$("aMail").value.trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(mail)){$("aErr").textContent="Digite seu e-mail acima e toque em “Esqueci minha senha”.";return}
    if(!sb){$("aErr").textContent="Não foi possível carregar o serviço de login. Verifique sua conexão.";return}
    const {error}=await sb.auth.resetPasswordForEmail(mail,{redirectTo:location.origin+location.pathname});
    $("aErr").textContent=error?"Não foi possível enviar o e-mail agora.":"Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.";
  });
  $("rForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const pw=$("rPass").value;
    if(pw.length<6){$("rErr").textContent="A senha precisa ter ao menos 6 caracteres.";return}
    const {error}=await sb.auth.updateUser({password:pw});
    if(error){$("rErr").textContent="Não foi possível salvar a senha. Peça um novo link.";return}
    $("rPass").value="";$("rdlg").close();notify("Senha alterada.");
    if(!user){const {data}=await sb.auth.getSession();if(data.session)startCloud(data.session.user)}
  });
  if(sb){
    sb.auth.onAuthStateChange((event)=>{
      if(event==="PASSWORD_RECOVERY")$("rdlg").showModal();
      if(event==="SIGNED_OUT"&&user&&user.cloud){user=null;events=[];authMode(false);$("auth").hidden=false}
    });
    
    document.addEventListener("visibilitychange",async()=>{
      if(document.visibilityState!=="visible"||!user||!user.cloud)return;
      if(dirty){cloudSave();return}
      await pending;
      if(await cloudLoad())render();
    });
    addEventListener("online",()=>{if(dirty&&user&&user.cloud)cloudSave()});
  }
}