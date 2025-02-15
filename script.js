let situacaoAtual = null;
let personagensQuestionados = 0;
let fbfDimacs = [];

document.addEventListener("DOMContentLoaded", async () => {
    // $('#historyModal').modal('show');
    await carregarSituacao();
    configurarEventosPersonagens();
    configurarBotaoResolver();
});

$('#historyModal').on('shown.bs.modal', function () {
    let text = $("#storyText").data("full-text");
    $("#storyText").text('');
    efeitoDeEscrever("#storyText", text, 40);
});

async function carregarSituacao() {
    try {
        const response = await fetch("data.json");
        const dados = await response.json();
        const situacoes = Object.keys(dados.situacoes);
        const sorteada = situacoes[Math.floor(Math.random() * situacoes.length)];
        situacaoAtual = dados.situacoes[sorteada];
    } catch (error) {
        alert("Erro ao escolher uma situação. Recarregue a página.");
    }
}

function configurarEventosPersonagens() {
    document.querySelectorAll(".character-card").forEach(card => {
        card.addEventListener("click", () => {
            const nomePersonagem = card.querySelector("h3").innerText;
            const cargoPersonagem = card.querySelector("h4").innerText;
            mostrarDialogo(nomePersonagem, cargoPersonagem, card);
        });
    });
}

function mostrarDialogo(nomePersonagem, cargoPersonagem, card) {
    const questionsModal = $("#questionsModal");

    questionsModal.find(".dialogue-title").text(`${nomePersonagem} - ${cargoPersonagem}`);
    const modalBody = questionsModal.find(".modal-body");

    if (cargoPersonagem === "Marido") {
        modalBody.html(`<p>Meu Deus, o que será que eu fiz? E lá vamos nós de novo...</p>`);
    } else if (situacaoAtual[cargoPersonagem]) {
        const fala = situacaoAtual[cargoPersonagem].fala;

        modalBody.html(`<p>${fala}</p>`);

        if (!$(card).data('opened')) {
            const fbf = situacaoAtual[cargoPersonagem].fbf;
            const dimacs = situacaoAtual[cargoPersonagem].dimacs;

            fbfDimacs.push(dimacs);

            document.getElementById("notes-text").innerHTML += `<p><b>${nomePersonagem}:</b> ${fbf}</p>`;

            $(card).data('opened', 'true');
            // console.log($(card), $(card).find('checkmark'));
            $(card).find('.checkmark').removeClass('d-none');

            personagensQuestionados++;
        }
    }

    questionsModal.modal('show');
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

function efeitoDeEscrever(element, text, speed) {
    let i = 0;

    function escrevendo() {
        if (i < text.length) {
            if (text.charAt(i) === '|') {
                $(element).append('<br>');
            } else {
                $(element).append(text.charAt(i));
            }
            i++;
            setTimeout(escrevendo, speed);
        }
    }

    escrevendo();
}
