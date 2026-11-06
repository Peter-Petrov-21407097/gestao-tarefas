
// Variáveis

const titulo_node = document.querySelector("#titulo")
const prioridade_node = document.querySelector("#prioridade")
const user_node = document.querySelector("#user")

const form_nova_node = document.querySelector("#form-nova-tarefa")
const ul_node = document.querySelector("#lista")
const mensagem_vazia_node = document.querySelector("#mensagem-vazia")

const total_node = document.querySelector("#total-tarefas")
const pendentes_node = document.querySelector("#tarefas-pendentes")
const concluidas_node = document.querySelector("#tarefas-concluidas")

const modal_editar_node = document.querySelector("#modal-editar")
const form_editar_node = document.querySelector("#form-editar")
const edit_id_node = document.querySelector("#edit-id")
const edit_titulo_node = document.querySelector("#edit-titulo")
const edit_prioridade_node = document.querySelector("#edit-prioridade")
const edit_user_node = document.querySelector("#edit-user")
const fechar_modal_node = document.querySelector("#fechar-modal")

const modal_apagar_node = document.querySelector("#modal-apagar")
const confirmar_apagar_node = document.querySelector("#confirmar-apagar")
const cancelar_apagar_node = document.querySelector("#cancelar-apagar")

const STORAGE_KEY = "taskflow-tarefas"

let tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
let tarefa_para_apagar = null

// Guardar tarefas

function guardarTarefas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas))
}

// Atualizar estatisticas

function atualizarEstatisticas() {
    total_node.textContent = tarefas.length

    pendentes_node.textContent = tarefas.filter(
        tarefa => tarefa.estado === "pendente"
    ).length

    concluidas_node.textContent = tarefas.filter(
        tarefa => tarefa.estado === "concluida"
    ).length
}

// Apresentar tarefas

function listarTarefas() {
    ul_node.innerHTML = ""

    mensagem_vazia_node.hidden = tarefas.length !== 0

    const prioridades = {
        1: "Baixa",
        2: "Média",
        3: "Alta"
    }

    tarefas.forEach(tarefa => {
        const li = document.createElement("li")

        const descricao = document.createElement("span")
        descricao.textContent = tarefa.titulo

        const responsavel = document.createElement("span")
        responsavel.textContent = `Responsável: ${tarefa.user}`

        const prioridade = document.createElement("span")
        prioridade.textContent = `Prioridade: ${prioridades[tarefa.prioridade]}`

        const estado = document.createElement("span")
        estado.textContent = tarefa.estado === "pendente"
            ? "Pendente"
            : "Concluída"

        const btn_estado = document.createElement("button")
        btn_estado.textContent = tarefa.estado === "pendente"
            ? "Concluir"
            : "Reabrir"
        btn_estado.type = "button"
        btn_estado.onclick = () => alterarEstado(tarefa.id)    

        const btn_editar = document.createElement("button")
        btn_editar.textContent = "Editar"
        btn_editar.type = "button"
        btn_editar.onclick = () => editarTarefa(tarefa.id)

        const btn_apagar = document.createElement("button")
        btn_apagar.textContent = "Eliminar"
        btn_apagar.type = "button"
        btn_apagar.onclick = () => eliminarTarefa(tarefa.id)

        li.append(
            descricao,
            responsavel,
            prioridade,
            estado,
            btn_estado,
            btn_editar,
            btn_apagar
        )

        ul_node.append(li)
    })

    atualizarEstatisticas()
}

// Criar tarefa

function criarTarefa(event) {
    event.preventDefault()

    const nova_tarefa = {
        id: Date.now(),
        titulo: titulo_node.value.trim(),
        prioridade: Number(prioridade_node.value),
        user: user_node.value.trim(),
        estado: "pendente"
    }

    if (
        !nova_tarefa.titulo ||
        !nova_tarefa.user ||
        ![1, 2, 3].includes(nova_tarefa.prioridade)
    ) {
        alert("Preenche todos os campos corretamente.")
        return
    }

    tarefas.push(nova_tarefa)

    guardarTarefas()
    listarTarefas()

    form_nova_node.reset()
}

// Alterar estado da tarefa

function alterarEstado(id) {
    const tarefa = tarefas.find(tarefa => tarefa.id === id)

    if (!tarefa) return

    tarefa.estado = tarefa.estado === "pendente"
        ? "concluida"
        : "pendente"

    guardarTarefas()
    listarTarefas()
}

// Editar tarefa

function editarTarefa(id) {
    const tarefa = tarefas.find(tarefa => tarefa.id === id)

    if (!tarefa) return

    edit_id_node.value = tarefa.id
    edit_titulo_node.value = tarefa.titulo
    edit_prioridade_node.value = tarefa.prioridade
    edit_user_node.value = tarefa.user

    modal_editar_node.showModal()
}

// Atualizar tarefa

function atualizarTarefa(event) {
    event.preventDefault()

    const id = Number(edit_id_node.value)
    const tarefa = tarefas.find(tarefa => tarefa.id === id)

    if (!tarefa) return

    const titulo = edit_titulo_node.value.trim()
    const user = edit_user_node.value.trim()
    const prioridade = Number(edit_prioridade_node.value)

    if (!titulo || !user || ![1, 2, 3].includes(prioridade)) {
        alert("Preenche todos os campos corretamente.")
        return
    }

    tarefa.titulo = titulo
    tarefa.user = user
    tarefa.prioridade = prioridade

    guardarTarefas()
    listarTarefas()

    modal_editar_node.close()
}

// Eliminar tarefa

function eliminarTarefa(id) {
    tarefa_para_apagar = id

    modal_apagar_node.showModal()
}

// Confirmar eliminacao

function confirmarEliminacao() {
    if (tarefa_para_apagar === null) return

    tarefas = tarefas.filter(
        tarefa => tarefa.id !== tarefa_para_apagar
    )

    guardarTarefas()
    listarTarefas()

    tarefa_para_apagar = null
    modal_apagar_node.close()
}

// Cancelar eliminacao

function cancelarEliminacao() {
    tarefa_para_apagar = null
    modal_apagar_node.close()
}

// Event listeners

form_nova_node.addEventListener("submit", criarTarefa)

form_editar_node.addEventListener("submit", atualizarTarefa)

fechar_modal_node.addEventListener("click", () => {
    modal_editar_node.close()
})

confirmar_apagar_node.addEventListener(
    "click",
    confirmarEliminacao
)

cancelar_apagar_node.addEventListener(
    "click",
    cancelarEliminacao
)

// Inicialização

listarTarefas()