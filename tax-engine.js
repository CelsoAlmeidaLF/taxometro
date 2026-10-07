/**
 * tax-engine.js - Motor de cálculo do Taxômetro
 * Refatorado para Arquitetura Hexagonal, Orientação a Objetos e Criptografia.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TaxEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ==========================================
  // INFRASTRUCTURE LAYER
  // ==========================================
  
  class CryptoAdapter {
    /**
     * Cifra dados sensíveis (ex: faturamentos anuais, margens privadas)
     */
    static async encryptData(plainText, key) {
      const cryptoObj = typeof crypto !== 'undefined' ? crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
      if (!cryptoObj || !cryptoObj.subtle) throw new Error('Web Cryptography API não suportada');
      const iv = cryptoObj.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plainText);
      const ciphertext = await cryptoObj.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoded
      );
      return {
        iv: Array.from(iv),
        cipher: Array.from(new Uint8Array(ciphertext))
      };
    }

    static async decryptData(encryptedObj, key) {
      const cryptoObj = typeof crypto !== 'undefined' ? crypto : (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
      if (!cryptoObj || !cryptoObj.subtle) throw new Error('Web Cryptography API não suportada');
      const iv = new Uint8Array(encryptedObj.iv);
      const cipher = new Uint8Array(encryptedObj.cipher);
      const decrypted = await cryptoObj.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        cipher
      );
      return new TextDecoder().decode(decrypted);
    }
  }

  // ==========================================
  // DOMAIN LAYER (Entities & Value Objects)
  // ==========================================
  
  class TaxConstants {
    constructor() {
      this._salarioMinimo2026 = 1621;
      this._icmsImport20 = ['AC', 'AL', 'BA', 'CE', 'MG', 'PB', 'PI', 'RN', 'RR', 'SE'];
      this._afrmm = 0.08;
      this._iofCartao = 0.035;
      this._cbs = 0.009;
      this._ibs = 0.001;
      this._iiRemessa = { isentoAteUsd: 50, teto: 3000, aliquota: 0.6, descontoUsd: 30 };
      this._presuncao = { irpj: 0.08, csll: 0.12, aliqIrpj: 0.15, aliqCsll: 0.09, adicional: 0.10, limiteMensalAdicional: 20000 };
      this._lc224 = { acrescimo: 0.10, limiteAnual: 5000000 };
      this._mei = { limiteMensal: 6750, limiteAnual: 81000, tolerancia: 0.20, caminhoneiroAnual: 251600, inss: 0.05, inssCaminhoneiro: 0.12, icms: 1, iss: 5 };
      this._anexos = {
        I: [[180000, 0.04, 0], [360000, 0.073, 5940], [720000, 0.095, 13860], [1800000, 0.107, 22500], [3600000, 0.143, 87300], [4800000, 0.19, 378000]],
        II: [[180000, 0.045, 0], [360000, 0.078, 5940], [720000, 0.10, 13860], [1800000, 0.112, 22500], [3600000, 0.147, 85500], [4800000, 0.30, 720000]]
      };
    }

    get salarioMinimo() { return this._salarioMinimo2026; }
    get icmsImport20() { return this._icmsImport20; }
    get mei() { return this._mei; }
    get presuncao() { return this._presuncao; }
    get anexos() { return this._anexos; }
    get lc224() { return this._lc224; }
    get cbs() { return this._cbs; }
    get ibs() { return this._ibs; }
    get iiRemessa() { return this._iiRemessa; }
  }

  class MathHelper {
    static round2(x) {
      const s = x < 0 ? -1 : 1;
      return s * Math.round(Math.abs(x) * 100 + 1e-7) / 100 + 0;
    }
    static sum2(arr) {
      return this.round2(arr.reduce((a, x) => a + x, 0));
    }
  }

  class SaleOperation {
    constructor(data) {
      this._mode = data.mode;
      this._regime = data.regime;
      this._value = MathHelper.round2(data.value || 0);
      this._icms = data.icms || 0;
      this._pis = data.pis || 0;
      this._simples = data.simples || 0;
      this._ipi = (data.regime === 'simples' || data.regime === 'mei') ? 0 : (data.ipi || 0);
      this._comissao = data.com || 0;
      this._taxaPagamento = data.pag || 0;
      this._margem = data.margem || 0;
      this._fixo = MathHelper.round2(data.fixo || 0);
      this._frete = MathHelper.round2(data.frete || 0);
      this._dest = data.dest || '';
      
      this._meiTipo = data.meiTipo;
      this._meiMeses = data.meiMeses;
      this._vendasPorMes = data.vendas || 0;
      this._dasMei = data.das || 0;
      
      this._fatMes = data.fatMes || 0;
      this._lc224Apply = data.lc224 || false;
    }

    get value() { return this._value; }
    get regime() { return this._regime; }
    get mode() { return this._mode; }
  }

  class ImportOperation {
    constructor(data) {
      this._mode = data.mode;
      this._value = data.value || 0;
      this._cot = data.cot || 0;
      this._icms = data.icms || 0;
      this._iof = data.iof || 0;
      this._iiOverride = data.iiOverride;
      this._freteUsd = data.freteUsd || 0;
    }

    isValid() {
      if (!(this._cot > 0)) return { ok: false, error: 'Informe a cotação do dólar (R$ por US$ 1).' };
      if (!(this._icms < 1)) return { ok: false, error: 'Revise o ICMS: precisa ser menor que 100%.' };
      return { ok: true };
    }
  }

  // ==========================================
  // APPLICATION LAYER (Use Cases)
  // ==========================================

  class TaxCalculatorService {
    constructor() {
      this._constants = new TaxConstants();
    }

    calculateImport(operationObj) {
      const op = new ImportOperation(operationObj);
      const val = op.isValid();
      if (!val.ok) return val;

      const k = 1 / (1 - op._icms);
      let base; 
      
      if (op._mode === 'sell') {
        base = (op._value + op._freteUsd) * op._cot;
      } else {
        if (op._iiOverride != null) {
          base = op._value / ((1 + op._iiOverride) * k + op._iof);
        } else {
          base = op._value / (k + op._iof);
          if (base / op._cot > this._constants.iiRemessa.isentoAteUsd) {
            base = (op._value + this._constants.iiRemessa.descontoUsd * op._cot * k) / ((1 + this._constants.iiRemessa.aliquota) * k + op._iof);
            if (base / op._cot > this._constants.iiRemessa.teto) {
              return { ok: false, error: 'Acima de US$ 3.000 não é Remessa Conforme. Informe a alíquota do II da NCM no campo manual.' };
            }
          }
        }
      }

      const baseUsd = base / op._cot;
      let ii;

      if (op._iiOverride != null) {
        ii = base * op._iiOverride;
      } else {
        const usd = this._getIIRemessaUsd(baseUsd);
        if (usd == null) return { ok: false, error: 'Acima de US$ 3.000 não é Remessa Conforme. Informe a alíquota do II da NCM no campo manual.' };
        ii = usd * op._cot;
      }

      const gross = (base + ii) * k;
      const lines = {
        produto: MathHelper.round2(op._mode === 'sell' ? op._value * op._cot : base),
        frete: MathHelper.round2(op._mode === 'sell' ? op._freteUsd * op._cot : 0),
        ii: MathHelper.round2(ii),
        icms: MathHelper.round2(gross - base - ii),
        iof: MathHelper.round2(base * op._iof)
      };

      const tax = MathHelper.sum2([lines.ii, lines.icms, lines.iof]);
      const total = MathHelper.sum2([lines.produto, lines.frete, tax]);
      const warnings = [];

      if (op._iiOverride == null && baseUsd > this._constants.iiRemessa.isentoAteUsd) {
        warnings.push('II de 60% com desconto de US$ 30 (Remessa Conforme, pessoa física). Para NCM/regime diferente, use o campo manual.');
      }

      return { ok: true, lines, tax, total, baseUsd, warnings };
    }

    calculateSale(operationObj) {
      const op = new SaleOperation(operationObj);
      const warnings = [];
      let show = { cbs: false };
      let fee = { irpj: 0, csll: 0, adicional: 0, total: 0 };
      let tau, mk;

      if (op.regime === 'mei') {
        const n = Math.floor(op._vendasPorMes);
        if (!(n >= 1)) return { ok: false, error: 'Informe quantas vendas você faz por mês (1 ou mais).' };
        const du = MathHelper.round2((op._dasMei) / n);
        const lim = this._getMeiLimites(op._meiTipo, op._meiMeses);
        
        const meiInfo = (P) => {
          const fat = MathHelper.round2(P * n * lim.meses);
          const f = this._getMeiFaixa(fat, lim);
          return f === 'ok' ? null : { faixa: f, fat, meses: lim.meses, limite: lim.limite, tolerancia: lim.tolerancia };
        };

        if (op.mode === 'buy') {
          const gross = op.value;
          const tax = Math.min(du, gross);
          const net = MathHelper.round2(gross - tax);
          return { ok: true, mode: op.mode, regime: op.regime, P: gross, net, lines: { das: tax }, taxLines: [{ key: 'das', label: 'DAS MEI', v: tax }], tax, fees: [], feeTotal: 0, lucro: 0, du, n, warnings, meiStatus: meiInfo(gross), cbs: null };
        }

        const den = 1 - op._comissao - op._taxaPagamento - op._margem;
        if (!(den > 0)) return { ok: false, error: 'A soma de comissão, taxa de pagamento e margem chegou a 100% ou mais. Reduza algum percentual.' };
        
        const P = MathHelper.round2((op.value + op._fixo + op._frete + du) / den);
        const fees = [
          { key: 'com', label: 'Comissão do marketplace', v: MathHelper.round2(P * op._comissao) },
          { key: 'pag', label: 'Taxa de pagamento', v: MathHelper.round2(P * op._taxaPagamento) },
          { key: 'fixo', label: 'Tarifa fixa por venda', v: op._fixo },
          { key: 'frete', label: 'Frete', v: op._frete }
        ].filter(x => x.v > 0);
        
        const feeTotal = MathHelper.sum2(fees.map(x => x.v));
        const lucro = MathHelper.round2(P - op.value - du - feeTotal);
        
        return { ok: true, mode: op.mode, regime: op.regime, P, v: op.value, lucro, du, n, taxLines: [{ key: 'das', label: 'DAS MEI', v: du }], tax: du, fees, feeTotal, warnings, meiStatus: meiInfo(P), cbs: null };
      }

      let icmsF = 0, pisF = 0, taxF;
      
      if (op.regime === 'simples') {
        taxF = op._simples;
        warnings.push('ICMS-ST e DIFAL ficam fora do DAS e não estão incluídos no preço.');
      } else {
        const inclIpi = op._dest === 'revenda' ? 0 : 1;
        icmsF = op._icms * (1 + op._ipi * inclIpi);
        pisF = op._pis * (1 - icmsF);
        
        if (op.regime === 'presumido') {
          fee = this._getPresumidoRates(op._fatMes, op._lc224Apply);
          if (!(op._fatMes > 0)) warnings.push('IRPJ/CSLL do Presumido incluem só a presunção de 8% × 15% + 12% × 9% (comércio/indústria). O adicional de 10% do IRPJ (lucro presumido acima de R$ 20 mil/mês) e a LC 224/2025 dependem do faturamento: informe o faturamento mensal.');
          else if (op._lc224Apply) warnings.push('LC 224/2025 (+10% na presunção sobre receita anual acima de R$ 5 milhões): aplicação pendente de validação com contador.');
          warnings.push('Serviços têm presunção maior (32%): esta calculadora usa a de comércio/indústria.');
        } else {
          warnings.push('Lucro Real: a margem é antes de IRPJ/CSLL (não incluídos). PIS/Cofins de 9,25% estão sem os créditos da não cumulatividade: o preço sai conservador (mais alto que o real).');
        }
        
        if (op._ipi > 0 && op._dest !== 'revenda') warnings.push('IPI na base do ICMS (consumidor final, CF art. 155 §2º XI): pendente de validação com contador.');
        taxF = op._ipi + icmsF + pisF + fee.total;
      }
      
      tau = taxF / (1 + op._ipi);
      show.cbs = (op.regime === 'presumido' || op.regime === 'real');

      const build = (P) => {
        const b = P / (1 + op._ipi);
        const lines = [];
        
        if (op.regime === 'simples') {
          lines.push({ key: 'das', label: 'Simples Nacional (DAS)', rate: op._simples, v: MathHelper.round2(b * op._simples) });
        } else {
          lines.push({ key: 'icms', label: 'ICMS (por dentro)', rate: op._icms, v: MathHelper.round2(b * icmsF) }, { key: 'pis', label: 'PIS/Cofins', rate: op._pis, v: MathHelper.round2(b * pisF) });
          if (op.regime === 'presumido') {
            lines.push({ key: 'irpj', label: 'IRPJ (presunção 8% × 15%)', v: MathHelper.round2(b * fee.irpj) });
            if (fee.adicional > 0) lines.push({ key: 'adicional', label: 'Adicional de IRPJ (10%)', v: MathHelper.round2(b * fee.adicional) });
            lines.push({ key: 'csll', label: 'CSLL (presunção 12% × 9%)', v: MathHelper.round2(b * fee.csll) });
          }
        }
        if (op._ipi) lines.push({ key: 'ipi', label: 'IPI', rate: op._ipi, v: MathHelper.round2(b * op._ipi) });
        
        const cbs = show.cbs ? MathHelper.round2((b - b * icmsF - b * pisF) * (this._constants.cbs + this._constants.ibs)) : null;
        return { lines: lines.filter(x => x.v > 0 || x.key === 'icms' || x.key === 'pis' || x.key === 'das'), cbs };
      };

      if (op.mode === 'buy') {
        if (!(tau < 1)) return { ok: false, error: 'Revise as alíquotas: a soma não pode chegar a 100%.' };
        const P = op.value;
        const r = build(P);
        const tax = MathHelper.sum2(r.lines.map(x => x.v));
        return { ok: true, mode: op.mode, regime: op.regime, P, net: MathHelper.round2(P - tax), taxLines: r.lines, tax, fees: [], feeTotal: 0, warnings, cbs: r.cbs };
      }

      const den = 1 - tau - op._comissao - op._taxaPagamento - op._margem;
      if (!(den > 0)) return { ok: false, error: 'A soma de impostos, comissão, taxa de pagamento e margem chegou a 100% ou mais. Reduza algum percentual.' };
      
      const P = MathHelper.round2((op.value + op._fixo + op._frete) / den);
      const r = build(P);
      const tax = MathHelper.sum2(r.lines.map(x => x.v));
      
      const fees = [
        { key: 'com', label: 'Comissão do marketplace', v: MathHelper.round2(P * op._comissao) },
        { key: 'pag', label: 'Taxa de pagamento', v: MathHelper.round2(P * op._taxaPagamento) },
        { key: 'fixo', label: 'Tarifa fixa por venda', v: op._fixo },
        { key: 'frete', label: 'Frete', v: op._frete }
      ].filter(x => x.v > 0);
      
      const feeTotal = MathHelper.sum2(fees.map(x => x.v));
      const lucro = MathHelper.round2(P - op.value - tax - feeTotal);
      
      return { ok: true, mode: op.mode, regime: op.regime, P, v: op.value, lucro, taxLines: r.lines, tax, fees, feeTotal, warnings, cbs: r.cbs };
    }

    _getIIRemessaUsd(usd) {
      if (usd <= this._constants.iiRemessa.isentoAteUsd) return 0;
      if (usd <= this._constants.iiRemessa.teto) return Math.max(0, usd * this._constants.iiRemessa.aliquota - this._constants.iiRemessa.descontoUsd);
      return null;
    }

    _getMeiLimites(tipo, meses) {
      const m = meses >= 1 && meses <= 12 ? Math.floor(meses) : 12;
      const anual = tipo === 'caminhoneiro' ? this._constants.mei.caminhoneiroAnual : this._constants.mei.limiteAnual;
      const limite = MathHelper.round2(anual / 12 * m);
      return { meses: m, limite, tolerancia: MathHelper.round2(limite * (1 + this._constants.mei.tolerancia)) };
    }

    _getMeiFaixa(faturamento, lim) {
      if (faturamento <= lim.limite) return 'ok';
      return faturamento <= lim.tolerancia ? 'tolerancia' : 'excedido';
    }

    _getPresumidoRates(fatMes, lc224) {
      const R = fatMes > 0 ? fatMes : 0;
      const anual = R * 12;
      const share = lc224 && anual > this._constants.lc224.limiteAnual ? (anual - this._constants.lc224.limiteAnual) / anual : 0;
      const f = 1 + this._constants.lc224.acrescimo * share;
      const p = this._constants.presuncao;
      const irpj = p.irpj * f * p.aliqIrpj;
      const csll = p.csll * f * p.aliqCsll;
      const lucroPres = p.irpj * f * R;
      const adicional = R > 0 ? Math.max(0, p.adicional * (lucroPres - p.limiteMensalAdicional) / R) : 0;
      return { irpj, csll, adicional, total: irpj + csll + adicional, fatorPresuncao: f };
    }

    getSimplesEfetiva(anexo, rbt12) {
      const tab = this._constants.anexos[anexo];
      if (!tab) return { error: 'Anexo inválido.' };
      if (!(rbt12 > 0)) return { error: 'Informe a receita bruta dos últimos 12 meses (RBT12).' };
      if (rbt12 > 4800000) return { error: 'RBT12 acima de R$ 4,8 milhões: fora do Simples Nacional.' };
      const f = tab.find(x => rbt12 <= x[0]);
      const aliq = (rbt12 * f[1] - f[2]) / rbt12;
      return { aliquota: aliq, nominal: f[1], deducao: f[2], faixa: tab.indexOf(f) + 1, icmsIssFora: rbt12 > 3600000 };
    }

    getMeiDas(tipo, atividade) {
      const inss = MathHelper.round2((tipo === 'caminhoneiro' ? this._constants.mei.inssCaminhoneiro : this._constants.mei.inss) * this._constants.salarioMinimo);
      const extra = { com: this._constants.mei.icms, serv: this._constants.mei.iss, ambos: this._constants.mei.icms + this._constants.mei.iss }[atividade];
      return MathHelper.round2(inss + (extra == null ? this._constants.mei.icms : extra));
    }
  }

  // ==========================================
  // ADAPTER EXPORT (Mantendo assinatura legada)
  // ==========================================
  
  const service = new TaxCalculatorService();
  const constants = new TaxConstants();

  return {
    VERIFICADO_EM: '30/09/2026',
    SALARIO_MINIMO_2026: constants.salarioMinimo,
    ICMS_IMPORT_20: constants.icmsImport20,
    AFRMM: constants._afrmm,
    IOF_CARTAO: constants._iofCartao,
    CBS: constants.cbs,
    IBS: constants.ibs,
    II_REMESSA: constants.iiRemessa,
    PRESUNCAO: constants.presuncao,
    LC224: constants.lc224,
    MEI: constants.mei,
    ANEXOS: constants.anexos,
    
    round2: MathHelper.round2.bind(MathHelper),
    sum2: MathHelper.sum2.bind(MathHelper),
    
    // ParseField movido para helper funcional compatível 
    parseField: function(raw, o) {
      o = o || {};
      const label = o.label || 'Campo', min = o.min == null ? 0 : o.min, max = o.max == null ? Infinity : o.max;
      const s = raw == null ? '' : String(raw).trim().replace(',', '.');
      if (s === '') return o.allowEmpty === false ? { error: `Informe ${label}.` } : { value: o.def == null ? 0 : o.def };
      const v = Number(s);
      if (!isFinite(v)) return { error: `${label}: valor inválido.` };
      if (v < min) return { error: `${label}: não pode ser menor que ${min}.` };
      if (v > max) return { error: `${label}: não pode ser maior que ${max}.` };
      return { value: v };
    },

    icmsImportacao: uf => (constants.icmsImport20.includes(String(uf).toUpperCase()) ? 0.20 : 0.17),
    iiRemessaUsd: usd => service._getIIRemessaUsd(usd),
    calcImport: o => service.calculateImport(o),
    simplesEfetiva: (anexo, rbt12) => service.getSimplesEfetiva(anexo, rbt12),
    presumidoRates: (fatMes, lc224) => service._getPresumidoRates(fatMes, lc224),
    meiDas: (tipo, atividade) => service.getMeiDas(tipo, atividade),
    meiLimites: (tipo, meses) => service._getMeiLimites(tipo, meses),
    meiFaixa: (fat, lim) => service._getMeiFaixa(fat, lim),
    calcSale: o => service.calculateSale(o),
    
    // Exportando classes e adaptadores puros da nova Arquitetura
    CryptoAdapter,
    TaxCalculatorService,
    SaleOperation,
    ImportOperation,
    TaxConstants
  };
});
