var o = Object.defineProperty;
var f = (s, e, t) => e in s ? o(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var n = (s, e, t) => f(s, typeof e != "symbol" ? e + "" : e, t);
class m {
  constructor(e, t) {
    n(this, "option");
    n(this, "nextSchema");
    this.option = e || null, this.nextSchema = t || null;
  }
  // convert self and children to an array
  toArray() {
    const e = [this];
    let t = this;
    if (t.nextSchema === null) return e;
    for (; t && !(t.nextSchema && (e.push(t.nextSchema), t = t.nextSchema, !t.nextSchema)); )
      ;
    return e;
  }
}
class x extends m {
  constructor(e, t) {
    super({ label: e }, t);
  }
  check(e) {
    return e === this.option.label;
  }
}
class g extends m {
  constructor(e, t) {
    super(e, t);
  }
  check(e) {
    return Number.isInteger(parseInt(e));
  }
}
class S extends m {
  constructor(e, t) {
    super(e, t);
  }
  check() {
    return !0;
  }
}
class p extends m {
  constructor(e, t) {
    super(e, t);
  }
  check(e) {
    return ["true", "false"].findIndex((t) => t === e) > -1;
  }
}
class k {
  constructor(e) {
    n(this, "schemas");
    n(this, "binds");
    n(this, "commandPrefix");
    this.schemas = {}, this.binds = {}, this.commandPrefix = e == null ? void 0 : e.commandPrefix;
  }
  add(e, t, r) {
    this.schemas[e] = t || [], r && (this.binds[e] = r);
  }
  remove(e) {
    this.schemas[e] && delete this.schemas[e];
  }
  clear() {
    this.schemas = {};
  }
  execute(e) {
    let t = e.trim();
    if (this.commandPrefix) {
      if (!t.startsWith(this.commandPrefix)) return !1;
      t = t.slice(this.commandPrefix.length);
    }
    const r = t.split(" "), h = this.schemas[r[0]];
    if (!h)
      return !1;
    if (h.length === 0)
      return !(r.length > 1);
    if (h.length > 0 && r.length < 2)
      return !1;
    r.shift();
    let i = 0, c;
    for (; i < h.length; i++) {
      const u = h[i].toArray(), a = [];
      for (c = 0; c < r.length && u[c]; c++)
        a.push(
          u[c].check(r[c])
        );
      if (a.length === r.length && a.length === u.length && a.every((l) => l))
        return !0;
    }
    return !1;
  }
}
export {
  p as BoolSchema,
  k as Commander,
  g as IntegerSchema,
  S as StringSchema,
  x as Subcommand
};
