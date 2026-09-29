// Calculadora, catálogo e navegação do Taxômetro. Fica fora do HTML para a CSP bloquear scripts inline.
const rows=[];
const add=(sphere,uf,name,type,value,base,desc,source)=>rows.push({sphere,uf,name,type,value,base,desc,source});
const rfb='https://www.gov.br/receitafederal/pt-br';
[
['IRPF','Imposto','0% a 27,5%','Renda tributável mensal/anual','Progressivo; deduções e faixa de isenção alteram o valor final.'],
['IRPJ','Imposto','15% + adicional de 10%','Lucro real, presumido ou arbitrado','Adicional sobre parcela do lucro que excede o limite legal.'],
['IPI','Imposto','0% a 30% ou mais','Valor do produto industrializado','Varia conforme a classificação TIPI; diversos produtos têm alíquota zero.'],
['IOF — crédito','Imposto','variável por operação','Valor e prazo da operação','Alíquotas e adicionais variam por modalidade, prazo e mutuário.'],
['IOF — câmbio','Imposto','0% a 3,5% em regra','Valor convertido','Depende da finalidade da operação; regras podem mudar por decreto.'],
['IOF — seguros','Imposto','0% a 7,38%','Prêmio do seguro','Há operações com alíquota zero ou reduzida.'],
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
['CBS — ano-teste 2026','Em transição','0,9%','Operações com bens e serviços','Compensável com PIS/Cofins em 2026 quando cumpridas as obrigações.'],
['IBS — ano-teste 2026','Em transição','0,1%','Operações com bens e serviços','Alíquota teste; transição da reforma tributária do consumo.']
].forEach(x=>add('Federal','BR',...x,rfb));

const states=[
['AC','Acre','19%','2%','2% a 8%'],['AL','Alagoas','20%','2,75% a 3%','2% doação / 4% herança'],['AP','Amapá','18%','3%','2% doação / 4% herança'],['AM','Amazonas','20%','1,5% a 2%','2% a 8%'],['BA','Bahia','20,5%','2,5% a 3%','3,5% a 8%'],['CE','Ceará','20%','2,5% a 3,5%','2% a 8%'],['DF','Distrito Federal','20%','3,5%','4% a 6%'],['ES','Espírito Santo','17%','2%','4%'],['GO','Goiás','19%','3% a 3,75%','2% a 8%'],['MA','Maranhão','23%','2,5% a 3%','1% a 7%'],['MT','Mato Grosso','17%','2% a 4%','2% a 8%'],['MS','Mato Grosso do Sul','17%','3% a 4,5%','3% doação / 6% herança'],['MG','Minas Gerais','18%','4%','5%'],['PA','Pará','19%','2,5%','2% a 6%'],['PB','Paraíba','20%','2,5%','2% a 8%'],['PR','Paraná','19,5%','3,5%','4%'],['PE','Pernambuco','20,5%','2,4% a 3%','2% a 8%'],['PI','Piauí','22,5%','2,5% a 3%','2% a 6%'],['RJ','Rio de Janeiro','22%','4%','4% a 8%'],['RN','Rio Grande do Norte','20%','3%','3% a 6%'],['RS','Rio Grande do Sul','17%','3%','3% a 6%'],['RO','Rondônia','19,5%','3%','2% a 4%'],['RR','Roraima','20%','3%','4%'],['SC','Santa Catarina','17%','2%','1% a 8%'],['SP','São Paulo','18%','4%','4%'],['SE','Sergipe','20%','2,5% a 3%','2% a 8%'],['TO','Tocantins','20%','2% a 2,5%','2% a 8%']
];
states.forEach(([uf,state,icms,ipva,itcmd])=>{
 const faz=`https://www.google.com/search?q=site%3A${uf.toLowerCase()}.gov.br+secretaria+fazenda+tributos`;
 add('Estadual',uf,'ICMS — alíquota interna geral','Imposto',icms,'Valor da operação/circulação',`Alíquota modal de ${state}; produto, serviço, FCP/FECOEP, substituição tributária e benefício fiscal podem mudar a carga.`,faz);
 add('Estadual',uf,'IPVA — automóveis de passeio','Imposto',ipva,'Valor venal do veículo',`Faixa de referência em ${state}; tipo, potência, combustível, idade, faixa de valor e isenções podem alterar a alíquota.`,faz);
 add('Estadual',uf,'ITCMD/ITCD — heranças e doações','Imposto',itcmd,'Valor transmitido/doado',`Alíquota vigente ou faixa progressiva de referência em ${state}; limites, faixas e isenções dependem da lei estadual.`,faz);
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
['CBS na nota — teste 2026','Em transição','0,9%','Valor da operação','Campo da reforma tributária. Em 2026, o valor é compensável com PIS/Cofins quando atendidas as obrigações legais.','https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/entenda'],
['IBS na nota — teste 2026','Em transição','0,1%','Valor da operação','Campo da reforma tributária, em fase de teste durante 2026.','https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/entenda'],

['II — Imposto de Importação','Imposto','Alíquota da TEC/NCM; frequentemente 0% a 35%','Valor aduaneiro (mercadoria + frete + seguro)','Não existe taxa única: depende da NCM, origem, acordo comercial, cota e regime aduaneiro. Bagagem acima da cota tem regra própria de 50%.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/imposto-importacao'],
['IPI-Importação','Imposto','Alíquota TIPI da NCM; 0% a 30% ou mais','Valor aduaneiro + II','Calculado após o II; pode haver isenção, suspensão ou alíquota zero.','https://www4.receita.fazenda.gov.br/simulador/glossario.html'],
['PIS-Importação','Contribuição','2,10% em regra; variável por produto','Valor aduaneiro, conforme legislação','Há alíquotas diferenciadas, adicionais, reduções, suspensão e isenção.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['Cofins-Importação','Contribuição','9,65% em regra; variável por produto','Valor aduaneiro, conforme legislação','Pode existir adicional de 1 ponto percentual e tratamentos específicos, conforme NCM e legislação.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['ICMS-Importação','Imposto','Alíquota interna da UF: modal de 17% a 23%','Base ampla, calculada “por dentro”','Em regra inclui valor aduaneiro, II, IPI, PIS/Cofins-Importação, despesas aduaneiras, AFRMM e outros valores previstos pela UF.','https://www.gov.br/empresas-e-negocios/pt-br/invest-export-brasil/importar/consulte-normas-tributarias/tratamento-tributario-na-importacao-1'],
['AFRMM — longo curso','Contribuição','25%','Frete aquaviário','Adicional ao frete em navegação de longo curso; há isenções, suspensões e regimes especiais.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
['AFRMM — cabotagem','Contribuição','10%','Frete aquaviário','Aplicado à remuneração do transporte por cabotagem.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
['AFRMM — navegação fluvial/lacustre especial','Contribuição','40%','Frete aquaviário','Para granéis líquidos nas regiões Norte e Nordeste, conforme hipótese legal.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/afrmm'],
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
['Reintegra / Acredita Exportação','Crédito fiscal','3% para ME/EPP entre 01/08/2025 e 31/12/2026','Receita elegível de exportação','Não é taxa cobrada: é crédito/benefício para exportadores elegíveis, sujeito às regras do programa.','https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/restituicao-ressarcimento-reembolso-e-compensacao/mensagens/reintegra/valor-maximo'],
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
(()=>{
 const $=id=>document.getElementById(id);
 const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const pct=v=>(v*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
 const num=id=>{const v=parseFloat($(id).value);return isFinite(v)&&v>0?v/100:0};
 const val=id=>{const v=parseFloat($(id).value);return isFinite(v)&&v>0?v:0};
 const icmsUf=Object.fromEntries(states.map(([uf,,icms])=>[uf,parseFloat(icms.replace(',','.'))]));
 states.forEach(([uf,n])=>$('cUf').insertAdjacentHTML('beforeend',`<option value="${uf}">${uf} — ${n}</option>`));
 $('cUf').value='SP';
 let mode='sell';
 const setIcms=()=>{$('cIcms').value=$('cReg').value==='import'?({SP:17}[$('cUf').value]??icmsUf[$('cUf').value]):icmsUf[$('cUf').value]};
 const toggle=()=>{
  const r=$('cReg').value, sell=mode==='sell'&&r!=='import';
  $('wPis').classList.toggle('hide',r==='simples'||r==='import');
  $('wIcms').classList.toggle('hide',r==='simples');
  $('wIpi').classList.toggle('hide',r==='import');
  $('wSimp').classList.toggle('hide',r!=='simples');
  $('wII').classList.toggle('hide',r!=='import');
  document.querySelectorAll('.sellOnly').forEach(e=>e.classList.toggle('hide',!sell));
  $('lblValue').textContent=mode==='buy'?'Preço pago, com impostos (R$)':r==='import'?'Valor do produto no exterior, em R$':'Custo do produto (R$)';
 };
 const setReg=()=>{$('cPis').value=$('cReg').value==='real'?9.25:3.65;setIcms();toggle()};
 const row=(a,b,c)=>`<tr${c?` class="${c}"`:''}><td>${a}</td><td>${brl(b)}</td></tr>`;
 const show=(label,main,sub,html)=>{$('rLabel').textContent=label;$('rMain').textContent=main;$('rSub').textContent=sub;$('rRows').innerHTML=html};
 function calc(){
  const r=$('cReg').value, v=val('cValue');
  const i=num('cIcms'), p=num('cPis'), ipi=r==='import'?0:num('cIpi'), sp=num('cSimp'), ii=num('cII');
  // Parcela de impostos sobre o preço final (ipi por fora, o resto sobre a base sem IPI)
  const tau=r==='simples'?(sp+ipi)/(1+ipi):(ipi+i+(1-i)*p)/(1+ipi);
  const taxLines=P=>{const base=P/(1+ipi),l=[];
   if(r==='simples')l.push(['Simples Nacional (DAS) '+pct(sp),base*sp]);
   else{l.push(['ICMS '+pct(i)+' (por dentro)',base*i],['PIS/Cofins '+pct(p),base*(1-i)*p])}
   if(ipi)l.push(['IPI '+pct(ipi),base*ipi]);return l};
  const cbs=P=>`<tr class="info"><td>CBS 0,9% + IBS 0,1% destacados em 2026 (compensáveis)</td><td>${brl(P/(1+ipi)*0.01)}</td></tr>`;
  const fail=m=>show(mode==='sell'?'Preço de venda':'Valor sem impostos','—',m,'');

  if(r==='import'){
   let net,gross;
   if(mode==='sell'){net=v;gross=net*(1+ii)/(1-i)}else{gross=v;net=gross*(1-i)/(1+ii)}
   if(!(i<1))return fail('Revise o ICMS: precisa ser menor que 100%.');
   const tax=gross-net;
   return show(mode==='sell'?'Total pago na importação':'Valor do produto sem impostos',brl(mode==='sell'?gross:net),
    `${brl(tax)} de impostos · ${gross?pct(tax/gross):'0%'} do preço final`,
    row('Produto sem impostos',net)+row('Imposto de importação '+pct(ii),net*ii)+row('ICMS '+pct(i)+' (por dentro)',gross*i)+row('Total de impostos',tax,'total')+row('Preço final pago',gross,'total'));
  }

  if(mode==='buy'){
   if(!(tau<1))return fail('Revise as alíquotas: a soma não pode chegar a 100%.');
   const gross=v, tl=taxLines(gross), tax=tl.reduce((a,x)=>a+x[1],0), net=gross-tax;
   return show('Valor do produto sem impostos',brl(net),`${brl(tax)} de impostos · ${gross?pct(tax/gross):'0%'} do preço final`,
    row('Produto sem impostos',net)+tl.map(x=>row(...x)).join('')+row('Total de impostos',tax,'total')+row('Preço final pago',gross,'total')+cbs(gross));
  }

  // Venda: P = (custo + fixo + frete) / (1 − impostos − comissão − pagamento − margem)
  const m=num('cMargem'), c=num('cCom'), t=num('cPag'), fixo=val('cFixo'), frete=val('cFrete');
  const den=1-tau-c-t-m;
  if(!(den>0))return fail('A soma de impostos, comissão, taxa de pagamento e margem chegou a 100% ou mais. Reduza algum percentual.');
  const P=(v+fixo+frete)/den, tl=taxLines(P), tax=tl.reduce((a,x)=>a+x[1],0);
  const fees=P*c+P*t+fixo+frete, lucro=P*m;
  const feeLines=[['Comissão do marketplace '+pct(c),P*c],['Taxa de pagamento '+pct(t),P*t],['Tarifa fixa por venda',fixo],['Frete',frete]].filter(x=>x[1]>0);
  show('Preço de venda',brl(P),`Lucro ${brl(lucro)} · impostos ${brl(tax)} · taxas ${brl(fees)}`,
   row('Custo do produto',v)+row('Lucro ('+pct(m)+' do preço)',lucro)
   +tl.map(x=>row(...x,'sub')).join('')+row('Total de impostos',tax,'total')
   +(feeLines.length?feeLines.map(x=>row(...x,'sub')).join('')+row('Total de taxas e frete',fees,'total'):'')
   +row('Preço de venda',P,'total')+cbs(P));
 }
 const setMode=m=>{mode=m;$('mSell').setAttribute('aria-pressed',m==='sell');$('mBuy').setAttribute('aria-pressed',m==='buy');toggle();calc()};
 $('mSell').onclick=()=>setMode('sell');$('mBuy').onclick=()=>setMode('buy');
 $('cReg').addEventListener('input',()=>{setReg();calc()});
 $('cUf').addEventListener('input',()=>{setIcms();calc()});
 document.querySelectorAll('.cgrid input').forEach(e=>e.addEventListener('input',calc));
 setReg();calc();
})();

// ---- PWA: service worker e botão de instalar ----
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}

// ---- Navegação entre telas ----
(()=>{const views={calc:document.getElementById('viewCalc'),cat:document.getElementById('viewCat')};
 const go=v=>{if(!views[v])v='calc';Object.entries(views).forEach(([k,el])=>el.hidden=k!==v);document.querySelectorAll('.nav-item').forEach(b=>{const on=b.dataset.view===v;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});scrollTo(0,0)};
 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{history.replaceState(null,'','#'+b.dataset.view);go(b.dataset.view)}));
 go(location.hash.slice(1));})();
