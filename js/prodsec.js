(() => {
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const MARK = { check: ["✓", "m-ok"], x: ["✗", "m-x"], partial: ["partial", "m-part"], na: ["n/a", "m-na"] };
  const mark = (s, big) => { const [t, c] = MARK[s]; return el("span", "mk " + c + (big ? " big" : ""), t); };
  const APP = { yes: "m-ok", adapted: "m-part", publisher: "m-na", bootc: "m-na", no: "m-na" };
  function simple(box, d) {
    const t = el("table", "cisa"); const h = el("tr"); d.cols.forEach(c => h.append(el("th", "", c))); t.append(h);
    d.rows.forEach(r => { const tr = el("tr"); r.forEach((c, i) => tr.append(el("td", i === 0 ? "rid" : "", c))); t.append(tr); });
    box.append(t);
  }
  window.mountD = async (root) => {
    const d = await (await fetch("data/prodsec.json")).json();
    await window.mountA(root);
    const vbox = root.querySelector("#s-d-sbom .viewer");
    const pin = root.querySelector(".ps-pin");
    const a = el("a", "pin", d.pin.repo + "@" + d.pin.sha.slice(0, 8) + " · " + d.pin.date);
    a.href = "https://github.com/" + d.pin.repo + "/tree/" + d.pin.sha; a.target = "_blank"; pin.append(a);
    const sum = root.querySelector(".ps-sum"); const g = el("span", "sum-g"); g.append(el("b", "", "patch 3"));
    for (const s of ["x", "partial", "check", "na"]) { const m = mark(s); m.append(document.createTextNode(" " + d.rows.filter(r => r.p3 === s).length)); g.append(m); }
    sum.append(g);
    const box = root.querySelector(".ps-box");
    const t = el("table", "cisa"); const h = el("tr");
    ["id", "guideline", "container", "disk image", "applies", "patch 3"].forEach((x, i) => h.append(el("th", i === 5 ? "ib-col ib-p3" : "", x))); t.append(h);
    let area = null;
    for (const r of d.rows) {
      if (r.area !== area) { area = r.area; const gr = el("tr", "grp"); const c = el("td", "", area); c.colSpan = 6; gr.append(c); t.append(gr); }
      const tr = el("tr", "row"); tr.dataset.id = r.id;
      tr.append(el("td", "rid", r.id));
      const q = el("td", "nm"); const det = el("details"); det.append(el("summary", "", r.src.file + ":" + r.src.line));
      det.append(el("blockquote", "", r.src.text)); const l = el("a", "src", "source"); l.href = r.src.url; l.target = "_blank"; det.append(l);
      q.append(det); tr.append(q);
      tr.append(el("td", "", r.container), el("td", "", r.disk));
      const ap = el("td"); ap.append(el("span", "mk " + APP[r.applies], r.applies)); tr.append(ap);
      const p = el("td", "ib-col st-" + r.p3); p.append(mark(r.p3, true));
      if (r.path) { const b = el("button", "ev-btn", r.path); b.addEventListener("click", () => {
          const v = window.jsonViews.get(vbox); vbox.closest("section").scrollIntoView(); if (!v.revealDeep(r.path)) b.classList.add("ev-miss"); }); p.append(b); }
      p.append(el("div", "ev", r.note)); tr.append(p); t.append(tr);
    }
    box.append(t);
    simple(root.querySelector(".ps-diffs"), d.diffs);
    simple(root.querySelector(".ps-merge"), d.merge);
    simple(root.querySelector(".ps-deltas"), d.deltas);
  };
})();
