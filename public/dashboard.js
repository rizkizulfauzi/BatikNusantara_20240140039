const TOKEN_KEY = "ragam_batik_token";
const token = localStorage.getItem(TOKEN_KEY);

if (!token) {
  window.location.href = "/";
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...extra
  };
}

async function api(url, options = {}) {
  options.headers = authHeaders(options.headers || {});
  const response = await fetch(url, options);
  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/";
    throw new Error("Sesi login berakhir.");
  }

  if (!response.ok) throw new Error(data.message || "Request gagal.");
  return data;
}

async function loadProfile() {
  const result = await api("/api/me");
  document.getElementById("welcome").textContent = `Halo, ${result.data.nama}`;
}

async function loadKeys() {
  const result = await api("/api/keys");
  const list = document.getElementById("keyList");
  list.innerHTML = "";

  document.getElementById("keyCount").textContent = result.data.length;
  document.getElementById("activeCount").textContent =
    result.data.filter((key) => key.is_active).length;

  const requestsToday = result.data.reduce(
    (total, key) => total + Number(key.request_count || 0),
    0
  );
  document.getElementById("requestCount").textContent = requestsToday;

  if (result.data.length === 0) {
    list.innerHTML = '<p class="small">Belum ada API key.</p>';
    return;
  }

  result.data.forEach((key) => {
    const el = document.createElement("div");
    el.className = "key-item";
    el.innerHTML = `
      <div class="key-top">
        <div>
          <strong>${key.nama}</strong><br>
          <span class="key-prefix">${key.key_prefix}...</span>
        </div>
        <span class="small">${key.is_active ? "Aktif" : "Nonaktif"}</span>
      </div>
      <p class="small">Plan: ${key.plan} · Dipakai hari ini: ${key.request_count}/${key.daily_limit} · Total: ${key.total_requests}</p>
      ${key.is_active ? `<button class="btn btn-danger" data-id="${key.id}">Revoke</button>` : ""}
    `;
    list.appendChild(el);
  });

  list.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Nonaktifkan API key ini?")) return;
      await api(`/api/keys/${btn.dataset.id}`, { method: "DELETE" });
      await loadKeys();
    });
  });
}

document.getElementById("keyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("keyMessage");

  try {
    const result = await api("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: document.getElementById("keyName").value })
    });

    message.textContent = result.message;
    message.className = "message show ok";
    document.getElementById("secretValue").textContent = result.api_key;
    document.getElementById("secretBox").classList.add("show");
    document.getElementById("keyName").value = "";
    await loadKeys();
  } catch (error) {
    message.textContent = error.message;
    message.className = "message show err";
  }
});

document.getElementById("refreshBtn").addEventListener("click", loadKeys);

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/";
});

Promise.all([loadProfile(), loadKeys()])
  .catch((error) => console.error(error));
