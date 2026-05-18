// ==========================================
// VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let currentStep = 1;
let canaisSelecionados = [];
let briefingAtual = "";
let canalAtivo = "";

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
// INTEGRAÇÃO GEMINI (SIMULADOR INTELIGENTE)
// ==========================================
async function invocarGeminiIA(briefing) {
    const texto = briefing.toLowerCase();
    
    // CASO 1: Cenário Assistencial/Médico (Seu briefing)
    if (texto.includes('exame') || texto.includes('jejum') || texto.includes('paciente')) {
        return {
            Email: {
                assunto: "Importante: Orientações de preparo para o seu exame amanhã",
                corpo: `Seu exame está confirmado para amanhã!\n\nPara garantir a qualidade técnica e evitar reagendamentos, é essencial seguir as orientações abaixo:\n\n• Jejum mínimo de 4 horas antes do exame.\n• Ingestão moderada de água é permitida.\n• Suas medicações habituais podem ser tomadas com pouca água.\n\nDocumentos Obrigatórios:\nNão esqueça de levar um documento oficial com foto e CPF.\n\nChegue com antecedência ao Centro Médico.`,
                cta: "VER DETALHES DO AGENDAMENTO",
                
                usarImagemHero: false, 
                logo: "CENTRO MÉDICO",
                tema: {
                    headerBg: "#ffffff",
                    headerColor: "#005b96",
                    titleColor: "#d32f2f", // Alerta
                    btnBg: "#005b96",
                    btnColor: "#ffffff",
                    textAlign: "left"
                }
            },
            WhatsApp: {
                msg: "Olá! 🏥 Este é um lembrete assistencial: Seu exame é amanhã.\n\n⚠️ PREPARO OBRIGATÓRIO:\n- Jejum mínimo de 4 horas.\n- Pode beber água moderadamente.\n- Pode tomar seus remédios de rotina com pouca água.\n\n📄 Traga documento com foto e CPF.\nNos vemos amanhã!"
            },
            SMS: {
                msg: "Lembrete: Seu exame é amanhã. Necessário jejum de 4h (água permitida). Traga doc c/ foto e CPF. Acesse para detalhes: link.com/exame"
            },
            WebPush: {
                msg: "Seu exame é amanhã! Veja o preparo de jejum de 4h obrigatório."
            }
        };
    } 
    
    // CASO 2: Padrão (Varejo / Genérico)
    else {
        return {
            Email: {
                assunto: "Descubra a nova coleção exclusiva ✨",
                corpo: "Notamos que o seu estilo está em alta!\n\nCom base nas suas preferências, separamos peças exclusivas que acabaram de chegar na nossa loja. O carrinho foi guardado para você.",
                cta: "APROVEITAR COLEÇÃO",
                usarImagemHero: true,
                heroImgUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80",
                logo: "MINHA MARCA",
                tema: {
                    headerBg: "#ffffff",
                    headerColor: "#000000",
                    titleColor: "#000000",
                    btnBg: "#000000",
                    btnColor: "#ffffff",
                    textAlign: "center"
                }
            },
            WhatsApp: {
                msg: "Olá! ✨ As novidades da coleção já estão disponíveis.\n\nVenha garantir suas peças exclusivas antes que acabem! 👗🛍️\nAcesse: link.com/loja"
            },
            SMS: {
                msg: "Nova Coleção! Garanta suas peças com 10% OFF usando o código VIP10. Acesse link.com/loja"
            },
            WebPush: {
                msg: "Coleção exclusiva liberada! 10% OFF hoje."
            }
        };
    }
}

// ==========================================
// PROCESSAMENTO
// ==========================================
async function processarComIA() {
    canaisSelecionados = Array.from(document.querySelectorAll('input[name="canais"]:checked')).map(cb => cb.value);
    briefingAtual = document.getElementById('input-briefing').value;

    if(canaisSelecionados.length === 0) { alert("Selecione pelo menos um canal."); return; }
    if(briefingAtual.trim() === "") { alert("Insira o briefing para a IA analisar."); return; }

    document.getElementById('loading-overlay').classList.remove('hidden-step');
    document.getElementById('loading-text').innerText = "Gemini processando briefing e regras de negócio...";
    
    // Invoca o simulador do Gemini
    conteudoGeradoIA = await invocarGeminiIA(briefingAtual);

    setTimeout(() => {
        configurarEstudioMulticanal();
        document.getElementById('loading-overlay').classList.add('hidden-step');
        goToStep(2);
    }, 2500);
}

// ==========================================
// ESTÚDIO MULTICANAL
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

    const chaveIA = canal.replace(' ', ''); // Trata "Web Push" para "WebPush"
    const dados = conteudoGeradoIA[chaveIA] || conteudoGeradoIA['Email'];

    if (canal === 'Email') {
        document.getElementById('preview-email').classList.remove('hidden');
        
        copyContainer.innerHTML = `
            <div class="mb-4">
                <label class="block text-xs font-bold text-gray-500 mb-1">Assunto do E-mail</label>
                <input type="text" id="ia-assunto" class="w-full border-b focus:outline-none focus:border-blue-500 py-1 text-sm font-medium" value="${dados.assunto}" oninput="sincronizarCopy()">
            </div>
            <div class="mb-4 flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-1">Corpo do E-mail</label>
                <textarea id="ia-corpo" class="w-full flex-1 border rounded p-2 bg-gray-50 text-sm focus:outline-none" oninput="sincronizarCopy()">${dados.corpo}</textarea>
            </div>
            <div class="mb-2">
                <label class="block text-xs font-bold text-gray-500 mb-1">Botão (CTA)</label>
                <input type="text" id="ia-cta" class="w-full border-b focus:outline-none focus:border-blue-500 py-1 text-sm font-bold" value="${dados.cta}" oninput="sincronizarCopy()">
            </div>
        `;
        
        const root = document.documentElement;
        root.style.setProperty('--header-bg', dados.tema.headerBg);
        root.style.setProperty('--header-color', dados.tema.headerColor);
        root.style.setProperty('--title-color', dados.tema.titleColor);
        root.style.setProperty('--btn-bg', dados.tema.btnBg);
        root.style.setProperty('--btn-color', dados.tema.btnColor);

        document.getElementById('preview-logo').innerText = dados.logo;
        document.getElementById('preview-text').style.textAlign = dados.tema.textAlign;

        const imgBlock = document.getElementById('hero-image-block');
        if(dados.usarImagemHero) {
            imgBlock.style.display = 'block';
            document.getElementById('hero-image-preview').src = dados.heroImgUrl;
        } else {
            imgBlock.style.display = 'none';
        }
        
        sincronizarCopy();
    } else {
        document.getElementById('preview-mobile').classList.remove('hidden');
        let corHeader = canal === 'WhatsApp' ? 'bg-green-600' : (canal === 'SMS' ? 'bg-blue-500' : 'bg-purple-600');
        document.getElementById('mobile-header').className = `${corHeader} text-white p-4 pt-8 text-center font-bold text-sm shadow flex items-center gap-2`;
        
        copyContainer.innerHTML = `
            <div class="mb-4 flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-1">Mensagem de ${canal}</label>
                <textarea id="ia-mobile-msg" class="w-full flex-1 border rounded p-2 bg-gray-50 text-sm focus:outline-none h-40" oninput="sincronizarMobile()">${dados.msg}</textarea>
            </div>
        `;
        sincronizarMobile();
    }
}

function sincronizarCopy() {
    if(document.getElementById('preview-title')) {
        document.getElementById('preview-title').innerText = document.getElementById('ia-assunto').value;
        document.getElementById('preview-text').innerText = document.getElementById('ia-corpo').value;
        document.getElementById('preview-btn').innerText = document.getElementById('ia-cta').value;
    }
}

function sincronizarMobile() {
    if(document.getElementById('mobile-preview-text')) {
        document.getElementById('mobile-preview-text').innerText = document.getElementById('ia-mobile-msg').value;
    }
}

// ==========================================
// ARQUIVOS E LINKS (STEP 1)
// ==========================================

// Feedback do upload de arquivos
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-insumos');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileCount = e.target.files.length;
            const label = document.getElementById('label-insumos-arquivos');
            if(fileCount > 0) {
                label.innerText = `${fileCount} arquivo(s) anexado(s) com sucesso! ✅`;
                label.classList.replace('text-blue-900', 'text-green-600');
            }
        });
    }
});

let linksInsumos = [];

// Função que valida e adiciona o link na matriz
function adicionarLinkInsumo() {
    const inputUrl = document.getElementById('input-insumo-link');
    const url = inputUrl.value.trim();
    
    // Expressão regular simples para validar a URL
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (url && urlPattern.test(url) && !linksInsumos.includes(url)) {
        // Se a URL não tiver http/https, adiciona por padrão
        const urlFinal = url.startsWith('http') ? url : `https://${url}`;
        
        linksInsumos.push(urlFinal);
        atualizarListaLinks();
        inputUrl.value = ''; // limpa o input
    } else if (!urlPattern.test(url) && url !== "") {
        alert("Por favor, insira um link válido.");
    }
}

// Escuta a tecla Enter no input de link
document.getElementById('input-insumo-link')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        adicionarLinkInsumo();
    }
});

// Remove o link da memória e da tela
function removerLinkInsumo(index) {
    linksInsumos.splice(index, 1);
    atualizarListaLinks();
}

// Renderiza visualmente as "Tags" de links na tela
function atualizarListaLinks() {
    const container = document.getElementById('lista-links-insumos');
    if (!container) return;
    
    container.innerHTML = '';
    
    linksInsumos.forEach((link, index) => {
        let domain = link;
        try {
            // Tenta exibir apenas o domínio principal
            domain = new URL(link).hostname.replace('www.', '');
        } catch(e) {}

        container.innerHTML += `
            <div class="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 animate-fade-in">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <a href="${link}" target="_blank" class="truncate max-w-[150px] hover:text-blue-600 hover:underline" title="${link}">${domain}</a>
                <button type="button" onclick="removerLinkInsumo(${index})" class="text-gray-400 hover:text-red-500 ml-1 transition">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `;
    });
}
