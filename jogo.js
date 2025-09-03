// --- Jogo de Canastra - Terno Vermelho ---

// 1. Definições e Variáveis Globais
const naipes = ['♠️', '♣️', '♥️', '♦️'];
const valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const valoresCartas = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const pontosPorCarta = { 'A': 20, 'K': 10, 'Q': 10, 'J': 10, '10': 10, '9': 10, '8': 10, '7': 5, '6': 5, '5': 5, '4': 5, '3': 5, '2': 10 };
const ordemNaipes = { '♣️': 1, '♦️': 2, '♥️': 3, '♠️': 4 };

let idUnicoCarta = 0;
let jogadores = [[], []]; // 0 = Humano, 1 = Máquina
let monteCompra = [];
let lixo = [];
let jogosBaixados = [];
let tresVermelhosBaixados = [];
let cartasSelecionadas = [];
let jogadorAtual = 0;
let podeComprar = true;
let idCartaComprada = null;
let placarJogador = 0;
let placarOponente = 0;

// 2. Funções do Baralho
function criarBaralho() {
    let baralho = [];
    idUnicoCarta = 0;
    for (let i = 0; i < 2; i++) { for (const naipe of naipes) { for (const valor of valores) { baralho.push({ valor, naipe, id: idUnicoCarta++ }); } } }
    return baralho;
}
function embaralhar(baralho) {
    for (let i = baralho.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[baralho[i], baralho[j]] = [baralho[j], baralho[i]]; }
}

// 3. Funções de Lógica do Jogo
function iniciarPartida() {
    const baralhoCompleto = criarBaralho();
    embaralhar(baralhoCompleto);
    monteCompra = [...baralhoCompleto];
    jogadores = [[], []];
    lixo = [];
    jogosBaixados = [];
    tresVermelhosBaixados = [];
    cartasSelecionadas = [];
    jogadorAtual = 0;
    podeComprar = true;
    idCartaComprada = null;
    
    atualizarPlacarGeral();

    for (let i = 0; i < 15; i++) { for (let j = 0; j < jogadores.length; j++) { jogadores[j].push(monteCompra.pop()); } }
    
    verificarTresVermelhosNaMaoInicial();
    
    let cartaInicialLixo = monteCompra.pop();
    while (isTresVermelho(cartaInicialLixo)) {
        baixarTresVermelho(cartaInicialLixo, -1);
        cartaInicialLixo = monteCompra.pop();
    }
    lixo.push(cartaInicialLixo);
    renderizarTudo();
    adicionarEventListeners();
}

function isTresVermelho(carta) { return carta.valor === '3' && (carta.naipe === '♥️' || carta.naipe === '♦️'); }
function isTresPreto(carta) { return carta.valor === '3' && (carta.naipe === '♠️' || carta.naipe === '♣️'); }
function baixarTresVermelho(carta, jogadorIdx) { tresVermelhosBaixados.push({carta: carta, dono: jogadorIdx}); }

function comprarReposicao(jogadorIdx) {
    if (monteCompra.length > 0) {
        const cartaReposta = monteCompra.pop();
        if (isTresVermelho(cartaReposta)) {
            baixarTresVermelho(cartaReposta, jogadorIdx);
            comprarReposicao(jogadorIdx);
        } else {
            jogadores[jogadorIdx].push(cartaReposta);
        }
    }
}

function verificarTresVermelhosNaMaoInicial() {
    for (let i = 0; i < jogadores.length; i++) {
        let tresEncontrados = jogadores[i].filter(isTresVermelho);
        if (tresEncontrados.length > 0) {
            jogadores[i] = jogadores[i].filter(carta => !isTresVermelho(carta));
            tresEncontrados.forEach(carta => baixarTresVermelho(carta, i));
            for(let j = 0; j < tresEncontrados.length; j++) { comprarReposicao(i); }
        }
    }
}

function comprarDoMonte() {
    if (!podeComprar || jogadorAtual !== 0) return;
    if (monteCompra.length > 0) {
        let cartaComprada = monteCompra.pop();
        if (isTresVermelho(cartaComprada)) {
            baixarTresVermelho(cartaComprada, jogadorAtual);
            renderizarTudo();
            comprarDoMonte();
            return;
        }
        jogadores[jogadorAtual].push(cartaComprada);
        podeComprar = false;
        idCartaComprada = cartaComprada.id;
        renderizarTudo();
        animarCartaNaMao(cartaComprada.id, true);
    } else { finalizarRodada(false); }
}

function selecionarCarta(carta, index) {
    if (podeComprar || jogadorAtual !== 0) return;
    const jaSelecionadaIndex = cartasSelecionadas.findIndex(c => c.index === index);
    if (jaSelecionadaIndex > -1) { cartasSelecionadas.splice(jaSelecionadaIndex, 1); } 
    else { cartasSelecionadas.push({ ...carta, index }); }
    renderizarTudo();
}

function descartarCartaSelecionada() {
    if (podeComprar || jogadorAtual !== 0) return;
    if (cartasSelecionadas.length !== 1) { alert("Selecione apenas UMA carta para descartar."); return; }
    const cartaParaDescartar = cartasSelecionadas[0];
    if (isTresVermelho(cartaParaDescartar)) {
        alert("Você não pode descartar um 3 vermelho!");
        cartasSelecionadas = [];
        renderizarTudo();
        return;
    }
    const cartaDescartada = jogadores[jogadorAtual].splice(cartaParaDescartar.index, 1)[0];
    lixo.push(cartaDescartada);
    idCartaComprada = null;
    cartasSelecionadas = [];
    
    podeComprar = false;
    jogadorAtual = 1;
    renderizarTudo();
    animarCarta(document.getElementById('lixo'), false);
    setTimeout(jogarTurnoDoBot, 2000);
}
// =================== FIM DA PARTE 1 ===================
// =================================================================
// O CÓDIGO CONTINUA DAQUI (INÍCIO DA PARTE 2)
// =================================================================

function finalizarRodada(houveBatida) {
    let placarRodadaJogador = 0;
    let placarRodadaOponente = 0;

    // 1. Soma pontos das canastras e cartas na mesa
    jogosBaixados.forEach(jogo => {
        let pontosDoJogo = jogo.pontos;
        jogo.cartas.forEach(carta => {
            if (!isTresVermelho(carta.carta)) { // Acessa a propriedade 'carta' do objeto
                pontosDoJogo += pontosPorCarta[carta.valor] || 0;
            }
        });
        if (jogo.dono === 0) { // Jogador Humano
            placarRodadaJogador += pontosDoJogo;
        } else { // Máquina
            placarRodadaOponente += pontosDoJogo;
        }
    });

    // 2. Bônus de batida
    if (houveBatida) {
        if (jogadorAtual === 0) {
            placarRodadaJogador += 100;
        } else {
            placarRodadaOponente += 100;
        }
    }
    
    // 3. Contabiliza 3s Vermelhos
    const jogadorFezCanastra = jogosBaixados.some(j => j.dono === 0 && j.cartas.length >= 7);
    const oponenteFezCanastra = jogosBaixados.some(j => j.dono === 1 && j.cartas.length >= 7);

    tresVermelhosBaixados.forEach(item => {
        if (item.dono === 0) {
            placarRodadaJogador += jogadorFezCanastra ? 100 : -100;
        } else if (item.dono === 1) {
            placarRodadaOponente += oponenteFezCanastra ? 100 : -100;
        }
    });
    
    // 4. Subtrai pontos das cartas na mão de quem não bateu
    if (houveBatida) {
        const perdedorIndex = 1 - jogadorAtual;
        let pontosNegativos = 0;
        jogadores[perdedorIndex].forEach(carta => {
            pontosNegativos += pontosPorCarta[carta.valor] || 0;
        });
        if (perdedorIndex === 0) {
            placarRodadaJogador -= pontosNegativos;
        } else {
            placarRodadaOponente -= pontosNegativos;
        }
    }
    
    placarJogador += placarRodadaJogador;
    placarOponente += placarRodadaOponente;

    let mensagem = `FIM DA RODADA!\n\n`;
    if (houveBatida) {
        mensagem += `O jogador ${jogadorAtual === 0 ? 'Você' : 'Máquina'} bateu!\n\n`;
    }
    mensagem += `PONTUAÇÃO DA RODADA:\n`;
    mensagem += `Você: ${placarRodadaJogador} pontos\n`;
    mensagem += `Máquina: ${placarRodadaOponente} pontos\n\n`;
    mensagem += `PLACAR GERAL:\n`;
    mensagem += `Você: ${placarJogador} pontos\n`;
    mensagem += `Máquina: ${placarOponente} pontos\n`;
    
    alert(mensagem);
    atualizarPlacarGeral();

    setTimeout(() => {
        alert("Iniciando nova rodada...");
        iniciarPartida();
    }, 8000);
}

function jogarTurnoDoBot() {
    if (jogadorAtual !== 1) return;

    setTimeout(() => {
        if (monteCompra.length === 0) { finalizarRodada(false); return; }
        const cartaComprada = monteCompra.pop();
        jogadores[1].push(cartaComprada);
        renderizarTudo();

        setTimeout(() => {
            let baixouJogo = true;
            while(baixouJogo) {
                baixouJogo = false;
                let melhorJogo = [];
                let indicesNaMao = [];
                const maoBot = jogadores[1];
                if (maoBot.length < 3) break;

                for (let i = 0; i < maoBot.length; i++) {
                    for (let j = i + 1; j < maoBot.length; j++) {
                        for (let k = j + 1; k < maoBot.length; k++) {
                            const jogoPotencial = [maoBot[i], maoBot[j], maoBot[k]];
                            if (validarJogo(jogoPotencial)) {
                                melhorJogo = jogoPotencial;
                                indicesNaMao = [i, j, k];
                                break;
                            }
                        }
                        if (melhorJogo.length > 0) break;
                    }
                    if (melhorJogo.length > 0) break;
                }

                if (melhorJogo.length > 0) {
                    jogosBaixados.push({ cartas: melhorJogo, tipo: 'jogo', pontos: 0, dono: 1 });
                    indicesNaMao.sort((a, b) => b - a).forEach(idx => maoBot.splice(idx, 1));
                    baixouJogo = true;
                    verificarCanastras();
                    renderizarTudo();
                }
            }

            setTimeout(() => {
                if (jogadores[1].length > 0) {
                    let indiceDescarte = 0;
                    const cartaDescartada = jogadores[1].splice(indiceDescarte, 1)[0];
                    lixo.push(cartaDescartada);
                    renderizarTudo();
                    animarCarta(document.getElementById('lixo'), false);
                }

                jogadorAtual = 0;
                podeComprar = true;
                renderizarTudo();

            }, 1500);
        }, 1500);
    }, 1000);
}

function criarConteudoCarta(carta) {
    if (!carta || !carta.valor || !carta.naipe) return '';
    return `
        <div class="canto superior">
            <span class="valor">${carta.valor}</span>
            <span class="naipe">${carta.naipe}</span>
        </div>
        <div class="naipe-central">${carta.naipe}</div>
        <div class="canto inferior">
            <span class="valor">${carta.valor}</span>
            <span class="naipe">${carta.naipe}</span>
        </div>
    `;
}

function renderizarTudo() {
    const monteDiv = document.getElementById('monte-compra');
    const lixoDiv = document.getElementById('lixo');
    const acoesContainer = document.getElementById('acoes-container');

    monteDiv.classList.remove('acao-ativa');
    lixoDiv.classList.remove('acao-ativa');
    if (acoesContainer) acoesContainer.classList.remove('acao-ativa');
    
    if (podeComprar && jogadorAtual === 0) {
        monteDiv.classList.add('acao-ativa');
        lixoDiv.classList.add('acao-ativa');
    } else if (!podeComprar && jogadorAtual === 0) {
        if (acoesContainer) acoesContainer.classList.add('acao-ativa');
    }

    const acoesVisiveis = !podeComprar && jogadorAtual === 0;
    if (acoesContainer) acoesContainer.style.display = acoesVisiveis ? 'flex' : 'none';

    const maoJogadorDiv = document.getElementById('mao-jogador');
    maoJogadorDiv.innerHTML = '';
    
    jogadores[0].sort((a, b) => {
        if (valoresCartas[a.valor] !== valoresCartas[b.valor]) {
            return valoresCartas[a.valor] - valoresCartas[b.valor];
        } else {
            return ordemNaipes[a.naipe] - ordemNaipes[b.naipe];
        }
    });

    jogadores[0].forEach((carta, index) => {
        const cartaDiv = document.createElement('div');
        cartaDiv.className = 'carta';
        if (carta.naipe === '♥️' || carta.naipe === '♦️') cartaDiv.classList.add('vermelha');
        if (cartasSelecionadas.some(c => c.index === index)) cartaDiv.classList.add('selecionada');
        if (idCartaComprada === carta.id) cartaDiv.classList.add('carta-comprada');
        cartaDiv.innerHTML = criarConteudoCarta(carta);
        cartaDiv.addEventListener('click', () => selecionarCarta(carta, index));
        maoJogadorDiv.appendChild(cartaDiv);
    });
    
    const maoOponenteDiv = document.getElementById('mao-oponente');
    maoOponenteDiv.innerHTML = '';
    for(let i = 0; i < jogadores[1].length; i++) {
        const cartaDiv = document.createElement('div');
        cartaDiv.classList.add('carta', 'verso');
        maoOponenteDiv.appendChild(cartaDiv);
    }
    
    if (lixo.length > 0) {
        const topoLixo = lixo[lixo.length - 1];
        lixoDiv.innerHTML = criarConteudoCarta(topoLixo);
        lixoDiv.className = 'carta';
        if (topoLixo.naipe === '♥️' || topoLixo.naipe === '♦️') lixoDiv.classList.add('vermelha');
        if (isTresPreto(topoLixo)) lixoDiv.classList.add('travado');
    } else {
        lixoDiv.innerHTML = '';
        lixoDiv.className = 'carta';
    }
    document.getElementById('monte-compra-contador').textContent = monteCompra.length;

    const jogosJogadorDiv = document.getElementById('jogos-jogador-container');
    const jogosOponenteDiv = document.getElementById('jogos-oponente-container');
    jogosJogadorDiv.innerHTML = '';
    jogosOponenteDiv.innerHTML = '';
    
    jogosBaixados.forEach((jogo, index) => {
        const container = document.createElement('div');
        container.classList.add('jogo-container');
        if (jogo.tipo !== 'jogo') {
            const info = document.createElement('div');
            info.classList.add('canastra-info');
            info.textContent = `${jogo.tipo} (${jogo.pontos} Pts)`;
            container.appendChild(info);
        }
        const jogoDiv = document.createElement('div');
        jogoDiv.classList.add('jogo');
        if (jogo.tipo === 'Canastra Limpa') jogoDiv.classList.add('canastra-limpa');
        if (jogo.tipo === 'Canastra Suja') jogoDiv.classList.add('canastra-suja');
        if (jogo.dono === 0) {
            jogoDiv.addEventListener('click', () => adicionarCartaAoJogo(index));
        }
        jogo.cartas.forEach(carta => { 
            const cartaDiv = document.createElement('div');
            cartaDiv.className = 'carta';
            if (carta.naipe === '♥️' || carta.naipe === '♦️') cartaDiv.classList.add('vermelha');
            cartaDiv.innerHTML = criarConteudoCarta(carta);
            jogoDiv.appendChild(cartaDiv);
         });
        container.appendChild(jogoDiv);
        
        if (jogo.dono === 0) {
            jogosJogadorDiv.appendChild(container);
        } else {
            jogosOponenteDiv.appendChild(container);
        }
    });

    const tresVermelhosDiv = document.getElementById('tres-vermelhos');
    tresVermelhosDiv.innerHTML = '';
    tresVermelhosBaixados.forEach(item => {
        const cartaDiv = document.createElement('div');
        cartaDiv.className = 'carta vermelha';
        cartaDiv.innerHTML = criarConteudoCarta(item.carta);
        tresVermelhosDiv.appendChild(cartaDiv);
    });
}

function atualizarPlacarGeral() {
    document.getElementById('placar-jogador').textContent = `${placarJogador} Pts`;
    document.getElementById('placar-oponente').textContent = `${placarOponente} Pts`;
}

function animarCarta(elemento, permanente = false) {
    if(!elemento) return;
    elemento.classList.add('carta-animada');
    setTimeout(() => {
        elemento.classList.remove('carta-animada');
        if(permanente) {
            elemento.classList.add('carta-comprada');
        }
    }, 1500);
}
function animarCartaNaMao(idCarta, permanente) {
    const maoDiv = document.getElementById('mao-jogador');
    const cartaDiv = maoDiv.querySelector(`.carta[data-id='${idCarta}']`);
    animarCarta(cartaDiv, permanente);
}

function adicionarEventListeners() {
    document.getElementById('monte-compra').onclick = comprarDoMonte;
    document.getElementById('lixo').onclick = comprarDoLixo;
    document.getElementById('btn-baixar-jogo').onclick = baixarJogoSelecionado;
    document.getElementById('btn-descartar').onclick = descartarCartaSelecionada;
}

// iniciarPartida();
document.addEventListener('DOMContentLoaded', iniciarPartida);
