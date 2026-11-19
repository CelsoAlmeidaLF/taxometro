// Conector que consome as regras dinâmicas guardadas no aparelho. A leitura e a validação são do motor (TaxEngine).
const AVISO_REGRAS = 'Não conseguimos ler as regras salvas neste aparelho. Usamos os valores padrão da lei (limite MEI de R$ 6.750 por mês e IOF de 3,5%).';
const AVISO_CAMPOS = 'Preencha o faturamento e os meses de atividade.';

function fetchOraculoRules() {
  let raw = null;
  try { raw = localStorage.getItem('SYSTEKNA_ORACULO_RATES'); }
  catch (_) { console.error('Taxômetro: não foi possível ler as regras guardadas.'); return { regras: TaxEngine.lerRegrasOraculo(null, new Date().toISOString()).regras, aviso: true }; }
  const lido = TaxEngine.lerRegrasOraculo(raw, new Date().toISOString());
  if (lido.aviso) console.error('Taxômetro: regras guardadas ilegíveis, usando o padrão.');
  return lido;
}

function mostrarAviso(id, texto) {
  const el = document.getElementById(id);
  el.textContent = texto || '';
  el.classList.toggle('is-visible', !!texto);
}

function formatCurrency(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarLaudo() {
  const faturamento = parseFloat(document.getElementById('faturamento').value);
  const meses = parseInt(document.getElementById('meses').value);
  
  if (!faturamento || !meses) { mostrarAviso('avisoCampos', AVISO_CAMPOS); return; }
  mostrarAviso('avisoCampos', '');

  const lido = fetchOraculoRules();
  mostrarAviso('avisoRegras', lido.aviso ? AVISO_REGRAS : '');
  const oraculo = lido.regras;
  const limiteProporcional = oraculo.meiLimit * meses;
  const tetoTolerancia = limiteProporcional * 1.2;

  document.getElementById('limiteAplicado').innerText = formatCurrency(limiteProporcional);
  document.getElementById('limiteTolerancia').innerText = formatCurrency(tetoTolerancia);
  document.getElementById('iofVigente').innerText = (oraculo.iof * 100).toFixed(2) + '%';
  
  const date = new Date(oraculo.updatedAt);
  document.getElementById('dataAtualizacao').innerText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

  const badge = document.getElementById('statusBadge');
  const guidance = document.getElementById('textoLaudo');
  const laudoBox = document.getElementById('laudoBox');

  if (faturamento > tetoTolerancia) {
    badge.className = 'status-badge status-danger';
    badge.innerText = 'DESENQUADRAMENTO IMEDIATO';
    guidance.className = 'guidance guidance-danger';
    guidance.innerText = 'ATENÇÃO: Faturamento excedeu os 20% de tolerância. O desenquadramento retroagirá a 1º de janeiro. Você será tributado pelas regras normais do Simples Nacional sobre TODO o faturamento do ano. Contrate um contador imediatamente.';
  } else if (faturamento > limiteProporcional) {
    badge.className = 'status-badge status-warn';
    badge.innerText = 'ZONA DE TOLERÂNCIA';
    guidance.className = 'guidance guidance-warn';
    guidance.innerText = 'ALERTA: Faturamento dentro da tolerância de 20%. Você pagará um DAS complementar sobre o excedente e será desenquadrado do MEI a partir do próximo ano civil. Planeje a migração para o Simples Nacional.';
  } else {
    badge.className = 'status-badge status-ok';
    badge.innerText = 'MEI REGULAR';
    guidance.className = 'guidance guidance-ok';
    guidance.innerText = 'Em conformidade. O seu faturamento projetado respeita os limites da lei para MEI durante o período de atividade.';
  }

  laudoBox.classList.add('is-visible');
}

// Ao abrir a tela, já avisa se as regras guardadas não puderam ser lidas.
mostrarAviso('avisoRegras', fetchOraculoRules().aviso ? AVISO_REGRAS : '');
