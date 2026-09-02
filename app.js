const DATA_URL = "./certificados.json";
const form = document.getElementById("validatorForm");
const input = document.getElementById("certificateCode");
const result = document.getElementById("result");
let records = [];

function norm(v) { return String(v || "").trim().toUpperCase(); }
function esc(v) { return String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function show(type, title, body) {
  result.className = `result ${type}`;
  result.innerHTML = `<h2>${title}</h2>${body}`;
  result.classList.remove("hidden");
}

async function load() {
  try {
    const r = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP error");
    const d = await r.json();
    records = Array.isArray(d.codes) ? d.codes : [];
  } catch (e) {
    show("invalid", "Falha na consulta", "<p>Não foi possível carregar a base de certificados.</p>");
  }
}

function validate(code) {
  if (!code) {
    show("invalid", "Código inválido", "<p>Por favor, informe o código do certificado.</p>");
    return;
  }
  
  const found = records.find(x => norm(x.code) === code);
  
  if (found && String(found.name || "").trim() !== "") {
    let html = `<p><b>Nome:</b> ${esc(found.name)}</p><p><b>Código:</b> <span>${esc(found.code)}</span></p>`;
    if (found.course) html += `<p><b>Formação:</b> ${esc(found.course)}</p>`;
    if (found.hours) html += `<p><b>Carga Horária:</b> ${esc(found.hours)}</p>`;
    if (found.topic) html += `<p><b>Tópico:</b> ${esc(found.topic)}</p>`;
    show("valid", "Certificado Válido", html);
  } else {
    show("invalid", "Certificado Inválido", `<p>Nenhum registro ativo foi encontrado para o código <b>${esc(code)}</b>.</p>`);
  }
}

form.addEventListener("submit", e => { e.preventDefault(); validate(norm(input.value)); });
load();
