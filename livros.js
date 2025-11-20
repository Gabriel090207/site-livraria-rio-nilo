document.addEventListener('DOMContentLoaded', async function() {
    const cardsContainer = document.getElementById('cardsContainer');
    const searchInput = document.getElementById('searchInput'); // barra de pesquisa
    const paginationContainer = document.querySelector('.pagination');
  
    let allSales = [];
    let currentPage = 1;
    const itemsPerPage = 6;
  
    // Função para buscar vendas do backend
    async function fetchSales() {
      try {
        const response = await fetch('http://localhost:5000/vendas?period=allTime');
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        allSales = data;
        renderPage(1);
        setupPagination();
      } catch (err) {
        console.error('Erro ao buscar vendas:', err);
        cardsContainer.innerHTML = `<p style="color:red;">Erro ao carregar vendas do servidor.</p>`;
      }
    }
  
    // Função para renderizar uma página de resultados
    function renderPage(page) {
      cardsContainer.innerHTML = '';
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const salesToShow = allSales.slice(start, end);
  
      if (salesToShow.length === 0) {
        cardsContainer.innerHTML = `<p>Nenhuma venda encontrada.</p>`;
        return;
      }
  
      salesToShow.forEach(venda => {
        const card = document.createElement('div');
        card.classList.add('card1', 'info-card');
  
        // Cria imagem padrão caso o backend não envie
        const imgUrl = venda.img_url || 'https://placehold.co/100x140?text=Capa';
  
        card.innerHTML = `
          <div class="card-content">
            <div class="left-info">
              <p><strong>RESPONSÁVEL:</strong> ${venda.cliente_nome || 'N/A'}</p>
              <p><strong>CRIANÇA:</strong> ${venda.nome_crianca || 'N/A'}</p>
            </div>
            <div class="right-info">
              <p><strong>LIVRO COMPRADO:</strong> ${venda.produto || 'N/A'}</p>
              <img src="${imgUrl}" alt="Capa do livro">
            </div>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }
  
    // Função para criar a paginação
    function setupPagination() {
      paginationContainer.innerHTML = '';
      const totalPages = Math.ceil(allSales.length / itemsPerPage);
  
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '«';
      prevBtn.classList.add('page-btn');
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
          setupPagination();
        }
      });
      paginationContainer.appendChild(prevBtn);
  
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('page-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
          currentPage = i;
          renderPage(i);
          setupPagination();
        });
        paginationContainer.appendChild(btn);
      }
  
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '»';
      nextBtn.classList.add('page-btn');
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage);
          setupPagination();
        }
      });
      paginationContainer.appendChild(nextBtn);
    }
  
    // Pesquisa dinâmica
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = allSales.filter(venda =>
          (venda.cliente_nome || '').toLowerCase().includes(term) ||
          (venda.nome_crianca || '').toLowerCase().includes(term) ||
          (venda.produto || '').toLowerCase().includes(term)
        );
        allSales = filtered;
        renderPage(1);
        setupPagination();
      });
    }
  
    // Carrega ao iniciar
    fetchSales();
  });
  