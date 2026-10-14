(() => {
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const MARK = { check: ["✓", "m-ok"], x: ["✗", "m-x"], partial: ["partial", "m-part"], na: ["n/a", "m-na"] };
  const mark = (s, big) => { const [t, c] = MARK[s]; return el("span", "mk " + c + (big ? " big" : ""), t); };
  window.mountC = async (root) => {
    const box = root.querySelector(".cisa-box"); if (!box) return;
    const d = await (await fetch("data/cisa.json")).json();
    const vboxes = { p2: root.querySelector("#s-c-sbom .viewer"), p3: root.querySelector("#s-c-sbom-p3 .viewer") };
    await window.mountA(root); await window.mountB(root);
    // pin
    const pin = root.querySelector(".cisa-pin");
    const a = el("a", "pin", d.doc.title + " · v" + d.doc.version + " · " + d.doc.date); a.href = d.doc.url; a.target = "_blank";
    const loc = el("a", "pin", "local copy"); loc.href = d.doc.local; loc.target = "_blank";
    const sha = el("code", "pin-sha", "sha256 " + d.doc.sha256.slice(0, 16) + "…"); sha.title = d.doc.sha256;
    pin.append(a, loc, sha);
    // counts
    const cnt = k => s => d.rows.filter(r => st(r, k) === s).length;
    const sum = root.querySelector(".cisa-sum");
    const IBS = [["p2", "image-builder (patch 2)"], ["p3", "image-builder (patch 3)"]];
    const st = (r, k) => (k === "p2" || k === "p3") ? r.ib[k].status : r[k].status;
    for (const [k, lab] of [["p3", "image-builder (patch 3)"], ["p2", "image-builder (patch 2)"], ["grader", "sbom-grader"], ["mequal", "mequal"]]) {
      const g = el("span", "sum-g"); g.append(el("b", "", lab));
      for (const s of ["x", "partial", "check", "na"]) { const m = mark(s); m.append(document.createTextNode(" " + cnt(k)(s))); g.append(m); }
      sum.append(g);
    }
    // filter
    const ctl = el("label", "cisa-filter"); const cb = el("input"); cb.type = "checkbox"; ctl.append(cb, document.createTextNode(" image-builder (patch 3) ✗ only"));
    box.append(ctl);
    const t = el("table", "cisa"); const h = el("tr");
    ["id", "element", "sbom-grader", "mequal"].forEach(x => h.append(el("th", "", x)));
    IBS.forEach(([k, lab]) => h.append(el("th", "ib-col ib-" + k, lab))); t.append(h);
    let group = null;
    for (const r of d.rows) {
      if (r.section !== group) { group = r.section; const gr = el("tr", "grp"); gr.append(el("td", "", group)); gr.firstChild.colSpan = 6; t.append(gr); }
      const tr = el("tr", "row ib-" + r.ib.p3.status); tr.dataset.id = r.id;
      tr.append(el("td", "rid", r.id));
      const nm = el("td", "nm"); const det = el("details"); const su = el("summary", "", r.name);
      det.append(su); const q = el("blockquote", "", r.quote); const src = el("div", "src", r.heading + " · " + r.section + " · p." + r.page);
      det.append(q, src); nm.append(det); tr.append(nm);
      for (const k of ["grader", "mequal"]) {
        const c = el("td", "tool"); c.append(mark(r[k].status));
        if (r[k].rules.length) { const ul = el("ul", "rules"); r[k].rules.forEach(x => ul.append(el("li", "", x))); c.append(ul); }
        c.append(el("div", "ev", r[k].evidence)); tr.append(c);
      }
      for (const [k] of IBS) {
        const e = r.ib[k], vbox = vboxes[k];
        const ib = el("td", "ib-col ib-" + k + " st-" + e.status); ib.append(mark(e.status, true));
        if (e.path) { const b = el("button", "ev-btn", e.path); b.dataset.sbom = k; b.addEventListener("click", () => {
            const v = window.jsonViews && window.jsonViews.get(vbox); vbox.closest("section").scrollIntoView();
            if (v && !v.revealDeep(e.path)) b.classList.add("ev-miss"); });
          ib.append(b); }
        ib.append(el("div", "ev", e.why)); tr.append(ib);
      }
      t.append(tr);
    }
    box.append(t);
    cb.addEventListener("change", () => t.classList.toggle("only-x", cb.checked));
  };
})();
