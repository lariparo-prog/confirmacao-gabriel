const API_URL = "https://script.google.com/macros/s/AKfycbykNrT7BkY_JRHqMD_yNKRFWnXgYWZjzTOiE8rB3CbneXwa7ljfTENWbQlhOWHzP8PB/exec";

let nomeConvidado = "";
let quantidadeAdultos = 1;
let quantidadeCriancas = 0;
let codigoConvidado = "";
let convidadoEscolhido = null;
let tempoBusca = null;
let numeroDaBusca = 0;

window.onload = function () {
    const busca = document.getElementById("buscaNome");

    if (busca) {
        busca.addEventListener("input", function () {
            clearTimeout(tempoBusca);

            tempoBusca = setTimeout(function () {
                buscarConvidados();
            }, 100);
        });
    }
};

function mostrarTela(idTela) {
    document.getElementById("tela1").classList.add("escondido");
    document.getElementById("tela2").classList.add("escondido");
    document.getElementById("loading").classList.add("escondido");
    document.getElementById("tela3").classList.add("escondido");
    document.getElementById("tela4").classList.add("escondido");

    document.getElementById(idTela).classList.remove("escondido");
}

async function buscarConvidados() {
    const buscaAtual = ++numeroDaBusca;
    const texto = document.getElementById("buscaNome").value.trim();
    const area = document.getElementById("listaConvidados");

    area.innerHTML = "";
    convidadoEscolhido = null;

    document.getElementById("convidadoSelecionado").classList.add("escondido");
    document.getElementById("convidadoSelecionado").innerHTML = "";

    if (texto.length < 1) {
        return;
    }

    try {
        const resposta = await fetch(API_URL + "?acao=buscarConvidados&nome=" + encodeURIComponent(texto));
        const dados = await resposta.json();

        if (buscaAtual !== numeroDaBusca) {
            return;
        }

        area.innerHTML = "";

        if (!dados.sucesso || !dados.convidados || dados.convidados.length === 0) {
            area.innerHTML = "<p class='subtitulo'>Nenhum convidado encontrado.</p>";
            return;
        }

        const chaves = new Set();

        dados.convidados.forEach(function (item) {
            const chave = String(item.codigo || "").trim();

            if (chaves.has(chave)) {
                return;
            }

            chaves.add(chave);

            const botao = document.createElement("button");
            botao.type = "button";
            botao.innerHTML = item.nome;

            botao.onclick = function () {
                escolherConvidado(item);
            };

            area.appendChild(botao);
        });

    } catch (erro) {
        if (buscaAtual === numeroDaBusca) {
            area.innerHTML = "<p class='subtitulo'>Erro ao buscar convidados.</p>";
        }
    }
}

function escolherConvidado(item) {
    convidadoEscolhido = item;

    codigoConvidado = item.codigo;
    nomeConvidado = item.nome;
    quantidadeAdultos = Number(item.adultos) || 0;
    quantidadeCriancas = Number(item.criancas) || 0;

    document.getElementById("buscaNome").value = item.nome;
    document.getElementById("listaConvidados").innerHTML = "";

    const area = document.getElementById("convidadoSelecionado");

    area.classList.remove("escondido");
    area.innerHTML = `
        <div class="contador">
            <span>Convidado selecionado</span>
            <strong style="color:#007a33; font-size:22px;">${item.nome}</strong>
            <p class="subtitulo">
                👨 Adultos: ${quantidadeAdultos}<br>
                🧒 Crianças: ${quantidadeCriancas}
            </p>
        </div>
    `;
}

function conferirConvidadoSelecionado() {
    if (!convidadoEscolhido) {
        alert("Digite seu nome e selecione um convidado da lista.");
        return false;
    }

    return true;
}

function processarConfirmacao() {
    if (!conferirConvidadoSelecionado()) {
        return;
    }

    mostrarTela("loading");

    setTimeout(function () {
        finalizarConfirmacao();
    }, 1200);
}

function processarNaoComparecimento() {
    if (!conferirConvidadoSelecionado()) {
        return;
    }

    mostrarTela("loading");

    setTimeout(function () {
        finalizarNaoComparecimento();
    }, 1200);
}

function gerarLinkValidacao() {
    let caminhoAtual = window.location.href;
    let pastaProjeto = caminhoAtual.substring(0, caminhoAtual.lastIndexOf("/") + 1);

    return pastaProjeto + "validar.html?codigo=" + encodeURIComponent(codigoConvidado);
}

function gerarQRCode() {
    let linkValidacao = gerarLinkValidacao();
    let areaQR = document.getElementById("qrImagem");

    areaQR.innerHTML = "";

    new QRCode(areaQR, {
        text: linkValidacao,
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

async function salvarConfirmacao(statusResposta) {
    let confirmacao = {
        acao: "salvar",
        nome: nomeConvidado,
        adultos: quantidadeAdultos,
        criancas: quantidadeCriancas,
        codigo: codigoConvidado,
        data: new Date().toLocaleString("pt-BR"),
        status: statusResposta
    };

    await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(confirmacao)
    });
}

async function finalizarConfirmacao() {
    await salvarConfirmacao("confirmado");

    mostrarTela("tela3");

    document.getElementById("nomeConfirmado").innerHTML = nomeConvidado;

    let totalParticipantes = quantidadeAdultos + quantidadeCriancas;

    let resumo = "👥 " + totalParticipantes + " participante";

    if (totalParticipantes > 1) {
        resumo += "s";
    }

    document.getElementById("resumoFinal").innerHTML = resumo;

    document.querySelector(".codigo").innerHTML = "🎟️ " + codigoConvidado;

    gerarQRCode();
}

async function finalizarNaoComparecimento() {
    await salvarConfirmacao("não comparecerá");

    mostrarTela("tela4");

    document.getElementById("nomeNaoVai").innerHTML =
        nomeConvidado + "<br>Resposta: não comparecerá.";
}

function salvarComprovante() {
    let comprovante = document.getElementById("tela3");
    let botaoSalvar = document.querySelector(".botao-salvar");

    botaoSalvar.style.display = "none";
    comprovante.classList.remove("animado");

    let areaExportacao = document.createElement("div");

    areaExportacao.style.width = "420px";
    areaExportacao.style.minHeight = "760px";
    areaExportacao.style.padding = "36px 26px";
    areaExportacao.style.background = "linear-gradient(90deg,#0b8b2f 0%,#f3df3d 50%,#0f6ec9 100%)";
    areaExportacao.style.display = "flex";
    areaExportacao.style.justifyContent = "center";
    areaExportacao.style.alignItems = "flex-start";

    let marcador = document.createElement("div");

    comprovante.parentNode.insertBefore(marcador, comprovante);
    document.body.appendChild(areaExportacao);
    areaExportacao.appendChild(comprovante);

    setTimeout(function () {
        html2canvas(areaExportacao, {
            scale: 3,
            useCORS: true,
            backgroundColor: null
        }).then(function (canvas) {
            let link = document.createElement("a");

            link.download = "comprovante-" + codigoConvidado + ".png";
            link.href = canvas.toDataURL("image/png");

            link.click();

            marcador.parentNode.insertBefore(comprovante, marcador);
            marcador.remove();
            areaExportacao.remove();

            botaoSalvar.style.display = "block";

            alert("Comprovante salvo com sucesso! ⚽");
        });
    }, 500);
}
