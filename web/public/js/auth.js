(function () {
  const loginErrorMessage = "Invalid username or password.";

  function showLoginError(message) {
    const errorEl = document.getElementById("login-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("is-visible");
    }

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    if (usernameInput) {
      usernameInput.classList.add("is-error");
      usernameInput.focus();
    }
    if (passwordInput) {
      passwordInput.classList.add("is-error");
    }
  }

  function clearLoginError() {
    const errorEl = document.getElementById("login-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("is-visible");
    }

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    if (usernameInput) {
      usernameInput.classList.remove("is-error");
    }
    if (passwordInput) {
      passwordInput.classList.remove("is-error");
    }
  }

  window.checkAuth = async function () {
    const result = await window.getAgents();
    if (result.ok) {
      window.location.href = "dashboard.html";
    }
  };

  window.handleLoginForm = function () {
    const form = document.getElementById("login-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearLoginError();

      const submitButton = document.getElementById("login-submit");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";
      }

      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      const result = await window.login(username, password);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Sign In";
      }

      if (result.ok) {
        window.location.href = "dashboard.html";
        return;
      }

      if (result.status === 401) {
        showLoginError(loginErrorMessage);
        return;
      }

      showLoginError(result.error || "Login failed. Please try again.");
    });
  };

  window.handleLogout = function () {
    const logoutButton = document.getElementById("logout-button");
    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener("click", async function () {
      await window.logout();
      window.location.href = "/";
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.handleLoginForm();
    window.handleLogout();

    if (document.getElementById("login-form")) {
      window.checkAuth();
    }
  });
})();
