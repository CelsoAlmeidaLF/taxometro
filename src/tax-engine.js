// Motor de cálculo do Taxômetro: funções puras, sem DOM. Roda no navegador (window.TaxEngine) e no Node (require).
// Alíquotas verificadas em 30/09/2026. Percentuais entram como fração (0,18 = 18%).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TaxEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- Constantes legais ----
  const VERIFICADO_EM = '30/09/2026';
  const SALARIO_MINIMO_2026 = 1621;
  // Remessa Conforme: ICMS de 20% em 10 UFs, 17% nas demais (Convênio ICMS 81/2023, alterado pelo 135/2024; tabela Comsefaz).
  const ICMS_IMPORT_20 = ['AC', 'AL', 'BA', 'CE', 'MG', 'PB', 'PI', 'RN', 'RR', 'SE'];
  const AFRMM = 0.08; // Lei 14.301/2022 (art. 6º da Lei 10.893/2004): 8% em todas as modalidades
  const IOF_CARTAO = 0.035; // Decreto 12.499/2025
  const CBS = 0.009, IBS = 0.001; // ano-teste 2026
  const II_REMESSA = { isentoAteUsd: 50, teto: 3000, aliquota: 0.6, descontoUsd: 30 };
  const PRESUNCAO = { irpj: 0.08, csll: 0.12, aliqIrpj: 0.15, aliqCsll: 0.09, adicional: 0.10, limiteMensalAdicional: 20000 };
  const LC224 = { acrescimo: 0.10, limiteAnual: 5000000 };
  const MEI = { limiteMensal: 6750, limiteAnual: 81000, tolerancia: 0.20, caminhoneiroAnual: 251600, inss: 0.05, inssCaminhoneiro: 0.12, icms: 1, iss: 5 };
  // LC 123/2006, Anexos I (comércio) e II (indústria): [teto RBT12, alíquota nominal, parcela a deduzir]
  const ANEXOS = {
    I: [[180000, 0.04, 0], [360000, 0.073, 5940], [720000, 0.095, 13860], [1800000, 0.107, 22500], [3600000, 0.143, 87300], [4800000, 0.19, 378000]],
    II: [[180000, 0.045, 0], [360000, 0.078, 5940], [720000, 0.10, 13860], [1800000, 0.112, 22500], [3600000, 0.147, 85500], [4800000, 0.30, 720000]]
  };

  // ---- Utilidades ----
  // Arredonda a centavos (meio para cima) tolerando ruído de ponto flutuante.
  const round2 = x => { const s = x < 0 ? -1 : 1; return s * Math.round(Math.abs(x) * 100 + 1e-7) / 100 + 0; };
  const sum2 = arr => round2(arr.reduce((a, x) => a + x, 0));

  // Valida um campo digitado. Vazio vira `def` (se allowEmpty); texto inválido, abaixo do mínimo ou acima do máximo geram erro.
  function parseField(raw, o) {
    o = o || {};
    const label = o.label || 'Campo', min = o.min == null ? 0 : o.min, max = o.max == null ? Infinity : o.max;
    const s = raw == null ? '' : String(raw).trim().replace(',', '.');
    if (s === '') return o.allowEmpty === false ? { error: `Informe ${label}.` } : { value: o.def == null ? 0 : o.def };
    const v = Number(s);
    if (!isFinite(v)) return { error: `${label}: valor inválido.` };
    if (v < min) return { error: `${label}: não pode ser menor que ${min}.` };
    if (v > max) return { error: `${label}: não pode ser maior que ${max}.` };
    return { value: v };
  }

  // ---- ICMS da importação (C1) ----
  const icmsImportacao = uf => (ICMS_IMPORT_20.includes(String(uf).toUpperCase()) ? 0.20 : 0.17);

  // ---- Imposto de importação do Remessa Conforme (M3) ----
  // Valor aduaneiro em US$ (produto + frete + seguro). Retorna o imposto em US$ ou null se acima de US$ 3.000.
  function iiRemessaUsd(usd) {
    if (usd <= II_REMESSA.isentoAteUsd) return 0;
    if (usd <= II_REMESSA.teto) return Math.max(0, usd * II_REMESSA.aliquota - II_REMESSA.descontoUsd);
    return null;
  }

  // Importação. mode 'sell': value = produto em US$ (+ freteUsd), resultado = total pago.
  // mode 'buy': value = total pago em R$ (com IOF), resultado = produto (com frete e seguro) sem impostos.
  // iiOverride: alíquota manual do II (fração) sobre o valor aduaneiro, sem desconto; null = regra automática.
  function calcImport(o) {
    const { mode, value, cot, icms, iiOverride = null, iof = 0 } = o;
    const freteUsd = o.freteUsd || 0;
    if (!(cot > 0)) return { ok: false, error: 'Informe a cotação do dólar (R$ por US$ 1).' };
    if (!(icms < 1)) return { ok: false, error: 'Revise o ICMS: precisa ser menor que 100%.' };
    const k = 1 / (1 - icms);
    let base; // valor aduaneiro em R$
    if (mode === 'sell') {
      base = (value + freteUsd) * cot;
    } else {
      // Inverte: total = (base + II)/(1 − ICMS) + base × IOF, com II linear por trecho.
      if (iiOverride != null) base = value / ((1 + iiOverride) * k + iof);
      else {
        base = value / (k + iof);
        if (base / cot > II_REMESSA.isentoAteUsd) {
          base = (value + II_REMESSA.descontoUsd * cot * k) / ((1 + II_REMESSA.aliquota) * k + iof);
          if (base / cot > II_REMESSA.teto) return { ok: false, error: 'Acima de US$ 3.000 não é Remessa Conforme. Informe a alíquota do II da NCM no campo manual.' };
        }
      }
    }
    const baseUsd = base / cot;
    let ii;
    if (iiOverride != null) ii = base * iiOverride;
    else {
      const usd = iiRemessaUsd(baseUsd);
      if (usd == null) return { ok: false, error: 'Acima de US$ 3.000 não é Remessa Conforme. Informe a alíquota do II da NCM no campo manual.' };
      ii = usd * cot;
    }
    const gross = (base + ii) * k; // ICMS por dentro sobre valor aduaneiro + II
    const lines = {
      produto: round2(mode === 'sell' ? value * cot : base),
      frete: round2(mode === 'sell' ? freteUsd * cot : 0),
      ii: round2(ii),
      icms: round2(gross - base - ii),
      iof: round2(base * iof)
    };
    const tax = sum2([lines.ii, lines.icms, lines.iof]);
    const total = sum2([lines.produto, lines.frete, tax]);
    const warnings = [];
    if (iiOverride == null && baseUsd > II_REMESSA.isentoAteUsd) warnings.push('II de 60% com desconto de US$ 30 (Remessa Conforme, pessoa física). Para NCM/regime diferente, use o campo manual.');
    return { ok: true, lines, tax, total, baseUsd, warnings };
  }

  // ---- Simples Nacional (M5) ----
  function simplesEfetiva(anexo, rbt12) {
    const tab = ANEXOS[anexo];
    if (!tab) return { error: 'Anexo inválido.' };
    if (!(rbt12 > 0)) return { error: 'Informe a receita bruta dos últimos 12 meses (RBT12).' };
    if (rbt12 > 4800000) return { error: 'RBT12 acima de R$ 4,8 milhões: fora do Simples Nacional.' };
    const f = tab.find(x => rbt12 <= x[0]);
    const aliq = (rbt12 * f[1] - f[2]) / rbt12;
    return { aliquota: aliq, nominal: f[1], deducao: f[2], faixa: tab.indexOf(f) + 1, icmsIssFora: rbt12 > 3600000 };
  }

  // ---- Lucro Presumido: IRPJ/CSLL como fração da receita (A1) ----
  // fatMes = faturamento mensal médio (R$), opcional. lc224 = aplica +10% na presunção sobre a receita anual acima de R$ 5 mi.
  function presumidoRates(fatMes, lc224) {
    const R = fatMes > 0 ? fatMes : 0;
    const anual = R * 12;
    const share = lc224 && anual > LC224.limiteAnual ? (anual - LC224.limiteAnual) / anual : 0;
    const f = 1 + LC224.acrescimo * share;
    const irpj = PRESUNCAO.irpj * f * PRESUNCAO.aliqIrpj;
    const csll = PRESUNCAO.csll * f * PRESUNCAO.aliqCsll;
    const lucroPres = PRESUNCAO.irpj * f * R;
    const adicional = R > 0 ? Math.max(0, PRESUNCAO.adicional * (lucroPres - PRESUNCAO.limiteMensalAdicional) / R) : 0;
    return { irpj, csll, adicional, total: irpj + csll + adicional, fatorPresuncao: f };
  }

  // ---- MEI (B3) ----
  function meiDas(tipo, atividade) {
    const inss = round2((tipo === 'caminhoneiro' ? MEI.inssCaminhoneiro : MEI.inss) * SALARIO_MINIMO_2026);
    const extra = { com: MEI.icms, serv: MEI.iss, ambos: MEI.icms + MEI.iss }[atividade];
    return round2(inss + (extra == null ? MEI.icms : extra));
  }
  // meses: meses de atividade no ano de abertura (1 a 12); 12 = ano cheio.
  function meiLimites(tipo, meses) {
    const m = meses >= 1 && meses <= 12 ? Math.floor(meses) : 12;
    const anual = tipo === 'caminhoneiro' ? MEI.caminhoneiroAnual : MEI.limiteAnual;
    const limite = round2(anual / 12 * m);
    return { meses: m, limite, tolerancia: round2(limite * (1 + MEI.tolerancia)) };
  }
  function meiFaixa(faturamento, lim) {
    if (faturamento <= lim.limite) return 'ok';
    return faturamento <= lim.tolerancia ? 'tolerancia' : 'excedido';
  }

  // ---- Venda / compra: Presumido, Real, Simples e MEI ----
  // regime: 'presumido' | 'real' | 'simples' | 'mei'. Todas as linhas saem arredondadas a centavos e o total é a soma delas.
  function calcSale(o) {
    const { mode, regime, value } = o;
    const i = o.icms || 0, p = o.pis || 0, sp = o.simples || 0;
    const ipi = regime === 'simples' || regime === 'mei' ? 0 : (o.ipi || 0);
    const c = o.com || 0, t = o.pag || 0, m = o.margem || 0;
    const fixo = round2(o.fixo || 0), frete = round2(o.frete || 0);
    const v = round2(value);
    const warnings = [];
    let show = { cbs: false };
    let fee = { irpj: 0, csll: 0, adicional: 0, total: 0 };
    let tau, mk;

    if (regime === 'mei') {
      const n = Math.floor(o.vendas || 0);
      if (!(n >= 1)) return { ok: false, error: 'Informe quantas vendas você faz por mês (1 ou mais).' };
      const du = round2((o.das || 0) / n);
      const lim = meiLimites(o.meiTipo, o.meiMeses);
      const meiInfo = P => { const fat = round2(P * n * lim.meses), f = meiFaixa(fat, lim); return f === 'ok' ? null : { faixa: f, fat, meses: lim.meses, limite: lim.limite, tolerancia: lim.tolerancia }; };
      if (mode === 'buy') {
        const gross = v, tax = Math.min(du, gross), net = round2(gross - tax);
        return { ok: true, mode, regime, P: gross, net, lines: { das: tax }, taxLines: [{ key: 'das', label: 'DAS MEI', v: tax }], tax, fees: [], feeTotal: 0, lucro: 0, du, n, warnings, meiStatus: meiInfo(gross), cbs: null };
      }
      const den = 1 - c - t - m;
      if (!(den > 0)) return { ok: false, error: 'A soma de comissão, taxa de pagamento e margem chegou a 100% ou mais. Reduza algum percentual.' };
      const P = round2((v + fixo + frete + du) / den);
      const fees = [['com', 'Comissão do marketplace', round2(P * c)], ['pag', 'Taxa de pagamento', round2(P * t)], ['fixo', 'Tarifa fixa por venda', fixo], ['frete', 'Frete', frete]].map(x => ({ key: x[0], label: x[1], v: x[2] })).filter(x => x.v > 0);
      const feeTotal = sum2(fees.map(x => x.v));
      const lucro = round2(P - v - du - feeTotal);
      return { ok: true, mode, regime, P, v, lucro, du, n, taxLines: [{ key: 'das', label: 'DAS MEI', v: du }], tax: du, fees, feeTotal, warnings, meiStatus: meiInfo(P), cbs: null };
    }

    // Fatores por unidade de valor do produto (b): ICMS por dentro (com IPI na base se consumidor final), PIS/Cofins sobre b − ICMS.
    let icmsF = 0, pisF = 0, taxF;
    if (regime === 'simples') {
      taxF = sp; // DAS sobre a receita; IPI já está no DAS (Anexo II)
      warnings.push('ICMS-ST e DIFAL ficam fora do DAS e não estão incluídos no preço.');
    } else {
      const inclIpi = o.dest === 'revenda' ? 0 : 1;
      icmsF = i * (1 + ipi * inclIpi);
      pisF = p * (1 - icmsF);
      if (regime === 'presumido') {
        fee = presumidoRates(o.fatMes, o.lc224);
        if (!(o.fatMes > 0)) warnings.push('IRPJ/CSLL do Presumido incluem só a presunção de 8% × 15% + 12% × 9% (comércio/indústria). O adicional de 10% do IRPJ (lucro presumido acima de R$ 20 mil/mês) e a LC 224/2025 dependem do faturamento: informe o faturamento mensal.');
        else if (o.lc224) warnings.push('LC 224/2025 (+10% na presunção sobre receita anual acima de R$ 5 milhões): aplicação pendente de validação com contador.');
        warnings.push('Serviços têm presunção maior (32%): esta calculadora usa a de comércio/indústria.');
      } else {
        warnings.push('Lucro Real: a margem é antes de IRPJ/CSLL (não incluídos). PIS/Cofins de 9,25% estão sem os créditos da não cumulatividade: o preço sai conservador (mais alto que o real).');
      }
      if (ipi > 0 && o.dest !== 'revenda') warnings.push('IPI na base do ICMS (consumidor final, CF art. 155 §2º XI): pendente de validação com contador.');
      taxF = ipi + icmsF + pisF + fee.total;
    }
    tau = taxF / (1 + ipi);
    show.cbs = regime === 'presumido' || regime === 'real';

    const build = P => {
      const b = P / (1 + ipi), lines = [];
      if (regime === 'simples') lines.push({ key: 'das', label: 'Simples Nacional (DAS)', rate: sp, v: round2(b * sp) });
      else {
        lines.push({ key: 'icms', label: 'ICMS (por dentro)', rate: i, v: round2(b * icmsF) }, { key: 'pis', label: 'PIS/Cofins', rate: p, v: round2(b * pisF) });
        if (regime === 'presumido') {
          lines.push({ key: 'irpj', label: 'IRPJ (presunção 8% × 15%)', v: round2(b * fee.irpj) });
          if (fee.adicional > 0) lines.push({ key: 'adicional', label: 'Adicional de IRPJ (10%)', v: round2(b * fee.adicional) });
          lines.push({ key: 'csll', label: 'CSLL (presunção 12% × 9%)', v: round2(b * fee.csll) });
        }
      }
      if (ipi) lines.push({ key: 'ipi', label: 'IPI', rate: ipi, v: round2(b * ipi) });
      const cbs = show.cbs ? round2((b - b * icmsF - b * pisF) * (CBS + IBS)) : null; // LC 214/2025 art. 12 §2º
      return { lines: lines.filter(x => x.v > 0 || x.key === 'icms' || x.key === 'pis' || x.key === 'das'), cbs };
    };

    if (mode === 'buy') {
      if (!(tau < 1)) return { ok: false, error: 'Revise as alíquotas: a soma não pode chegar a 100%.' };
      const P = v, r = build(P), tax = sum2(r.lines.map(x => x.v));
      return { ok: true, mode, regime, P, net: round2(P - tax), taxLines: r.lines, tax, fees: [], feeTotal: 0, warnings, cbs: r.cbs };
    }
    // Venda: P = (custo + fixo + frete) / (1 − impostos − comissão − pagamento − margem)
    const den = 1 - tau - c - t - m;
    if (!(den > 0)) return { ok: false, error: 'A soma de impostos, comissão, taxa de pagamento e margem chegou a 100% ou mais. Reduza algum percentual.' };
    const P = round2((v + fixo + frete) / den), r = build(P), tax = sum2(r.lines.map(x => x.v));
    const fees = [['com', 'Comissão do marketplace', round2(P * c)], ['pag', 'Taxa de pagamento', round2(P * t)], ['fixo', 'Tarifa fixa por venda', fixo], ['frete', 'Frete', frete]].map(x => ({ key: x[0], label: x[1], v: x[2] })).filter(x => x.v > 0);
    const feeTotal = sum2(fees.map(x => x.v));
    const lucro = round2(P - v - tax - feeTotal); // absorve o resíduo de arredondamento: a soma das linhas fecha no preço
    return { ok: true, mode, regime, P, v, lucro, taxLines: r.lines, tax, fees, feeTotal, warnings, cbs: r.cbs };
  }

  return {
    VERIFICADO_EM, SALARIO_MINIMO_2026, ICMS_IMPORT_20, AFRMM, IOF_CARTAO, CBS, IBS, II_REMESSA, PRESUNCAO, LC224, MEI, ANEXOS,
    round2, sum2, parseField, icmsImportacao, iiRemessaUsd, calcImport, simplesEfetiva, presumidoRates,
    meiDas, meiLimites, meiFaixa, calcSale
  };
});
