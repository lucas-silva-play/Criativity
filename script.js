let currentStep = 1;
let canaisSelecionados = [];
let briefingAtual = "";
let canalAtivo = "";

// Objeto que armazenará a resposta dinâmica da IA
let conteudoGeradoIA = {};

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
/* NOTA DE DESENVOLVIMENTO:
   No ambiente real, você substituirá a lógica interna desta função por uma chamada
   para a API do Google Gemini (ex: fetch('https://generativelanguage.googleapis.com/...'))
   enviando o "briefing" no prompt. 
*/
async function invocarGeminiIA(briefing) {
    const texto = briefing.toLowerCase();
    
    // CASO 1: O AI identifica que é um cenário Assistencial/Médico (Seu briefing)
    if (texto.includes('exame') || texto.includes('jejum') || texto.includes('paciente')) {
        return {
            Email: {
                assunto: "Importante: Orientações de preparo para o seu exame amanhã",
                corpo: `Seu exame está confirmado para amanhã!\n\nPara garantir a qualidade técnica e evitar reagendamentos, é essencial seguir as orientações abaixo:\n\n• Jejum mínimo de 4 horas antes do exame.\n• Ingestão moderada de água é permitida.\n• Suas medicações habituais podem ser tomadas com pouca água.\n\nDocumentos Obrigatórios:\nNão esqueça de levar um documento oficial com foto e CPF.\n\nChegue com antecedência ao Centro Médico.`,
                cta: "VER DETALHES DO AGENDAMENTO",
                
                // Diretrizes Visuais baseadas na interpretação do briefing ("clean, texto, sem promo")
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

    const dados = conteudoGeradoIA[canal] || conteudoGeradoIA['Email'];

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
        
        // Aplica as diretrizes visuais lidas do briefing pela IA
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
            imgBlock.style.display = 'none'; // Oculta a imagem (briefing assistencial "clean")
        }
        
        sincronizarCopy();
    } else {
        document.getElementById('preview-mobile').classList.remove('hidden');
        let corHeader = canal === 'WhatsApp' ? 'bg-green-600' : (canal === 'SMS' ? 'bg-blue-500' : 'bg-purple-600');
        document.getElementById('mobile-header').className = `${corHeader} text-white p-4 pt-8 text-center font-bold text-sm shadow flex items-center gap-2`;
        
        copyContainer.innerHTML = `
            <div class="mb-4 flex-1 flex flex-col">
                <label class="block text-xs font-bold text-gray-500 mb-1">Mensagem de ${canal}</label>
                <textarea id="ia-mobile-msg" class="w-full flex-1 border rounded p-2 bg-gray-50 text-sm focus:outline-none" oninput="sincronizarMobile()">${dados.msg}</textarea>
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

// Helpers de input de Arquivo e Links (Mantidos do código anterior)
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
function adicionarLinkInsumo() {
    const inputUrl = document.getElementById('input-insumo-link');
    const url = inputUrl.value.trim();
    if (url) {
        linksInsumos.push(url.startsWith('http') ? url : `https://${url}`);
        inputUrl.value = '';
    }
}
