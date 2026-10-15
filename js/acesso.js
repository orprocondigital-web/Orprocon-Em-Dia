/*
 * acesso.js — entrada no Em Dia (EmDiaAcesso). Sem servidor: tudo fica neste aparelho.
 *
 * Dois jeitos de entrar:
 *   - Modo de teste: sem senha, com dados de exemplo, num espaço separado ("emDiaApp:teste:v1").
 *     Dá para zerar à vontade sem encostar nos dados de verdade.
 *   - Meu acesso: nome, e-mail e senha criados na primeira vez. Abre limpo, no espaço "emDiaApp:v1".
 *
 * A senha nunca é guardada: só um resumo PBKDF2-SHA256 com sal aleatório (Web Crypto).
 * Os dados do app continuam no navegador; a senha separa o uso real do teste e evita que
 * alguém abra o app por engano, mas quem tem o aparelho em mãos pode ler o navegador.
 *
 * Tudo com o prefixo "emDiaApp:" para não misturar com o módulo Em Dia da Gestão Financeira,
 * que fica no mesmo endereço (github.io) e usa "emDia:".
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EmDiaAcesso = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var P = "emDiaApp:";
  var CHAVES = {
    contas: P + "contas", sessao: P + "sessao", dados: P + "v1", dadosTeste: P + "teste:v1",
    mes: P + "mes", aba: P + "aba", tema: P + "tema", ultimoBackup: P + "ultimoBackup"
  };
  var ITERACOES = 150000;
  var USUARIO_TESTE = { id: "teste", nome: "Usuário de teste", email: "", perfil: "admin" };

  function armazenamento(s) {
    return s || (typeof localStorage !== "undefined" ? localStorage : null);
  }
  function ler(s, k, padrao) { try { var v = JSON.parse(armazenamento(s).getItem(k)); return v === null ? padrao : v; } catch (e) { return padrao; } }
  function gravar(s, k, v) { armazenamento(s).setItem(k, JSON.stringify(v)); }

  function cripto() {
    var c = (typeof crypto !== "undefined" && crypto) || (typeof globalThis !== "undefined" && globalThis.crypto);
    if (!c || !c.subtle) throw new Error("Este navegador não tem a criptografia necessária. Abra o app pelo endereço https.");
    return c;
  }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function deHex(h) { var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }

  function resumoSenha(senha, salHex, iteracoes) {
    var c = cripto();
    var enc = new TextEncoder();
    return c.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]).then(function (chave) {
      return c.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: deHex(salHex), iterations: iteracoes }, chave, 256);
    }).then(hex);
  }
  function iguais(a, b) { if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
  function normEmail(e) { return String(e || "").trim().toLowerCase(); }

  function contas(s) { var l = ler(s, CHAVES.contas, []); return Array.isArray(l) ? l : []; }
  function temConta(s) { return contas(s).length > 0; }

  function validarSenha(senha) {
    senha = String(senha || "");
    if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    return "";
  }

  /** Cria o acesso deste aparelho (o primeiro é o gestor). Devolve a conta, sem o resumo da senha. */
  function criarConta(dados, s) {
    var nome = String(dados.nome || "").trim(), email = normEmail(dados.email), senha = String(dados.senha || "");
    if (!nome) return Promise.reject(new Error("Informe o seu nome."));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.reject(new Error("Informe um e-mail válido."));
    var erroSenha = validarSenha(senha);
    if (erroSenha) return Promise.reject(new Error(erroSenha));
    var lista = contas(s);
    if (lista.some(function (c) { return c.email === email; })) return Promise.reject(new Error("Já existe um acesso com este e-mail neste aparelho."));
    var sal = new Uint8Array(16); cripto().getRandomValues(sal);
    var salHex = hex(sal.buffer);
    return resumoSenha(senha, salHex, ITERACOES).then(function (h) {
      var conta = { id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome: nome, email: email,
        perfil: lista.length ? "usuario" : "admin", sal: salHex, resumo: h, iteracoes: ITERACOES, criadoEm: new Date().toISOString() };
      lista.push(conta); gravar(s, CHAVES.contas, lista);
      return publica(conta);
    });
  }

  function publica(c) { return { id: c.id, nome: c.nome, email: c.email, perfil: c.perfil }; }

  /** Confere e-mail e senha. Devolve a conta (sem o resumo) ou rejeita com mensagem. */
  function entrar(email, senha, s) {
    email = normEmail(email);
    var conta = contas(s).filter(function (c) { return c.email === email; })[0];
    if (!conta) return Promise.reject(new Error("E-mail ou senha não conferem."));
    return resumoSenha(String(senha || ""), conta.sal, conta.iteracoes || ITERACOES).then(function (h) {
      if (!iguais(h, conta.resumo)) throw new Error("E-mail ou senha não conferem.");
      return publica(conta);
    });
  }

  function iniciarSessao(modo, usuario, s) {
    var sessao = { modo: modo, usuario: modo === "teste" ? (usuario && usuario.id ? usuario : USUARIO_TESTE) : usuario, desde: new Date().toISOString() };
    gravar(s, CHAVES.sessao, sessao);
    return sessao;
  }
  function sessaoAtual(s) {
    var x = ler(s, CHAVES.sessao, null);
    if (!x || (x.modo !== "teste" && x.modo !== "conta") || !x.usuario || !x.usuario.id) return null;
    if (x.modo === "conta" && !contas(s).some(function (c) { return c.id === x.usuario.id; })) return null;
    return x;
  }
  function sair(s) { armazenamento(s).removeItem(CHAVES.sessao); }

  /** Onde ficam os dados de cada modo. */
  function chaveDados(sessao) { return sessao && sessao.modo === "teste" ? CHAVES.dadosTeste : CHAVES.dados; }

  /** Esqueceu a senha: apaga os acessos deste aparelho (os dados continuam) para criar outro. */
  function redefinirAcessos(s) { armazenamento(s).removeItem(CHAVES.contas); sair(s); }

  return {
    CHAVES: CHAVES, USUARIO_TESTE: USUARIO_TESTE, contas: contas, temConta: temConta, validarSenha: validarSenha,
    criarConta: criarConta, entrar: entrar, iniciarSessao: iniciarSessao, sessaoAtual: sessaoAtual, sair: sair,
    chaveDados: chaveDados, redefinirAcessos: redefinirAcessos, resumoSenha: resumoSenha
  };
});
