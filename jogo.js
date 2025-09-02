// --- Jogo de Canastra - Terno Vermelho ---

// 1. Definições e Variáveis Globais
const naipes = ['♠️', '♣️', '♥️', '♦️'];
const valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const valoresCartas = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const pontosPorCarta = { 'A': 20, 'K': 10, 'Q': 10, 'J': 10, '10': 10, '9': 10, '8': 10, '7': 5, '6': 5, '5': 5, '4': 5, '3': 5, '2': 10 };

let idUnicoCarta = 0;
let jogadores = [[], [], [], []];
let monteCompra = [];
let lixo = [];
let jogosBaixados = [];
let tresVermelhosBaixados = [];
let cartasSelecionadas = [];
let jogadorAtual = 0;
let podeComprar = true;
let idCartaComprada = null;
let placarGeralDupla1 = 0;
let placarGeralDupla2 = 0;
let dupla1Vulneravel = false;
let dupla2Vulneravel = false;

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
    jogadores = [[], [], [], []];
    lixo = [];
    jogosBaixados = [];
    tresVermelhosBaixados = [];
    cartasSelecionadas = [];
    podeComprar = true;
    idCartaComprada = null;
    document.getElementById('acoes-container').style.display = 'block';
    
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
    if (!podeComprar) return;
    if (monteCompra.length > 0) {
        let cartaComprada = monteCompra.pop();
        if (isTresVermelho(cartaComprada)) {
            baixarTresVermelho(cartaComprada, jogadorAtual);
            renderizarTudo();
            animarCarta(document.querySelector(`#tres-vermelhos .carta[data-id='${cartaComprada.id}']`), false);
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

function comprarDoLixo() {
    if (!podeComprar) { return; }
    if (lixo.length === 0) return;
    const topoLixo = lixo[lixo.length - 1];
    if (isTresPreto(topoLixo)) { alert("O lixo está travado com um 3 preto!"); return; }

    const maoJogador = jogadores[jogadorAtual];
    const isDupla1 = jogadorAtual === 0 || jogadorAtual === 2;
    const duplaEstaVulneravel = isDupla1 ? dupla1Vulneravel : dupla2Vulneravel;

    let podeBaixar = false;
    let cartasParaBaixar = [];
    let indicesDaMao = [];
    
    for (let i = 0; i < maoJogador.length; i++) {
        for (let j = i + 1; j < maoJogador.length; j++) {
            const trioSelecionado = [topoLixo, maoJogador[i], maoJogador[j]];
            if (validarJogo(trioSelecionado)) {
                
                if (duplaEstaVulneravel) {
                    const pontosDoJogo = calcularPontosDeCartas(trioSelecionado);
                    if (pontosDoJogo >= 95) {
                        podeBaixar = true;
                    }
                } else {
                    podeBaixar = true;
                }

                if (podeBaixar) {
                    cartasParaBaixar = trioSelecionado;
                    indicesDaMao = [i, j];
                    break;
                }
            }
        }
        if (podeBaixar) break;
    }

    if (podeBaixar) {
        const indices = indicesDaMao.sort((a,b) => b - a);
        indices.forEach(idx => jogadores[jogadorAtual].splice(idx, 1));
        const novoJogo = { cartas: cartasParaBaixar.map(c => ({...c})), tipo: 'jogo', pontos: 0, dono: jogadorAtual };
        jogosBaixados.push(novoJogo);
        jogadores[jogadorAtual].push(...lixo);
        lixo = [];
        podeComprar = false;
        verificarCanastras();
        renderizarTudo();
    } else {
        if (duplaEstaVulneravel) {
            alert("Sua dupla está vulnerável! Você precisa formar um jogo de 95+ pontos com a carta do lixo para pegá-lo.");
        } else {
            alert("Você não tem cartas na mão para formar um jogo com o topo do lixo!");
        }
    }
}

function selecionarCarta(carta, index) {
    if (podeComprar) return;
    const jaSelecionadaIndex = cartasSelecionadas.findIndex(c => c.index === index);
    if (jaSelecionadaIndex > -1) { cartasSelecionadas.splice(jaSelecionadaIndex, 1); } 
    else { cartasSelecionadas.push({ ...carta, index }); }
    renderizarTudo();
}

function validarJogo(cartas) {
    if (cartas.length < 3) return false;
    if (cartas.some(isTresVermelho)) return false;
    const curingas = cartas.filter(c => c.valor === '2');
    const normais = cartas.filter(c => c.valor !== '2');
    if (normais.length === 0) return false;
    const naipeDoJogo = normais[0].naipe;
    if (!normais.every(c => c.naipe === naipeDoJogo)) return false;
    let valoresOrdenados = normais.map(c => valoresCartas[c.valor]).sort((a, b) => a - b);
    if (valoresOrdenados.includes(1) && valoresOrdenados.includes(13)) {
        valoresOrdenados = valoresOrdenados.filter(v => v !== 1);
        valoresOrdenados.push(14);
        valoresOrdenados.sort((a, b) => a - b);
    }
    for (let i = 0; i < valoresOrdenados.length - 1; i++) {
        if (valoresOrdenados[i] === valoresOrdenados[i+1]) return false;
    }
    let gaps = 0;
    for (let i = 0; i < valoresOrdenados.length - 1; i++) {
        gaps += valoresOrdenados[i+1] - valoresOrdenados[i] - 1;
    }
    if (curingas.length < gaps) return false;
    const isNaipeVermelho = naipeDoJogo === '♥️' || naipeDoJogo === '♦️';
    if (curingas.length <= 1) return true;
    if (curingas.length === 2) {
        if (isNaipeVermelho) return false;
        const temAs = normais.some(c => c.valor === 'A');
        const temDoisNatural = normais.some(c => c.valor === '2' && c.naipe === naipeDoJogo);
        return temAs && temDoisNatural;
    }
    if (curingas.length > 2) return false;
    return true;
}

function baixarJogoSelecionado() {
    if (podeComprar) return;
    if (validarJogo(cartasSelecionadas.map(c => c))) {
        const jogoParaBaixar = cartasSelecionadas.map(c => ({...c}));
        jogosBaixados.push({ cartas: jogoParaBaixar, tipo: 'jogo', pontos: 0, dono: jogadorAtual });
        const indicesParaRemover = cartasSelecionadas.map(c => c.index).sort((a, b) => b - a);
        indicesParaRemover.forEach(index => jogadores[jogadorAtual].splice(index, 1));
        cartasSelecionadas = [];
        verificarCanastras();
        renderizarTudo();
        animarCartasBaixadas(jogosBaixados.length - 1, false);
        if (jogadores[jogadorAtual].length === 0) {
            verificarBatida();
        }
    } else {
        alert("Jogo inválido!");
        cartasSelecionadas = [];
        renderizarTudo();
    }
}

function descartarCartaSelecionada() {
    if (podeComprar) return;
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
    if (jogadores[jogadorAtual].length === 0) {
        verificarBatida();
    } else {
        podeComprar = true;
        renderizarTudo();
        animarCarta(document.getElementById('lixo'), false);
    }
}

function adicionarCartaAoJogo(jogoIndex) {
    if (podeComprar) { return; }
    if (cartasSelecionadas.length === 0) { return; }
    const jogo = jogosBaixados[jogoIndex];
    if (jogo.dono !== jogadorAtual && jogo.dono % 2 !== jogadorAtual % 2) {
        alert("Você só pode adicionar cartas aos jogos da sua dupla.");
        return;
    }
    const cartasParaAdicionar = cartasSelecionadas.map(c => ({ ...c }));
    const todasCartas = [...jogo.cartas, ...cartasParaAdicionar];
    if (!validarJogo(todasCartas)) {
        alert("As cartas selecionadas não são válidas para este jogo.");
        cartasSelecionadas = [];
        renderizarTudo();
        return;
    }
    jogo.cartas.push(...cartasParaAdicionar);
    jogo.cartas.sort((a, b) => valoresCartas[a.valor] - valoresCartas[b.valor]);
    const indicesParaRemover = cartasSelecionadas.map(c => c.index).sort((a, b) => b - a);
    indicesParaRemover.forEach(index => jogadores[jogadorAtual].splice(index, 1));
    cartasSelecionadas = [];
    verificarCanastras();
    renderizarTudo();
    animarCartasBaixadas(jogoIndex, false);
    if (jogadores[jogadorAtual].length === 0) {
        verificarBatida();
    }
}

function verificarCanastras() {
    jogosBaixados.forEach(jogo => {
        if (jogo.cartas.length >= 7 && jogo.tipo === 'jogo') {
            const temCuringa = jogo.cartas.some(c => c.valor === '2');
            if (temCuringa) {
                jogo.tipo = 'Canastra Suja';
                jogo.pontos = 200;
            } else {
                jogo.tipo = 'Canastra Limpa';
                jogo.pontos = 500;
            }
        }
    });
}

function verificarBatida() {
    const temCanastraLimpa = jogosBaixados.some(j => (j.dono === jogadorAtual || j.dono % 2 === jogadorAtual % 2) && j.tipo === 'Canastra Limpa');
    if (temCanastraLimpa) {
        finalizarRodada(true);
    } else {
        alert("Batida inválida! Sua dupla precisa de pelo menos uma Canastra Limpa na mesa para bater.");
    }
}

function finalizarRodada(houveBatida) {
    let placarRodadaDupla1 = 0;
    let placarRodadaDupla2 = 0;

    jogosBaixados.forEach(jogo => {
        let pontosDoJogo = jogo.pontos;
        jogo.cartas.forEach(carta => {
             if (!isTresVermelho(carta)) {
                pontosDoJogo += pontosPorCarta[carta.valor] || 0;
            }
        });
        if (jogo.dono === 0 || jogo.dono === 2) {
            placarRodadaDupla1 += pontosDoJogo;
        } else {
            placarRodadaDupla2 += pontosDoJogo;
        }
    });

    if (houveBatida) {
        if (jogadorAtual === 0 || jogadorAtual === 2) {
            placarRodadaDupla1 += 100;
        } else {
            placarRodadaDupla2 += 100;
        }
    }
    
    const dupla1FezCanastra = jogosBaixados.some(j => (j.dono === 0 || j.dono === 2) && j.cartas.length >= 7);
    const dupla2FezCanastra = jogosBaixados.some(j => (j.dono === 1 || j.dono === 3) && j.cartas.length >= 7);
    tresVermelhosBaixados.forEach(item => {
        if (item.dono === 0 || item.dono === 2) {
            placarRodadaDupla1 += dupla1FezCanastra ? 100 : -100;
        } else if (item.dono === 1 || item.dono === 3) {
            placarRodadaDupla2 += dupla2FezCanastra ? 100 : -100;
        }
    });
    
    jogadores.forEach((mao, index) => {
        let pontosNegativos = 0;
        mao.forEach(carta => {
            pontosNegativos += pontosPorCarta[carta.valor] || 0;
        });
        if (index === 0 || index === 2) {
            placarRodadaDupla1 -= pontosNegativos;
        } else {
            placarRodadaDupla2 -= pontosNegativos;
        }
    });
    
    placarGeralDupla1 += placarRodadaDupla1;
    placarGeralDupla2 += placarRodadaDupla2;

    if (placarGeralDupla1 >= 1500) dupla1Vulneravel = true;
    if (placarGeralDupla2 >= 1500) dupla2Vulneravel = true;

    let mensagem = `FIM DA RODADA!\n\n`;
    if (houveBatida) {
        mensagem += `O jogador ${jogadorAtual + 1} bateu!\n\n`;
    }
    mensagem += `PONTUAÇÃO DA RODADA:\n`;
    mensagem += `Dupla 1 (J1 & J3): ${placarRodadaDupla1} pontos\n`;
    mensagem += `Dupla 2 (J2 & J4): ${placarRodadaDupla2} pontos\n\n`;
    mensagem += `PLACAR GERAL:\n`;
    mensagem += `Dupla 1: ${placarGeralDupla1} pontos\n`;
    mensagem += `Dupla 2: ${placarGeralDupla2} pontos\n`;
    
    alert(mensagem);
    atualizarPlacarGeral();

    if (placarGeralDupla1 >= 3000 || placarGeralDupla2 >= 3000) {
        let vencedor = placarGeralDupla1 >= placarGeralDupla2 ? "Dupla 1" : "Dupla 2";
        alert(`FIM DE JOGO! A ${vencedor} venceu a partida!`);
        placarGeralDupla1 = 0; placarGeralDupla2 = 0; dupla1Vulneravel = false; dupla2Vulneravel = false;
        setTimeout(iniciarPartida, 5000);
    } else {
        setTimeout(() => {
            alert("Iniciando nova rodada...");
            iniciarPartida();
        }, 8000);
    }

    document.getElementById('acoes-container').style.display = 'none';
    podeComprar = false;
}

function calcularPontosDeCartas(cartas) {
    return cartas.reduce((soma, carta) => {
        return soma + (pontosPorCarta[carta.valor] || 0);
    }, 0);
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
function animarCartasBaixadas(jogoIndex, permanente) {
    const jogoContainer = document.getElementById('jogos-baixados').children[jogoIndex];
    if(jogoContainer) jogoContainer.querySelectorAll('.carta').forEach(c => animarCarta(c, permanente));
}

function renderizarTudo() {
    document.getElementById('btn-baixar-jogo').style.display = podeComprar ? 'none' : 'inline-block';
    document.getElementById('btn-descartar').style.display = podeComprar ? 'none' : 'inline-block';
    const maoJogadorDiv = document.getElementById('mao-jogador');
    maoJogadorDiv.innerHTML = '';
    jogadores[jogadorAtual].forEach((carta, index) => {
        const cartaDiv = document.createElement('div');
        cartaDiv.classList.add('carta');
        cartaDiv.dataset.id = carta.id;
        if (carta.naipe === '♥️' || carta.naipe === '♦️') cartaDiv.classList.add('vermelha');
        if (cartasSelecionadas.some(c => c.index === index)) cartaDiv.classList.add('selecionada');
        if (idCartaComprada === carta.id) {
            cartaDiv.classList.add('carta-comprada');
        }
        cartaDiv.textContent = `${carta.valor}${carta.naipe}`;
        cartaDiv.addEventListener('click', () => selecionarCarta(carta, index));
        maoJogadorDiv.appendChild(cartaDiv);
    });
    const lixoDiv = document.getElementById('lixo');
    lixoDiv.innerHTML = '';
    lixoDiv.classList.remove('travado');
    if (lixo.length > 0) {
        const topoLixo = lixo[lixo.length - 1];
        lixoDiv.textContent = `${topoLixo.valor}${topoLixo.naipe}`;
        lixoDiv.classList.toggle('vermelha', topoLixo.naipe === '♥️' || topoLixo.naipe === '♦️');
        if (isTresPreto(topoLixo)) lixoDiv.classList.add('travado');
    }
    const jogosBaixadosDiv = document.getElementById('jogos-baixados');
    jogosBaixadosDiv.innerHTML = '';
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
        jogoDiv.addEventListener('click', () => adicionarCartaAoJogo(index));
        jogo.cartas.forEach(carta => {
            const cartaDiv = document.createElement('div');
            cartaDiv.classList.add('carta');
            cartaDiv.dataset.id = carta.id;
            if (carta.naipe === '♥️' || carta.naipe === '♦️') cartaDiv.classList.add('vermelha');
            cartaDiv.textContent = `${carta.valor}${carta.naipe}`;
            jogoDiv.appendChild(cartaDiv);
        });
        container.appendChild(jogoDiv);
        jogosBaixadosDiv.appendChild(container);
    });
    const tresVermelhosDiv = document.getElementById('tres-vermelhos');
    tresVermelhosDiv.innerHTML = '';
    tresVermelhosBaixados.forEach(item => {
        const cartaDiv = document.createElement('div');
        cartaDiv.classList.add('carta', 'vermelha');
        cartaDiv.dataset.id = item.carta.id;
        cartaDiv.textContent = `${item.carta.valor}${item.carta.naipe}`;
        tresVermelhosDiv.appendChild(cartaDiv);
    });
}

function atualizarPlacarGeral() {
    document.getElementById('placar-dupla1').textContent = placarGeralDupla1;
    document.getElementById('placar-dupla2').textContent = placarGeralDupla2;
    document.getElementById('status-dupla1').textContent = dupla1Vulneravel ? 'Vulnerável!' : '';
    document.getElementById('status-dupla2').textContent = dupla2Vulneravel ? 'Vulnerável!' : '';
}

function adicionarEventListeners() {
    document.getElementById('monte-compra').onclick = comprarDoMonte;
    document.getElementById('lixo').onclick = comprarDoLixo;
    document.getElementById('btn-baixar-jogo').onclick = baixarJogoSelecionado;
    document.getElementById('btn-descartar').onclick = descartarCartaSelecionada;
}

iniciarPartida();