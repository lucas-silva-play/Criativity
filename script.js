// ==========================================
// VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let currentStep = 1;
let canaisSelecionados = [];
let briefingAtual = "";
let canalAtivo = "";

// Armazena URLs de imagens lidas no Step 1 e os links adicionados
let assetsCarregados = { imagens: [] };
let linksInsumos = []; 

// Objeto que armazenará a resposta dinâmica da IA
let conteudoGeradoIA = {};

// ==========================================
// NAVEGAÇÃO E FLUXO PRINCIPAL
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
    }
    updateBadges();
}

function goBack() { if (currentStep > 1) goToStep(currentStep - 1); }

// ==========================================
// INTEGRAÇÃO GEMINI (SIMULADOR INTELIGENTE MULTICANAL)
// ==========================================
async function invocarGeminiIA(briefing) {
    const texto = briefing.toLowerCase();
    
    // Insumos lidos (Usa fallback de mercado se o usuário não fizer upload)
    const urlLogo = assetsCarregados.imagens.length > 0 ? assetsCarregados.imagens[0] : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Health_icon.svg/1024px-Health_icon.svg.png";
    const urlHero = assetsCarregados.imagens.length > 1 ? assetsCarregados.imagens[1] : (assetsCarregados.imagens[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80");

    // CASO 1: Cenário Assistencial/Médico/Exames
    if (texto.includes('exame') || texto.includes('jejum') || texto.includes('médico') || texto.includes('paciente')) {
        return {
            Email: {
                assunto: "Atenção ao preparo: Seu exame é amanhã",
                title: "Importante: Orientações para o seu exame",
                corpo: `Para garantir a qualidade técnica e evitar reagendamentos da sua consulta, é essencial seguir rigorosamente as orientações abaixo:\n\n✔️ Jejum mínimo de 4 horas antes do exame.\n✔️ A ingestão moderada de água é permitida.\n✔️ Suas medicações habituais podem ser tomadas com pouca água.\n\n⚠️ Documentos Obrigatórios:\nNão esqueça de levar um documento oficial com foto e CPF.\n\nChegue com antecedência ao nosso Centro Médico.`,
                cta: "VER DETALHES E ENDEREÇO",
                tema: { titleColor: "#d32f2f", btnBg: "#005b96", btnColor: "#ffffff" },
                logoUrl: urlLogo,
                heroUrl: urlHero
            },
            WhatsApp: {
                msg: "Olá! 🏥 Lembrete assistencial: Seu exame é amanhã.\n\n⚠️ *PREPARO OBRIGATÓRIO:*\n• Jejum mínimo de 4 horas.\n• Água moderada é permitida.\n• Remédios de rotina podem ser tomados.\n\n📄 Traga documento com foto e CPF.\nNos vemos amanhã!",
                enviarImagem: true,
                mediaUrl: urlHero,
                logoUrl: urlLogo
            },
            SMS: {
                msg: "Centro Medico: Lembrete do seu exame amanha. Necessario jejum de 4h (agua permitida). Traga doc original c/ foto e CPF.",
                logoUrl: urlLogo
            },
            WebPush: {
                titulo: "Seu exame é amanhã! ⏰",
                msg: "Confira as orientações obrigatórias de jejum de 4 horas para a realização do seu exame.",
                logoUrl: urlLogo
            }
        };
    } 
    // CASO 2: Varejo / Genérico
    else {
        return {
            Email: {
                assunto: "Acesso VIP liberado: Condições exclusivas",
                title: "O seu estilo não espera.",
                corpo: "Notamos que o seu estilo está em alta!\n\nCom base nas suas preferências, separamos peças exclusivas que acabaram de chegar. O homem em movimento está sempre um passo à frente.\n\nGaranta as suas escolhas hoje com vantagens únicas para clientes VIP.",
                cta: "GARANTIR COLEÇÃO",
                tema: { titleColor: "#111827", btnBg: "#000000", btnColor: "#ffffff" },
                logoUrl: urlLogo,
                heroUrl: urlHero
            },
            WhatsApp: {
                msg: "Olá! ✨ As novidades da nossa marca já estão disponíveis.\n\nVenha garantir suas peças exclusivas antes que acabem! 👗🛍️\nAcesse nosso catálogo VIP: link.com/loja",
                enviarImagem: true,
                mediaUrl: urlHero,
                logoUrl: urlLogo
            },
            SMS: {
                msg: "Marca VIP: Nova Colecao liberada! Garanta suas pecas com 10% OFF usando o codigo VIP10. Acesse link.com/loja",
                logoUrl: urlLogo
            },
            WebPush: {
                titulo: "Coleção Exclusiva Liberada! ✨",
                msg: "Acesse agora e garanta 10% OFF nas novidades do catálogo.",
                logoUrl: urlLogo
            }
        };
    }
}

// ==========================================
// PROCESSAMENTO GERAL
// ==========================================
async function processarComIA() {
    canaisSelecionados = Array.from(document.querySelectorAll('input[name="canais"]:checked')).map(cb => cb.value);
    briefingAtual = document.getElementById('input-briefing').value;

    if(canaisSelecionados.length === 0) { alert("Selecione pelo menos um canal."); return; }
    if(briefingAtual.trim() === "") { alert("Insira o briefing para a IA analisar."); return; }

    document.getElementById('loading-overlay').classList.remove('hidden-step');
    
    conteudoGeradoIA = await invocarGeminiIA(briefingAtual);

    setTimeout(() => {
        configurarEstudioMulticanal();
        document.getElementById('loading-overlay').classList.add('hidden-step');
        goToStep(2);
    }, 2000);
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

    const chaveIA = canal.replace(' ', ''); // Trata "Web Push" -> "WebPush"
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
            <div class="flex-1 flex flex-col min-h-[200px]">
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
                <textarea id="ia-whatsapp-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" oninput="sincronizarCopy()">${dados.msg}</textarea>
            </div>
        `;
        sincronizarCopy();
    }
    else if (canal === 'SMS') {
        document.getElementById('preview-sms').classList.remove('hidden');
        document.getElementById('sms-logo').src = dados.logoUrl;

        copyContainer.innerHTML = `
            <div class="flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-2">Mensagem SMS (Atenção ao limite de 160 caracteres)</label>
                <textarea id="ia-sms-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" oninput="sincronizarCopy()">${dados.msg}</textarea>
                <span class="text-[10px] text-gray-500 mt-1 text-right" id="sms-counter">0/160</span>
            </div>
        `;
        sincronizarCopy();
    }
    else if (canal === 'Web Push' || canal === 'App Push') {
        document.getElementById('preview-push').classList.remove('hidden');
        document.getElementById('push-logo').src = dados.logoUrl;

        copyContainer.innerHTML = `
            <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Título do Push</label>
                <input type="text" id="ia-push-title" class="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 text-sm font-bold text-gray-800" value="${dados.titulo}" oninput="sincronizarCopy()">
            </div>
            <div class="flex-1 flex flex-col mt-4">
                <label class="block text-xs font-bold text-gray-500 mb-2">Corpo da Notificação</label>
                <textarea id="ia-push-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" oninput="sincronizarCopy()">${dados.msg}</textarea>
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
// UPLOADS E LINKS (STEP 1) - CORRIGIDO
// ==========================================

// 1. Upload de Imagens
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-insumos');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const label = document.getElementById('label-insumos-arquivos');
            const thumbContainer = document.getElementById('thumbnails-container');
            
            if(files.length > 0) {
                label.innerText = `${files.length} arquivo(s) preparado(s) para a IA ✅`;
                label.classList.replace('text-blue-900', 'text-green-600');
                
                files.forEach(file => {
                    if(file.type.startsWith('image/')) {
                        const url = URL.createObjectURL(file);
                        assetsCarregados.imagens.push(url);
                        
                        const img = document.createElement('img');
                        img.src = url;
                        img.className = "w-12 h-12 object-cover rounded border border-gray-300 shadow-sm";
                        thumbContainer.appendChild(img);
                    }
                });
            }
        });
    }

    // 2. Listener do Enter para inclusão de Links
    const linkInput = document.getElementById('input-insumo-link');
    if(linkInput) {
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarLinkInsumo();
            }
        });
    }
});

// 3. Funções de Inclusão/Remoção de Links
function adicionarLinkInsumo() {
    const inputUrl = document.getElementById('input-insumo-link');
    const url = inputUrl.value.trim();
    
    // Validação regex simples de URL
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (url && urlPattern.test(url) && !linksInsumos.includes(url)) {
        const urlFinal = url.startsWith('http') ? url : `https://${url}`;
        linksInsumos.push(urlFinal);
        atualizarListaLinks();
        inputUrl.value = ''; // Limpa o campo
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
        try { 
            domain = new URL(link).hostname.replace('www.', ''); 
        } catch(e) {}
        
        container.innerHTML += `
            <div class="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <a href="${link}" target="_blank" class="truncate max-w-[150px] hover:text-blue-600 hover:underline">${domain}</a>
                <button type="button" onclick="removerLinkInsumo(${index})" class="text-gray-400 hover:text-red-500 ml-1 transition">✖</button>
            </div>
        `;
    });
}
