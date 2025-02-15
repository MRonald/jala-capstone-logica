let situacaoAtual = null;
let sorteada = ""; // Declarada globalmente
let personagensQuestionados = 0;
let casoResolvido = false;
let fbfDimacs = [];
let fbfFinal = "";

document.addEventListener("DOMContentLoaded", async () => {
    $('#historyModal').modal('show');
    await carregarSituacao();
    configurarEventosPersonagens();
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
        sorteada = situacoes[Math.floor(Math.random() * situacoes.length)]; // Atribuição à variável global
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
            adicionarNaFbfFinal(fbf);

            $(card).data('opened', 'true');
            $(card).find('.checkmark').removeClass('d-none');

            personagensQuestionados++;
        }
    }

    questionsModal.modal('show');

    if (personagensQuestionados == 5 && !casoResolvido) {
        resolverCasoAoFecharModal();
    }
}

function resolverCasoAoFecharModal() {
    $('#questionsModal').on('hidden.bs.modal', resolverCaso);
}

function resolverCaso() {
    $('#notes-text').append('<hr>');
    $('#notes-text').append('<p>Para resolver essa questão podemos usar o <a href="https://pysathq.github.io/" target="_blank">SAT Solver</a>.</p>');
    $('#notes-text').append('<p>Precisamos antes aplicar a conjunção nas fórmulas acima e converter toda a expressão para FNC.</p>');
    $('#notes-text').append(`<p>A expressão final no formato DIMACS fica: <b>${fbfDimacs.join(", ")}</b></p>`);
    
    // Exibindo apenas a situação sorteada
    $('#notes-text').append(`<p><b>Situação:</b> ${sorteada}</p>`);
    
    $('#notes-text').append(`
        <div class="d-flex">
            <button type="button" class="btn btn-primary me-2" onclick="copiarDimacsFinal()">Copiar DIMACS</button>
            <a href="https://truth-table.com/#${fbfFinal}" target="_blank" class="btn btn-primary">Ver tabela verdade</a>
        </div>
    `);

    // Removendo evento do modal após caso resolvido
    $('#questionsModal').off('hidden.bs.modal', resolverCaso);

    casoResolvido = true;
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

function adicionarNaFbfFinal(fbf) {
    if (fbfFinal.length !== 0) fbfFinal += " ∧ ";

    fbfFinal += `(${fbf})`;
}

function copiarDimacsFinal() {
    const codigo = `
from pysat.formula import CNF
from pysat.solvers import Solver

# create a satisfiable CNF formula "(-x1 ∨ x2) ∧ (-x1 ∨ -x2)":
cnf = CNF(from_clauses=[${fbfDimacs.join(", ")}])

# create a SAT solver for this formula:
with Solver(bootstrap_with=cnf) as solver:
    # 1.1 call the solver for this formula:
    print('formula is', f'{"s" if solver.solve() else "uns"}atisfiable')

    # 1.2 the formula is satisfiable and so has a model:
    print('and the model is:', solver.get_model())

    # 2.1 apply the MiniSat-like assumption interface:
    print('formula is',
        f'{"s" if solver.solve(assumptions=[1, 2]) else "uns"}atisfiable',
        'assuming x1 and x2')

    # 2.2 the formula is unsatisfiable,
    # i.e. an unsatisfiable core can be extracted:
    print('and the unsatisfiable core is:', solver.get_core())
    `;

    navigator.clipboard.writeText(codigo)
        .then(() => {
            alert('Código para o SAT Solver copiado para a área de transferência')
        })
        .catch(err => {
            alert('Erro ao copiar DIMACS');
        });
}
