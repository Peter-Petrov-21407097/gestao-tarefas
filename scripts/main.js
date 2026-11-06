// Variáveis

const API_URL = 'http://tarefas.pw.deisi.ulusofona.pt'
const ul_node = document.querySelector('ul')

const titulo_node = document.querySelector("#titulo")
const prioridade_node = document.querySelector("#prioridade")
const user_node = document.querySelector("#user")
const form_nova_node = document.querySelector("#nova-tarefa")


const titulo_edit_node = document.querySelector("#edit_titulo")
const prioridade_edit_node = document.querySelector("#edit_prioridade")
const user_edit_node = document.querySelector("#edit_user")

const modal_node = document.querySelector("#modal_editar")

const modal_apagar_node = document.querySelector("#modal_apagar");
const cancelar_apagar_node = document.querySelector("#cancelar_apagar");
const confirmar_apagar_node = document.querySelector("#confirmar_apagar");

let tarefa_id_apagar = null;
//
// Fetch de dados

function listarTarefas() {
  fetch(`${API_URL}/tarefas`)
    .then(response => {
      if (!response.ok) throw new Error(response.status);
      return response.json();
    })
    .then(data => {
      ul_node.innerHTML = ""
      data.forEach(item =>{
        const li = document.createElement('li')

        const tarefa = document.createElement('span')
        tarefa.innerHTML = `<span>${item.titulo}</span><span>${item.user}. prioridade: ${"⭐️".repeat(item.prioridade)} </span>`

        const btn_editar = document.createElement('button');
        btn_editar.innerHTML = '<i data-lucide="pencil"></i>';

        btn_editar.title = 'Editar tarefa';
        btn_editar.onclick = () => editarTarefa(item.id);

        const btn_apagar = document.createElement('button');
        btn_apagar.innerHTML = '<i data-lucide="trash-2"></i>';

        btn_apagar.title = 'Apagar tarefa';
        btn_apagar.onclick = () => querApagarTarefa(item.id);

        li.append(tarefa, btn_editar, btn_apagar);

        ul_node.append(li)

       
      })
      lucide.createIcons();
    })
    .catch(error => {
      console.error("Erro ao carregar tarefas:", error);
      alert("Não foi possível carregar as tarefas.");
    })
}

//
// Event handlers
function criarTarefa(event) {
  event.preventDefault()

  if (![1, 2, 3].includes(Number(prioridade_node.value))) {
    alert("A prioridade deve ser 1, 2 ou 3.");
    prioridade_node.focus();
    return;
  }

  fetch(`${API_URL}/tarefas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: titulo_node.value,
      user: user_node.value,
      prioridade: Number(prioridade_node.value)
    })
  })
  .then(response =>  {
    if (!response.ok) throw new Error(response.status);
    
    form_nova_node.reset();
    listarTarefas()
  })
  .catch(error => {
    console.error("Erro ao criar tarefa:", error);
    alert("Não foi possível criar a tarefa.");
  });
}

function atualizarTarefa(event) {
  event.preventDefault()

  const id = document.querySelector("#edit_id").value;
  
  fetch(`${API_URL}/tarefas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      titulo: titulo_edit_node.value,
      user: user_edit_node.value,
      prioridade: Number(prioridade_edit_node.value)
    })
  })
  .then(response => {
    if (!response.ok) throw new Error(response.status);
    
    modal_node.close();
    listarTarefas()
  })
  .catch(error => {
    console.error("Erro ao atualizar tarefa:", error);
    alert("Não foi possível atualizar a tarefa.");
  });
}

function querApagarTarefa(id) {
    tarefa_id_apagar = id;
    modal_apagar_node.showModal();
}

function apagarTarefa() {
  fetch(`${API_URL}/tarefas/${tarefa_id_apagar}`,{
    method: 'DELETE',
  })
  .then(response => {
    if (!response.ok) throw new Error(response.status);
    listarTarefas()
  })
  .catch(error => {
    console.error("Erro ao apagar tarefa:", error);
    alert("Não foi possível apagar a tarefa.");
  });
}

function editarTarefa(id) {

  fetch(`${API_URL}/tarefas/${id}`,{
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) throw new Error(response.status);
    return response.json()
  })
  .then(data => {
    document.querySelector("#edit_id").value = data.id;
    document.querySelector("#edit_titulo").value = data.titulo;
    document.querySelector("#edit_prioridade").value = data.prioridade;
    document.querySelector("#edit_user").value = data.user;

    modal_node.showModal()
  })
  .catch(error => {
    console.error("Erro ao editar a tarefa:", error);
    alert("Não foi possível editar a tarefa.");
  });
}

//
// Event listeners
form_nova_node.onsubmit = criarTarefa

document.querySelector("#form_editar")
        .onsubmit = atualizarTarefa

document.querySelector("#fechar_modal")
        .addEventListener('click', () => modal_node.close())

confirmar_apagar_node.onclick = apagarTarefa
cancelar_apagar_node.onclick = () => modal_apagar_node.close()

//
// Inicialização
listarTarefas()