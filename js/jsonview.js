// JSON viewer with an optional two-pane diff mode.
// Nodes are keyed by path; array items are matched by a key function so the
// same package/relationship lines up on both sides; expansion state lives in a
// shareable ExpansionStore keyed by path.
(function (global) {
  "use strict";

  class ExpansionStore {
    constructor() { this.open = new Set(); this.listeners = new Set(); }
    isOpen(p) { return this.open.has(p); }
    set(p, v) { if (v === this.isOpen(p)) return; v ? this.open.add(p) : this.open.delete(p); this.emit([p]); }
    toggle(p) { this.set(p, !this.isOpen(p)); }
    setMany(paths, v) { for (const p of paths) v ? this.open.add(p) : this.open.delete(p); this.emit(null); }
    clear() { this.open.clear(); this.emit(null); }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    emit(paths) { for (const fn of this.listeners) fn(paths); }
  }

  const kind = v => Array.isArray(v) ? "arr" : (v !== null && typeof v === "object") ? "obj" : "prim";

  // --- array key functions -------------------------------------------------
  function spdxNames(doc) {
    const m = new Map([["SPDXRef-DOCUMENT", "DOCUMENT"]]);
    for (const p of (doc && doc.packages) || []) m.set(p.SPDXID, p.name + (p.versionInfo ? "@" + p.versionInfo : ""));
    return m;
  }
  function makeKeyFns(doc) {
    const names = spdxNames(doc);
    const res = id => names.get(id) || id;
    return {
      packages: p => (p.name || "?") + " " + (p.versionInfo || ""),
      relationships: r => res(r.spdxElementId) + " " + r.relationshipType + " " + res(r.relatedSpdxElement),
      hasExtractedLicensingInfos: e => e.licenseId,
      checksums: c => c.algorithm,
      externalRefs: e => e.referenceType + " " + (e.referenceType === "purl" ? "" : e.referenceLocator),
      creators: c => c,
    };
  }
  function keyedItems(arr, parentKey, keyFns) {
    const fn = keyFns[parentKey];
    const seen = new Map();
    return arr.map((v, i) => {
      let k = fn ? String(fn(v)) : String(i);
      if (!fn && kind(v) === "prim") k = String(i);
      const n = (seen.get(k) || 0) + 1; seen.set(k, n);
      if (n > 1) k += " #" + n;
      return { k, v };
    });
  }

  // --- merged tree -----------------------------------------------------------
  function segment(isArr, k) { return isArr ? "[" + k + "]" : "." + k; }

  class Tree {
    constructor(left, right, diff) {
      this.diff = diff;
      this.root = { path: "$", label: null, l: left, r: right, hasL: true, hasR: diff, depth: 0, pk: null };
      this.kfL = makeKeyFns(left); this.kfR = diff ? makeKeyFns(right) : null;
      this.kids = new Map(); this.counts = new Map(); this.byPath = new Map([["$", this.root]]);
    }
    containerKind(n) {
      const kl = n.hasL ? kind(n.l) : null, kr = n.hasR ? kind(n.r) : null;
      if (kl && kr && kl !== kr) return "prim"; // type change: treat as a leaf
      return kl || kr;
    }
    children(n) {
      if (this.kids.has(n.path)) return this.kids.get(n.path);
      const ck = this.containerKind(n); let out = [];
      if (ck === "obj") {
        const keys = []; const s = new Set();
        for (const side of [n.hasL ? n.l : null, n.hasR ? n.r : null]) if (side) for (const k of Object.keys(side)) if (!s.has(k)) { s.add(k); keys.push(k); }
        out = keys.map(k => this.mk(n, k, false, k,
          n.hasL && n.l && k in n.l, n.hasL && n.l ? n.l[k] : undefined,
          n.hasR && n.r && k in n.r, n.hasR && n.r ? n.r[k] : undefined));
      } else if (ck === "arr") {
        const L = n.hasL ? keyedItems(n.l, n.pk, this.kfL) : [];
        const R = n.hasR ? keyedItems(n.r, n.pk, this.kfR) : [];
        const rmap = new Map(R.map(x => [x.k, x.v])), lset = new Set(L.map(x => x.k));
        const order = L.map(x => x.k);
        // insert right-only items after their right-side predecessor
        let prev = null;
        for (const x of R) {
          if (!lset.has(x.k)) { const at = prev === null ? 0 : order.indexOf(prev) + 1; order.splice(at, 0, x.k); }
          prev = x.k;
        }
        const lmap = new Map(L.map(x => [x.k, x.v]));
        out = order.map(k => this.mk(n, k, true, k, lmap.has(k), lmap.get(k), rmap.has(k), rmap.get(k)));
      }
      this.kids.set(n.path, out);
      return out;
    }
    mk(parent, k, isArr, label, hasL, l, hasR, r) {
      const node = { path: parent.path + segment(isArr, k), label, isItem: isArr, hasL, l, hasR, r, depth: parent.depth + 1,
        pk: isArr ? parent.pk : k, parent };
      this.byPath.set(node.path, node);
      return node;
    }
    status(n) {
      if (!this.diff) return "same";
      if (n.hasL && !n.hasR) return "removed";
      if (!n.hasL && n.hasR) return "added";
      if (this.containerKind(n) === "prim") return JSON.stringify(n.l) === JSON.stringify(n.r) ? "same" : "changed";
      return this.count(n) ? "mod" : "same";
    }
    count(n) {
      if (!this.diff) return 0;
      if (this.counts.has(n.path)) return this.counts.get(n.path);
      let c;
      if (!n.hasL || !n.hasR) c = 1;
      else if (this.containerKind(n) === "prim") c = JSON.stringify(n.l) === JSON.stringify(n.r) ? 0 : 1;
      else { c = 0; for (const ch of this.children(n)) c += this.count(ch); }
      this.counts.set(n.path, c);
      return c;
    }
    isContainer(n) { const ck = this.containerKind(n); return ck === "obj" || ck === "arr"; }
    // changed leaves (added/removed/changed) in document order
    changes() {
      const out = [];
      const walk = n => {
        const s = this.status(n);
        if (s === "added" || s === "removed" || s === "changed") { out.push(n.path); return; }
        if (s === "mod" || n === this.root) for (const ch of this.children(n)) walk(ch);
      };
      walk(this.root);
      return out;
    }
    allContainerPaths(onlyChanged) {
      const out = [];
      const walk = n => {
        if (!this.isContainer(n)) return;
        if (onlyChanged && this.diff && n !== this.root && this.count(n) === 0) return;
        out.push(n.path);
        for (const ch of this.children(n)) walk(ch);
      };
      walk(this.root);
      return out;
    }
  }

  // --- rendering -------------------------------------------------------------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  function prim(v) {
    const t = v === null ? "null" : typeof v;
    return el("span", "j-" + t, t === "string" ? JSON.stringify(v) : String(v));
  }
  function summary(v, isItem) {
    const k = kind(v), f = document.createDocumentFragment();
    if (k === "arr") f.append(el("span", "j-sum", "[" + v.length + " item" + (v.length === 1 ? "" : "s") + "]"));
    else if (k === "obj") {
      f.append(el("span", "j-sum", "{" + Object.keys(v).length + " keys}"));
      const hint = v.name || v.licenseId || v.SPDXID || (v.relationshipType ? v.relationshipType : null);
      if (hint && !isItem) f.append(el("span", "j-hint", String(hint)));
    }
    return f;
  }

  class JsonView {
    constructor(container, left, right, opts) {
      opts = opts || {};
      this.diff = right !== undefined;
      this.tree = new Tree(left, right, this.diff);
      this.store = opts.store || new ExpansionStore();
      this.rows = new Map();
      this.c = container;
      this.c.classList.add("jv"); if (this.diff) this.c.classList.add("jv-diff");
      this.store.subscribe(paths => {
        if (paths === null) return this.render();
        for (const p of paths) this.apply(p);
      });
      if (opts.open) for (const p of opts.open) this.store.open.add(p);
      this.render();
    }
    render() {
      this.c.textContent = ""; this.rows.clear();
      const body = el("div", "jv-body");
      this.renderChildren(this.tree.root, body);
      this.c.append(body);
    }
    renderChildren(n, into) {
      const kids = this.tree.children(n);
      const frag = document.createDocumentFragment();
      for (const ch of kids) frag.append(this.renderNode(ch));
      into.append(frag);
    }
    side(n, which) {
      const has = which === "L" ? n.hasL : n.hasR, v = which === "L" ? n.l : n.r;
      const cell = el("div", "jv-cell jv-" + which);
      cell.style.paddingLeft = (n.depth - 1) * 16 + 4 + "px";
      if (!has) { cell.classList.add("jv-gap"); return cell; }
      const t = this.tree, isC = t.isContainer(n);
      if (isC) cell.append(el("span", "jv-tw", this.store.isOpen(n.path) ? "▾" : "▸"));
      else cell.append(el("span", "jv-tw", ""));
      cell.append(el("span", n.isItem ? "j-idx" : "j-key", n.isItem ? n.label : JSON.stringify(n.label)), el("span", "j-colon", ": "));
      if (isC) {
        const open = this.store.isOpen(n.path);
        cell.append(el("span", "j-brace", kind(v) === "arr" ? "[" : "{"));
        if (!open) { cell.append(summary(v, n.isItem)); cell.append(el("span", "j-brace", kind(v) === "arr" ? "]" : "}")); }
      } else cell.append(prim(v));
      return cell;
    }
    renderNode(n) {
      const t = this.tree, wrap = el("div", "jv-node"), row = el("div", "jv-row");
      const st = t.status(n);
      wrap.dataset.path = n.path;
      row.classList.add("st-" + st);
      if (this.diff && st === "same") wrap.classList.add("jv-same");
      row.append(this.side(n, "L"));
      if (this.diff) row.append(this.side(n, "R"));
      const cnt = t.count(n);
      if (this.diff && t.isContainer(n) && cnt && n.hasL && n.hasR) row.append(el("span", "jv-badge", String(cnt)));
      if (t.isContainer(n)) { row.classList.add("jv-click"); row.addEventListener("click", () => this.store.toggle(n.path)); }
      wrap.append(row);
      const kidsEl = el("div", "jv-kids");
      wrap.append(kidsEl);
      this.rows.set(n.path, { wrap, row, kidsEl, n, filled: false });
      if (t.isContainer(n) && this.store.isOpen(n.path)) this.fill(n.path);
      return wrap;
    }
    fill(p) {
      const r = this.rows.get(p); if (!r || r.filled) return;
      r.filled = true; this.renderChildren(r.n, r.kidsEl);
      const end = el("div", "jv-row jv-end");
      const mk = (which, has) => { const c = el("div", "jv-cell jv-" + which); c.style.paddingLeft = (r.n.depth - 1) * 16 + 4 + "px";
        if (has) c.append(el("span", "jv-tw", ""), el("span", "j-brace", kind(which === "L" ? r.n.l : r.n.r) === "arr" ? "]" : "}")); else c.classList.add("jv-gap"); return c; };
      end.append(mk("L", r.n.hasL)); if (this.diff) end.append(mk("R", r.n.hasR));
      r.kidsEl.append(end);
    }
    apply(p) {
      const r = this.rows.get(p); if (!r) return;
      const open = this.store.isOpen(p);
      const fresh = el("div", "jv-row " + [...r.row.classList].filter(c => c !== "jv-row").join(" "));
      fresh.append(this.side(r.n, "L")); if (this.diff) fresh.append(this.side(r.n, "R"));
      for (const b of r.row.querySelectorAll(".jv-badge")) fresh.append(b);
      fresh.addEventListener("click", () => this.store.toggle(p));
      r.row.replaceWith(fresh); r.row = fresh;
      if (open) this.fill(p);
      r.kidsEl.style.display = open ? "" : "none";
    }
    expandAll() { this.store.setMany(this.tree.allContainerPaths(this.onlyChanged), true); }
    collapseAll() { this.store.clear(); }
    setOnlyChanged(v) { this.onlyChanged = v; this.c.classList.toggle("jv-only", v); }
    reveal(p) {
      const anc = []; let n = this.tree.byPath.get(p);
      for (let a = n && n.parent; a && a !== this.tree.root; a = a.parent) anc.push(a.path);
      anc.reverse();
      for (const a of anc) if (!this.store.isOpen(a)) this.store.set(a, true);
      const r = this.rows.get(p); if (!r) return;
      r.row.scrollIntoView({ block: "center" });
      for (const x of this.c.querySelectorAll(".jv-flash")) x.classList.remove("jv-flash");
      r.row.classList.add("jv-flash");
    }
    nextChange(dir) {
      if (!this.changeList) { this.changeList = this.tree.changes(); this.ci = -1; }
      if (!this.changeList.length) return null;
      this.ci = (this.ci + (dir || 1) + this.changeList.length) % this.changeList.length;
      this.reveal(this.changeList[this.ci]);
      return { i: this.ci + 1, n: this.changeList.length };
    }
  }

  global.JsonView = JsonView; global.ExpansionStore = ExpansionStore;
})(window);
