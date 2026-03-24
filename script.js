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
