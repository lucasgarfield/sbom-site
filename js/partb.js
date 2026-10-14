(function () {
  "use strict";
  const get = (u, json) => fetch(u).then(r => { if (!r.ok) throw new Error(u + " " + r.status); return json ? r.json() : r.text(); });
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const a = (href, text, cls) => { const x = el("a", cls, text); x.href = href; x.target = "_blank"; x.rel = "noopener"; return x; };
  const sev = s => el("span", "sev sev-" + s, s);
  const code = seg => { const p = el("pre", "rego"); p.append(highlightRego(seg.text)); return p; };
  function ruleBlock(seg, open) {
    const d = el("details", "rule"); d.open = !!open;
    const s = el("summary");
    s.append(el("span", "rid", seg.id), sev(seg.severity), a(seg.url, "L" + seg.start + "–" + seg.end, "srcl"));
    d.append(s, code(seg)); return d;
  }

  async function cdxSection(box) {
    const P = await get("data/policies.json", true);
    const bar = el("div", "bar"); box.append(bar);
    const all = [];
    for (const p of P.policies) {
      const d = el("details", "pol"); all.push(d);
      const s = el("summary"); s.append(el("span", "pid", p.cdx_head.id), sev(p.cdx_head.severity), a(p.cdx_url, p.cdx_file, "srcl"));
      d.append(s, ruleBlock(Object.assign({}, p.cdx_head, { id: "policy" })));
      for (const r of p.cdx_rules) { const rb = ruleBlock(r); all.push(rb); d.append(rb); }
      box.append(d);
    }
    bar.append(btn("expand all", () => all.forEach(x => x.open = true)), btn("collapse all", () => all.forEach(x => x.open = false)));
  }
  const btn = (label, fn) => { const b = el("button", "btn", label); b.addEventListener("click", fn); return b; };

  async function paritySection(box) {
    const P = await get("data/policies.json", true);
    const counts = {}; P.policies.forEach(p => p.rules.forEach(r => counts[r.marker] = (counts[r.marker] || 0) + 1));
    const sum = el("div", "bar");
    for (const k of ["exact", "adapted", "not convertible"]) sum.append(el("span", "mk mk-" + k.replace(" ", "-"), k + " " + (counts[k] || 0)));
    const allOk = P.policies.every(p => p.rules.every(r => r.parity.every(x => x.match)));
    sum.append(el("span", "mk " + (allOk ? "mk-exact" : "mk-not-convertible"), "fixtures " + (allOk ? "✓ parity" : "✗ mismatch")));
    box.append(sum);
    const heads = el("div", "pgrid phead"); heads.append(el("div", "", "CycloneDX"), el("div", "", "SPDX 2.3")); box.append(heads);
    for (const p of P.policies) {
      const sec = el("details", "pol"); sec.open = false;
      const s = el("summary"); s.append(el("span", "pid", p.cdx_head.id + " → " + p.spdx_head.id));
      p.rules.forEach(r => s.append(el("span", "mk mk-" + r.marker.replace(" ", "-"), r.marker)));
      sec.append(s);
      const g0 = el("div", "pgrid");
      g0.append(ruleBlock(Object.assign({}, p.cdx_head, { id: p.cdx_file })), ruleBlock(Object.assign({}, p.spdx_head, { id: p.spdx_file })));
      sec.append(g0);
      for (const r of p.rules) {
        const row = el("div", "prow");
        const top = el("div", "ptop");
        top.append(el("span", "mk mk-" + r.marker.replace(" ", "-"), r.marker), el("span", "rid", r.cdx.id + " → " + r.spdx.id));
        const fx = el("span", "fx");
        for (const x of r.parity) {
          const c = el("a", "chip " + (x.match ? "ok" : "bad"), x.fixture + " " + (x.cdx ? "✗" : "✓") + "/" + (x.spdx ? "✗" : "✓"));
          c.href = "data/fixtures/" + x.fixture + ".spdx.json"; c.title = "CycloneDX / SPDX: ✗ = rule fires"; fx.append(c);
        }
        top.append(fx); row.append(top);
        if (r.callout) row.append(el("div", "callout", r.callout));
        const g = el("div", "pgrid"); g.append(ruleBlock(r.cdx, true), ruleBlock(r.spdx, true)); row.append(g);
        sec.append(row);
      }
      box.append(sec);
    }
    const u = el("details", "pol"); const us = el("summary"); us.append(el("span", "pid", "spdx_util.rego"), a(P.util.url, "source", "srcl"));
    u.append(us, code(P.util.segments[0])); box.append(u);
    const fl = el("div", "bar"); fl.append(el("span", "lbl", "fixtures"));
    for (const f of P.fixtures) for (const t of ["cdx", "spdx"]) fl.append(a("data/fixtures/" + f + "." + t + ".json", f + "." + t + ".json", "btn"));
    box.append(fl);
  }

  async function gapsSection(box) {
    const gaps = await get("data/gaps-p1.json", true);
    const t = el("table", "gaps"); const h = el("tr");
    ["rule", "policy", "severity", "affected packages", ""].forEach(x => h.append(el("th", "", x))); t.append(h);
    const vbox = box.querySelector(".viewer");
    for (const gp of gaps) {
      const tr = el("tr");
      tr.append(el("td", "rid", gp.rule_id), el("td", "", gp.policy_id));
      const sc = el("td"); sc.append(sev(gp.severity)); tr.append(sc);
      tr.append(el("td", "num", gp.affected === "document" ? "document" : gp.affected + " / " + gp.total));
      const lk = el("td"); const b = btn("show", () => { const v = window.jsonViews && window.jsonViews.get(vbox); if (v) v.reveal(gp.path); });
      lk.append(b); tr.append(lk); t.append(tr);
    }
    box.insertBefore(t, vbox);
  }

  async function tableSection(box) {
    const rows = await get(box.dataset.src, true);
    const t = el("table", "gaps"); const h = el("tr"); rows.cols.forEach(c => h.append(el("th", "", c))); t.append(h);
    for (const r of rows.rows) { const tr = el("tr"); r.forEach((c, i) => tr.append(el("td", i === 0 ? "rid" : "", c))); t.append(tr); }
    box.append(t);
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const jobs = [];
    document.querySelectorAll(".cdx-policies").forEach(b => jobs.push(cdxSection(b)));
    document.querySelectorAll(".parity").forEach(b => jobs.push(paritySection(b)));
    document.querySelectorAll(".gaps-box").forEach(b => jobs.push(gapsSection(b)));
    document.querySelectorAll(".table-box").forEach(b => jobs.push(tableSection(b)));
    document.querySelectorAll("[data-grade-src]").forEach(e => jobs.push(get(e.dataset.gradeSrc).then(t => {
      const m = t.replace(/<[^>]+>/g, "").match(/Grade: ([A-F])/); e.textContent = m ? m[1] : "?"; })));
    await Promise.all(jobs);
    document.body.dataset.readyB = "1";
  });
})();
