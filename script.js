// ==========================================
// VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let currentStep = 1;
let canaisSelecionados = [];
let briefingAtual = "";
let canalAtivo = "";

// Variáveis do Novo Input de Categorias
let categoriaSelecionada = "";
let subcategoriaSelecionada = "";

// Armazena URLs de imagens lidas no Step 1 e os links adicionados
let assetsCarregados = { imagens: [] };
let linksInsumos = []; 

// Objeto que armazenará a resposta dinâmica da IA
let conteudoGeradoIA = {};

// Dicionário de Categorias vs Subcategorias (Mercado CRM)
const dictCategorias = {
    'Transacional': ['Status de pedido e rastreio', 'Confirmações de conta', 'Financeiro e Segurança'],
    'Lifecycle': ['Onboarding / Boas-vindas', 'Carrinho ou Navegação Abandonada', 'Datas Comemorativas', 'Reativação (Win-back)'],
    'Promocional': ['Ofertas exclusivas', 'Lançamentos de produtos', 'Campanhas Sazonais', 'Cross-sell e Up-sell'],
    'Relacionamento': ['Newsletters', 'Dicas de uso e Educação', 'Convites'],
    'Pesquisa': ['Pesquisas de Satisfação', 'Avaliações de Produto'],
    'Operacional': ['Atualizações legais', 'Avisos de manutenção', 'Mudanças de serviço']
};

// ==========================================
// LOGICA DE INTERFACE (NAVEGAÇÃO E CASCATA)
// ==========================================
function updateBadges() {
    document.querySelectorAll('header span[id^="badge-step-"]').forEach((el, index) => {
        el.className = (index + 1 === currentStep) ? "font-bold text-blue-600" : "";
    });
}

function goToStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden-step');
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden-step');
    
    const footer = document.getElementById('footer-actions');
    if (currentStep === 1) {
        footer.classList.add('hidden-step');
    } else {
        footer.classList.remove('hidden-step');
        document.getElementById('btn-next').classList.toggle('hidden-step', currentStep === 3);
        
        if (currentStep === 3) {
            gerarTelaExportacao();
        }
    }
    updateBadges();
}

function goBack() { if (currentStep > 1) goToStep(currentStep - 1); }

function atualizarSubcategorias() {
    const catSelect = document.getElementById('select-categoria');
    const subCatDiv = document.getElementById('div-subcategoria');
    const subCatSelect = document.getElementById('select-subcategoria');
    
    const catValue = catSelect.value;
    
    if (catValue && dictCategorias[catValue]) {
        subCatSelect.innerHTML = '';
        dictCategorias[catValue].forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.innerText = sub;
            subCatSelect.appendChild(opt);
        });
        subCatDiv.classList.remove('hidden');
    } else {
        subCatDiv.classList.add('hidden');
    }
}

// ==========================================
// INTEGRAÇÃO GEMINI (GERADOR DINÂMICO CRM)
// ==========================================
async function invocarGeminiIA(briefing, cat, subcat) {
    const texto = briefing.toLowerCase();
    
    // Insumos lidos (Fallback genérico se não tiver upload)
    const urlLogo = assetsCarregados.imagens.length > 0 ? assetsCarregados.imagens[0] : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Health_icon.svg/1024px-Health_icon.svg.png";
    const urlHero = assetsCarregados.imagens.length > 1 ? assetsCarregados.imagens[1] : (assetsCarregados.imagens[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80");

    const isSaude = texto.includes('exame') || texto.includes('jejum') || texto.includes('médico') || texto.includes('paciente') || texto.includes('consulta');
    
    // Definição de Marca/Tema
    let nomeMarca = isSaude ? "dr.consulta" : "Nossa Marca";
    let tema = isSaude 
        ? { titleColor: "#3A10E0", btnBg: "#3A10E0", btnColor: "#ffffff" } 
        : { titleColor: "#111827", btnBg: "#000000", btnColor: "#ffffff" };

    // Bases de Copy Dinâmica Baseada na Categoria/Subcategoria
    let emailAssunto = ""; let emailTitle = ""; let emailCorpo = ""; let emailCta = "SABER MAIS";
    let wppMsg = ""; let smsMsg = ""; let pushTitle = ""; let pushMsg = "";

    if (cat === 'Transacional') {
        emailAssunto = `Atualização: ${subcat} - ${nomeMarca}`;
        emailTitle = "Aviso Importante";
        emailCorpo = `Olá!\n\nTemos uma atualização importante referente a: ${subcat}.\n\nPor favor, acesse sua conta no botão abaixo para verificar todos os detalhes com segurança.`;
        emailCta = "ACESSAR DETALHES";
        wppMsg = `Olá! 🔒 Passando para informar uma atualização da ${nomeMarca} sobre: ${subcat}.\nAcesse seu app para mais detalhes.`;
        smsMsg = `${nomeMarca}: Aviso sobre ${subcat}. Acesse sua conta para verificar os detalhes.`;
        pushTitle = "Atualização Importante 🔒"; pushMsg = `Verifique novidades sobre ${subcat}.`;
        
        if(subcat.includes('pedido')) {
            emailAssunto = "O seu pedido está a caminho! 🚚";
            emailTitle = "Acompanhe a sua entrega";
            emailCorpo = "Boas notícias! O seu pacote acabou de sair do nosso centro de distribuição e já está a caminho.\n\nFique atento(a) para receber nas próximas horas.";
            emailCta = "RASTREAR PEDIDO";
            wppMsg = `Olá! 📦 Boas notícias da ${nomeMarca}: seu pedido saiu para entrega e chegará em breve!`;
        }
    } 
    else if (cat === 'Lifecycle') {
        if(subcat.includes('Boas-vindas')) {
            emailAssunto = `Bem-vindo(a) à ${nomeMarca}! 🎉`;
            emailTitle = "Temos o prazer de ter você aqui.";
            emailCorpo = isSaude 
                ? "Agora você faz parte da rede de saúde que mais cresce. Cuidar de você é o nosso compromisso.\n\nConheça nossos exames, telemedicina e assinaturas com condições especiais."
                : "Sua jornada com a gente acaba de começar. Descubra benefícios exclusivos, navegue pelas nossas categorias e aproveite 10% OFF na sua primeira compra.";
            emailCta = "COMEÇAR AGORA";
            wppMsg = `Olá! 👋 Seja muito bem-vindo(a) à ${nomeMarca}. Estamos muito felizes em ter você aqui. Precisando, é só chamar!`;
            smsMsg = `Bem-vindo(a) a ${nomeMarca}! Acesse nosso site e descubra as vantagens de ser cliente.`;
            pushTitle = "Bem-vindo(a)! 🎉"; pushMsg = "Comece a explorar todos os nossos benefícios.";
        } 
        else if (subcat.includes('Abandonada')) {
            emailAssunto = "Deixou algo para trás? 🛒";
            emailTitle = "Não perca sua seleção!";
            emailCorpo = isSaude 
                ? "Notamos que você iniciou o agendamento, mas não concluiu. A sua saúde não pode esperar! Retome de onde parou de forma rápida e prática."
                : "Os itens no seu carrinho estão te esperando. Garanta suas escolhas antes que os estoques acabem. Volte e finalize sua compra hoje.";
            emailCta = isSaude ? "CONTINUAR AGENDAMENTO" : "VOLTAR AO CARRINHO";
            wppMsg = `Oi! 🛒 Vimos que você esqueceu algo na ${nomeMarca}. Que tal voltar e finalizar agora mesmo com segurança?`;
            smsMsg = `${nomeMarca}: Seu carrinho esta aguardando! Finalize agora para garantir seus itens.`;
            pushTitle = "Você esqueceu algo! 🛒"; pushMsg = "Volte e finalize seu processo em 1 clique.";
        }
        else {
            // Reativação / Comemorativas Genéricas
            emailAssunto = `Especial para você - ${nomeMarca}`;
            emailTitle = subcat;
            emailCorpo = `Preparamos algo muito especial para este momento: ${subcat}.\n\nAproveite as condições únicas que separamos para celebrar com você.`;
            wppMsg = `Olá! ✨ Preparamos algo especial na ${nomeMarca} focado em: ${subcat}. Venha conferir!`;
            smsMsg = `${nomeMarca}: Condicoes unicas de ${subcat} para voce. Acesse nosso site.`;
            pushTitle = "Oferta Especial ✨"; pushMsg = `Confira as novidades para ${subcat}.`;
        }
    }
    else if (cat === 'Pesquisa') {
        emailAssunto = "Queremos ouvir a sua opinião!";
        emailTitle = "Como foi sua experiência?";
        emailCorpo = `A sua opinião é fundamental para a ${nomeMarca} continuar melhorando.\n\nLeva menos de 1 minuto para responder nossa pesquisa de ${subcat}. Agradecemos muito o seu tempo!`;
        emailCta = "RESPONDER PESQUISA";
        wppMsg = `Olá! 📊 Para continuarmos melhorando, gostaríamos de ouvir você. Leva só 1 minutinho para avaliar a ${nomeMarca}. Podemos contar com você?`;
        smsMsg = `${nomeMarca}: Como foi sua experiencia? Acesse o link e deixe sua avaliacao rapida!`;
        pushTitle = "Avalie sua experiência ⭐"; pushMsg = "Sua opinião nos ajuda a melhorar. Participe!";
    }
    else {
        // Fallback robusto para Promocional, Relacionamento, Operacional...
        // Se for Saúde e contiver as palavras "exame/jejum", injeta o texto que tínhamos de match perfeito
        if (isSaude && texto.includes('jejum')) {
            emailAssunto = "Atenção ao preparo: Seu exame é amanhã";
            emailTitle = "Importante: Orientações para o seu exame";
            emailCorpo = `Para garantir a qualidade técnica e evitar reagendamentos da sua consulta, é essencial seguir rigorosamente as orientações abaixo:\n\n✔️ Jejum mínimo de 4 horas antes do exame.\n✔️ A ingestão moderada de água é permitida.\n✔️ Suas medicações habituais podem ser tomadas com pouca água.\n\n⚠️ Documentos Obrigatórios:\nNão esqueça de levar um documento oficial com foto e CPF.\n\nChegue com antecedência ao ${nomeMarca}.`;
            emailCta = "VER DETALHES DO EXAME";
            wppMsg = `Olá! 🏥 Lembrete assistencial da ${nomeMarca}: Seu exame é amanhã.\n\n⚠️ *PREPARO OBRIGATÓRIO:*\n• Jejum mínimo de 4 horas.\n• Água moderada é permitida.\n• Remédios de rotina podem ser tomados.\n\n📄 Traga documento com foto e CPF.\nNos vemos amanhã!`;
            smsMsg = `${nomeMarca}: Lembrete do seu exame amanha. Necessario jejum de 4h (agua permitida). Traga doc original c/ foto e CPF.`;
            pushTitle = `${nomeMarca}: Exame Amanhã! ⏰`; pushMsg = "Confira as orientações obrigatórias de jejum de 4h.";
        } else {
            emailAssunto = `Novidade da ${nomeMarca}: ${subcat}`;
            emailTitle = subcat;
            emailCorpo = `Elaboramos esta comunicação focada nos nossos objetivos de ${cat}.\n\nAo focar em ${subcat}, garantimos que você receba sempre o conteúdo mais relevante e as melhores oportunidades da ${nomeMarca}.`;
            emailCta = "CONFERIR AGORA";
            wppMsg = `Olá! 🚀 Trazendo atualizações da ${nomeMarca} sobre ${subcat}. Acesse o link para saber mais detalhes!`;
            smsMsg = `${nomeMarca}: Novidades sobre ${subcat}. Acesse e confira os detalhes em primeira mao.`;
            pushTitle = "Novidade Fresquinha 🚀"; pushMsg = `Veja agora as atualizações de ${subcat}.`;
        }
    }

    return {
        Email: { assunto: emailAssunto, title: emailTitle, corpo: emailCorpo, cta: emailCta, tema: tema, logoUrl: urlLogo, heroUrl: urlHero },
        WhatsApp: { msg: wppMsg, enviarImagem: true, mediaUrl: urlHero, logoUrl: urlLogo },
        SMS: { msg: smsMsg, logoUrl: urlLogo },
        WebPush: { titulo: pushTitle, msg: pushMsg, logoUrl: urlLogo }
    };
}

// ==========================================
// PROCESSAMENTO GERAL
// ==========================================
async function processarComIA() {
    canaisSelecionados = Array.from(document.querySelectorAll('input[name="canais"]:checked')).map(cb => cb.value);
    briefingAtual = document.getElementById('input-briefing').value;
    
    const catSelect = document.getElementById('select-categoria');
    const subCatSelect = document.getElementById('select-subcategoria');
    
    if(!catSelect.value || !subCatSelect.value) {
        alert("Por favor, selecione a Categoria e o Tipo de Comunicação (Step 1).");
        return;
    }
    categoriaSelecionada = catSelect.value;
    subcategoriaSelecionada = subCatSelect.value;

    if(canaisSelecionados.length === 0) { alert("Selecione pelo menos um canal."); return; }

    document.getElementById('loading-overlay').classList.remove('hidden-step');
    document.getElementById('loading-text').innerHTML = `Processando lógica de ${categoriaSelecionada} (${subcategoriaSelecionada})...<br>Extraindo paleta de cores e logos fiéis...`;
    
    conteudoGeradoIA = await invocarGeminiIA(briefingAtual, categoriaSelecionada, subcategoriaSelecionada);

    setTimeout(() => {
        configurarEstudioMulticanal();
        document.getElementById('loading-overlay').classList.add('hidden-step');
        goToStep(2);
    }, 2500);
}

// ==========================================
// ESTÚDIO MULTICANAL E RENDERING DE ALTA FIDELIDADE
// ==========================================
function configurarEstudioMulticanal() {
    const tabsContainer = document.getElementById('channel-tabs');
    tabsContainer.innerHTML = '';

    canaisSelecionados.forEach((canal, index) => {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 font-bold text-sm border-b-2 transition ${index === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`;
        btn.innerText = canal;
        btn.onclick = () => alternarCanal(canal, btn);
        tabsContainer.appendChild(btn);
    });

    if(canaisSelecionados.length > 0) alternarCanal(canaisSelecionados[0], tabsContainer.firstChild);
}

function alternarCanal(canal, btnElement) {
    canalAtivo = canal;
    
    Array.from(document.getElementById('channel-tabs').children).forEach(btn => {
        btn.classList.remove('border-blue-600', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    btnElement.classList.add('border-blue-600', 'text-blue-600');

    const copyContainer = document.getElementById('copy-fields-container');
    document.querySelectorAll('.preview-channel').forEach(el => el.classList.add('hidden'));

    const chaveIA = canal.replace(' ', ''); 
    const dados = conteudoGeradoIA[chaveIA] || conteudoGeradoIA['Email'];

    if (canal === 'Email') {
        document.getElementById('preview-email').classList.remove('hidden');
        
        copyContainer.innerHTML = `
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Assunto do E-mail</label>
                <input type="text" id="ia-assunto" class="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 text-sm font-bold text-gray-800" value="${dados.assunto}">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Título Interno (H1)</label>
                <input type="text" id="ia-title" class="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 text-sm font-bold text-gray-800" value="${dados.title}" oninput="sincronizarCopy()">
            </div>
            <div class="flex-1 flex flex-col min-h-[150px]">
                <label class="block text-xs font-bold text-gray-500 mb-1">Corpo do E-mail</label>
                <textarea id="ia-corpo" class="w-full flex-1 border border-gray-300 rounded-md p-3 bg-white text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed" oninput="sincronizarCopy()">${dados.corpo}</textarea>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Botão (CTA)</label>
                <input type="text" id="ia-cta" class="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 text-sm font-bold text-blue-600 uppercase" value="${dados.cta}" oninput="sincronizarCopy()">
            </div>
        `;
        
        const root = document.documentElement;
        root.style.setProperty('--title-color', dados.tema.titleColor);
        root.style.setProperty('--btn-bg', dados.tema.btnBg);
        root.style.setProperty('--btn-color', dados.tema.btnColor);

        document.getElementById('preview-logo-img').src = dados.logoUrl;
        document.getElementById('preview-hero-img').src = dados.heroUrl;
        
        sincronizarCopy();
    } 
    else if (canal === 'WhatsApp') {
        document.getElementById('preview-whatsapp').classList.remove('hidden');
        document.getElementById('wpp-logo').src = dados.logoUrl;
        document.querySelector('#preview-whatsapp span.font-semibold').innerText = dados.msg.includes('dr.consulta') ? 'dr.consulta' : 'Conta Comercial';
        
        const mediaContainer = document.getElementById('wpp-media-container');
        if(dados.enviarImagem) {
            mediaContainer.classList.remove('hidden');
            document.getElementById('wpp-media-img').src = dados.mediaUrl;
        } else {
            mediaContainer.classList.add('hidden');
        }

        copyContainer.innerHTML = `
            <div class="flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-2">Mensagem (Formatação WhatsApp suportada)</label>
                <textarea id="ia-whatsapp-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm h-[200px]" oninput="sincronizarCopy()">${dados.msg}</textarea>
            </div>
        `;
        sincronizarCopy();
    }
    else if (canal === 'SMS') {
        document.getElementById('preview-sms').classList.remove('hidden');
        document.getElementById('sms-logo').src = dados.logoUrl;
        document.querySelector('#preview-sms span.font-semibold').innerText = dados.msg.includes('dr.consulta') ? 'dr.consulta' : 'SMS Corporativo';

        copyContainer.innerHTML = `
            <div class="flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-2">Mensagem SMS (Atenção ao limite de 160 caracteres)</label>
                <textarea id="ia-sms-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm h-[150px]" oninput="sincronizarCopy()">${dados.msg}</textarea>
                <span class="text-[10px] text-gray-500 mt-1 text-right" id="sms-counter">0/160</span>
            </div>
        `;
        sincronizarCopy();
    }
    else if (canal === 'Web Push' || canal === 'App Push') {
        document.getElementById('preview-push').classList.remove('hidden');
        document.getElementById('push-logo').src = dados.logoUrl;
        document.querySelector('#preview-push span.font-semibold').innerText = dados.msg.includes('dr.consulta') ? 'App dr.consulta' : 'Aplicativo';

        copyContainer.innerHTML = `
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Título do Push</label>
                <input type="text" id="ia-push-title" class="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 text-sm font-bold text-gray-800" value="${dados.titulo}" oninput="sincronizarCopy()">
            </div>
            <div class="flex-1 flex flex-col mt-4">
                <label class="block text-xs font-bold text-gray-500 mb-2">Corpo da Notificação</label>
                <textarea id="ia-push-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm h-[100px]" oninput="sincronizarCopy()">${dados.msg}</textarea>
            </div>
        `;
        sincronizarCopy();
    }
}

function sincronizarCopy() {
    if(canalAtivo === 'Email' && document.getElementById('preview-email-title')) {
        document.getElementById('preview-email-title').innerText = document.getElementById('ia-title').value;
        document.getElementById('preview-email-text').innerText = document.getElementById('ia-corpo').value;
        document.getElementById('preview-email-btn').innerText = document.getElementById('ia-cta').value;
    }
    if(canalAtivo === 'WhatsApp' && document.getElementById('preview-whatsapp-text')) {
        document.getElementById('preview-whatsapp-text').innerText = document.getElementById('ia-whatsapp-msg').value;
    }
    if(canalAtivo === 'SMS' && document.getElementById('preview-sms-text')) {
        const txt = document.getElementById('ia-sms-msg').value;
        document.getElementById('preview-sms-text').innerText = txt;
        document.getElementById('sms-counter').innerText = `${txt.length}/160`;
        document.getElementById('sms-counter').style.color = txt.length > 160 ? 'red' : 'gray';
    }
    if((canalAtivo === 'Web Push' || canalAtivo === 'App Push') && document.getElementById('preview-push-title')) {
        document.getElementById('preview-push-title').innerText = document.getElementById('ia-push-title').value;
        document.getElementById('preview-push-text').innerText = document.getElementById('ia-push-msg').value;
    }
}

// ==========================================
// CHAT GEMINI - FUNCIONALIDADE
// ==========================================
function enviarMensagemChat() {
    const inputEl = document.getElementById('chat-input');
    const mensagem = inputEl.value.trim();
    if (!mensagem) return;

    const chatHistory = document.getElementById('chat-history');
    if(chatHistory) {
        chatHistory.innerHTML += `<div class="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-tr-none self-end max-w-[90%] shadow-sm">${mensagem}</div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    inputEl.value = '';

    const idPensando = 'msg-' + Date.now();
    if(chatHistory) {
        chatHistory.innerHTML += `<div id="${idPensando}" class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] opacity-70 animate-pulse">Ajustando criativo...</div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    setTimeout(() => {
        const pensandoEl = document.getElementById(idPensando);
        if(pensandoEl) pensandoEl.remove();

        let respostaIA = "Pronto! O ajuste foi aplicado no preview considerando seu pedido.";
        const msgLower = mensagem.toLowerCase();

        if (canalAtivo === 'Email') {
            const tituloEl = document.getElementById('ia-title');
            const corpoEl = document.getElementById('ia-corpo');
            if(tituloEl && corpoEl) {
                if (msgLower.includes('urgente') || msgLower.includes('atenção')) {
                    tituloEl.value = "⚠️ " + tituloEl.value;
                    corpoEl.value = "Atenção necessária!\n\n" + corpoEl.value + "\n\nPor favor, aja o mais rápido possível.";
                } else if (msgLower.includes('curto') || msgLower.includes('resuma')) {
                    corpoEl.value = "Resumo da comunicação:\n\n✔️ Detalhe importante 1\n✔️ Detalhe importante 2\n\nAcesse o link para mais informações!";
                } else {
                    corpoEl.value = corpoEl.value + "\n\n[Texto Adicionado]: " + mensagem;
                }
            }
        } else if (canalAtivo === 'WhatsApp') {
            const wppEl = document.getElementById('ia-whatsapp-msg');
            if(wppEl) {
                if (msgLower.includes('urgente')) {
                    wppEl.value = "🚨 *MENSAGEM URGENTE*\n\n" + wppEl.value;
                } else if (msgLower.includes('curto')) {
                    wppEl.value = `Olá! ⚡ Este é um lembrete rápido sobre: ${subcategoriaSelecionada}. Acesse o app para detalhes.`;
                } else {
                    wppEl.value += "\n\n" + mensagem;
                }
            }
        } else if (canalAtivo === 'SMS') {
            const smsEl = document.getElementById('ia-sms-msg');
            if(smsEl) smsEl.value = "AVISO: " + smsEl.value;
        } else if (canalAtivo === 'Web Push' || canalAtivo === 'App Push') {
            const pushEl = document.getElementById('ia-push-msg');
            if(pushEl) pushEl.value += " 🚨";
        }

        sincronizarCopy();

        if(chatHistory) {
            chatHistory.innerHTML += `<div class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">${respostaIA}</div>`;
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }, 1200);
}

// ==========================================
// UPLOADS, LINKS E PRINTS (STEP 1)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-insumos');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            processarUploadsInsumos(e.target.files);
        });
    }

    document.addEventListener('paste', function(e) {
        if (currentStep !== 1) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let files = [];
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                files.push(item.getAsFile());
            }
        }
        if(files.length > 0) processarUploadsInsumos(files);
    });

    const linkInput = document.getElementById('input-insumo-link');
    if(linkInput) {
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarLinkInsumo();
            }
        });
    }

    const chatInput = document.getElementById('chat-input');
    if(chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagemChat();
            }
        });
    }
});

function processarUploadsInsumos(filesArray) {
    const files = Array.from(filesArray);
    const label = document.getElementById('label-insumos-arquivos');
    const thumbContainer = document.getElementById('thumbnails-container');
    
    if(files.length > 0) {
        label.innerHTML = `${assetsCarregados.imagens.length + files.length} arquivo(s) inserido(s) com sucesso! ✅<br><span class="text-xs text-green-700">Imagens/Prints guardados para a IA</span>`;
        label.classList.replace('text-blue-900', 'text-green-600');
        
        files.forEach(file => {
            if(file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                assetsCarregados.imagens.push(url);
                
                const img = document.createElement('img');
                img.src = url;
                img.className = "w-12 h-12 object-cover rounded border border-gray-300 shadow-sm";
                if(thumbContainer) thumbContainer.appendChild(img);
            }
        });
    }
}

function adicionarLinkInsumo() {
    const inputUrl = document.getElementById('input-insumo-link');
    const url = inputUrl.value.trim();
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (url && urlPattern.test(url) && !linksInsumos.includes(url)) {
        const urlFinal = url.startsWith('http') ? url : `https://${url}`;
        linksInsumos.push(urlFinal);
        atualizarListaLinks();
        inputUrl.value = ''; 
    } else if (!urlPattern.test(url) && url !== "") {
        alert("Por favor, insira um link válido.");
    }
}

function removerLinkInsumo(index) {
    linksInsumos.splice(index, 1);
    atualizarListaLinks();
}

function atualizarListaLinks() {
    const container = document.getElementById('lista-links-insumos');
    if (!container) return;
    
    container.innerHTML = '';
    
    linksInsumos.forEach((link, index) => {
        let domain = link;
        try { domain = new URL(link).hostname.replace('www.', ''); } catch(e) {}
        
        container.innerHTML += `
            <div class="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <a href="${link}" target="_blank" class="truncate max-w-[150px] hover:text-blue-600 hover:underline">${domain}</a>
                <button type="button" onclick="removerLinkInsumo(${index})" class="text-gray-400 hover:text-red-500 ml-1 transition">✖</button>
            </div>
        `;
    });
}

// ==========================================
// EXPORTAÇÃO (STEP 3) - INTACTO
// ==========================================
function gerarTelaExportacao() {
    const container = document.getElementById('export-container');
    if (!container) return;
    container.innerHTML = ''; 

    canaisSelecionados.forEach(canal => {
        let content = '';
        const chaveIA = canal.replace(' ', '');
        const dados = conteudoGeradoIA[chaveIA] || conteudoGeradoIA['Email'];

        if(canal === 'Email') {
            const htmlCode = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; font-family: Arial, sans-serif;">
  <tr>
    <td align="center" style="padding: 40px 0;">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e7eb;">
        <tr>
          <td align="center" style="padding: 24px; border-bottom: 1px solid #f3f4f6;">
            <img src="${dados.logoUrl}" alt="Logo" style="max-height: 50px;">
          </td>
        </tr>
        ${dados.heroUrl ? `
        <tr>
          <td>
            <img src="${dados.heroUrl}" alt="Banner" style="width: 100%; max-height: 280px; object-fit: cover; display: block;">
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding: 40px;">
            <h1 style="color: ${dados.tema.titleColor}; font-size: 22px; margin-bottom: 20px;">${document.getElementById('ia-title') ? document.getElementById('ia-title').value : dados.title}</h1>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${document.getElementById('ia-corpo') ? document.getElementById('ia-corpo').value : dados.corpo}</p>
            <div style="text-align: center; margin-top: 40px;">
              <a href="#" style="background-color: ${dados.tema.btnBg}; color: ${dados.tema.btnColor}; padding: 16px 40px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">${document.getElementById('ia-cta') ? document.getElementById('ia-cta').value : dados.cta}</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

            content = `
                <div class="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">📧 E-mail Exportado</h3>
                    <div class="flex gap-6">
                        
                        <div class="w-1/3 flex flex-col gap-6">
                            <div>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Preview Visual</span>
                                <div class="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative h-[250px] shadow-inner">
                                    <iframe srcdoc="${htmlCode.replace(/"/g, '&quot;')}" class="w-full h-full transform scale-[0.5] origin-top-left" style="width: 200%; height: 200%; border: none;"></iframe>
                                </div>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Imagens Fatiadas (Assets)</span>
                                <div class="flex gap-2 flex-wrap">
                                    ${dados.logoUrl ? `
                                    <div class="w-16 h-16 border border-gray-200 rounded bg-white p-1 flex flex-col items-center justify-center relative group shadow-sm">
                                        <img src="${dados.logoUrl}" class="max-w-full max-h-full object-contain">
                                        <a href="${dados.logoUrl}" download="logo_email.png" class="absolute inset-0 bg-black/70 hidden group-hover:flex items-center justify-center rounded text-white text-xs font-bold backdrop-blur-sm transition cursor-pointer" title="Baixar Asset">⬇️</a>
                                    </div>` : ''}
                                    ${dados.heroUrl ? `
                                    <div class="w-16 h-16 border border-gray-200 rounded bg-white p-1 flex flex-col items-center justify-center relative group shadow-sm">
                                        <img src="${dados.heroUrl}" class="max-w-full max-h-full object-cover rounded-sm">
                                        <a href="${dados.heroUrl}" download="banner_hero.png" class="absolute inset-0 bg-black/70 hidden group-hover:flex items-center justify-center rounded text-white text-xs font-bold backdrop-blur-sm transition cursor-pointer" title="Baixar Asset">⬇️</a>
                                    </div>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="w-2/3 flex flex-col">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Código HTML Pronto</span>
                            <textarea id="export-html-code" class="w-full flex-1 border border-gray-300 rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-xs focus:outline-none mb-3 shadow-inner" readonly>${htmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                            <button onclick="copiarTexto('export-html-code')" class="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm self-end px-8">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Copiar HTML Completo
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let elId = "";
            let msgExport = "";
            let icone = canal === 'WhatsApp' ? '💬' : (canal === 'SMS' ? '📱' : '🔔');
            
            if (canal === 'WhatsApp') { elId = 'ia-whatsapp-msg'; }
            else if (canal === 'SMS') { elId = 'ia-sms-msg'; }
            else if (canal === 'Web Push' || canal === 'App Push') { elId = 'ia-push-msg'; }

            if (document.getElementById(elId)) {
                msgExport = document.getElementById(elId).value;
                if (canal === 'Web Push' || canal === 'App Push') {
                    const pushTitle = document.getElementById('ia-push-title').value;
                    msgExport = `Título: ${pushTitle}\n\nMensagem: ${msgExport}`;
                }
            } else {
                msgExport = (canal === 'Web Push' || canal === 'App Push') ? `Título: ${dados.titulo}\n\nMensagem: ${dados.msg}` : dados.msg;
            }

            content = `
                <div class="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">${icone} ${canal} Exportado</h3>
                    <div class="flex gap-6">
                        
                        <div class="w-1/3 flex flex-col gap-6">
                            <div>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Mini Preview</span>
                                <div class="border border-gray-200 bg-gray-100 rounded-lg p-4 h-[180px] overflow-y-auto text-sm whitespace-pre-wrap flex flex-col shadow-inner">
                                    ${dados.enviarImagem && dados.mediaUrl ? `<img src="${dados.mediaUrl}" class="w-full h-20 object-cover rounded-md mb-2 shadow-sm">` : ''}
                                    <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-gray-800 leading-snug">${msgExport}</div>
                                </div>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Imagens Fatiadas (Assets)</span>
                                <div class="flex gap-2 flex-wrap">
                                    ${dados.logoUrl ? `
                                    <div class="w-16 h-16 border border-gray-200 rounded bg-white p-1 flex flex-col items-center justify-center relative group shadow-sm" title="Logo">
                                        <img src="${dados.logoUrl}" class="max-w-full max-h-full object-contain">
                                        <a href="${dados.logoUrl}" download="logo_${chaveIA}.png" class="absolute inset-0 bg-black/70 hidden group-hover:flex items-center justify-center rounded text-white text-xs font-bold backdrop-blur-sm transition cursor-pointer">⬇️</a>
                                    </div>` : ''}
                                    ${dados.enviarImagem && dados.mediaUrl ? `
                                    <div class="w-16 h-16 border border-gray-200 rounded bg-white p-1 flex flex-col items-center justify-center relative group shadow-sm" title="Imagem Anexa">
                                        <img src="${dados.mediaUrl}" class="max-w-full max-h-full object-cover rounded-sm">
                                        <a href="${dados.mediaUrl}" download="media_${chaveIA}.png" class="absolute inset-0 bg-black/70 hidden group-hover:flex items-center justify-center rounded text-white text-xs font-bold backdrop-blur-sm transition cursor-pointer">⬇️</a>
                                    </div>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="w-2/3 flex flex-col">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Texto Final Formatado</span>
                            <textarea id="export-txt-${chaveIA}" class="w-full flex-1 border border-gray-300 rounded-lg p-4 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 shadow-inner" readonly>${msgExport}</textarea>
                            <button onclick="copiarTexto('export-txt-${chaveIA}')" class="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm self-end px-8">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Copiar Texto
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML += content;
    });
}

function copiarTexto(elementId) {
    const el = document.getElementById(elementId);
    if(el) {
        el.select();
        document.execCommand('copy');
        alert('Copiado para a área de transferência com sucesso!');
    }
}
