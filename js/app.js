// Renders the SBOM JSON with collapsible nodes and field annotations.
// No build step, no dependencies. Paths are relative so the page works from a
// GitHub Pages project subpath.
(function () {
  "use strict";
  const P = window.SBOM_PAGE;
  const SBOM_URL = "data/centos-9-qcow2-x86_64.spdx.json";
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const slug = (p) => "f-" + p.replace(/\[\]/g, "-arr").replace(/@/g, "not-").replace(/[^A-Za-z0-9-]+/g, "-");
  const qSlug = (id) => "q-" + id.toLowerCase();
  const disp = (p) => p.replace(/\.@(.*)$/, ".$1 (not emitted)");

  let ctx = {}; // rootIdx, repIdx, describesIdx, containsIdx

  // ------------------------------------------------------------ helpers
  function link(src, extraClass) {
    const a = el("a", extraClass || "", src.label);
    a.href = src.url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function badgeFor(path) {
    const n = P.NOTES[path];
    if (!n) return null;
    const b = el("button", "badge " + (n.status === "q" ? "badge-q" : n.status === "ok" ? "badge-ok" : "badge-info"));
    b.type = "button";
    b.textContent = n.status === "q" ? n.q : n.status === "ok" ? "✓ note" : "note";
    b.title = n.status === "q" ? "Open question " + n.q + ": click for details" : "Click for field details";
    b.addEventListener("click", (ev) => { ev.stopPropagation(); select(path, true); });
    return b;
  }

  // ------------------------------------------------------------ JSON renderer
  function childPath(parentPath, key, index) {
    if (parentPath === "" ) {
      return key;
    }
    if (parentPath === "packages") {
      if (index === ctx.rootIdx) return "root";
      if (index === ctx.repIdx) return "rpm";
      return null;
    }
    if (parentPath === "relationships") {
      if (index === ctx.describesIdx) return "rel.DESCRIBES";
      if (index === ctx.containsIdx) return "rel.CONTAINS";
      return null;
    }
    if (parentPath === null) return null;
    if (index !== undefined) {
      return parentPath === "creationInfo.creators" ? parentPath + "[" + index + "]" : parentPath + "[]";
    }
    return parentPath + "." + key;
  }

  function line(depth, path) {
    const d = el("div", "ln");
    d.style.paddingLeft = (depth * 2 + 2) + "ch";
    if (path && P.NOTES[path]) {
      d.classList.add("has-note");
      if (P.NOTES[path].status === "q") d.classList.add("has-q");
      d.dataset.path = path;
      // first occurrence wins the anchor id
      if (!document.getElementById(slug(path))) d.id = slug(path);
      d.addEventListener("click", () => select(path, true));
    }
    return d;
  }

  function keySpan(key) { return key === null ? null : el("span", "k", JSON.stringify(key)); }

  function scalarSpan(v) {
    if (typeof v === "string") return el("span", "s", JSON.stringify(v));
    if (typeof v === "number") return el("span", "n", String(v));
    if (typeof v === "boolean") return el("span", "b", String(v));
    return el("span", "z", "null");
  }

  function appendTail(d, last, path) {
    if (!last) d.appendChild(el("span", "p", ","));
    const b = path ? badgeFor(path) : null;
    if (b) d.appendChild(b);
  }

  function summaryFor(v) {
    if (Array.isArray(v)) return "[ … " + v.length + " items ]";
    if (v && typeof v === "object") {
      if (v.name) return "{ \"name\": " + JSON.stringify(v.name) + (v.versionInfo ? ", \"versionInfo\": " + JSON.stringify(v.versionInfo) : "") + ", … }";
      if (v.relationshipType) return "{ " + JSON.stringify(v.relationshipType) + " … }";
      return "{ … }";
    }
    return "";
  }

  // Render value v under container. key = object key or null (array member).
  function render(container, v, key, depth, last, path, opts) {
    opts = opts || {};
    const isObj = v && typeof v === "object";
    if (!isObj) {
      const d = line(depth, path);
      if (key !== null) { d.appendChild(keySpan(key)); d.appendChild(el("span", "p", ": ")); }
      d.appendChild(scalarSpan(v));
      appendTail(d, last, path);
      container.appendChild(d);
      return;
    }
    const isArr = Array.isArray(v);
    const node = el("div", "node");
    const open = line(depth, path);
    const tog = el("span", "tog", "▾");
    open.prepend(tog);
    if (key !== null) { open.appendChild(keySpan(key)); open.appendChild(el("span", "p", ": ")); }
    open.appendChild(el("span", "p", isArr ? "[" : "{"));
    const summ = el("span", "summary", " " + summaryFor(v).replace(/^[\[{]\s?/, "") + " ");
    open.appendChild(summ);
    const tailWhenCollapsed = el("span", "p closing-inline", "");
    open.appendChild(tailWhenCollapsed);
    appendTail(open, true, path);
    const lastComma = !last;
    if (lastComma) { const c = el("span", "p comma-collapsed", ","); open.insertBefore(c, open.querySelector(".badge")); }
    node.appendChild(open);

    const kids = el("div", "kids");
    node.appendChild(kids);
    const close = line(depth, null);
    close.appendChild(el("span", "p", (isArr ? "]" : "}") + (last ? "" : ",")));
    node.appendChild(close);

    const fill = () => {
      if (kids.dataset.filled) return;
      kids.dataset.filled = "1";
      if (isArr && (path === "packages" || path === "relationships")) {
        renderBigArray(kids, v, depth + 1, path);
      } else if (isArr) {
        v.forEach((item, i) => render(kids, item, null, depth + 1, i === v.length - 1, childPath(path, null, i)));
      } else {
        const keys = Object.keys(v);
        const ghosts = path && P.GHOSTS[path] ? P.GHOSTS[path] : [];
        keys.forEach((k, i) => render(kids, v[k], k, depth + 1, i === keys.length - 1, childPath(path, k)));
        ghosts.forEach((g) => kids.appendChild(ghostLine(depth + 1, g)));
      }
      if (isArr && P.GHOSTS[path]) P.GHOSTS[path].forEach((g) => kids.appendChild(ghostLine(depth + 1, g)));
    };

    const setCollapsed = (c) => {
      node.classList.toggle("collapsed", c);
      tog.textContent = c ? "▸" : "▾";
      tailWhenCollapsed.textContent = c ? (isArr ? "]" : "}") : "";
      if (!c) fill();
    };
    node._setCollapsed = setCollapsed;
    tog.addEventListener("click", (ev) => { ev.stopPropagation(); setCollapsed(!node.classList.contains("collapsed")); });
    summ.addEventListener("click", (ev) => { ev.stopPropagation(); setCollapsed(false); });
    setCollapsed(!!opts.collapsed);
    container.appendChild(node);
  }

  function ghostLine(depth, path) {
    const n = P.NOTES[path];
    const d = line(depth, path);
    d.classList.add("ghost");
    d.appendChild(el("span", "ghost-text", "not emitted: " + n.label));
    const b = badgeFor(path);
    if (b) d.appendChild(b);
    return d;
  }

  // packages / relationships: show the annotated members expanded, everything
  // else folded into "gap" rows that expand on click.
  function renderBigArray(container, arr, depth, path) {
    const pinned = new Set(path === "packages" ? [ctx.rootIdx, ctx.repIdx] : [ctx.describesIdx, ctx.containsIdx]);
    let i = 0;
    while (i < arr.length) {
      if (pinned.has(i)) {
        render(container, arr[i], null, depth, i === arr.length - 1, childPath(path, null, i));
        i++;
        continue;
      }
      const start = i;
      while (i < arr.length && !pinned.has(i)) i++;
      container.appendChild(gapRow(arr, start, i, depth, path));
    }
  }

  function gapRow(arr, start, end, depth, path) {
    const wrap = el("div", "gap");
    const d = line(depth, null);
    d.classList.add("gap-line");
    const n = end - start;
    const what = path === "packages" ? (n === 1 ? "package" : "packages") : (n === 1 ? "relationship" : "relationships");
    const names = path === "packages" ? arr.slice(start, Math.min(end, start + 3)).map((p) => p.name).join(", ") + (n > 3 ? ", …" : "") : "";
    d.appendChild(el("span", "tog", "▸"));
    d.appendChild(el("span", "gap-text", n + " more " + what + "  [" + start + (n > 1 ? "–" + (end - 1) : "") + "]" + (names ? "  " + names : "")));
    wrap.appendChild(d);
    d.addEventListener("click", () => {
      const body = el("div", "gap-body");
      for (let j = start; j < end; j++) render(body, arr[j], null, depth, j === arr.length - 1, null, { collapsed: true });
      wrap.replaceChild(body, d);
    });
    return wrap;
  }

  // ------------------------------------------------------------ note panel
  let selectedEl = null;
  function noteContent(path, n) {
    const f = document.createDocumentFragment();
    const head = el("div", "note-head");
    head.appendChild(el("code", "note-path", disp(path)));
    const st = el("span", "chip " + (n.status === "q" ? "chip-q" : n.status === "ok" ? "chip-ok" : "chip-info"),
      n.status === "q" ? "Open question " + n.q : n.status === "ok" ? "Matches guidance" : "Informational");
    head.appendChild(st);
    f.appendChild(head);
    f.appendChild(el("p", "note-what", n.what));
    if (n.code && n.code.length) {
      f.appendChild(el("h4", "", "Where it comes from"));
      const ul = el("ul", "note-list");
      n.code.forEach((c) => { const li = el("li"); li.appendChild(link(c, "code-link")); ul.appendChild(li); });
      f.appendChild(ul);
    }
    if (n.req && n.req.length) {
      f.appendChild(el("h4", "", "Requirement / guidance"));
      const ul = el("ul", "note-list");
      n.req.forEach((r) => {
        const li = el("li");
        li.appendChild(el("span", "req-text", r.text + " "));
        li.appendChild(link(r.src, "src-link"));
        ul.appendChild(li);
      });
      f.appendChild(ul);
    }
    if (n.status === "q") {
      const a = el("a", "q-jump", "→ " + n.q + " in Open questions");
      a.href = "#" + qSlug(n.q);
      f.appendChild(a);
    }
    return f;
  }

  function select(path, updateHash) {
    const n = P.NOTES[path];
    if (!n) return;
    const panel = $("#note-body");
    panel.innerHTML = "";
    panel.appendChild(noteContent(path, n));
    $("#note").classList.toggle("note-q", n.status === "q");
    const target = document.getElementById(slug(path));
    if (selectedEl) selectedEl.classList.remove("selected");
    if (target) { target.classList.add("selected"); selectedEl = target; }
    if (updateHash) history.replaceState(null, "", "#" + slug(path));
  }

  function revealAndSelect(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    // expand collapsed ancestors
    let p = target.parentElement;
    while (p) {
      if (p.classList && p.classList.contains("node") && p.classList.contains("collapsed") && p._setCollapsed) p._setCollapsed(false);
      p = p.parentElement;
    }
    target.scrollIntoView({ block: "center" });
    target.classList.remove("flash"); void target.offsetWidth; target.classList.add("flash");
    if (target.dataset.path) select(target.dataset.path, false);
    return true;
  }

  // ------------------------------------------------------------ questions + table
  function renderQuestions() {
    const box = $("#questions");
    P.QUESTIONS.forEach((q) => {
      const card = el("article", "qcard");
      card.id = qSlug(q.id);
      const h = el("h3");
      h.appendChild(el("span", "qid", q.id));
      h.appendChild(document.createTextNode(" " + q.title));
      card.appendChild(h);
      card.appendChild(el("p", "qq", q.question));
      const cur = el("p", "qcur");
      cur.appendChild(el("strong", "", "Today: "));
      cur.appendChild(document.createTextNode(q.current));
      card.appendChild(cur);
      const ol = el("ol", "qopts");
      q.options.forEach((o) => ol.appendChild(el("li", "", o)));
      const optH = el("p", "qopt-h", "Options");
      card.appendChild(optH);
      card.appendChild(ol);
      const foot = el("div", "qfoot");
      const fl = el("span", "qfields");
      fl.appendChild(el("span", "lbl", "In the JSON: "));
      [...new Set(q.fields)].forEach((f) => {
        const a = el("a", "field-link", disp(f));
        a.href = "#" + slug(f);
        fl.appendChild(a);
      });
      foot.appendChild(fl);
      const rl = el("span", "qrefs");
      rl.appendChild(el("span", "lbl", "Sources: "));
      q.refs.forEach((r, i) => { if (i) rl.appendChild(document.createTextNode(" · ")); rl.appendChild(link(r)); });
      foot.appendChild(rl);
      card.appendChild(foot);
      box.appendChild(card);
    });
    const toc = $("#qtoc");
    P.QUESTIONS.forEach((q) => {
      const li = el("li");
      const a = el("a", "", q.id + " " + q.title);
      a.href = "#" + qSlug(q.id);
      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  function renderFieldTable() {
    const tb = $("#fields tbody");
    Object.keys(P.NOTES).forEach((path) => {
      const n = P.NOTES[path];
      const tr = el("tr", n.status === "q" ? "row-q" : "");
      const td1 = el("td");
      const a = el("a", "field-link", disp(path));
      a.href = "#" + slug(path);
      td1.appendChild(a);
      const td2 = el("td");
      td2.appendChild(el("span", "chip " + (n.status === "q" ? "chip-q" : n.status === "ok" ? "chip-ok" : "chip-info"), n.status === "q" ? n.q : n.status === "ok" ? "OK" : "info"));
      const td3 = el("td", "", n.what);
      const td4 = el("td");
      (n.code || []).forEach((c, i) => { if (i) td4.appendChild(el("br")); td4.appendChild(link(c, "code-link")); });
      const td5 = el("td");
      (n.req || []).forEach((r, i) => { if (i) td5.appendChild(el("br")); td5.appendChild(link(r.src, "src-link")); });
      [td1, td2, td3, td4, td5].forEach((t) => tr.appendChild(t));
      tb.appendChild(tr);
    });
  }

  // ------------------------------------------------------------ boot
  async function boot() {
    renderQuestions();
    renderFieldTable();
    let doc;
    try {
      const res = await fetch(SBOM_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      doc = JSON.parse(await res.text());
    } catch (e) {
      $("#json").textContent = "Could not load " + SBOM_URL + " (" + e.message + "). Serve this directory over HTTP; file:// does not allow fetch().";
      return;
    }
    const pk = doc.packages || [];
    const rels = doc.relationships || [];
    const desc = rels.findIndex((r) => r.relationshipType === "DESCRIBES");
    const rootId = desc >= 0 ? rels[desc].relatedSpdxElement : null;
    ctx.rootIdx = pk.findIndex((p) => p.SPDXID === rootId);
    ctx.repIdx = pk.findIndex((p) => p.name === P.REP_RPM);
    const repId = ctx.repIdx >= 0 ? pk[ctx.repIdx].SPDXID : null;
    ctx.describesIdx = desc;
    ctx.containsIdx = rels.findIndex((r) => r.relationshipType === "CONTAINS" && r.relatedSpdxElement === repId);

    $("#stat-pk").textContent = String(pk.length);
    $("#stat-rel").textContent = String(rels.length);

    const root = $("#json");
    root.innerHTML = "";
    render(root, doc, null, 0, true, "");

    // the anchors of note-less paths would be missing; warn in console for maintainers
    Object.keys(P.NOTES).forEach((p) => { if (!document.getElementById(slug(p))) console.warn("annotation without a rendered line:", p); });

    const go = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (h.startsWith("f-")) revealAndSelect(h);
    };
    window.addEventListener("hashchange", go);
    if (location.hash) go(); else select("root", false);

    $("#btn-expand").addEventListener("click", () => {
      document.querySelectorAll("#json .gap-line").forEach((g) => g.click());
    });
    window.SBOM_READY = true;
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
