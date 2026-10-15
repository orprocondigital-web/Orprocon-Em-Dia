/*
 * entrada.js — tela de login do Em Dia, igual à da Gestão Financeira e com os mesmos acessos:
 * "Entrar no modo de teste" (sem senha, dados de exemplo separados) ou e-mail e senha do sistema.
 * Primeira vez no aparelho: "Criar o primeiro acesso" (administrador principal) ou
 * "Importar o arquivo de acessos". Senha provisória: pede para criar a sua.
 * Depois de entrar, chama EmDiaApp.iniciar(usuario, sair).
 */
(function () {
  "use strict";
  var A = EmDiaAcesso, auth = null, senhaDigitada = "";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // outro sistema que incorpore o Em Dia pode definir o usuário antes (sem login aqui)
  if (window.EM_DIA_USUARIO && window.EM_DIA_USUARIO.id) { EmDiaApp.iniciar(window.EM_DIA_USUARIO, null); return; }

  var ICONE_SOL = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var ICONE_LUA = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>';
  function iconeTema() {
    var escuro = document.documentElement.getAttribute("data-theme") === "dark";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (escuro ? ICONE_SOL : ICONE_LUA) + "</svg>";
  }
  function senha(id, rotulo, auto, dica) {
    return '<div class="field"><label for="' + id + '">' + rotulo + '</label><div class="ac-senha"><input id="' + id + '" type="password" autocomplete="' + auto + '" required>' +
      '<button type="button" class="ac-mostrar" data-mostrar="' + id + '" aria-label="Mostrar senha">Mostrar</button></div>' + (dica ? '<span class="muted small">' + dica + "</span>" : "") + "</div>";
  }

  function desenhar() {
    document.querySelector(".app").outerHTML = '<div class="ac-tela">' +
      '<button type="button" class="btn-tema ac-tema" id="ac-tema" aria-label="Trocar tema">' + iconeTema() + "</button>" +
      '<section class="ac-marca"><img src="icons/icon-192.png" alt="" width="72" height="72"><h1>Em Dia</h1><p class="ac-sub">Fechamento e diário do escritório</p><ul>' +
      ["Fechamento do mês de cada cliente", "Diário de cada setor: Contábil, Fiscal e Pessoal", "“Onde parei” em cada tarefa", "Passagem de bastão quando alguém falta", "No celular e no computador, até sem internet"]
        .map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></section>" +
      '<section class="ac-cartao"><div class="ac-caixa">' +
      '<p class="ac-carregando" id="carregando">Carregando…</p>' +
      '<div id="teste-card" class="ac-teste" hidden><span class="ac-selo">Modo de teste</span><h2>Conheça o app</h2>' +
        '<p class="muted">Entre sem senha para testar. Os dados de teste ficam separados e dá para zerar quando quiser.</p>' +
        '<button type="button" class="btn btn-primary ac-largo" id="btn-teste">Entrar no modo de teste</button>' +
        '<div class="ac-ou"><span>ou entre com o seu usuário</span></div></div>' +

      '<form id="form-entrar" class="ac-form" hidden novalidate><h2>Entrar</h2><p class="muted">Use o mesmo e-mail e senha da Gestão Financeira.</p>' +
        '<div class="field"><label for="entrar-email">E-mail</label><input id="entrar-email" type="email" autocomplete="username" required></div>' +
        senha("entrar-senha", "Senha", "current-password") +
        '<p class="error-msg" id="entrar-erro" role="alert"></p><button type="submit" class="btn btn-primary ac-largo">Entrar</button>' +
        '<p class="ac-links">Esqueceu a senha? Peça ao administrador para redefinir.</p>' +
        '<p class="ac-links">Primeira vez neste aparelho? <button type="button" class="link-btn" data-importar>Importar o arquivo de acessos</button></p>' +
        '<p class="ac-links" id="link-configurar" hidden>Administrador principal, primeira vez aqui? <button type="button" class="link-btn" id="btn-ir-configurar">Criar o primeiro acesso</button></p></form>' +

      '<form id="form-configurar" class="ac-form" hidden novalidate><h2>Primeiro acesso</h2>' +
        '<p class="muted">Ainda não há nenhum acesso neste aparelho. Crie a senha do administrador principal (vale também para a Gestão Financeira neste aparelho).</p>' +
        '<div class="field"><label for="cfg-email">E-mail do administrador</label><input id="cfg-email" type="email" readonly></div>' +
        '<div class="field"><label for="cfg-nome">Seu nome</label><input id="cfg-nome" type="text" autocomplete="name" required></div>' +
        senha("cfg-senha", "Senha", "new-password", "Pelo menos 8 caracteres, com letras e números.") +
        '<div class="field"><label for="cfg-senha2">Repita a senha</label><input id="cfg-senha2" type="password" autocomplete="new-password" required></div>' +
        '<p class="error-msg" id="cfg-erro" role="alert"></p><button type="submit" class="btn btn-primary ac-largo">Criar administrador e entrar</button>' +
        '<div class="ac-ou"><span>ou</span></div><p class="muted small">Recebeu um arquivo de acessos do administrador? Importe-o para entrar com o seu usuário.</p>' +
        '<button type="button" class="btn btn-outline ac-largo" data-importar>Importar arquivo de acessos</button>' +
        '<p class="ac-links"><button type="button" class="link-btn" id="btn-voltar-entrar">Voltar para entrar</button></p></form>' +

      '<form id="form-trocar" class="ac-form" hidden novalidate><h2>Crie a sua senha</h2><p class="muted">Você entrou com uma senha provisória. Escolha uma senha só sua para continuar.</p>' +
        senha("trocar-senha", "Nova senha", "new-password", "Pelo menos 8 caracteres, com letras e números.") +
        '<div class="field"><label for="trocar-senha2">Repita a nova senha</label><input id="trocar-senha2" type="password" autocomplete="new-password" required></div>' +
        '<p class="error-msg" id="trocar-erro" role="alert"></p><button type="submit" class="btn btn-primary ac-largo">Salvar e entrar</button></form>' +

      '<p class="error-msg" id="erro-geral" role="alert"></p>' +
      '<input type="file" id="file-acessos" accept=".json,application/json" hidden></div></section></div>';
  }

  function mostrar(id) {
    ["carregando", "form-entrar", "form-configurar", "form-trocar"].forEach(function (f) { $(f).hidden = f !== id; });
    $("teste-card").hidden = !(auth && auth.modoTeste && id === "form-entrar");
    var foco = { "form-entrar": "entrar-email", "form-configurar": "cfg-nome", "form-trocar": "trocar-senha" }[id];
    if (foco && window.innerWidth > 860) setTimeout(function () { var el = $(foco); if (el && !el.value) el.focus(); else if (id === "form-entrar") $("entrar-senha").focus(); }, 30);
  }
  function erro(id, msg) { var e = $(id); e.textContent = msg || ""; e.style.display = msg ? "block" : "none"; }
  function ocupado(form, sim) {
    var b = form.querySelector("button[type=submit]");
    b.disabled = sim;
    if (sim) { b.dataset.texto = b.textContent; b.textContent = "Aguarde…"; } else if (b.dataset.texto) b.textContent = b.dataset.texto;
  }
  function falhaGeral(msg) { $("carregando").hidden = true; erro("erro-geral", msg); }

  function abrirApp(u) {
    if (!AuthCore.podeAcessar(u, A.AREA)) {
      auth.sair();
      mostrar("form-entrar");
      erro("entrar-erro", "O seu usuário não tem acesso ao Em Dia. Peça ao administrador para liberar em Usuários, na Gestão Financeira.");
      return;
    }
    location.reload();
  }
  function depoisDeEntrar(u) { if (u.trocarSenha) { mostrar("form-trocar"); return; } abrirApp(u); }

  function ligar() {
    document.addEventListener("click", function (ev) {
      var m = ev.target.closest("[data-mostrar]");
      if (m) { var i = $(m.dataset.mostrar), ver = i.type === "password"; i.type = ver ? "text" : "password"; m.textContent = ver ? "Ocultar" : "Mostrar"; return; }
      if (ev.target.closest("#ac-tema")) {
        var escuro = document.documentElement.getAttribute("data-theme") !== "dark";
        try { localStorage.setItem(A.CHAVES.tema, escuro ? "escuro" : "claro"); } catch (e) {}
        document.documentElement.setAttribute("data-theme", escuro ? "dark" : "light");
        $("ac-tema").innerHTML = iconeTema(); return;
      }
      if (ev.target.closest("#btn-teste")) {
        var b = $("btn-teste"); b.disabled = true;
        auth.entrarTeste().then(function () { location.reload(); }).catch(function (e) { erro("entrar-erro", e.message); b.disabled = false; });
        return;
      }
      if (ev.target.closest("#btn-ir-configurar")) { mostrar("form-configurar"); return; }
      if (ev.target.closest("#btn-voltar-entrar")) { mostrar("form-entrar"); return; }
      if (ev.target.closest("[data-importar]")) { $("file-acessos").click(); }
    });

    $("form-entrar").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = this; erro("entrar-erro", "");
      var email = $("entrar-email").value, s = $("entrar-senha").value;
      if (!email || !s) { erro("entrar-erro", "Informe o e-mail e a senha."); return; }
      ocupado(f, true);
      auth.entrar(email, s).then(function (u) {
        senhaDigitada = s;
        try { localStorage.setItem("emDiaApp:ultimoEmail", email.trim().toLowerCase()); } catch (e) {}
        depoisDeEntrar(u);
      }).catch(function (e) { erro("entrar-erro", e.message); $("entrar-senha").select(); })
        .then(function () { ocupado(f, false); });
    });

    $("form-configurar").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = this; erro("cfg-erro", "");
      var nome = $("cfg-nome").value.trim(), s1 = $("cfg-senha").value, s2 = $("cfg-senha2").value;
      if (!nome) { erro("cfg-erro", "Informe o seu nome."); return; }
      var p = AuthCore.problemaSenha(s1);
      if (p) { erro("cfg-erro", p); return; }
      if (s1 !== s2) { erro("cfg-erro", "As duas senhas não são iguais."); return; }
      ocupado(f, true);
      auth.configurarAdmin(nome, s1).then(function () { return auth.entrar(AuthCore.ADMIN_EMAIL, s1); })
        .then(depoisDeEntrar).catch(function (e) { erro("cfg-erro", e.message); }).then(function () { ocupado(f, false); });
    });

    $("form-trocar").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = this; erro("trocar-erro", "");
      var s1 = $("trocar-senha").value, s2 = $("trocar-senha2").value;
      var p = AuthCore.problemaSenha(s1);
      if (p) { erro("trocar-erro", p); return; }
      if (s1 !== s2) { erro("trocar-erro", "As duas senhas não são iguais."); return; }
      if (!senhaDigitada) { auth.sair().then(function () { mostrar("form-entrar"); erro("entrar-erro", "Entre de novo com a senha provisória para criar a sua."); }); return; }
      ocupado(f, true);
      auth.trocarSenha(senhaDigitada, s1).then(function (u) { senhaDigitada = ""; abrirApp(u); })
        .catch(function (e) { erro("trocar-erro", e.message); }).then(function () { ocupado(f, false); });
    });

    $("file-acessos").addEventListener("change", function (ev) {
      var file = ev.target.files && ev.target.files[0];
      this.value = "";
      if (!file) return;
      file.text().then(function (t) {
        var dados;
        try { dados = JSON.parse(t); } catch (e) { throw new Error("Este arquivo não é um arquivo de acessos do sistema."); }
        return auth.importarAcessos(dados);
      }).then(function (r) {
        $("link-configurar").hidden = true;
        mostrar("form-entrar");
        erro("entrar-erro", "");
        var ok = $("erro-geral"); ok.textContent = "Acessos importados (" + (r.novos + r.atualizados) + "). Agora entre com o seu e-mail e senha."; ok.style.display = "block"; ok.classList.add("ok");
      }).catch(function (e) { erro($("form-configurar").hidden ? "entrar-erro" : "cfg-erro", e.message); });
    });
  }

  // ---------------------------------------------------------------- início

  var app = document.querySelector(".app");
  app.style.visibility = "hidden";   // até saber se já entrou (evita piscar a tela vazia)
  if (!(window.crypto && window.crypto.subtle) || !window.indexedDB) {
    desenhar(); falhaGeral("O Em Dia precisa ser aberto pelo link (https), não pelo arquivo do computador.");
    return;
  }
  Store.init({ prefixo: "auth:" }).then(function (ok) {
    if (!ok) throw new Error("Este navegador não permite guardar dados. Verifique se não está numa janela anônima.");
    auth = AuthCore.criar(Store, A.sessaoPropria(localStorage, AuthCore.CHAVE_SESSAO), { modoTeste: true });
    return auth.usuarioAtual().then(function (u) {
      if (u && !u.trocarSenha && AuthCore.podeAcessar(u, A.AREA)) {
        app.style.visibility = "";
        EmDiaApp.iniciar(u, function () { return auth.sair(); });   // já entrou: abre o app
        return;
      }
      if (u) auth.sair();
      desenhar(); ligar();
      $("cfg-email").value = AuthCore.ADMIN_EMAIL;
      try { $("entrar-email").value = localStorage.getItem("emDiaApp:ultimoEmail") || ""; } catch (e) {}
      return auth.precisaConfigurar().then(function (vazio) {
        $("link-configurar").hidden = !vazio;
        mostrar("form-entrar");
      });
    });
  }).catch(function (e) {
    if (!document.querySelector(".ac-tela")) desenhar();
    falhaGeral(e.message);
  });
})();
