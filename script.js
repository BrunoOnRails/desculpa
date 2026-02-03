document.addEventListener('DOMContentLoaded', function() {
    initializeDate();
    initializeSignaturePad();
    initializeGenerateButton();
    initializeModal();
});

function initializeDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const today = new Date().toLocaleDateString('pt-BR', options);
    
    document.getElementById('current-date').textContent = today;
    document.getElementById('footer-date').textContent = today;
}

function initializeSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        const coords = getCoordinates(e);
        lastX = coords.x;
        lastY = coords.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const coords = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        lastX = coords.x;
        lastY = coords.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('clear-signature').addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function initializeGenerateButton() {
    document.getElementById('generate-pdf').addEventListener('click', function() {
        const selectedErrors = getSelectedErrors();
        const customError = document.getElementById('outro-erro').value.trim();
        const nomeCulpado = document.getElementById('nome-culpado').value.trim() || '[Nome não informado]';
        const nomeAmada = document.getElementById('nome-amada').value.trim() || '[Nome não informado]';
        
        if (selectedErrors.length === 0 && !customError) {
            alert('Por favor, selecione pelo menos um erro cometido ou descreva no campo de texto!');
            return;
        }

        const document_text = generateDocumentText(nomeCulpado, nomeAmada, selectedErrors, customError);
        showModal(document_text);
    });
}

function getSelectedErrors() {
    const checkboxes = document.querySelectorAll('input[name="erro"]:checked');
    const errors = [];
    
    checkboxes.forEach(function(checkbox) {
        const label = checkbox.closest('.checkbox-item').querySelector('.text').textContent;
        errors.push(label);
    });
    
    return errors;
}

function generateDocumentText(nomeCulpado, nomeAmada, selectedErrors, customError) {
    const date = new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    let text = `
═══════════════════════════════════════════
       PEDIDO OFICIAL DE DESCULPAS
   Documento de Reconhecimento de Erros
        e Compromisso de Melhoria
═══════════════════════════════════════════

Data: ${date}

───────────────────────────────────────────

PREÂMBULO

Eu, ${nomeCulpado}, venho por meio deste documento 
(que tem valor sentimental maior que qualquer contrato), 
reconhecer que PISEI NA BOLA, VACILEI MONUMENTALMENTE 
e que minha amada ${nomeAmada} tem TOTAL RAZÃO 
em estar chateada comigo.

Declaro ainda que tentei me explicar, mas como sempre, 
só piorei a situação. Portanto, recorro a este método 
oficial de desculpas.

───────────────────────────────────────────

LISTA DE INFRAÇÕES COMETIDAS

`;

    selectedErrors.forEach(function(error, index) {
        text += `  [X] ${error}\n`;
    });

    if (customError) {
        text += `\nInfração adicional descrita:\n"${customError}"\n`;
    }

    text += `
───────────────────────────────────────────

TERMO DE COMPROMISSO

Eu, ${nomeCulpado}, declaro perante o amor que 
tenho por ${nomeAmada}, que:

I. RECONHEÇO MEU ERRO e admito que fui um(a) 
   completo(a) JUMENTO ao cometer a(s) infração(ões) 
   listada(s) acima.

II. COMPROMETO-ME AO MÁXIMO a não repetir o mesmo 
    erro novamente, ciente de que na próxima vez 
    as consequências podem incluir: dormir no sofá, 
    ficar sem beijo por tempo indeterminado, ou 
    pior... ter que assistir reality show.

III. PROMETO COMPENSAR através de carinho extra, 
     atenção redobrada, e possivelmente um jantar 
     romântico (ou pelo menos um delivery decente).

IV. ACEITO que este documento poderá ser usado 
    contra mim em futuras discussões como prova 
    de que "eu já tinha avisado".

───────────────────────────────────────────

                    💕

Este pedido de desculpas é válido por tempo 
indeterminado e representa meu amor e 
arrependimento genuíno.

    TE AMO, MESMO SENDO UM DESASTRE ÀS VEZES.

                              ________________
                              ${nomeCulpado}

───────────────────────────────────────────
* Este documento não tem valor legal, 
  mas tem valor sentimental infinito.
═══════════════════════════════════════════
`;

    return text;
}

function initializeModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('close-modal');
    const closeBtnFooter = document.getElementById('close-modal-btn');
    const copyBtn = document.getElementById('copy-link');

    closeBtn.addEventListener('click', hideModal);
    closeBtnFooter.addEventListener('click', hideModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });

    copyBtn.addEventListener('click', function() {
        const text = document.querySelector('#modal-body pre').textContent;
        
        navigator.clipboard.writeText(text).then(function() {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copiado!';
            setTimeout(function() {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(function() {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copiado!';
            setTimeout(function() {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
}

function showModal(text) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = '<pre>' + escapeHtml(text) + '</pre>';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
