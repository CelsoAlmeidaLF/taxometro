/**
 * Adapters para a camada de infraestrutura do Administrador.
 * Implementa a submissão via JSON Schema Spec: update_taxometro_rates
 */
class AdminAdapter {
    /**
     * @param {Object} payload Payload alinhado com o JSON Schema `update_taxometro_rates`
     */
    static async updateRates(payload) {
        // Validação Contract-First exigida pelo Victor
        const regex = /^[A-Z]{2}-[A-Z0-9_]{3,20}$/;
        if (!regex.test(payload.region_code)) {
            throw new Error("MCP_INVALID_PARAMS: Código de região fora do padrão aceito.");
        }
        if (payload.base_fare > 100 || payload.base_fare < 0.01) {
            throw new Error("MCP_INVALID_PARAMS: Bandeirada deve ser entre 0.01 e 100.");
        }
        if (payload.km_rate_flag_1 > payload.km_rate_flag_2) {
            throw new Error("MCP_INVALID_PARAMS: Bandeira 1 não pode ser maior que Bandeira 2.");
        }
        
        // PROTÓTIPO: não existe backend. Nada é enviado nem salvo (requisito: dados só no aparelho).
        // O retorno abaixo é simulado e a tela avisa isso ao usuário.

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: "success",
                    data: {
                        transaction_id: "tx_" + Math.random().toString(36).substring(7),
                        region_code: payload.region_code,
                        updated_at: new Date().toISOString(),
                        broadcast_status: "simulado"
                    }
                });
            }, 800);
        });
    }
}
window.AdminAdapter = AdminAdapter;
