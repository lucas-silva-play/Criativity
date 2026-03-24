let currentStep = 1;
let dadosCampanha = {};

function updateBadges() {
    document.querySelectorAll('header span[id^="badge-step-"]').forEach((el, index) => {
        el.className = (index + 1 === currentStep) ? "font-bold text-blue-600" : "";
    });
}

function processarComIA() {
    try {
        // Captura das informações (Aramis, Insider One, etc)
        const elCliente = document.getElementById('input-cliente');
        const elDestino = document.getElementById('input-destino');
        const elUrl = document.getElementById('input-url');
        
        dadosCampanha.cliente = elCliente && elCliente.value ? elCliente.value : 'Sua Marca';
        dadosCampanha.destino = elDestino && elDestino.value ? elDestino.value : 'Insider One';
        dadosCampanha.url = elUrl && elUrl.value ? elUrl.value.toLowerCase() : '';
        
        // Exibe o carregamento
        document.getElementById('loading-overlay').classList.remove('hidden-step');
        
        // Textos da tela de loading
        setTimeout(() => { document.getElementById('loading-text').innerText = "Analisando site e tom de voz da marca..."; }, 500);
        setTimeout(() => { document.getElementById('loading-text').innerText = "Gerando layout e copy de alta conversão..."; }, 1500);

        setTimeout(() => {
            aplicarResultadosIA();
            document.getElementById('loading-overlay').classList.add('hidden-step');
            goToStep(2);
        }, 3000);
    } catch (error) {
        console.error("Erro no processamento:", error);
        alert("Ops! Houve um problema ao avançar. Verifique o console.");
    }
}

function aplicarResultadosIA() {
    // Atualiza a Tela 3 com a ferramenta de disparo
    document.getElementById('tag-destino').innerText = `Integração: ${dadosCampanha.destino}`;
    document.getElementById('btn-enviar-crm').innerText = `Enviar direto para ${dadosCampanha.destino} 🚀`;

    let iaAssunto, iaCorpo, iaCta;

    // A Mágica: Regras específicas se for a Aramis
    if (dadosCampanha.url.includes('aramis') || dadosCampanha.cliente.toLowerCase().includes('aramis')) {
        iaAssunto = "Seu estilo não espera. Finalize sua compra. 👔";
        iaCorpo = "Notamos que você selecionou peças exclusivas em nosso site, mas não finalizou o pedido. O homem em movimento não perde tempo. Garanta suas escolhas com 10% de desconto usando o código ARAMIS10.";
        iaCta = "VOLTAR PARA O CARRINHO";
        
        document.getElementById('preview-logo').innerText = "ARAMIS";
        document.getElementById('brand-indicator').innerText = "Brandbook: Minimalista / Masculino";
    } else {
        // Regra Genérica para outras marcas
        iaAssunto = "Você esqueceu algo no carrinho! 🛒";
        iaCorpo = `Ei! Vimos que você deixou alguns itens incríveis no site da ${dadosCampanha.cliente}. Aproveite antes que o estoque acabe!`;
        iaCta = "FINALIZAR COMPRA AGORA";
        document.getElementById('preview-logo').innerText = dadosCampanha.cliente.toUpperCase();
        document.getElementById('brand-indicator').innerText = "Brandbook: Padrão";
    }

    // Injeta os textos na Tela 2
    document.getElementById('ia-assunto').value = iaAssunto;
    document.getElementById('ia-corpo').value = iaCorpo;
    document.getElementById('ia-cta').value = iaCta;

    document.getElementById('preview-title').innerText = iaAssunto.replace(' 👔', '').replace(' 🛒', '');
    document.getElementById('preview-text').innerText = iaCorpo;
    document.getElementById('preview-btn').innerText = iaCta;
}

// Controla a navegação das telas
function goToStep(step) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden-step');
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden-step');
    
    const footer = document.getElementById('footer-actions');
    if (currentStep === 1) {
        footer.classList.add('hidden-step');
    } else {
        footer.classList.remove('hidden-step');
        // Mostra ou esconde o botão "Avançar para Exportação"
        document.getElementById('btn-next').classList.toggle('hidden-step', currentStep === 3);
    }
    updateBadges();
}

// Volta um passo
function goBack() {
    if (currentStep > 1) goToStep(currentStep - 1);
}

// --- NOVAS FUNÇÕES DO CHAT (TELA 2) ---

function verificarEnter(event) {
    // Permite enviar a mensagem apertando a tecla Enter
    if (event.key === "Enter") {
        enviarMensagemChat();
    }
}

function enviarMensagemChat() {
    const inputEl = document.getElementById('chat-input');
    const mensagem = inputEl.value.trim();
    if (!mensagem) return;

    const chatHistory = document.getElementById('chat-history');

    // 1. Adiciona a mensagem do Usuário
    chatHistory.innerHTML += `
        <div class="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-tr-none self-end max-w-[90%] shadow-sm">
            ${mensagem}
        </div>
    `;
    inputEl.value = ''; // Limpa o input
    chatHistory.scrollTop = chatHistory.scrollHeight; // Rola para o fim

    // 2. Simula IA Pensando
    const idPensando = 'msg-' + Date.now();
    chatHistory.innerHTML += `
        <div id="${idPensando}" class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] opacity-70 animate-pulse">
            Digitando...
        </div>
    `;
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 3. Resposta da IA e atualização da tela (Simulação do Refinamento)
    setTimeout(() => {
        document.getElementById(idPensando).remove();
        let respostaIA = "Feito! Ajustei conforme você pediu.";
        const msgLower = mensagem.toLowerCase();

        // Regras de simulação baseadas no que o usuário digitar
        if (msgLower.includes('curto') || msgLower.includes('resuma')) {
            document.getElementById('ia-corpo').value = "O homem em movimento não perde tempo. Garanta suas escolhas com 10% OFF usando o código ARAMIS10.";
            document.getElementById('preview-text').innerText = document.getElementById('ia-corpo').value;
            respostaIA = "Deixei o texto mais direto e foquei no desconto!";
        } 
        else if (msgLower.includes('assunto') || msgLower.includes('título')) {
            document.getElementById('ia-assunto').value = "Suas escolhas exclusivas aguardam 👔";
            document.getElementById('preview-title').innerText = "Suas escolhas exclusivas aguardam";
            respostaIA = "Atualizei o assunto para algo mais exclusivo.";
        }
        else if (msgLower.includes('botão') || msgLower.includes('cta')) {
            document.getElementById('ia-cta').value = "GARANTIR MEUS 10% OFF";
            document.getElementById('preview-btn').innerText = document.getElementById('ia-cta').value;
            respostaIA = "Mudei o botão para gerar mais senso de urgência.";
        }

        // Adiciona a resposta final da IA no chat
        chatHistory.innerHTML += `
            <div class="bg-blue-100 text-blue-800 p-2 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">
                ${respostaIA}
            </div>
        `;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1200);
}

// --- NOVAS FUNÇÕES: MODAL E CMS (TELA 2) ---

// 1. Controle do Modal Full Screen
function abrirModalPreview() {
    const modal = document.getElementById('modal-preview');
    const modalContent = document.getElementById('modal-content');
    
    // Pega o HTML exato da imagem montada (do jeito que o usuário editou) e joga no modal
    const mockupEditado = document.querySelector('#preview-scroll-container > div').innerHTML;
    modalContent.innerHTML = mockupEditado;
    
    // Remove as propriedades de edição do modal para ficar apenas como "leitura"
    modalContent.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.classList.remove('hover:ring-2', 'hover:ring-dashed', 'cursor-text');
    });
    
    modal.classList.remove('hidden-step');
}

function fecharModalPreview() {
    document.getElementById('modal-preview').classList.add('hidden-step');
}

// 2. Sincronização CMS -> Formulário (Da direita para a esquerda)
// Esta função é chamada automaticamente quando o usuário digita nos textos da imagem
function sincronizarParaEsquerda(campo) {
    if (campo === 'title') {
        document.getElementById('ia-assunto').value = document.getElementById('preview-title').innerText;
    } else if (campo === 'text') {
        document.getElementById('ia-corpo').value = document.getElementById('preview-text').innerText;
    } else if (campo === 'btn') {
        document.getElementById('ia-cta').value = document.getElementById('preview-btn').innerText;
    }
}

// 3. Sincronização Formulário -> CMS (Da esquerda para a direita)
// Cria "escutadores" para que os inputs do formulário alterem a imagem em tempo real
document.addEventListener('DOMContentLoaded', () => {
    const inputAssunto = document.getElementById('ia-assunto');
    const inputCorpo = document.getElementById('ia-corpo');
    const inputCta = document.getElementById('ia-cta');

    if (inputAssunto) {
        inputAssunto.addEventListener('input', function() {
            document.getElementById('preview-title').innerText = this.value;
        });
    }
    if (inputCorpo) {
        inputCorpo.addEventListener('input', function() {
            document.getElementById('preview-text').innerText = this.value;
        });
    }
    if (inputCta) {
        inputCta.addEventListener('input', function() {
            document.getElementById('preview-btn').innerText = this.value;
        });
    }
});

// ==========================================
// MÓDULO CMS: DRAG & DROP, TEXTOS E IMAGENS
// ==========================================

// --- 1. Menu Flutuante de Textos ---
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

// Pequeno delay no blur para dar tempo de clicar nos botões da toolbar
function hideToolbar() {
    setTimeout(() => {
        if (!toolbar.matches(':hover')) {
            toolbar.classList.add('hidden');
        }
    }, 200);
}

function formatText(command) {
    document.execCommand(command, false, null);
    if (currentTarget) currentTarget.focus();
}

function changeFontSize(step) {
    if (!currentTarget) return;
    // Pega o tamanho atual computado e soma ou subtrai
    const currentSize = window.getComputedStyle(currentTarget, null).getPropertyValue('font-size');
    const newSize = parseFloat(currentSize) + (step * 2);
    currentTarget.style.fontSize = newSize + 'px';
}

function changeTextColor(color) {
    if (!currentTarget) return;
    // Se for o botão, muda o fundo. Se for texto, muda a cor da letra.
    if(currentTarget.tagName === 'BUTTON') {
        currentTarget.style.backgroundColor = color;
    } else {
        document.execCommand('foreColor', false, color);
    }
}

// --- 2. Gestão de Imagens (Link ou Upload Local) ---
let currentImageIdToSwap = null;

function abrirMenuImagem(imageId) {
    currentImageIdToSwap = imageId;
    const acao = prompt("Digite '1' para colar um Link da web ou '2' para fazer Upload do seu PC:", "1");
    
    if (acao === "1") {
        const url = prompt("Cole a URL da imagem aqui:");
        if (url) document.getElementById(imageId).src = url;
    } else if (acao === "2") {
        // Aciona o input file oculto
        document.getElementById('hidden-file-upload').click();
    }
}

// Escutador do input file oculto
document.getElementById('hidden-file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && currentImageIdToSwap) {
        // Cria uma URL local temporária para exibir a imagem upada
        const imageUrl = URL.createObjectURL(file);
        document.getElementById(currentImageIdToSwap).src = imageUrl;
    }
    this.value = ''; // Limpa o input
});

// --- 3. Drag & Drop (Arrastar e Soltar Blocos) ---
const container = document.getElementById('email-builder-container');
let draggedItem = null;

// Inicializa os eventos de drag nos blocos
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
        e.preventDefault(); // Necessário para permitir o drop
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggedItem);
        } else {
            container.insertBefore(draggedItem, afterElement);
        }
    });
});

// Calcula a posição do mouse para saber onde soltar o bloco
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
