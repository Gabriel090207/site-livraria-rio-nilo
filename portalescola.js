document.addEventListener("DOMContentLoaded", async function () {

  // --- 🔐 Proteção de login ---
  if (!localStorage.getItem("usuarioLogado")) {
    window.location.href = "index.html";
    return;
  }

  // --- Quem logou ---
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  // --- 🔗 Backend ---
  const BASE_URL = 'https://livraria-rio-nilo-backend.onrender.com';
  const API_URL = `${BASE_URL}/vendas?period=allTime`;

  // --- Mapeamento do login para nome da escola ---
  const ESCOLAS = {
    "cackidsfinanceiro1+matriz@gmail.com": "Adalberto Carvalho - Matriz",
    "cackidsfinanceiro1+filial1@gmail.com": "Adalberto Carvalho - Filial",
    "cackidsfinanceiro1+filial2@gmail.com": "Adalberto Carvalho - Filial 2",
    "insmundoencantado@gmail.com": "Mundo Encantado",
    "financeiro.vilacrianca@gmail.com": "Vila Crianca",
    "miriamosdantas@outlook.com": "Sena Dantas",
    "ceduagape@gmail.com": "Educacional Agape",
    "marciamoraes1504@gmail.com": "Colegio Marijunior",
    "escolaleaodejuda@hotmail.com": "Leao de Juda",
    "roseanejv15@gmail.com": "Tia Linda",
    "educandarior26@gmail.com": "Escola Renascer",
    "recantodaemilia.mais@gmail.com": "Recanto da Emilia",
  };

  // --- Normalizador (resolve acentos, hífen, maiúscula/minúscula)
  function normalizar(str) {
    return str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const escolaDoUsuario = ESCOLAS[usuarioLogado];
  const escolaNormalizada = normalizar(escolaDoUsuario);

  // --- ELEMENTOS ---
  const totalVendasElement = document.getElementById("total-vendas");
  const chartContainer = document.getElementById("chartContainer");
  const cardsContainer = document.getElementById("cardsContainer");
  const searchInput = document.getElementById("searchInput");
  const paginationContainer = document.getElementById("pagination");
  const logoutBtn = document.getElementById("logoutBtn");
  const tituloEscola = document.getElementById("tituloEscola");

  // Exibe nome da escola
  if (tituloEscola) tituloEscola.textContent = escolaDoUsuario;

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "index.html";
    });
  }

  // --- VARIÁVEIS ---
  let allSales = [];
  let filteredSales = [];
  let currentPage = 1;
  const itemsPerPage = 3;

  // --- 1️⃣ Carregar vendas ---
  async function carregarVendas() {
    try {
      cardsContainer.innerHTML = "<p style='text-align:center;color:#888;'>Carregando vendas...</p>";

      const response = await fetch(API_URL);
      const vendas = await response.json();

      console.log("🔥 Escola logada:", escolaDoUsuario);
      console.log("📌 Escolas retornadas:", [...new Set(vendas.map(v => v.cliente_escola))]);

      // Filtro inteligente por escola
      allSales = vendas.filter(venda =>
        normalizar(venda.cliente_escola) === escolaNormalizada
      );

      filteredSales = [...allSales];

      atualizarPainel(filteredSales);
      atualizarPaginacao();
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      chartContainer.innerHTML = "<p style='color:red;'>Erro ao carregar dados.</p>";
      totalVendasElement.textContent = "Erro";
    }
  }

  // --- 2️⃣ Atualizar painel ---
  function atualizarPainel(vendas) {
    totalVendasElement.textContent = vendas.length;

    const produtos = {};
    vendas.forEach((venda) => {
      const nome = venda.produtos?.[0]?.name || "Indefinido";
      produtos[nome] = (produtos[nome] || 0) + 1;
    });

    const produtosOrdenados = Object.entries(produtos).sort((a, b) => b[1] - a[1]);
    atualizarGrafico(produtosOrdenados);
    exibirPagina(currentPage);
  }

  // --- 3️⃣ Gráfico ---
  function atualizarGrafico(produtosOrdenados) {
    chartContainer.innerHTML = "";
    const maxValor = Math.max(...produtosOrdenados.map((p) => p[1])) || 1;

    produtosOrdenados.forEach(([nome, qtd]) => {
      const nomeLimitado = nome.length > 25 ? nome.slice(0, 22) + "..." : nome;
      const percentual = (qtd / maxValor) * 85;

      const barItem = document.createElement("div");
      barItem.classList.add("bar-item");
      barItem.innerHTML = `
        <span>${nomeLimitado}</span>
        <div class="bar">
          <div class="fill" style="width:${percentual.toFixed(1)}%;"></div>
          <span class="value">${qtd}</span>
        </div>
      `;
      chartContainer.appendChild(barItem);
    });
  }

  // --- 4️⃣ Cards ---
  function atualizarCards(vendasParaMostrar) {
    cardsContainer.innerHTML = "";

    if (vendasParaMostrar.length === 0) {
      cardsContainer.innerHTML = "<p style='text-align:center;color:#888;'>Nenhuma venda encontrada.</p>";
      return;
    }

    vendasParaMostrar.forEach((venda) => {
      const produto = venda.produtos?.[0] || {};

      // Correção: aceita múltiplos formatos de nome da imagem
      let capaLivro =
        produto.img ||
        produto.image ||
        produto.capa ||
        produto.thumbnail ||
        produto.foto ||
        produto.cover ||
        produto.url ||
        "https://placehold.co/100x140?text=Capa";

      // Se veio caminho local → substitui
      if (capaLivro.includes("127.0.0.1") || capaLivro.includes("localhost")) {
        capaLivro = "https://placehold.co/100x140?text=Capa";
      }

      const card = document.createElement("div");
      card.classList.add("card1", "info-card");

      card.innerHTML = `
        <div class="card-content">
          <div class="left-info">
            <p><strong>RESPONSÁVEL:</strong> ${venda.cliente_nome || "N/A"}</p>
            <p><strong>CRIANÇA:</strong> ${venda.nome_crianca || "N/A"}</p>
            <p><strong>ESCOLA:</strong> ${venda.cliente_escola || "N/A"}</p>
          </div>
          <div class="right-info">
            <p><strong>LIVRO COMPRADO:</strong> ${produto.name || "N/A"}</p>
            <img src="${capaLivro}" alt="Capa do Livro">
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });
  }

  // --- 5️⃣ Paginação ---
  function exibirPagina(pagina) {
    const start = (pagina - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const vendasPagina = filteredSales.slice(start, end);
    atualizarCards(vendasPagina);
    atualizarPaginacao();
  }

  function atualizarPaginacao() {
    paginationContainer.innerHTML = "";
    const totalPaginas = Math.ceil(filteredSales.length / itemsPerPage);

    if (totalPaginas <= 1) {
      paginationContainer.style.display = "none";
      return;
    } else {
      paginationContainer.style.display = "flex";
    }

    const prev = document.createElement("button");
    prev.classList.add("page-btn", "prev");
    prev.innerHTML = "&laquo;";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      currentPage--;
      exibirPagina(currentPage);
    });
    paginationContainer.appendChild(prev);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.classList.add("page-btn");
      if (i === currentPage) btn.classList.add("active");
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        exibirPagina(currentPage);
      });
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.classList.add("page-btn", "next");
    next.innerHTML = "&raquo;";
    next.disabled = currentPage === totalPaginas;
    next.addEventListener("click", () => {
      currentPage++;
      exibirPagina(currentPage);
    });
    paginationContainer.appendChild(next);
  }

  // --- 6️⃣ Pesquisa ---
  searchInput.addEventListener("input", () => {
    const termo = normalizar(searchInput.value);

    filteredSales = allSales.filter((venda) => {
      return (
        normalizar(venda.cliente_nome).includes(termo) ||
        normalizar(venda.nome_crianca).includes(termo) ||
        normalizar(venda.cliente_escola).includes(termo) ||
        normalizar(venda.produtos?.[0]?.name).includes(termo)
      );
    });

    currentPage = 1;
    exibirPagina(currentPage);
  });

  // --- 🚀 Iniciar painel ---
  carregarVendas();
});
