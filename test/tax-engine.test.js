'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../src/tax-engine.js');

const sale = o => T.calcSale({ mode: 'sell', regime: 'presumido', value: 42, icms: 0.18, pis: 0.0365, dest: 'revenda', ...o });
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.005, `${msg || ''} esperado ${b}, obtido ${a}`);
const soma = r => T.round2(r.v + r.lucro + r.tax + r.feeTotal);

test('C1: ICMS do Remessa Conforme tem tabela própria (20% em 10 UFs, 17% nas demais)', () => {
  for (const uf of ['AC', 'AL', 'BA', 'CE', 'MG', 'PB', 'PI', 'RN', 'RR', 'SE']) assert.equal(T.icmsImportacao(uf), 0.20, uf);
  for (const uf of ['SP', 'RJ', 'PR', 'AM', 'DF', 'MA']) assert.equal(T.icmsImportacao(uf), 0.17, uf);
  const r = T.calcImport({ mode: 'sell', value: 20, cot: 5, icms: T.icmsImportacao('RJ') }); // R$ 100, II 0%
  assert.equal(r.total, 120.48);
});

test('A1: Lucro Presumido inclui IRPJ/CSLL de 2,28% da receita', () => {
  const r = sale();
  assert.equal(r.P, 54.74);
  near(T.presumidoRates(0).total, 0.0228);
  assert.deepEqual(r.taxLines.map(x => x.key), ['icms', 'pis', 'irpj', 'csll']);
  assert.equal(soma(r), r.P);
});

test('A1: adicional de IRPJ só com faturamento mensal acima de R$ 250 mil', () => {
  assert.equal(T.presumidoRates(250000).adicional, 0);
  near(T.presumidoRates(500000).adicional, 0.1 * (0.08 * 500000 - 20000) / 500000, 'adicional'); // 0,6%
  assert.ok(sale({ fatMes: 500000 }).P > sale({ fatMes: 100000 }).P);
  assert.ok(sale().warnings.some(w => /faturamento mensal/.test(w)));
});

test('A1: LC 224/2025 eleva a presunção só sobre a receita anual acima de R$ 5 mi', () => {
  const base = T.presumidoRates(500000, false), lc = T.presumidoRates(500000, true); // anual 6 mi: 1/6 acima
  near(lc.fatorPresuncao, 1 + 0.1 / 6, 'fator');
  assert.ok(lc.irpj > base.irpj);
  assert.equal(T.presumidoRates(300000, true).fatorPresuncao, 1); // 3,6 mi/ano: sem efeito
  assert.ok(sale({ fatMes: 500000, lc224: true }).warnings.some(w => /pendente de validação/.test(w)));
});

test('A1: Lucro Real não inclui IRPJ/CSLL e avisa (B4 também)', () => {
  const r = sale({ regime: 'real', pis: 0.0925 });
  assert.equal(r.taxLines.some(x => x.key === 'irpj' || x.key === 'csll'), false);
  assert.ok(r.warnings.some(w => /antes de IRPJ\/CSLL/.test(w)));
  assert.ok(r.warnings.some(w => /sem os créditos/.test(w)));
});

test('A2: ICMS de Alagoas em 21,5% (20,5% + 1% FCP)', () => {
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.match(src, /\['AL','Alagoas','21,5%'/);
});

test('M7: IPVA do Paraná em 1,9%', () => {
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.match(src, /\['PR','Paraná','19,5%','1,9%'/);
});

test('A3: AFRMM de 8% em todas as modalidades', () => {
  assert.equal(T.AFRMM, 0.08);
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.equal((src.match(/\['AFRMM[^\n]*'Contribuição','8%'/g) || []).length, 3);
  assert.doesNotMatch(src, /'Contribuição','(25|40)%'/);
});

test('M1: base do CBS/IBS exclui ICMS, PIS/Cofins e IPI', () => {
  const r = sale({ ipi: 0.1 });
  const b = r.P / 1.1, icms = b * 0.18, pis = (b - icms) * 0.0365;
  near(r.cbs, (b - icms - pis) * 0.01, 'cbs');
  assert.ok(r.cbs < r.P / 1.1 * 0.01);
});

test('M2: CBS/IBS não aparece para Simples, MEI nem importação', () => {
  assert.equal(T.calcSale({ mode: 'sell', regime: 'simples', value: 42, simples: 0.04 }).cbs, null);
  assert.equal(T.calcSale({ mode: 'sell', regime: 'mei', value: 42, das: 82.05, vendas: 100 }).cbs, null);
  assert.equal(sale().cbs > 0, true);
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.doesNotMatch(src, /compensáve/);
  assert.match(src, /art\. 348 §1º/);
});

test('M3: II automático do Remessa Conforme', () => {
  assert.equal(T.iiRemessaUsd(50), 0);
  assert.equal(T.iiRemessaUsd(30), 0);
  near(T.iiRemessaUsd(100), 30); // 60% de 100 − 30
  near(T.iiRemessaUsd(3000), 1770);
  assert.equal(T.iiRemessaUsd(3000.01), null);
  const r = T.calcImport({ mode: 'sell', value: 100, cot: 5, icms: 0.17 });
  assert.equal(r.lines.ii, 150); // US$ 30 × 5
  assert.equal(r.lines.produto, 500);
});

test('M3: frete e seguro entram na base e o IOF de 3,5% soma ao total pago', () => {
  const sem = T.calcImport({ mode: 'sell', value: 100, cot: 5, freteUsd: 0, icms: 0.17 });
  const com = T.calcImport({ mode: 'sell', value: 100, cot: 5, freteUsd: 20, icms: 0.17, iof: T.IOF_CARTAO });
  assert.equal(com.lines.frete, 100);
  assert.equal(com.lines.iof, T.round2(600 * 0.035));
  assert.ok(com.total > sem.total);
  assert.equal(com.total, T.sum2([com.lines.produto, com.lines.frete, com.tax]));
  assert.equal(com.lines.ii, T.round2((0.6 * 120 - 30) * 5));
});

test('M3: modo compra inverte o cálculo (ida e volta)', () => {
  for (const [usd, iof] of [[20, 0], [80, 0], [200, T.IOF_CARTAO], [2500, T.IOF_CARTAO]]) {
    const ida = T.calcImport({ mode: 'sell', value: usd, cot: 5.4, icms: 0.17, iof });
    const volta = T.calcImport({ mode: 'buy', value: ida.total, cot: 5.4, icms: 0.17, iof });
    assert.ok(volta.ok);
    near(volta.lines.produto, usd * 5.4, `produto ${usd}`);
  }
});

test('M3: cotação obrigatória, acima de US$ 3.000 exige II manual', () => {
  assert.equal(T.calcImport({ mode: 'sell', value: 10, cot: 0, icms: 0.17 }).ok, false);
  assert.equal(T.calcImport({ mode: 'sell', value: 4000, cot: 5, icms: 0.17 }).ok, false);
  assert.equal(T.calcImport({ mode: 'sell', value: 4000, cot: 5, icms: 0.17, iiOverride: 0.6 }).ok, true);
});

test('M4: IPI entra na base do ICMS para consumidor final, não na revenda', () => {
  const rev = sale({ ipi: 0.1, dest: 'revenda' }), fin = sale({ ipi: 0.1, dest: 'final' });
  const icms = r => r.taxLines.find(x => x.key === 'icms').v;
  assert.ok(fin.P > rev.P);
  near(icms(fin), fin.P * 0.18, 'ICMS por dentro sobre o total com IPI');
  near(icms(rev), fin.P === rev.P ? 0 : rev.P / 1.1 * 0.18, 'revenda sem IPI');
  assert.ok(fin.warnings.some(w => /pendente de validação/.test(w)));
  assert.equal(sale({ ipi: 0 , dest: 'final' }).P, sale({ ipi: 0, dest: 'revenda' }).P);
});

test('M5: Simples ignora o IPI (já está no DAS)', () => {
  const a = T.calcSale({ mode: 'sell', regime: 'simples', value: 100, simples: 0.04, ipi: 0.15 });
  const b = T.calcSale({ mode: 'sell', regime: 'simples', value: 100, simples: 0.04, ipi: 0 });
  assert.equal(a.P, b.P);
  assert.equal(a.taxLines.some(x => x.key === 'ipi'), false);
  assert.ok(a.warnings.some(w => /ICMS-ST e DIFAL/.test(w)));
});

test('M5: alíquota efetiva do Simples (LC 123, Anexos I e II)', () => {
  near(T.simplesEfetiva('I', 180000).aliquota, 0.04, 'faixa 1');
  const r = T.simplesEfetiva('I', 300000); // (300000 × 7,3% − 5.940) / 300000
  near(r.aliquota, (300000 * 0.073 - 5940) / 300000);
  assert.equal(r.faixa, 2);
  near(T.simplesEfetiva('II', 1000000).aliquota, (1000000 * 0.112 - 22500) / 1000000);
  near(T.simplesEfetiva('I', 4800000).aliquota, (4800000 * 0.19 - 378000) / 4800000);
  assert.equal(T.simplesEfetiva('I', 3600001).icmsIssFora, true);
  assert.ok(T.simplesEfetiva('I', 5000000).error);
  assert.ok(T.simplesEfetiva('I', 0).error);
  assert.ok(T.simplesEfetiva('X', 1000).error);
});

test('M6: catálogo do IRPF traz a Lei 15.270/2025', () => {
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.match(src, /R\$ 5\.000/);
  assert.match(src, /IRRF sobre dividendos','Imposto retido','10% na fonte'/);
  assert.match(src, /R\$ 50\.000 por mês/);
  assert.match(src, /IRPF mínimo/);
});

test('B1: cada linha arredondada a centavos e o total é a soma exibida', () => {
  for (const v of [42, 19.99, 0.37, 1234.567, 999.99]) {
    const r = sale({ value: v, margem: 0.1, com: 0.12, pag: 0.0399, fixo: 3.333, frete: 7.777 });
    for (const x of [...r.taxLines, ...r.fees]) assert.equal(T.round2(x.v), x.v);
    assert.equal(soma(r), r.P, `v=${v}`);
  }
  const b = T.calcSale({ mode: 'buy', regime: 'presumido', value: 100.01, icms: 0.18, pis: 0.0365 });
  assert.equal(T.round2(b.net + b.tax), b.P);
  assert.equal(T.round2(0.005), 0.01);
  assert.equal(T.round2(1.005), 1.01);
  assert.ok(!Object.is(T.round2(-0.001), -0)); // sem "-R$ 0,00" na tela
});

test('B2: campos inválidos geram erro em vez de virar 0', () => {
  assert.ok(T.parseField('abc', { label: 'O ICMS' }).error);
  assert.ok(T.parseField('-5', { label: 'O ICMS' }).error);
  assert.ok(T.parseField('150', { label: 'O ICMS', max: 99 }).error);
  assert.ok(T.parseField('', { label: 'O custo', allowEmpty: false }).error);
  assert.deepEqual(T.parseField('', {}), { value: 0 });
  assert.deepEqual(T.parseField('12,5', {}), { value: 12.5 });
  assert.deepEqual(T.parseField('99', { max: 99 }), { value: 99 });
  assert.ok(T.parseField('12abc', {}).error);
});

test('B3: MEI, DAS, limite proporcional, tolerância de 20% e caminhoneiro', () => {
  assert.equal(T.meiDas('comum', 'com'), 82.05);
  assert.equal(T.meiDas('comum', 'serv'), 86.05);
  assert.equal(T.meiDas('comum', 'ambos'), 87.05);
  assert.equal(T.meiDas('caminhoneiro', 'com'), 195.52);
  assert.equal(T.meiDas('caminhoneiro', 'serv'), 199.52);
  assert.equal(T.meiDas('caminhoneiro', 'ambos'), 200.52);
  const cheio = T.meiLimites('comum', 12);
  assert.equal(cheio.limite, 81000);
  assert.equal(cheio.tolerancia, 97200);
  assert.equal(T.meiLimites('comum', 5).limite, 33750); // 6.750 × 5
  assert.equal(T.meiLimites('comum', undefined).limite, 81000);
  assert.equal(T.meiLimites('caminhoneiro', 12).limite, 251600);
  assert.equal(T.meiFaixa(81000, cheio), 'ok');
  assert.equal(T.meiFaixa(90000, cheio), 'tolerancia');
  assert.equal(T.meiFaixa(97201, cheio), 'excedido');
  const r = T.calcSale({ mode: 'sell', regime: 'mei', value: 50, das: 82.05, vendas: 200, meiMeses: 2, meiTipo: 'comum' }); // ~50 × 200 × 2 = 20 mil > 13.500
  assert.equal(r.meiStatus.limite, 13500);
  assert.equal(r.meiStatus.faixa, 'excedido');
  assert.equal(r.du, 0.41); // 82,05 ÷ 200 arredondado
  assert.equal(T.calcSale({ mode: 'sell', regime: 'mei', value: 50, das: 82.05, vendas: 100 }).meiStatus, null);
  assert.equal(T.calcSale({ mode: 'sell', regime: 'mei', value: 50, das: 82.05, vendas: 0 }).ok, false);
});

test('B3: DAS do MEI continua rateado pelas vendas e o total fecha', () => {
  const r = T.calcSale({ mode: 'sell', regime: 'mei', value: 42, das: 82.05, vendas: 100, margem: 0.1, com: 0.12 });
  assert.equal(soma({ ...r, tax: r.du }), r.P);
});

test('B5: catálogo traz o IOF de 5% em VGBL acima de R$ 600 mil', () => {
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.match(src, /VGBL: 5% acima de R\$ 600 mil por ano/);
  assert.match(src, /Decreto 12\.499\/2025/);
});

test('B6: aviso de contador com data na calculadora', () => {
  const html = require('node:fs').readFileSync(__dirname + '/../src/index.html', 'utf8');
  assert.match(html, /verificadas em 30\/09\/2026; não substitui contador/);
  assert.equal(T.VERIFICADO_EM, '30/09/2026');
});

test('B7: ITCMD marcado como não verificado e Reintegra com fonte oficial', () => {
  const src = require('node:fs').readFileSync(__dirname + '/../src/app.js', 'utf8');
  assert.match(src, /NÃO VERIFICADO com a lei estadual/);
  assert.match(src, /Decreto 12\.565\/2025/);
});

test('Regressão: valores que já estavam corretos', () => {
  // Simples: DAS sobre o preço, sem IPI: 42 / (1 − 0,04)
  assert.equal(T.calcSale({ mode: 'sell', regime: 'simples', value: 42, simples: 0.04 }).P, 43.75);
  // ICMS por dentro, PIS/Cofins sem ICMS (Real): 42 / (1 − 0,18 − 0,82 × 0,0925)
  const r = sale({ regime: 'real', pis: 0.0925 });
  near(r.P, 42 / (1 - 0.18 - 0.82 * 0.0925), 'real');
  assert.equal(T.SALARIO_MINIMO_2026, 1621);
  // Compra: IPI por fora
  const b = T.calcSale({ mode: 'buy', regime: 'real', value: 110, icms: 0.18, pis: 0.0925, ipi: 0.1, dest: 'revenda' });
  assert.equal(b.taxLines.find(x => x.key === 'ipi').v, 10);
});

test('Erros de soma de percentuais', () => {
  assert.equal(sale({ com: 0.9 }).ok, false);
  assert.equal(T.calcSale({ mode: 'buy', regime: 'real', value: 10, icms: 0.9, pis: 1 }).ok, false);
});
