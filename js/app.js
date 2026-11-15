const linksMenu = document.querySelectorAll('.sidebar nav a');

const paginas = document.querySelectorAll('.pagina');

linksMenu.forEach(link => {

    link.addEventListener('click', (evento) => {
        evento.preventDefault();

        const paginaSelecionada = link.dataset.pagina;

        paginas.forEach(pagina => {
            pagina.classList.remove('ativa');
        });

        const paginaAtual = document.getElementById(paginaSelecionada);

        if (paginaAtual) {
            paginaAtual.classList.add('ativa');
        }

        linksMenu.forEach(item => {
            item.classList.remove('ativo');
        });

        link.classList.add('ativo');

    });

});

const botaoNovaTarefa = document.querySelector('.topo button');
const modalTarefa = document.getElementById('modal-tarefa');
const botaoFecharModal = document.getElementById('fechar-modal');
const botaoCancelarTarefa = document.getElementById('cancelar-tarefa');

botaoNovaTarefa.addEventListener('click', () => {
    idTarefaEditando = null;

    formularioTarefa.reset();

    document.querySelector('.modal-topo h2').textContent = 'Nova Tarefa';
    formularioTarefa.querySelector('[type="submit"]').textContent = 'Salvar tarefa';
   
    modalTarefa.style.display = 'flex';
});

botaoFecharModal.addEventListener('click', () => {
    modalTarefa.style.display = 'none';
});

botaoCancelarTarefa.addEventListener('click', () => {
    modalTarefa.style.display = 'none';
});

let tarefas = [];
let idTarefaEditando = null;

function salvarTarefas() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

const tarefasSalvas = localStorage.getItem("tarefas");

if(tarefasSalvas) {
    tarefas = JSON.parse(tarefasSalvas)
}

const formularioTarefa = document.getElementById('form-tarefa');
formularioTarefa.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const dadosTarefa = {
        nome: document.getElementById('nome-tarefa').value,
        descricao: document.getElementById('descricao-tarefa').value,
        categoria: document.getElementById('categoria-tarefa').value,
        data: document.getElementById('data-tarefa').value,
        horario: document.getElementById('horario-tarefa').value
};

    if (idTarefaEditando !== null) {
        const tarefaSelecionada = tarefas.find(
            tarefa => tarefa.id === idTarefaEditando
        );

        Object.assign(tarefaSelecionada, dadosTarefa);
    
    } else {

        const novaTarefa = {
            id: Date.now(),
            ...dadosTarefa,
            concluida: false
        };

        tarefas.push(novaTarefa);
    }

    idTarefaEditando = null;

    salvarTarefas();

    formularioTarefa.reset();
    modalTarefa.style.display = 'none';

    atualizarInicio();
    exibirTarefas(filtroAtual);
    gerarCalendario();

});

const listaMinhasTarefas = document.getElementById('lista-minhas-tarefas');
function exibirTarefas(filtro = 'todas') {
    listaMinhasTarefas.innerHTML = '';
    const tarefasFiltradas = tarefas.filter(tarefa => {
        let correspondenteStatus = true;

        if (filtro === 'pendentes') {
            correspondenteStatus = tarefa.concluida === false;
        }

        if (filtro === 'concluidas') {
            correspondenteStatus = tarefa.concluida === true;
        }

        const correspondenteCategoria = 
            categoriaAtual === 'todas' || 
            tarefa.categoria === categoriaAtual;

        return correspondenteStatus && correspondenteCategoria;
    });
    tarefasFiltradas.forEach(tarefa => {
        const elementoTarefa = document.createElement('div');
        elementoTarefa.classList.add('tarefa');

        if (tarefa.concluida) {
            elementoTarefa.classList.add('concluida');
        }

        elementoTarefa.innerHTML = `
            <button class="concluir-tarefa" type="button">
                ${tarefa.concluida ? '✔' : ''}
            </button>

            <div class="informacoes-tarefa">
                <h3>${tarefa.nome}</h3>
                <p>${tarefa.descricao}</p>
            </div>

            <span class="categoria">${tarefa.categoria}</span>
            
            <span class="horario">
                ${tarefa.data} ${tarefa.horario}
            </span>

            <div class="acoes-tarefa">
                <button class="editar-tarefa" type="button">Editar</button>
                <button class="excluir-tarefa" type="button">Excluir</button>
            </div>
        `;

        const botaoConcluir = elementoTarefa.querySelector('.concluir-tarefa');
        botaoConcluir.addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            atualizarInicio();
            exibirTarefas(filtroAtual);
            gerarCalendario();
        });
 
        const botaoEditar = elementoTarefa.querySelector('.editar-tarefa');

        botaoEditar.addEventListener('click', () => {

            idTarefaEditando = tarefa.id;

            document.getElementById('nome-tarefa').value = tarefa.nome;
            document.getElementById('descricao-tarefa').value = tarefa.descricao;
            document.getElementById('categoria-tarefa').value = tarefa.categoria;
            document.getElementById('data-tarefa').value = tarefa.data;
            document.getElementById('horario-tarefa').value = tarefa.horario;

            document.querySelector('.modal-topo h2').textContent = 'Editar tarefa';
            formularioTarefa.querySelector('[type="submit"]').textContent = 'Salvar alterações';

            modalTarefa.style.display = 'flex';
        });

        const botaoExcluir = elementoTarefa.querySelector('.excluir-tarefa');

        botaoExcluir.addEventListener('click', () => {

            const confirmar = confirm('Deseja realmente excluir esta tarefa?');

            if (confirmar) {
                tarefas = tarefas.filter(item => item.id !== tarefa.id);

                salvarTarefas();

                exibirTarefas(filtroAtual);
            }

        });

        listaMinhasTarefas.appendChild(elementoTarefa);
    });
}

function atualizarInicio() {

    const agora = new Date();
    const hora = agora.getHours();

    let saudacao = 'Olá!';

    if (hora >= 5 && hora < 12) {
        saudacao = 'Bom dia!';
    } else if (hora >= 12 && hora < 18) {
        saudacao = 'Boa tarde!';
    } else {
        saudacao = 'Boa noite!';
    }

    document.getElementById('saudacao').textContent =
        `Olá, ${saudacao}`;

    const dataFormatada = agora.toLocaleDateString('pt-BR', {
        day: 'numeric',    
        month: 'long',    
        year: 'numeric'    
    });

    document.getElementById('data-hoje').textContent =
        `Suas atividades para hoje, ${dataFormatada}.`;

    const total = tarefas.length;        
    const concluidas = tarefas.filter(tarefa => tarefa.concluidas).length;
    const pendentes = total - concluidas;

    document.getElementById('total-tarefas').textContent = total;
    document.getElementById('tarefas-pendentes').textContent = pendentes;
    document.getElementById('tarefas-concluidas').textContent = concluidas;

    const dataHoje = formatarDataISO(agora);

    const tarefasHoje = tarefas.filter(
        tarefa => tarefa.data === dataHoje
    );
    console.log('Data de hoje:', dataHoje);
    console.log('Tarefas cadastradas:', tarefas);
    console.log('Tarefas de hoje:', tarefasHoje);
    
    const listaHoje = document.getElementById('lista-tarefas-hoje');

    listaHoje.innerHTML = '';

    if (tarefasHoje.length === 0) {
        listaHoje.innerHTML = `
            <div class="sem-tarefas-hoje">
                <p>Você não tem tarefas para hoje.</p>
            </div>
        `;
        return;
    }

    tarefasHoje.forEach(tarefa => {
        const elemento = document.createElement('div');

        elemento.classList.add('tarefa');

        if (tarefa.concluida) {
            elemento.classList.add('concluida');
        }

        elemento.innerHTML = `
            <button class="concluir-tarefa" type="button">
                ${tarefa.concluida ? '✔' : ''}
            </button>

            <div class="informacoes-tarefa">
                <h3>${tarefa.nome}</h3>
                <p>${tarefa.descricao}</p>
            </div>

            <span class="categoria">${tarefa.categoria}</span>

            <span class="horario">${tarefa.horario}</span>
        `;

        elemento.querySelector('.concluir-tarefa').addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            exibirTarefas(filtroAtual);
            gerarCalendario();
        });

        listaHoje.appendChild(elemento);
    });
}

let filtroAtual = 'todas';
let categoriaAtual = 'todas';
const botaoFiltro = document.querySelectorAll('.filtro');
botaoFiltro.forEach(botao => {
    botao.addEventListener('click', () => {
        const filtroSelecionado = botao.dataset.filtro;
        filtroAtual = filtroSelecionado;
        botaoFiltro.forEach(item => {
            item.classList.remove('ativo');
        });

        botao.classList.add('ativo');
        exibirTarefas(filtroSelecionado);

    });

});

const selectCategoria = document.getElementById('categoria-filtro');
selectCategoria.addEventListener('change', () => {
    categoriaAtual = selectCategoria.value;

    exibirTarefas(filtroAtual);
});

exibirTarefas();


const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();

let dataSelecionada = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth(),
    dataAtual.getDate()
);

let diaAberto = false;

const anoMinimo = 2020;
const anoMaximo = 2050;

const gradeCalendario = document.getElementById('grade-calendario');
const calendarioLayout = document.getElementById('calendario-layout');

function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function gerarCalendario() {
    gradeCalendario.innerHTML = '';

    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

    const quantidadeDias = Math.ceil(
        (primeiroDia + ultimoDia) / 7
    ) * 7;

    document.getElementById('mes-ano-atual').textContent =
        `${meses[mesAtual]} de ${anoAtual}`;
        
        mesSelecionado.textContent = meses[mesAtual];
        anoSelecionado.textContent = anoAtual;

        mesAnteriorTexto.textContent = meses[(mesAtual + 11) % 12];
        mesProximoTexto.textContent = meses[(mesAtual + 1) % 12];

        anoAnteriorTexto.textContent = anoAtual - 1;
        anoProximoTexto.textContent = anoAtual + 1;

        anoAnteriorTexto.style.visibility =
            anoAtual <= anoMinimo ? 'hidden' : 'visible';

        anoProximoTexto.style.visibility =
            anoAtual >= anoMaximo ? 'hidden' : 'visible';

    const dataEscolhida = formatarDataISO(dataSelecionada);

    for (let i = 0; i < quantidadeDias; i++) {
        const dia = document.createElement('button');

        dia.type = 'button';
        dia.classList.add('dia-calendario');

        const numeroDia = i - primeiroDia + 1;

        const dataDoDia = new Date(
            anoAtual,
            mesAtual,
            numeroDia
        );

        const dataISO = formatarDataISO(dataDoDia);

        dia.textContent = dataDoDia.getDate();

        if (dataDoDia.getMonth() !== mesAtual) {
            dia.classList.add('outro-mes');
        }

        const tarefasDoDia = tarefas.filter(
            tarefa => tarefa.data === dataISO
        );

        if (tarefasDoDia.length > 0) {
            dia.classList.add('tem-tarefas');
        }

        if (dataISO === dataEscolhida) {
            dia.classList.add('selecionado');
        }

        dia.addEventListener('click', () => {
            dataSelecionada = new Date(
                dataDoDia.getFullYear(),
                dataDoDia.getMonth(),
                dataDoDia.getDate()
            );

            mesAtual = dataSelecionada.getMonth();
            anoAtual = dataSelecionada.getFullYear();

            diaAberto = true;

            atualizarVisualizacao();
        });

        gradeCalendario.appendChild(dia);
    }

    atualizarVisualizacao();
}

function atualizarVisualizacao() {
    calendarioLayout.classList.toggle('dia-aberto', diaAberto);

    exibirTarefasDoDia();
}

function exibirTarefasDoDia() {
    const listaDia = document.getElementById('lista-tarefas-dia');
    const tituloData = document.getElementById('data-selecionada');
    const quantidadeTarefas = document.getElementById('quantidade-tarefas-dia');

    const dataISO = formatarDataISO(dataSelecionada);

    const tarefasDoDia = tarefas.filter(
        tarefa => tarefa.data === dataISO
    );

    tituloData.textContent = dataSelecionada.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long'
    });

    quantidadeTarefas.textContent =
        `${tarefasDoDia.length} ${tarefasDoDia.length === 1 ? 'tarefa' : 'tarefas'}`;

    listaDia.innerHTML = '';

    if (tarefasDoDia.length === 0) {
        listaDia.innerHTML =
            '<p class="sem-tarefas">Nenhuma tarefa para este dia.</p>';
        return;
    }

    tarefasDoDia.forEach(tarefa => {
        const elemento = document.createElement('div');

        elemento.classList.add('tarefa-calendario');

        if (tarefa.concluida) {
            elemento.classList.add('concluida');
        }

        elemento.innerHTML = `
            <button class="concluir-calendario" type="button">
                ${tarefa.concluida ? '✓' : ''}
            </button>

            <div>
                <h3>${tarefa.nome}</h3>
                <span class="categoria">${tarefa.categoria}</span>
            </div>
        `;

        elemento.querySelector('.concluir-calendario').addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            exibirTarefas(filtroAtual);
            gerarCalendario();
        });

        listaDia.appendChild(elemento);
    });
}

function trocarMes(diferenca) {
    const novaData = new Date(
        anoAtual,
        mesAtual + diferenca,
        1
    );

    if (
        novaData.getFullYear() < anoMinimo ||
        novaData.getFullYear() > anoMaximo
    ) {
        return;
    }

    mesAtual = novaData.getMonth();
    anoAtual = novaData.getFullYear();

    ajustarDiaSelecionado();
    gerarCalendario();
}

function trocarAno(diferenca) {
    const novoAno = anoAtual + diferenca;

    if (novoAno < anoMinimo || novoAno > anoMaximo) {
        return;
    }

    anoAtual = novoAno;

    ajustarDiaSelecionado();
    gerarCalendario();
}

function ajustarDiaSelecionado() {
    const dia = dataSelecionada.getDate();

    const ultimoDia = new Date(
        anoAtual,
        mesAtual + 1,
        0
    ).getDate();

    dataSelecionada = new Date(
        anoAtual,
        mesAtual,
        Math.min(dia, ultimoDia)
    );
}

document.getElementById('mes-anterior').addEventListener('click', () => {
    trocarMes(-1);
});

const botaoSeletorData = document.getElementById('abrir-seletor-data');
const seletorVertical = document.getElementById('seletor-vertical');

const mesAnteriorTexto = document.getElementById('mes-anterior-texto');
const mesProximoTexto = document.getElementById('mes-proximo-texto');

const anoAnteriorTexto = document.getElementById('ano-anterior-texto');
const anoProximoTexto = document.getElementById('ano-proximo-texto');

const mesSelecionado = document.getElementById('mes-selecionado');
const anoSelecionado = document.getElementById('ano-selecionado');

document.getElementById('mes-proximo').addEventListener('click', () => {
    trocarMes(1);
});

mesAnteriorTexto.addEventListener('click', () => {
    trocarMes(-1);
});

mesProximoTexto.addEventListener('click', () => {
    trocarMes(1);
});

anoAnteriorTexto.addEventListener('click', () => {
    trocarAno(-1);
});

anoProximoTexto.addEventListener('click', () => {
    trocarAno(1);
});

seletorVertical.addEventListener('wheel', (evento) => {
    evento.preventDefault();

    const coluna = evento.target.closest('.seletor-coluna');

    if (!coluna) {
        return;
    }

    const diferenca = evento.deltaY > 0 ? 1 : -1;

    if (coluna.querySelector('#mes-selecionado')) {
        trocarMes(diferenca);
    } else {
        trocarAno(diferenca);
    }
}, { passive: false });

document.getElementById('voltar-calendario').addEventListener('click', () => {
    diaAberto = false;
    gerarCalendario();
});

botaoSeletorData.addEventListener('click', () => {
    seletorVertical.classList.toggle('aberto');
});

function fecharSeletorData() {
    seletorVertical.classList.remove('aberto');
}

document.addEventListener('click', (evento) => {

    const clicouNoBotao = botaoSeletorData.contains(evento.target);
    const clicouNoSeletor = seletorVertical.contains(evento.target);

    if (!clicouNoBotao && !clicouNoSeletor) {
        fecharSeletorData();
    }

});

seletorVertical.addEventListener('click', (evento) => {

    if (
        evento.target.classList.contains('valor-anterior') ||
        evento.target.classList.contains('valor-proximo')
    ) {
        fecharSeletorData();
    }

});

gerarCalendario();
atualizarInicio();