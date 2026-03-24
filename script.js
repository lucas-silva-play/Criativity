// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let currentStep = 1;
let dadosCampanha = {};

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

function goBack() {
    if (currentStep > 1) goToStep(currentStep - 1);
}

// ==========================================
// INTELIGÊNCIA ARTIFICIAL (SIMULAÇÃO)
// ==========================================
function processarComIA() {
    try {
        const elCliente = document.getElementById('input-cliente');
        const elDestino = document.getElementById('input-destino');
        const elUrl = document.getElementById('input-url');
        const elPrompt = document.getElementById('input-prompt');
        
        dadosCampanha.cliente = elCliente && elCliente.value ? elCliente.value : 'Sua Marca';
        dadosCampanha.destino = elDestino && elDestino.value ? elDestino.value : 'Insider One';
        dadosCampanha.url = elUrl && elUrl.value ? elUrl.value.toLowerCase() : '';
        dadosCampanha.prompt = elPrompt && elPrompt.value ? elPrompt.value.toLowerCase() : '';
        
        document.getElementById('loading-overlay').classList.remove('hidden-step');
        
        setTimeout(() => { document.getElementById('loading-text').innerText = "A analisar o site e o tom de voz da marca..."; }, 500);
        setTimeout(() => { document.getElementById('loading-text').innerText = "A ler o briefing e a gerar copy de alta conversão..."; }, 1500);

        setTimeout(() => {
            aplicarResultadosIA();
            document.getElementById('loading-overlay').classList.add('hidden-step');
            goToStep(2);
        }, 3000);
    } catch (error) {
        console.error("Erro no processamento:", error);
        alert("Ops! Ocorreu um problema. Verifique a consola.");
    }
}

function aplicarResultadosIA() {
    document.getElementById('tag-destino').innerText = `Integração: ${dadosCampanha.destino}`;
    document.getElementById('btn-enviar-crm').innerText = `Enviar direto para ${dadosCampanha.destino} 🚀`;

    let iaAssunto, iaCorpo, iaCta;
    
    // VARIÁVEL PARA LER O QUE O UTILIZADOR PEDIU NO PROMPT
    const pedidoUsuario = dadosCampanha.prompt;

    // REGRAS DA ARAMIS (Lendo o Prompt)
    if (dadosCampanha.url.includes('aramis') || dadosCampanha.cliente.toLowerCase().includes('aramis')) {
        
        document.getElementById('preview-logo').innerText = "ARAMIS";
        document.getElementById('brand-indicator').innerText = "Brandbook: Minimalista / Masculino";

        // Se o utilizador pediu "boas vindas" ou "novo cliente"
        if (pedidoUsuario.includes('boas vindas') || pedidoUsuario.includes('welcome') || pedidoUsuario.includes('novo')) {
            iaAssunto = "Bem-vindo ao clube. 👔";
            iaCorpo = "O seu estilo acaba de subir de nível. O homem em movimento está sempre um passo à frente. Aproveite 15% OFF na sua primeira compra com o código BEMVINDO15.";
            iaCta = "CONHECER A COLEÇÃO";
        } 
        // Se o utilizador pediu "promoção", "desconto", "liquidação", "sale"
        else if (pedidoUsuario.includes('promo') || pedidoUsuario.includes('desconto') || pedidoUsuario.includes('sale') || pedidoUsuario.includes('liquidação')) {
            iaAssunto = "Acesso VIP libertado: Off exclusivo. 👔";
            iaCorpo = "As peças exclusivas que tinha debaixo de olho estão agora com condições especiais. Renove o seu guarda-roupa com até 40% de desconto. Não perca tempo.";
            iaCta = "VER PRODUTOS COM DESCONTO";
        } 
        // Padrão: Carrinho Abandonado
        else {
            iaAssunto = "O seu estilo não espera. Finalize a sua compra. 👔";
            iaCorpo = "Notámos que selecionou peças exclusivas no nosso site, mas não finalizou a encomenda. O homem em movimento não perde tempo. Garanta as suas escolhas com 10% de desconto usando o código ARAMIS10.";
            iaCta = "VOLTAR PARA O CARRINHO";
        }

    } else {
        // REGRAS PARA OUTRAS MARCAS (Genérico)
        document.getElementById('preview-logo').innerText = dadosCampanha.cliente.toUpperCase();
        document.getElementById('brand-indicator').innerText = "Brandbook: Padrão";

        if (pedidoUsuario.includes('boas vindas') || pedidoUsuario.includes('novo')) {
            iaAssunto = `Bem-vindo(a) à ${dadosCampanha.cliente}! 🎉`;
            iaCorpo = "Estamos muito felizes em ter-te por aqui. Para começares com o pé direito, preparámos um presente especial para ti.";
            iaCta = "PEGAR NO MEU PRESENTE";
        } else if (pedidoUsuario.includes('promo') || pedidoUsuario.includes('desconto')) {
            iaAssunto = "As ofertas imperdíveis chegaram! 🚨";
            iaCorpo = `Preparámos uma seleção incrível de produtos da ${dadosCampanha.cliente} com preços que não vais acreditar. Corre antes que acabe!`;
            iaCta = "APROVEITAR OFERTAS";
        } else {
            iaAssunto = "Esqueceu-se de algo no carrinho! 🛒";
            iaCorpo = `Olá! Reparamos que deixou alguns itens fantásticos no site da ${dadosCampanha.cliente}. Aproveite antes que o stock acabe!`;
            iaCta = "FINALIZAR COMPRA AGORA";
        }
    }

    // Aplica os textos nos inputs da coluna da esquerda
    document.getElementById('ia-assunto').value = iaAssunto;
    document.getElementById('ia-corpo').value = iaCorpo;
    document.getElementById('ia-cta').value = iaCta;

    // Aplica os textos no preview do e-mail
    document.getElementById('preview-title').innerText = iaAssunto.replace(' 👔', '').replace(' 🛒', '').replace(' 🎉', '').replace(' 🚨', '');
    document.getElementById('preview-text').innerText = iaCorpo;
    document.getElementById('preview-btn').innerText = iaCta;
}

// ==========================================
// CHAT - REFINAMENTO DE IA
// ==========================================
function verificarEnter(event) {
    if (event.key === "Enter") enviarMensagemChat();
}

function enviarMensagemChat() {
    const inputEl = document.getElementById('chat-input');
    const mensagem = inputEl.value.trim();
    if (!mensagem) return;

    const chatHistory = document.getElementById('chat-history');

    chatHistory.innerHTML += `
        <div class="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-tr-none self-end max-w-[90%] shadow-sm">
            ${mensagem}
        </div>
    `;
    inputEl.value = ''; 
    chatHistory.scrollTop = chatHistory.scrollHeight; 

    const idPensando = 'msg-' + Date.now();
    chatHistory.innerHTML += `
        <div id="${idPensando}" class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] opacity-70 animate-pulse">
            A processar...
        </div>
    `;
    chatHistory.scrollTop = chatHistory.scrollHeight;

    setTimeout(() => {
        document.getElementById(idPensando).remove();
        let respostaIA = "Feito! Ajustei conforme pediu.";
        const msgLower = mensagem.toLowerCase();

        if (msgLower.includes('curto') || msgLower.includes('resuma')) {
            document.getElementById('ia-corpo').value = "O homem em movimento não perde tempo. Garanta as suas escolhas com 10% OFF usando o código ARAMIS10.";
            document.getElementById('preview-text').innerText = document.getElementById('ia-corpo').value;
            respostaIA = "Deixei o texto mais direto e foquei-me no desconto!";
        } else if (msgLower.includes('assunto') || msgLower.includes('título')) {
            document.getElementById('ia-assunto').value = "As suas escolhas exclusivas aguardam 👔";
            document.getElementById('preview-title').innerText = "As suas escolhas exclusivas aguardam";
            respostaIA = "Atualizei o assunto para algo mais exclusivo.";
        } else if (msgLower.includes('botão') || msgLower.includes('cta')) {
            document.getElementById('ia-cta').value = "GARANTIR OS MEUS 10% OFF";
            document.getElementById('preview-btn').innerText = document.getElementById('ia-cta').value;
            respostaIA = "Mudei o botão para gerar mais urgência.";
        }

        chatHistory.innerHTML += `
            <div class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">
                ${respostaIA}
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1200);
}

// ==========================================
// MODAL DE PREVIEW FULL SCREEN
// ==========================================
function abrirModalPreview() {
    const modal = document.getElementById('modal-preview');
    const modalContent = document.getElementById('modal-content');
    
    const mockupEditado = document.querySelector('#email-builder-container').innerHTML;
    modalContent.innerHTML = mockupEditado;
    
    modalContent.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.classList.remove('hover:ring-2', 'hover:ring-dashed', 'cursor-text');
    });
    
    modal.classList.remove('hidden-step');
}

function fecharModalPreview() {
    document.getElementById('modal-preview').classList.add('hidden-step');
}

// ==========================================
// SINCRONIZAÇÃO: FORMULÁRIO <-> CMS
// ==========================================
function sincronizarParaEsquerda(campo) {
    if (campo === 'logo') return; 
    if (campo === 'title') {
        document.getElementById('ia-assunto').value = document.getElementById('preview-title').innerText;
    } else if (campo === 'text') {
        document.getElementById('ia-corpo').value = document.getElementById('preview-text').innerText;
    } else if (campo === 'btn') {
        document.getElementById('ia-cta').value = document.getElementById('preview-btn').innerText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['ia-assunto', 'ia-corpo', 'ia-cta'];
    const previews = ['preview-title', 'preview-text', 'preview-btn'];
    
    inputs.forEach((id, index) => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.addEventListener('input', function() {
                const prevEl = document.getElementById(previews[index]);
                if (prevEl) prevEl.innerText = this.value;
            });
        }
    });
});

// ==========================================
// CMS EDITOR: TEXTOS, UPLOADS E DRAG & DROP
// ==========================================

// --- Editor de Texto (Barra Flutuante) ---
let currentTarget = null;
const toolbar = document.getElementById('cms-toolbar');

function showToolbar(element) {
    currentTarget = element;
    const rect = element.getBoundingClientRect();
    const containerRect = document.getElementById('preview-scroll-container').getBoundingClientRect();
    
    toolbar.style.left = `${rect.left - containerRect.left + (rect.width / 2)}px`;
    toolbar.style.top = `${rect.top - containerRect.top - 10}px`;
    toolbar.classList.remove('hidden');
}

function hideToolbar() {
    setTimeout(() => {
        if (!toolbar.matches(':hover')) {
            toolbar.classList.add('hidden');
        }
    }, 250);
}

function formatText(command, value = null) {
    if (!currentTarget) return;
    
    if (currentTarget.tagName === 'BUTTON' && command === 'foreColor') {
        currentTarget.style.backgroundColor = value;
        return;
    }

    document.execCommand(command, false, value);
    currentTarget.focus();
}

// --- Upload de Imagem Direto ---
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

// --- Drag & Drop dos Blocos ---
const containerBuilder = document.getElementById('email-builder-container');
let draggedItem = null;

if (containerBuilder) {
    document.querySelectorAll('.builder-block').forEach(block => {
        block.addEventListener('dragstart', function(e) {
            draggedItem = this;
            setTimeout(() => this.classList.add('opacity-50'), 0);
        });

        block.addEventListener('dragend', function() {
            setTimeout(() => {
                this.classList.remove('opacity-50');
                draggedItem = null;
            }, 0);
        });

        block.addEventListener('dragover', function(e) {
            e.preventDefault(); 
            const afterElement = getDragAfterElement(containerBuilder, e.clientY);
            if (afterElement == null) {
                containerBuilder.appendChild(draggedItem);
            } else {
                containerBuilder.insertBefore(draggedItem, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.builder-block:not(.opacity-50)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
