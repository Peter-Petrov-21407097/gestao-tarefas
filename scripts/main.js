
// Variáveis

const titulo_node = document.querySelector("#titulo");
const prioridade_node = document.querySelector("#prioridade");
const user_node = document.querySelector("#user");
const data_hora_node = document.querySelector("#data-hora");

const form_nova_node = document.querySelector("#form-nova-tarefa");
const ul_node = document.querySelector("#lista");
const mensagem_vazia_node = document.querySelector("#mensagem-vazia");

const pesquisa_node = document.querySelector("#pesquisa");
const filtro_prioridade_node = document.querySelector("#filtro-prioridade");
const filtro_estado_node = document.querySelector("#filtro-estado");

const total_node = document.querySelector("#total-tarefas");
const pendentes_node = document.querySelector("#tarefas-pendentes");
const concluidas_node = document.querySelector("#tarefas-concluidas");

const modal_editar_node = document.querySelector("#modal-editar");
const form_editar_node = document.querySelector("#form-editar");
const edit_id_node = document.querySelector("#edit-id");
const edit_titulo_node = document.querySelector("#edit-titulo");
const edit_prioridade_node = document.querySelector("#edit-prioridade");
const edit_user_node = document.querySelector("#edit-user");
const edit_data_hora_node = document.querySelector("#edit-data-hora");
const fechar_modal_node = document.querySelector("#fechar-modal");

const modal_apagar_node = document.querySelector("#modal-apagar");
const confirmar_apagar_node = document.querySelector("#confirmar-apagar");
const cancelar_apagar_node = document.querySelector("#cancelar-apagar");

const STORAGE_KEY = "taskflow-tarefas";

let tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tarefa_para_apagar = null;

// Guardar tarefas

function guardarTarefas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

// Atualizar estatisticas

function atualizarEstatisticas() {
    total_node.textContent = tarefas.length;

    pendentes_node.textContent = tarefas.filter(
        (tarefa) => tarefa.estado === "pendente"
    ).length;

    concluidas_node.textContent = tarefas.filter(
        (tarefa) => tarefa.estado === "concluida"
    ).length;
}

// Apresentar tarefas

function listarTarefas() {
    ul_node.innerHTML = "";

    const pesquisa = pesquisa_node.value.trim().toLowerCase();
    const prioridade_selecionada = filtro_prioridade_node.value;
    const estado_selecionado = filtro_estado_node.value;

    const tarefas_filtradas = tarefas.filter((tarefa) => {
        const corresponde_pesquisa = tarefa.titulo.toLowerCase().includes(pesquisa);

        const corresponde_prioridade =
            prioridade_selecionada === "todas" ||
            tarefa.prioridade === Number(prioridade_selecionada);

        const corresponde_estado =
            estado_selecionado === "todos" ||
            tarefa.estado === estado_selecionado;

        return (
            corresponde_pesquisa &&
            corresponde_prioridade &&
            corresponde_estado
        );
    });

    mensagem_vazia_node.hidden = tarefas_filtradas.length !== 0;

    if (tarefas.length > 0 && tarefas_filtradas.length === 0) {
        mensagem_vazia_node.textContent = "Não foram encontradas tarefas.";
    } else {
        mensagem_vazia_node.textContent =
            "Ainda não existem tarefas. Adiciona a tua primeira tarefa!";
    }

    const prioridades = {
        1: "Baixa",
        2: "Média",
        3: "Alta"
    };

    const simbolos_prioridade = {
        1: "🟢",
        2: "🟡",
        3: "🔴"
    };

    tarefas_filtradas.forEach((tarefa) => {
        const li = document.createElement("li");

        li.classList.add("tarefa");
        li.classList.add(`prioridade-${tarefa.prioridade}`);

        if (tarefa.estado === "concluida") {
            li.classList.add("concluida");
        }

        const descricao = document.createElement("span");
        descricao.textContent = tarefa.titulo;

        const responsavel = document.createElement("span");
        responsavel.textContent = `Responsável: ${tarefa.user}`;

        const prioridade = document.createElement("span");
        prioridade.textContent = simbolos_prioridade[tarefa.prioridade];
        prioridade.classList.add("simbolo-prioridade");
        prioridade.title = prioridades[tarefa.prioridade];

        const data_hora = document.createElement("span");

        data_hora.textContent = tarefa.dataHora
            ? new Date(tarefa.dataHora).toLocaleString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
            : "Sem data definida";

        const estado = document.createElement("span");
        estado.textContent =
            tarefa.estado === "pendente" ? "Pendente" : "Concluída";

        // Botão de estado

        const btn_estado = document.createElement("button");
        btn_estado.textContent =
            tarefa.estado === "pendente" ? "Concluir" : "Reabrir";
        btn_estado.type = "button";
        btn_estado.onclick = () => alterarEstado(tarefa.id);
        btn_estado.classList.add("btn-estado");

        // Botão de edição

        const btn_editar = document.createElement("button");
        btn_editar.textContent = "Editar";
        btn_editar.type = "button";
        btn_editar.onclick = () => editarTarefa(tarefa.id);
        btn_editar.classList.add("btn-editar");

        // Botão de eliminação

        const btn_apagar = document.createElement("button");
        btn_apagar.textContent = "Eliminar";
        btn_apagar.type = "button";
        btn_apagar.onclick = () => eliminarTarefa(tarefa.id);
        btn_apagar.classList.add("btn-apagar");

        li.append(
            descricao,
            responsavel,
            prioridade,
            data_hora,
            estado,
            btn_estado,
            btn_editar,
            btn_apagar
        );

        ul_node.append(li);
    });

    atualizarEstatisticas();
}

// Criar tarefa

function criarTarefa(event) {
    event.preventDefault();

    const nova_tarefa = {
        id: Date.now(),
        titulo: titulo_node.value.trim(),
        prioridade: Number(prioridade_node.value),
        user: user_node.value.trim(),
        dataHora: data_hora_node.value,
        estado: "pendente"
    };

    if (
        !nova_tarefa.titulo ||
        !nova_tarefa.user ||
        !nova_tarefa.dataHora ||
        ![1, 2, 3].includes(nova_tarefa.prioridade)
    ) {
        alert("Preenche todos os campos corretamente.");
        return;
    }

    tarefas.push(nova_tarefa);

    guardarTarefas();
    listarTarefas();

    form_nova_node.reset();
}

// Alterar estado da tarefa

function alterarEstado(id) {
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    if (!tarefa) return;

    tarefa.estado =
        tarefa.estado === "pendente" ? "concluida" : "pendente";

    guardarTarefas();
    listarTarefas();
}

// Editar tarefa

function editarTarefa(id) {
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    if (!tarefa) return;

    edit_id_node.value = tarefa.id;
    edit_titulo_node.value = tarefa.titulo;
    edit_prioridade_node.value = tarefa.prioridade;
    edit_user_node.value = tarefa.user;
    edit_data_hora_node.value = tarefa.dataHora || "";

    modal_editar_node.showModal();
}

// Atualizar tarefa

function atualizarTarefa(event) {
    event.preventDefault();

    const id = Number(edit_id_node.value);
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    if (!tarefa) return;

    const titulo = edit_titulo_node.value.trim();
    const user = edit_user_node.value.trim();
    const prioridade = Number(edit_prioridade_node.value);
    const dataHora = edit_data_hora_node.value;

    if (
        !titulo ||
        !user ||
        !dataHora ||
        ![1, 2, 3].includes(prioridade)
    ) {
        alert("Preenche todos os campos corretamente.");
        return;
    }

    tarefa.titulo = titulo;
    tarefa.user = user;
    tarefa.prioridade = prioridade;
    tarefa.dataHora = dataHora;

    guardarTarefas();
    listarTarefas();

    modal_editar_node.close();
}

// Eliminar tarefa

function eliminarTarefa(id) {
    tarefa_para_apagar = id;

    modal_apagar_node.showModal();
}

// Confirmar eliminacao

function confirmarEliminacao() {
    if (tarefa_para_apagar === null) return;

    tarefas = tarefas.filter(
        (tarefa) => tarefa.id !== tarefa_para_apagar
    );

    guardarTarefas();
    listarTarefas();

    tarefa_para_apagar = null;
    modal_apagar_node.close();
}

// Cancelar eliminacao

function cancelarEliminacao() {
    tarefa_para_apagar = null;
    modal_apagar_node.close();
}

// Event listeners

pesquisa_node.addEventListener("input", listarTarefas);

filtro_prioridade_node.addEventListener("change", listarTarefas);

filtro_estado_node.addEventListener("change", listarTarefas);

form_nova_node.addEventListener("submit", criarTarefa);

form_editar_node.addEventListener("submit", atualizarTarefa);

fechar_modal_node.addEventListener("click", () => {
    modal_editar_node.close();
});

confirmar_apagar_node.addEventListener("click", confirmarEliminacao);

cancelar_apagar_node.addEventListener("click", cancelarEliminacao);

// Inicialização

listarTarefas();