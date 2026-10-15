# Em Dia

App para escritório de contabilidade: **fechamento do mês por cliente**, **diário de cada setor**
(Contábil, Fiscal, Pessoal/DP), **“onde parei”** de cada tarefa e **passagem de bastão** quando alguém falta.

Só HTML, CSS e JavaScript: sem build, sem dependências. Instalável no computador e no celular (PWA),
funciona sem internet, com tema claro e escuro.

> Fase atual: **só front**. Os dados ficam no navegador de cada aparelho. Para passar de um aparelho
> para outro, use **Dados e ajustes → Baixar backup / Restaurar backup** (arquivo `.json`).
> Na próxima fase, os dados vão para o servidor da Gestão Financeira, com o mesmo login.

## Testar

1. Abra a pasta no VS Code e rode com o **Live Server** (o app instalável precisa de `http://`, não abre por `file://`).
2. Na primeira vez ele pergunta **quem é você** (deixe marcado “Sou o gestor”).
3. **Dados e ajustes → Carregar exemplo**: 8 clientes e 3 pessoas fictícias, com tarefas e diários.
4. Para começar do zero: **Dados e ajustes → Tirar exemplo** (mantém o que vocês cadastraram) ou **Apagar tudo**.
5. Para testar como outra pessoa no mesmo aparelho: **Dados e ajustes → Entrar como outra pessoa**.

## Publicar (GitHub Pages) e instalar

1. Crie um repositório (ex.: `Orprocon-Em-Dia`) e envie o conteúdo desta pasta para a raiz.
2. GitHub → **Settings → Pages** → *Deploy from a branch* → `main` / `(root)` → Save.
3. Abra o endereço `https://<conta>.github.io/<repositório>/`:
   - **Computador (Chrome/Edge):** ícone de instalar na barra de endereço, ou *Dados e ajustes → Instalar*.
   - **Android (Chrome):** menu ⋮ → **Instalar app**.
   - **iPhone (Safari):** **Compartilhar → Adicionar à Tela de Início**.

Cada aparelho tem os seus dados. Para levar os dados do computador para o celular: baixe o backup no
computador, mande o arquivo para o celular e use **Restaurar backup** lá.

## Atualizar uma versão publicada

Mudou algum arquivo? Aumente a versão em **três lugares**: `VERSAO` no `sw.js`, os `?v=` do `index.html`
e `VERSAO_APP` no `js/app.js`. Quem já instalou recebe a versão nova ao abrir o app de novo.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `index.html` | a moldura: menu lateral (computador), barra inferior e botão + (celular) |
| `css/app.css` | cores (claro e escuro), botões, painéis, tabelas, modal, layout |
| `css/em-dia.css` | o visual de cada tela (quadro, diário, setores, ajustes) |
| `js/dados.js` | todas as regras, sem tela (backup, exemplo, prazos, diários por setor...) |
| `js/app.js` | as telas e os eventos |
| `sw.js`, `manifest.webmanifest`, `icons/` | app instalável e sem internet |
| `tests/emdia.test.js` | 21 testes das regras: `node --test tests/emdia.test.js` |

## Quem está usando

Nesta ordem: `window.EM_DIA_USUARIO = {id, nome, email, perfil}` (definido por um sistema que incorpore o
Em Dia) → login da Gestão Financeira no mesmo navegador (`gf.sessao`) → a tela “Quem é você?”
(`localStorage` `emDia:usuario`). `perfil: "admin"` = gestor.

## Dados no navegador

| Chave | Conteúdo |
|---|---|
| `emDia:v1` | tudo (clientes, etapas, equipe, tarefas por mês, diário) |
| `emDia:usuario` | quem está usando neste aparelho |
| `emDia:tema` | `claro`, `escuro` ou `auto` |
| `emDia:mes`, `emDia:aba` | onde você parou na tela |
| `emDia:ultimoBackup` | data do último backup baixado |
