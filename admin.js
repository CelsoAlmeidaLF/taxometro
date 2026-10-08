/**
 * Lógica do WebAdmin - Implementação João (Eng. Software)
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Aguarda o Vault estar pronto (herdado da estrutura padrão FINANC)
  if (window.vaultReady) {
      await window.vaultReady;
  }

  const form = document.getElementById('adminRatesForm');
  const statusEl = document.getElementById('adminStatus');

  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = "Processando contrato e validando schema...";
      statusEl.style.color = "var(--ink)";

      const payload = {
          region_code: document.getElementById('regionCode').value.toUpperCase(),
          base_fare: parseFloat(document.getElementById('baseFare').value),
          km_rate_flag_1: parseFloat(document.getElementById('flag1').value),
          km_rate_flag_2: parseFloat(document.getElementById('flag2').value),
          standing_hour_rate: parseFloat(document.getElementById('standingHour').value),
          effective_date: new Date(document.getElementById('effectiveDate').value).toISOString()
      };

      try {
          const response = await AdminAdapter.updateRates(payload);
          statusEl.textContent = `Tarifas válidas (região ${response.data.region_code}). Simulação: nada foi salvo, este WebAdmin é um protótipo sem servidor.`;
          statusEl.style.color = "var(--up)";
      } catch (err) {
          statusEl.textContent = err.message;
          statusEl.style.color = "var(--warn)";
      }
  });
});
