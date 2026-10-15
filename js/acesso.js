/*
 * acesso.js — onde o Em Dia guarda as coisas (EmDiaAcesso).
 *
 * O LOGIN é o mesmo da Gestão Financeira (js/auth.js e js/storage.js são cópias de lá):
 * os acessos ficam no IndexedDB "gestao-financeira", chave "auth:usuarios", que o navegador
 * divide entre os dois apps porque os dois estão no mesmo endereço (orprocondigital-web.github.io).
 * Então o administrador e a senha são os mesmos. Num aparelho onde a Gestão Financeira nunca
 * foi aberta, entra-se igual a ela: "Criar o primeiro acesso" ou "Importar o arquivo de acessos".
 *
 * A SESSÃO é só do Em Dia ("emDiaApp:sessao"): entrar ou sair aqui não mexe na Gestão Financeira.
 * Os DADOS também são só dele, e o modo de teste tem um espaço separado:
 *   "emDiaApp:v1"        → quem entrou com e-mail e senha (abre limpo)
 *   "emDiaApp:teste:v1"  → "Entrar no modo de teste" (já vem com o exemplo; dá para zerar)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EmDiaAcesso = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var P = "emDiaApp:";
  var CHAVES = {
    sessao: P + "sessao", dados: P + "v1", dadosTeste: P + "teste:v1",
    mes: P + "mes", aba: P + "aba", tema: P + "tema", ultimoBackup: P + "ultimoBackup"
  };
  var AREA = "mod-em-dia";

  /** Dados de quem entrou: o modo de teste fica separado. */
  function chaveDados(usuario) { return usuario && usuario.teste ? CHAVES.dadosTeste : CHAVES.dados; }

  /**
   * Sessão para o AuthCore: ele grava em "gf.sessao" (a da Gestão Financeira);
   * aqui a mesma chamada vai para "emDiaApp:sessao", para um app não entrar nem sair pelo outro.
   */
  function sessaoPropria(ls, chaveDoSistema) {
    var troca = function (k) { return k === chaveDoSistema ? CHAVES.sessao : k; };
    return {
      getItem: function (k) { return ls.getItem(troca(k)); },
      setItem: function (k, v) { return ls.setItem(troca(k), v); },
      removeItem: function (k) { return ls.removeItem(troca(k)); }
    };
  }

  return { CHAVES: CHAVES, AREA: AREA, chaveDados: chaveDados, sessaoPropria: sessaoPropria };
});
