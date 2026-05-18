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
        
        if (currentStep === 3) {
            gerarTelaExportacao();
        }
    }
    updateBadges();
}

function goBack() { if (currentStep > 1) goToStep(currentStep - 1); }

// ==========================================
// INTEGRAÇÃO GEMINI (SIMULADOR INTELIGENTE MULTICANAL)
// ==========================================
async function invocarGeminiIA(briefing) {
    const texto = briefing.toLowerCase();
    
    // Match Inteligente de Assets: Tenta identificar logo vs banner pela ordem de upload
    const urlLogo = assetsCarregados.imagens.length > 0 ? assetsCarregados.imagens[0] : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Health_icon.svg/1024px-Health_icon.svg.png";
    const urlHero = assetsCarregados.imagens.length > 1 ? assetsCarregados.imagens[1] : (assetsCarregados.imagens[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80");

    // CASO 1: Cenário Assistencial/Médico/Exames (Match Fiel com "Expressões de Marca.pdf")
    if (texto.includes('exame') || texto.includes('jejum') || texto.includes('médico') || texto.includes('paciente') || texto.includes('consulta')) {
        return {
            Email: {
                assunto: "Atenção ao preparo: Seu exame é amanhã",
                title: "Importante: Orientações para o seu exame",
                corpo: `Para garantir a qualidade técnica e evitar reagendamentos da sua consulta, é essencial seguir rigorosamente as orientações abaixo:\n\n✔️ Jejum mínimo de 4 horas antes do exame.\n✔️ A ingestão moderada de água é permitida.\n✔️ Suas medicações habituais podem ser tomadas com pouca água.\n\n⚠️ Documentos Obrigatórios:\nNão esqueça de levar um documento oficial com foto e CPF.\n\nChegue com antecedência ao Centro Médico.`,
                cta: "VER DETALHES E ENDEREÇO",
                tema: { 
                    // Extraído do PDF "Expressões de Marca.pdf" (Pág 6 - Azul Proposta)
                    titleColor: "#3A10E0", 
                    btnBg: "#3A10E0", 
                    btnColor: "#ffffff" 
                },
                logoUrl: urlLogo,
                heroUrl: urlHero
            },
            WhatsApp: {
                msg: "Olá! 🏥 Lembrete assistencial da dr.consulta: Seu exame é amanhã.\n\n⚠️ *PREPARO OBRIGATÓRIO:*\n• Jejum mínimo de 4 horas.\n• Água moderada é permitida.\n• Remédios de rotina podem ser tomados.\n\n📄 Traga documento com foto e CPF.\nNos vemos amanhã!",
                enviarImagem: true,
                mediaUrl: urlHero,
                logoUrl: urlLogo
            },
            SMS: {
                msg: "dr.consulta: Lembrete do seu exame amanha. Necessario jejum de 4h (agua permitida). Traga doc original c/ foto e CPF.",
                logoUrl: urlLogo
            },
            WebPush: {
                titulo: "dr.consulta: Seu exame é amanhã! ⏰",
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
    document.getElementById('loading-text').innerHTML = "Lendo anexos e Brandbook (PDF)...<br>Extraindo paleta de cores e logos fiéis...";
    
    conteudoGeradoIA = await invocarGeminiIA(briefingAtual);

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
        // Ajusta o nome do header do WhatsApp dinamicamente
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
                <textarea id="ia-whatsapp-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" oninput="sincronizarCopy()">${dados.msg}</textarea>
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
                <textarea id="ia-sms-msg" class="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" oninput="sincronizarCopy()">${dados.msg}</textarea>
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
// UPLOADS E LINKS (STEP 1)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('upload-insumos');
    if(fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const label = document.getElementById('label-insumos-arquivos');
            const thumbContainer = document.getElementById('thumbnails-container');
            
            if(files.length > 0) {
                label.innerHTML = `${files.length} arquivo(s) preparado(s) para a IA ✅<br><span class="text-xs text-green-700">Logo e assets identificados!</span>`;
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
// EXPORTAÇÃO (STEP 3)
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
                <div class="w-full flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div class="flex-1">
                        <label class="font-bold mb-2 flex justify-between items-center text-sm text-gray-700">
                            <span>📧 Código HTML (${canal})</span>
                        </label>
                        <textarea id="export-html-code" class="w-full h-48 border border-gray-300 rounded-lg p-3 bg-gray-900 text-green-400 font-mono text-xs focus:outline-none" readonly>${htmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                    <div class="w-1/4 flex flex-col justify-end gap-2">
                        <button onclick="copiarTexto('export-html-code')" class="bg-white border border-gray-300 text-gray-700 py-3 rounded text-sm font-bold hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Copiar HTML
                        </button>
                    </div>
                </div>
            `;
        } else {
            let elId = "";
            let msgExport = "";
            
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
                <div class="w-full flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div class="flex-1">
                        <label class="font-bold mb-2 flex justify-between items-center text-sm text-gray-700">
                            <span>📱 Texto Formatado (${canal})</span>
                        </label>
                        <textarea id="export-txt-${chaveIA}" class="w-full h-24 border border-gray-300 rounded-lg p-3 bg-white text-gray-800 text-sm focus:outline-none" readonly>${msgExport}</textarea>
                    </div>
                    <div class="w-1/4 flex flex-col justify-end gap-2">
                        <button onclick="copiarTexto('export-txt-${chaveIA}')" class="bg-white border border-gray-300 text-gray-700 py-3 rounded text-sm font-bold hover:bg-gray-100 flex items-center justify-center gap-2 transition shadow-sm">
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

function copiarTexto(elementId) {
    const el = document.getElementById(elementId);
    if(el) {
        el.select();
        document.execCommand('copy');
        alert('Copiado para a área de transferência com sucesso!');
    }
}
