// O'Works · portfólio. Menu do celular, vídeos dos cases e showreel montado na página.

const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// menu do celular
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
toggle.addEventListener("click", () => {
  const aberto = header.classList.toggle("aberto");
  toggle.setAttribute("aria-expanded", String(aberto));
});
document.querySelectorAll(".menu a").forEach(a => a.addEventListener("click", () => {
  header.classList.remove("aberto");
  toggle.setAttribute("aria-expanded", "false");
}));

// vídeos dos cases: carregam e tocam sem som quando aparecem na tela; um clique liga o som
const videos = [...document.querySelectorAll(".video video")];
const tocar = v => {
  if (!v.src) v.src = v.dataset.src;
  v.play().then(() => v.closest(".video").classList.add("tocando")).catch(() => {});
};
const pausar = v => { v.pause(); v.closest(".video").classList.remove("tocando"); };

if (!semMovimento) {
  const io = new IntersectionObserver(entradas => {
    entradas.forEach(e => (e.isIntersecting ? tocar(e.target) : pausar(e.target)));
  }, { threshold: 0.5 });
  videos.forEach(v => io.observe(v));
}

videos.forEach(v => v.addEventListener("click", () => {
  const ligar = v.muted;
  videos.forEach(o => { o.muted = true; o.closest(".video").classList.remove("com-som"); });
  if (ligar) { v.muted = false; v.closest(".video").classList.add("com-som"); }
  tocar(v);
}));

// showreel: a página toca os trechos da lista de trechos, em três colunas (desktop) ou uma (celular)
const pasta = "assets/video/reel/";
const roteiros = {
  triptico: [
    ["e01", "e02", "e03", "e04", "e05", "e06", "e07"],
    ["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10"],
    ["d01", "d02", "d03", "d04", "d05", "d06", "d07"],
  ],
  vertical: [
    ["v01", "v02", "v03", "v04", "v05", "v06", "v07", "v08", "v09", "v10", "v11", "v12", "v13"],
  ],
};
const capas = { triptico: ["e01", "c01", "d01"] };

const showreel = document.querySelector(".showreel");
const celular = window.matchMedia("(max-width: 767px)");
let rodada = 0;

function montar(nome) {
  const reel = showreel.querySelector(`[data-reel="${nome}"]`);
  const colunas = [...reel.querySelectorAll(".reel-col")];
  if (nome === "triptico") colunas.forEach((c, i) => c.querySelector("video").poster = `assets/img/poster-reel-${capas.triptico[i]}.jpg`);
  if (semMovimento) { colunas.forEach(c => c.querySelector("video").classList.add("ativo")); return; }

  const minha = ++rodada;
  let terminadas = 0;

  colunas.forEach((col, i) => {
    const lista = roteiros[nome][i];
    const [a, b] = col.querySelectorAll("video");
    let atual = a, proximo = b, n = 0;

    const carregar = (v, k) => { v.src = pasta + lista[k] + ".mp4"; v.preload = "auto"; v.load(); };
    carregar(atual, 0);
    if (lista.length > 1) carregar(proximo, 1);
    atual.classList.add("ativo");
    atual.play().catch(() => {});

    const avancar = () => {
      if (minha !== rodada) return;
      n++;
      if (n >= lista.length) {
        terminadas++;
        if (terminadas === colunas.length) fechar(nome, minha);
        return;
      }
      proximo.classList.add("ativo");
      proximo.play().catch(() => {});
      atual.classList.remove("ativo");
      [atual, proximo] = [proximo, atual];
      if (n + 1 < lista.length) carregar(proximo, n + 1);
    };
    a.onended = b.onended = e => { if (e.target === atual) avancar(); };
  });
}

function fechar(nome, minha) {
  showreel.classList.add("no-fim");
  setTimeout(() => {
    if (minha !== rodada) return;
    showreel.querySelectorAll(`[data-reel="${nome}"] video`).forEach(v => { v.classList.remove("ativo"); v.onended = null; });
    showreel.classList.remove("no-fim");
    montar(nome);
  }, 3500);
}

function iniciar() {
  rodada++;
  showreel.classList.remove("no-fim");
  showreel.querySelectorAll("video").forEach(v => { v.pause(); v.classList.remove("ativo"); v.onended = null; });
  montar(celular.matches ? "vertical" : "triptico");
}

// só começa quando o showreel aparece na tela, e para quando sai
let iniciado = false;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !iniciado) { iniciado = true; iniciar(); }
  else if (iniciado) showreel.querySelectorAll("video.ativo").forEach(v => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
}, { threshold: 0.2 }).observe(showreel);
celular.addEventListener("change", () => { if (iniciado) iniciar(); });
