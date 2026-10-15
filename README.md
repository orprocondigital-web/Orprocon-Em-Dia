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
2. A tela de login é igual à da Gestão Financeira, com **os mesmos acessos**:
   - **Entrar no modo de teste**: sem senha, já com 8 clientes e 3 pessoas fictícias, num espaço
     separado. **Zerar teste** (na faixa amarela ou em Dados e ajustes) apaga só o teste.
   - **E-mail e senha da Gestão Financeira** (o administrador e os usuários criados lá): abre limpo.
     Usuário que não é administrador precisa da área **Em Dia** liberada em Usuários, na Gestão Financeira.
   - Aparelho onde a Gestão Financeira nunca foi aberta (ex.: celular): **Importar o arquivo de acessos**
     ou, para o administrador principal, **Criar o primeiro acesso**, como no sistema.
3. **Sair** fica em Dados e ajustes (e na faixa do modo de teste). Sair do Em Dia não sai da Gestão Financeira.

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

O login é o da Gestão Financeira: `js/auth.js` e `js/storage.js` são **cópias** de lá (mantenha iguais).
Os acessos ficam no IndexedDB `gestao-financeira` (chave `auth:usuarios`), que o navegador divide entre os
dois apps porque estão no mesmo endereço (`orprocondigital-web.github.io`). A sessão é do Em Dia
(`emDiaApp:sessao`, via `js/acesso.js`), então entrar ou sair num não mexe no outro.
`js/entrada.js` é a tela de login; depois de entrar chama `EmDiaApp.iniciar(usuario, sair)`.
Um sistema que incorpore o Em Dia pode definir `window.EM_DIA_USUARIO = {id, nome, email, perfil}` antes
(aí não há login). `perfil: "admin"` = gestor.

## Dados no navegador

| Chave | Conteúdo |
|---|---|
| `emDiaApp:v1` | tudo do seu acesso (clientes, etapas, equipe, tarefas por mês, diário) |
| `emDiaApp:teste:v1` | o mesmo, do modo de teste |
| `emDiaApp:sessao` | quem entrou (sessão de 12 h, renovada ao usar) |
| `emDiaApp:tema` | `claro`, `escuro` ou `auto` |
| `emDiaApp:mes`, `emDiaApp:aba` | onde você parou na tela (`:teste` no fim para o modo de teste) |
| `emDiaApp:ultimoBackup` | data do último backup baixado |
