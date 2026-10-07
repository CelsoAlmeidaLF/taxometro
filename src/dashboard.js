// Conector que consome as regras dinâmicas (Simulando fetch ao backend/localStorage)
function fetchOraculoRules() {
  const saved = localStorage.getItem('SYSTEKNA_ORACULO_RATES');
  if (saved) {
    return JSON.parse(saved);
  }
  // Fallback para valores hardcoded se o Admin nunca tiver salvado
  return {
    iof: 0.035,
    meiLimit: 6750,
    updatedAt: new Date().toISOString()
  };
}

function formatCurrency(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarLaudo() {
  const faturamento = parseFloat(document.getElementById('faturamento').value);
  const meses = parseInt(document.getElementById('meses').value);
  
  if (!faturamento || !meses) return alert('Preencha os dados.');

  const oraculo = fetchOraculoRules();
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
    guidance.style.borderColor = 'var(--danger)';
    guidance.innerText = 'ATENÇÃO: Faturamento excedeu os 20% de tolerância. O desenquadramento retroagirá a 1º de janeiro. Você será tributado pelas regras normais do Simples Nacional sobre TODO o faturamento do ano. Contrate um contador imediatamente.';
  } else if (faturamento > limiteProporcional) {
    badge.className = 'status-badge status-warn';
    badge.innerText = 'ZONA DE TOLERÂNCIA';
    guidance.style.borderColor = 'var(--warn)';
    guidance.innerText = 'ALERTA: Faturamento dentro da tolerância de 20%. Você pagará um DAS complementar sobre o excedente e será desenquadrado do MEI a partir do próximo ano civil. Planeje a migração para o Simples Nacional.';
  } else {
    badge.className = 'status-badge status-ok';
    badge.innerText = 'MEI REGULAR';
    guidance.style.borderColor = 'var(--accent)';
    guidance.innerText = 'Em conformidade. O seu faturamento projetado respeita os limites da lei para MEI durante o período de atividade.';
  }

  laudoBox.style.display = 'block';
}
