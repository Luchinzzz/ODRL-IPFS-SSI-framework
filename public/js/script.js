/* ═══════════════════════════════════════════════════════════
   POLICY VAULT — script.js
   Adattato al nuovo index.html (light redesign)
   ═══════════════════════════════════════════════════════════ */

const BASE = "http://localhost:3000";
let lastCid = null;

/* ══════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════ */
const TAB_MAP = {
  node:      "tab-node",
  policy:    "tab-policy",
  hash:      "tab-hash",
  ipfs:      "tab-ipfs",
  translate: "tab-translate",
  deploy:    "tab-deploy",
};

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
    t.setAttribute("tabindex", active ? "0" : "-1");
  });
  Object.entries(TAB_MAP).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = key === name ? "" : "none";
  });
}

/* ══════════════════════════════════════
   LOG
══════════════════════════════════════ */
function log(msg, type = "info") {
  const area = document.getElementById("log-area");
  // rimuovi placeholder iniziale
  if (area.querySelector(".log-line:not([class*='ok']):not([class*='err']):not([class*='warn'])") &&
      area.textContent.includes("No activity")) {
    area.innerHTML = "";
  }
  const span = document.createElement("span");
  const ts = new Date().toLocaleTimeString("it-IT", { hour12: false });
  span.className = `log-line ${type}`;
  span.innerHTML = `<span class="log-ts">[${ts}]</span> ${msg}`;
  area.appendChild(span);
  area.scrollTop = area.scrollHeight;
}

function clearLog() {
  document.getElementById("log-area").innerHTML =
    '<span class="log-line">// Log cleared</span>';
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let _toastTimer;
function showToast(msg, type = "ok") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.className = ""; }, 3000);
}

/* ══════════════════════════════════════
   NODE STATUS
══════════════════════════════════════ */
function setOnline(on) {
  const pill = document.getElementById("status-pill");
  const text = document.getElementById("status-text");
  pill.className = `pill ${on ? "online" : "offline"}`;
  text.textContent = on ? "Nodo attivo" : "Nodo offline";
  document.getElementById("btn-start").disabled = on;
  document.getElementById("btn-stop").disabled = !on;
  document.getElementById("btn-deploy").disabled = !on;
  document.getElementById("rpc-pill").style.display = on ? "" : "none";
}

function renderStatus(data) {
  if (!data.running) {
    setOnline(false);
    ["stat-block", "stat-chain", "stat-pid", "stat-rpc", "footer-rpc", "rpc-url"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "—";
    });
    document.getElementById("accounts-list").innerHTML =
      '<p class="empty">Start the node to see the accounts</p>';
    return;
  }

  setOnline(true);
  document.getElementById("stat-block").textContent = data.blockNumber ?? "—";
  document.getElementById("stat-chain").textContent = data.chainId    ?? "—";
  document.getElementById("stat-pid").textContent   = data.pid        ?? "—";
  document.getElementById("stat-rpc").textContent   = ":8545";

  const rpc = data.rpc ?? data.rpcUrl ?? "—";
  document.getElementById("rpc-url").textContent    = rpc;
  document.getElementById("footer-rpc").textContent = rpc;

  if (data.accounts?.length) renderAccounts(data.accounts);
  if (data.recentLogs?.length) {
    data.recentLogs.slice(-5).forEach(l =>
      log(l, l.startsWith("[ERR]") ? "err" : "info")
    );
  }
}

function renderAccounts(accounts) {
  const list = document.getElementById("accounts-list");
  const visible = accounts.slice(0, 3);
  const rest = accounts.length - 3;
  list.innerHTML = visible.map(a => `
    <div class="account-row">
      <span class="account-addr">${a.address.slice(0,6)}…${a.address.slice(-4)}</span>
      <span class="account-bal">${a.balance}</span>
    </div>`).join("") +
    (rest > 0 ? `<a class="accounts-more" href="#" onclick="switchTab('node');return false">+ ${rest} altri account</a>` : "");
}

/* ══════════════════════════════════════
   NODE API CALLS
══════════════════════════════════════ */
async function startNode() {
  const btn = document.getElementById("btn-start");
  btn.innerHTML = '<span class="spinner"></span> Starting...';
  btn.disabled = true;
  log("Starting Hardhat node...", "warn");
  try {
    const r = await fetch(`${BASE}/blockchain/start`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    log(`Node started — PID ${d.pid}`, "ok");
    showToast("Node started!");
    setTimeout(fetchStatus, 1500);
  } catch (e) {
    log(`Error starting: ${e.message}`, "err");
    showToast(e.message, "err");
    btn.disabled = false;
  }
  btn.innerHTML = '<i class="bi bi-play-fill"></i> Start node';
}

async function stopNode() {
  log("Stopping node...", "warn");
  try {
    const r = await fetch(`${BASE}/blockchain/stop`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    log("Node stopped.", "ok");
    showToast("Node stopped.");
    setOnline(false);
    ["stat-block","stat-chain","stat-pid","stat-rpc"].forEach(id =>
      document.getElementById(id).textContent = "—"
    );
    document.getElementById("rpc-url").textContent    = "—";
    document.getElementById("footer-rpc").textContent = "—";
    document.getElementById("accounts-list").innerHTML =
      '<p class="empty">Start the node to see the accounts</p>';
  } catch (e) {
    log(`Error stopping: ${e.message}`, "err");
    showToast(e.message, "err");
  }
}

async function fetchStatus() {
  try {
    const r = await fetch(`${BASE}/blockchain/status`);
    const d = await r.json();
    renderStatus(d);
    if (d.running) {
      log(`Block #${d.blockNumber} — chainId ${d.chainId}`, "ok");
    }
  } catch (e) {
    log(`Impossibile raggiungere il server: ${e.message}`, "err");
    showToast("Server non raggiungibile", "err");
  }
}

/* ══════════════════════════════════════
   CONTRACTS LIST (per il select Deploy)
══════════════════════════════════════ */
async function loadContractOptions() {
  try {
    const r = await fetch(`${BASE}/blockchain/contracts-list`);
    const contracts = await r.json();
    const sel = document.getElementById("deploy-source");
    sel.innerHTML = '<option value="">Select a contract...</option>';
    contracts.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error("loadContractOptions:", err);
  }
}

/* ══════════════════════════════════════
   DEPLOY
══════════════════════════════════════ */
async function deployContract() {
  const source  = document.getElementById("deploy-source").value.trim();
  const argsRaw = document.getElementById("deploy-args").value.trim();
  const res     = document.getElementById("deploy-response");

  if (!source) { showToast("Select a contract", "err"); return; }

  let constructorArgs = [];
  if (argsRaw) {
    try { constructorArgs = JSON.parse(argsRaw); }
    catch { showToast("Invalid arguments — use JSON array", "err"); return; }
  }

  const contractPath = "hardhat/contracts/" + source;
  log(`Deploy: ${source}`, "warn");

  const btn = document.getElementById("btn-deploy");
  btn.innerHTML = '<span class="spinner"></span> Deploy in corso...';
  btn.disabled = true;
  res.textContent = ""; res.className = "deploy-response";

  try {
    const r = await fetch(`${BASE}/blockchain/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractPath, constructorArgs }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);

    log(`Deploy OK — ${d.contractName} @ ${d.contractAddress}`, "ok");
    showToast("Contract deployed!");

    const preview = {
      contractName:    d.contractName,
      contractAddress: d.contractAddress,
      abiMethods: d.abi.filter(x => x.type === "function").map(x => x.name),
      bytecode: d.bytecode,
    };
    res.textContent = JSON.stringify(preview, null, 2);
    res.className = "deploy-response visible ok";
    fetchStatus();
  } catch (e) {
    log(`Error deploying: ${e.message}`, "err");
    showToast(e.message, "err");
    res.textContent = "Errore: " + e.message;
    res.className = "deploy-response visible err";
  }

  btn.innerHTML = '<i class="bi bi-box-arrow-up-right"></i> Deploy';
  btn.disabled = false;
}

/* ══════════════════════════════════════
   TERMS OF USE
══════════════════════════════════════ */
async function createTermsOfUse() {
  const resultEl  = document.getElementById("tou-result");
  const type      = document.getElementById("tou-type").value.trim();
  const id        = document.getElementById("tou-id").value.trim();
  const hashIPFS  = document.getElementById("tou-hash-ipfs").value.trim();
  const hashSP    = document.getElementById("tou-hash-sp").value.trim();
  const addressSP = document.getElementById("tou-address-sp").value.trim();

  if (!type) {
    resultEl.textContent = 'The "Type" field is required.';
    resultEl.className = "hash-result err";
    return;
  }

  const payload = {
    type,
    ...(id        && { id }),
    ...(hashIPFS  && { hashIPFS }),
    ...(hashSP    && { hashSP }),
    ...(addressSP && { addressSP }),
  };

  resultEl.textContent = "Creating…";
  resultEl.className = "hash-result";
  log("POST /vc/terms-of-use", "info");

  try {
    const r = await fetch(`${BASE}/vc/terms-of-use`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || "Request failed");
    }
    const result = await r.json();
    resultEl.textContent = JSON.stringify(result, null, 2);
    resultEl.className = "hash-result ok";
    log("Terms of Use created successfully", "ok");
    showToast("Terms of Use created");
    // propagate the IPFS hash in the IPFS tab field if present
    if (result.hashIPFS) document.getElementById("tou-hash-ipfs").value = result.hashIPFS;
  } catch (e) {
    resultEl.textContent = "Error: " + e.message;
    resultEl.className = "hash-result err";
    log("Terms of Use failed: " + e.message, "err");
    showToast("Creation error", "err");
  }
}

/* ══════════════════════════════════════
   HASH
══════════════════════════════════════ */
async function hashJson() {
  const input  = document.getElementById("json-input").value;
  const resEl  = document.getElementById("json-hash-result");
  resEl.textContent = "Calcolo…"; resEl.className = "hash-result";
  try {
    const parsed = JSON.parse(input);
    const r = await fetch(`${BASE}/vc/hash/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: parsed }),
    });
    if (!r.ok) throw new Error("Request failed");
    const d = await r.json();
    resEl.textContent = d.hash;
    resEl.className = "hash-result ok";
  } catch (e) {
    resEl.textContent = "Error: " + e.message;
    resEl.className = "hash-result err";
  }
}

async function hashBytecode() {
  const input = document.getElementById("bytecode-input").value.trim();
  const resEl = document.getElementById("bytecode-hash-result");
  resEl.textContent = "Calculating…"; resEl.className = "hash-result";
  try {
    const r = await fetch(`${BASE}/vc/hash/bytecode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bytecode: input }),
    });
    if (!r.ok) throw new Error("Request failed");
    const d = await r.json();
    resEl.textContent = d.hash;
    resEl.className = "hash-result ok";
  } catch (e) {
    resEl.textContent = "Error: " + e.message;
    resEl.className = "hash-result err";
  }
}

/* ══════════════════════════════════════
   IPFS UPLOAD
══════════════════════════════════════ */
async function doUpload() {
  const raw    = document.getElementById("upload-policy").value.trim();
  const resEl  = document.getElementById("upload-res");
  const cidEl  = document.getElementById("upload-cid");

  if (!raw) {
    resEl.className = "result-box err";
    resEl.textContent = "Please enter a valid JSON object.";
    return;
  }
  let policy;
  try { policy = JSON.parse(raw); }
  catch (e) {
    resEl.className = "result-box err";
    resEl.textContent = "Invalid JSON: " + e.message;
    return;
  }

  resEl.className = "result-box loading";
  resEl.textContent = "Uploading…";
  cidEl.style.display = "none";
  log("POST /ipfs/upload", "info");

  try {
    const r = await fetch(`${BASE}/ipfs/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || r.statusText);

    lastCid = d.cid;
    resEl.className = "result-box ok";
    resEl.textContent = JSON.stringify(d, null, 2);
    document.getElementById("cid-text").textContent = d.cid;
    cidEl.style.display = "block";
    log(`CID: ${d.cid}`, "ok");
    showToast("Policy uploaded");
  } catch (e) {
    resEl.className = "result-box err";
    resEl.textContent = "Error: " + e.message;
    log("Upload failed: " + e.message, "err");
    showToast("Upload error", "err");
  }
}

/* ══════════════════════════════════════
   IPFS RETRIEVE
══════════════════════════════════════ */
async function doGet() {
  const cid    = document.getElementById("get-cid").value.trim();
  const resEl  = document.getElementById("get-res");
  const statsEl= document.getElementById("get-stats");

  if (!cid) {
    resEl.className = "result-box err";
    resEl.textContent = "Please enter a CID.";
    return;
  }
  resEl.className = "result-box loading";
  resEl.textContent = "Retrieving…";
  statsEl.style.display = "none";
  log(`GET /ipfs/${cid}`, "info");

  try {
    const r = await fetch(`${BASE}/ipfs/${encodeURIComponent(cid)}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || r.statusText);

    resEl.className = "result-box ok";
    resEl.textContent = JSON.stringify(d, null, 2);
    document.getElementById("gs-type").textContent = Array.isArray(d) ? "Array" : "Object";
    document.getElementById("gs-keys").textContent = typeof d === "object" && d ? Object.keys(d).length : "—";
    statsEl.style.display = "flex";
    log(`Retrieved CID ${cid}`, "ok");
  } catch (e) {
    resEl.className = "result-box err";
    resEl.textContent = "Error: " + e.message;
    log("Retrieve failed: " + e.message, "err");
  }
}

function pasteLastCid() {
  if (lastCid) {
    document.getElementById("get-cid").value = lastCid;
    log("CID pasted into the input field", "info");
  } else {
    log("No CID available — please upload a policy first", "err");
  }
}

function copyCid() {
  if (!lastCid) return;
  navigator.clipboard.writeText(lastCid)
    .then(() => showToast("CID copied"))
    .catch(() => showToast("Copy not supported", "err"));
}

/* ══════════════════════════════════════
   TRANSLATE ODRL → SOLIDITY
══════════════════════════════════════ */
async function doTranslate() {
  const policyJSON = document.getElementById("tr-policy").value.trim();
  const fileName   = document.getElementById("tr-name").value.trim() || "ODRLPolicy";
  const resEl      = document.getElementById("tr-res");
  const statsEl    = document.getElementById("tr-stats");
  const solPrev    = document.getElementById("sol-preview");

  if (!policyJSON) {
    resEl.className = "result-box err";
    resEl.textContent = "Please enter a valid JSON object.";
    return;
  }
  let policy;
  try { policy = JSON.parse(policyJSON); }
  catch (e) {
    resEl.className = "result-box err";
    resEl.textContent = "Invalid JSON: " + e.message;
    return;
  }

  resEl.className = "result-box loading";
  resEl.textContent = "Translating…";
  statsEl.style.display = "none";
  solPrev.style.display = "none";
  log(`POST /policy/translate → ${fileName}`, "info");

  try {
    const r = await fetch(`${BASE}/policy/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy, fileName }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || r.statusText);

    const code  = d.solidityCode || "";
    const lines = code ? code.split("\n").length : 0;
    const nameMatch = code.match(/contract\s+(\w+)/);
    const baseName  = fileName.replace(/[^a-zA-Z0-9]/g, "");

    document.getElementById("ts-file").textContent  = `${baseName}.sol`;
    document.getElementById("ts-lines").textContent = lines;
    document.getElementById("ts-name").textContent  = nameMatch ? nameMatch[1] : baseName;
    statsEl.style.display = "block";

    document.getElementById("sol-code").value = code;
    solPrev.style.display = "block";

    resEl.className = "result-box ok";
    resEl.textContent = "Translation completed.";
    log(`Solidity generated: ${lines} lines`, "ok");
    showToast("Contract generated");
  } catch (e) {
    resEl.className = "result-box err";
    resEl.textContent = "Error: " + e.message;
    log("Translate failed: " + e.message, "err");
    showToast("Translation error", "err");
  }
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  // wire tab clicks
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    tab.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") switchTab(tab.dataset.tab);
    });
  });

  // tab di default
  switchTab("node");

  // carica lista contratti e stato nodo
  loadContractOptions();
  fetchStatus();
  setInterval(fetchStatus, 60000); 
});