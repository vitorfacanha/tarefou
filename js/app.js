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
    modalTarefa.style.display = 'flex';
});

botaoFecharModal.addEventListener('click', () => {
    modalTarefa.style.display = 'none';
});

botaoCancelarTarefa.addEventListener('click', () => {
    modalTarefa.style.display = 'none';
});