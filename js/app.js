(function () {
  "use strict";
  const get = (u, json) => fetch(u).then(r => { if (!r.ok) throw new Error(u + " " + r.status); return json ? r.json() : r.text(); });
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (label, fn) => { const b = el("button", "btn", label); b.addEventListener("click", fn); return b; };

  async function setupViewer(box) {
    const left = await get(box.dataset.left, true);
    const right = box.dataset.right ? await get(box.dataset.right, true) : undefined;
    const bar = el("div", "bar"), host = el("div", "jv-host");
    box.append(bar, host);
    if (right !== undefined) {
      const hdr = el("div", "jv-heads");
      hdr.append(el("div", "jv-head", box.dataset.left.split("/").pop()), el("div", "jv-head", box.dataset.right.split("/").pop()));
      box.insertBefore(hdr, host);
    }
    const v = new JsonView(host, left, right);
    (window.jsonViews = window.jsonViews || new Map()).set(box, v);
    bar.append(btn("expand all", () => v.expandAll()), btn("collapse all", () => v.collapseAll()));
    if (right !== undefined) {
      const pos = el("span", "pos", "");
      const total = v.tree.count(v.tree.root);
      bar.append(btn("◀ prev change", () => { const r = v.nextChange(-1); if (r) pos.textContent = r.i + " / " + r.n; }),
                 btn("next change ▶", () => { const r = v.nextChange(1); if (r) pos.textContent = r.i + " / " + r.n; }));
      const lab = el("label", "chk"), cb = el("input"); cb.type = "checkbox";
      cb.addEventListener("change", () => v.setOnlyChanged(cb.checked));
      lab.append(cb, document.createTextNode(" only changed"));
      bar.append(lab, pos, el("span", "total", total + " changes"));
      v.setOnlyChanged(false);
    }
  }

  async function setupCode(box) {
    const text = (await get(box.dataset.src)).replace(/\n$/, "");
    const pre = el("pre", "cmd", text);
    const b = btn("copy", async () => { await navigator.clipboard.writeText(text + "\n"); b.textContent = "copied"; setTimeout(() => b.textContent = "copy", 1200); });
    b.classList.add("copy");
    box.append(b, pre);
  }

  async function setupTerm(pre) { pre.innerHTML = await get(pre.dataset.src); }

  async function setupPatch(box) {
    const text = await get(box.dataset.src);
    const lines = text.split("\n");
    const head = [], files = []; let cur = null;
    for (const ln of lines) {
      if (ln.startsWith("diff --git ")) { cur = { name: ln.replace(/^diff --git a\/(\S+) b\/.*/, "$1"), lines: [ln], add: 0, del: 0 }; files.push(cur); continue; }
      if (!cur) { head.push(ln); continue; }
      if (ln.startsWith("-- ") && ln.length === 3) { cur = null; continue; }
      cur.lines.push(ln);
      if (ln.startsWith("+") && !ln.startsWith("+++")) cur.add++;
      if (ln.startsWith("-") && !ln.startsWith("---")) cur.del++;
    }
    box.append(el("pre", "p-head", head.join("\n").trim()));
    const ctl = el("div", "bar");
    box.append(ctl);
    const dets = [];
    for (const f of files) {
      const d = el("details", "p-file"); d.open = true; dets.push(d);
      const s = el("summary");
      s.append(el("span", "p-name", f.name), el("span", "p-add", " +" + f.add), el("span", "p-del", " −" + f.del));
      const pre = el("pre", "p-body");
      for (const ln of f.lines) {
        let c = "ctx";
        if (ln.startsWith("+++") || ln.startsWith("---") || ln.startsWith("diff ") || ln.startsWith("index ")) c = "meta";
        else if (ln.startsWith("@@")) c = "hunk";
        else if (ln.startsWith("+")) c = "add";
        else if (ln.startsWith("-")) c = "del";
        pre.append(el("span", "p-" + c, ln + "\n"));
      }
      d.append(s, pre); box.append(d);
    }
    ctl.append(btn("expand all", () => dets.forEach(d => d.open = true)), btn("collapse all", () => dets.forEach(d => d.open = false)));
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const jobs = [];
    document.querySelectorAll(".code").forEach(b => jobs.push(setupCode(b)));
    document.querySelectorAll(".term").forEach(b => jobs.push(setupTerm(b)));
    document.querySelectorAll(".patch").forEach(b => jobs.push(setupPatch(b)));
    document.querySelectorAll(".viewer").forEach(b => jobs.push(setupViewer(b)));
    await Promise.all(jobs);
    document.body.dataset.ready = "1";
  });
})();
