# Hora certa

Uma agenda em que o dia é um relógio de 24 horas. Cada compromisso vira um arco colorido, e eu crio um novo arrastando o mouse ou o dedo no círculo.

Fiz este projeto para o meu portfólio. Eu queria uma agenda diferente das que já existem, então troquei o calendário em grade por um relógio.

**Link:** https://yyasmimaraujo.github.io/Hora-certa/

Dá para entrar como visitante, sem criar conta.

## O que ele faz

- Cria compromissos arrastando no relógio (no celular, é só segurar e arrastar)
- Mostra o dia inteiro de uma vez, com a hora atual marcada
- Aceita compromissos que passam da meia-noite, como o sono
- Avisa na hora do compromisso, com o app aberto
- Guarda o histórico dos dias que já passaram, com busca
- Tem uma área da conta com estatísticas
- Exporta e importa os compromissos em um arquivo
- Funciona no celular e pode ser instalado como app

## Como eu fiz

Usei HTML, CSS e JavaScript puro, sem frameworks. O relógio é desenhado em SVG. O login e o banco de dados ficam no Supabase, com regras de segurança para que cada conta só veja os próprios compromissos. O site está publicado no GitHub Pages.

Se o app não tiver as chaves do Supabase, ele funciona só no navegador e guarda os dados no localStorage. O modo visitante sempre funciona assim.

## Como rodar

1. Baixe o projeto e abra a pasta no VS Code.
2. Inicie com a extensão Live Server e abra `http://localhost:5500`.
3. Para usar a nuvem, crie um projeto no Supabase, rode o arquivo `supabase/schema.sql` no SQL Editor e coloque a URL e a chave publishable em `js/config.js`.
4. No Supabase, em Authentication, desligue "Confirm email" e coloque o endereço do site em URL Configuration.

A chave publishable pode ficar no código. A chave secret e a service_role nunca.

## Estrutura

```
index.html, style.css          página e estilos
js/                            código separado por assunto (relógio, login, histórico...)
supabase/schema.sql            tabela e regras de segurança
sw.js, manifest.webmanifest    instalação como app
```

## Limitações e próximos passos

Os lembretes só funcionam com o app aberto. Os compromissos não se repetem e duram no máximo 24 horas. O cadastro não pede confirmação de e-mail, porque é um projeto de demonstração.

Quero adicionar compromissos que se repetem e lembretes com o app fechado.
