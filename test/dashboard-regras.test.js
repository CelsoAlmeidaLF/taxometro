// Consultoria MEI (dashboard.js): regras guardadas ilegíveis não deixam a tela em branco; o protótipo admin saiu de src/.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const T = require('../src/tax-engine.js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const AGORA = '2026-11-19T12:00:00.000Z';

test('lerRegrasOraculo: sem nada guardado usa o padrão sem aviso', () => {
  for (const raw of [null, undefined, '']) {
    const r = T.lerRegrasOraculo(raw, AGORA);
    assert.deepEqual(r, { regras: { iof: 0.035, meiLimit: 6750, updatedAt: AGORA }, aviso: false });
  }
});

test('lerRegrasOraculo: regras válidas são usadas', () => {
  const guardado = { iof: 0.04, meiLimit: 7000, updatedAt: '2026-11-01T10:00:00.000Z' };
  const r = T.lerRegrasOraculo(JSON.stringify(guardado), AGORA);
  assert.deepEqual(r, { regras: guardado, aviso: false });
});

test('lerRegrasOraculo: JSON quebrado ou campos inválidos caem no padrão COM aviso', () => {
  const ruins = ['{quebrado', 'null', '[1]', '"x"', '{}', '{"iof":"a","meiLimit":6750,"updatedAt":"2026-01-01"}',
    '{"iof":0.035,"meiLimit":-1,"updatedAt":"2026-01-01"}', '{"iof":0.035,"meiLimit":6750,"updatedAt":"nada"}', '{"iof":5,"meiLimit":6750,"updatedAt":"2026-01-01"}'];
  for (const raw of ruins) {
    const r = T.lerRegrasOraculo(raw, AGORA);
    assert.equal(r.aviso, true, raw);
    assert.equal(r.regras.meiLimit, 6750, raw);
  }
});

function boot(guardado) {
  const els = {};
  const mk = (id) => { const classes = new Set(); return { id, value: '', innerText: '', textContent: '', className: '',
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), toggle: (c, on) => { on ? classes.add(c) : classes.delete(c); }, contains: (c) => classes.has(c) } }; };
  const doc = { getElementById: (id) => els[id] || (els[id] = mk(id)) };
  const erros = [];
  const ctx = { document: doc, localStorage: { getItem: () => guardado }, console: { error: (m) => erros.push(m) }, TaxEngine: T, Date, Number, parseFloat, parseInt, Math,
    alert: () => { throw new Error('alert nativo'); } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(SRC, 'dashboard.js'), 'utf8') + '\nthis.gerarLaudo = gerarLaudo;', ctx);
  return { ctx, $: doc.getElementById, erros };
}

test('dashboard: dado ruim guardado -> laudo aparece com o padrão e o aviso exato, sem alert e com console.error fixo', () => {
  const { ctx, $, erros } = boot('{ruim');
  assert.equal($('avisoRegras').classList.contains('is-visible'), true, 'aviso já ao abrir a tela');
  $('faturamento').value = '50000'; $('meses').value = '12';
  ctx.gerarLaudo();
  assert.equal($('limiteAplicado').innerText.replace(/\s/g, ' '), 'R$ 81.000,00');
  assert.equal($('laudoBox').classList.contains('is-visible'), true);
  assert.equal($('avisoRegras').textContent, 'Não conseguimos ler as regras salvas neste aparelho. Usamos os valores padrão da lei (limite MEI de R$ 6.750 por mês e IOF de 3,5%).');
  assert.ok(erros.every((m) => m === 'Taxômetro: regras guardadas ilegíveis, usando o padrão.'));
});

test('dashboard: regras válidas ou ausentes não mostram aviso', () => {
  for (const g of [null, JSON.stringify({ iof: 0.035, meiLimit: 6750, updatedAt: '2026-11-01T10:00:00.000Z' })]) {
    const { ctx, $ } = boot(g);
    $('faturamento').value = '50000'; $('meses').value = '12';
    ctx.gerarLaudo();
    assert.equal($('avisoRegras').classList.contains('is-visible'), false);
    assert.equal($('laudoBox').classList.contains('is-visible'), true);
  }
});

test('dashboard: campos vazios avisam na tela (sem alert nativo)', () => {
  const { ctx, $ } = boot(null);
  $('faturamento').value = ''; $('meses').value = '12';
  ctx.gerarLaudo();
  assert.equal($('avisoCampos').textContent, 'Preencha o faturamento e os meses de atividade.');
  assert.equal($('avisoCampos').classList.contains('is-visible'), true);
});

test('dashboard.html carrega o motor antes do dashboard.js e tem os dois avisos', () => {
  const html = fs.readFileSync(path.join(SRC, 'dashboard.html'), 'utf8');
  assert.ok(html.indexOf('tax-engine.js') > -1 && html.indexOf('tax-engine.js') < html.indexOf('dashboard.js'));
  assert.match(html, /id="avisoRegras"/); assert.match(html, /id="avisoCampos"/);
});

test('protótipo admin fora de src/: nada em src/ o referencia (HTML, sw.js, manifest) e ele existe em prototipos/admin', () => {
  for (const f of ['admin.html', 'admin.js', 'infrastructure/AdminAdapter.js']) {
    assert.equal(fs.existsSync(path.join(SRC, f)), false, f + ' não pode estar em src/');
    assert.equal(fs.existsSync(path.join(ROOT, 'prototipos', 'admin', f)), true, f + ' em prototipos/admin');
  }
  for (const f of ['index.html', 'dashboard.html', 'sw.js', 'manifest.json']) {
    assert.doesNotMatch(fs.readFileSync(path.join(SRC, f), 'utf8'), /admin|AdminAdapter/i, f);
  }
});
