document.addEventListener("DOMContentLoaded", async function () {

  // --- 🔐 Proteção de login ---
  if (!localStorage.getItem("usuarioLogado")) {
    window.location.href = "index.html";
    return;
}


  // --- 🔗 Backend base URL ---
  const BASE_URL = 'https://livraria-rio-nilo-backend.onrender.com';
  const API_URL = `${BASE_URL}/vendas?period=allTime`;

  // --- ELEMENTOS ---
  const totalVendasElement = document.getElementById("total-vendas");
  const chartContainer = document.getElementById("chartContainer");
  const cardsContainer = document.getElementById("cardsContainer");
  const searchInput = document.getElementById("searchInput");
  const paginationContainer = document.getElementById("pagination");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- Logout funcional ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth");
      window.location.href = "index.html";
    });
  }

  // --- VARIÁVEIS ---
  let allSales = [];
  let filteredSales = [];
  let currentPage = 1;
  const itemsPerPage = 3;

  // --- 1️⃣ Carregar dados do backend ---
  async function carregarVendas() {
    try {
      cardsContainer.innerHTML = "<p style='text-align:center;color:#888;'>Carregando vendas...</p>";

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

      const vendas = await response.json();
      allSales = vendas;
      filteredSales = [...allSales];

      atualizarPainel(vendas);
      atualizarPaginacao();
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      chartContainer.innerHTML = "<p style='color:red;'>Erro ao carregar dados do servidor.</p>";
      totalVendasElement.textContent = "Erro";
    }
  }

  // --- 2️⃣ Atualizar painel com dados ---
  function atualizarPainel(vendas) {
    totalVendasElement.textContent = vendas.length;

    const produtos = {};
   vendas.forEach((venda) => {
  const nome = venda.produtos?.[0]?.name || "Produto Desconhecido";
  produtos[nome] = (produtos[nome] || 0) + 1;
});


    const produtosOrdenados = Object.entries(produtos).sort((a, b) => b[1] - a[1]);
    atualizarGrafico(produtosOrdenados);
    exibirPagina(currentPage);
  }

  // --- 3️⃣ Montar gráfico proporcional ---
  function atualizarGrafico(produtosOrdenados) {
    chartContainer.innerHTML = "";
    const maxValor = Math.max(...produtosOrdenados.map((p) => p[1])) || 1;

    produtosOrdenados.forEach(([nome, qtd]) => {
      const nomeLimitado = nome.length > 25 ? nome.slice(0, 22) + "..." : nome;
      const percentual = (qtd / maxValor) * 85; // nunca chega a 100%

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

  // --- 4️⃣ Renderizar os cards ---
  function atualizarCards(vendasParaMostrar) {
    cardsContainer.innerHTML = "";

    if (vendasParaMostrar.length === 0) {
      cardsContainer.innerHTML = "<p style='text-align:center;color:#888;'>Nenhuma venda encontrada.</p>";
      return;
    }

    vendasParaMostrar.forEach((venda) => {
      const card = document.createElement("div");
      card.classList.add("card1", "info-card");

      // URL da capa (se tiver img_url no backend)
      const capaLivro = venda.produtos?.[0]?.img
  ? venda.produtos[0].img
  : "https://placehold.co/100x140?text=Capa";

      card.innerHTML = `
  <div class="card-content">
    <div class="left-info">
      <p><strong>RESPONSÁVEL:</strong> ${venda.cliente_nome || "N/A"}</p>
      <p><strong>CRIANÇA:</strong> ${venda.nome_crianca || "N/A"}</p>
    </div>
    <div class="right-info">
      <p><strong>LIVRO COMPRADO:</strong> ${venda.produtos?.[0]?.name || "N/A"}</p>
      <img src="${capaLivro}" alt="Capa do Livro">
    </div>
  </div>
`;

      cardsContainer.appendChild(card);
    });
  }

  // --- 5️⃣ Paginação funcional ---
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

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("page-btn", "prev");
    prevBtn.innerHTML = "&laquo;";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        exibirPagina(currentPage);
      }
    });
    paginationContainer.appendChild(prevBtn);

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

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("page-btn", "next");
    nextBtn.innerHTML = "&raquo;";
    nextBtn.disabled = currentPage === totalPaginas;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPaginas) {
        currentPage++;
        exibirPagina(currentPage);
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  // --- 6️⃣ Filtro de pesquisa ---
  searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase().trim();
    filteredSales = allSales.filter((venda) => {
  const responsavel = venda.cliente_nome?.toLowerCase() || "";
  const crianca = venda.nome_crianca?.toLowerCase() || "";
  const escola = venda.cliente_escola?.toLowerCase() || "";
  const livro = venda.produtos?.[0]?.name?.toLowerCase() || "";

  return (
    responsavel.includes(termo) ||
    crianca.includes(termo) ||
    escola.includes(termo) ||
    livro.includes(termo)
  );
});

    currentPage = 1;
    exibirPagina(currentPage);
  });

  // --- 🚀 Iniciar painel ---
  carregarVendas();
});
