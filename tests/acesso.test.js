// Entrada do Em Dia: modo de teste separado, acesso com senha (PBKDF2), sessão.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/acesso.js");

function memoria() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}

test("teste e acesso usam espaços de dados diferentes, e nenhum é o do módulo da Gestão Financeira", () => {
  const s = memoria();
  const t = A.iniciarSessao("teste", null, s);
  assert.equal(A.chaveDados(t), "emDiaApp:teste:v1");
  assert.equal(A.chaveDados({ modo: "conta" }), "emDiaApp:v1");
  assert.equal(t.usuario.id, "teste");
  assert.ok(Object.values(A.CHAVES).every((k) => k.startsWith("emDiaApp:")));
});

test("criar acesso: a senha não fica guardada; entrar confere a senha", async () => {
  const s = memoria();
  assert.equal(A.temConta(s), false);
  const c = await A.criarConta({ nome: "Pessoa Exemplo", email: " Pessoa@Exemplo.com ", senha: "segredo1" }, s);
  assert.equal(c.perfil, "admin", "o primeiro acesso é o gestor");
  assert.equal(c.email, "pessoa@exemplo.com");
  const bruto = s.getItem("emDiaApp:contas");
  assert.ok(!bruto.includes("segredo1"));
  const ok = await A.entrar("PESSOA@exemplo.com", "segredo1", s);
  assert.equal(ok.id, c.id);
  await assert.rejects(A.entrar("pessoa@exemplo.com", "errada", s), /não conferem/);
  await assert.rejects(A.entrar("outra@exemplo.com", "segredo1", s), /não conferem/);
  await assert.rejects(A.criarConta({ nome: "X", email: "pessoa@exemplo.com", senha: "123456" }, s), /Já existe/);
  await assert.rejects(A.criarConta({ nome: "X", email: "x@exemplo.com", senha: "123" }, s), /6 caracteres/);
  const c2 = await A.criarConta({ nome: "Outra Exemplo", email: "outra@exemplo.com", senha: "123456" }, s);
  assert.equal(c2.perfil, "usuario");
});

test("sessão: entra, sai, e some se o acesso for apagado", async () => {
  const s = memoria();
  const c = await A.criarConta({ nome: "Pessoa Exemplo", email: "p@exemplo.com", senha: "segredo1" }, s);
  A.iniciarSessao("conta", c, s);
  assert.equal(A.sessaoAtual(s).usuario.nome, "Pessoa Exemplo");
  A.sair(s);
  assert.equal(A.sessaoAtual(s), null);
  A.iniciarSessao("conta", c, s);
  s.setItem("emDiaApp:v1", "{}");
  A.redefinirAcessos(s);
  assert.equal(A.sessaoAtual(s), null);
  assert.equal(A.temConta(s), false);
  assert.equal(s.getItem("emDiaApp:v1"), "{}", "os dados continuam");
});
