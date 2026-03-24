let currentStep = 1;

// Atualiza a barra de progresso no topo (badges)
function updateBadges() {
    document.querySelectorAll('header span[id^="badge-step-"]').forEach((el, index) => {
        if (index + 1 === currentStep) {
            el.className = "font-bold text-blue-600";
        } else {
            el.className = "";
        }
    });
}

// Simula o tempo de processamento da IA
function simulateAIProcessing(nextStep) {
    // Mostra o ecrã de carregamento
    document.getElementById('loading-overlay').classList.remove('hidden-step');
    
    setTimeout(() => {
        // Esconde o ecrã de carregamento e avança de passo
        document.getElementById('loading-overlay').classList.add('hidden-step');
        goToStep(nextStep);
    }, 2500); // Simula 2.5s da IA a "pensar"
}

// Controla a transição entre os ecrãs
function goToStep(step) {
    // Esconde o passo atual
    document.getElementById(`step-${currentStep}`).classList.add('hidden-step');
    
    currentStep = step;
    
    // Mostra o novo passo
    document.getElementById(`step-${currentStep}`).classList.remove('hidden-step');
    
    const footer = document.getElementById('footer-actions');
    
    // Mostra ou esconde o footer dependendo do passo
    if (currentStep === 1) {
        footer.classList.add('hidden-step');
    } else {
        footer.classList.remove('hidden-step');
        if(currentStep === 2) {
            document.getElementById('btn-next').classList.remove('hidden-step');
        } else {
            document.getElementById('btn-next').classList.add('hidden-step');
        }
    }
    
    updateBadges();
}

// Volta ao passo anterior
function goBack() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}
