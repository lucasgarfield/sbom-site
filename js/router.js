(() => {
  const host = document.getElementById("chapter"), mounted = {};
  const mount = { konflux: async r => { await window.mountA(r); await window.mountB(r); }, prodsec: r => window.mountD(r), cisa: r => window.mountC(r), grader: window.mountA, mequal: async r => { await window.mountA(r); await window.mountB(r); } };
  const valid = () => [...document.querySelectorAll("#toolbar a")].map(a => a.dataset.ch);
  async function show() {
    const ids = valid();
    let id = location.hash.slice(1); if (!ids.includes(id)) id = ids[0];
    document.querySelectorAll("#toolbar a").forEach(a => a.classList.toggle("on", a.dataset.ch === id));
    for (const c of host.children) c.hidden = c.dataset.ch !== id;
    document.body.dataset.ch = id;
    if (!mounted[id]) {
      const d = document.createElement("div"); d.dataset.ch = id;
      d.append(document.querySelector(`template[data-ch="${id}"]`).content.cloneNode(true));
      host.append(d);
      mounted[id] = mount[id](d).then(() => { d.dataset.ready = "1"; });
    }
    await mounted[id];
    document.body.dataset.ready = "1";
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const ids = valid(), i = ids.indexOf(document.body.dataset.ch);
    const j = i + (e.key === "ArrowRight" ? 1 : -1);
    if (j >= 0 && j < ids.length) location.hash = ids[j];
  });
  window.addEventListener("DOMContentLoaded", show);
})();
