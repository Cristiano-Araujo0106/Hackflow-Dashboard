const API = "https://dummyjson.com";

const tarefasIniciais = [
  {
    id: 1,
    todo: "Definir a ideia do projeto",
    completed: true,
    categoria: "Produto",
    classe: "verde",
    prazo: "Hoje",
    responsavel: "AS",
    avatar: "avatar-verde",
    prioridade: "Alta"
  },
  {
    id: 2,
    todo: "Criar o desenho das telas",
    completed: true,
    categoria: "Design",
    classe: "laranja",
    prazo: "Hoje",
    responsavel: "ML",
    avatar: "avatar-laranja",
    prioridade: "Alta"
  },
  {
    id: 3,
    todo: "Desenvolver o painel responsivo",
    completed: false,
    categoria: "Front-end",
    classe: "",
    prazo: "Hoje",
    responsavel: "CA",
    avatar: "avatar-roxo",
    prioridade: "Alta"
  },
  {
    id: 4,
    todo: "Configurar a estrutura da API",
    completed: false,
    categoria: "Back-end",
    classe: "azul",
    prazo: "Amanhã",
    responsavel: "JP",
    avatar: "avatar-azul",
    prioridade: "Média"
  },
  {
    id: 5,
    todo: "Testar as funcionalidades",
    completed: false,
    categoria: "Front-end",
    classe: "",
    prazo: "Amanhã",
    responsavel: "CA",
    avatar: "avatar-roxo",
    prioridade: "Média"
  },
  {
    id: 6,
    todo: "Preparar a apresentação final",
    completed: false,
    categoria: "Produto",
    classe: "verde",
    prazo: "26 set",
    responsavel: "AS",
    avatar: "avatar-verde",
    prioridade: "Baixa"
  }
];

const tarefasPortugues = [
  "Definir a ideia do projeto",
  "Criar o desenho das telas",
  "Desenvolver o painel responsivo",
  "Configurar a estrutura da API",
  "Testar as funcionalidades",
  "Preparar a apresentação final"
];

let tarefas = [];
let filtroAtual = "todas";
let usuarioLogado = null;
let timerAviso;

const $ = (id) => document.getElementById(id);


// LOGIN
async function fazerLogin(usuario, senha) {
  try {
    const resposta = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: usuario,
        password: senha,
        expiresInMins: 60
      })
    });

    if (!resposta.ok) {
      throw new Error("Usuário ou senha inválidos.");
    }

    const dados = await resposta.json();

    usuarioLogado = dados;

    localStorage.setItem(
      "hackflowUsuario",
      JSON.stringify(dados)
    );

    mostrarPainel();

  } catch (erro) {
    $("mensagemLogin").textContent =
      "Usuário ou senha inválidos.";
  }
}


// MOSTRAR PAINEL
function mostrarPainel() {
  $("telaLogin").classList.add("esconder");
  $("painel").classList.remove("esconder");

  const nome = usuarioLogado?.firstName || "Usuário";

  $("nomeUsuario").textContent = nome;

  carregarTarefas();
}


// SAIR
function sair() {
  localStorage.removeItem("hackflowUsuario");

  usuarioLogado = null;

  $("painel").classList.add("esconder");
  $("telaLogin").classList.remove("esconder");

  $("formLogin").reset();
  $("mensagemLogin").textContent = "";
}


// CARREGAR TAREFAS DA API
async function carregarTarefas() {
  $("listaTarefas").innerHTML =
    '<div class="lista-vazia">Carregando tarefas...</div>';

  try {
    const resposta = await fetch(`${API}/todos?limit=6`);

    if (!resposta.ok) {
      throw new Error();
    }

    const dados = await resposta.json();

    tarefas = dados.todos.map((item, indice) => ({
      ...item,

      // Mantém as tarefas em português
      todo: tarefasPortugues[indice],

      categoria: [
        "Produto",
        "Design",
        "Front-end",
        "Back-end"
      ][indice % 4],

      classe: [
        "verde",
        "laranja",
        "",
        "azul"
      ][indice % 4],

      prazo:
        indice < 2
          ? "Hoje"
          : indice < 4
            ? "Amanhã"
            : "26 set",

      responsavel: [
        "AS",
        "ML",
        "CA",
        "JP"
      ][indice % 4],

      avatar: [
        "avatar-verde",
        "avatar-laranja",
        "avatar-roxo",
        "avatar-azul"
      ][indice % 4],

      prioridade:
        indice < 2
          ? "Alta"
          : indice < 4
            ? "Média"
            : "Baixa"
    }));

    mostrarAviso("Tarefas carregadas pela API.");

  } catch (erro) {

    tarefas = tarefasIniciais.map((tarefa) => ({
      ...tarefa
    }));

    mostrarAviso(
      "A API não respondeu. Usando tarefas de exemplo."
    );
  }

  renderizar();
}


// RENDERIZAR TAREFAS
function renderizar() {

  const lista = tarefas.filter((tarefa) => {

    if (filtroAtual === "pendentes") {
      return !tarefa.completed;
    }

    if (filtroAtual === "concluidas") {
      return tarefa.completed;
    }

    return true;
  });


  if (!lista.length) {

    $("listaTarefas").innerHTML =
      '<div class="lista-vazia">Nenhuma tarefa encontrada.</div>';

  } else {

    $("listaTarefas").innerHTML = lista
      .map((tarefa) => `
        <div class="tarefa ${tarefa.completed ? "feita" : ""}">

          <input
            class="checkbox"
            type="checkbox"
            data-id="${tarefa.id}"
            ${tarefa.completed ? "checked" : ""}
            aria-label="Concluir tarefa"
          >

          <div class="tarefa-info">

            <span class="tarefa-nome">
              ${tarefa.todo}
            </span>

            <div class="tarefa-detalhe">

              <span class="etiqueta ${tarefa.classe}">
                ${tarefa.categoria}
              </span>

              <span class="prazo">
                ◷ ${tarefa.prazo}
              </span>

            </div>

          </div>

          <span class="prioridade ${
            tarefa.prioridade === "Baixa"
              ? "baixa"
              : ""
          }">
            ${tarefa.prioridade}
          </span>

          <span class="avatar ${tarefa.avatar}">
            ${tarefa.responsavel}
          </span>

        </div>
      `)
      .join("");
  }


  document
    .querySelectorAll(".checkbox")
    .forEach((caixa) => {

      caixa.addEventListener("change", () => {

        alterarTarefa(
          Number(caixa.dataset.id)
        );

      });

    });


  atualizarResumo();
}


// ALTERAR TAREFA
async function alterarTarefa(id) {

  const tarefa = tarefas.find(
    (item) => item.id === id
  );

  if (!tarefa) return;


  tarefa.completed = !tarefa.completed;

  renderizar();


  try {

    await fetch(`${API}/todos/${id}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        completed: tarefa.completed
      })

    });

  } catch (erro) {

    // A alteração continua aparecendo na tela
    // mesmo se a API estiver indisponível.

  }


  mostrarAviso(
    tarefa.completed
      ? "Tarefa concluída! +150 pontos."
      : "Tarefa reaberta."
  );
}


// ATUALIZAR RESUMO
function atualizarResumo() {

  const total = tarefas.length;

  const concluidas = tarefas.filter(
    (tarefa) => tarefa.completed
  ).length;

  const progresso = total
    ? Math.round((concluidas / total) * 100)
    : 0;

  const pontos = concluidas * 150;


  $("progresso").textContent =
    `${progresso}%`;

  $("barraProgresso").style.width =
    `${progresso}%`;

  $("textoProgresso").textContent =
    `${concluidas} de ${total} tarefas`;


  $("pontuacao").textContent =
    pontos;

  $("pontuacaoFinal").textContent =
    `${pontos} pontos`;

  $("barraPontos").style.width =
    `${Math.min((pontos / 1000) * 100, 100)}%`;


  $("concluidas").textContent =
    concluidas;

  $("totalTarefas").textContent =
    `/${total}`;

  $("restantes").textContent =
    `${total - concluidas} restantes`;


  $("pontosTarefas").innerHTML =
    tarefas
      .map((tarefa) =>
        `<span class="${tarefa.completed ? "feito" : ""}"></span>`
      )
      .join("");


  $("numeroTarefas").textContent =
    total;

  $("numeroMenu").textContent =
    total;

  $("filtroTodas").textContent =
    total;

  $("filtroPendentes").textContent =
    total - concluidas;

  $("filtroConcluidas").textContent =
    concluidas;
}


// AVISO
function mostrarAviso(texto) {

  const aviso = $("aviso");

  aviso.textContent = texto;

  aviso.classList.add("mostrar");

  clearTimeout(timerAviso);

  timerAviso = setTimeout(() => {

    aviso.classList.remove("mostrar");

  }, 2200);
}


// LOGIN
$("formLogin").addEventListener(
  "submit",
  (evento) => {

    evento.preventDefault();

    $("mensagemLogin").textContent =
      "Entrando...";

    fazerLogin(
      $("usuario").value.trim(),
      $("senha").value
    );

  }
);


// BOTÃO SAIR
$("botaoSair").addEventListener(
  "click",
  sair
);


// REINICIAR TAREFAS
$("botaoReiniciar").addEventListener(
  "click",
  () => {

    tarefas = tarefas.map(
      (tarefa, indice) => ({

        ...tarefa,

        completed:
          tarefasIniciais[indice]?.completed ?? false

      })
    );

    renderizar();

    mostrarAviso(
      "Tarefas reiniciadas."
    );
  }
);


// VER TODAS
$("verTodas").addEventListener(
  "click",
  () => {

    filtroAtual = "todas";

    document
      .querySelectorAll(".filtro")
      .forEach((botao) => {

        botao.classList.toggle(
          "ativo",
          botao.dataset.filtro === "todas"
        );

      });

    renderizar();

  }
);


// FILTROS
document
  .querySelectorAll(".filtro")
  .forEach((botao) => {

    botao.addEventListener(
      "click",
      () => {

        filtroAtual =
          botao.dataset.filtro;

        document
          .querySelectorAll(".filtro")
          .forEach((item) =>
            item.classList.remove("ativo")
          );

        botao.classList.add("ativo");

        renderizar();

      }
    );

  });


// CONVIDAR INTEGRANTE
$("botaoConvidar").addEventListener(
  "click",
  () => {

    mostrarAviso(
      "Área de convites será adicionada em uma próxima versão."
    );

  }
);


// VERIFICAR LOGIN SALVO
const usuarioSalvo =
  localStorage.getItem("hackflowUsuario");

if (usuarioSalvo) {

  usuarioLogado =
    JSON.parse(usuarioSalvo);

  mostrarPainel();
}