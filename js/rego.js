// Tiny rego highlighter: returns a DocumentFragment.
(function (g) {
  const KW = new Set(["package", "import", "if", "contains", "some", "every", "in", "not", "default", "else", "with", "as", "rego.v1"]);
  const RE = /(#[^\n]*)|("(?:\\.|[^"\\])*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|(:=|==|!=|>=|<=|=|>|<)|([A-Za-z_][\w.]*)(\s*\()?|(\s+|.)/g;
  g.highlightRego = function (text) {
    const f = document.createDocumentFragment(); let m;
    const span = (c, t) => { const s = document.createElement("span"); s.className = c; s.textContent = t; f.append(s); };
    RE.lastIndex = 0;
    while ((m = RE.exec(text))) {
      if (m[1]) span(/^# (METADATA|title:|description:|custom:|  short_name:|  severity:|  failure_msg:|  level:)/.test(m[1]) ? "rg-meta" : "rg-com", m[1]);
      else if (m[2]) span("rg-str", m[2]);
      else if (m[3]) span("rg-num", m[3]);
      else if (m[4]) span("rg-op", m[4]);
      else if (m[5]) { span(KW.has(m[5]) ? "rg-kw" : m[6] ? "rg-fn" : (m[5] === "deny" || m[5] === "prerequisite" ? "rg-rule" : "rg-id"), m[5]); if (m[6]) f.append(m[6]); }
      else f.append(m[7]);
    }
    return f;
  };
})(window);
