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
2. A tela de entrada tem dois caminhos:
   - **Entrar no modo de teste**: sem senha, já com 8 clientes e 3 pessoas fictícias. Fica num espaço
     separado: **Zerar teste** (na faixa amarela ou em Dados e ajustes) apaga só o teste.
     Em Dados e ajustes dá para recarregar o exemplo e **entrar como outra pessoa**.
   - **Criar o meu acesso** (nome, e-mail e senha, na primeira vez) e depois **Entrar**: abre limpo,
     sem nada do teste. O primeiro acesso do aparelho é o gestor.
3. **Sair** fica em Dados e ajustes (e na faixa do modo de teste).

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
| `tests/emdia.test.js`, `tests/acesso.test.js` | testes das regras e da entrada: `node --test tests/*.test.js` |

## Quem está usando

`window.EM_DIA_USUARIO = {id, nome, email, perfil}` (se um sistema que incorpore o Em Dia definir) ou a
tela de entrada (`js/acesso.js`): modo de teste ou o acesso criado no aparelho. A senha não é guardada,
só um resumo PBKDF2-SHA256 com sal. Esqueceu a senha: **Criar um acesso novo** apaga os acessos do
aparelho (os dados continuam). `perfil: "admin"` = gestor.

O app **não** usa o login nem os dados do módulo Em Dia da Gestão Financeira, mesmo estando no mesmo
endereço (github.io): as chaves dele começam com `emDiaApp:`.

## Dados no navegador

| Chave | Conteúdo |
|---|---|
| `emDiaApp:v1` | tudo do seu acesso (clientes, etapas, equipe, tarefas por mês, diário) |
| `emDiaApp:teste:v1` | o mesmo, do modo de teste |
| `emDiaApp:contas` | acessos do aparelho (nome, e-mail, resumo da senha) |
| `emDiaApp:sessao` | quem entrou e em qual modo |
| `emDiaApp:tema` | `claro`, `escuro` ou `auto` |
| `emDiaApp:mes`, `emDiaApp:aba` | onde você parou na tela (`:teste` no fim para o modo de teste) |
| `emDiaApp:ultimoBackup` | data do último backup baixado |
