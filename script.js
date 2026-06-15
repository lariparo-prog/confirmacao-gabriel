const API_URL = "https://script.google.com/macros/s/AKfycbykNrT7BkY_JRHqMD_yNKRFWnXgYWZjzTOiE8rB3CbneXwa7ljfTENWbQlhOWHzP8PB/exec";

let nomeConvidado = "";
let quantidadeAdultos = 1;
let quantidadeCriancas = 0;
let codigoConvidado = "";

function mostrarTela(idTela) {
    document.getElementById("tela1").classList.add("escondido");
    document.getElementById("tela2").classList.add("escondido");
    document.getElementById("loading").classList.add("escondido");
    document.getElementById("tela3").classList.add("escondido");

    document.getElementById(idTela).classList.remove("escondido");
}

function irParaParticipantes() {
    let nome = document.getElementById("nome").value;

    if (nome.trim() === "") {
        alert("Digite seu nome para confirmar presença.");
        return;
    }

    nomeConvidado = nome.trim();

    mostrarTela("tela2");
}

function aumentarAdultos() {
    quantidadeAdultos++;
    document.getElementById("adultos").innerHTML = quantidadeAdultos;
}

function diminuirAdultos() {
    if (quantidadeAdultos > 1) {
        quantidadeAdultos--;
        document.getElementById("adultos").innerHTML = quantidadeAdultos;
    }
}

function aumentarCriancas() {
    quantidadeCriancas++;
    document.getElementById("criancas").innerHTML = quantidadeCriancas;
}

function diminuirCriancas() {
    if (quantidadeCriancas > 0) {
        quantidadeCriancas--;
        document.getElementById("criancas").innerHTML = quantidadeCriancas;
    }
}

function processarConfirmacao() {
    mostrarTela("loading");

    setTimeout(function () {
        finalizarConfirmacao();
    }, 1200);
}

async function gerarCodigo() {
    try {
        const resposta = await fetch(API_URL + "?acao=listar");
        const dados = await resposta.json();

        let quantidadeConfirmacoes = 0;

        if (dados.sucesso && dados.confirmacoes) {
            quantidadeConfirmacoes = dados.confirmacoes.length;
        }

        let proximoNumero = quantidadeConfirmacoes + 1;

        return "G10-" + String(proximoNumero).padStart(3, "0");

    } catch (erro) {
        let numeroEmergencia = Date.now().toString().slice(-3);
        return "G10-" + numeroEmergencia;
    }
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

async function salvarConfirmacao() {
    codigoConvidado = await gerarCodigo();

    let confirmacao = {
        acao: "salvar",
        nome: nomeConvidado,
        adultos: quantidadeAdultos,
        criancas: quantidadeCriancas,
        codigo: codigoConvidado,
        data: new Date().toLocaleString("pt-BR"),
        status: "confirmado"
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
    await salvarConfirmacao();

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
