# Auditoria financeira de 30/09/2026: correções

Branch `fix/auditoria-financeira` (versão 1.9.0). As fórmulas foram extraídas para `src/tax-engine.js`; os testes ficam em `test/tax-engine.test.js` (`npm test`, 27 testes). Rótulos de status: **corrigido**, **parcial** ou **pendente de validação** (com contador, e o motivo).

Fontes consultadas em 30/09/2026 na pesquisa desta correção: Sefaz-PR (IPVA 2026), Decreto 12.565/2025 (Reintegra), Convênio ICMS 81/2023 e 135/2024 (CONFAZ), notícias sobre a Lei AL 9.776/2025, Decreto 12.499/2025 (IOF/VGBL) e Portal do Empreendedor (MEI caminhoneiro). Onde só havia a fonte da auditoria, está indicado.

## Críticos e altos

### C1: ICMS da importação
- **Problema:** `{SP:17}[uf] ?? icmsUf[uf]` usava a alíquota modal de cada UF; R$ 100 no RJ dava R$ 128,21.
- **Correção:** tabela própria do Remessa Conforme: 20% em AC, AL, BA, CE, MG, PB, PI, RN, RR e SE; 17% nas demais. R$ 100, II 0%, RJ = R$ 120,48.
- **Arquivos:** `src/tax-engine.js` (`ICMS_IMPORT_20`, `icmsImportacao`), `src/app.js` (`setIcms`, catálogo "ICMS-Importação").
- **Teste:** "C1: ICMS do Remessa Conforme tem tabela própria".
- **Fonte:** Convênio ICMS 81/2023 (a auditoria citou 81/2024; o texto vigente é o 81/2023, alterado pelo 135/2024) e tabela Comsefaz.
- **Status:** corrigido. Observação: a lista das 10 UFs veio da auditoria/Comsefaz; MG, PB, PI, RN, RR e SE foram confirmadas em pesquisa, AC, AL, BA e CE só pela auditoria.

### A1: Lucro Presumido sem IRPJ/CSLL
- **Problema:** o preço só tinha ICMS e PIS/Cofins (R$ 42 em SP = R$ 53,16).
- **Correção:** IRPJ 8% × 15% e CSLL 12% × 9% (2,28% da receita); campo opcional de faturamento mensal para o adicional de 10% do IRPJ acima de R$ 20 mil de lucro presumido por mês; opção LC 224/2025 (+10% na presunção sobre a parte da receita anual acima de R$ 5 mi). R$ 42 em SP = R$ 54,74. Lucro Real: aviso de que a margem é antes de IRPJ/CSLL.
- **Arquivos:** `src/tax-engine.js` (`presumidoRates`, `calcSale`), `src/app.js` (`run`), campos `cFat` e `cLc224` no `index.html`.
- **Testes:** os quatro testes "A1".
- **Fonte:** Lei 9.249/1995 (presunção e alíquotas), Lei 9.430/1996 (adicional), LC 224/2025.
- **Status:** corrigido (presunção e adicional). **Pendente de validação com contador:** a LC 224/2025 (aplicação proporcional apenas ao excedente de R$ 5 mi e efeitos a partir de abril/2026 não foram confirmados em fonte oficial). O adicional considera o faturamento mensal médio informado; o real é apurado por trimestre. Presunção de serviços (32%) não implementada: aviso na tela.

### A2: ICMS de Alagoas
- **Problema:** 20% no catálogo.
- **Correção:** 21,5% (20,5% + 1% de FCP desde 01/04/2026), com nota na descrição. Reflete também na calculadora, que lê a tabela.
- **Arquivo:** `src/app.js` (`states`).
- **Teste:** "A2".
- **Fonte:** Lei AL 9.776/2025 (confirmada em notícias de consultorias; texto da lei não consultado).
- **Status:** corrigido.

### A3: AFRMM
- **Problema:** 25%/10%/40%.
- **Correção:** 8% nas três linhas do catálogo.
- **Arquivo:** `src/app.js` (linhas "AFRMM").
- **Teste:** "A3".
- **Fonte:** Lei 14.301/2022; art. 6º da Lei 10.893/2004 (dado da auditoria, sem nova checagem).
- **Status:** corrigido.

## Médios

### M1: base do CBS/IBS
- **Correção:** base = valor do produto − ICMS − PIS/Cofins (sem IPI). `src/tax-engine.js` (`calcSale`). Teste "M1". Fonte: LC 214/2025, art. 12 §2º (dado da auditoria).
- **Status:** corrigido.

### M2: CBS/IBS no Simples/MEI
- **Correção:** a linha só aparece em Presumido e Real; texto trocado por "dispensa de recolhimento para quem cumpre as obrigações acessórias" (LC 214/2025, art. 348 §1º), também no catálogo. Simples/MEI a partir de 01/01/2027.
- **Arquivos:** `src/tax-engine.js`, `src/app.js` (`cbsRow`, catálogo). Teste "M2". **Status:** corrigido.

### M3: Importação
- **Correção:** valor em US$ e cotação digitada (sem API), II automático (0% até US$ 50; 60% − US$ 30 até US$ 3.000), frete e seguro na base, IOF de 3,5% do cartão internacional somado ao total, campo manual de II (para outro regime ou acima de US$ 3.000). O modo "compra" inverte o cálculo por trecho.
- **Arquivos:** `src/tax-engine.js` (`iiRemessaUsd`, `calcImport`), `src/app.js`, `index.html`. Testes "M3" (4).
- **Fonte:** MP 1.357/2026 → Lei 15.502/2026, Portaria MF 1.342/2026, Decreto 12.499/2025 (dados da auditoria).
- **Status:** corrigido. Premissas: o limite de US$ 50 usa o valor aduaneiro com frete e seguro; o IOF incide sobre a compra (produto + frete), não sobre II e ICMS pagos na entrega. Ambas não foram confirmadas em texto oficial.

### M4: IPI na base do ICMS
- **Correção:** seletor de destinatário; "consumidor final" (padrão) inclui o IPI na base do ICMS; "revenda/industrialização" mantém o comportamento anterior.
- **Arquivos:** `src/tax-engine.js`, `index.html` (`cDest`). Teste "M4". Fonte: CF art. 155 §2º XI.
- **Status:** **pendente de validação com contador** (a regra depende do produto e da operação; aviso na tela quando há IPI).

### M5: Simples com IPI
- **Correção:** IPI escondido e zerado no Simples/MEI; alíquota efetiva pela fórmula da LC 123 (Anexos I e II; RBT12 até R$ 4,8 mi); aviso de que ICMS-ST e DIFAL ficam fora do DAS e, acima de R$ 3,6 mi, ICMS/ISS também.
- **Arquivos:** `src/tax-engine.js` (`simplesEfetiva`, `ANEXOS`), `index.html`. Testes "M5" (2). Fonte: LC 123/2006, Anexos I e II.
- **Status:** corrigido. As tabelas foram digitadas de memória e conferidas contra a LC 123 na estrutura; recomenda-se conferência final com a tabela oficial do Portal do Simples. Anexos III a V (serviços) fora do escopo.

### M6: catálogo do IRPF
- **Correção:** linhas novas para o redutor (isenção até R$ 5.000/mês, redução parcial até ~R$ 7.350), IRRF de 10% sobre dividendos acima de R$ 50 mil/mês por fonte e IRPF mínimo para alta renda (a partir de R$ 600 mil/ano).
- **Arquivo:** `src/app.js`. Teste "M6". Fonte: Lei 15.270/2025.
- **Status:** corrigido no catálogo. As fórmulas exatas do redutor e da alíquota do imposto mínimo não foram incluídas (texto descritivo); não há cálculo de IRPF na calculadora.

### M7: IPVA do Paraná
- **Correção:** 3,5% → 1,9%. `src/app.js`. Teste "M7". Fonte: Sefaz-PR, IPVA 2026 (fazenda.pr.gov.br). **Status:** corrigido.

## Baixos

### B1: arredondamento
- **Correção:** cada linha a centavos; total = soma exibida; a linha de lucro absorve o resíduo (pode diferir R$ 0,01 da margem exata). Sem "-R$ 0,00". `src/tax-engine.js` (`round2`, `sum2`, `calcSale`, `calcImport`). Teste "B1". **Status:** corrigido.

### B2: entradas inválidas
- **Correção:** `parseField` valida vazio (custo, valor obrigatórios), texto inválido, negativo e acima do `max`; a tela mostra a mensagem e marca `aria-invalid`. `src/tax-engine.js`, `src/app.js` (`read`). Teste "B2".
- **Status:** corrigido. Texto não numérico em `input type=number` é detectado por `validity.badInput` (só verificável em navegador real; não coberto por teste automatizado).

### B3: MEI
- **Correção:** limite proporcional (R$ 6.750 × meses do ano de abertura), tolerância de 20% (R$ 97.200 no ano cheio), MEI caminhoneiro (INSS 12% = R$ 194,52; DAS R$ 195,52 / 199,52 / 200,52; limite R$ 251.600). `src/tax-engine.js` (`meiDas`, `meiLimites`, `meiFaixa`), campos `cMeiTipo` e `cMeiMeses`. Testes "B3" (2). Fonte: LC 123/2006 art. 18-A; Portal do Empreendedor.
- **Status:** corrigido. A tolerância mostra só o aviso (o DAS complementar do excedente não é calculado).

### B4: Lucro Real sem créditos
- **Correção:** aviso de que PIS/Cofins de 9,25% está sem créditos (preço conservador). Não há campo de créditos. Teste "A1: Lucro Real". **Status:** corrigido (por aviso).

### B5: IOF VGBL
- **Correção:** catálogo "IOF — seguros" com 5% sobre aportes em VGBL acima de R$ 600 mil por ano; IOF de câmbio com cartão 3,5%. Teste "B5". Fonte: Decreto 12.499/2025 (validado pelo STF em jul/2026, segundo a pesquisa). **Status:** corrigido.

### B6: aviso na calculadora
- **Correção:** "Estimativa com alíquotas verificadas em 30/09/2026; não substitui contador" na nota e no fim de cada resultado; data do catálogo atualizada. `index.html`, `src/app.js`. Teste "B6". **Status:** corrigido.

### B7: ITCMD e Reintegra
- **Reintegra/Acredita:** confirmado, 3% para MEI/ME/EPP de 01/08/2025 a 31/12/2026 (Decreto 12.565/2025, LC 216/2025); fonte do catálogo trocada para o decreto; nota de extinção com a CBS em 2027 (segundo a pesquisa). **Status:** corrigido.
- **ITCMD:** a pesquisa só achou fontes secundárias (blogs e consultorias) e elas divergem da tabela do app (por exemplo, AC e BA). A EC 132/2023 exige progressividade e a LC 227/2026 regulamentou normas gerais; SP, MG, ES e PR ainda tinham alíquota fixa. **Status:** **não verificado**. Nenhum valor foi alterado; cada linha de ITCMD do catálogo agora traz "NÃO VERIFICADO com a lei estadual". Ação: conferir cada UF na legislação estadual antes de confiar.

## Fora do escopo / limitações gerais
- Créditos de ICMS e de PIS/Cofins, ICMS-ST e DIFAL não são calculados (há avisos).
- Serviços (ISS, presunção de 32%, Anexos III a V) não fazem parte da calculadora.
- Testes cobrem `tax-engine.js` e o texto do catálogo. A interface foi apenas conferida em navegador headless (Chrome), sem testes automatizados de tela.
