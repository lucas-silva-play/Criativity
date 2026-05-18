// ==========================================
// VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let currentStep = 1;
let canaisSelecionados = [];
let briefingAtual = "";
let canalAtivo = "";

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
        if(currentStep === 3) gerarTelaExportacao();
    }
    updateBadges();
}

function goBack() {
    if (currentStep > 1) goToStep(currentStep - 1);
}

// ==========================================
// HELPERS DO STEP 1 (Insumos e Links)
// ==========================================
function gerarBriefingIA() {
    const textarea = document.getElementById('input-briefing');
    const topics = prompt("Quais os tópicos principais? (Ex: Dia das Mães, Promoção 20%, Foco em sapatos)");
    if(topics) {
        textarea.value = "A gerar briefing estruturado a partir de: " + topics + "...";
        setTimeout(() => {
            textarea.value = `[Objetivo da Campanha]: Promover a ação especial focada em "${topics}".\n[Público-Alvo]: Base ativa dos últimos 6 meses.\n[Tom de Voz]: Urgente, mas sofisticado (conforme brandbook em anexo).\n[Oferta Principal]: Desconto exclusivo para CRM.`;
        }, 1500);
    }
}

// Feedback visual ao selecionar arquivos pelo computador
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-insumos');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileCount = e.target.files.length;
            const label = document.getElementById('label-insumos-arquivos');
            if(fileCount > 0 && label) {
                label.innerText = `${fileCount} arquivo(s) anexado(s) com sucesso! ✅`;
                label.classList.remove('text-blue-900');
                label.classList.add('text-green-600');
            } else if(label) {
                label.innerText = "Arraste arquivos ou clique aqui para selecionar";
                label.classList.remove('text-green-600');
                label.classList.add('text-blue-900');
            }
        });
    }
});

let linksInsumos = [];

function adicionarLinkInsumo() {
    const inputUrl = document.getElementById('input-insumo-link');
    const url = inputUrl.value.trim();
    
    // Expressão regular básica para validar a URL
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (url && urlPattern.test(url) && !linksInsumos.includes(url)) {
        // Se a URL não tiver http/https, adiciona por padrão
        const urlFinal = url.startsWith('http') ? url : `https://${url}`;
        
        linksInsumos.push(urlFinal);
        atualizarListaLinks();
        inputUrl.value = ''; // limpa o input após adicionar
    } else if (!urlPattern.test(url) && url !== "") {
        alert("Por favor, insira um link válido.");
    }
}

// Permite adicionar o link pressionando a tecla "Enter" no input
document.getElementById('input-insumo-link')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evita recarregar a página
        adicionarLinkInsumo();
    }
});

function removerLinkInsumo(index) {
    linksInsumos.splice(index, 1);
    atualizarListaLinks();
}

function atualizarListaLinks() {
    const container = document.getElementById('lista-links-insumos');
    container.innerHTML = '';
    
    linksInsumos.forEach((link, index) => {
        let domain = link;
        try {
            // Tenta extrair apenas o domínio para ficar mais bonito visualmente
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

// ==========================================
// PROCESSAMENTO DE IA E PREPARAÇÃO
// ==========================================
function processarComIA() {
    // 1. Coletar Canais
    canaisSelecionados = Array.from(document.querySelectorAll('input[name="canais"]:checked')).map(cb => cb.value);
    briefingAtual = document.getElementById('input-briefing').value;

    if(canaisSelecionados.length === 0) {
        alert("Por favor, selecione pelo menos um canal de comunicação.");
        return;
    }

    // 2. Iniciar Loader Fake
    document.getElementById('loading-overlay').classList.remove('hidden-step');
    
    setTimeout(() => { document.getElementById('loading-text').innerText = "Extraindo KV, recortes de produtos e paleta dos arquivos base..."; }, 800);
    setTimeout(() => { document.getElementById('loading-text').innerText = `Adaptando copies para: ${canaisSelecionados.join(', ')}...`; }, 1800);
    setTimeout(() => { document.getElementById('loading-text').innerText = "Montando HTML e gerando artes finais..."; }, 2800);

    setTimeout(() => {
        configurarEstudioMulticanal();
        document.getElementById('loading-overlay').classList.add('hidden-step');
        goToStep(2);
    }, 4000);
}

// ==========================================
// ESTÚDIO MULTICANAL (STEP 2)
// ==========================================
function configurarEstudioMulticanal() {
    const tabsContainer = document.getElementById('channel-tabs');
    tabsContainer.innerHTML = '';

    // Gerar Abas
    canaisSelecionados.forEach((canal, index) => {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 font-bold text-sm border-b-2 transition ${index === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`;
        btn.innerText = canal;
        btn.onclick = () => alternarCanal(canal, btn);
        tabsContainer.appendChild(btn);
    });

    // Selecionar primeiro canal
    if(canaisSelecionados.length > 0) {
        alternarCanal(canaisSelecionados[0], tabsContainer.firstChild);
    }
}

function alternarCanal(canal, btnElement) {
    canalAtivo = canal;
    
    // UI das Abas
    const tabsContainer = document.getElementById('channel-tabs');
    Array.from(tabsContainer.children).forEach(btn => {
        btn.classList.remove('border-blue-600', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    btnElement.classList.remove('border-transparent', 'text-gray-500');
    btnElement.classList.add('border-blue-600', 'text-blue-600');

    // UI da Coluna de Copy e Preview
    const copyContainer = document.getElementById('copy-fields-container');
    
    // Resetar Previews
    document.querySelectorAll('.preview-channel').forEach(el => el.classList.add('hidden'));

    if (canal === 'Email') {
        document.getElementById('preview-email').classList.remove('hidden');
        copyContainer.innerHTML = `
            <div class="mb-4">
                <label class="block text-xs font-medium text-gray-500 mb-1">Assunto do E-mail</label>
                <input type="text" id="ia-assunto" class="w-full border-b focus:outline-none focus:border-blue-500 py-1 font-medium text-sm" value="Descubra a nova coleção exclusiva ✨" oninput="sincronizarCopy()">
            </div>
            <div class="mb-4 flex-1 flex flex-col">
                <label class="block text-xs font-medium text-gray-500 mb-1">Corpo do E-mail (HTML Text)</label>
                <textarea id="ia-corpo" class="w-full flex-1 border rounded p-2 bg-gray-50 text-sm focus:outline-none" oninput="sincronizarCopy()">Olá! Com base nos insumos enviados, criamos esta peça. Aproveite as vantagens exclusivas.</textarea>
            </div>
            <div class="mb-2">
                <label class="block text-xs font-medium text-gray-500 mb-1">Botão (CTA)</label>
                <input type="text" id="ia-cta" class="w-full border-b focus:outline-none focus:border-blue-500 py-1 text-sm font-bold" value="APROVEITAR AGORA" oninput="sincronizarCopy()">
            </div>
        `;
        sincronizarCopy();
    } else {
        // WhatsApp, SMS, Push usam o mockup mobile
        document.getElementById('preview-mobile').classList.remove('hidden');
        let corHeader = canal === 'WhatsApp' ? 'bg-green-600' : (canal === 'SMS' ? 'bg-blue-500' : 'bg-purple-600');
        document.querySelector('#preview-mobile > div').className = `${corHeader} text-white p-4 pt-8 text-center font-bold text-sm shadow flex items-center gap-2`;
        
        let msgMock = canal === 'WhatsApp' ? 
            "Olá! Notamos o seu interesse na nova coleção. 👗\n\nQue tal garantir suas peças hoje com frete grátis?\nAcesse: link.com/vip" : 
            `${canal}: Promoção exclusiva hoje! Acesse link.com/vip e garanta seu desconto.`;

        copyContainer.innerHTML = `
            <div class="mb-4 flex-1 flex flex-col">
                <label class="block text-xs font-medium text-gray-500 mb-1">Mensagem de ${canal}</label>
                <textarea id="ia-mobile-msg" class="w-full flex-1 border rounded p-2 bg-gray-50 text-sm focus:outline-none" oninput="sincronizarMobile()">${msgMock}</textarea>
            </div>
        `;
        sincronizarMobile();
    }
}

function sincronizarCopy() {
    if(document.getElementById('preview-title') && document.getElementById('ia-assunto')) {
        document.getElementById('preview-title').innerText = document.getElementById('ia-assunto').value;
        document.getElementById('preview-text').innerText = document.getElementById('ia-corpo').value;
        document.getElementById('preview-btn').innerText = document.getElementById('ia-cta').value;
    }
}

function sincronizarMobile() {
    if(document.getElementById('mobile-preview-text') && document.getElementById('ia-mobile-msg')) {
        document.getElementById('mobile-preview-text').innerText = document.getElementById('ia-mobile-msg').value;
    }
}

// Upload de imagem no mockup
let currentImageIdToSwap = null;
function abrirUploadImagem(imageId) {
    currentImageIdToSwap = imageId;
    document.getElementById('hidden-file-upload').click();
}
document.getElementById('hidden-file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && currentImageIdToSwap) {
        const imageUrl = URL.createObjectURL(file);
        document.getElementById(currentImageIdToSwap).src = imageUrl;
    }
    this.value = ''; 
});

// Chat de refinamento
function verificarEnter(event) {
    if (event.key === "Enter") enviarMensagemChat();
}

function enviarMensagemChat() {
    const inputEl = document.getElementById('chat-input');
    const mensagem = inputEl.value.trim();
    if (!mensagem) return;

    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML += `<div class="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-tr-none self-end max-w-[90%] shadow-sm">${mensagem}</div>`;
    inputEl.value = ''; 
    chatHistory.scrollTop = chatHistory.scrollHeight; 

    setTimeout(() => {
        chatHistory.innerHTML += `<div class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">Feito! Ajustei o texto de ${canalAtivo} para ser mais persuasivo.</div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        if(canalAtivo === 'Email') {
            document.getElementById('ia-cta').value = "COMPRAR AGORA!";
            sincronizarCopy();
        } else {
            document.getElementById('ia-mobile-msg').value = document.getElementById('ia-mobile-msg').value.replace('!', '!!! 🚀🔥');
            sincronizarMobile();
        }
    }, 1000);
}

// ==========================================
// EXPORTAÇÃO (STEP 3)
// ==========================================
function gerarTelaExportacao() {
    const container = document.getElementById('export-container');
    container.innerHTML = ''; // Limpar

    canaisSelecionados.forEach(canal => {
        let content = '';

        if(canal === 'Email') {
            content = `
                <div class="w-full flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div class="flex-1">
                        <label class="font-bold mb-2 flex justify-between items-center text-sm">
                            <span>📧 HTML Original Caaqui (${canal})</span>
                        </label>
                        <textarea class="w-full h-32 border rounded-lg p-2 bg-gray-900 text-green-400 font-mono text-xs" readonly>
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
  <tr>
    <td align="center" style="padding: 40px 0;">
      </td>
  </tr>
</table></textarea>
                    </div>
                    <div class="w-1/3 flex flex-col gap-2">
                        <span class="font-bold text-sm">Artes Exportadas:</span>
                        <div class="flex gap-2 flex-wrap">
                            <div class="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-[10px] text-center p-1">KV_hero.jpg</div>
                            <div class="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-[10px] text-center p-1">prod_1.jpg</div>
                        </div>
                        <button class="mt-auto bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm font-bold hover:bg-gray-100">Copiar HTML</button>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="w-full flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div class="flex-1">
                        <label class="font-bold mb-2 flex justify-between items-center text-sm">
                            <span>📱 Texto Formatado (${canal})</span>
                        </label>
                        <textarea class="w-full h-24 border rounded-lg p-3 bg-white text-gray-800 text-sm" readonly>A mensagem validada no estúdio vai aparecer aqui, pronta para copiar e colar na plataforma de envio.</textarea>
                    </div>
                    <div class="w-1/4 flex flex-col justify-end">
                        <button class="bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm font-bold hover:bg-gray-100 flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Copiar Texto
                        </button>
                    </div>
                </div>
            `;
        }

        container.innerHTML += content;
    });
}
