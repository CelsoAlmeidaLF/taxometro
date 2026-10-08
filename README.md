# Taxômetro

Calculadora de preço por regime tributário e catálogo de tributos do Brasil. App web estático (GitHub Pages), com CSP sem script inline. Os dados ficam no aparelho; não há servidor nem serviço pago.

**Alíquotas verificadas em 30/09/2026.** Estimativa: não substitui contador.

## Funcionalidades

- **Calculadora** para vender (preço que cobre custo, impostos, taxas e margem) e para comprar (quanto do preço pago é imposto), em Lucro Presumido, Lucro Real, Simples Nacional, MEI e Importação (Remessa Conforme).
- **Catálogo** de tributos federais, estaduais, municipais e de comércio exterior, com filtros e link para a fonte.
- **Consultoria MEI** (`dashboard.html`): portal de acompanhamento do MEI, aberto pelo selo na tela inicial.
- **WebAdmin** (`admin.html`): **protótipo**. Valida bandeiras e regras de tarifa, mas não salva nada, porque não há servidor. Não mostra dados no console.

## Fórmulas

Todas em `src/tax-engine.js` (funções puras). Percentuais são frações do preço final, salvo indicação.

- Preço de venda: `P = (custo + tarifa fixa + frete) / (1 − impostos − comissão − taxa de pagamento − margem)`.
- ICMS por dentro; PIS/Cofins sobre a base sem ICMS; IPI por fora. Se o destinatário é consumidor final, o IPI entra na base do ICMS (CF art. 155 §2º XI).
- Lucro Presumido (comércio): IRPJ 8% × 15% = 1,20% e CSLL 12% × 9% = 1,08% da receita (2,28%). Adicional de IRPJ: 10% sobre o lucro presumido acima de R$ 20 mil por mês, calculado pelo faturamento mensal informado. LC 224/2025 (+10% na presunção sobre a receita anual acima de R$ 5 mi) é opcional e está pendente de validação.
- Lucro Real: sem IRPJ/CSLL (margem antes deles) e PIS/Cofins de 9,25% sem créditos.
- Simples: `alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) / RBT12` (LC 123, Anexos I e II). IPI já está no DAS; ICMS-ST e DIFAL ficam de fora.
- MEI: DAS fixo dividido pelas vendas do mês. Limite R$ 6.750 por mês de atividade (R$ 81 mil no ano), tolerância de 20% (R$ 97.200); caminhoneiro com INSS de 12% e limite de R$ 251.600.
- Importação: valor aduaneiro = produto + frete e seguro, em US$ × cotação digitada. II: 0% até US$ 50; de US$ 50,01 a US$ 3.000, 60% com desconto de US$ 30. ICMS por dentro: 20% em AC, AL, BA, CE, MG, PB, PI, RN, RR e SE, 17% nas demais UFs. IOF de 3,5% sobre a compra no cartão internacional.
- CBS 0,9% e IBS 0,1% (2026): só informativos, sobre a base sem IPI, ICMS e PIS/Cofins, e apenas para Presumido e Real.
- Cada linha é arredondada a centavos e o total é a soma das linhas exibidas (a linha de lucro absorve o resíduo).

## Desenvolvimento

```
npm test        # ou: node --test test/
```

Sem dependências. Para rodar o app, sirva a pasta `src/` (por exemplo `python3 -m http.server`). Ao mudar arquivos do app, troque a versão em `data-vault-version` (`src/index.html`) e em `CACHE` (`src/sw.js`). Versão atual: **1.12.0**.

Os arquivos `stk-pkg-*` são cópias de `PACOTES/stk-pkg-security/` e os de `src/apoio/` são cópias de `PACOTES/stk-pkg-doacao/shared/`: não edite aqui.

Testes: `tax-engine` (fórmulas), `apoio` (CSP e Firebase do painel) e `stk-pkg-erros` (limpeza do log). Situação em 08/10/2026: 43 testes passando.

## Apoio, avaliação e log de erros

- `src/apoio/` traz cópias de `PACOTES/stk-pkg-doacao/shared/` (não editar aqui), com id `TAXOMETRO`.
- **Menu ⋮ → Apoiar · Avaliar · Sugerir:** doação (Pix e Bitcoin), nota de 1 a 5 e sugestão. Vai para o Firestore `systekna-feedback`, protegido por App Check.
- **Configurações → Relatórios de erro** (`stk-pkg-erros.js`, primeiro script do `<head>`): guarda no aparelho os últimos erros. Valores, e-mails, textos e parâmetros de URL viram `***` antes de guardar. Dá para ver, copiar, enviar e limpar.
- **Envio só com permissão:** com o **Modo testador** ligado (vale para todos os apps do aparelho), o app envia sozinho. Desligado, pergunta "Enviar relatório?" uma vez por sessão. O dono lê na aba **Erros** do painel de feedback.
- Nenhum dado financeiro sai do aparelho. Só a avaliação, a sugestão e o relatório técnico de erro são enviados.


Detalhes da revisão financeira: `docs/auditoria-financeira-2026-09.md`.
