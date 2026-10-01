// Calculadora, catálogo e navegação do Taxômetro. Fica fora do HTML para a CSP bloquear scripts inline.
const rows=[];
const add=(sphere,uf,name,type,value,base,desc,source)=>rows.push({sphere,uf,name,type,value,base,desc,source});
const rfb='https://www.gov.br/receitafederal/pt-br';
[
['IRPF','Imposto','0% a 27,5%','Renda tributável mensal/anual','Progressivo; deduções alteram o valor final. Desde 2026 (Lei 15.270/2025), quem recebe até R$ 5.000 por mês fica isento via redutor do imposto.'],
['IRPF — redutor da Lei 15.270/2025','Imposto','Isenção até R$ 5.000/mês; redução parcial até ~R$ 7.350/mês','Rendimentos tributáveis mensais (anual: R$ 60 mil a ~R$ 88,2 mil)','Redutor aplicado ao imposto da tabela progressiva: zera o imposto até R$ 5.000 por mês e diminui gradualmente até cerca de R$ 7.350. Vale para a tributação mensal e para a declaração anual.'],
['IRRF sobre dividendos','Imposto retido','10% na fonte','Dividendos acima de R$ 50.000 por mês pagos por uma mesma empresa a uma mesma pessoa física','Lei 15.270/2025, desde 2026. Dividendos até esse limite mensal continuam sem retenção na fonte.'],
['IRPF mínimo (alta renda)','Imposto','Até 10%, progressivo','Renda total anual acima de R$ 600 mil','Lei 15.270/2025: imposto mínimo para alta renda, com alíquota crescente a partir de R$ 600 mil por ano e teto de 10% a partir de cerca de R$ 1,2 milhão. Abate o imposto já pago.'],
['IRPJ','Imposto','15% + adicional de 10%','Lucro real, presumido ou arbitrado','Adicional sobre parcela do lucro que excede o limite legal.'],
['IPI','Imposto','0% a 30% ou mais','Valor do produto industrializado','Varia conforme a classificação TIPI; diversos produtos têm alíquota zero.'],
['IOF — crédito','Imposto','variável por operação','Valor e prazo da operação','Alíquotas e adicionais variam por modalidade, prazo e mutuário.'],
['IOF — câmbio','Imposto','0% a 3,5% em regra','Valor convertido','Depende da finalidade da operação; regras podem mudar por decreto. Cartão internacional, cheque de viagem e cartão pré-pago: 3,5% (Decreto 12.499/2025).'],
['IOF — seguros','Imposto','0% a 7,38%; VGBL: 5% acima de R$ 600 mil por ano','Prêmio do seguro; no VGBL, aportes acima de R$ 600 mil por ano por CPF','Há operações com alíquota zero ou reduzida. Desde 2026 (Decreto 12.499/2025), aportes em VGBL acima de R$ 600 mil no ano pagam 5% de IOF sobre o excedente.'],
['IOF — títulos e valores','Imposto','0% a 1,5% ao dia, limitado','Valor da operação/rendimento','Incidência depende do ativo e do prazo.'],
['ITR','Imposto','0,03% a 20%','Valor da terra nua tributável','Progressivo conforme área e grau de utilização do imóvel rural.'],
['II — Imposto de Importação','Imposto','0% a 35% em regra','Valor aduaneiro','Varia por NCM e regime; remessas internacionais podem seguir regime específico.'],
['IE — Imposto de Exportação','Imposto','0% na maioria; variável','Preço normal do produto exportado','Aplicado apenas a produtos/operações definidos.'],
['PIS/Pasep','Contribuição','0,65% ou 1,65%','Receita/faturamento','Regime cumulativo ou não cumulativo; há regras monofásicas e setoriais.'],
['Cofins','Contribuição','3% ou 7,6%','Receita/faturamento','Regime cumulativo ou não cumulativo; exceções setoriais.'],
['CSLL','Contribuição','9% em regra','Lucro líquido ajustado','Instituições financeiras podem ter alíquotas superiores.'],
['INSS — empregado','Contribuição','7,5% a 14%','Salário de contribuição','Progressivo por faixas até o teto previdenciário.'],
['INSS — contribuinte individual','Contribuição','5%, 11% ou 20%','Salário de contribuição','Depende do plano e das condições do segurado.'],
['Contribuição patronal previdenciária','Contribuição','20% em regra + RAT/terceiros','Folha/remuneração','Pode haver substituição pela CPRB ou regras específicas.'],
['CIDE-Combustíveis','Contribuição','valor específico por unidade','Volume importado/comercializado','Valores dependem do combustível e de atos normativos.'],
['CIDE-Royalties','Contribuição','10%','Remessas/contratos abrangidos','Incide em hipóteses legais de tecnologia, royalties e serviços técnicos.'],
['FGTS','Contribuição','8% em regra','Remuneração do empregado','Depósito do empregador; 2% para aprendiz e regras próprias em contratos específicos.'],
['Salário-Educação','Contribuição','2,5%','Folha de salários','Cobrado de empresas vinculadas à Previdência, ressalvadas exceções.'],
['MEI — DAS mensal','Imposto','R$ 82,05 a R$ 87,05 por mês (2026)','Valor fixo, independe do faturamento','5% do salário mínimo de INSS (R$ 81,05) + R$ 1 de ICMS (comércio/indústria) e/ou R$ 5 de ISS (serviços). Limite de faturamento: R$ 81 mil por ano; acima disso, desenquadramento para o Simples.'],
['CBS — ano-teste 2026','Em transição','0,9%','Operações com bens e serviços','Em 2026 o valor é dispensado de recolhimento para quem cumpre as obrigações acessórias (LC 214/2025, art. 348 §1º). Optantes do Simples/MEI só entram a partir de 01/01/2027.'],
['IBS — ano-teste 2026','Em transição','0,1%','Operações com bens e serviços','Alíquota teste; transição da reforma tributária do consumo.']
].forEach(x=>add('Federal','BR',...x,rfb));

const states=[
['AC','Acre','19%','2%','2% a 8%'],['AL','Alagoas','21,5%','2,75% a 3%','2% doação / 4% herança'],['AP','Amapá','18%','3%','2% doação / 4% herança'],['AM','Amazonas','20%','1,5% a 2%','2% a 8%'],['BA','Bahia','20,5%','2,5% a 3%','3,5% a 8%'],['CE','Ceará','20%','2,5% a 3,5%','2% a 8%'],['DF','Distrito Federal','20%','3,5%','4% a 6%'],['ES','Espírito Santo','17%','2%','4%'],['GO','Goiás','19%','3% a 3,75%','2% a 8%'],['MA','Maranhão','23%','2,5% a 3%','1% a 7%'],['MT','Mato Grosso','17%','2% a 4%','2% a 8%'],['MS','Mato Grosso do Sul','17%','3% a 4,5%','3% doação / 6% herança'],['MG','Minas Gerais','18%','4%','5%'],['PA','Pará','19%','2,5%','2% a 6%'],['PB','Paraíba','20%','2,5%','2% a 8%'],['PR','Paraná','19,5%','1,9%','4%'],['PE','Pernambuco','20,5%','2,4% a 3%','2% a 8%'],['PI','Piauí','22,5%','2,5% a 3%','2% a 6%'],['RJ','Rio de Janeiro','22%','4%','4% a 8%'],['RN','Rio Grande do Norte','20%','3%','3% a 6%'],['RS','Rio Grande do Sul','17%','3%','3% a 6%'],['RO','Rondônia','19,5%','3%','2% a 4%'],['RR','Roraima','20%','3%','4%'],['SC','Santa Catarina','17%','2%','1% a 8%'],['SP','São Paulo','18%','4%','4%'],['SE','Sergipe','20%','2,5% a 3%','2% a 8%'],['TO','Tocantins','20%','2% a 2,5%','2% a 8%']
];
states.forEach(([uf,state,icms,ipva,itcmd])=>{
 const faz=`https://www.google.com/search?q=site%3A${uf.toLowerCase()}.gov.br+secretaria+fazenda+tributos`;
 add('Estadual',uf,'ICMS — alíquota interna geral','Imposto',icms,'Valor da operação/circulação',`Alíquota modal de ${state}${uf==='AL'?' (20,5% + 1% de FCP desde 01/04/2026, Lei AL 9.776/2025)':''}; produto, serviço, FCP/FECOEP, substituição tributária e benefício fiscal podem mudar a carga.`,faz);
 add('Estadual',uf,'IPVA — automóveis de passeio','Imposto',ipva,'Valor venal do veículo',`Faixa de referência em ${state}; tipo, potência, combustível, idade, faixa de valor e isenções podem alterar a alíquota.`,faz);
 add('Estadual',uf,'ITCMD/ITCD — heranças e doações','Imposto',itcmd,'Valor transmitido/doado',`NÃO VERIFICADO com a lei estadual: valor de referência. A EC 132/2023 exige alíquotas progressivas e os estados estão adaptando as leis (LC 227/2026). Alíquota ou faixas de ${state}; limites, faixas e isenções dependem da lei estadual.`,faz);
 add('Estadual',uf,'Taxas estaduais diversas','Taxa','Valor fixo ou unidade fiscal estadual','Serviço, licença ou fiscalização',`Inclui, conforme a UF, taxas judiciárias, segurança pública, fiscalização, licenciamento ambiental, registros e serviços. Não há valor único; consultar a tabela anual de ${state}.`,faz);
});

const municipal=[
['ISS/ISSQN','Imposto','2% a 5%','Preço do serviço','A alíquota depende do serviço e da lei do município; regras nacionais fixam limites.'],
['IPTU','Imposto','variável por município','Valor venal do imóvel','Pode ser progressivo por valor, uso, localização ou tempo; há descontos e isenções locais.'],
['ITBI','Imposto','geralmente 2% a 3%; variável','Valor da transmissão imobiliária','Alíquota e base são definidas pelo município, observadas as regras constitucionais e judiciais.'],
['Taxa de coleta de lixo/resíduos','Taxa','valor fixo ou por critérios locais','Custo/uso do serviço divisível','Pode considerar área, frequência, uso e categoria do imóvel. Nem todo município cobra separadamente.'],
['Taxa de licença/localização e funcionamento','Taxa','valor anual variável','Atividade, área e risco','Cobrança municipal para licenciamento/fiscalização de estabelecimentos.'],
['Taxa de vigilância sanitária','Taxa','valor variável','Atividade e porte','Aplicável a atividades sujeitas à fiscalização sanitária local.'],
['Taxa de publicidade/anúncios','Taxa','valor variável','Tipo, dimensão e período','Cobrança por licença/fiscalização de anúncios, conforme código tributário municipal.'],
['Taxa de obras e habite-se','Taxa','valor variável','Área, tipo e complexidade','Análise, licença, vistoria e emissão de documentos de obra.'],
['Taxa ambiental municipal','Taxa','valor variável','Atividade, porte e impacto','Licença ou fiscalização ambiental quando houver competência municipal.'],
['COSIP/CIP — iluminação pública','Contribuição','valor/faixa local','Consumo, ligação ou critério municipal','Custeio da iluminação pública; normalmente cobrada na fatura de energia.']
];
municipal.forEach(x=>add('Municipal','Município',...x,'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'));

// Tributos e valores encontrados em documentos fiscais e operações de comércio exterior.
const trade=[
['ICMS próprio na NF-e','Imposto','17% a 23% na alíquota modal; varia por UF/produto','Valor da operação, com cálculo “por dentro”','Aparece em venda de mercadoria, transporte interestadual/intermunicipal e comunicação. Pode haver redução, diferimento, isenção ou crédito.','https://www.nfe.fazenda.gov.br/portal/principal.aspx'],
['ICMS interestadual','Imposto','4%, 7% ou 12%','Valor da operação','4% geralmente para bens importados; 7% ou 12% conforme origem e destino. DIFAL pode complementar a carga no destino.','https://www.confaz.fazenda.gov.br/legislacao'],
['DIFAL do ICMS','Imposto','Diferença entre alíquota interna e interestadual','Valor da operação','Aplicável nas hipóteses legais de operação destinada a consumidor final em outra UF.','https://www.confaz.fazenda.gov.br/legislacao'],
['ICMS-ST','Imposto','MVA/PMPF e alíquota conforme produto e UF','Base presumida de venda ao consumidor','Substituição tributária: um contribuinte recolhe antecipadamente o ICMS de etapas posteriores.','https://www.confaz.fazenda.gov.br/legislacao'],
['FCP/FECOEP','Adicional','0% a 4%, conforme UF e produto','Base do ICMS','Adicional estadual destinado ao combate à pobreza; pode aparecer como FCP próprio ou FCP-ST.','https://www.confaz.fazenda.gov.br/legislacao'],
['IPI na NF-e','Imposto','0% a 30% ou mais, conforme TIPI/NCM','Valor do produto + despesas tributáveis','Incide sobre industrialização e importação. Estabelecimentos equiparados a industrial também podem destacar IPI.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/ipi'],
['PIS/Pasep na NF-e','Contribuição','0,65% cumulativo ou 1,65% não cumulativo','Receita da operação','Pode ter alíquota zero, suspensão, incidência monofásica ou regime específico.','https://www.gov.br/receitafederal/pt-br'],
['Cofins na NF-e','Contribuição','3% cumulativo ou 7,6% não cumulativo','Receita da operação','Pode ter alíquota zero, suspensão, incidência monofásica ou regime específico.','https://www.gov.br/receitafederal/pt-br'],
['ISS na NFS-e','Imposto','2% a 5%','Preço do serviço','Tributo municipal destacado na nota de serviço; pode ser retido pelo tomador conforme o serviço e o município.','https://www.gov.br/nfse/pt-br'],
['IRRF em nota de serviço','Imposto retido','1%, 1,5% ou outras alíquotas','Pagamento ou crédito pelo serviço','Retenção depende da natureza do serviço, do prestador e do tomador.','https://www.gov.br/receitafederal/pt-br'],
['PIS/Cofins/CSLL retidos — CSRF','Contribuição retida','4,65% em regra (0,65% + 3% + 1%)','Pagamento por serviços abrangidos','Retenção federal conjunta em hipóteses legais; existem dispensas e tratamentos específicos.','https://www.gov.br/receitafederal/pt-br'],
['INSS retido em serviço','Contribuição retida','11% em regra; hipóteses com 3,5%','Valor bruto da nota/fatura, com exclusões legais','Comum em cessão de mão de obra e empreitada; depende do regime previdenciário da contratada.','https://www.gov.br/receitafederal/pt-br'],
['IBPT / Valor aproximado dos tributos','Informativo','Percentual estimado variável','Valor total da venda','O campo “valor aproximado dos tributos” não é imposto adicional: informa uma estimativa da carga embutida no preço.','https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm'],
['CBS na nota — teste 2026','Em transição','0,9%','Valor da operação','Campo da reforma tributária. Em 2026, o valor é dispensado de recolhimento para quem cumpre as obrigações acessórias (LC 214/2025, art. 348 §1º). Simples/MEI só a partir de 01/01/2027.','https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/entenda'],
['IBS na nota — teste 2026','Em transição','0,1%','Valor da operação','Campo da reforma tributária, em fase de teste durante 2026.','https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/entenda'],

['II — Imposto de Importação','Imposto','Alíquota da TEC/NCM; frequentemente 0% a 35%','Valor aduaneiro (mercadoria + frete + seguro)','Não existe taxa única: depende da NCM, origem, acordo comercial, cota e regime aduaneiro. Bagagem acima da cota tem regra própria de 50%.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/imposto-importacao'],
['IPI-Importação','Imposto','Alíquota TIPI da NCM; 0% a 30% ou mais','Valor aduaneiro + II','Calculado após o II; pode haver isenção, suspensão ou alíquota zero.','https://www4.receita.fazenda.gov.br/simulador/glossario.html'],
['PIS-Importação','Contribuição','2,10% em regra; variável por produto','Valor aduaneiro, conforme legislação','Há alíquotas diferenciadas, adicionais, reduções, suspensão e isenção.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['Cofins-Importação','Contribuição','9,65% em regra; variável por produto','Valor aduaneiro, conforme legislação','Pode existir adicional de 1 ponto percentual e tratamentos específicos, conforme NCM e legislação.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['ICMS-Importação','Imposto','Importação formal: alíquota interna da UF (17% a 23%). Remessa Conforme: 20% em AC, AL, BA, CE, MG, PB, PI, RN, RR e SE; 17% nas demais','Base ampla, calculada “por dentro”','No Remessa Conforme vale a tabela própria do Convênio ICMS 81/2023 (alterado pelo 135/2024). Em regra a base inclui valor aduaneiro, II, IPI, PIS/Cofins-Importação, despesas aduaneiras, AFRMM e outros valores previstos pela UF.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['AFRMM — longo curso','Contribuição','8%','Frete aquaviário','Adicional ao frete em navegação de longo curso (Lei 14.301/2022, art. 6º da Lei 10.893/2004); há isenções, suspensões e regimes especiais.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
['AFRMM — cabotagem','Contribuição','8%','Frete aquaviário','Aplicado à remuneração do transporte por cabotagem (Lei 14.301/2022).','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
['AFRMM — navegação fluvial/lacustre','Contribuição','8%','Frete aquaviário','Alíquota única de 8% desde a Lei 14.301/2022, inclusive para granéis líquidos nas regiões Norte e Nordeste (antes 40%).','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
['Taxa de utilização do Siscomex','Taxa','Valor fixo variável por declaração e adições','Registro da DI/declaração','Despesa aduaneira; a tabela e o modelo de declaração usados determinam o valor. Pode integrar a base do ICMS-importação.','https://www.gov.br/siscomex/pt-br'],
['Direito antidumping','Defesa comercial','Valor específico ou percentual variável','Quantidade ou valor aduaneiro','Não é imposto geral: aplica-se somente a produto, origem e prazo determinados em ato da Camex.','https://www.gov.br/mdic/pt-br/assuntos/comercio-exterior/defesa-comercial-e-interesse-publico'],
['Medida compensatória / salvaguarda','Defesa comercial','Variável conforme ato','Quantidade ou valor da importação','Cobrança excepcional para produtos e origens abrangidos por ato vigente.','https://www.gov.br/mdic/pt-br/assuntos/comercio-exterior/defesa-comercial-e-interesse-publico'],
['CIDE-Combustíveis na importação','Contribuição','Valor específico por m³ ou tonelada','Quantidade importada','Somente combustíveis abrangidos; valores podem ser reduzidos ou restabelecidos por norma.','https://www.gov.br/receitafederal/pt-br'],
['Imposto de Importação — remessa internacional','Imposto','0% até US$ 50; 60% com desconto de US$ 30 de US$ 50,01 a US$ 3.000','Valor aduaneiro da remessa','No Remessa Conforme, compras de pessoa física até US$ 50 têm alíquota zero desde maio de 2026 (MP 1.357/2026, convertida na Lei 15.502/2026, e Portaria MF 1.342/2026). De US$ 50,01 a US$ 3.000: 60% com desconto de US$ 30 no imposto. Fora do programa, aplica-se em regra 60%. ICMS é separado.','https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/topicos/tributacao'],

['IE — Imposto de Exportação','Imposto','0% para a grande maioria; variável nas exceções','Preço normal/valor da exportação','O Brasil desonera a maioria das exportações. A Camex define os poucos produtos e destinos sujeitos ao IE.','https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1'],
['ICMS na exportação','Imposto','0% / não incidência','Valor da operação de exportação','Exportações de mercadorias são desoneradas, com manutenção/aproveitamento de créditos conforme as regras aplicáveis.','https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1'],
['IPI na exportação','Imposto','0% / imunidade','Valor do produto exportado','Produtos industrializados destinados ao exterior são imunes ao IPI.','https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1'],
['PIS/Cofins na exportação','Contribuição','0% / não incidência','Receita de exportação','Receitas de exportação são desoneradas nas hipóteses legais, preservadas regras de créditos.','https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1'],
['ISS na exportação de serviços','Imposto','Não incidência quando o resultado ocorre no exterior','Preço do serviço','Se o resultado do serviço ocorrer no Brasil, a simples contratação por estrangeiro não garante a desoneração.','https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm'],
['Reintegra / Acredita Exportação','Crédito fiscal','3% para ME/EPP entre 01/08/2025 e 31/12/2026','Receita elegível de exportação','Alíquota de 3% para MEI, ME e EPP (Decreto 12.565/2025, Programa Acredita Exportação, LC 216/2025). Não é taxa cobrada: é crédito/benefício para exportadores elegíveis; o Reintegra é extinto com a CBS em 2027.','https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12565.htm'],
['Drawback','Regime aduaneiro','Suspensão, isenção ou restituição','Tributos de insumos vinculados à exportação','Não é uma taxa; é regime que pode suspender ou eliminar tributos sobre insumos usados em bens exportados.','https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1']
];
trade.forEach(x=>add('NF-e / Comércio exterior','BR',...x));

const special=[
['Taxa de emissão de passaporte','Taxa','R$ 257,25 em situação comum','Emissão do documento','Pode haver valor maior em urgência ou perda de passaporte válido.','https://www.gov.br/pf/pt-br/assuntos/passaporte'],
['Taxa de fiscalização CVM','Taxa','variável por categoria','Porte/categoria do participante','Valores definidos em lei e atualizados conforme enquadramento.','https://www.gov.br/cvm/pt-br'],
['Taxa de fiscalização Anvisa','Taxa','variável por fato gerador e porte','Serviço/fiscalização sanitária','TFVS possui tabela extensa, com reduções conforme porte.','https://www.gov.br/anvisa/pt-br'],
['Taxas do Ibama','Taxa','variável','Atividade, porte ou serviço','Inclui TCFA e serviços ambientais; valores dependem do enquadramento.','https://www.gov.br/ibama/pt-br'],
['Taxa de fiscalização Anatel','Taxa','variável','Estação/serviço de telecomunicação','Instalação e funcionamento dependem da modalidade e do serviço.','https://www.gov.br/anatel/pt-br'],
['Taxas de registro de propriedade industrial — INPI','Taxa','variável por serviço','Pedido, exame, registro ou manutenção','Há valores e descontos específicos para pessoas físicas, MEI, ME/EPP e outros.','https://www.gov.br/inpi/pt-br']
]; special.forEach(x=>add('Federal','BR',...x));

const ufSelect=document.querySelector('#uf'); states.forEach(([uf,n])=>ufSelect.insertAdjacentHTML('beforeend',`<option value="${uf}">${uf} — ${n}</option>`));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badgeFor=t=>({'Imposto':'badge-info','Taxa':'badge-warn','Contribuição':'badge-pos','Em transição':'badge-neg'}[t]||'badge-neutral');
function render(){const q=document.querySelector('#q').value.toLowerCase(),sp=document.querySelector('#sphere').value,uf=document.querySelector('#uf').value,tp=document.querySelector('#type').value;const result=rows.filter(r=>(!sp||r.sphere===sp)&&(!uf||r.uf===uf)&&(!tp||r.type===tp)&&(!q||Object.values(r).join(' ').toLowerCase().includes(q)));document.querySelector('#count').textContent=`${result.length} de ${rows.length} registros`;document.querySelector('#rows').innerHTML=result.map(r=>`<article class="tax"><div class="tax-head"><div class="info"><div class="name">${esc(r.name)}</div><div class="meta">${esc(r.sphere)} · ${esc(r.uf)}</div></div><span class="badge ${badgeFor(r.type)}">${esc(r.type)}</span></div><div class="tax-value">${esc(r.value)}</div><div class="meta">Base: ${esc(r.base)}</div><p class="tax-desc">${esc(r.desc)}</p><a class="btn btn-ghost tax-link" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Consultar fonte</a></article>`).join('')||'<div class="empty-state"><div class="icon"><svg class="ico ico-empty" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/></svg></div><div class="title">Nenhum tributo encontrado</div><div class="desc">Mude a busca ou limpe os filtros.</div></div>'}
document.querySelectorAll('.filters input,.filters select').forEach(e=>e.addEventListener('input',render));render();
// ---- Calculadora de preço com/sem impostos ----
// As fórmulas ficam em tax-engine.js (funções puras, testadas em test/); aqui só há leitura dos campos e desenho do resultado.
(()=>{
 const T=window.TaxEngine;
 const $=id=>document.getElementById(id);
 const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const pct=v=>(v*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
 const icmsUf=Object.fromEntries(states.map(([uf,,icms])=>[uf,parseFloat(icms.replace(',','.'))]));
 states.forEach(([uf,n])=>$('cUf').insertAdjacentHTML('beforeend',`<option value="${uf}">${uf} — ${n}</option>`));
 $('cUf').value='SP';
 let mode='sell';
 // Leitura validada: vazio vira 0 (campos opcionais), texto inválido/negativo/acima do max mostra erro em vez de virar 0 em silêncio.
 const read=(id,label,o={})=>{const el=$(id);if(el.validity&&el.validity.badInput){el.setAttribute('aria-invalid','true');throw {msg:`${label}: valor inválido.`}}
  const r=T.parseField(el.value,{label,min:el.min!==''?+el.min:0,max:el.max!==''?+el.max:Infinity,...o});
  if(r.error){el.setAttribute('aria-invalid','true');throw {msg:r.error}}return r.value};
 const readPct=(id,label,o)=>read(id,label,o)/100;
 const setIcms=()=>{const uf=$('cUf').value;$('cIcms').value=$('cReg').value==='import'?T.icmsImportacao(uf)*100:icmsUf[uf]};
 const toggle=()=>{
  const r=$('cReg').value, sell=mode==='sell'&&r!=='import', imp=r==='import';
  const on=(id,show)=>$(id).classList.toggle('hide',!show);
  on('wPis',r==='presumido'||r==='real');
  on('wIcms',r==='presumido'||r==='real'||imp);
  on('wIpi',r==='presumido'||r==='real');
  on('wDest',r==='presumido'||r==='real');
  on('wFat',r==='presumido');on('wLc',r==='presumido');
  ['wMeiTipo','wMeiAt','wMeiMeses','wDas','wVendas'].forEach(id=>on(id,r==='mei'));
  ['wSimp','wAnexo'].forEach(id=>on(id,r==='simples'));
  on('wRbt',r==='simples'&&$('cAnexo').value!=='manual');
  ['wII','wCot','wIof'].forEach(id=>on(id,imp));
  on('wFrExt',imp&&mode==='sell');
  $('cSimp').readOnly=r==='simples'&&$('cAnexo').value!=='manual';
  document.querySelectorAll('.sellOnly').forEach(e=>e.classList.toggle('hide',!sell));
  $('lblValue').textContent=imp?(mode==='buy'?'Total pago, com impostos e IOF (R$)':'Valor do produto no exterior (US$)'):mode==='buy'?'Preço pago, com impostos (R$)':'Custo do produto (R$)';
 };
 const setReg=()=>{$('cPis').value=$('cReg').value==='real'?9.25:3.65;setIcms();toggle()};
 const setDas=()=>{$('cDas').value=T.meiDas($('cMeiTipo').value,$('cMeiAt').value)};
 const row=(a,b,c)=>`<tr${c?` class="${c}"`:''}><td>${a}</td><td>${brl(b)}</td></tr>`;
 const info=t=>`<tr class="info"><td colspan="2">${esc(t)}</td></tr>`;
 const show=(label,main,sub,html)=>{$('rLabel').textContent=label;$('rMain').textContent=main;$('rSub').textContent=sub;$('rRows').innerHTML=html};
 const fail=m=>show(mode==='sell'?'Preço de venda':'Valor sem impostos','—',m,'');
 const lineLabel=x=>x.label+(x.rate!=null?' '+pct(x.rate):'');
 const cbsRow=c=>c==null?'':`<tr class="info"><td>CBS 0,9% + IBS 0,1% destacados em 2026, só informativos e fora do preço. Quem cumpre as obrigações acessórias fica dispensado de recolher (LC 214/2025, art. 348 §1º).</td><td>${brl(c)}</td></tr>`;
 const meiMsg=s=>!s?'':info(`Faturamento estimado ${brl(s.fat)} em ${s.meses} ${s.meses===1?'mês':'meses'}, acima do limite proporcional do MEI (${brl(s.limite)}). `+(s.faixa==='tolerancia'?'Dentro da tolerância de 20% (até '+brl(s.tolerancia)+'): continua MEI, com DAS sobre o excedente.':'Acima da tolerância de 20%: desenquadramento retroativo a 1º de janeiro. Fale com um contador sobre o Simples Nacional.'));
 const feeRows=r=>r.fees.length?r.fees.map(x=>row(x.label+(x.key==='com'||x.key==='pag'?' '+pct(x.key==='com'?rateCom:ratePag):''),x.v,'sub')).join('')+row('Total de taxas e frete',r.feeTotal,'total'):'';
 let rateCom=0,ratePag=0;
 const AVISO='Estimativa com alíquotas verificadas em '+T.VERIFICADO_EM+'; não substitui contador.';

 function run(){
  const r=$('cReg').value;
  const v=read('cValue',mode==='buy'||r==='import'?'O valor':'O custo',{allowEmpty:false});
  const rows=[];
  if(r==='import'){
   const iiRaw=$('cII').value.trim();if($('cII').validity.badInput)read('cII','O imposto de importação');
   const res=T.calcImport({mode,value:v,cot:read('cCot','A cotação do dólar',{allowEmpty:false,min:0.0001}),freteUsd:mode==='sell'?read('cFreteExt','O frete e seguro'):0,
    icms:readPct('cIcms','O ICMS'),iiOverride:iiRaw===''?null:readPct('cII','O imposto de importação'),iof:$('cIof').value==='cartao'?T.IOF_CARTAO:0});
   if(!res.ok)return fail(res.error);
   const L=res.lines,icms=readPct('cIcms','O ICMS');
   return show(mode==='sell'?'Total pago na importação':'Valor do produto sem impostos',brl(mode==='sell'?res.total:L.produto),
    `${brl(res.tax)} de impostos · ${res.total?pct(res.tax/res.total):'0%'} do total pago`,
    row('Produto'+(mode==='sell'?'':' (com frete e seguro)')+' sem impostos',L.produto)+(L.frete?row('Frete e seguro internacionais',L.frete):'')
    +row('Imposto de importação'+(iiRaw===''?' (regra do Remessa Conforme)':' '+pct(readPct('cII','O imposto de importação'))),L.ii)
    +row('ICMS '+pct(icms)+' (por dentro)',L.icms)+(L.iof?row('IOF do cartão internacional '+pct(T.IOF_CARTAO),L.iof):'')
    +row('Total de impostos',res.tax,'total')+row('Total pago',res.total,'total')+res.warnings.map(info).join('')+info(AVISO));
  }
  if(r==='mei'){
   const das=read('cDas','O DAS');
   const n=Math.floor(read('cVendas','As vendas por mês',{allowEmpty:false,min:1}));
   rateCom=mode==='sell'?readPct('cCom','A comissão'):0;ratePag=mode==='sell'?readPct('cPag','A taxa de pagamento'):0;
   const res=T.calcSale({mode,regime:'mei',value:v,das,vendas:n,meiTipo:$('cMeiTipo').value,meiMeses:read('cMeiMeses','Os meses de atividade',{def:12}),
    margem:mode==='sell'?readPct('cMargem','A margem'):0,com:rateCom,pag:ratePag,fixo:mode==='sell'?read('cFixo','A tarifa fixa'):0,frete:mode==='sell'?read('cFrete','O frete'):0});
   if(!res.ok)return fail(res.error);
   const dasRow=row(`DAS MEI (${brl(das)}/mês ÷ ${n} vendas)`,res.du===undefined?res.tax:res.du);
   if(mode==='buy')return show('Valor do produto sem impostos',brl(res.net),`${brl(res.tax)} de DAS por venda · ${res.P?pct(res.tax/res.P):'0%'} do preço`,
    row('Produto sem impostos',res.net)+dasRow+row('Preço pago',res.P,'total')+meiMsg(res.meiStatus)+info(AVISO));
   return show('Preço de venda',brl(res.P),`Lucro ${brl(res.lucro)} · DAS ${brl(res.du)} por venda · taxas ${brl(res.feeTotal)}`,
    row('Custo do produto',res.v)+row('Lucro ('+pct(readPct('cMargem','A margem'))+' do preço)',res.lucro)+dasRow+feeRows(res)+row('Preço de venda',res.P,'total')+meiMsg(res.meiStatus)+info(AVISO));
  }
  // Presumido, Real, Simples
  let simples=0,extra=[];
  if(r==='simples'){
   if($('cAnexo').value!=='manual'){
    const ef=T.simplesEfetiva($('cAnexo').value,read('cRbt12','A receita dos últimos 12 meses (RBT12)',{allowEmpty:false}));
    if(ef.error){$('cRbt12').setAttribute('aria-invalid','true');return fail(ef.error)}
    simples=ef.aliquota;$('cSimp').value=(simples*100).toFixed(2);
    extra.push(`Alíquota efetiva (LC 123): ${pct(simples)} = (RBT12 × ${pct(ef.nominal)} − ${brl(ef.deducao)}) ÷ RBT12, ${ef.faixa}ª faixa.`);
    if(ef.icmsIssFora)extra.push('RBT12 acima de R$ 3,6 milhões: ICMS/ISS são recolhidos fora do DAS.');
   }else simples=readPct('cSimp','A alíquota do Simples');
  }
  const cash=r==='presumido'||r==='real';
  rateCom=mode==='sell'?readPct('cCom','A comissão'):0;ratePag=mode==='sell'?readPct('cPag','A taxa de pagamento'):0;
  const res=T.calcSale({mode,regime:r,value:v,icms:cash?readPct('cIcms','O ICMS'):0,pis:cash?readPct('cPis','O PIS/Cofins'):0,ipi:cash?readPct('cIpi','O IPI'):0,simples,
   dest:$('cDest').value,fatMes:r==='presumido'?read('cFat','O faturamento mensal'):0,lc224:r==='presumido'&&$('cLc224').value==='sim',
   margem:mode==='sell'?readPct('cMargem','A margem'):0,com:rateCom,pag:ratePag,fixo:mode==='sell'?read('cFixo','A tarifa fixa'):0,frete:mode==='sell'?read('cFrete','O frete'):0});
  if(!res.ok)return fail(res.error);
  const tl=res.taxLines.map(x=>row(lineLabel(x),x.v,mode==='sell'?'sub':'')).join('');
  const notes=extra.concat(res.warnings).map(info).join('')+info(AVISO);
  if(mode==='buy')return show('Valor do produto sem impostos',brl(res.net),`${brl(res.tax)} de impostos · ${res.P?pct(res.tax/res.P):'0%'} do preço final`,
   row('Produto sem impostos',res.net)+tl+row('Total de impostos',res.tax,'total')+row('Preço final pago',res.P,'total')+cbsRow(res.cbs)+notes);
  show('Preço de venda',brl(res.P),`Lucro ${brl(res.lucro)} · impostos ${brl(res.tax)} · taxas ${brl(res.feeTotal)}`,
   row('Custo do produto',res.v)+row('Lucro ('+pct(readPct('cMargem','A margem'))+' do preço)',res.lucro)+tl+row('Total de impostos',res.tax,'total')
   +feeRows(res)+row('Preço de venda',res.P,'total')+cbsRow(res.cbs)+notes);
 }
 function calc(){
  document.querySelectorAll('.cgrid input,.cgrid select').forEach(e=>e.removeAttribute('aria-invalid'));
  try{run()}catch(e){if(e&&e.msg)fail(e.msg);else throw e}
 }
 const setMode=m=>{mode=m;$('mSell').setAttribute('aria-pressed',m==='sell');$('mBuy').setAttribute('aria-pressed',m==='buy');toggle();calc()};
 $('mSell').onclick=()=>setMode('sell');$('mBuy').onclick=()=>setMode('buy');
 $('cReg').addEventListener('input',()=>{setReg();calc()});
 $('cUf').addEventListener('input',()=>{setIcms();calc()});
 $('cAnexo').addEventListener('input',()=>{toggle();calc()});
 ['cMeiAt','cMeiTipo'].forEach(id=>$(id).addEventListener('input',()=>{setDas();calc()}));
 document.querySelectorAll('.cgrid input,.cgrid select').forEach(e=>e.addEventListener('input',calc));
 setReg();setDas();calc();
})();

// ---- PWA: service worker e botão de instalar ----
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}

// ---- Navegação entre telas ----
(()=>{const views={calc:document.getElementById('viewCalc'),cat:document.getElementById('viewCat')};
 const go=v=>{if(!views[v])v='calc';Object.entries(views).forEach(([k,el])=>el.hidden=k!==v);document.querySelectorAll('.nav-item').forEach(b=>{const on=b.dataset.view===v;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});scrollTo(0,0)};
 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{history.replaceState(null,'','#'+b.dataset.view);go(b.dataset.view)}));
 go(location.hash.slice(1));})();
