// =====================================================
//  Kártyagyűjtő – fő logika
//  FIGYELEM: az adatok a böngésző localStorage-ában vannak.
//  GitHub Pages-en ezért minden játékos csak a saját gépén látja a fiókjait.
//  Ha tényleg közös játékoslistát akartok, kell egy online adatbázis (pl. Firebase).
//  Minden mentés/betöltés a DB objektumon megy át, így később könnyen cserélhető.
// =====================================================

const START_COINS = 500;
const DAILY_COINS = 200;
const PACKS = [
  { id: "basic", name: "Alap csomag", count: 1, price: 100, emoji: "🎁", desc: "1 kártya" },
  { id: "big",   name: "Nagy csomag", count: 5, price: 450, emoji: "📦", desc: "5 kártya – kicsit olcsóbb!" },
];

// ---------- Tárolás ----------
// Ha a böngésző tiltja a localStorage-t (pl. előnézet), memóriába mentünk (frissítésig él).
const mem = {};
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v === null ? (mem[k] ?? null) : v; } catch { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch {} },
  del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch {} },
};
const DB = {
  users() { try { return JSON.parse(store.get("kk_users")) || {}; } catch { return {}; } },
  save(users) { store.set("kk_users", JSON.stringify(users)); },
  session() { return store.get("kk_session"); },
  setSession(n) { n ? store.set("kk_session", n) : store.del("kk_session"); },
};

// Hiba esetén látható üzenet (ne csendben álljon le)
window.addEventListener("error", e => { const el = document.querySelector("#auth-error"); if (el) el.textContent = "Hiba: " + e.message; });
window.addEventListener("unhandledrejection", e => { const el = document.querySelector("#auth-error"); if (el) el.textContent = "Hiba: " + (e.reason && e.reason.message || e.reason); });

async function hash(text) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("kk$" + text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent("kk$" + text)));
}

let me = null; // bejelentkezett felhasználónév

function user() { return DB.users()[me]; }
function updateUser(fn) {
  const users = DB.users();
  fn(users[me]);
  DB.save(users);
  renderSide();
}

// ---------- Segédek ----------
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtPct = n => (n + "%").replace(".", ",");

function cardHTML(c, opts = {}) {
  const { count = 0, missing = false } = opts;
  const name = missing ? "???" : esc(c.name);
  const img = `<img src="${c.img}" alt="" loading="lazy" onerror="this.remove()">`;
  return `
  <div class="card r-${c.rarity} ${missing ? "missing" : ""}" data-id="${c.id}">
    ${c.tag && !missing ? `<span class="tag">${c.tag}</span>` : ""}
    ${count > 1 ? `<span class="count">x${count}</span>` : ""}
    <div class="art"><span class="emoji">${c.emoji}</span>${img}</div>
    <div class="info">
      <div class="cname">${name}</div>
      <div class="crar">${RARITIES[c.rarity].label}</div>
      <div class="cpct">${fmtPct(c.chance)}</div>
    </div>
  </div>`;
}

function rollCard() {
  const total = CARDS.reduce((s, c) => s + c.chance, 0);
  let r = Math.random() * total;
  for (const c of CARDS) { r -= c.chance; if (r <= 0) return c; }
  return CARDS[CARDS.length - 1];
}

// ---------- Auth ----------
let mode = "login";
function setMode(m) {
  mode = m;
  $("#tab-login").classList.toggle("active", m === "login");
  $("#tab-register").classList.toggle("active", m === "register");
  $("#auth-pass2").classList.toggle("hidden", m === "login");
  $("#auth-submit").textContent = m === "login" ? "Belépés" : "Fiók létrehozása";
  $("#auth-error").textContent = "";
}
$("#tab-login").onclick = () => setMode("login");
$("#tab-register").onclick = () => setMode("register");

$("#auth-form").onsubmit = async e => {
  e.preventDefault();
  const name = $("#auth-user").value.trim();
  const pass = $("#auth-pass").value;
  const err = $("#auth-error");
  const users = DB.users();
  const key = Object.keys(users).find(u => u.toLowerCase() === name.toLowerCase());

  if (mode === "register") {
    if (name.length < 3) return (err.textContent = "A név legalább 3 karakter legyen.");
    if (pass.length < 4) return (err.textContent = "A jelszó legalább 4 karakter legyen.");
    if (pass !== $("#auth-pass2").value) return (err.textContent = "A két jelszó nem egyezik.");
    if (key) return (err.textContent = "Ez a név már foglalt.");
    users[name] = { pass: await hash(pass), coins: START_COINS, cards: {}, lastDaily: 0, created: Date.now() };
    DB.save(users);
    me = name;
  } else {
    if (!key || users[key].pass !== await hash(pass)) return (err.textContent = "Hibás név vagy jelszó.");
    me = key;
  }
  DB.setSession(me);
  startApp();
};

$("#logout").onclick = () => {
  DB.setSession(null);
  me = null;
  $("#app").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
  $("#auth-form").reset();
};

// ---------- App ----------
function startApp() {
  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  renderSide();
  showView("mycards");
}

function renderSide() {
  const u = user();
  if (!u) return;
  $("#me-name").textContent = "👤 " + me;
  $("#me-coins").textContent = "🪙 " + u.coins;
}

function showView(v) {
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  $$(".view").forEach(s => s.classList.add("hidden"));
  $("#view-" + v).classList.remove("hidden");
  if (v === "mycards") renderMyCards();
  if (v === "open") renderShop();
  if (v === "players") renderPlayers();
}
$$(".nav-btn").forEach(b => (b.onclick = () => showView(b.dataset.view)));

// ---------- Modal ----------
function openModal(html) { $("#modal-inner").innerHTML = html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); $("#modal-inner").innerHTML = ""; }
$("#modal").onclick = e => { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ---------- Kártyáim ----------
let filter = "all";

function collectionHTML(cards, filterKey, interactive) {
  const owned = CARDS.filter(c => cards[c.id] > 0).length;
  const pct = Math.round((owned / CARDS.length) * 100);
  const keys = ["all", ...Object.keys(RARITIES).sort((a, b) => RARITIES[a].order - RARITIES[b].order)];
  const list = CARDS
    .filter(c => filterKey === "all" || c.rarity === filterKey)
    .sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order || a.chance - b.chance);

  return `
    <div class="sub">Megvan: <b>${owned}</b> / ${CARDS.length} (${pct}%)</div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <div class="filters">
      ${keys.map(k => `<button class="chip ${k === filterKey ? "active" : ""}" data-f="${k}">${k === "all" ? "Mind" : RARITIES[k].label}</button>`).join("")}
    </div>
    <div class="grid">
      ${list.map(c => cardHTML(c, { count: cards[c.id] || 0, missing: !(cards[c.id] > 0) })).join("")}
    </div>`;
}

function renderMyCards() {
  const el = $("#view-mycards");
  el.innerHTML = `<h2>🃏 Kártyáim</h2>` + collectionHTML(user().cards, filter, true);
  el.querySelectorAll(".chip").forEach(b => (b.onclick = () => { filter = b.dataset.f; renderMyCards(); }));
  el.querySelectorAll(".card").forEach(div => (div.onclick = () => inspectCard(div.dataset.id)));
}

function inspectCard(id) {
  const c = CARDS.find(x => x.id === id);
  const n = user().cards[id] || 0;
  if (!n) return;
  const price = RARITIES[c.rarity].sell;
  openModal(`
    ${cardHTML(c, { count: n }).replace('class="card', 'class="card big-card')}
    <p class="sub">Nálad van: <b>${n}</b> db</p>
    ${n > 1 ? `<button class="btn" id="sell-dup">Egy felesleges eladása (+${price} 🪙)</button>` : `<p class="sub">Az utolsó példányt nem lehet eladni.</p>`}
    <br><br><button class="btn alt" id="close-m">Bezár</button>`);
  $("#close-m").onclick = closeModal;
  const sell = $("#sell-dup");
  if (sell) sell.onclick = () => {
    updateUser(u => { u.cards[id]--; u.coins += price; });
    closeModal();
    renderMyCards();
  };
}

// ---------- Shop / nyitás ----------
function renderShop() {
  const u = user();
  const dailyReady = Date.now() - (u.lastDaily || 0) > 24 * 3600 * 1000;
  const sumBy = r => CARDS.filter(c => c.rarity === r).reduce((s, c) => s + c.chance, 0);
  const el = $("#view-open");
  el.innerHTML = `
    <h2>🎁 Kártyanyitás / Shop</h2>
    <div class="sub">Vegyél csomagot és szerezd meg az összes kártyát!</div>
    <div class="shop">
      ${PACKS.map(p => `
        <div class="pack">
          <div class="pic">${p.emoji}</div>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <button class="btn buy" data-id="${p.id}" ${u.coins < p.price ? "disabled" : ""}>Nyitás – ${p.price} 🪙</button>
        </div>`).join("")}
      <div class="pack">
        <div class="pic">🎉</div>
        <h3>Napi ajándék</h3>
        <p>Naponta egyszer +${DAILY_COINS} 🪙</p>
        <button class="btn" id="daily" ${dailyReady ? "" : "disabled"}>${dailyReady ? "Felvétel" : "Már felvetted ma"}</button>
      </div>
    </div>
    <div class="odds">
      <h4>Esélyek</h4>
      ${Object.keys(RARITIES).sort((a, b) => RARITIES[a].order - RARITIES[b].order)
        .map(r => `<div><span class="crar" style="color:inherit">${RARITIES[r].label}</span><span>${fmtPct(Math.round(sumBy(r) * 100) / 100)}</span></div>`).join("")}
    </div>`;

  el.querySelectorAll(".buy").forEach(b => (b.onclick = () => buyPack(b.dataset.id)));
  $("#daily").onclick = () => {
    updateUser(u => { u.coins += DAILY_COINS; u.lastDaily = Date.now(); });
    renderShop();
  };
}

function buyPack(packId) {
  const p = PACKS.find(x => x.id === packId);
  if (user().coins < p.price) return;
  const results = [];
  updateUser(u => {
    u.coins -= p.price;
    for (let i = 0; i < p.count; i++) {
      const c = rollCard();
      results.push({ c, isNew: !(u.cards[c.id] > 0) });
      u.cards[c.id] = (u.cards[c.id] || 0) + 1;
    }
  });

  // rázkódó csomag, majd felfedés
  openModal(`<div class="pack" style="max-width:240px;margin:60px auto"><div class="pic shake" style="font-size:90px">${p.emoji}</div><p>Nyitás...</p></div>`);
  setTimeout(() => {
    const best = results.reduce((a, b) => (RARITIES[b.c.rarity].order < RARITIES[a.c.rarity].order ? b : a));
    openModal(`
      <h2>${best.c.rarity === "secret" ? "🤯 SECRET!!!" : best.c.rarity === "mythic" ? "🔥 MYTHIC!" : "Ezt húztad:"}</h2>
      <div class="reveal-row">
        ${results.map(r => `<div>${cardHTML(r.c)}${r.isNew ? '<div class="new-badge">✨ ÚJ!</div>' : '<div class="sub" style="margin:6px 0 0">Duplikált</div>'}</div>`).join("")}
      </div>
      <button class="btn" id="ok">Szuper!</button>`);
    $("#ok").onclick = () => { closeModal(); renderShop(); };
  }, 900);
}

// ---------- Játékosok ----------
function renderPlayers(selected) {
  const el = $("#view-players");
  const users = DB.users();

  if (selected && users[selected]) {
    const u = users[selected];
    const owned = CARDS.filter(c => u.cards[c.id] > 0).length;
    el.innerHTML = `
      <button class="btn alt back" id="back">← Vissza</button>
      <h2>👤 ${esc(selected)} kártyái</h2>
      <div class="sub">${owned} / ${CARDS.length} kártya van meg</div>
      <div class="grid">
        ${CARDS.slice().sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order || a.chance - b.chance)
          .map(c => cardHTML(c, { count: u.cards[c.id] || 0, missing: !(u.cards[c.id] > 0) })).join("")}
      </div>`;
    $("#back").onclick = () => renderPlayers();
    return;
  }

  const list = Object.entries(users).map(([name, u]) => ({
    name,
    owned: CARDS.filter(c => u.cards[c.id] > 0).length,
    best: CARDS.filter(c => u.cards[c.id] > 0).sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order)[0],
  })).sort((a, b) => b.owned - a.owned);

  el.innerHTML = `
    <h2>👥 Többi játékos</h2>
    <div class="sub">Kattints egy játékosra, hogy lásd a gyűjteményét. (Ranglista kártyák száma szerint)</div>
    <div class="players">
      ${list.map((p, i) => `
        <div class="player" data-n="${esc(p.name)}">
          <div class="avatar">${esc(p.name[0].toUpperCase())}</div>
          <div class="pinfo">
            <div class="pn">${i + 1}. ${esc(p.name)} ${p.name === me ? "(te)" : ""}</div>
            <div class="ps">${p.owned} / ${CARDS.length} kártya${p.best ? " · legjobb: " + esc(p.best.name) + " (" + RARITIES[p.best.rarity].label + ")" : ""}</div>
          </div>
        </div>`).join("")}
    </div>`;
  el.querySelectorAll(".player").forEach(d => (d.onclick = () => renderPlayers(d.dataset.n)));
}

// ---------- Indulás ----------
(function init() {
  const s = DB.session();
  if (s && DB.users()[s]) { me = s; startApp(); }
})();s