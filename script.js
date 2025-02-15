let situacaoAtual = null;
let fbfDimacs = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarSituacao();
    configurarEventosPersonagens();
    configurarBotaoResolver();
});

async function carregarSituacao() {
    try {
        const response = await fetch("data.json");
        const dados = await response.json();
        const situacoes = Object.keys(dados.situacoes);
        const sorteada = situacoes[Math.floor(Math.random() * situacoes.length)];
        situacaoAtual = dados.situacoes[sorteada];
        document.getElementById("notes-title").innerText = `FBF's encontradas`;
    } catch (error) {
        console.error("Erro ao carregar as situações:", error);
    }
}

function configurarEventosPersonagens() {
    document.querySelectorAll(".character-card").forEach(card => {
        card.addEventListener("click", () => {
            const nomePersonagem = card.querySelector("h3").innerText;
            const cargoPersonagem = card.querySelector("h4").innerText
            mostrarDialogo(nomePersonagem, cargoPersonagem);
        });
    });
}

function mostrarDialogo(nomePersonagem, cargoPersonagem) {
    const modalChar = document.querySelector(".dialogue-title");
    const modalBody = document.querySelector(".modal-body");
    modalChar.innerHTML = nomePersonagem
    modalBody.innerHTML = "";

    if (cargoPersonagem === "Marido") {
        modalBody.innerHTML = `<p>O que eu fiz?</p>`;
    } else if (situacaoAtual[cargoPersonagem]) {
        const fala = situacaoAtual[cargoPersonagem].fala;
        const fbf = situacaoAtual[cargoPersonagem].fbf;
        const dimacs = situacaoAtual[cargoPersonagem].dimacs;

        modalBody.innerHTML = `<p>${fala}</p>`;
        document.getElementById("notes-text").innerHTML += `<p>${fbf}</p>`;
        fbfDimacs.push(dimacs);
    }

    const modal = new bootstrap.Modal(document.getElementById("questionsModal"));
    modal.show();
}

function configurarBotaoResolver() {
    document.getElementById("resolver-btn").addEventListener("click", () => {
        resolverCaso();
    });
}

function resolverCaso() {
    console.log("FBFs em formato DIMACS:", fbfDimacs);
    alert("Resolução do caso não implementada ainda!");
}
