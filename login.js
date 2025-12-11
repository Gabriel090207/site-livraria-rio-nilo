document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  // 🔐 Lista de usuários e senhas
  const USERS = {

    //E-mails para o instituto Adalberto Carvalho, continua sendo o mesmo foi adicionado +matriz, +filial1, +filial2 para diferenciar as unidades e não gerar conflito no login.

    "cackidsfinanceiro1+matriz@gmail.com": "19445",        // Inst. Adalberto Carvalho Matriz
    "cackidsfinanceiro1+filial1@gmail.com": "54321",        // Inst. Adalberto Carvalho Filial
    "cackidsfinanceiro1+filial2@gmail.com": "11223",        // Inst. Adalberto Carvalho Filial 
    "insmundoencantado@gmail.com": "33445",          // Mundo Encantado
    "financeiro.vilacrianca@gmail.com": "99887",          // Vila Criança
    "miriamosdantas@outlook.com": "77661",          // Sena Dantas
    "ceduagape@gmail.com": "44556",          // Educacional Ágape
    "marciamoraes1504@gmail.com": "90909",         // Colégio Marijunior
    "escolaleaodejuda@hotmail.com": "22211",          // Leão de Judá
    "roseanejv15@gmail.com": "13479",          // Tia Linda
    "educandarior26@gmail.com": "55775",          // Escola Renascer

  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value.trim();

    if (!emailInput || !passwordInput) {
      showError("Preencha todos os campos!");
      return;
    }

    // ✔️ Verifica se usuário existe e senha confere
    if (USERS[emailInput] && USERS[emailInput] === passwordInput) {
      // Armazena informação de login (código da escola)
      localStorage.setItem("usuarioLogado", emailInput);

      // Redireciona
      window.location.href = "portalescola.html";
    } else {
      showError("Usuário ou senha incorretos.");
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
  }
});
