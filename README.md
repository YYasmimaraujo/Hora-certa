# Hora certa · agenda em 24 horas

Uma agenda que troca a grade de calendário por um **relógio de 24 horas**. Cada compromisso é um arco colorido, e você cria um novo **arrastando no círculo**.

**Demo:** https://yyasmimaraujo.github.io/Hora-certa/ · Use o botão **Entrar como visitante** para ver tudo com dados de exemplo.

## Recursos

- Relógio radial com arcos que crescem em animação e ponteiro da hora atual
- Criar compromissos arrastando (mouse) ou **segurando e arrastando** (celular), sem travar a rolagem
- Compromissos que atravessam a meia-noite (por exemplo, sono das 23h às 7h)
- Lembretes na hora certa: aviso na tela, vibração e notificação do navegador
- Histórico com busca de todos os compromissos anteriores
- Login e cadastro, sessão que continua entre visitas e área "Minha conta" com estatísticas
- Exportar e importar backup em JSON
- Instalável no celular (PWA)
- Responsivo, com atalhos de teclado (← → trocam o dia, N cria um compromisso) e respeito a `prefers-reduced-motion`

## Tecnologias

HTML, CSS e JavaScript puro no front-end, com SVG para o relógio. **Supabase** (Auth + Postgres com Row Level Security) como backend. No modo local, `localStorage` e Web Crypto (PBKDF2). Service Worker e Web App Manifest para o PWA.

## Como rodar

1. Baixe ou clone o projeto.
2. Abra a pasta no VS Code e inicie com a extensão **Live Server** (ou `npx serve`).
3. Acesse `http://localhost:5500`.

## Backend (Supabase)

O app tem **dois modos**. Sem chaves em `js/config.js`, roda 100% local. Com as chaves, usa login real, banco na nuvem e sincronização entre aparelhos.

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Ele cria a tabela `events` com regras de segurança (RLS): cada conta só vê e altera os próprios compromissos.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **publishable** (ou `anon`) e cole em `js/config.js`.
4. Em **Authentication > URL Configuration**, defina a **Site URL** com o endereço publicado e adicione `http://localhost:5500` em **Redirect URLs**.
5. Em **Authentication > Providers > Email**, desligue **Confirm email**. O envio de e-mail padrão do Supabase só entrega para membros da equipe e tem limite de 2 por hora, então ele não serve para visitantes. Para um app real, configure um SMTP próprio e volte a ligar a confirmação.

A chave publishable pode ficar no front-end, porque quem protege os dados é o RLS. **Nunca** coloque a chave `secret` ou `service_role` no código.

## Estrutura

```
index.html          página e diálogos
supabase/schema.sql tabela, RLS e função de excluir conta
style.css           estilos, tema e animações
sw.js               service worker
manifest.webmanifest
js/config.js        chaves do Supabase (vazio = modo local)
js/core.js          estado, datas, armazenamento local
js/cloud.js         login e sincronização com o Supabase
js/render.js        relógio, lista do dia e animações
js/dial-input.js    arrastar no relógio (mouse e toque)
js/events.js        formulário de compromissos e navegação
js/auth.js          login e cadastro
js/history.js       backup e histórico
js/reminders.js     lembretes
js/account.js       área "Minha conta"
js/main.js          início, atalhos de teclado e PWA
```

Os arquivos de `js/` são scripts comuns carregados em ordem e compartilham o mesmo escopo. Migrar para módulos ES (`import`/`export`) é um próximo passo natural.

## Decisões e limitações

- **Dois modos.** Sem chaves, login e dados ficam só no navegador (sem recuperação de senha). Com o Supabase, há login real e sincronização entre aparelhos. O cadastro não exige confirmação por e-mail, por ser um projeto de demonstração. O modo visitante é sempre local.
- A sincronização envia só o que mudou e tenta de novo se a conexão falhar. Ao voltar para a aba, o app busca mudanças feitas em outro aparelho.
- **Lembretes só com o app aberto.** Avisar com o app fechado exige notificações push e um servidor.
- Compromissos têm no máximo 24 horas e não se repetem.

## Próximos passos

- Sincronização em tempo real (Supabase Realtime)
- Notificações push
- Compromissos recorrentes e arrastar para mudar o horário
- Módulos ES e testes automatizados
