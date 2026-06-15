const parametros = new URLSearchParams(window.location.search);

const codigoRecebido = parametros.get("codigo");

const lista = JSON.parse(localStorage.getItem("confirmacoes")) || [];

const indice = lista.findIndex(
    item => item.codigo === codigoRecebido
);

const convidado = lista[indice];

if(convidado){

    if(convidado.status === "utilizado"){

        document.getElementById("status").innerHTML = "⚠️";

        document.getElementById("titulo").innerHTML =
            "QR já utilizado";

        document.getElementById("nome").innerHTML =
            convidado.nome;

        document.getElementById("dados").innerHTML =
            "Entrada já registrada.";

        document.getElementById("codigo").innerHTML =
            "🎟️ " + convidado.codigo;

    }
    else{

        document.getElementById("status").innerHTML = "✅";

        document.getElementById("titulo").innerHTML =
            "Entrada liberada";

        document.getElementById("nome").innerHTML =
            convidado.nome;

        document.getElementById("dados").innerHTML =
            "👨 Adultos: " + convidado.adultos + "<br>" +
            "🧒 Crianças: " + convidado.criancas;

        document.getElementById("codigo").innerHTML =
            "🎟️ " + convidado.codigo;

        lista[indice].status = "utilizado";

        localStorage.setItem(
            "confirmacoes",
            JSON.stringify(lista)
        );
    }

}
else{

    document.getElementById("status").innerHTML = "❌";

    document.getElementById("titulo").innerHTML =
        "Convite inválido";

    document.getElementById("nome").innerHTML = "";

    document.getElementById("dados").innerHTML =
        "Este código não foi encontrado na lista.";

    document.getElementById("codigo").innerHTML = "";
}