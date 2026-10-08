// Simulação do Vault e atualização de Storage Compartilhado para o Frontend ler
function salvarTaxas() {
  const token = document.getElementById('adminToken').value;
  const msg = document.getElementById('statusMsg');
  
  if(token !== 'admin123') {
    msg.style.color = 'var(--danger)';
    msg.innerText = '[ERRO] Falha de autenticação. Token inválido.';
    return;
  }

  // Num cenário real, isso faria POST para o backend/MCP
  const taxas = {
    iof: parseFloat(document.getElementById('iofCartao').value) / 100,
    cbs: parseFloat(document.getElementById('cbsRate').value) / 100,
    meiLimit: parseFloat(document.getElementById('meiLimit').value),
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('SYSTEKNA_ORACULO_RATES', JSON.stringify(taxas));
  
  msg.style.color = 'var(--accent)';
  msg.innerText = '[OK] Taxas atualizadas. Todos os clientes receberão a nova versão imediatamente.';
}

// Carregar dados salvos
window.onload = () => {
  const saved = localStorage.getItem('SYSTEKNA_ORACULO_RATES');
  if (saved) {
    const t = JSON.parse(saved);
    document.getElementById('iofCartao').value = (t.iof * 100).toFixed(2);
    document.getElementById('cbsRate').value = (t.cbs * 100).toFixed(2);
    document.getElementById('meiLimit').value = t.meiLimit.toFixed(2);
  }
};
