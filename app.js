const usersDb = {
  steve: { password: "minecraft123", role: "player", coins: 1200, email: "steve@mc.local" },
  alex: { password: "redstone", role: "player", coins: 830, email: "alex@mc.local" },
  admin: { password: null, role: "admin", coins: 99999, email: "admin@mc.local" }
};

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const result = document.getElementById("result");
const currentUser = document.getElementById("currentUser");
const currentRole = document.getElementById("currentRole");

const btnMyProfile = document.getElementById("btnMyProfile");
const btnAnyProfile = document.getElementById("btnAnyProfile");
const btnAdminPanel = document.getElementById("btnAdminPanel");
const btnFrontShield = document.getElementById("btnFrontShield");
const btnLogout = document.getElementById("btnLogout");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInfo(message) {
  result.innerHTML = `<div class="result-note">${escapeHtml(message)}</div>`;
}

function renderProfileCard(username, profile, title) {
  const safeTitle = escapeHtml(title);
  const safeName = escapeHtml(username);
  const safeRole = escapeHtml(profile.role);
  const safeEmail = escapeHtml(profile.email);
  const safeCoins = escapeHtml(profile.coins);
  const safePassword = profile.password === null ? "null" : escapeHtml(profile.password);

  result.innerHTML = `
    <div class="result-panel">
      <h4>${safeTitle}</h4>
      <div class="result-grid">
        <div class="result-item"><span>Pseudo</span><strong>${safeName}</strong></div>
        <div class="result-item"><span>Rôle</span><strong>${safeRole}</strong></div>
        <div class="result-item"><span>Email</span><strong>${safeEmail}</strong></div>
        <div class="result-item"><span>Coins</span><strong>${safeCoins}</strong></div>
        <div class="result-item warning"><span>Mot de passe (fuite)</span><strong>${safePassword}</strong></div>
      </div>
    </div>
  `;
}

function renderAdminTable(database) {
  const rows = Object.entries(database)
    .map(([username, profile]) => {
      const safeUser = escapeHtml(username);
      const safeRole = escapeHtml(profile.role);
      const safeEmail = escapeHtml(profile.email);
      const safeCoins = escapeHtml(profile.coins);
      const safePassword = profile.password === null ? "null" : escapeHtml(profile.password);
      return `
        <tr>
          <td>${safeUser}</td>
          <td>${safeRole}</td>
          <td>${safeEmail}</td>
          <td>${safeCoins}</td>
          <td>${safePassword}</td>
        </tr>
      `;
    })
    .join("");

  result.innerHTML = `
    <div class="result-panel">
      <h4>Panneau admin — Export utilisateurs</h4>
      <div class="table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Email</th>
              <th>Coins</th>
              <th>Mot de passe</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function setSession(username, role) {
  localStorage.setItem("sessionUser", username);
  localStorage.setItem("sessionRole", role);
}

function clearSession() {
  localStorage.removeItem("sessionUser");
  localStorage.removeItem("sessionRole");
}

function readSession() {
  return {
    user: localStorage.getItem("sessionUser") || "guest",
    role: localStorage.getItem("sessionRole") || "guest"
  };
}

function renderSession() {
  const session = readSession();
  currentUser.textContent = session.user;
  currentRole.textContent = session.role;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const account = usersDb[username];

  if (!account) {
    loginMessage.textContent = "Utilisateur inconnu.";
    return;
  }

  if (String(account.password) === String(password)) {
    setSession(username, account.role);
    loginMessage.textContent = `Connexion réussie: ${username} (${account.role})`;
    renderSession();
    return;
  }

  // Vulnérabilité pédagogique : bypass simplifié façon "injection logique"
  if (password.includes("' OR '1'='1") || password.toLowerCase() === "null") {
    const forcedRole = username === "admin" ? "admin" : "player";
    setSession(username, forcedRole);
    loginMessage.textContent = "Bypass accepté (démo vulnérable).";
    renderSession();
    return;
  }

  loginMessage.textContent = "Mot de passe incorrect.";
});

btnMyProfile.addEventListener("click", () => {
  const session = readSession();
  if (!usersDb[session.user]) {
    renderInfo("Aucun profil accessible. Connectez-vous d'abord.");
    return;
  }

  renderProfileCard(session.user, usersDb[session.user], "Mon profil joueur");
});

btnAnyProfile.addEventListener("click", () => {
  const params = new URLSearchParams(window.location.search);
  const askedUser = params.get("viewUser") || "alex";

  if (!usersDb[askedUser]) {
    renderInfo("Profil demandé introuvable.");
    return;
  }

  // Vulnérabilité pédagogique : pas de contrôle d'autorisation
  renderProfileCard(askedUser, usersDb[askedUser], "Profil consulté (accès non contrôlé)");
});

btnAdminPanel.addEventListener("click", () => {
  const session = readSession();

  // Vulnérabilité pédagogique : confiance totale dans la valeur front
  if (session.role === "admin") {
    renderAdminTable(usersDb);
    return;
  }

  renderInfo("Accès admin refusé.");
});

btnFrontShield.addEventListener("click", () => {
  // Vulnérabilité pédagogique : protection uniquement visuelle (disabled côté HTML)
  // Si l'attribut disabled est retiré via DevTools, l'export s'exécute sans contrôle.
  renderAdminTable(usersDb);
});

btnLogout.addEventListener("click", () => {
  clearSession();
  renderSession();
  renderInfo("Session supprimée.");
  loginMessage.textContent = "";
});

renderSession();
renderInfo("Prêt pour l'investigation. Ouvrez les DevTools.");
