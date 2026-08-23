function showMessage(id, text, ok = false) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `message show ${ok ? "ok" : "err"}`;
}

async function sendAuth(url, body, messageId) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(messageId, result.message || "Request gagal.");
      return;
    }

    localStorage.setItem("ragam_batik_token", result.token);
    showMessage(messageId, result.message || "Berhasil.", true);
    setTimeout(() => window.location.href = "/dashboard", 500);
  } catch (error) {
    showMessage(messageId, error.message);
  }
}

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sendAuth("/api/register", {
    nama: document.getElementById("regNama").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value
  }, "registerMessage");
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sendAuth("/api/login", {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  }, "loginMessage");
});
