document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  // 🔐 Usuário e senha definidos no JS
  const USER = "admin@rionilo";
  const PASSWORD = "12345";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if (!emailInput || !passwordInput) {
      showError("Preencha todos os campos!");
      return;
    }

    if (emailInput === USER && passwordInput === PASSWORD) {
      // Armazena informação de login e redireciona
      localStorage.setItem("usuarioLogado", emailInput);
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
