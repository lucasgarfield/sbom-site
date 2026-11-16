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

  function bubble(path) {
    if (!path || !P.QFIELDS[path]) return null;
    const b = el("span", "qbubble", "?");
    b.title = "Open question: " + P.QUESTIONS[P.QFIELDS[path]].title;
    return b;
  }

  function line(depth, path) {
    const d = el("div", "ln");
    d.style.paddingLeft = (depth * 2 + 2) + "ch";
    if (path && P.NOTES[path]) {
      d.classList.add("has-note");
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
      const qb = bubble(path); if (qb) d.appendChild(qb);
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
    if (lastComma) open.appendChild(el("span", "p comma-collapsed", ","));
    const qb = bubble(path); if (qb) open.appendChild(qb);
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
        (P.GHOSTS[path] || []).forEach((g) => kids.appendChild(ghostLine(depth + 1, g)));
      } else {
        const keys = Object.keys(v);
        keys.forEach((k, i) => render(kids, v[k], k, depth + 1, i === keys.length - 1, childPath(path, k)));
        (P.GHOSTS[path] || []).forEach((g) => kids.appendChild(ghostLine(depth + 1, g)));
      }
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
    const d = line(depth, path);
    d.classList.add("ghost");
    d.appendChild(el("span", "ghost-text", "not emitted: " + P.NOTES[path].label));
    const qb = bubble(path); if (qb) d.appendChild(qb);
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
    f.appendChild(head);
    f.appendChild(el("p", "note-what", n.what));
    if (n.req && n.req.length) {
      f.appendChild(el("h4", "", "Red Hat / SPDX guidance"));
      const ul = el("ul", "note-list");
      n.req.forEach((r) => {
        const li = el("li");
        li.appendChild(el("span", "req-text", r.text + " "));
        li.appendChild(link(r.src, "src-link"));
        ul.appendChild(li);
      });
      f.appendChild(ul);
    }
    return f;
  }

  function select(path, updateHash) {
    const n = P.NOTES[path];
    if (!n) return;
    const panel = $("#note-body");
    panel.innerHTML = "";
    panel.appendChild(noteContent(path, n));
    const qcard = $("#qcard");
    const qk = P.QFIELDS[path];
    if (qk) {
      const q = P.QUESTIONS[qk];
      qcard.innerHTML = "";
      const t = el("div", "qcard-label", "Open question for ProdSec");
      qcard.appendChild(t);
      qcard.appendChild(el("h3", "qcard-title", q.title));
      qcard.appendChild(el("p", "qcard-text", q.text));
      qcard.hidden = false;
    } else {
      qcard.hidden = true;
    }
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

  // ------------------------------------------------------------ boot
  async function boot() {
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
    if (location.hash) go();

    window.SBOM_READY = true;
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
