// Login do Em Dia = o da Gestão Financeira (mesmo AuthCore e mesma lista de acessos), com sessão e dados próprios.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const A = require("../js/acesso.js");
const AuthCore = require("../js/auth.js");

function memoria() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}
function store() { const c = {}; return { get: (k) => c[k], set: (k, v) => { c[k] = v; return Promise.resolve(true); } }; }

test("teste e usuário de verdade usam espaços de dados diferentes, nenhum é o do módulo da Gestão Financeira", () => {
  assert.equal(A.chaveDados({ teste: true }), "emDiaApp:teste:v1");
  assert.equal(A.chaveDados({ teste: false }), "emDiaApp:v1");
  assert.ok(Object.values(A.CHAVES).every((k) => k.startsWith("emDiaApp:")));
});

test("o admin criado na Gestão Financeira entra no Em Dia com a mesma senha; a sessão é separada", async () => {
  const acessos = store(), ls = memoria();
  const gf = AuthCore.criarAuthLocal(acessos, ls, { modoTeste: true });          // a Gestão Financeira
  await gf.configurarAdmin("Admin Exemplo", "SenhaTeste123");
  const ed = AuthCore.criarAuthLocal(acessos, A.sessaoPropria(ls, AuthCore.CHAVE_SESSAO), { modoTeste: true });   // o Em Dia
  await assert.rejects(ed.entrar(AuthCore.ADMIN_EMAIL, "errada1234"), /incorretos/);
  const u = await ed.entrar(AuthCore.ADMIN_EMAIL, "SenhaTeste123");
  assert.equal(u.perfil, "admin");
  assert.ok(ls.getItem("emDiaApp:sessao"), "sessão do Em Dia gravada");
  assert.equal(ls.getItem("gf.sessao"), null, "não entrou na Gestão Financeira junto");
  assert.equal((await ed.usuarioAtual()).email, AuthCore.ADMIN_EMAIL);
  assert.equal(await gf.usuarioAtual(), null);
  await ed.sair();
  assert.equal(await ed.usuarioAtual(), null);
});

test("modo de teste: entra sem senha, marcado como teste (vai para os dados de teste)", async () => {
  const ls = memoria();
  const ed = AuthCore.criarAuthLocal(store(), A.sessaoPropria(ls, AuthCore.CHAVE_SESSAO), { modoTeste: true });
  const u = await ed.entrarTeste();
  assert.equal(u.teste, true);
  assert.equal(A.chaveDados(u), "emDiaApp:teste:v1");
  assert.ok(AuthCore.podeAcessar(u, A.AREA));
});
