const linksMenu = document.querySelectorAll('.sidebar nav a');
const paginas = document.querySelectorAll('.pagina');

const botaoMenuMobile = document.getElementById('botao-menu-mobile');
const menuNavegacao = document.getElementById('menu-navegacao');

botaoMenuMobile.addEventListener('click', () => {
    const aberto = menuNavegacao.classList.toggle('menu-aberto');

    botaoMenuMobile.setAttribute('aria-expanded', String(aberto));
    botaoMenuMobile.setAttribute(
        'aria-label',
        aberto ? 'Fechar menu' : 'Abrir menu'
    );
});

const modalExclusao = document.getElementById('modal-exclusao');
const cancelarExclusao = document.getElementById('cancelar-exclusao');
const confirmarExclusao = document.getElementById('confirmar-exclusao');

let idTarefaExcluindo = null;


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

        menuNavegacao.classList.remove('menu-aberto');
        botaoMenuMobile.setAttribute('aria-expanded', 'false');
        botaoMenuMobile.setAttribute('aria-label', 'Abrir menu');

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

function mostrarNotificacao(tipo) {
    const mensagens = {
        criar: {
            titulo: 'Tarefa criada!',
            descricao: 'Adicionada com sucesso.',
            icone: '✓'
        },
        editar: {
            titulo: 'Tarefa atualizada!',
            descricao: 'Alterações salvas.',
            icone: '✓'
        },
        excluir: {
            titulo: 'Tarefa excluída!',
            descricao: 'Removida com sucesso.',
            icone: '✓'
        }
    };

    const mensagem = mensagens[tipo];
    if (!mensagem) return;

    const container = document.getElementById('notificacoes');

    container.innerHTML = '';

    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;

    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <span class="notificacao-icone">${mensagem.icone}</span>

            <div class="notificacao-texto">
                <strong>${mensagem.titulo}</strong>
                <p>${mensagem.descricao}</p>
            </div>

            <button type="button" class="fechar-notificacao"
                aria-label="Fechar notificação">&times;</button>
        </div>

        <div class="progresso-notificacao"></div>
    `;

    container.appendChild(notificacao);

    notificacao.querySelector('.fechar-notificacao')
        .addEventListener('click', () => notificacao.remove());

    setTimeout(() => {
        notificacao.remove();
    }, 4000);
}

function escaparHTML(texto = '') {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

const tarefasSalvas = localStorage.getItem("tarefas");

try {
    tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];

    if (!Array.isArray(tarefas)) {
        tarefas = [];
    }
} catch (erro) {
    tarefas = [];
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

    const tipoNotificacao = idTarefaEditando !== null
        ? 'editar'
        : 'criar';

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

    mostrarNotificacao(tipoNotificacao);
    formularioTarefa.reset();
    modalTarefa.style.display = 'none';

    atualizarInicio();
    exibirTarefas(filtroAtual);
    gerarCalendario();

});

let termoBusca = '';

const campoBusca = document.getElementById('busca-tarefa');

campoBusca.addEventListener('input', () => {
    termoBusca = campoBusca.value.toLowerCase().trim();

    exibirTarefas(filtroAtual);
    atualizarInicio();
});

function atualizarContadoresFiltros() {
    const total = tarefas.length;
    const pendentes = tarefas.filter(tarefa => !tarefa.concluida).length;
    const concluidas = total - pendentes;
    document.getElementById('quantidade-filtro-todas').textContent = total;
    document.getElementById('quantidade-filtro-pendentes').textContent = pendentes;
    document.getElementById('quantidade-filtro-concluidas').textContent = concluidas;
}

const listaMinhasTarefas = document.getElementById('lista-minhas-tarefas');
function exibirTarefas(filtro = 'todas') {
    atualizarContadoresFiltros();
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

        const correspondenteBusca =
            tarefa.nome.toLowerCase().includes(termoBusca) ||
            (tarefa.descricao || '').toLowerCase().includes(termoBusca);

        return correspondenteStatus &&
            correspondenteCategoria &&
            correspondenteBusca;
    });

    tarefasFiltradas.sort((a, b) => {

        if (a.concluida !== b.concluida) {
            return a.concluida ? 1 : -1;
        }

        const dataA = `${a.data}T${a.horario || '23:59'}`;
        const dataB = `${b.data}T${b.horario || '23:59'}`;

        return dataA.localeCompare(dataB);
    });

    if (tarefasFiltradas.length === 0) {
        listaMinhasTarefas.innerHTML = `
            <div class="mensagem-vazia">
                <h3>Nenhuma tarefa encontrada</h3>
                <p>Não encontramos atividades com esses critérios.</p>
            </div>
        `;

        return;
    }

    tarefasFiltradas.forEach(tarefa => {
        const elementoTarefa = document.createElement('div');
        elementoTarefa.classList.add('tarefa');
        elementoTarefa.classList.add(`categoria-${tarefa.categoria}`);

        if (tarefa.concluida) {
            elementoTarefa.classList.add('concluida');
        }

        elementoTarefa.innerHTML = `
            <button class="concluir-tarefa" type="button" aria-label="Concluir tarefa">
                ${tarefa.concluida ? '✓' : ''}
            </button>

            <div class="informacoes-tarefa">
                <h3>${escaparHTML(tarefa.nome)}</h3>
                <p>${escaparHTML(tarefa.descricao || '')}</p>
            </div>

            <span class="categoria categoria-${escaparHTML(tarefa.categoria)}">
                ${escaparHTML(tarefa.categoria.charAt(0).toUpperCase() + tarefa.categoria.slice(1))}
            </span>

            <span class="data-tarefa">
                <svg class="icone-data" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <path d="M16 3v4M8 3v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>
                </svg>
                ${new Date(tarefa.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>

            <span class="horario">
                <svg class="icone-horario" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                </svg>
                ${escaparHTML(tarefa.horario || '--:--')}
            </span>

            <div class="acoes-tarefa">
                <div class="menu-acoes-tarefa">
                    <button class="botao-opcoes-tarefa" type="button" aria-label="Opções da tarefa" aria-expanded="false">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="5" cy="12" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="19" cy="12" r="1.5"/>
                        </svg>
                    </button>
                    <div class="lista-opcoes-tarefa">
                        <button class="editar-tarefa" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/>
                            </svg>
                            <span>Editar tarefa</span>
                        </button>
                        <button class="excluir-tarefa" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                            </svg>
                            <span>Excluir tarefa</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const botaoConcluir = elementoTarefa.querySelector('.concluir-tarefa');
        botaoConcluir.addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            atualizarInicio(true);
            exibirTarefas(filtroAtual);
            gerarCalendario();
        });
 
        const botaoOpcoes = elementoTarefa.querySelector('.botao-opcoes-tarefa');
        const menuOpcoes = elementoTarefa.querySelector('.lista-opcoes-tarefa');
        botaoOpcoes.addEventListener('click', (evento) => {
            evento.stopPropagation();
            const estavaAberto = menuOpcoes.classList.contains('aberto');
            document.querySelectorAll('#minhas-tarefas .lista-opcoes-tarefa.aberto').forEach(menu => {
                menu.classList.remove('aberto');
                menu.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
            if (!estavaAberto) {
                menuOpcoes.classList.add('aberto');
                botaoOpcoes.setAttribute('aria-expanded', 'true');
            }
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
            idTarefaExcluindo = tarefa.id;
            modalExclusao.style.display = 'flex';
        });

        listaMinhasTarefas.appendChild(elementoTarefa);
        });
}

document.addEventListener('click', (evento) => {
    if (!evento.target.closest('#minhas-tarefas .menu-acoes-tarefa')) {
        document.querySelectorAll('#minhas-tarefas .lista-opcoes-tarefa.aberto').forEach(menu => {
            menu.classList.remove('aberto');
            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
    }
});

function mensagemSemAtividades() {
    return `
        <div class="estado-vazio">
            <svg class="ilustracao-vazia" viewBox="0 -20 160 170">
                <rect x="35" y="20" width="82" height="105" rx="10"
                    fill="#E5F8FC" stroke="#17649A" stroke-width="7"/>
                <rect x="60" y="12" width="34" height="17" rx="6"
                    fill="#08B9C6"/>
                <path d="M52 53 l6 6 10 -12 M52 78 l6 6 10 -12"
                    fill="none" stroke="#08B9C6" stroke-width="5"
                    stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M78 53 h25 M78 78 h18"
                    stroke="#08B9C6" stroke-width="5" stroke-linecap="round"/>
                <circle cx="112" cy="108" r="26" fill="#08B9C6"/>
                <path d="M100 108 l9 9 17 -19"
                    fill="none" stroke="white" stroke-width="6"
                    stroke-linecap="round" stroke-linejoin="round"/>
                <g class="brilhos-ilustracao"
                    fill="none"
                    stroke="#08B9C6"
                    stroke-width="4"
                    stroke-linecap="round">

                        <path d="M122 0 L126 -10"/>
                        <path d="M137 11 L146 4"/>
                        <path d="M143 26 L154 23"/>

                    </g>
            </svg>
            <h3>Nenhuma atividade para hoje!</h3>
            <p>Seu dia está livre. Aproveite para descansar!</p>
            <svg class="onda-decorativa" viewBox="0 0 110 16" aria-hidden="true">
                <path d="M2 9 L13 5 L24 9 L35 5 L46 9 L57 5 L68 9 L79 5 L90 9 L101 5 L108 8"/>
            </svg>
        </div>
    `;
}

function mensagemConclusao() {
    return `
        <div class="estado-vazio comemoracao">
            <div class="confetes">
                ${Array.from({ length: 18 }, () => '<span></span>').join('')}
            </div>
            <div class="icone-conquista">✓</div>
            <h3>Missão cumprida!</h3>
            <p>Você concluiu tudo por hoje!</p>
            <span class="mensagem-extra">
                Parabéns pelo seu esforço. Agora é hora de descansar!
            </span>
        </div>
    `;
}


function atualizarInicio(mostrarComemoracao = false) {

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

    const diaSemana = agora.toLocaleDateString('pt-BR', {
        weekday: 'long'
    });

    document.getElementById('data-hoje').textContent =
        `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dataFormatada}`;

    const total = tarefas.length;        
    const concluidas = tarefas.filter(tarefa => tarefa.concluida).length;
    const pendentes = total - concluidas;

    document.getElementById('total-tarefas').textContent = total;
    document.getElementById('tarefas-pendentes').textContent = pendentes;
    document.getElementById('tarefas-concluidas').textContent = concluidas;

    const dataHoje = formatarDataISO(agora);

        const todasTarefasHoje = tarefas.filter(
            tarefa => tarefa.data === dataHoje
        );

        const tarefasPendentesHoje = todasTarefasHoje.filter(
            tarefa => !tarefa.concluida
        );

        const tarefasHoje = tarefasPendentesHoje.filter(tarefa => {
            return tarefa.nome.toLowerCase().includes(termoBusca) ||
                (tarefa.descricao || '').toLowerCase().includes(termoBusca);
        });

        tarefasHoje.sort((a, b) => {
            const horarioA = a.horario || '23:59';
            const horarioB = b.horario || '23:59';

            return horarioA.localeCompare(horarioB);
        });

        const tarefasVisiveis = tarefasHoje;
        
    const listaHoje = document.getElementById('lista-tarefas-hoje');

    listaHoje.innerHTML = '';

    const todasConcluidas = todasTarefasHoje.length > 0 &&
        todasTarefasHoje.every(tarefa => tarefa.concluida);

    if (todasConcluidas && mostrarComemoracao) {
        listaHoje.innerHTML = mensagemConclusao();

        setTimeout(() => {
            atualizarInicio();
        }, 3000);

        return;
    }

    if (todasConcluidas || tarefasPendentesHoje.length === 0) {
        listaHoje.innerHTML = mensagemSemAtividades();
        return;
    }

    if (tarefasHoje.length === 0) {
        listaHoje.innerHTML = `
            <div class="mensagem-vazia">
                <h3>Nenhuma tarefa encontrada</h3>
                <p>Não encontramos atividades para essa busca.</p>
            </div>
        `;
        return;
    }

    tarefasVisiveis.forEach(tarefa => {
        const elemento = document.createElement('div');

        elemento.classList.add('tarefa');
        elemento.classList.add(`categoria-${tarefa.categoria}`);

        if (tarefa.concluida) {
            elemento.classList.add('concluida');
        }

        elemento.innerHTML = `
            <button class="concluir-tarefa" type="button" aria-label="Concluir tarefa">
                ${tarefa.concluida ? '✓' : ''}
            </button>

            <div class="informacoes-tarefa">
                <h3>${escaparHTML(tarefa.nome)}</h3>
                <p>${escaparHTML(tarefa.descricao || '')}</p>
            </div>

            <span class="categoria categoria-${escaparHTML(tarefa.categoria)}">
                ${escaparHTML(tarefa.categoria.charAt(0).toUpperCase() + tarefa.categoria.slice(1))}
            </span>

            <span class="data-tarefa">
                <svg class="icone-data" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <path d="M16 3v4M8 3v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>
                </svg>
                ${new Date(tarefa.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>

            <span class="horario">
                <svg class="icone-horario" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                </svg>
                ${escaparHTML(tarefa.horario || '--:--')}
            </span>

        `;

        elemento.querySelector('.concluir-tarefa').addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            atualizarInicio(true);
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
    document.getElementById("texto-categoria").textContent =
        document.getElementById("categoria-filtro").selectedOptions[0].textContent;

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

const seletorMesMobile = document.getElementById('mes-mobile');
const seletorAnoMobile = document.getElementById('ano-mobile');

for (let ano = anoMinimo; ano <= anoMaximo; ano++) {
    const opcao = document.createElement('option');
    opcao.value = ano;
    opcao.textContent = ano;
    seletorAnoMobile.appendChild(opcao);
}

seletorMesMobile.addEventListener('change', () => {
    mesAtual = Number(seletorMesMobile.value);
    ajustarDiaSelecionado();
    gerarCalendario();
});

seletorAnoMobile.addEventListener('change', () => {
    anoAtual = Number(seletorAnoMobile.value);
    ajustarDiaSelecionado();
    gerarCalendario();
});

const gradeCalendario = document.getElementById('grade-calendario');
const calendarioLayout = document.getElementById('calendario-layout');

function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function gerarIndicadoresDia(tarefasDoDia) {
    const categorias = ['estudo', 'trabalho', 'pessoal', 'lazer'];

    const indicadores = categorias
        .filter(categoria =>
            tarefasDoDia.some(tarefa => tarefa.categoria === categoria)
        )
        .map(categoria => {
            const tarefasCategoria = tarefasDoDia.filter(
                tarefa => tarefa.categoria === categoria
            );

            const todasConcluidas = tarefasCategoria.every(
                tarefa => tarefa.concluida
            );

            const status = todasConcluidas ? 'concluida' : 'pendente';

            return `
                <span class="bolinha-categoria ${categoria} ${status}"></span>
            `;
        })
        .join('');

    return `<div class="indicadores-dia">${indicadores}</div>`;
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

    seletorMesMobile.value = String(mesAtual);
    seletorAnoMobile.value = String(anoAtual);

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

        if (dataDoDia.getMonth() !== mesAtual) {
            dia.classList.add('outro-mes');
        }

        const tarefasDoDia = tarefas.filter(
            tarefa => tarefa.data === dataISO
        );

        dia.innerHTML = `
            <span class="numero-dia">${dataDoDia.getDate()}</span>
            ${gerarIndicadoresDia(tarefasDoDia)}
        `;

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

            gerarCalendario();
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
        listaDia.innerHTML = `
            <div class="mensagem-vazia">
                <h3>Nenhuma tarefa para este dia</h3>
                <p>Você não possui atividades agendadas para esta data.</p>
            </div>
        `;
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
                <h3>${escaparHTML(tarefa.nome)}</h3>
                <span class="categoria categoria-${escaparHTML(tarefa.categoria)}">
                    ${escaparHTML(tarefa.categoria.charAt(0).toUpperCase() + tarefa.categoria.slice(1))}
                </span>
            </div>
        `;

        elemento.querySelector('.concluir-calendario').addEventListener('click', () => {
            tarefa.concluida = !tarefa.concluida;

            salvarTarefas();
            atualizarInicio(true);
            exibirTarefas(filtroAtual);
            gerarCalendario();
        });

        listaDia.appendChild(elemento);
    });
}

cancelarExclusao.addEventListener('click', () => {
    modalExclusao.style.display = 'none';
    idTarefaExcluindo = null;
});

confirmarExclusao.addEventListener('click', () => {
    if (idTarefaExcluindo === null) return;

    tarefas = tarefas.filter(item => item.id !== idTarefaExcluindo);

    modalExclusao.style.display = 'none';
    idTarefaExcluindo = null;

    salvarTarefas();
    mostrarNotificacao('excluir');
    atualizarInicio();
    exibirTarefas(filtroAtual);
    gerarCalendario();
});

modalExclusao.addEventListener('click', (evento) => {
    if (evento.target === modalExclusao) {
        modalExclusao.style.display = 'none';
        idTarefaExcluindo = null;
    }
});

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

const botaoOpcoes = document.getElementById("abrir-opcoes-tarefas");
const menuOpcoes = document.getElementById("menu-opcoes-tarefas");
const verTodasTarefas = document.getElementById("ver-todas-tarefas");

botaoOpcoes.addEventListener("click", (evento) => {
    evento.stopPropagation();

    const aberto = menuOpcoes.classList.toggle("aberto");
    botaoOpcoes.setAttribute("aria-expanded", String(aberto));
});

document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".menu-tarefas")) {
        menuOpcoes.classList.remove("aberto");
        botaoOpcoes.setAttribute("aria-expanded", "false");
    }
});

verTodasTarefas.addEventListener("click", () => {
    document.querySelector(
        '.sidebar nav a[data-pagina="minhas-tarefas"]'
    ).click();

    menuOpcoes.classList.remove("aberto");
    botaoOpcoes.setAttribute("aria-expanded", "false");
});