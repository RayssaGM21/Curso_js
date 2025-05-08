const form = document.getElementById('study-form');
const subjectInput = document.getElementById('subject');
const dateInput = document.getElementById('date');
const colorInput = document.getElementById('color');
const modal = document.getElementById('modal');
const tasksContainer = document.getElementById('tasks-container');
const themeToggle = document.getElementById('toggle-theme');

let feriados = [];
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let indexEditando = null;

const abrirModal = () => modal.style.display = 'block';
const fecharModal = () => {
    modal.style.display = 'none';
    indexEditando = null;
};

window.onclick = (e) => {
    if (e.target == modal) fecharModal();
};

const loadFeriados = async () => {
    const anoAtual = new Date().getFullYear();
    try {
        const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${anoAtual}`);
        feriados = await res.json();
    } catch (err) {
        console.error('Erro ao carregar feriados:', err);
    }
};

const salvarTarefas = () => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
};

const exibirTarefas = () => {
    tarefas.sort((a, b) => new Date(a.data) - new Date(b.data));
    tasksContainer.innerHTML = '';
    tarefas.forEach((tarefa, index) => {
        const template = document.getElementById('task-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.task-card');
        card.style.backgroundColor = tarefa.cor;

        clone.querySelector('.task-subject').textContent = tarefa.materia;
        const [ano, mes, dia] = tarefa.data.split('-');
        const data = new Date(ano, mes - 1, dia);
        clone.querySelector('.task-date').textContent = data.toLocaleDateString();

        const dataFormatada = data.toISOString().split('T')[0];
        const feriado = feriados.find(f => f.date === tarefa.data);
        if (feriado) {
            clone.querySelector('.task-holiday').textContent = `⚠️ ${feriado.name}`;
        }

        clone.querySelector('.edit-task').addEventListener('click', () => editarTarefa(index));
        clone.querySelector('.delete-task').addEventListener('click', () => excluirTarefa(index));

        tasksContainer.appendChild(clone);
    });
};

const editarTarefa = (index) => {
    const tarefa = tarefas[index];
    subjectInput.value = tarefa.materia;
    dateInput.value = tarefa.data;
    colorInput.value = tarefa.cor;
    indexEditando = index;
    abrirModal();
};

const excluirTarefa = (index) => {
    tarefas.splice(index, 1);
    salvarTarefas();
    exibirTarefas();
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const novaTarefa = {
        materia: subjectInput.value,
        data: dateInput.value,
        cor: colorInput.value
    };

    if (indexEditando !== null) {
        tarefas[indexEditando] = novaTarefa;
        indexEditando = null;
    } else {
        tarefas.push(novaTarefa);
    }

    salvarTarefas();
    exibirTarefas();
    form.reset();
    fecharModal();
});

const aplicarTema = (tema) => {
    document.body.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);
};

themeToggle.addEventListener('click', () => {
    const temaAtual = document.body.getAttribute('data-theme') || 'claro';
    aplicarTema(temaAtual === 'claro' ? 'escuro' : 'claro');
});

document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem('tema') || 'claro';
    aplicarTema(temaSalvo);
    loadFeriados().then(() => {
        exibirTarefas();
    });
});