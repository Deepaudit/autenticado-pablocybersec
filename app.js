/* Pablo Cybersec - Autenticação de certificados */

// Reserva usada quando o navegador bloqueia fetch() ao abrir o arquivo direto (file://).
// Mantenha igual ao certificados.json.
const FALLBACK = {
  prefixo: "PCS", anos: [2026], numeroMin: 1, numeroMax: 1000,
  tipos: { EHCS: { curso: "Ethical Hacking & Cyber Security", cargaHoraria: "60 horas" } },
  registros: {}
};

const $ = (id) => document.getElementById(id);
const input = $("code"), btn = $("btn"), box = $("result"), scan = $("scan");
let DB = FALLBACK;

async function loadDB() {
  try {
    const r = await fetch("certificados.json", { cache: "no-store" });
    if (r.ok) DB = await r.json();
  } catch (e) { /* usa FALLBACK */ }
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d) ? iso : d.toLocaleDateString("pt-BR");
}

// Retorna {ok, motivo, dados}
function validate(raw) {
  const code = raw.trim().toUpperCase();
  const m = code.match(/^([A-Z]+)-([A-Z0-9]{2,8})-(\d{4})-(\d{4})$/);
  if (!m) return { ok: false, motivo: "Formato inválido. Use o padrão PCS-EHCS-2026-0001." };
  const [, pre, tipo, ano, num] = m;
  const n = parseInt(num, 10);
  if (pre !== DB.prefixo) return { ok: false, motivo: "Prefixo desconhecido. Códigos da Pablo Cybersec começam com " + DB.prefixo + "." };
  if (!DB.tipos[tipo]) return { ok: false, motivo: "Tipo de certificado \"" + tipo + "\" não existe." };
  if (!DB.anos.includes(parseInt(ano, 10))) return { ok: false, motivo: "Nenhum certificado foi emitido em " + ano + "." };
  if (n < DB.numeroMin || n > DB.numeroMax) return { ok: false, motivo: "Número fora da faixa emitida (" + String(DB.numeroMin).padStart(4, "0") + " a " + DB.numeroMax + ")." };
  const t = DB.tipos[tipo], rec = DB.registros[code] || {};
  if (rec.status && rec.status.toLowerCase() !== "válido")
    return { ok: false, motivo: "Este certificado consta como " + rec.status.toLowerCase() + "." };
  return { ok: true, code, tipo, ano, num, curso: t.curso, carga: t.cargaHoraria, titular: rec.titular, emissao: rec.emissao };
}

const SEAL_OK = '<svg class="seal" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg>';
const SEAL_BAD = '<svg class="seal" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M17 17l18 18M35 17L17 35"/></svg>';

function show(res) {
  box.hidden = false;
  box.className = "result";
  void box.offsetWidth; // reinicia a animação
  box.classList.add(res.ok ? "ok" : "bad");
  if (!res.ok) {
    box.innerHTML = '<div class="head">' + SEAL_BAD + '<h2>Certificado não autenticado</h2></div><p class="msg">' + esc(res.motivo) + "</p>";
    return;
  }
  const rows = [
    ["Código", '<dd class="mono">' + esc(res.code) + "</dd>"],
    ["Curso", "<dd>" + esc(res.curso) + "</dd>"],
    ["Carga horária", "<dd>" + esc(res.carga) + "</dd>"],
    ["Ano de emissão", "<dd>" + esc(res.ano) + "</dd>"],
    ["Titular", "<dd>" + (res.titular ? esc(res.titular) : "Registrado na Pablo Cybersec") + "</dd>"]
  ];
  if (res.emissao) rows.push(["Emitido em", "<dd>" + fmtDate(res.emissao) + "</dd>"]);
  box.innerHTML = '<div class="head">' + SEAL_OK + "<h2>Certificado autêntico</h2></div><dl>" +
    rows.map((r) => "<dt>" + r[0] + "</dt>" + r[1]).join("") + "</dl>";
}

function check() {
  if (!input.value.trim()) { input.focus(); return; }
  btn.disabled = true; btn.textContent = "Verificando...";
  box.hidden = true;
  scan.classList.remove("on"); void scan.offsetWidth; scan.classList.add("on");
  setTimeout(() => {
    show(validate(input.value));
    btn.disabled = false; btn.textContent = "Verificar";
    history.replaceState(null, "", "?codigo=" + encodeURIComponent(input.value.trim().toUpperCase()));
  }, 1200);
}

btn.addEventListener("click", check);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });

// Fundo animado: partículas vermelhas e azuis ligadas por linhas
(function () {
  const c = $("bg"), x = c.getContext("2d");
  let w, h, pts = [];
  const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight;
    pts = Array.from({ length: Math.min(70, Math.floor(w / 18)) }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
      col: i % 2 ? "225,29,46" : "47,123,255" })); };
  addEventListener("resize", resize); resize();
  (function loop() {
    x.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      x.fillStyle = "rgba(" + p.col + ",.9)"; x.fillRect(p.x, p.y, 2, 2);
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) { x.strokeStyle = "rgba(" + a.col + "," + (.25 * (1 - d / 120)) + ")"; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
    }
    requestAnimationFrame(loop);
  })();
})();

// Inicialização: carrega o JSON e verifica automaticamente se vier ?codigo= na URL (útil para QR Code)
loadDB().then(() => {
  const q = new URLSearchParams(location.search).get("codigo");
  if (q) { input.value = q; check(); }
});
