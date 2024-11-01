var g = Object.defineProperty;
var P = (t, e, s) => e in t ? g(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s;
var a = (t, e, s) => P(t, typeof e != "symbol" ? e + "" : e, s);
const o = (t) => /^(\-|\+)?([0-9]+|Infinity)$/.test(t) ? Number(t) : NaN;
class y {
  constructor(e) {
    a(this, "pass", !1);
    a(this, "originCommand", "");
    a(this, "arguments", []);
    a(this, "resolvedValue", {});
    this.originCommand = e;
  }
  setPassed(e) {
    return this.pass = e, this;
  }
}
class m {
  constructor(e, s) {
    a(this, "label");
    a(this, "name");
    a(this, "optional", !0);
    a(this, "next");
    this.label = e == null ? void 0 : e.label, this.name = e == null ? void 0 : e.name, this.optional = (e == null ? void 0 : e.optional) ?? !0, this.next = s;
  }
  // convert self and children to an array
  toArray() {
    const e = [this];
    let s = this;
    if (!s.next) return e;
    for (; s && !(s.next && (e.push(s.next), s = s.next, !s.next)); )
      ;
    return e;
  }
}
class A extends m {
  constructor(e, s) {
    super({ label: e }, s);
  }
  check(e) {
    return e === this.label;
  }
  value(e) {
    return e;
  }
}
class S extends m {
  constructor(s, r) {
    super(s, r);
    a(this, "min");
    a(this, "max");
    this.min = s == null ? void 0 : s.min, this.max = s == null ? void 0 : s.max;
  }
  check(s) {
    const r = o(s);
    return !(!Number.isInteger(r) || this.min && r < this.min || this.max && r > this.max);
  }
  value(s) {
    return parseInt(s);
  }
}
class k extends m {
  constructor(e, s) {
    super(e, s);
  }
  check() {
    return !0;
  }
  value(e) {
    return e;
  }
}
class I extends m {
  constructor(e, s) {
    super(e, s);
  }
  check(e) {
    return e === "true" || e === "false";
  }
  value(e) {
    return e === "true";
  }
}
class b {
  constructor(e) {
    a(this, "schemas");
    a(this, "commandPrefix");
    this.schemas = {}, this.commandPrefix = e == null ? void 0 : e.commandPrefix;
  }
  _add(e, s) {
    const r = s.toArray();
    let n = !1;
    for (let c = 0; c < r.length; c++)
      if (r[c].optional) {
        if (n)
          throw new Error(
            "Optional schemas must place at tail of schema chain."
          );
        continue;
      } else
        n = !0;
    Array.isArray(this.schemas[e]) ? this.schemas[e].push(s) : this.schemas[e] = [s];
  }
  add(e, s) {
    if ((!s || s.length === 0) && !this.schemas[e]) {
      this.schemas[e] = [];
      return;
    }
    if (!Array.isArray(s))
      throw new Error("Argument `schemas` is not a array");
    s.forEach((r) => {
      this._add(e, r);
    });
  }
  remove(e) {
    this.schemas[e] && delete this.schemas[e];
  }
  clear() {
    this.schemas = {};
  }
  parse(e) {
    const s = new y(e);
    let r = e.trim();
    if (this.commandPrefix) {
      if (!r.startsWith(this.commandPrefix))
        return s.setPassed(!1);
      r = r.slice(this.commandPrefix.length);
    }
    const n = r.split(" "), c = this.schemas[n[0]];
    if (!c)
      return s.setPassed(!1);
    if (c.length === 0)
      return n.length > 1 ? s.setPassed(!1) : s.setPassed(!0);
    if (c.length > 0 && n.length < 2)
      return s.setPassed(!1);
    n.shift();
    let i = 0;
    for (; i < c.length; i++) {
      const f = c[i].toArray(), l = [], d = {};
      let u = 0;
      for (; u < n.length; u++) {
        const h = f[u];
        if (!h) break;
        const x = h.check(n[u]);
        l.push(x), x && h.name && (d[h.name] = h.value(
          n[u]
        ));
      }
      if (l.length === n.length && l.length === f.length && l.every((h) => h))
        return s.arguments = n, s.resolvedValue = d, s.setPassed(!0);
    }
    return s.setPassed(!1);
  }
  test(e) {
    return this.parse(e).pass;
  }
  execute(e, s) {
    s.apply(null, Object.values(this.parse(e).resolvedValue));
  }
}
export {
  I as BoolSchema,
  b as Commander,
  S as IntegerSchema,
  k as StringSchema,
  A as Subcommand
};
