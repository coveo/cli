/**
 * @license
 *
 * Copyright 2023 Coveo Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function (global, factory) {
  const isCommonjs =
    typeof exports === 'object' && typeof module !== 'undefined';

  if (isCommonjs) {
    return factory(exports);
  }

  const isAmd = typeof define === 'function' && define.amd;

  if (isAmd) {
    return define(['exports'], factory);
  }

  global = typeof globalThis !== 'undefined' ? globalThis : global || self;
  factory((global.CoveoHeadless = {}));
})(this, function (exports) {
  'use strict';
  var QC = Object.create;
  var ji = Object.defineProperty;
  var LC = Object.getOwnPropertyDescriptor;
  var jC = Object.getOwnPropertyNames;
  var UC = Object.getPrototypeOf,
    BC = Object.prototype.hasOwnProperty;
  var Np = (e) => ji(e, '__esModule', {value: !0});
  var fe = (e, t) => () => (t || e((t = {exports: {}}).exports, t), t.exports),
    Ui = (e, t) => {
      Np(e);
      for (var r in t) ji(e, r, {get: t[r], enumerable: !0});
    },
    R = (e, t, r) => {
      if ((t && typeof t == 'object') || typeof t == 'function')
        for (let a of jC(t))
          !BC.call(e, a) &&
            a !== 'default' &&
            ji(e, a, {
              get: () => t[a],
              enumerable: !(r = LC(t, a)) || r.enumerable,
            });
      return e;
    },
    be = (e) =>
      R(
        Np(
          ji(
            e != null ? QC(UC(e)) : {},
            'default',
            e && e.__esModule && 'default' in e
              ? {get: () => e.default, enumerable: !0}
              : {value: e, enumerable: !0}
          )
        ),
        e
      );
  var Gp = fe((Yk, zo) => {
    function XC(e, t, r) {
      return (
        t in e
          ? Object.defineProperty(e, t, {
              value: r,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = r),
        e
      );
    }
    (zo.exports = XC),
      (zo.exports.__esModule = !0),
      (zo.exports.default = zo.exports);
  });
  var Xp = fe((Kk, Wo) => {
    var ZC = Gp();
    function Jp(e, t) {
      var r = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var a = Object.getOwnPropertySymbols(e);
        t &&
          (a = a.filter(function (n) {
            return Object.getOwnPropertyDescriptor(e, n).enumerable;
          })),
          r.push.apply(r, a);
      }
      return r;
    }
    function ex(e) {
      for (var t = 1; t < arguments.length; t++) {
        var r = arguments[t] != null ? arguments[t] : {};
        t % 2
          ? Jp(Object(r), !0).forEach(function (a) {
              ZC(e, a, r[a]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
          : Jp(Object(r)).forEach(function (a) {
              Object.defineProperty(
                e,
                a,
                Object.getOwnPropertyDescriptor(r, a)
              );
            });
      }
      return e;
    }
    (Wo.exports = ex),
      (Wo.exports.__esModule = !0),
      (Wo.exports.default = Wo.exports);
  });
  var Ko = fe((fr) => {
    'use strict';
    Object.defineProperty(fr, '__esModule', {value: !0});
    var tx = Xp();
    function rx(e) {
      return e && typeof e == 'object' && 'default' in e ? e : {default: e};
    }
    var Zp = rx(tx);
    function Te(e) {
      return (
        'Minified Redux error #' +
        e +
        '; visit https://redux.js.org/Errors?code=' +
        e +
        ' for the full message or use the non-minified dev environment for full errors. '
      );
    }
    var ef = (function () {
        return (
          (typeof Symbol == 'function' && Symbol.observable) || '@@observable'
        );
      })(),
      kl = function () {
        return Math.random().toString(36).substring(7).split('').join('.');
      },
      Yo = {
        INIT: '@@redux/INIT' + kl(),
        REPLACE: '@@redux/REPLACE' + kl(),
        PROBE_UNKNOWN_ACTION: function () {
          return '@@redux/PROBE_UNKNOWN_ACTION' + kl();
        },
      };
    function ax(e) {
      if (typeof e != 'object' || e === null) return !1;
      for (var t = e; Object.getPrototypeOf(t) !== null; )
        t = Object.getPrototypeOf(t);
      return Object.getPrototypeOf(e) === t;
    }
    function Ol(e, t, r) {
      var a;
      if (
        (typeof t == 'function' && typeof r == 'function') ||
        (typeof r == 'function' && typeof arguments[3] == 'function')
      )
        throw new Error(Te(0));
      if (
        (typeof t == 'function' &&
          typeof r == 'undefined' &&
          ((r = t), (t = void 0)),
        typeof r != 'undefined')
      ) {
        if (typeof r != 'function') throw new Error(Te(1));
        return r(Ol)(e, t);
      }
      if (typeof e != 'function') throw new Error(Te(2));
      var n = e,
        o = t,
        i = [],
        s = i,
        u = !1;
      function c() {
        s === i && (s = i.slice());
      }
      function l() {
        if (u) throw new Error(Te(3));
        return o;
      }
      function p(h) {
        if (typeof h != 'function') throw new Error(Te(4));
        if (u) throw new Error(Te(5));
        var v = !0;
        return (
          c(),
          s.push(h),
          function () {
            if (!!v) {
              if (u) throw new Error(Te(6));
              (v = !1), c();
              var x = s.indexOf(h);
              s.splice(x, 1), (i = null);
            }
          }
        );
      }
      function f(h) {
        if (!ax(h)) throw new Error(Te(7));
        if (typeof h.type == 'undefined') throw new Error(Te(8));
        if (u) throw new Error(Te(9));
        try {
          (u = !0), (o = n(o, h));
        } finally {
          u = !1;
        }
        for (var v = (i = s), C = 0; C < v.length; C++) {
          var x = v[C];
          x();
        }
        return h;
      }
      function d(h) {
        if (typeof h != 'function') throw new Error(Te(10));
        (n = h), f({type: Yo.REPLACE});
      }
      function m() {
        var h,
          v = p;
        return (
          (h = {
            subscribe: function (x) {
              if (typeof x != 'object' || x === null) throw new Error(Te(11));
              function b() {
                x.next && x.next(l());
              }
              b();
              var P = v(b);
              return {unsubscribe: P};
            },
          }),
          (h[ef] = function () {
            return this;
          }),
          h
        );
      }
      return (
        f({type: Yo.INIT}),
        (a = {dispatch: f, subscribe: p, getState: l, replaceReducer: d}),
        (a[ef] = m),
        a
      );
    }
    var nx = Ol;
    function ox(e) {
      Object.keys(e).forEach(function (t) {
        var r = e[t],
          a = r(void 0, {type: Yo.INIT});
        if (typeof a == 'undefined') throw new Error(Te(12));
        if (typeof r(void 0, {type: Yo.PROBE_UNKNOWN_ACTION()}) == 'undefined')
          throw new Error(Te(13));
      });
    }
    function ix(e) {
      for (var t = Object.keys(e), r = {}, a = 0; a < t.length; a++) {
        var n = t[a];
        typeof e[n] == 'function' && (r[n] = e[n]);
      }
      var o = Object.keys(r),
        i,
        s;
      try {
        ox(r);
      } catch (u) {
        s = u;
      }
      return function (c, l) {
        if ((c === void 0 && (c = {}), s)) throw s;
        if (!1) var p;
        for (var f = !1, d = {}, m = 0; m < o.length; m++) {
          var h = o[m],
            v = r[h],
            C = c[h],
            x = v(C, l);
          if (typeof x == 'undefined') {
            var b = l && l.type;
            throw new Error(Te(14));
          }
          (d[h] = x), (f = f || x !== C);
        }
        return (f = f || o.length !== Object.keys(c).length), f ? d : c;
      };
    }
    function tf(e, t) {
      return function () {
        return t(e.apply(this, arguments));
      };
    }
    function sx(e, t) {
      if (typeof e == 'function') return tf(e, t);
      if (typeof e != 'object' || e === null) throw new Error(Te(16));
      var r = {};
      for (var a in e) {
        var n = e[a];
        typeof n == 'function' && (r[a] = tf(n, t));
      }
      return r;
    }
    function rf() {
      for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
        t[r] = arguments[r];
      return t.length === 0
        ? function (a) {
            return a;
          }
        : t.length === 1
        ? t[0]
        : t.reduce(function (a, n) {
            return function () {
              return a(n.apply(void 0, arguments));
            };
          });
    }
    function cx() {
      for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
        t[r] = arguments[r];
      return function (a) {
        return function () {
          var n = a.apply(void 0, arguments),
            o = function () {
              throw new Error(Te(15));
            },
            i = {
              getState: n.getState,
              dispatch: function () {
                return o.apply(void 0, arguments);
              },
            },
            s = t.map(function (u) {
              return u(i);
            });
          return (
            (o = rf.apply(void 0, s)(n.dispatch)),
            Zp.default(Zp.default({}, n), {}, {dispatch: o})
          );
        };
      };
    }
    fr.__DO_NOT_USE__ActionTypes = Yo;
    fr.applyMiddleware = cx;
    fr.bindActionCreators = sx;
    fr.combineReducers = ix;
    fr.compose = rf;
    fr.createStore = Ol;
    fr.legacy_createStore = nx;
  });
  var Uf = fe((pO, jf) => {
    'use strict';
    function nR(e) {
      try {
        return JSON.stringify(e);
      } catch {
        return '"[Circular]"';
      }
    }
    jf.exports = oR;
    function oR(e, t, r) {
      var a = (r && r.stringify) || nR,
        n = 1;
      if (typeof e == 'object' && e !== null) {
        var o = t.length + n;
        if (o === 1) return e;
        var i = new Array(o);
        i[0] = a(e);
        for (var s = 1; s < o; s++) i[s] = a(t[s]);
        return i.join(' ');
      }
      if (typeof e != 'string') return e;
      var u = t.length;
      if (u === 0) return e;
      for (
        var c = '', l = 1 - n, p = -1, f = (e && e.length) || 0, d = 0;
        d < f;

      ) {
        if (e.charCodeAt(d) === 37 && d + 1 < f) {
          switch (((p = p > -1 ? p : 0), e.charCodeAt(d + 1))) {
            case 100:
            case 102:
              if (l >= u || t[l] == null) break;
              p < d && (c += e.slice(p, d)),
                (c += Number(t[l])),
                (p = d + 2),
                d++;
              break;
            case 105:
              if (l >= u || t[l] == null) break;
              p < d && (c += e.slice(p, d)),
                (c += Math.floor(Number(t[l]))),
                (p = d + 2),
                d++;
              break;
            case 79:
            case 111:
            case 106:
              if (l >= u || t[l] === void 0) break;
              p < d && (c += e.slice(p, d));
              var m = typeof t[l];
              if (m === 'string') {
                (c += "'" + t[l] + "'"), (p = d + 2), d++;
                break;
              }
              if (m === 'function') {
                (c += t[l].name || '<anonymous>'), (p = d + 2), d++;
                break;
              }
              (c += a(t[l])), (p = d + 2), d++;
              break;
            case 115:
              if (l >= u) break;
              p < d && (c += e.slice(p, d)),
                (c += String(t[l])),
                (p = d + 2),
                d++;
              break;
            case 37:
              p < d && (c += e.slice(p, d)), (c += '%'), (p = d + 2), d++, l--;
              break;
          }
          ++l;
        }
        ++d;
      }
      return p === -1 ? e : (p < f && (c += e.slice(p)), c);
    }
  });
  var ii = fe((fO, Hf) => {
    'use strict';
    var Bf = Uf();
    Hf.exports = Dt;
    var ni = gR().console || {},
      iR = {
        mapHttpRequest: es,
        mapHttpResponse: es,
        wrapRequestSerializer: zl,
        wrapResponseSerializer: zl,
        wrapErrorSerializer: zl,
        req: es,
        res: es,
        err: dR,
      };
    function sR(e, t) {
      return Array.isArray(e)
        ? e.filter(function (a) {
            return a !== '!stdSerializers.err';
          })
        : e === !0
        ? Object.keys(t)
        : !1;
    }
    function Dt(e) {
      (e = e || {}), (e.browser = e.browser || {});
      let t = e.browser.transmit;
      if (t && typeof t.send != 'function')
        throw Error('pino: transmit option must have a send function');
      let r = e.browser.write || ni;
      e.browser.write && (e.browser.asObject = !0);
      let a = e.serializers || {},
        n = sR(e.browser.serialize, a),
        o = e.browser.serialize;
      Array.isArray(e.browser.serialize) &&
        e.browser.serialize.indexOf('!stdSerializers.err') > -1 &&
        (o = !1);
      let i = ['error', 'fatal', 'warn', 'info', 'debug', 'trace'];
      typeof r == 'function' &&
        (r.error = r.fatal = r.warn = r.info = r.debug = r.trace = r),
        e.enabled === !1 && (e.level = 'silent');
      let s = e.level || 'info',
        u = Object.create(r);
      u.log || (u.log = oi),
        Object.defineProperty(u, 'levelVal', {get: l}),
        Object.defineProperty(u, 'level', {get: p, set: f});
      let c = {
        transmit: t,
        serialize: n,
        asObject: e.browser.asObject,
        levels: i,
        timestamp: pR(e),
      };
      (u.levels = Dt.levels),
        (u.level = s),
        (u.setMaxListeners =
          u.getMaxListeners =
          u.emit =
          u.addListener =
          u.on =
          u.prependListener =
          u.once =
          u.prependOnceListener =
          u.removeListener =
          u.removeAllListeners =
          u.listeners =
          u.listenerCount =
          u.eventNames =
          u.write =
          u.flush =
            oi),
        (u.serializers = a),
        (u._serialize = n),
        (u._stdErrSerialize = o),
        (u.child = d),
        t && (u._logEvent = Hl());
      function l() {
        return this.level === 'silent' ? 1 / 0 : this.levels.values[this.level];
      }
      function p() {
        return this._level;
      }
      function f(m) {
        if (m !== 'silent' && !this.levels.values[m])
          throw Error('unknown level ' + m);
        (this._level = m),
          za(c, u, 'error', 'log'),
          za(c, u, 'fatal', 'error'),
          za(c, u, 'warn', 'error'),
          za(c, u, 'info', 'log'),
          za(c, u, 'debug', 'log'),
          za(c, u, 'trace', 'log');
      }
      function d(m, h) {
        if (!m) throw new Error('missing bindings for child Pino');
        (h = h || {}), n && m.serializers && (h.serializers = m.serializers);
        let v = h.serializers;
        if (n && v) {
          var C = Object.assign({}, a, v),
            x = e.browser.serialize === !0 ? Object.keys(C) : n;
          delete m.serializers, Zi([m], x, C, this._stdErrSerialize);
        }
        function b(P) {
          (this._childLevel = (P._childLevel | 0) + 1),
            (this.error = Wa(P, m, 'error')),
            (this.fatal = Wa(P, m, 'fatal')),
            (this.warn = Wa(P, m, 'warn')),
            (this.info = Wa(P, m, 'info')),
            (this.debug = Wa(P, m, 'debug')),
            (this.trace = Wa(P, m, 'trace')),
            C && ((this.serializers = C), (this._serialize = x)),
            t && (this._logEvent = Hl([].concat(P._logEvent.bindings, m)));
        }
        return (b.prototype = this), new b(this);
      }
      return u;
    }
    Dt.levels = {
      values: {fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10},
      labels: {
        10: 'trace',
        20: 'debug',
        30: 'info',
        40: 'warn',
        50: 'error',
        60: 'fatal',
      },
    };
    Dt.stdSerializers = iR;
    Dt.stdTimeFunctions = Object.assign(
      {},
      {nullTime: _f, epochTime: $f, unixTime: fR, isoTime: mR}
    );
    function za(e, t, r, a) {
      let n = Object.getPrototypeOf(t);
      (t[r] =
        t.levelVal > t.levels.values[r]
          ? oi
          : n[r]
          ? n[r]
          : ni[r] || ni[a] || oi),
        cR(e, t, r);
    }
    function cR(e, t, r) {
      (!e.transmit && t[r] === oi) ||
        (t[r] = (function (a) {
          return function () {
            let o = e.timestamp(),
              i = new Array(arguments.length),
              s =
                Object.getPrototypeOf && Object.getPrototypeOf(this) === ni
                  ? ni
                  : this;
            for (var u = 0; u < i.length; u++) i[u] = arguments[u];
            if (
              (e.serialize &&
                !e.asObject &&
                Zi(i, this._serialize, this.serializers, this._stdErrSerialize),
              e.asObject ? a.call(s, uR(this, r, i, o)) : a.apply(s, i),
              e.transmit)
            ) {
              let c = e.transmit.level || t.level,
                l = Dt.levels.values[c],
                p = Dt.levels.values[r];
              if (p < l) return;
              lR(
                this,
                {
                  ts: o,
                  methodLevel: r,
                  methodValue: p,
                  transmitLevel: c,
                  transmitValue: Dt.levels.values[e.transmit.level || t.level],
                  send: e.transmit.send,
                  val: t.levelVal,
                },
                i
              );
            }
          };
        })(t[r]));
    }
    function uR(e, t, r, a) {
      e._serialize && Zi(r, e._serialize, e.serializers, e._stdErrSerialize);
      let n = r.slice(),
        o = n[0],
        i = {};
      a && (i.time = a), (i.level = Dt.levels.values[t]);
      let s = (e._childLevel | 0) + 1;
      if ((s < 1 && (s = 1), o !== null && typeof o == 'object')) {
        for (; s-- && typeof n[0] == 'object'; ) Object.assign(i, n.shift());
        o = n.length ? Bf(n.shift(), n) : void 0;
      } else typeof o == 'string' && (o = Bf(n.shift(), n));
      return o !== void 0 && (i.msg = o), i;
    }
    function Zi(e, t, r, a) {
      for (let n in e)
        if (a && e[n] instanceof Error) e[n] = Dt.stdSerializers.err(e[n]);
        else if (typeof e[n] == 'object' && !Array.isArray(e[n]))
          for (let o in e[n])
            t && t.indexOf(o) > -1 && o in r && (e[n][o] = r[o](e[n][o]));
    }
    function Wa(e, t, r) {
      return function () {
        let a = new Array(1 + arguments.length);
        a[0] = t;
        for (var n = 1; n < a.length; n++) a[n] = arguments[n - 1];
        return e[r].apply(this, a);
      };
    }
    function lR(e, t, r) {
      let a = t.send,
        n = t.ts,
        o = t.methodLevel,
        i = t.methodValue,
        s = t.val,
        u = e._logEvent.bindings;
      Zi(
        r,
        e._serialize || Object.keys(e.serializers),
        e.serializers,
        e._stdErrSerialize === void 0 ? !0 : e._stdErrSerialize
      ),
        (e._logEvent.ts = n),
        (e._logEvent.messages = r.filter(function (c) {
          return u.indexOf(c) === -1;
        })),
        (e._logEvent.level.label = o),
        (e._logEvent.level.value = i),
        a(o, e._logEvent, s),
        (e._logEvent = Hl(u));
    }
    function Hl(e) {
      return {
        ts: 0,
        messages: [],
        bindings: e || [],
        level: {label: '', value: 0},
      };
    }
    function dR(e) {
      let t = {type: e.constructor.name, msg: e.message, stack: e.stack};
      for (let r in e) t[r] === void 0 && (t[r] = e[r]);
      return t;
    }
    function pR(e) {
      return typeof e.timestamp == 'function'
        ? e.timestamp
        : e.timestamp === !1
        ? _f
        : $f;
    }
    function es() {
      return {};
    }
    function zl(e) {
      return e;
    }
    function oi() {}
    function _f() {
      return !1;
    }
    function $f() {
      return Date.now();
    }
    function fR() {
      return Math.round(Date.now() / 1e3);
    }
    function mR() {
      return new Date(Date.now()).toISOString();
    }
    function gR() {
      function e(t) {
        return typeof t != 'undefined' && t;
      }
      try {
        return (
          typeof globalThis != 'undefined' ||
            Object.defineProperty(Object.prototype, 'globalThis', {
              get: function () {
                return (
                  delete Object.prototype.globalThis, (this.globalThis = this)
                );
              },
              configurable: !0,
            }),
          globalThis
        );
      } catch {
        return e(self) || e(window) || e(this) || {};
      }
    }
  });
  var Kf = fe((mO, Yf) => {
    var hR = '[object Object]';
    function SR(e) {
      var t = !1;
      if (e != null && typeof e.toString != 'function')
        try {
          t = !!(e + '');
        } catch {}
      return t;
    }
    function yR(e, t) {
      return function (r) {
        return e(t(r));
      };
    }
    var vR = Function.prototype,
      zf = Object.prototype,
      Wf = vR.toString,
      CR = zf.hasOwnProperty,
      xR = Wf.call(Object),
      RR = zf.toString,
      bR = yR(Object.getPrototypeOf, Object);
    function FR(e) {
      return !!e && typeof e == 'object';
    }
    function AR(e) {
      if (!FR(e) || RR.call(e) != hR || SR(e)) return !1;
      var t = bR(e);
      if (t === null) return !0;
      var r = CR.call(t, 'constructor') && t.constructor;
      return typeof r == 'function' && r instanceof r && Wf.call(r) == xR;
    }
    Yf.exports = AR;
  });
  var Gf = fe((Yl) => {
    'use strict';
    Object.defineProperty(Yl, '__esModule', {value: !0});
    Yl.default = OR;
    var PR = Ko(),
      IR = Kf(),
      ER = wR(IR);
    function wR(e) {
      return e && e.__esModule ? e : {default: e};
    }
    function kR(e) {
      if (Array.isArray(e)) {
        for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
        return r;
      } else return Array.from(e);
    }
    var Wl = function (t) {
      return typeof t == 'function';
    };
    function OR() {
      var e =
        arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      return function () {
        var r =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        function a() {
          var o = [],
            i = [],
            s = {
              getState: function () {
                return Wl(r) ? r(o) : r;
              },
              getActions: function () {
                return o;
              },
              dispatch: function (c) {
                if (!(0, ER.default)(c))
                  throw new Error(
                    'Actions must be plain objects. Use custom middleware for async actions.'
                  );
                if (typeof c.type == 'undefined')
                  throw new Error(
                    'Actions may not have an undefined "type" property. Have you misspelled a constant? Action: ' +
                      JSON.stringify(c)
                  );
                o.push(c);
                for (var l = 0; l < i.length; l++) i[l]();
                return c;
              },
              clearActions: function () {
                o = [];
              },
              subscribe: function (c) {
                return (
                  Wl(c) && i.push(c),
                  function () {
                    var l = i.indexOf(c);
                    l < 0 || i.splice(l, 1);
                  }
                );
              },
              replaceReducer: function (c) {
                if (!Wl(c))
                  throw new Error('Expected the nextReducer to be a function.');
              },
            };
          return s;
        }
        var n = PR.applyMiddleware.apply(void 0, kR(e))(a);
        return n();
      };
    }
  });
  var Lm = fe((GO, Qm) => {
    Qm.exports = fetch;
  });
  var jm = fe((pi) => {
    'use strict';
    var cs =
      (pi && pi.__assign) ||
      function () {
        return (
          (cs =
            Object.assign ||
            function (e) {
              for (var t, r = 1, a = arguments.length; r < a; r++) {
                t = arguments[r];
                for (var n in t)
                  Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
              }
              return e;
            }),
          cs.apply(this, arguments)
        );
      };
    Object.defineProperty(pi, '__esModule', {value: !0});
    var sF = {
      delayFirstAttempt: !1,
      jitter: 'none',
      maxDelay: 1 / 0,
      numOfAttempts: 10,
      retry: function () {
        return !0;
      },
      startingDelay: 100,
      timeMultiple: 2,
    };
    function cF(e) {
      var t = cs(cs({}, sF), e);
      return t.numOfAttempts < 1 && (t.numOfAttempts = 1), t;
    }
    pi.getSanitizedOptions = cF;
  });
  var Um = fe((dd) => {
    'use strict';
    Object.defineProperty(dd, '__esModule', {value: !0});
    function uF(e) {
      var t = Math.random() * e;
      return Math.round(t);
    }
    dd.fullJitter = uF;
  });
  var Bm = fe((pd) => {
    'use strict';
    Object.defineProperty(pd, '__esModule', {value: !0});
    function lF(e) {
      return e;
    }
    pd.noJitter = lF;
  });
  var _m = fe((fd) => {
    'use strict';
    Object.defineProperty(fd, '__esModule', {value: !0});
    var dF = Um(),
      pF = Bm();
    function fF(e) {
      switch (e.jitter) {
        case 'full':
          return dF.fullJitter;
        case 'none':
        default:
          return pF.noJitter;
      }
    }
    fd.JitterFactory = fF;
  });
  var gd = fe((md) => {
    'use strict';
    Object.defineProperty(md, '__esModule', {value: !0});
    var mF = _m(),
      gF = (function () {
        function e(t) {
          (this.options = t), (this.attempt = 0);
        }
        return (
          (e.prototype.apply = function () {
            var t = this;
            return new Promise(function (r) {
              return setTimeout(r, t.jitteredDelay);
            });
          }),
          (e.prototype.setAttemptNumber = function (t) {
            this.attempt = t;
          }),
          Object.defineProperty(e.prototype, 'jitteredDelay', {
            get: function () {
              var t = mF.JitterFactory(this.options);
              return t(this.delay);
            },
            enumerable: !0,
            configurable: !0,
          }),
          Object.defineProperty(e.prototype, 'delay', {
            get: function () {
              var t = this.options.startingDelay,
                r = this.options.timeMultiple,
                a = this.numOfDelayedAttempts,
                n = t * Math.pow(r, a);
              return Math.min(n, this.options.maxDelay);
            },
            enumerable: !0,
            configurable: !0,
          }),
          Object.defineProperty(e.prototype, 'numOfDelayedAttempts', {
            get: function () {
              return this.attempt;
            },
            enumerable: !0,
            configurable: !0,
          }),
          e
        );
      })();
    md.Delay = gF;
  });
  var $m = fe((hr) => {
    'use strict';
    var hF =
        (hr && hr.__extends) ||
        (function () {
          var e = function (t, r) {
            return (
              (e =
                Object.setPrototypeOf ||
                ({__proto__: []} instanceof Array &&
                  function (a, n) {
                    a.__proto__ = n;
                  }) ||
                function (a, n) {
                  for (var o in n) n.hasOwnProperty(o) && (a[o] = n[o]);
                }),
              e(t, r)
            );
          };
          return function (t, r) {
            e(t, r);
            function a() {
              this.constructor = t;
            }
            t.prototype =
              r === null
                ? Object.create(r)
                : ((a.prototype = r.prototype), new a());
          };
        })(),
      SF =
        (hr && hr.__awaiter) ||
        function (e, t, r, a) {
          function n(o) {
            return o instanceof r
              ? o
              : new r(function (i) {
                  i(o);
                });
          }
          return new (r || (r = Promise))(function (o, i) {
            function s(l) {
              try {
                c(a.next(l));
              } catch (p) {
                i(p);
              }
            }
            function u(l) {
              try {
                c(a.throw(l));
              } catch (p) {
                i(p);
              }
            }
            function c(l) {
              l.done ? o(l.value) : n(l.value).then(s, u);
            }
            c((a = a.apply(e, t || [])).next());
          });
        },
      yF =
        (hr && hr.__generator) ||
        function (e, t) {
          var r = {
              label: 0,
              sent: function () {
                if (o[0] & 1) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            },
            a,
            n,
            o,
            i;
          return (
            (i = {next: s(0), throw: s(1), return: s(2)}),
            typeof Symbol == 'function' &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function s(c) {
            return function (l) {
              return u([c, l]);
            };
          }
          function u(c) {
            if (a) throw new TypeError('Generator is already executing.');
            for (; r; )
              try {
                if (
                  ((a = 1),
                  n &&
                    (o =
                      c[0] & 2
                        ? n.return
                        : c[0]
                        ? n.throw || ((o = n.return) && o.call(n), 0)
                        : n.next) &&
                    !(o = o.call(n, c[1])).done)
                )
                  return o;
                switch (((n = 0), o && (c = [c[0] & 2, o.value]), c[0])) {
                  case 0:
                  case 1:
                    o = c;
                    break;
                  case 4:
                    return r.label++, {value: c[1], done: !1};
                  case 5:
                    r.label++, (n = c[1]), (c = [0]);
                    continue;
                  case 7:
                    (c = r.ops.pop()), r.trys.pop();
                    continue;
                  default:
                    if (
                      ((o = r.trys),
                      !(o = o.length > 0 && o[o.length - 1]) &&
                        (c[0] === 6 || c[0] === 2))
                    ) {
                      r = 0;
                      continue;
                    }
                    if (c[0] === 3 && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                      r.label = c[1];
                      break;
                    }
                    if (c[0] === 6 && r.label < o[1]) {
                      (r.label = o[1]), (o = c);
                      break;
                    }
                    if (o && r.label < o[2]) {
                      (r.label = o[2]), r.ops.push(c);
                      break;
                    }
                    o[2] && r.ops.pop(), r.trys.pop();
                    continue;
                }
                c = t.call(e, r);
              } catch (l) {
                (c = [6, l]), (n = 0);
              } finally {
                a = o = 0;
              }
            if (c[0] & 5) throw c[1];
            return {value: c[0] ? c[1] : void 0, done: !0};
          }
        };
    Object.defineProperty(hr, '__esModule', {value: !0});
    var vF = gd(),
      CF = (function (e) {
        hF(t, e);
        function t() {
          return (e !== null && e.apply(this, arguments)) || this;
        }
        return (
          (t.prototype.apply = function () {
            return SF(this, void 0, void 0, function () {
              return yF(this, function (r) {
                return [
                  2,
                  this.isFirstAttempt ? !0 : e.prototype.apply.call(this),
                ];
              });
            });
          }),
          Object.defineProperty(t.prototype, 'isFirstAttempt', {
            get: function () {
              return this.attempt === 0;
            },
            enumerable: !0,
            configurable: !0,
          }),
          Object.defineProperty(t.prototype, 'numOfDelayedAttempts', {
            get: function () {
              return this.attempt - 1;
            },
            enumerable: !0,
            configurable: !0,
          }),
          t
        );
      })(vF.Delay);
    hr.SkipFirstDelay = CF;
  });
  var Hm = fe((fi) => {
    'use strict';
    var xF =
      (fi && fi.__extends) ||
      (function () {
        var e = function (t, r) {
          return (
            (e =
              Object.setPrototypeOf ||
              ({__proto__: []} instanceof Array &&
                function (a, n) {
                  a.__proto__ = n;
                }) ||
              function (a, n) {
                for (var o in n) n.hasOwnProperty(o) && (a[o] = n[o]);
              }),
            e(t, r)
          );
        };
        return function (t, r) {
          e(t, r);
          function a() {
            this.constructor = t;
          }
          t.prototype =
            r === null
              ? Object.create(r)
              : ((a.prototype = r.prototype), new a());
        };
      })();
    Object.defineProperty(fi, '__esModule', {value: !0});
    var RF = gd(),
      bF = (function (e) {
        xF(t, e);
        function t() {
          return (e !== null && e.apply(this, arguments)) || this;
        }
        return t;
      })(RF.Delay);
    fi.AlwaysDelay = bF;
  });
  var zm = fe((hd) => {
    'use strict';
    Object.defineProperty(hd, '__esModule', {value: !0});
    var FF = $m(),
      AF = Hm();
    function PF(e, t) {
      var r = IF(e);
      return r.setAttemptNumber(t), r;
    }
    hd.DelayFactory = PF;
    function IF(e) {
      return e.delayFirstAttempt
        ? new AF.AlwaysDelay(e)
        : new FF.SkipFirstDelay(e);
    }
  });
  var Wm = fe((va) => {
    'use strict';
    var Sd =
        (va && va.__awaiter) ||
        function (e, t, r, a) {
          function n(o) {
            return o instanceof r
              ? o
              : new r(function (i) {
                  i(o);
                });
          }
          return new (r || (r = Promise))(function (o, i) {
            function s(l) {
              try {
                c(a.next(l));
              } catch (p) {
                i(p);
              }
            }
            function u(l) {
              try {
                c(a.throw(l));
              } catch (p) {
                i(p);
              }
            }
            function c(l) {
              l.done ? o(l.value) : n(l.value).then(s, u);
            }
            c((a = a.apply(e, t || [])).next());
          });
        },
      yd =
        (va && va.__generator) ||
        function (e, t) {
          var r = {
              label: 0,
              sent: function () {
                if (o[0] & 1) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            },
            a,
            n,
            o,
            i;
          return (
            (i = {next: s(0), throw: s(1), return: s(2)}),
            typeof Symbol == 'function' &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function s(c) {
            return function (l) {
              return u([c, l]);
            };
          }
          function u(c) {
            if (a) throw new TypeError('Generator is already executing.');
            for (; r; )
              try {
                if (
                  ((a = 1),
                  n &&
                    (o =
                      c[0] & 2
                        ? n.return
                        : c[0]
                        ? n.throw || ((o = n.return) && o.call(n), 0)
                        : n.next) &&
                    !(o = o.call(n, c[1])).done)
                )
                  return o;
                switch (((n = 0), o && (c = [c[0] & 2, o.value]), c[0])) {
                  case 0:
                  case 1:
                    o = c;
                    break;
                  case 4:
                    return r.label++, {value: c[1], done: !1};
                  case 5:
                    r.label++, (n = c[1]), (c = [0]);
                    continue;
                  case 7:
                    (c = r.ops.pop()), r.trys.pop();
                    continue;
                  default:
                    if (
                      ((o = r.trys),
                      !(o = o.length > 0 && o[o.length - 1]) &&
                        (c[0] === 6 || c[0] === 2))
                    ) {
                      r = 0;
                      continue;
                    }
                    if (c[0] === 3 && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                      r.label = c[1];
                      break;
                    }
                    if (c[0] === 6 && r.label < o[1]) {
                      (r.label = o[1]), (o = c);
                      break;
                    }
                    if (o && r.label < o[2]) {
                      (r.label = o[2]), r.ops.push(c);
                      break;
                    }
                    o[2] && r.ops.pop(), r.trys.pop();
                    continue;
                }
                c = t.call(e, r);
              } catch (l) {
                (c = [6, l]), (n = 0);
              } finally {
                a = o = 0;
              }
            if (c[0] & 5) throw c[1];
            return {value: c[0] ? c[1] : void 0, done: !0};
          }
        };
    Object.defineProperty(va, '__esModule', {value: !0});
    var EF = jm(),
      wF = zm();
    function kF(e, t) {
      return (
        t === void 0 && (t = {}),
        Sd(this, void 0, void 0, function () {
          var r, a;
          return yd(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  (r = EF.getSanitizedOptions(t)),
                  (a = new OF(e, r)),
                  [4, a.execute()]
                );
              case 1:
                return [2, n.sent()];
            }
          });
        })
      );
    }
    va.backOff = kF;
    var OF = (function () {
      function e(t, r) {
        (this.request = t), (this.options = r), (this.attemptNumber = 0);
      }
      return (
        (e.prototype.execute = function () {
          return Sd(this, void 0, void 0, function () {
            var t, r;
            return yd(this, function (a) {
              switch (a.label) {
                case 0:
                  if (this.attemptLimitReached) return [3, 7];
                  a.label = 1;
                case 1:
                  return a.trys.push([1, 4, , 6]), [4, this.applyDelay()];
                case 2:
                  return a.sent(), [4, this.request()];
                case 3:
                  return [2, a.sent()];
                case 4:
                  return (
                    (t = a.sent()),
                    this.attemptNumber++,
                    [4, this.options.retry(t, this.attemptNumber)]
                  );
                case 5:
                  if (((r = a.sent()), !r || this.attemptLimitReached)) throw t;
                  return [3, 6];
                case 6:
                  return [3, 0];
                case 7:
                  throw new Error('Something went wrong.');
              }
            });
          });
        }),
        Object.defineProperty(e.prototype, 'attemptLimitReached', {
          get: function () {
            return this.attemptNumber >= this.options.numOfAttempts;
          },
          enumerable: !0,
          configurable: !0,
        }),
        (e.prototype.applyDelay = function () {
          return Sd(this, void 0, void 0, function () {
            var t;
            return yd(this, function (r) {
              switch (r.label) {
                case 0:
                  return (
                    (t = wF.DelayFactory(this.options, this.attemptNumber)),
                    [4, t.apply()]
                  );
                case 1:
                  return r.sent(), [2];
              }
            });
          });
        }),
        e
      );
    })();
  });
  var ng = fe((Fq, Cd) => {
    'use strict';
    var ls =
      typeof self != 'undefined'
        ? self
        : typeof window != 'undefined'
        ? window
        : void 0;
    if (!ls)
      throw new Error(
        'Unable to find global scope. Are you sure this is running in the browser?'
      );
    if (!ls.AbortController)
      throw new Error(
        'Could not find "AbortController" in the global scope. You need to polyfill it first'
      );
    Cd.exports = ls.AbortController;
    Cd.exports.default = ls.AbortController;
  });
  var ug = fe((sT, cg) => {
    'use strict';
    function $F(e) {
      if (arguments.length === 0)
        throw new TypeError('1 argument required, but only 0 present.');
      if (
        ((e = `${e}`),
        (e = e.replace(/[ \t\n\f\r]/g, '')),
        e.length % 4 == 0 && (e = e.replace(/==?$/, '')),
        e.length % 4 == 1 || /[^+/0-9A-Za-z]/.test(e))
      )
        return null;
      let t = '',
        r = 0,
        a = 0;
      for (let n = 0; n < e.length; n++)
        (r <<= 6),
          (r |= zF(e[n])),
          (a += 6),
          a === 24 &&
            ((t += String.fromCharCode((r & 16711680) >> 16)),
            (t += String.fromCharCode((r & 65280) >> 8)),
            (t += String.fromCharCode(r & 255)),
            (r = a = 0));
      return (
        a === 12
          ? ((r >>= 4), (t += String.fromCharCode(r)))
          : a === 18 &&
            ((r >>= 2),
            (t += String.fromCharCode((r & 65280) >> 8)),
            (t += String.fromCharCode(r & 255))),
        t
      );
    }
    var HF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function zF(e) {
      let t = HF.indexOf(e);
      return t < 0 ? void 0 : t;
    }
    cg.exports = $F;
  });
  var dg = fe((cT, lg) => {
    'use strict';
    function WF(e) {
      if (arguments.length === 0)
        throw new TypeError('1 argument required, but only 0 present.');
      let t;
      for (e = `${e}`, t = 0; t < e.length; t++)
        if (e.charCodeAt(t) > 255) return null;
      let r = '';
      for (t = 0; t < e.length; t += 3) {
        let a = [void 0, void 0, void 0, void 0];
        (a[0] = e.charCodeAt(t) >> 2),
          (a[1] = (e.charCodeAt(t) & 3) << 4),
          e.length > t + 1 &&
            ((a[1] |= e.charCodeAt(t + 1) >> 4),
            (a[2] = (e.charCodeAt(t + 1) & 15) << 2)),
          e.length > t + 2 &&
            ((a[2] |= e.charCodeAt(t + 2) >> 6),
            (a[3] = e.charCodeAt(t + 2) & 63));
        for (let n = 0; n < a.length; n++)
          typeof a[n] == 'undefined' ? (r += '=') : (r += KF(a[n]));
      }
      return r;
    }
    var YF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function KF(e) {
      if (e >= 0 && e < 64) return YF[e];
    }
    lg.exports = WF;
  });
  var bd = fe((uT, pg) => {
    'use strict';
    var GF = ug(),
      JF = dg();
    pg.exports = {atob: GF, btoa: JF};
  });
  var Ts = fe((Ed, wd) => {
    (function (e, t) {
      typeof Ed == 'object' && typeof wd != 'undefined'
        ? (wd.exports = t())
        : typeof define == 'function' && define.amd
        ? define(t)
        : ((e =
            typeof globalThis != 'undefined' ? globalThis : e || self).dayjs =
            t());
    })(Ed, function () {
      'use strict';
      var e = 1e3,
        t = 6e4,
        r = 36e5,
        a = 'millisecond',
        n = 'second',
        o = 'minute',
        i = 'hour',
        s = 'day',
        u = 'week',
        c = 'month',
        l = 'quarter',
        p = 'year',
        f = 'date',
        d = 'Invalid Date',
        m =
          /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
        h =
          /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
        v = {
          name: 'en',
          weekdays:
            'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
              '_'
            ),
          months:
            'January_February_March_April_May_June_July_August_September_October_November_December'.split(
              '_'
            ),
        },
        C = function (N, A, V) {
          var j = String(N);
          return !j || j.length >= A
            ? N
            : '' + Array(A + 1 - j.length).join(V) + N;
        },
        x = {
          s: C,
          z: function (N) {
            var A = -N.utcOffset(),
              V = Math.abs(A),
              j = Math.floor(V / 60),
              w = V % 60;
            return (A <= 0 ? '+' : '-') + C(j, 2, '0') + ':' + C(w, 2, '0');
          },
          m: function N(A, V) {
            if (A.date() < V.date()) return -N(V, A);
            var j = 12 * (V.year() - A.year()) + (V.month() - A.month()),
              w = A.clone().add(j, c),
              z = V - w < 0,
              Y = A.clone().add(j + (z ? -1 : 1), c);
            return +(-(j + (V - w) / (z ? w - Y : Y - w)) || 0);
          },
          a: function (N) {
            return N < 0 ? Math.ceil(N) || 0 : Math.floor(N);
          },
          p: function (N) {
            return (
              {M: c, y: p, w: u, d: s, D: f, h: i, m: o, s: n, ms: a, Q: l}[
                N
              ] ||
              String(N || '')
                .toLowerCase()
                .replace(/s$/, '')
            );
          },
          u: function (N) {
            return N === void 0;
          },
        },
        b = 'en',
        P = {};
      P[b] = v;
      var _ = function (N) {
          return N instanceof $;
        },
        X = function N(A, V, j) {
          var w;
          if (!A) return b;
          if (typeof A == 'string') {
            var z = A.toLowerCase();
            P[z] && (w = z), V && ((P[z] = V), (w = z));
            var Y = A.split('-');
            if (!w && Y.length > 1) return N(Y[0]);
          } else {
            var ae = A.name;
            (P[ae] = A), (w = ae);
          }
          return !j && w && (b = w), w || (!j && b);
        },
        H = function (N, A) {
          if (_(N)) return N.clone();
          var V = typeof A == 'object' ? A : {};
          return (V.date = N), (V.args = arguments), new $(V);
        },
        I = x;
      (I.l = X),
        (I.i = _),
        (I.w = function (N, A) {
          return H(N, {locale: A.$L, utc: A.$u, x: A.$x, $offset: A.$offset});
        });
      var $ = (function () {
          function N(V) {
            (this.$L = X(V.locale, null, !0)), this.parse(V);
          }
          var A = N.prototype;
          return (
            (A.parse = function (V) {
              (this.$d = (function (j) {
                var w = j.date,
                  z = j.utc;
                if (w === null) return new Date(NaN);
                if (I.u(w)) return new Date();
                if (w instanceof Date) return new Date(w);
                if (typeof w == 'string' && !/Z$/i.test(w)) {
                  var Y = w.match(m);
                  if (Y) {
                    var ae = Y[2] - 1 || 0,
                      le = (Y[7] || '0').substring(0, 3);
                    return z
                      ? new Date(
                          Date.UTC(
                            Y[1],
                            ae,
                            Y[3] || 1,
                            Y[4] || 0,
                            Y[5] || 0,
                            Y[6] || 0,
                            le
                          )
                        )
                      : new Date(
                          Y[1],
                          ae,
                          Y[3] || 1,
                          Y[4] || 0,
                          Y[5] || 0,
                          Y[6] || 0,
                          le
                        );
                  }
                }
                return new Date(w);
              })(V)),
                (this.$x = V.x || {}),
                this.init();
            }),
            (A.init = function () {
              var V = this.$d;
              (this.$y = V.getFullYear()),
                (this.$M = V.getMonth()),
                (this.$D = V.getDate()),
                (this.$W = V.getDay()),
                (this.$H = V.getHours()),
                (this.$m = V.getMinutes()),
                (this.$s = V.getSeconds()),
                (this.$ms = V.getMilliseconds());
            }),
            (A.$utils = function () {
              return I;
            }),
            (A.isValid = function () {
              return this.$d.toString() !== d;
            }),
            (A.isSame = function (V, j) {
              var w = H(V);
              return this.startOf(j) <= w && w <= this.endOf(j);
            }),
            (A.isAfter = function (V, j) {
              return H(V) < this.startOf(j);
            }),
            (A.isBefore = function (V, j) {
              return this.endOf(j) < H(V);
            }),
            (A.$g = function (V, j, w) {
              return I.u(V) ? this[j] : this.set(w, V);
            }),
            (A.unix = function () {
              return Math.floor(this.valueOf() / 1e3);
            }),
            (A.valueOf = function () {
              return this.$d.getTime();
            }),
            (A.startOf = function (V, j) {
              var w = this,
                z = !!I.u(j) || j,
                Y = I.p(V),
                ae = function (qt, Ie) {
                  var tt = I.w(
                    w.$u ? Date.UTC(w.$y, Ie, qt) : new Date(w.$y, Ie, qt),
                    w
                  );
                  return z ? tt : tt.endOf(s);
                },
                le = function (qt, Ie) {
                  return I.w(
                    w
                      .toDate()
                      [qt].apply(
                        w.toDate('s'),
                        (z ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(Ie)
                      ),
                    w
                  );
                },
                Se = this.$W,
                Pe = this.$M,
                Ot = this.$D,
                St = 'set' + (this.$u ? 'UTC' : '');
              switch (Y) {
                case p:
                  return z ? ae(1, 0) : ae(31, 11);
                case c:
                  return z ? ae(1, Pe) : ae(0, Pe + 1);
                case u:
                  var pa = this.$locale().weekStart || 0,
                    Ir = (Se < pa ? Se + 7 : Se) - pa;
                  return ae(z ? Ot - Ir : Ot + (6 - Ir), Pe);
                case s:
                case f:
                  return le(St + 'Hours', 0);
                case i:
                  return le(St + 'Minutes', 1);
                case o:
                  return le(St + 'Seconds', 2);
                case n:
                  return le(St + 'Milliseconds', 3);
                default:
                  return this.clone();
              }
            }),
            (A.endOf = function (V) {
              return this.startOf(V, !1);
            }),
            (A.$set = function (V, j) {
              var w,
                z = I.p(V),
                Y = 'set' + (this.$u ? 'UTC' : ''),
                ae = ((w = {}),
                (w[s] = Y + 'Date'),
                (w[f] = Y + 'Date'),
                (w[c] = Y + 'Month'),
                (w[p] = Y + 'FullYear'),
                (w[i] = Y + 'Hours'),
                (w[o] = Y + 'Minutes'),
                (w[n] = Y + 'Seconds'),
                (w[a] = Y + 'Milliseconds'),
                w)[z],
                le = z === s ? this.$D + (j - this.$W) : j;
              if (z === c || z === p) {
                var Se = this.clone().set(f, 1);
                Se.$d[ae](le),
                  Se.init(),
                  (this.$d = Se.set(f, Math.min(this.$D, Se.daysInMonth())).$d);
              } else ae && this.$d[ae](le);
              return this.init(), this;
            }),
            (A.set = function (V, j) {
              return this.clone().$set(V, j);
            }),
            (A.get = function (V) {
              return this[I.p(V)]();
            }),
            (A.add = function (V, j) {
              var w,
                z = this;
              V = Number(V);
              var Y = I.p(j),
                ae = function (Pe) {
                  var Ot = H(z);
                  return I.w(Ot.date(Ot.date() + Math.round(Pe * V)), z);
                };
              if (Y === c) return this.set(c, this.$M + V);
              if (Y === p) return this.set(p, this.$y + V);
              if (Y === s) return ae(1);
              if (Y === u) return ae(7);
              var le =
                  ((w = {}), (w[o] = t), (w[i] = r), (w[n] = e), w)[Y] || 1,
                Se = this.$d.getTime() + V * le;
              return I.w(Se, this);
            }),
            (A.subtract = function (V, j) {
              return this.add(-1 * V, j);
            }),
            (A.format = function (V) {
              var j = this,
                w = this.$locale();
              if (!this.isValid()) return w.invalidDate || d;
              var z = V || 'YYYY-MM-DDTHH:mm:ssZ',
                Y = I.z(this),
                ae = this.$H,
                le = this.$m,
                Se = this.$M,
                Pe = w.weekdays,
                Ot = w.months,
                St = function (Ie, tt, Er, wr) {
                  return (Ie && (Ie[tt] || Ie(j, z))) || Er[tt].slice(0, wr);
                },
                pa = function (Ie) {
                  return I.s(ae % 12 || 12, Ie, '0');
                },
                Ir =
                  w.meridiem ||
                  function (Ie, tt, Er) {
                    var wr = Ie < 12 ? 'AM' : 'PM';
                    return Er ? wr.toLowerCase() : wr;
                  },
                qt = {
                  YY: String(this.$y).slice(-2),
                  YYYY: this.$y,
                  M: Se + 1,
                  MM: I.s(Se + 1, 2, '0'),
                  MMM: St(w.monthsShort, Se, Ot, 3),
                  MMMM: St(Ot, Se),
                  D: this.$D,
                  DD: I.s(this.$D, 2, '0'),
                  d: String(this.$W),
                  dd: St(w.weekdaysMin, this.$W, Pe, 2),
                  ddd: St(w.weekdaysShort, this.$W, Pe, 3),
                  dddd: Pe[this.$W],
                  H: String(ae),
                  HH: I.s(ae, 2, '0'),
                  h: pa(1),
                  hh: pa(2),
                  a: Ir(ae, le, !0),
                  A: Ir(ae, le, !1),
                  m: String(le),
                  mm: I.s(le, 2, '0'),
                  s: String(this.$s),
                  ss: I.s(this.$s, 2, '0'),
                  SSS: I.s(this.$ms, 3, '0'),
                  Z: Y,
                };
              return z.replace(h, function (Ie, tt) {
                return tt || qt[Ie] || Y.replace(':', '');
              });
            }),
            (A.utcOffset = function () {
              return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
            }),
            (A.diff = function (V, j, w) {
              var z,
                Y = I.p(j),
                ae = H(V),
                le = (ae.utcOffset() - this.utcOffset()) * t,
                Se = this - ae,
                Pe = I.m(this, ae);
              return (
                (Pe =
                  ((z = {}),
                  (z[p] = Pe / 12),
                  (z[c] = Pe),
                  (z[l] = Pe / 3),
                  (z[u] = (Se - le) / 6048e5),
                  (z[s] = (Se - le) / 864e5),
                  (z[i] = Se / r),
                  (z[o] = Se / t),
                  (z[n] = Se / e),
                  z)[Y] || Se),
                w ? Pe : I.a(Pe)
              );
            }),
            (A.daysInMonth = function () {
              return this.endOf(c).$D;
            }),
            (A.$locale = function () {
              return P[this.$L];
            }),
            (A.locale = function (V, j) {
              if (!V) return this.$L;
              var w = this.clone(),
                z = X(V, j, !0);
              return z && (w.$L = z), w;
            }),
            (A.clone = function () {
              return I.w(this.$d, this);
            }),
            (A.toDate = function () {
              return new Date(this.valueOf());
            }),
            (A.toJSON = function () {
              return this.isValid() ? this.toISOString() : null;
            }),
            (A.toISOString = function () {
              return this.$d.toISOString();
            }),
            (A.toString = function () {
              return this.$d.toUTCString();
            }),
            N
          );
        })(),
        ne = $.prototype;
      return (
        (H.prototype = ne),
        [
          ['$ms', a],
          ['$s', n],
          ['$m', o],
          ['$H', i],
          ['$W', s],
          ['$M', c],
          ['$y', p],
          ['$D', f],
        ].forEach(function (N) {
          ne[N[1]] = function (A) {
            return this.$g(A, N[0], N[1]);
          };
        }),
        (H.extend = function (N, A) {
          return N.$i || (N(A, $, H), (N.$i = !0)), H;
        }),
        (H.locale = X),
        (H.isDayjs = _),
        (H.unix = function (N) {
          return H(1e3 * N);
        }),
        (H.en = P[b]),
        (H.Ls = P),
        (H.p = {}),
        H
      );
    });
  });
  var Tg = fe((kd, Od) => {
    (function (e, t) {
      typeof kd == 'object' && typeof Od != 'undefined'
        ? (Od.exports = t())
        : typeof define == 'function' && define.amd
        ? define(t)
        : ((e =
            typeof globalThis != 'undefined'
              ? globalThis
              : e || self).dayjs_plugin_quarterOfYear = t());
    })(kd, function () {
      'use strict';
      var e = 'month',
        t = 'quarter';
      return function (r, a) {
        var n = a.prototype;
        n.quarter = function (s) {
          return this.$utils().u(s)
            ? Math.ceil((this.month() + 1) / 3)
            : this.month((this.month() % 3) + 3 * (s - 1));
        };
        var o = n.add;
        n.add = function (s, u) {
          return (
            (s = Number(s)),
            this.$utils().p(u) === t ? this.add(3 * s, e) : o.bind(this)(s, u)
          );
        };
        var i = n.startOf;
        n.startOf = function (s, u) {
          var c = this.$utils(),
            l = !!c.u(u) || u;
          if (c.p(s) === t) {
            var p = this.quarter() - 1;
            return l
              ? this.month(3 * p)
                  .startOf(e)
                  .startOf('day')
              : this.month(3 * p + 2)
                  .endOf(e)
                  .endOf('day');
          }
          return i.bind(this)(s, u);
        };
      };
    });
  });
  var Dg = fe((qd, Td) => {
    (function (e, t) {
      typeof qd == 'object' && typeof Td != 'undefined'
        ? (Td.exports = t())
        : typeof define == 'function' && define.amd
        ? define(t)
        : ((e =
            typeof globalThis != 'undefined'
              ? globalThis
              : e || self).dayjs_plugin_customParseFormat = t());
    })(qd, function () {
      'use strict';
      var e = {
          LTS: 'h:mm:ss A',
          LT: 'h:mm A',
          L: 'MM/DD/YYYY',
          LL: 'MMMM D, YYYY',
          LLL: 'MMMM D, YYYY h:mm A',
          LLLL: 'dddd, MMMM D, YYYY h:mm A',
        },
        t =
          /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,
        r = /\d\d/,
        a = /\d\d?/,
        n = /\d*[^-_:/,()\s\d]+/,
        o = {},
        i = function (d) {
          return (d = +d) + (d > 68 ? 1900 : 2e3);
        },
        s = function (d) {
          return function (m) {
            this[d] = +m;
          };
        },
        u = [
          /[+-]\d\d:?(\d\d)?|Z/,
          function (d) {
            (this.zone || (this.zone = {})).offset = (function (m) {
              if (!m || m === 'Z') return 0;
              var h = m.match(/([+-]|\d\d)/g),
                v = 60 * h[1] + (+h[2] || 0);
              return v === 0 ? 0 : h[0] === '+' ? -v : v;
            })(d);
          },
        ],
        c = function (d) {
          var m = o[d];
          return m && (m.indexOf ? m : m.s.concat(m.f));
        },
        l = function (d, m) {
          var h,
            v = o.meridiem;
          if (v) {
            for (var C = 1; C <= 24; C += 1)
              if (d.indexOf(v(C, 0, m)) > -1) {
                h = C > 12;
                break;
              }
          } else h = d === (m ? 'pm' : 'PM');
          return h;
        },
        p = {
          A: [
            n,
            function (d) {
              this.afternoon = l(d, !1);
            },
          ],
          a: [
            n,
            function (d) {
              this.afternoon = l(d, !0);
            },
          ],
          S: [
            /\d/,
            function (d) {
              this.milliseconds = 100 * +d;
            },
          ],
          SS: [
            r,
            function (d) {
              this.milliseconds = 10 * +d;
            },
          ],
          SSS: [
            /\d{3}/,
            function (d) {
              this.milliseconds = +d;
            },
          ],
          s: [a, s('seconds')],
          ss: [a, s('seconds')],
          m: [a, s('minutes')],
          mm: [a, s('minutes')],
          H: [a, s('hours')],
          h: [a, s('hours')],
          HH: [a, s('hours')],
          hh: [a, s('hours')],
          D: [a, s('day')],
          DD: [r, s('day')],
          Do: [
            n,
            function (d) {
              var m = o.ordinal,
                h = d.match(/\d+/);
              if (((this.day = h[0]), m))
                for (var v = 1; v <= 31; v += 1)
                  m(v).replace(/\[|\]/g, '') === d && (this.day = v);
            },
          ],
          M: [a, s('month')],
          MM: [r, s('month')],
          MMM: [
            n,
            function (d) {
              var m = c('months'),
                h =
                  (
                    c('monthsShort') ||
                    m.map(function (v) {
                      return v.slice(0, 3);
                    })
                  ).indexOf(d) + 1;
              if (h < 1) throw new Error();
              this.month = h % 12 || h;
            },
          ],
          MMMM: [
            n,
            function (d) {
              var m = c('months').indexOf(d) + 1;
              if (m < 1) throw new Error();
              this.month = m % 12 || m;
            },
          ],
          Y: [/[+-]?\d+/, s('year')],
          YY: [
            r,
            function (d) {
              this.year = i(d);
            },
          ],
          YYYY: [/\d{4}/, s('year')],
          Z: u,
          ZZ: u,
        };
      function f(d) {
        var m, h;
        (m = d), (h = o && o.formats);
        for (
          var v = (d = m.replace(
              /(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,
              function (H, I, $) {
                var ne = $ && $.toUpperCase();
                return (
                  I ||
                  h[$] ||
                  e[$] ||
                  h[ne].replace(
                    /(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,
                    function (N, A, V) {
                      return A || V.slice(1);
                    }
                  )
                );
              }
            )).match(t),
            C = v.length,
            x = 0;
          x < C;
          x += 1
        ) {
          var b = v[x],
            P = p[b],
            _ = P && P[0],
            X = P && P[1];
          v[x] = X ? {regex: _, parser: X} : b.replace(/^\[|\]$/g, '');
        }
        return function (H) {
          for (var I = {}, $ = 0, ne = 0; $ < C; $ += 1) {
            var N = v[$];
            if (typeof N == 'string') ne += N.length;
            else {
              var A = N.regex,
                V = N.parser,
                j = H.slice(ne),
                w = A.exec(j)[0];
              V.call(I, w), (H = H.replace(w, ''));
            }
          }
          return (
            (function (z) {
              var Y = z.afternoon;
              if (Y !== void 0) {
                var ae = z.hours;
                Y ? ae < 12 && (z.hours += 12) : ae === 12 && (z.hours = 0),
                  delete z.afternoon;
              }
            })(I),
            I
          );
        };
      }
      return function (d, m, h) {
        (h.p.customParseFormat = !0),
          d && d.parseTwoDigitYear && (i = d.parseTwoDigitYear);
        var v = m.prototype,
          C = v.parse;
        v.parse = function (x) {
          var b = x.date,
            P = x.utc,
            _ = x.args;
          this.$u = P;
          var X = _[1];
          if (typeof X == 'string') {
            var H = _[2] === !0,
              I = _[3] === !0,
              $ = H || I,
              ne = _[2];
            I && (ne = _[2]),
              (o = this.$locale()),
              !H && ne && (o = h.Ls[ne]),
              (this.$d = (function (j, w, z) {
                try {
                  if (['x', 'X'].indexOf(w) > -1)
                    return new Date((w === 'X' ? 1e3 : 1) * j);
                  var Y = f(w)(j),
                    ae = Y.year,
                    le = Y.month,
                    Se = Y.day,
                    Pe = Y.hours,
                    Ot = Y.minutes,
                    St = Y.seconds,
                    pa = Y.milliseconds,
                    Ir = Y.zone,
                    qt = new Date(),
                    Ie = Se || (ae || le ? 1 : qt.getDate()),
                    tt = ae || qt.getFullYear(),
                    Er = 0;
                  (ae && !le) || (Er = le > 0 ? le - 1 : qt.getMonth());
                  var wr = Pe || 0,
                    ml = Ot || 0,
                    gl = St || 0,
                    hl = pa || 0;
                  return Ir
                    ? new Date(
                        Date.UTC(
                          tt,
                          Er,
                          Ie,
                          wr,
                          ml,
                          gl,
                          hl + 60 * Ir.offset * 1e3
                        )
                      )
                    : z
                    ? new Date(Date.UTC(tt, Er, Ie, wr, ml, gl, hl))
                    : new Date(tt, Er, Ie, wr, ml, gl, hl);
                } catch {
                  return new Date('');
                }
              })(b, X, P)),
              this.init(),
              ne && ne !== !0 && (this.$L = this.locale(ne).$L),
              $ && b != this.format(X) && (this.$d = new Date('')),
              (o = {});
          } else if (X instanceof Array)
            for (var N = X.length, A = 1; A <= N; A += 1) {
              _[1] = X[A - 1];
              var V = h.apply(this, _);
              if (V.isValid()) {
                (this.$d = V.$d), (this.$L = V.$L), this.init();
                break;
              }
              A === N && (this.$d = new Date(''));
            }
          else C.call(this, x);
        };
      };
    });
  });
  var Jg = fe((Nd, Md) => {
    (function (e, t) {
      typeof Nd == 'object' && typeof Md != 'undefined'
        ? (Md.exports = t())
        : typeof define == 'function' && define.amd
        ? define(t)
        : ((e =
            typeof globalThis != 'undefined'
              ? globalThis
              : e || self).dayjs_plugin_timezone = t());
    })(Nd, function () {
      'use strict';
      var e = {year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5},
        t = {};
      return function (r, a, n) {
        var o,
          i = function (l, p, f) {
            f === void 0 && (f = {});
            var d = new Date(l),
              m = (function (h, v) {
                v === void 0 && (v = {});
                var C = v.timeZoneName || 'short',
                  x = h + '|' + C,
                  b = t[x];
                return (
                  b ||
                    ((b = new Intl.DateTimeFormat('en-US', {
                      hour12: !1,
                      timeZone: h,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZoneName: C,
                    })),
                    (t[x] = b)),
                  b
                );
              })(p, f);
            return m.formatToParts(d);
          },
          s = function (l, p) {
            for (var f = i(l, p), d = [], m = 0; m < f.length; m += 1) {
              var h = f[m],
                v = h.type,
                C = h.value,
                x = e[v];
              x >= 0 && (d[x] = parseInt(C, 10));
            }
            var b = d[3],
              P = b === 24 ? 0 : b,
              _ =
                d[0] +
                '-' +
                d[1] +
                '-' +
                d[2] +
                ' ' +
                P +
                ':' +
                d[4] +
                ':' +
                d[5] +
                ':000',
              X = +l;
            return (n.utc(_).valueOf() - (X -= X % 1e3)) / 6e4;
          },
          u = a.prototype;
        (u.tz = function (l, p) {
          l === void 0 && (l = o);
          var f = this.utcOffset(),
            d = this.toDate(),
            m = d.toLocaleString('en-US', {timeZone: l}),
            h = Math.round((d - new Date(m)) / 1e3 / 60),
            v = n(m)
              .$set('millisecond', this.$ms)
              .utcOffset(15 * -Math.round(d.getTimezoneOffset() / 15) - h, !0);
          if (p) {
            var C = v.utcOffset();
            v = v.add(f - C, 'minute');
          }
          return (v.$x.$timezone = l), v;
        }),
          (u.offsetName = function (l) {
            var p = this.$x.$timezone || n.tz.guess(),
              f = i(this.valueOf(), p, {timeZoneName: l}).find(function (d) {
                return d.type.toLowerCase() === 'timezonename';
              });
            return f && f.value;
          });
        var c = u.startOf;
        (u.startOf = function (l, p) {
          if (!this.$x || !this.$x.$timezone) return c.call(this, l, p);
          var f = n(this.format('YYYY-MM-DD HH:mm:ss:SSS'));
          return c.call(f, l, p).tz(this.$x.$timezone, !0);
        }),
          (n.tz = function (l, p, f) {
            var d = f && p,
              m = f || p || o,
              h = s(+n(), m);
            if (typeof l != 'string') return n(l).tz(m);
            var v = (function (P, _, X) {
                var H = P - 60 * _ * 1e3,
                  I = s(H, X);
                if (_ === I) return [H, _];
                var $ = s((H -= 60 * (I - _) * 1e3), X);
                return I === $
                  ? [H, I]
                  : [P - 60 * Math.min(I, $) * 1e3, Math.max(I, $)];
              })(n.utc(l, d).valueOf(), h, m),
              C = v[0],
              x = v[1],
              b = n(C).utcOffset(x);
            return (b.$x.$timezone = m), b;
          }),
          (n.tz.guess = function () {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
          }),
          (n.tz.setDefault = function (l) {
            o = l;
          });
      };
    });
  });
  var Xg = fe((Qd, Ld) => {
    (function (e, t) {
      typeof Qd == 'object' && typeof Ld != 'undefined'
        ? (Ld.exports = t())
        : typeof define == 'function' && define.amd
        ? define(t)
        : ((e =
            typeof globalThis != 'undefined'
              ? globalThis
              : e || self).dayjs_plugin_utc = t());
    })(Qd, function () {
      'use strict';
      var e = 'minute',
        t = /[+-]\d\d(?::?\d\d)?/g,
        r = /([+-]|\d\d)/g;
      return function (a, n, o) {
        var i = n.prototype;
        (o.utc = function (d) {
          var m = {date: d, utc: !0, args: arguments};
          return new n(m);
        }),
          (i.utc = function (d) {
            var m = o(this.toDate(), {locale: this.$L, utc: !0});
            return d ? m.add(this.utcOffset(), e) : m;
          }),
          (i.local = function () {
            return o(this.toDate(), {locale: this.$L, utc: !1});
          });
        var s = i.parse;
        i.parse = function (d) {
          d.utc && (this.$u = !0),
            this.$utils().u(d.$offset) || (this.$offset = d.$offset),
            s.call(this, d);
        };
        var u = i.init;
        i.init = function () {
          if (this.$u) {
            var d = this.$d;
            (this.$y = d.getUTCFullYear()),
              (this.$M = d.getUTCMonth()),
              (this.$D = d.getUTCDate()),
              (this.$W = d.getUTCDay()),
              (this.$H = d.getUTCHours()),
              (this.$m = d.getUTCMinutes()),
              (this.$s = d.getUTCSeconds()),
              (this.$ms = d.getUTCMilliseconds());
          } else u.call(this);
        };
        var c = i.utcOffset;
        i.utcOffset = function (d, m) {
          var h = this.$utils().u;
          if (h(d))
            return this.$u ? 0 : h(this.$offset) ? c.call(this) : this.$offset;
          if (
            typeof d == 'string' &&
            ((d = (function (b) {
              b === void 0 && (b = '');
              var P = b.match(t);
              if (!P) return null;
              var _ = ('' + P[0]).match(r) || ['-', 0, 0],
                X = _[0],
                H = 60 * +_[1] + +_[2];
              return H === 0 ? 0 : X === '+' ? H : -H;
            })(d)),
            d === null)
          )
            return this;
          var v = Math.abs(d) <= 16 ? 60 * d : d,
            C = this;
          if (m) return (C.$offset = v), (C.$u = d === 0), C;
          if (d !== 0) {
            var x = this.$u
              ? this.toDate().getTimezoneOffset()
              : -1 * this.utcOffset();
            ((C = this.local().add(v + x, e)).$offset = v),
              (C.$x.$localOffset = x);
          } else C = this.utc();
          return C;
        };
        var l = i.format;
        (i.format = function (d) {
          var m = d || (this.$u ? 'YYYY-MM-DDTHH:mm:ss[Z]' : '');
          return l.call(this, m);
        }),
          (i.valueOf = function () {
            var d = this.$utils().u(this.$offset)
              ? 0
              : this.$offset +
                (this.$x.$localOffset || this.$d.getTimezoneOffset());
            return this.$d.valueOf() - 6e4 * d;
          }),
          (i.isUTC = function () {
            return !!this.$u;
          }),
          (i.toISOString = function () {
            return this.toDate().toISOString();
          }),
          (i.toString = function () {
            return this.toDate().toUTCString();
          });
        var p = i.toDate;
        i.toDate = function (d) {
          return d === 's' && this.$offset
            ? o(this.format('YYYY-MM-DD HH:mm:ss:SSS')).toDate()
            : p.call(this);
        };
        var f = i.diff;
        i.diff = function (d, m, h) {
          if (d && this.$u === d.$u) return f.call(this, d, m, h);
          var v = this.local(),
            C = o(d).local();
          return f.call(v, C, m, h);
        };
      };
    });
  });
  var DS = fe((Wc, TS) => {
    (function (e, t) {
      typeof Wc == 'object' && typeof TS != 'undefined'
        ? t(Wc)
        : typeof define == 'function' && define.amd
        ? define(['exports'], t)
        : ((e = typeof globalThis != 'undefined' ? globalThis : e || self),
          t((e['fast-equals'] = {})));
    })(Wc, function (e) {
      'use strict';
      var t = typeof WeakSet == 'function',
        r = Object.keys;
      function a(I, $) {
        return I === $ || (I !== I && $ !== $);
      }
      function n(I) {
        return I.constructor === Object || I.constructor == null;
      }
      function o(I) {
        return !!I && typeof I.then == 'function';
      }
      function i(I) {
        return !!(I && I.$$typeof);
      }
      function s() {
        var I = [];
        return {
          add: function ($) {
            I.push($);
          },
          has: function ($) {
            return I.indexOf($) !== -1;
          },
        };
      }
      var u = (function (I) {
        return I
          ? function () {
              return new WeakSet();
            }
          : s;
      })(t);
      function c(I) {
        return function (ne) {
          var N = I || ne;
          return function (V, j, w) {
            w === void 0 && (w = u());
            var z = !!V && typeof V == 'object',
              Y = !!j && typeof j == 'object';
            if (z || Y) {
              var ae = z && w.has(V),
                le = Y && w.has(j);
              if (ae || le) return ae && le;
              z && w.add(V), Y && w.add(j);
            }
            return N(V, j, w);
          };
        };
      }
      function l(I, $, ne, N) {
        var A = I.length;
        if ($.length !== A) return !1;
        for (; A-- > 0; ) if (!ne(I[A], $[A], N)) return !1;
        return !0;
      }
      function p(I, $, ne, N) {
        var A = I.size === $.size;
        if (A && I.size) {
          var V = {};
          I.forEach(function (j, w) {
            if (A) {
              var z = !1,
                Y = 0;
              $.forEach(function (ae, le) {
                !z &&
                  !V[Y] &&
                  ((z = ne(w, le, N) && ne(j, ae, N)), z && (V[Y] = !0)),
                  Y++;
              }),
                (A = z);
            }
          });
        }
        return A;
      }
      var f = '_owner',
        d = Function.prototype.bind.call(
          Function.prototype.call,
          Object.prototype.hasOwnProperty
        );
      function m(I, $, ne, N) {
        var A = r(I),
          V = A.length;
        if (r($).length !== V) return !1;
        if (V)
          for (var j = void 0; V-- > 0; ) {
            if (((j = A[V]), j === f)) {
              var w = i(I),
                z = i($);
              if ((w || z) && w !== z) return !1;
            }
            if (!d($, j) || !ne(I[j], $[j], N)) return !1;
          }
        return !0;
      }
      function h(I, $) {
        return (
          I.source === $.source &&
          I.global === $.global &&
          I.ignoreCase === $.ignoreCase &&
          I.multiline === $.multiline &&
          I.unicode === $.unicode &&
          I.sticky === $.sticky &&
          I.lastIndex === $.lastIndex
        );
      }
      function v(I, $, ne, N) {
        var A = I.size === $.size;
        if (A && I.size) {
          var V = {};
          I.forEach(function (j) {
            if (A) {
              var w = !1,
                z = 0;
              $.forEach(function (Y) {
                !w && !V[z] && ((w = ne(j, Y, N)), w && (V[z] = !0)), z++;
              }),
                (A = w);
            }
          });
        }
        return A;
      }
      var C = typeof Map == 'function',
        x = typeof Set == 'function';
      function b(I) {
        var $ = typeof I == 'function' ? I(ne) : ne;
        function ne(N, A, V) {
          if (N === A) return !0;
          if (N && A && typeof N == 'object' && typeof A == 'object') {
            if (n(N) && n(A)) return m(N, A, $, V);
            var j = Array.isArray(N),
              w = Array.isArray(A);
            return j || w
              ? j === w && l(N, A, $, V)
              : ((j = N instanceof Date),
                (w = A instanceof Date),
                j || w
                  ? j === w && a(N.getTime(), A.getTime())
                  : ((j = N instanceof RegExp),
                    (w = A instanceof RegExp),
                    j || w
                      ? j === w && h(N, A)
                      : o(N) || o(A)
                      ? N === A
                      : C &&
                        ((j = N instanceof Map), (w = A instanceof Map), j || w)
                      ? j === w && p(N, A, $, V)
                      : x &&
                        ((j = N instanceof Set), (w = A instanceof Set), j || w)
                      ? j === w && v(N, A, $, V)
                      : m(N, A, $, V)));
          }
          return N !== N && A !== A;
        }
        return ne;
      }
      var P = b(),
        _ = b(function () {
          return a;
        }),
        X = b(c()),
        H = b(c(a));
      (e.circularDeepEqual = X),
        (e.circularShallowEqual = H),
        (e.createCustomEqual = b),
        (e.deepEqual = P),
        (e.sameValueZeroEqual = a),
        (e.shallowEqual = _),
        Object.defineProperty(e, '__esModule', {value: !0});
    });
  });
  Ui(exports, {
    API_DATE_FORMAT: () => Rn,
    DefaultFieldsToInclude: () => _d,
    EcommerceDefaultFieldsToInclude: () => ah,
    HighlightUtils: () => Gd,
    MinimumFieldsToInclude: () => Ks,
    ResultTemplatesHelpers: () => Vp,
    SortBy: () => Pt,
    SortOrder: () => yr,
    TestUtils: () => Wd,
    VERSION: () => Za,
    analyticsUrl: () => us,
    baseFacetResponseSelector: () => vt,
    buildBreadcrumbManager: () => Bv,
    buildCategoryFacet: () => Zy,
    buildCategoryFieldSuggestions: () => FC,
    buildContext: () => _y,
    buildController: () => B,
    buildCriterionExpression: () => _t,
    buildDateFacet: () => cv,
    buildDateFilter: () => gv,
    buildDateRange: () => Xr,
    buildDateSortCriterion: () => Rs,
    buildDictionaryFieldContext: () => $y,
    buildDidYouMean: () => zy,
    buildExecuteTrigger: () => lC,
    buildFacet: () => ov,
    buildFacetConditionsManager: () => RC,
    buildFacetManager: () => jv,
    buildFieldSortCriterion: () => bs,
    buildFieldSuggestions: () => bC,
    buildFoldedResultList: () => sC,
    buildHistoryManager: () => hv,
    buildInstantResults: () => qv,
    buildInteractiveInstantResult: () => Pv,
    buildInteractiveRecentResult: () => xC,
    buildInteractiveResult: () => Av,
    buildNoSortCriterion: () => As,
    buildNotifyTrigger: () => dC,
    buildNumericFacet: () => dv,
    buildNumericFilter: () => fv,
    buildNumericRange: () => No,
    buildPager: () => vv,
    buildQueryError: () => xv,
    buildQueryExpression: () => Nk,
    buildQueryRankingExpressionSortCriterion: () => Fs,
    buildQuerySummary: () => bv,
    buildQueryTrigger: () => uC,
    buildQuickview: () => iC,
    buildRecentQueriesList: () => SC,
    buildRecentResultsList: () => CC,
    buildRedirectionTrigger: () => cC,
    buildRelevanceInspector: () => Uy,
    buildRelevanceSortCriterion: () => vn,
    buildResultList: () => Mu,
    buildResultTemplatesManager: () => AC,
    buildResultsPerPage: () => Ev,
    buildSearchBox: () => Uu,
    buildSearchEngine: () => Ny,
    buildSearchParameterManager: () => Gu,
    buildSearchParameterSerializer: () => Li,
    buildSearchStatus: () => aC,
    buildSmartSnippet: () => pC,
    buildSmartSnippetQuestionsList: () => mC,
    buildSort: () => Dv,
    buildStandaloneSearchBox: () => $v,
    buildStaticFilter: () => Vv,
    buildStaticFilterValue: () => wp,
    buildTab: () => Qv,
    buildUrlManager: () => rC,
    createAction: () => S,
    createAsyncThunk: () => te,
    createReducer: () => k,
    currentPageSelector: () => Ar,
    currentPagesSelector: () => Du,
    deserializeRelativeDate: () => $g,
    facetRequestSelector: () => ns,
    facetResponseSelectedValuesSelector: () => os,
    facetResponseSelector: () => di,
    getSampleSearchEngineConfiguration: () => bp,
    loadAdvancedSearchQueryActions: () => Yw,
    loadBreadcrumbActions: () => Rk,
    loadCategoryFacetSetActions: () => Kw,
    loadClickAnalyticsActions: () => kk,
    loadConfigurationActions: () => Jw,
    loadContextActions: () => Zw,
    loadDateFacetSetActions: () => rk,
    loadDebugActions: () => tk,
    loadDictionaryFieldContextActions: () => ek,
    loadDidYouMeanActions: () => nk,
    loadExcerptLengthActions: () => Ak,
    loadFacetOptionsActions: () => ak,
    loadFacetSetActions: () => Gw,
    loadFieldActions: () => ok,
    loadFoldingActions: () => ck,
    loadGenericAnalyticsActions: () => Ok,
    loadHistoryActions: () => ik,
    loadInstantResultsActions: () => fk,
    loadNumericFacetSetActions: () => sk,
    loadPaginationActions: () => uk,
    loadPipelineActions: () => lk,
    loadQueryActions: () => dk,
    loadQuerySetActions: () => pk,
    loadQuerySuggestActions: () => mk,
    loadQuestionAnsweringActions: () => xk,
    loadRecentQueriesActions: () => bk,
    loadRecentResultsActions: () => Fk,
    loadResultPreviewActions: () => Pk,
    loadSearchActions: () => gk,
    loadSearchAnalyticsActions: () => wk,
    loadSearchConfigurationActions: () => Xw,
    loadSearchHubActions: () => hk,
    loadSortCriteriaActions: () => Sk,
    loadStandaloneSearchBoxSetActions: () => yk,
    loadStaticFilterSetActions: () => vk,
    loadTabSetActions: () => Ck,
    maxPageSelector: () => Mi,
    parseCriterionExpression: () => PC,
    platformUrl: () => gi,
    validateRelativeDate: () => _r,
  });
  var Wd = {};
  Ui(Wd, {
    buildMockCaseAssistEngine: () => yh,
    buildMockProductListingEngine: () => Sh,
    buildMockProductRecommendationsAppEngine: () => hh,
    buildMockRaw: () => cc,
    buildMockRecommendationAppEngine: () => gh,
    buildMockResult: () => Ch,
    buildMockSearchAppEngine: () => mh,
    createMockState: () => sc,
  });
  var g = {};
  Ui(g, {
    MiddlewareArray: () => df,
    TaskAbortError: () => ri,
    addListener: () => Mf,
    clearAllListeners: () => Qf,
    configureStore: () => Ml,
    createAction: () => S,
    createAsyncThunk: () => te,
    createDraftSafeSelector: () => mr,
    createEntityAdapter: () => jx,
    createImmutableStateInvariantMiddleware: () => Ax,
    createListenerMiddleware: () => aR,
    createNextState: () => qr,
    createReducer: () => k,
    createSelector: () => zi,
    createSerializableStateInvariantMiddleware: () => Px,
    createSlice: () => Dx,
    current: () => Bo,
    findNonSerializableValue: () => Yi,
    freeze: () => Uo,
    getDefaultMiddleware: () => Ki,
    getType: () => Ox,
    isAllOf: () => jl,
    isAnyOf: () => ei,
    isAsyncThunkAction: () => If,
    isDraft: () => Me,
    isFulfilled: () => Pf,
    isImmutableDefault: () => mf,
    isPending: () => Ff,
    isPlain: () => Vl,
    isPlainObject: () => Wi,
    isRejected: () => Ji,
    isRejectedWithValue: () => Af,
    miniSerializeError: () => xf,
    nanoid: () => Ql,
    original: () => Mp,
    removeListener: () => Lf,
    unwrapResult: () => Rf,
  });
  function Ge(e) {
    for (
      var t = arguments.length, r = Array(t > 1 ? t - 1 : 0), a = 1;
      a < t;
      a++
    )
      r[a - 1] = arguments[a];
    if (!1) var n, o;
    throw Error(
      '[Immer] minified error nr: ' +
        e +
        (r.length
          ? ' ' +
            r
              .map(function (i) {
                return "'" + i + "'";
              })
              .join(',')
          : '') +
        '. Find the full error at: https://bit.ly/3cXEKWf'
    );
  }
  function Me(e) {
    return !!e && !!e[he];
  }
  function yt(e) {
    return (
      !!e &&
      ((function (t) {
        if (!t || typeof t != 'object') return !1;
        var r = Object.getPrototypeOf(t);
        if (r === null) return !0;
        var a = Object.hasOwnProperty.call(r, 'constructor') && r.constructor;
        return (
          a === Object ||
          (typeof a == 'function' && Function.toString.call(a) === KC)
        );
      })(e) ||
        Array.isArray(e) ||
        !!e[Yp] ||
        !!e.constructor[Yp] ||
        Sl(e) ||
        yl(e))
    );
  }
  function Mp(e) {
    return Me(e) || Ge(23, e), e[he].t;
  }
  function fa(e, t, r) {
    r === void 0 && (r = !1),
      ja(e) === 0
        ? (r ? Object.keys : Ba)(e).forEach(function (a) {
            (r && typeof a == 'symbol') || t(a, e[a], e);
          })
        : e.forEach(function (a, n) {
            return t(n, a, e);
          });
  }
  function ja(e) {
    var t = e[he];
    return t
      ? t.i > 3
        ? t.i - 4
        : t.i
      : Array.isArray(e)
      ? 1
      : Sl(e)
      ? 2
      : yl(e)
      ? 3
      : 0;
  }
  function Ua(e, t) {
    return ja(e) === 2 ? e.has(t) : Object.prototype.hasOwnProperty.call(e, t);
  }
  function _C(e, t) {
    return ja(e) === 2 ? e.get(t) : e[t];
  }
  function Qp(e, t, r) {
    var a = ja(e);
    a === 2 ? e.set(t, r) : a === 3 ? (e.delete(t), e.add(r)) : (e[t] = r);
  }
  function Lp(e, t) {
    return e === t ? e !== 0 || 1 / e == 1 / t : e != e && t != t;
  }
  function Sl(e) {
    return WC && e instanceof Map;
  }
  function yl(e) {
    return YC && e instanceof Set;
  }
  function kr(e) {
    return e.o || e.t;
  }
  function vl(e) {
    if (Array.isArray(e)) return Array.prototype.slice.call(e);
    var t = Kp(e);
    delete t[he];
    for (var r = Ba(t), a = 0; a < r.length; a++) {
      var n = r[a],
        o = t[n];
      o.writable === !1 && ((o.writable = !0), (o.configurable = !0)),
        (o.get || o.set) &&
          (t[n] = {
            configurable: !0,
            writable: !0,
            enumerable: o.enumerable,
            value: e[n],
          });
    }
    return Object.create(Object.getPrototypeOf(e), t);
  }
  function Uo(e, t) {
    return (
      t === void 0 && (t = !1),
      Cl(e) ||
        Me(e) ||
        !yt(e) ||
        (ja(e) > 1 && (e.set = e.add = e.clear = e.delete = $C),
        Object.freeze(e),
        t &&
          fa(
            e,
            function (r, a) {
              return Uo(a, !0);
            },
            !0
          )),
      e
    );
  }
  function $C() {
    Ge(2);
  }
  function Cl(e) {
    return e == null || typeof e != 'object' || Object.isFrozen(e);
  }
  function Tt(e) {
    var t = wl[e];
    return t || Ge(18, e), t;
  }
  function HC(e, t) {
    wl[e] || (wl[e] = t);
  }
  function xl() {
    return _o;
  }
  function Rl(e, t) {
    t && (Tt('Patches'), (e.u = []), (e.s = []), (e.v = t));
  }
  function Bi(e) {
    bl(e), e.p.forEach(zC), (e.p = null);
  }
  function bl(e) {
    e === _o && (_o = e.l);
  }
  function jp(e) {
    return (_o = {p: [], l: _o, h: e, m: !0, _: 0});
  }
  function zC(e) {
    var t = e[he];
    t.i === 0 || t.i === 1 ? t.j() : (t.O = !0);
  }
  function Fl(e, t) {
    t._ = t.p.length;
    var r = t.p[0],
      a = e !== void 0 && e !== r;
    return (
      t.h.g || Tt('ES5').S(t, e, a),
      a
        ? (r[he].P && (Bi(t), Ge(4)),
          yt(e) && ((e = _i(t, e)), t.l || $i(t, e)),
          t.u && Tt('Patches').M(r[he].t, e, t.u, t.s))
        : (e = _i(t, r, [])),
      Bi(t),
      t.u && t.v(t.u, t.s),
      e !== Wp ? e : void 0
    );
  }
  function _i(e, t, r) {
    if (Cl(t)) return t;
    var a = t[he];
    if (!a)
      return (
        fa(
          t,
          function (o, i) {
            return Up(e, a, t, o, i, r);
          },
          !0
        ),
        t
      );
    if (a.A !== e) return t;
    if (!a.P) return $i(e, a.t, !0), a.t;
    if (!a.I) {
      (a.I = !0), a.A._--;
      var n = a.i === 4 || a.i === 5 ? (a.o = vl(a.k)) : a.o;
      fa(a.i === 3 ? new Set(n) : n, function (o, i) {
        return Up(e, a, n, o, i, r);
      }),
        $i(e, n, !1),
        r && e.u && Tt('Patches').R(a, r, e.u, e.s);
    }
    return a.o;
  }
  function Up(e, t, r, a, n, o) {
    if (Me(n)) {
      var i = _i(
        e,
        n,
        o && t && t.i !== 3 && !Ua(t.D, a) ? o.concat(a) : void 0
      );
      if ((Qp(r, a, i), !Me(i))) return;
      e.m = !1;
    }
    if (yt(n) && !Cl(n)) {
      if (!e.h.F && e._ < 1) return;
      _i(e, n), (t && t.A.l) || $i(e, n);
    }
  }
  function $i(e, t, r) {
    r === void 0 && (r = !1), e.h.F && e.m && Uo(t, r);
  }
  function Al(e, t) {
    var r = e[he];
    return (r ? kr(r) : e)[t];
  }
  function Bp(e, t) {
    if (t in e)
      for (var r = Object.getPrototypeOf(e); r; ) {
        var a = Object.getOwnPropertyDescriptor(r, t);
        if (a) return a;
        r = Object.getPrototypeOf(r);
      }
  }
  function Or(e) {
    e.P || ((e.P = !0), e.l && Or(e.l));
  }
  function Pl(e) {
    e.o || (e.o = vl(e.t));
  }
  function Il(e, t, r) {
    var a = Sl(t)
      ? Tt('MapSet').N(t, r)
      : yl(t)
      ? Tt('MapSet').T(t, r)
      : e.g
      ? (function (n, o) {
          var i = Array.isArray(n),
            s = {
              i: i ? 1 : 0,
              A: o ? o.A : xl(),
              P: !1,
              I: !1,
              D: {},
              l: o,
              t: n,
              k: null,
              o: null,
              j: null,
              C: !1,
            },
            u = s,
            c = $o;
          i && ((u = [s]), (c = Ho));
          var l = Proxy.revocable(u, c),
            p = l.revoke,
            f = l.proxy;
          return (s.k = f), (s.j = p), f;
        })(t, r)
      : Tt('ES5').J(t, r);
    return (r ? r.A : xl()).p.push(a), a;
  }
  function Bo(e) {
    return (
      Me(e) || Ge(22, e),
      (function t(r) {
        if (!yt(r)) return r;
        var a,
          n = r[he],
          o = ja(r);
        if (n) {
          if (!n.P && (n.i < 4 || !Tt('ES5').K(n))) return n.t;
          (n.I = !0), (a = _p(r, o)), (n.I = !1);
        } else a = _p(r, o);
        return (
          fa(a, function (i, s) {
            (n && _C(n.t, i) === s) || Qp(a, i, t(s));
          }),
          o === 3 ? new Set(a) : a
        );
      })(e)
    );
  }
  function _p(e, t) {
    switch (t) {
      case 2:
        return new Map(e);
      case 3:
        return Array.from(e);
    }
    return vl(e);
  }
  function $p() {
    function e(i, s) {
      var u = o[i];
      return (
        u
          ? (u.enumerable = s)
          : (o[i] = u =
              {
                configurable: !0,
                enumerable: s,
                get: function () {
                  var c = this[he];
                  return $o.get(c, i);
                },
                set: function (c) {
                  var l = this[he];
                  $o.set(l, i, c);
                },
              }),
        u
      );
    }
    function t(i) {
      for (var s = i.length - 1; s >= 0; s--) {
        var u = i[s][he];
        if (!u.P)
          switch (u.i) {
            case 5:
              a(u) && Or(u);
              break;
            case 4:
              r(u) && Or(u);
          }
      }
    }
    function r(i) {
      for (var s = i.t, u = i.k, c = Ba(u), l = c.length - 1; l >= 0; l--) {
        var p = c[l];
        if (p !== he) {
          var f = s[p];
          if (f === void 0 && !Ua(s, p)) return !0;
          var d = u[p],
            m = d && d[he];
          if (m ? m.t !== f : !Lp(d, f)) return !0;
        }
      }
      var h = !!s[he];
      return c.length !== Ba(s).length + (h ? 0 : 1);
    }
    function a(i) {
      var s = i.k;
      if (s.length !== i.t.length) return !0;
      var u = Object.getOwnPropertyDescriptor(s, s.length - 1);
      if (u && !u.get) return !0;
      for (var c = 0; c < s.length; c++) if (!s.hasOwnProperty(c)) return !0;
      return !1;
    }
    function n(i) {
      i.O && Ge(3, JSON.stringify(kr(i)));
    }
    var o = {};
    HC('ES5', {
      J: function (i, s) {
        var u = Array.isArray(i),
          c = (function (p, f) {
            if (p) {
              for (var d = Array(f.length), m = 0; m < f.length; m++)
                Object.defineProperty(d, '' + m, e(m, !0));
              return d;
            }
            var h = Kp(f);
            delete h[he];
            for (var v = Ba(h), C = 0; C < v.length; C++) {
              var x = v[C];
              h[x] = e(x, p || !!h[x].enumerable);
            }
            return Object.create(Object.getPrototypeOf(f), h);
          })(u, i),
          l = {
            i: u ? 5 : 4,
            A: s ? s.A : xl(),
            P: !1,
            I: !1,
            D: {},
            l: s,
            t: i,
            k: c,
            o: null,
            O: !1,
            C: !1,
          };
        return Object.defineProperty(c, he, {value: l, writable: !0}), c;
      },
      S: function (i, s, u) {
        u
          ? Me(s) && s[he].A === i && t(i.p)
          : (i.u &&
              (function c(l) {
                if (l && typeof l == 'object') {
                  var p = l[he];
                  if (p) {
                    var f = p.t,
                      d = p.k,
                      m = p.D,
                      h = p.i;
                    if (h === 4)
                      fa(d, function (P) {
                        P !== he &&
                          (f[P] !== void 0 || Ua(f, P)
                            ? m[P] || c(d[P])
                            : ((m[P] = !0), Or(p)));
                      }),
                        fa(f, function (P) {
                          d[P] !== void 0 || Ua(d, P) || ((m[P] = !1), Or(p));
                        });
                    else if (h === 5) {
                      if (
                        (a(p) && (Or(p), (m.length = !0)), d.length < f.length)
                      )
                        for (var v = d.length; v < f.length; v++) m[v] = !1;
                      else for (var C = f.length; C < d.length; C++) m[C] = !0;
                      for (
                        var x = Math.min(d.length, f.length), b = 0;
                        b < x;
                        b++
                      )
                        d.hasOwnProperty(b) || (m[b] = !0),
                          m[b] === void 0 && c(d[b]);
                    }
                  }
                }
              })(i.p[0]),
            t(i.p));
      },
      K: function (i) {
        return i.i === 4 ? r(i) : a(i);
      },
    });
  }
  var Hp,
    _o,
    El = typeof Symbol != 'undefined' && typeof Symbol('x') == 'symbol',
    WC = typeof Map != 'undefined',
    YC = typeof Set != 'undefined',
    zp =
      typeof Proxy != 'undefined' &&
      Proxy.revocable !== void 0 &&
      typeof Reflect != 'undefined',
    Wp = El
      ? Symbol.for('immer-nothing')
      : (((Hp = {})['immer-nothing'] = !0), Hp),
    Yp = El ? Symbol.for('immer-draftable') : '__$immer_draftable',
    he = El ? Symbol.for('immer-state') : '__$immer_state',
    jk = (typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator';
  var KC = '' + Object.prototype.constructor,
    Ba =
      typeof Reflect != 'undefined' && Reflect.ownKeys
        ? Reflect.ownKeys
        : Object.getOwnPropertySymbols !== void 0
        ? function (e) {
            return Object.getOwnPropertyNames(e).concat(
              Object.getOwnPropertySymbols(e)
            );
          }
        : Object.getOwnPropertyNames,
    Kp =
      Object.getOwnPropertyDescriptors ||
      function (e) {
        var t = {};
        return (
          Ba(e).forEach(function (r) {
            t[r] = Object.getOwnPropertyDescriptor(e, r);
          }),
          t
        );
      },
    wl = {},
    $o = {
      get: function (e, t) {
        if (t === he) return e;
        var r = kr(e);
        if (!Ua(r, t))
          return (function (n, o, i) {
            var s,
              u = Bp(o, i);
            return u
              ? 'value' in u
                ? u.value
                : (s = u.get) === null || s === void 0
                ? void 0
                : s.call(n.k)
              : void 0;
          })(e, r, t);
        var a = r[t];
        return e.I || !yt(a)
          ? a
          : a === Al(e.t, t)
          ? (Pl(e), (e.o[t] = Il(e.A.h, a, e)))
          : a;
      },
      has: function (e, t) {
        return t in kr(e);
      },
      ownKeys: function (e) {
        return Reflect.ownKeys(kr(e));
      },
      set: function (e, t, r) {
        var a = Bp(kr(e), t);
        if (a == null ? void 0 : a.set) return a.set.call(e.k, r), !0;
        if (!e.P) {
          var n = Al(kr(e), t),
            o = n == null ? void 0 : n[he];
          if (o && o.t === r) return (e.o[t] = r), (e.D[t] = !1), !0;
          if (Lp(r, n) && (r !== void 0 || Ua(e.t, t))) return !0;
          Pl(e), Or(e);
        }
        return (
          (e.o[t] === r &&
            typeof r != 'number' &&
            (r !== void 0 || t in e.o)) ||
          ((e.o[t] = r), (e.D[t] = !0), !0)
        );
      },
      deleteProperty: function (e, t) {
        return (
          Al(e.t, t) !== void 0 || t in e.t
            ? ((e.D[t] = !1), Pl(e), Or(e))
            : delete e.D[t],
          e.o && delete e.o[t],
          !0
        );
      },
      getOwnPropertyDescriptor: function (e, t) {
        var r = kr(e),
          a = Reflect.getOwnPropertyDescriptor(r, t);
        return (
          a && {
            writable: !0,
            configurable: e.i !== 1 || t !== 'length',
            enumerable: a.enumerable,
            value: r[t],
          }
        );
      },
      defineProperty: function () {
        Ge(11);
      },
      getPrototypeOf: function (e) {
        return Object.getPrototypeOf(e.t);
      },
      setPrototypeOf: function () {
        Ge(12);
      },
    },
    Ho = {};
  fa($o, function (e, t) {
    Ho[e] = function () {
      return (arguments[0] = arguments[0][0]), t.apply(this, arguments);
    };
  }),
    (Ho.deleteProperty = function (e, t) {
      return Ho.set.call(this, e, t, void 0);
    }),
    (Ho.set = function (e, t, r) {
      return $o.set.call(this, e[0], t, r, e[0]);
    });
  var GC = (function () {
      function e(r) {
        var a = this;
        (this.g = zp),
          (this.F = !0),
          (this.produce = function (n, o, i) {
            if (typeof n == 'function' && typeof o != 'function') {
              var s = o;
              o = n;
              var u = a;
              return function (h) {
                var v = this;
                h === void 0 && (h = s);
                for (
                  var C = arguments.length, x = Array(C > 1 ? C - 1 : 0), b = 1;
                  b < C;
                  b++
                )
                  x[b - 1] = arguments[b];
                return u.produce(h, function (P) {
                  var _;
                  return (_ = o).call.apply(_, [v, P].concat(x));
                });
              };
            }
            var c;
            if (
              (typeof o != 'function' && Ge(6),
              i !== void 0 && typeof i != 'function' && Ge(7),
              yt(n))
            ) {
              var l = jp(a),
                p = Il(a, n, void 0),
                f = !0;
              try {
                (c = o(p)), (f = !1);
              } finally {
                f ? Bi(l) : bl(l);
              }
              return typeof Promise != 'undefined' && c instanceof Promise
                ? c.then(
                    function (h) {
                      return Rl(l, i), Fl(h, l);
                    },
                    function (h) {
                      throw (Bi(l), h);
                    }
                  )
                : (Rl(l, i), Fl(c, l));
            }
            if (!n || typeof n != 'object') {
              if (
                ((c = o(n)) === void 0 && (c = n),
                c === Wp && (c = void 0),
                a.F && Uo(c, !0),
                i)
              ) {
                var d = [],
                  m = [];
                Tt('Patches').M(n, c, d, m), i(d, m);
              }
              return c;
            }
            Ge(21, n);
          }),
          (this.produceWithPatches = function (n, o) {
            if (typeof n == 'function')
              return function (c) {
                for (
                  var l = arguments.length, p = Array(l > 1 ? l - 1 : 0), f = 1;
                  f < l;
                  f++
                )
                  p[f - 1] = arguments[f];
                return a.produceWithPatches(c, function (d) {
                  return n.apply(void 0, [d].concat(p));
                });
              };
            var i,
              s,
              u = a.produce(n, o, function (c, l) {
                (i = c), (s = l);
              });
            return typeof Promise != 'undefined' && u instanceof Promise
              ? u.then(function (c) {
                  return [c, i, s];
                })
              : [u, i, s];
          }),
          typeof (r == null ? void 0 : r.useProxies) == 'boolean' &&
            this.setUseProxies(r.useProxies),
          typeof (r == null ? void 0 : r.autoFreeze) == 'boolean' &&
            this.setAutoFreeze(r.autoFreeze);
      }
      var t = e.prototype;
      return (
        (t.createDraft = function (r) {
          yt(r) || Ge(8), Me(r) && (r = Bo(r));
          var a = jp(this),
            n = Il(this, r, void 0);
          return (n[he].C = !0), bl(a), n;
        }),
        (t.finishDraft = function (r, a) {
          var n = r && r[he],
            o = n.A;
          return Rl(o, a), Fl(void 0, o);
        }),
        (t.setAutoFreeze = function (r) {
          this.F = r;
        }),
        (t.setUseProxies = function (r) {
          r && !zp && Ge(20), (this.g = r);
        }),
        (t.applyPatches = function (r, a) {
          var n;
          for (n = a.length - 1; n >= 0; n--) {
            var o = a[n];
            if (o.path.length === 0 && o.op === 'replace') {
              r = o.value;
              break;
            }
          }
          n > -1 && (a = a.slice(n + 1));
          var i = Tt('Patches').$;
          return Me(r)
            ? i(r, a)
            : this.produce(r, function (s) {
                return i(s, a);
              });
        }),
        e
      );
    })(),
    Je = new GC(),
    JC = Je.produce,
    Uk = Je.produceWithPatches.bind(Je),
    Bk = Je.setAutoFreeze.bind(Je),
    _k = Je.setUseProxies.bind(Je),
    $k = Je.applyPatches.bind(Je),
    Hk = Je.createDraft.bind(Je),
    zk = Je.finishDraft.bind(Je),
    qr = JC;
  R(g, be(Ko()));
  var Hi = 'NOT_FOUND';
  function ux(e) {
    var t;
    return {
      get: function (a) {
        return t && e(t.key, a) ? t.value : Hi;
      },
      put: function (a, n) {
        t = {key: a, value: n};
      },
      getEntries: function () {
        return t ? [t] : [];
      },
      clear: function () {
        t = void 0;
      },
    };
  }
  function lx(e, t) {
    var r = [];
    function a(s) {
      var u = r.findIndex(function (l) {
        return t(s, l.key);
      });
      if (u > -1) {
        var c = r[u];
        return u > 0 && (r.splice(u, 1), r.unshift(c)), c.value;
      }
      return Hi;
    }
    function n(s, u) {
      a(s) === Hi && (r.unshift({key: s, value: u}), r.length > e && r.pop());
    }
    function o() {
      return r;
    }
    function i() {
      r = [];
    }
    return {get: a, put: n, getEntries: o, clear: i};
  }
  var af = function (t, r) {
    return t === r;
  };
  function dx(e) {
    return function (r, a) {
      if (r === null || a === null || r.length !== a.length) return !1;
      for (var n = r.length, o = 0; o < n; o++) if (!e(r[o], a[o])) return !1;
      return !0;
    };
  }
  function nf(e, t) {
    var r = typeof t == 'object' ? t : {equalityCheck: t},
      a = r.equalityCheck,
      n = a === void 0 ? af : a,
      o = r.maxSize,
      i = o === void 0 ? 1 : o,
      s = r.resultEqualityCheck,
      u = dx(n),
      c = i === 1 ? ux(u) : lx(i, u);
    function l() {
      var p = c.get(arguments);
      if (p === Hi) {
        if (((p = e.apply(null, arguments)), s)) {
          var f = c.getEntries(),
            d = f.find(function (m) {
              return s(m.value, p);
            });
          d && (p = d.value);
        }
        c.put(arguments, p);
      }
      return p;
    }
    return (
      (l.clearCache = function () {
        return c.clear();
      }),
      l
    );
  }
  function px(e) {
    var t = Array.isArray(e[0]) ? e[0] : e;
    if (
      !t.every(function (a) {
        return typeof a == 'function';
      })
    ) {
      var r = t
        .map(function (a) {
          return typeof a == 'function'
            ? 'function ' + (a.name || 'unnamed') + '()'
            : typeof a;
        })
        .join(', ');
      throw new Error(
        'createSelector expects all input-selectors to be functions, but received the following types: [' +
          r +
          ']'
      );
    }
    return t;
  }
  function fx(e) {
    for (
      var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), a = 1;
      a < t;
      a++
    )
      r[a - 1] = arguments[a];
    var n = function () {
      for (var i = arguments.length, s = new Array(i), u = 0; u < i; u++)
        s[u] = arguments[u];
      var c = 0,
        l,
        p = {memoizeOptions: void 0},
        f = s.pop();
      if (
        (typeof f == 'object' && ((p = f), (f = s.pop())),
        typeof f != 'function')
      )
        throw new Error(
          'createSelector expects an output function after the inputs, but received: [' +
            typeof f +
            ']'
        );
      var d = p,
        m = d.memoizeOptions,
        h = m === void 0 ? r : m,
        v = Array.isArray(h) ? h : [h],
        C = px(s),
        x = e.apply(
          void 0,
          [
            function () {
              return c++, f.apply(null, arguments);
            },
          ].concat(v)
        ),
        b = e(function () {
          for (var _ = [], X = C.length, H = 0; H < X; H++)
            _.push(C[H].apply(null, arguments));
          return (l = x.apply(null, _)), l;
        });
      return (
        Object.assign(b, {
          resultFunc: f,
          memoizedResultFunc: x,
          dependencies: C,
          lastResult: function () {
            return l;
          },
          recomputations: function () {
            return c;
          },
          resetRecomputations: function () {
            return (c = 0);
          },
        }),
        b
      );
    };
    return n;
  }
  var zi = fx(nf);
  var Tr = be(Ko()),
    Tl = be(Ko());
  function of(e) {
    var t = function (a) {
      var n = a.dispatch,
        o = a.getState;
      return function (i) {
        return function (s) {
          return typeof s == 'function' ? s(n, o, e) : i(s);
        };
      };
    };
    return t;
  }
  var sf = of();
  sf.withExtraArgument = of;
  var Go = sf;
  var mx = (function () {
      var e = function (t, r) {
        return (
          (e =
            Object.setPrototypeOf ||
            ({__proto__: []} instanceof Array &&
              function (a, n) {
                a.__proto__ = n;
              }) ||
            function (a, n) {
              for (var o in n)
                Object.prototype.hasOwnProperty.call(n, o) && (a[o] = n[o]);
            }),
          e(t, r)
        );
      };
      return function (t, r) {
        if (typeof r != 'function' && r !== null)
          throw new TypeError(
            'Class extends value ' + String(r) + ' is not a constructor or null'
          );
        e(t, r);
        function a() {
          this.constructor = t;
        }
        t.prototype =
          r === null
            ? Object.create(r)
            : ((a.prototype = r.prototype), new a());
      };
    })(),
    Jo = function (e, t) {
      var r = {
          label: 0,
          sent: function () {
            if (o[0] & 1) throw o[1];
            return o[1];
          },
          trys: [],
          ops: [],
        },
        a,
        n,
        o,
        i;
      return (
        (i = {next: s(0), throw: s(1), return: s(2)}),
        typeof Symbol == 'function' &&
          (i[Symbol.iterator] = function () {
            return this;
          }),
        i
      );
      function s(c) {
        return function (l) {
          return u([c, l]);
        };
      }
      function u(c) {
        if (a) throw new TypeError('Generator is already executing.');
        for (; r; )
          try {
            if (
              ((a = 1),
              n &&
                (o =
                  c[0] & 2
                    ? n.return
                    : c[0]
                    ? n.throw || ((o = n.return) && o.call(n), 0)
                    : n.next) &&
                !(o = o.call(n, c[1])).done)
            )
              return o;
            switch (((n = 0), o && (c = [c[0] & 2, o.value]), c[0])) {
              case 0:
              case 1:
                o = c;
                break;
              case 4:
                return r.label++, {value: c[1], done: !1};
              case 5:
                r.label++, (n = c[1]), (c = [0]);
                continue;
              case 7:
                (c = r.ops.pop()), r.trys.pop();
                continue;
              default:
                if (
                  ((o = r.trys),
                  !(o = o.length > 0 && o[o.length - 1]) &&
                    (c[0] === 6 || c[0] === 2))
                ) {
                  r = 0;
                  continue;
                }
                if (c[0] === 3 && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                  r.label = c[1];
                  break;
                }
                if (c[0] === 6 && r.label < o[1]) {
                  (r.label = o[1]), (o = c);
                  break;
                }
                if (o && r.label < o[2]) {
                  (r.label = o[2]), r.ops.push(c);
                  break;
                }
                o[2] && r.ops.pop(), r.trys.pop();
                continue;
            }
            c = t.call(e, r);
          } catch (l) {
            (c = [6, l]), (n = 0);
          } finally {
            a = o = 0;
          }
        if (c[0] & 5) throw c[1];
        return {value: c[0] ? c[1] : void 0, done: !0};
      }
    },
    _a = function (e, t) {
      for (var r = 0, a = t.length, n = e.length; r < a; r++, n++) e[n] = t[r];
      return e;
    },
    gx = Object.defineProperty,
    hx = Object.defineProperties,
    Sx = Object.getOwnPropertyDescriptors,
    cf = Object.getOwnPropertySymbols,
    yx = Object.prototype.hasOwnProperty,
    vx = Object.prototype.propertyIsEnumerable,
    uf = function (e, t, r) {
      return t in e
        ? gx(e, t, {enumerable: !0, configurable: !0, writable: !0, value: r})
        : (e[t] = r);
    },
    He = function (e, t) {
      for (var r in t || (t = {})) yx.call(t, r) && uf(e, r, t[r]);
      if (cf)
        for (var a = 0, n = cf(t); a < n.length; a++) {
          var r = n[a];
          vx.call(t, r) && uf(e, r, t[r]);
        }
      return e;
    },
    ql = function (e, t) {
      return hx(e, Sx(t));
    },
    Xo = function (e, t, r) {
      return new Promise(function (a, n) {
        var o = function (u) {
            try {
              s(r.next(u));
            } catch (c) {
              n(c);
            }
          },
          i = function (u) {
            try {
              s(r.throw(u));
            } catch (c) {
              n(c);
            }
          },
          s = function (u) {
            return u.done ? a(u.value) : Promise.resolve(u.value).then(o, i);
          };
        s((r = r.apply(e, t)).next());
      });
    },
    mr = function () {
      for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
      var r = zi.apply(void 0, e),
        a = function (n) {
          for (var o = [], i = 1; i < arguments.length; i++)
            o[i - 1] = arguments[i];
          return r.apply(void 0, _a([Me(n) ? Bo(n) : n], o));
        };
      return a;
    },
    Cx =
      typeof window != 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : function () {
            if (arguments.length !== 0)
              return typeof arguments[0] == 'object'
                ? Tl.compose
                : Tl.compose.apply(null, arguments);
          },
    iO =
      typeof window != 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__
        : function () {
            return function (e) {
              return e;
            };
          };
  function Wi(e) {
    if (typeof e != 'object' || e === null) return !1;
    var t = Object.getPrototypeOf(e);
    if (t === null) return !0;
    for (var r = t; Object.getPrototypeOf(r) !== null; )
      r = Object.getPrototypeOf(r);
    return t === r;
  }
  function lf(e, t) {
    var r = 0;
    return {
      measureTime: function (a) {
        var n = Date.now();
        try {
          return a();
        } finally {
          var o = Date.now();
          r += o - n;
        }
      },
      warnIfExceeded: function () {
        r > e &&
          console.warn(
            t +
              ' took ' +
              r +
              'ms, which is more than the warning threshold of ' +
              e +
              `ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`
          );
      },
    };
  }
  var df = (function (e) {
    mx(t, e);
    function t() {
      for (var r = [], a = 0; a < arguments.length; a++) r[a] = arguments[a];
      var n = e.apply(this, r) || this;
      return Object.setPrototypeOf(n, t.prototype), n;
    }
    return (
      Object.defineProperty(t, Symbol.species, {
        get: function () {
          return t;
        },
        enumerable: !1,
        configurable: !0,
      }),
      (t.prototype.concat = function () {
        for (var r = [], a = 0; a < arguments.length; a++) r[a] = arguments[a];
        return e.prototype.concat.apply(this, r);
      }),
      (t.prototype.prepend = function () {
        for (var r = [], a = 0; a < arguments.length; a++) r[a] = arguments[a];
        return r.length === 1 && Array.isArray(r[0])
          ? new (t.bind.apply(t, _a([void 0], r[0].concat(this))))()
          : new (t.bind.apply(t, _a([void 0], r.concat(this))))();
      }),
      t
    );
  })(Array);
  function Dl(e) {
    return yt(e) ? qr(e, function () {}) : e;
  }
  var xx = !0,
    pf = 'Invariant failed';
  function ff(e, t) {
    if (!e) throw xx ? new Error(pf) : new Error(pf + ': ' + (t || ''));
  }
  function Rx(e, t, r, a) {
    return JSON.stringify(e, bx(t, a), r);
  }
  function bx(e, t) {
    var r = [],
      a = [];
    return (
      t ||
        (t = function (n, o) {
          return r[0] === o
            ? '[Circular ~]'
            : '[Circular ~.' + a.slice(0, r.indexOf(o)).join('.') + ']';
        }),
      function (n, o) {
        if (r.length > 0) {
          var i = r.indexOf(this);
          ~i ? r.splice(i + 1) : r.push(this),
            ~i ? a.splice(i, 1 / 0, n) : a.push(n),
            ~r.indexOf(o) && (o = t.call(this, n, o));
        } else r.push(o);
        return e == null ? o : e.call(this, n, o);
      }
    );
  }
  function mf(e) {
    return typeof e != 'object' || e == null || Object.isFrozen(e);
  }
  function Fx(e, t, r) {
    var a = gf(e, t, r);
    return {
      detectMutations: function () {
        return hf(e, t, a, r);
      },
    };
  }
  function gf(e, t, r, a) {
    t === void 0 && (t = []), a === void 0 && (a = '');
    var n = {value: r};
    if (!e(r)) {
      n.children = {};
      for (var o in r) {
        var i = a ? a + '.' + o : o;
        (t.length && t.indexOf(i) !== -1) ||
          (n.children[o] = gf(e, t, r[o], i));
      }
    }
    return n;
  }
  function hf(e, t, r, a, n, o) {
    t === void 0 && (t = []),
      n === void 0 && (n = !1),
      o === void 0 && (o = '');
    var i = r ? r.value : void 0,
      s = i === a;
    if (n && !s && !Number.isNaN(a)) return {wasMutated: !0, path: o};
    if (e(i) || e(a)) return {wasMutated: !1};
    var u = {};
    for (var c in r.children) u[c] = !0;
    for (var c in a) u[c] = !0;
    for (var c in u) {
      var l = o ? o + '.' + c : c;
      if (!(t.length && t.indexOf(l) !== -1)) {
        var p = hf(e, t, r.children[c], a[c], s, l);
        if (p.wasMutated) return p;
      }
    }
    return {wasMutated: !1};
  }
  function Ax(e) {
    return (
      e === void 0 && (e = {}),
      function () {
        return function (u) {
          return function (c) {
            return u(c);
          };
        };
      }
    );
    var t = e.isImmutable,
      r = t === void 0 ? mf : t,
      a = e.ignoredPaths,
      n = e.warnAfter,
      o = n === void 0 ? 32 : n,
      i = e.ignore;
    a = a || i;
    var s = Fx.bind(null, r, a);
    return function (u) {
      var c = u.getState,
        l = c(),
        p = s(l),
        f;
      return function (d) {
        return function (m) {
          var h = lf(o, 'ImmutableStateInvariantMiddleware');
          h.measureTime(function () {
            (l = c()),
              (f = p.detectMutations()),
              (p = s(l)),
              ff(
                !f.wasMutated,
                "A state mutation was detected between dispatches, in the path '" +
                  (f.path || '') +
                  "'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)"
              );
          });
          var v = d(m);
          return (
            h.measureTime(function () {
              (l = c()),
                (f = p.detectMutations()),
                (p = s(l)),
                f.wasMutated &&
                  ff(
                    !f.wasMutated,
                    'A state mutation was detected inside a dispatch, in the path: ' +
                      (f.path || '') +
                      '. Take a look at the reducer(s) handling the action ' +
                      Rx(m) +
                      '. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)'
                  );
            }),
            h.warnIfExceeded(),
            v
          );
        };
      };
    };
  }
  function Vl(e) {
    var t = typeof e;
    return (
      e == null ||
      t === 'string' ||
      t === 'boolean' ||
      t === 'number' ||
      Array.isArray(e) ||
      Wi(e)
    );
  }
  function Yi(e, t, r, a, n) {
    t === void 0 && (t = ''),
      r === void 0 && (r = Vl),
      n === void 0 && (n = []);
    var o;
    if (!r(e)) return {keyPath: t || '<root>', value: e};
    if (typeof e != 'object' || e === null) return !1;
    for (
      var i = a != null ? a(e) : Object.entries(e),
        s = n.length > 0,
        u = 0,
        c = i;
      u < c.length;
      u++
    ) {
      var l = c[u],
        p = l[0],
        f = l[1],
        d = t ? t + '.' + p : p;
      if (!(s && n.indexOf(d) >= 0)) {
        if (!r(f)) return {keyPath: d, value: f};
        if (typeof f == 'object' && ((o = Yi(f, d, r, a, n)), o)) return o;
      }
    }
    return !1;
  }
  function Px(e) {
    return (
      e === void 0 && (e = {}),
      function () {
        return function (v) {
          return function (C) {
            return v(C);
          };
        };
      }
    );
    var t = e.isSerializable,
      r = t === void 0 ? Vl : t,
      a = e.getEntries,
      n = e.ignoredActions,
      o = n === void 0 ? [] : n,
      i = e.ignoredActionPaths,
      s = i === void 0 ? ['meta.arg', 'meta.baseQueryMeta'] : i,
      u = e.ignoredPaths,
      c = u === void 0 ? [] : u,
      l = e.warnAfter,
      p = l === void 0 ? 32 : l,
      f = e.ignoreState,
      d = f === void 0 ? !1 : f,
      m = e.ignoreActions,
      h = m === void 0 ? !1 : m;
    return function (v) {
      return function (C) {
        return function (x) {
          var b = C(x),
            P = lf(p, 'SerializableStateInvariantMiddleware');
          return (
            !h &&
              !(o.length && o.indexOf(x.type) !== -1) &&
              P.measureTime(function () {
                var _ = Yi(x, '', r, a, s);
                if (_) {
                  var X = _.keyPath,
                    H = _.value;
                  console.error(
                    'A non-serializable value was detected in an action, in the path: `' +
                      X +
                      '`. Value:',
                    H,
                    `
Take a look at the logic that dispatched this action: `,
                    x,
                    `
(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)`,
                    `
(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)`
                  );
                }
              }),
            d ||
              (P.measureTime(function () {
                var _ = v.getState(),
                  X = Yi(_, '', r, a, c);
                if (X) {
                  var H = X.keyPath,
                    I = X.value;
                  console.error(
                    'A non-serializable value was detected in the state, in the path: `' +
                      H +
                      '`. Value:',
                    I,
                    `
Take a look at the reducer(s) handling this action type: ` +
                      x.type +
                      `.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`
                  );
                }
              }),
              P.warnIfExceeded()),
            b
          );
        };
      };
    };
  }
  function Ix(e) {
    return typeof e == 'boolean';
  }
  function Ex() {
    return function (t) {
      return Ki(t);
    };
  }
  function Ki(e) {
    e === void 0 && (e = {});
    var t = e.thunk,
      r = t === void 0 ? !0 : t,
      a = e.immutableCheck,
      n = a === void 0 ? !0 : a,
      o = e.serializableCheck,
      i = o === void 0 ? !0 : o,
      s = new df();
    if (
      (r &&
        (Ix(r) ? s.push(Go) : s.push(Go.withExtraArgument(r.extraArgument))),
      !1)
    ) {
      if (n) var u;
      if (i) var c;
    }
    return s;
  }
  var Nl = !0;
  function Ml(e) {
    var t = Ex(),
      r = e || {},
      a = r.reducer,
      n = a === void 0 ? void 0 : a,
      o = r.middleware,
      i = o === void 0 ? t() : o,
      s = r.devTools,
      u = s === void 0 ? !0 : s,
      c = r.preloadedState,
      l = c === void 0 ? void 0 : c,
      p = r.enhancers,
      f = p === void 0 ? void 0 : p,
      d;
    if (typeof n == 'function') d = n;
    else if (Wi(n)) d = (0, Tr.combineReducers)(n);
    else
      throw new Error(
        '"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers'
      );
    var m = i;
    if (typeof m == 'function' && ((m = m(t)), !Nl && !Array.isArray(m)))
      throw new Error(
        'when using a middleware builder function, an array of middleware must be returned'
      );
    if (
      !Nl &&
      m.some(function (b) {
        return typeof b != 'function';
      })
    )
      throw new Error(
        'each middleware provided to configureStore must be a function'
      );
    var h = Tr.applyMiddleware.apply(void 0, m),
      v = Tr.compose;
    u && (v = Cx(He({trace: !Nl}, typeof u == 'object' && u)));
    var C = [h];
    Array.isArray(f) ? (C = _a([h], f)) : typeof f == 'function' && (C = f(C));
    var x = v.apply(void 0, C);
    return (0, Tr.createStore)(d, l, x);
  }
  function S(e, t) {
    function r() {
      for (var a = [], n = 0; n < arguments.length; n++) a[n] = arguments[n];
      if (t) {
        var o = t.apply(void 0, a);
        if (!o) throw new Error('prepareAction did not return an object');
        return He(
          He({type: e, payload: o.payload}, 'meta' in o && {meta: o.meta}),
          'error' in o && {error: o.error}
        );
      }
      return {type: e, payload: a[0]};
    }
    return (
      (r.toString = function () {
        return '' + e;
      }),
      (r.type = e),
      (r.match = function (a) {
        return a.type === e;
      }),
      r
    );
  }
  function wx(e) {
    return Wi(e) && typeof e.type == 'string' && Object.keys(e).every(kx);
  }
  function kx(e) {
    return ['type', 'payload', 'error', 'meta'].indexOf(e) > -1;
  }
  function Ox(e) {
    return '' + e;
  }
  function Sf(e) {
    var t = {},
      r = [],
      a,
      n = {
        addCase: function (o, i) {
          var s = typeof o == 'string' ? o : o.type;
          if (s in t)
            throw new Error(
              'addCase cannot be called with two reducers for the same action type'
            );
          return (t[s] = i), n;
        },
        addMatcher: function (o, i) {
          return r.push({matcher: o, reducer: i}), n;
        },
        addDefaultCase: function (o) {
          return (a = o), n;
        },
      };
    return e(n), [t, r, a];
  }
  function qx(e) {
    return typeof e == 'function';
  }
  function k(e, t, r, a) {
    r === void 0 && (r = []);
    var n = typeof t == 'function' ? Sf(t) : [t, r, a],
      o = n[0],
      i = n[1],
      s = n[2],
      u;
    if (qx(e))
      u = function () {
        return Dl(e());
      };
    else {
      var c = Dl(e);
      u = function () {
        return c;
      };
    }
    function l(p, f) {
      p === void 0 && (p = u());
      var d = _a(
        [o[f.type]],
        i
          .filter(function (m) {
            var h = m.matcher;
            return h(f);
          })
          .map(function (m) {
            var h = m.reducer;
            return h;
          })
      );
      return (
        d.filter(function (m) {
          return !!m;
        }).length === 0 && (d = [s]),
        d.reduce(function (m, h) {
          if (h)
            if (Me(m)) {
              var v = m,
                C = h(v, f);
              return C === void 0 ? m : C;
            } else {
              if (yt(m))
                return qr(m, function (x) {
                  return h(x, f);
                });
              var C = h(m, f);
              if (C === void 0) {
                if (m === null) return m;
                throw Error(
                  'A case reducer on a non-draftable value must not return undefined'
                );
              }
              return C;
            }
          return m;
        }, p)
      );
    }
    return (l.getInitialState = u), l;
  }
  function Tx(e, t) {
    return e + '/' + t;
  }
  function Dx(e) {
    var t = e.name;
    if (!t) throw new Error('`name` is a required option for createSlice');
    var r =
        typeof e.initialState == 'function'
          ? e.initialState
          : Dl(e.initialState),
      a = e.reducers || {},
      n = Object.keys(a),
      o = {},
      i = {},
      s = {};
    n.forEach(function (l) {
      var p = a[l],
        f = Tx(t, l),
        d,
        m;
      'reducer' in p ? ((d = p.reducer), (m = p.prepare)) : (d = p),
        (o[l] = d),
        (i[f] = d),
        (s[l] = m ? S(f, m) : S(f));
    });
    function u() {
      var l =
          typeof e.extraReducers == 'function'
            ? Sf(e.extraReducers)
            : [e.extraReducers],
        p = l[0],
        f = p === void 0 ? {} : p,
        d = l[1],
        m = d === void 0 ? [] : d,
        h = l[2],
        v = h === void 0 ? void 0 : h,
        C = He(He({}, f), i);
      return k(r, C, m, v);
    }
    var c;
    return {
      name: t,
      reducer: function (l, p) {
        return c || (c = u()), c(l, p);
      },
      actions: s,
      caseReducers: o,
      getInitialState: function () {
        return c || (c = u()), c.getInitialState();
      },
    };
  }
  function Vx() {
    return {ids: [], entities: {}};
  }
  function Nx() {
    function e(t) {
      return t === void 0 && (t = {}), Object.assign(Vx(), t);
    }
    return {getInitialState: e};
  }
  function Mx() {
    function e(t) {
      var r = function (c) {
          return c.ids;
        },
        a = function (c) {
          return c.entities;
        },
        n = mr(r, a, function (c, l) {
          return c.map(function (p) {
            return l[p];
          });
        }),
        o = function (c, l) {
          return l;
        },
        i = function (c, l) {
          return c[l];
        },
        s = mr(r, function (c) {
          return c.length;
        });
      if (!t)
        return {
          selectIds: r,
          selectEntities: a,
          selectAll: n,
          selectTotal: s,
          selectById: mr(a, o, i),
        };
      var u = mr(t, a);
      return {
        selectIds: mr(t, r),
        selectEntities: u,
        selectAll: mr(t, n),
        selectTotal: mr(t, s),
        selectById: mr(u, o, i),
      };
    }
    return {getSelectors: e};
  }
  function Qx(e) {
    var t = Ce(function (r, a) {
      return e(a);
    });
    return function (a) {
      return t(a, void 0);
    };
  }
  function Ce(e) {
    return function (r, a) {
      function n(i) {
        return wx(i);
      }
      var o = function (i) {
        n(a) ? e(a.payload, i) : e(a, i);
      };
      return Me(r) ? (o(r), r) : qr(r, o);
    };
  }
  function Zo(e, t) {
    var r = t(e);
    return r;
  }
  function ma(e) {
    return Array.isArray(e) || (e = Object.values(e)), e;
  }
  function yf(e, t, r) {
    e = ma(e);
    for (var a = [], n = [], o = 0, i = e; o < i.length; o++) {
      var s = i[o],
        u = Zo(s, t);
      u in r.entities ? n.push({id: u, changes: s}) : a.push(s);
    }
    return [a, n];
  }
  function vf(e) {
    function t(m, h) {
      var v = Zo(m, e);
      v in h.entities || (h.ids.push(v), (h.entities[v] = m));
    }
    function r(m, h) {
      m = ma(m);
      for (var v = 0, C = m; v < C.length; v++) {
        var x = C[v];
        t(x, h);
      }
    }
    function a(m, h) {
      var v = Zo(m, e);
      v in h.entities || h.ids.push(v), (h.entities[v] = m);
    }
    function n(m, h) {
      m = ma(m);
      for (var v = 0, C = m; v < C.length; v++) {
        var x = C[v];
        a(x, h);
      }
    }
    function o(m, h) {
      (m = ma(m)), (h.ids = []), (h.entities = {}), r(m, h);
    }
    function i(m, h) {
      return s([m], h);
    }
    function s(m, h) {
      var v = !1;
      m.forEach(function (C) {
        C in h.entities && (delete h.entities[C], (v = !0));
      }),
        v &&
          (h.ids = h.ids.filter(function (C) {
            return C in h.entities;
          }));
    }
    function u(m) {
      Object.assign(m, {ids: [], entities: {}});
    }
    function c(m, h, v) {
      var C = v.entities[h.id],
        x = Object.assign({}, C, h.changes),
        b = Zo(x, e),
        P = b !== h.id;
      return (
        P && ((m[h.id] = b), delete v.entities[h.id]), (v.entities[b] = x), P
      );
    }
    function l(m, h) {
      return p([m], h);
    }
    function p(m, h) {
      var v = {},
        C = {};
      m.forEach(function (P) {
        P.id in h.entities &&
          (C[P.id] = {
            id: P.id,
            changes: He(He({}, C[P.id] ? C[P.id].changes : null), P.changes),
          });
      }),
        (m = Object.values(C));
      var x = m.length > 0;
      if (x) {
        var b =
          m.filter(function (P) {
            return c(v, P, h);
          }).length > 0;
        b && (h.ids = Object.keys(h.entities));
      }
    }
    function f(m, h) {
      return d([m], h);
    }
    function d(m, h) {
      var v = yf(m, e, h),
        C = v[0],
        x = v[1];
      p(x, h), r(C, h);
    }
    return {
      removeAll: Qx(u),
      addOne: Ce(t),
      addMany: Ce(r),
      setOne: Ce(a),
      setMany: Ce(n),
      setAll: Ce(o),
      updateOne: Ce(l),
      updateMany: Ce(p),
      upsertOne: Ce(f),
      upsertMany: Ce(d),
      removeOne: Ce(i),
      removeMany: Ce(s),
    };
  }
  function Lx(e, t) {
    var r = vf(e),
      a = r.removeOne,
      n = r.removeMany,
      o = r.removeAll;
    function i(x, b) {
      return s([x], b);
    }
    function s(x, b) {
      x = ma(x);
      var P = x.filter(function (_) {
        return !(Zo(_, e) in b.entities);
      });
      P.length !== 0 && v(P, b);
    }
    function u(x, b) {
      return c([x], b);
    }
    function c(x, b) {
      (x = ma(x)), x.length !== 0 && v(x, b);
    }
    function l(x, b) {
      (x = ma(x)), (b.entities = {}), (b.ids = []), s(x, b);
    }
    function p(x, b) {
      return f([x], b);
    }
    function f(x, b) {
      for (var P = !1, _ = 0, X = x; _ < X.length; _++) {
        var H = X[_],
          I = b.entities[H.id];
        if (!!I) {
          (P = !0), Object.assign(I, H.changes);
          var $ = e(I);
          H.id !== $ && (delete b.entities[H.id], (b.entities[$] = I));
        }
      }
      P && C(b);
    }
    function d(x, b) {
      return m([x], b);
    }
    function m(x, b) {
      var P = yf(x, e, b),
        _ = P[0],
        X = P[1];
      f(X, b), s(_, b);
    }
    function h(x, b) {
      if (x.length !== b.length) return !1;
      for (var P = 0; P < x.length && P < b.length; P++)
        if (x[P] !== b[P]) return !1;
      return !0;
    }
    function v(x, b) {
      x.forEach(function (P) {
        b.entities[e(P)] = P;
      }),
        C(b);
    }
    function C(x) {
      var b = Object.values(x.entities);
      b.sort(t);
      var P = b.map(e),
        _ = x.ids;
      h(_, P) || (x.ids = P);
    }
    return {
      removeOne: a,
      removeMany: n,
      removeAll: o,
      addOne: Ce(i),
      updateOne: Ce(p),
      upsertOne: Ce(d),
      setOne: Ce(u),
      setMany: Ce(c),
      setAll: Ce(l),
      addMany: Ce(s),
      updateMany: Ce(f),
      upsertMany: Ce(m),
    };
  }
  function jx(e) {
    e === void 0 && (e = {});
    var t = He(
        {
          sortComparer: !1,
          selectId: function (s) {
            return s.id;
          },
        },
        e
      ),
      r = t.selectId,
      a = t.sortComparer,
      n = Nx(),
      o = Mx(),
      i = a ? Lx(r, a) : vf(r);
    return He(He(He({selectId: r, sortComparer: a}, n), o), i);
  }
  var Ux = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW',
    Ql = function (e) {
      e === void 0 && (e = 21);
      for (var t = '', r = e; r--; ) t += Ux[(Math.random() * 64) | 0];
      return t;
    },
    Bx = ['name', 'message', 'stack', 'code'],
    Ll = (function () {
      function e(t, r) {
        (this.payload = t), (this.meta = r);
      }
      return e;
    })(),
    Cf = (function () {
      function e(t, r) {
        (this.payload = t), (this.meta = r);
      }
      return e;
    })(),
    xf = function (e) {
      if (typeof e == 'object' && e !== null) {
        for (var t = {}, r = 0, a = Bx; r < a.length; r++) {
          var n = a[r];
          typeof e[n] == 'string' && (t[n] = e[n]);
        }
        return t;
      }
      return {message: String(e)};
    };
  function te(e, t, r) {
    var a = S(e + '/fulfilled', function (c, l, p, f) {
        return {
          payload: c,
          meta: ql(He({}, f || {}), {
            arg: p,
            requestId: l,
            requestStatus: 'fulfilled',
          }),
        };
      }),
      n = S(e + '/pending', function (c, l, p) {
        return {
          payload: void 0,
          meta: ql(He({}, p || {}), {
            arg: l,
            requestId: c,
            requestStatus: 'pending',
          }),
        };
      }),
      o = S(e + '/rejected', function (c, l, p, f, d) {
        return {
          payload: f,
          error: ((r && r.serializeError) || xf)(c || 'Rejected'),
          meta: ql(He({}, d || {}), {
            arg: p,
            requestId: l,
            rejectedWithValue: !!f,
            requestStatus: 'rejected',
            aborted: (c == null ? void 0 : c.name) === 'AbortError',
            condition: (c == null ? void 0 : c.name) === 'ConditionError',
          }),
        };
      }),
      i = !1,
      s =
        typeof AbortController != 'undefined'
          ? AbortController
          : (function () {
              function c() {
                this.signal = {
                  aborted: !1,
                  addEventListener: function () {},
                  dispatchEvent: function () {
                    return !1;
                  },
                  onabort: function () {},
                  removeEventListener: function () {},
                  reason: void 0,
                  throwIfAborted: function () {},
                };
              }
              return (c.prototype.abort = function () {}), c;
            })();
    function u(c) {
      return function (l, p, f) {
        var d = (r == null ? void 0 : r.idGenerator) ? r.idGenerator(c) : Ql(),
          m = new s(),
          h,
          v = new Promise(function (P, _) {
            return m.signal.addEventListener('abort', function () {
              return _({name: 'AbortError', message: h || 'Aborted'});
            });
          }),
          C = !1;
        function x(P) {
          C && ((h = P), m.abort());
        }
        var b = (function () {
          return Xo(this, null, function () {
            var P, _, X, H, I, $;
            return Jo(this, function (ne) {
              switch (ne.label) {
                case 0:
                  return (
                    ne.trys.push([0, 4, , 5]),
                    (H =
                      (P = r == null ? void 0 : r.condition) == null
                        ? void 0
                        : P.call(r, c, {getState: p, extra: f})),
                    _x(H) ? [4, H] : [3, 2]
                  );
                case 1:
                  (H = ne.sent()), (ne.label = 2);
                case 2:
                  if (H === !1)
                    throw {
                      name: 'ConditionError',
                      message:
                        'Aborted due to condition callback returning false.',
                    };
                  return (
                    (C = !0),
                    l(
                      n(
                        d,
                        c,
                        (_ = r == null ? void 0 : r.getPendingMeta) == null
                          ? void 0
                          : _.call(
                              r,
                              {requestId: d, arg: c},
                              {getState: p, extra: f}
                            )
                      )
                    ),
                    [
                      4,
                      Promise.race([
                        v,
                        Promise.resolve(
                          t(c, {
                            dispatch: l,
                            getState: p,
                            extra: f,
                            requestId: d,
                            signal: m.signal,
                            rejectWithValue: function (N, A) {
                              return new Ll(N, A);
                            },
                            fulfillWithValue: function (N, A) {
                              return new Cf(N, A);
                            },
                          })
                        ).then(function (N) {
                          if (N instanceof Ll) throw N;
                          return N instanceof Cf
                            ? a(N.payload, d, c, N.meta)
                            : a(N, d, c);
                        }),
                      ]),
                    ]
                  );
                case 3:
                  return (X = ne.sent()), [3, 5];
                case 4:
                  return (
                    (I = ne.sent()),
                    (X =
                      I instanceof Ll
                        ? o(null, d, c, I.payload, I.meta)
                        : o(I, d, c)),
                    [3, 5]
                  );
                case 5:
                  return (
                    ($ =
                      r &&
                      !r.dispatchConditionRejection &&
                      o.match(X) &&
                      X.meta.condition),
                    $ || l(X),
                    [2, X]
                  );
              }
            });
          });
        })();
        return Object.assign(b, {
          abort: x,
          requestId: d,
          arg: c,
          unwrap: function () {
            return b.then(Rf);
          },
        });
      };
    }
    return Object.assign(u, {
      pending: n,
      rejected: o,
      fulfilled: a,
      typePrefix: e,
    });
  }
  function Rf(e) {
    if (e.meta && e.meta.rejectedWithValue) throw e.payload;
    if (e.error) throw e.error;
    return e.payload;
  }
  function _x(e) {
    return e !== null && typeof e == 'object' && typeof e.then == 'function';
  }
  var $x = function (e) {
      return e && typeof e.match == 'function';
    },
    bf = function (e, t) {
      return $x(e) ? e.match(t) : e(t);
    };
  function ei() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return function (r) {
      return e.some(function (a) {
        return bf(a, r);
      });
    };
  }
  function jl() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return function (r) {
      return e.every(function (a) {
        return bf(a, r);
      });
    };
  }
  function Gi(e, t) {
    if (!e || !e.meta) return !1;
    var r = typeof e.meta.requestId == 'string',
      a = t.indexOf(e.meta.requestStatus) > -1;
    return r && a;
  }
  function ti(e) {
    return (
      typeof e[0] == 'function' &&
      'pending' in e[0] &&
      'fulfilled' in e[0] &&
      'rejected' in e[0]
    );
  }
  function Ff() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return e.length === 0
      ? function (r) {
          return Gi(r, ['pending']);
        }
      : ti(e)
      ? function (r) {
          var a = e.map(function (o) {
              return o.pending;
            }),
            n = ei.apply(void 0, a);
          return n(r);
        }
      : Ff()(e[0]);
  }
  function Ji() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return e.length === 0
      ? function (r) {
          return Gi(r, ['rejected']);
        }
      : ti(e)
      ? function (r) {
          var a = e.map(function (o) {
              return o.rejected;
            }),
            n = ei.apply(void 0, a);
          return n(r);
        }
      : Ji()(e[0]);
  }
  function Af() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    var r = function (a) {
      return a && a.meta && a.meta.rejectedWithValue;
    };
    return e.length === 0
      ? function (a) {
          var n = jl(Ji.apply(void 0, e), r);
          return n(a);
        }
      : ti(e)
      ? function (a) {
          var n = jl(Ji.apply(void 0, e), r);
          return n(a);
        }
      : Af()(e[0]);
  }
  function Pf() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return e.length === 0
      ? function (r) {
          return Gi(r, ['fulfilled']);
        }
      : ti(e)
      ? function (r) {
          var a = e.map(function (o) {
              return o.fulfilled;
            }),
            n = ei.apply(void 0, a);
          return n(r);
        }
      : Pf()(e[0]);
  }
  function If() {
    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
    return e.length === 0
      ? function (r) {
          return Gi(r, ['pending', 'fulfilled', 'rejected']);
        }
      : ti(e)
      ? function (r) {
          for (var a = [], n = 0, o = e; n < o.length; n++) {
            var i = o[n];
            a.push(i.pending, i.rejected, i.fulfilled);
          }
          var s = ei.apply(void 0, a);
          return s(r);
        }
      : If()(e[0]);
  }
  var Ul = function (e, t) {
      if (typeof e != 'function') throw new TypeError(t + ' is not a function');
    },
    Hx = function () {},
    Bl = function (e, t) {
      return t === void 0 && (t = Hx), e.catch(t), e;
    },
    Ef = function (e, t) {
      e.addEventListener('abort', t, {once: !0});
    },
    $a = function (e, t) {
      var r = e.signal;
      r.aborted ||
        ('reason' in r ||
          Object.defineProperty(r, 'reason', {
            enumerable: !0,
            value: t,
            configurable: !0,
            writable: !0,
          }),
        e.abort(t));
    },
    zx = 'task',
    wf = 'listener',
    kf = 'completed',
    _l = 'cancelled',
    Wx = 'task-' + _l,
    Yx = 'task-' + kf,
    Of = wf + '-' + _l,
    Kx = wf + '-' + kf,
    ri = (function () {
      function e(t) {
        (this.code = t),
          (this.name = 'TaskAbortError'),
          (this.message = zx + ' ' + _l + ' (reason: ' + t + ')');
      }
      return e;
    })(),
    Ha = function (e) {
      if (e.aborted) throw new ri(e.reason);
    },
    qf = function (e) {
      return Bl(
        new Promise(function (t, r) {
          var a = function () {
            return r(new ri(e.reason));
          };
          e.aborted ? a() : Ef(e, a);
        })
      );
    },
    Gx = function (e, t) {
      return Xo(void 0, null, function () {
        var r, a;
        return Jo(this, function (n) {
          switch (n.label) {
            case 0:
              return n.trys.push([0, 3, 4, 5]), [4, Promise.resolve()];
            case 1:
              return n.sent(), [4, e()];
            case 2:
              return (r = n.sent()), [2, {status: 'ok', value: r}];
            case 3:
              return (
                (a = n.sent()),
                [
                  2,
                  {
                    status: a instanceof ri ? 'cancelled' : 'rejected',
                    error: a,
                  },
                ]
              );
            case 4:
              return t == null || t(), [7];
            case 5:
              return [2];
          }
        });
      });
    },
    Xi = function (e) {
      return function (t) {
        return Bl(
          Promise.race([qf(e), t]).then(function (r) {
            return Ha(e), r;
          })
        );
      };
    },
    Tf = function (e) {
      var t = Xi(e);
      return function (r) {
        return t(
          new Promise(function (a) {
            return setTimeout(a, r);
          })
        );
      };
    },
    Jx = Object.assign,
    Df = {},
    ai = 'listenerMiddleware',
    Xx = function (e) {
      var t = function (r) {
        return Ef(e, function () {
          return $a(r, e.reason);
        });
      };
      return function (r) {
        Ul(r, 'taskExecutor');
        var a = new AbortController();
        t(a);
        var n = Gx(
          function () {
            return Xo(void 0, null, function () {
              var o;
              return Jo(this, function (i) {
                switch (i.label) {
                  case 0:
                    return (
                      Ha(e),
                      Ha(a.signal),
                      [
                        4,
                        r({
                          pause: Xi(a.signal),
                          delay: Tf(a.signal),
                          signal: a.signal,
                        }),
                      ]
                    );
                  case 1:
                    return (o = i.sent()), Ha(a.signal), [2, o];
                }
              });
            });
          },
          function () {
            return $a(a, Yx);
          }
        );
        return {
          result: Xi(e)(n),
          cancel: function () {
            $a(a, Wx);
          },
        };
      };
    },
    Zx = function (e, t) {
      var r = function (a, n) {
        return Xo(void 0, null, function () {
          var o, i, s, u;
          return Jo(this, function (c) {
            switch (c.label) {
              case 0:
                Ha(t),
                  (o = function () {}),
                  (i = new Promise(function (l) {
                    o = e({
                      predicate: a,
                      effect: function (p, f) {
                        f.unsubscribe(),
                          l([p, f.getState(), f.getOriginalState()]);
                      },
                    });
                  })),
                  (s = [qf(t), i]),
                  n != null &&
                    s.push(
                      new Promise(function (l) {
                        return setTimeout(l, n, null);
                      })
                    ),
                  (c.label = 1);
              case 1:
                return c.trys.push([1, , 3, 4]), [4, Promise.race(s)];
              case 2:
                return (u = c.sent()), Ha(t), [2, u];
              case 3:
                return o(), [7];
              case 4:
                return [2];
            }
          });
        });
      };
      return function (a, n) {
        return Bl(r(a, n));
      };
    },
    Vf = function (e) {
      var t = e.type,
        r = e.actionCreator,
        a = e.matcher,
        n = e.predicate,
        o = e.effect;
      if (t) n = S(t).match;
      else if (r) (t = r.type), (n = r.match);
      else if (a) n = a;
      else if (!n)
        throw new Error(
          'Creating or removing a listener requires one of the known fields for matching an action'
        );
      return Ul(o, 'options.listener'), {predicate: n, type: t, effect: o};
    },
    eR = function (e) {
      var t = Vf(e),
        r = t.type,
        a = t.predicate,
        n = t.effect,
        o = Ql(),
        i = {
          id: o,
          effect: n,
          type: r,
          predicate: a,
          pending: new Set(),
          unsubscribe: function () {
            throw new Error('Unsubscribe not initialized');
          },
        };
      return i;
    },
    tR = function (e) {
      return function () {
        e.forEach($l), e.clear();
      };
    },
    Nf = function (e, t, r) {
      try {
        e(t, r);
      } catch (a) {
        setTimeout(function () {
          throw a;
        }, 0);
      }
    },
    Mf = S(ai + '/add'),
    Qf = S(ai + '/removeAll'),
    Lf = S(ai + '/remove'),
    rR = function () {
      for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
      console.error.apply(console, _a([ai + '/error'], e));
    },
    $l = function (e) {
      e.pending.forEach(function (t) {
        $a(t, Of);
      });
    };
  function aR(e) {
    var t = this;
    e === void 0 && (e = {});
    var r = new Map(),
      a = e.extra,
      n = e.onError,
      o = n === void 0 ? rR : n;
    Ul(o, 'onError');
    var i = function (d) {
        return (
          (d.unsubscribe = function () {
            return r.delete(d.id);
          }),
          r.set(d.id, d),
          function (m) {
            d.unsubscribe(), (m == null ? void 0 : m.cancelActive) && $l(d);
          }
        );
      },
      s = function (d) {
        for (var m = 0, h = Array.from(r.values()); m < h.length; m++) {
          var v = h[m];
          if (d(v)) return v;
        }
      },
      u = function (d) {
        var m = s(function (h) {
          return h.effect === d.effect;
        });
        return m || (m = eR(d)), i(m);
      },
      c = function (d) {
        var m = Vf(d),
          h = m.type,
          v = m.effect,
          C = m.predicate,
          x = s(function (b) {
            var P = typeof h == 'string' ? b.type === h : b.predicate === C;
            return P && b.effect === v;
          });
        return x && (x.unsubscribe(), d.cancelActive && $l(x)), !!x;
      },
      l = function (d, m, h, v) {
        return Xo(t, null, function () {
          var C, x, b;
          return Jo(this, function (P) {
            switch (P.label) {
              case 0:
                (C = new AbortController()),
                  (x = Zx(u, C.signal)),
                  (P.label = 1);
              case 1:
                return (
                  P.trys.push([1, 3, 4, 5]),
                  d.pending.add(C),
                  [
                    4,
                    Promise.resolve(
                      d.effect(
                        m,
                        Jx({}, h, {
                          getOriginalState: v,
                          condition: function (_, X) {
                            return x(_, X).then(Boolean);
                          },
                          take: x,
                          delay: Tf(C.signal),
                          pause: Xi(C.signal),
                          extra: a,
                          signal: C.signal,
                          fork: Xx(C.signal),
                          unsubscribe: d.unsubscribe,
                          subscribe: function () {
                            r.set(d.id, d);
                          },
                          cancelActiveListeners: function () {
                            d.pending.forEach(function (_, X, H) {
                              _ !== C && ($a(_, Of), H.delete(_));
                            });
                          },
                        })
                      )
                    ),
                  ]
                );
              case 2:
                return P.sent(), [3, 5];
              case 3:
                return (
                  (b = P.sent()),
                  b instanceof ri || Nf(o, b, {raisedBy: 'effect'}),
                  [3, 5]
                );
              case 4:
                return $a(C, Kx), d.pending.delete(C), [7];
              case 5:
                return [2];
            }
          });
        });
      },
      p = tR(r),
      f = function (d) {
        return function (m) {
          return function (h) {
            if (Mf.match(h)) return u(h.payload);
            if (Qf.match(h)) {
              p();
              return;
            }
            if (Lf.match(h)) return c(h.payload);
            var v = d.getState(),
              C = function () {
                if (v === Df)
                  throw new Error(
                    ai + ': getOriginalState can only be called synchronously'
                  );
                return v;
              },
              x;
            try {
              if (((x = m(h)), r.size > 0))
                for (
                  var b = d.getState(),
                    P = Array.from(r.values()),
                    _ = 0,
                    X = P;
                  _ < X.length;
                  _++
                ) {
                  var H = X[_],
                    I = !1;
                  try {
                    I = H.predicate(h, b, v);
                  } catch ($) {
                    (I = !1), Nf(o, $, {raisedBy: 'predicate'});
                  }
                  !I || l(H, h, d, C);
                }
            } finally {
              v = Df;
            }
            return x;
          };
        };
      };
    return {
      middleware: f,
      startListening: u,
      stopListening: c,
      clearListeners: p,
    };
  }
  $p();
  var ph = be(ii()),
    fh = be(Gf());
  function qR(e, t) {
    let r = `
The following properties are invalid:

  ${e.join(`
`)}

${t}
`;
    return new ga(r);
  }
  var ga = class extends Error {
      constructor(e) {
        super(e);
        this.name = 'SchemaValidationError';
      }
    },
    Z = class {
      constructor(e) {
        this.definition = e;
      }
      validate(e = {}, t = '') {
        let r = {...this.default, ...e},
          a = [];
        for (let n in this.definition) {
          let o = this.definition[n].validate(r[n]);
          o && a.push(`${n}: ${o}`);
        }
        if (a.length) throw qR(a, t);
        return r;
      }
      get default() {
        let e = {};
        for (let t in this.definition) {
          let r = this.definition[t].default;
          r !== void 0 && (e[t] = r);
        }
        return e;
      }
    },
    de = class {
      constructor(e = {}) {
        this.baseConfig = e;
      }
      validate(e) {
        return this.baseConfig.required && re(e) ? 'value is required.' : null;
      }
      get default() {
        return this.baseConfig.default instanceof Function
          ? this.baseConfig.default()
          : this.baseConfig.default;
      }
      get required() {
        return this.baseConfig.required === !0;
      }
    };
  function De(e) {
    return e === void 0;
  }
  function TR(e) {
    return e === null;
  }
  function re(e) {
    return De(e) || TR(e);
  }
  var U = class {
    constructor(e = {}) {
      (this.config = e), (this.value = new de(e));
    }
    validate(e) {
      let t = this.value.validate(e);
      return (
        t ||
        (DR(e)
          ? e < this.config.min
            ? `minimum value of ${this.config.min} not respected.`
            : e > this.config.max
            ? `maximum value of ${this.config.max} not respected.`
            : null
          : 'value is not a number.')
      );
    }
    get default() {
      return this.value.default;
    }
    get required() {
      return this.value.required;
    }
  };
  function DR(e) {
    return De(e) || Jf(e);
  }
  function Jf(e) {
    return typeof e == 'number' && !isNaN(e);
  }
  var J = class {
    constructor(e = {}) {
      this.value = new de(e);
    }
    validate(e) {
      let t = this.value.validate(e);
      return t || (VR(e) ? null : 'value is not a boolean.');
    }
    get default() {
      return this.value.default;
    }
    get required() {
      return this.value.required;
    }
  };
  function VR(e) {
    return De(e) || Xf(e);
  }
  function Xf(e) {
    return typeof e == 'boolean';
  }
  var NR =
      /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i,
    O = class {
      constructor(e = {}) {
        (this.config = {emptyAllowed: !0, url: !1, ...e}),
          (this.value = new de(this.config));
      }
      validate(e) {
        let {emptyAllowed: t, url: r, regex: a, constrainTo: n} = this.config,
          o = this.value.validate(e);
        return (
          o ||
          (De(e)
            ? null
            : Ya(e)
            ? !t && !e.length
              ? 'value is an empty string.'
              : r && !NR.test(e)
              ? 'value is not a valid URL.'
              : a && !a.test(e)
              ? `value did not match provided regex ${a}`
              : n && !n.includes(e)
              ? `value should be one of: ${n.join(', ')}.`
              : null
            : 'value is not a string.')
        );
      }
      get default() {
        return this.value.default;
      }
      get required() {
        return this.value.required;
      }
    };
  function Ya(e) {
    return Object.prototype.toString.call(e) === '[object String]';
  }
  var L = class {
    constructor(e = {}) {
      this.config = {options: {required: !1}, values: {}, ...e};
    }
    validate(e) {
      if (De(e))
        return this.config.options.required
          ? 'value is required and is currently undefined'
          : null;
      if (!Zf(e)) return 'value is not an object';
      for (let [r, a] of Object.entries(this.config.values))
        if (a.required && re(e[r])) return `value does not contain ${r}`;
      let t = '';
      for (let [r, a] of Object.entries(this.config.values)) {
        let n = e[r],
          o = a.validate(n);
        o !== null && (t += ' ' + o);
      }
      return t === '' ? null : t;
    }
    get default() {}
    get required() {
      return !!this.config.options.required;
    }
  };
  function Zf(e) {
    return e !== void 0 && typeof e == 'object';
  }
  var K = class {
    constructor(e = {}) {
      (this.config = e), (this.value = new de(this.config));
    }
    validate(e) {
      if (!re(e) && !Array.isArray(e)) return 'value is not an array';
      let t = this.value.validate(e);
      if (t !== null) return t;
      if (re(e)) return null;
      if (this.config.max !== void 0 && e.length > this.config.max)
        return `value contains more than ${this.config.max}`;
      if (this.config.min !== void 0 && e.length < this.config.min)
        return `value contains less than ${this.config.min}`;
      if (this.config.each !== void 0) {
        let r = '';
        return (
          e.forEach((a) => {
            this.config.each.required &&
              re(a) &&
              (r = `value is null or undefined: ${e.join(',')}`);
            let n = this.validatePrimitiveValue(a, this.config.each);
            n !== null && (r += ' ' + n);
          }),
          r === '' ? null : r
        );
      }
      return null;
    }
    validatePrimitiveValue(e, t) {
      return Xf(e) || Ya(e) || Jf(e) || Zf(e)
        ? t.validate(e)
        : 'value is not a primitive value';
    }
    get default() {}
    get required() {
      return this.value.required;
    }
  };
  function Ka(e) {
    return Array.isArray(e);
  }
  var Vt = class {
    constructor(e) {
      (this.config = e), (this.value = new de(e));
    }
    validate(e) {
      let t = this.value.validate(e);
      return t !== null
        ? t
        : De(e) || Object.values(this.config.enum).find((a) => a === e)
        ? null
        : 'value is not in enum.';
    }
    get default() {
      return this.value.default;
    }
    get required() {
      return this.value.required;
    }
  };
  function ha(e, t) {
    var r = {};
    for (var a in e)
      Object.prototype.hasOwnProperty.call(e, a) &&
        t.indexOf(a) < 0 &&
        (r[a] = e[a]);
    if (e != null && typeof Object.getOwnPropertySymbols == 'function')
      for (var n = 0, a = Object.getOwnPropertySymbols(e); n < a.length; n++)
        t.indexOf(a[n]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(e, a[n]) &&
          (r[a[n]] = e[a[n]]);
    return r;
  }
  function F(e, t, r, a) {
    function n(o) {
      return o instanceof r
        ? o
        : new r(function (i) {
            i(o);
          });
    }
    return new (r || (r = Promise))(function (o, i) {
      function s(l) {
        try {
          c(a.next(l));
        } catch (p) {
          i(p);
        }
      }
      function u(l) {
        try {
          c(a.throw(l));
        } catch (p) {
          i(p);
        }
      }
      function c(l) {
        l.done ? o(l.value) : n(l.value).then(s, u);
      }
      c((a = a.apply(e, t || [])).next());
    });
  }
  var me;
  (function (e) {
    (e.search = 'search'),
      (e.click = 'click'),
      (e.custom = 'custom'),
      (e.view = 'view'),
      (e.collect = 'collect');
  })(me || (me = {}));
  function MR() {
    return typeof window != 'undefined';
  }
  function Kl() {
    return typeof navigator != 'undefined';
  }
  function si() {
    return typeof document != 'undefined';
  }
  function Gl() {
    try {
      return typeof localStorage != 'undefined';
    } catch {
      return !1;
    }
  }
  function QR() {
    try {
      return typeof sessionStorage != 'undefined';
    } catch {
      return !1;
    }
  }
  function em() {
    return Kl() && navigator.cookieEnabled;
  }
  function LR() {
    return typeof crypto != 'undefined';
  }
  function jR() {
    return LR() && typeof crypto.getRandomValues != 'undefined';
  }
  var UR = [me.click, me.custom, me.search, me.view],
    BR = (e, t) =>
      UR.indexOf(e) !== -1
        ? Object.assign(
            {
              language: si() ? document.documentElement.lang : 'unknown',
              userAgent: Kl() ? navigator.userAgent : 'unknown',
            },
            t
          )
        : t,
    Dr = class {
      static set(t, r, a) {
        var n, o, i, s, u;
        a
          ? ((i = new Date()),
            i.setTime(i.getTime() + a),
            (s = '; expires=' + i.toGMTString()))
          : (s = ''),
          (u = window.location.hostname),
          u.indexOf('.') === -1
            ? (document.cookie = t + '=' + r + s + '; path=/')
            : ((o = u.split('.')),
              o.shift(),
              (n = '.' + o.join('.')),
              tm({name: t, value: r, expires: s, domain: n}),
              (Dr.get(t) == null || Dr.get(t) != r) &&
                ((n = '.' + u),
                tm({name: t, value: r, expires: s, domain: n})));
      }
      static get(t) {
        for (
          var r = t + '=', a = document.cookie.split(';'), n = 0;
          n < a.length;
          n++
        ) {
          var o = a[n];
          if (((o = o.replace(/^\s+/, '')), o.indexOf(r) == 0))
            return o.substring(r.length, o.length);
        }
        return null;
      }
      static erase(t) {
        Dr.set(t, '', -1);
      }
    };
  function tm(e) {
    let {name: t, value: r, expires: a, domain: n} = e;
    document.cookie = `${t}=${r}${a}; path=/; domain=${n}; SameSite=Lax`;
  }
  function _R() {
    return Gl()
      ? localStorage
      : em()
      ? new Vr()
      : QR()
      ? sessionStorage
      : new Ga();
  }
  var Vr = class {
    getItem(t) {
      return Dr.get(`${Vr.prefix}${t}`);
    }
    removeItem(t) {
      Dr.erase(`${Vr.prefix}${t}`);
    }
    setItem(t, r) {
      Dr.set(`${Vr.prefix}${t}`, r);
    }
  };
  Vr.prefix = 'coveo_';
  var rm = class {
      constructor() {
        this.cookieStorage = new Vr();
      }
      getItem(t) {
        return localStorage.getItem(t) || this.cookieStorage.getItem(t);
      }
      removeItem(t) {
        this.cookieStorage.removeItem(t), localStorage.removeItem(t);
      }
      setItem(t, r) {
        localStorage.setItem(t, r), this.cookieStorage.setItem(t, r);
      }
    },
    Ga = class {
      getItem(t) {
        return null;
      }
      removeItem(t) {}
      setItem(t, r) {}
    },
    ci = '__coveo.analytics.history',
    am = 20,
    nm = 1e3 * 60,
    om = 75,
    ui = class {
      constructor(t) {
        this.store = t || _R();
      }
      addElement(t) {
        (t.internalTime = new Date().getTime()),
          (t = this.cropQueryElement(this.stripEmptyQuery(t)));
        let r = this.getHistoryWithInternalTime();
        r != null
          ? this.isValidEntry(t) && this.setHistory([t].concat(r))
          : this.setHistory([t]);
      }
      addElementAsync(t) {
        return F(this, void 0, void 0, function* () {
          (t.internalTime = new Date().getTime()),
            (t = this.cropQueryElement(this.stripEmptyQuery(t)));
          let r = yield this.getHistoryWithInternalTimeAsync();
          r != null
            ? this.isValidEntry(t) && this.setHistory([t].concat(r))
            : this.setHistory([t]);
        });
      }
      getHistory() {
        let t = this.getHistoryWithInternalTime();
        return this.stripEmptyQueries(this.stripInternalTime(t));
      }
      getHistoryAsync() {
        return F(this, void 0, void 0, function* () {
          let t = yield this.getHistoryWithInternalTimeAsync();
          return this.stripEmptyQueries(this.stripInternalTime(t));
        });
      }
      getHistoryWithInternalTime() {
        try {
          let t = this.store.getItem(ci);
          return t && typeof t == 'string' ? JSON.parse(t) : [];
        } catch {
          return [];
        }
      }
      getHistoryWithInternalTimeAsync() {
        return F(this, void 0, void 0, function* () {
          try {
            let t = yield this.store.getItem(ci);
            return t ? JSON.parse(t) : [];
          } catch {
            return [];
          }
        });
      }
      setHistory(t) {
        try {
          this.store.setItem(ci, JSON.stringify(t.slice(0, am)));
        } catch {}
      }
      clear() {
        try {
          this.store.removeItem(ci);
        } catch {}
      }
      getMostRecentElement() {
        let t = this.getHistoryWithInternalTime();
        return t != null
          ? t.sort((a, n) => (n.internalTime || 0) - (a.internalTime || 0))[0]
          : null;
      }
      cropQueryElement(t) {
        return (
          t.name &&
            t.value &&
            t.name.toLowerCase() === 'query' &&
            (t.value = t.value.slice(0, om)),
          t
        );
      }
      isValidEntry(t) {
        let r = this.getMostRecentElement();
        return r && r.value == t.value
          ? (t.internalTime || 0) - (r.internalTime || 0) > nm
          : !0;
      }
      stripInternalTime(t) {
        return t.map((r) => {
          let {name: a, time: n, value: o} = r;
          return {name: a, time: n, value: o};
        });
      }
      stripEmptyQuery(t) {
        let {name: r, time: a, value: n} = t;
        return r &&
          typeof n == 'string' &&
          r.toLowerCase() === 'query' &&
          n.trim() === ''
          ? {name: r, time: a}
          : t;
      }
      stripEmptyQueries(t) {
        return t.map((r) => this.stripEmptyQuery(r));
      }
    },
    ts = Object.freeze({
      __proto__: null,
      STORE_KEY: ci,
      MAX_NUMBER_OF_HISTORY_ELEMENTS: am,
      MIN_THRESHOLD_FOR_DUPLICATE_VALUE: nm,
      MAX_VALUE_SIZE: om,
      HistoryStore: ui,
      default: ui,
    }),
    $R = (e, t) =>
      F(void 0, void 0, void 0, function* () {
        return e === me.view
          ? (yield HR(t.contentIdValue),
            Object.assign(
              {
                location: window.location.toString(),
                referrer: document.referrer,
                title: document.title,
              },
              t
            ))
          : t;
      }),
    HR = (e) =>
      F(void 0, void 0, void 0, function* () {
        let t = new ui(),
          r = {name: 'PageView', value: e, time: JSON.stringify(new Date())};
        yield t.addElementAsync(r);
      }),
    Ja = (e) =>
      e
        ? (
            Number(e) ^
            (zR(new Uint8Array(1))[0] % 16 >> (Number(e) / 4))
          ).toString(16)
        : (`${1e7}` + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, Ja),
    zR = (e) => {
      if (jR()) return crypto.getRandomValues(e);
      for (var t = 0, r = 0; t < e.length; t++)
        (t & 3) == 0 && (r = Math.random() * 4294967296),
          (e[t] = (r >>> ((t & 3) << 3)) & 255);
      return e;
    },
    rt = Object.keys,
    Jl = {
      id: 'svc_ticket_id',
      subject: 'svc_ticket_subject',
      description: 'svc_ticket_description',
      category: 'svc_ticket_category',
      productId: 'svc_ticket_product_id',
      custom: 'svc_ticket_custom',
    },
    WR = rt(Jl).map((e) => Jl[e]),
    YR = [...WR].join('|'),
    KR = new RegExp(`^(${YR}$)`),
    GR = {svcAction: 'svc_action', svcActionData: 'svc_action_data'},
    JR = (e) =>
      rt(e)
        .filter((t) => e[t] !== void 0)
        .reduce((t, r) => {
          let a = Jl[r] || r;
          return Object.assign(Object.assign({}, t), {[a]: e[r]});
        }, {}),
    XR = (e) => KR.test(e),
    ZR = [XR],
    im = {
      id: 'id',
      name: 'nm',
      brand: 'br',
      category: 'ca',
      variant: 'va',
      price: 'pr',
      quantity: 'qt',
      coupon: 'cc',
      position: 'ps',
      group: 'group',
    },
    sm = {
      id: 'id',
      name: 'nm',
      brand: 'br',
      category: 'ca',
      variant: 'va',
      position: 'ps',
      price: 'pr',
      group: 'group',
    },
    Qe = {action: 'pa', list: 'pal', listSource: 'pls'},
    rs = {
      id: 'ti',
      revenue: 'tr',
      tax: 'tt',
      shipping: 'ts',
      coupon: 'tcc',
      affiliation: 'ta',
      step: 'cos',
      option: 'col',
    },
    eb = [
      'loyaltyCardId',
      'loyaltyTier',
      'thirdPartyPersona',
      'companyName',
      'favoriteStore',
      'storeName',
      'userIndustry',
      'userRole',
      'userDepartment',
      'businessUnit',
    ],
    Xl = {id: 'quoteId', affiliation: 'quoteAffiliation'},
    Zl = {id: 'reviewId', rating: 'reviewRating', comment: 'reviewComment'},
    tb = {
      add: Qe,
      bookmark_add: Qe,
      bookmark_remove: Qe,
      click: Qe,
      checkout: Qe,
      checkout_option: Qe,
      detail: Qe,
      impression: Qe,
      remove: Qe,
      refund: Object.assign(Object.assign({}, Qe), rs),
      purchase: Object.assign(Object.assign({}, Qe), rs),
      quickview: Qe,
      quote: Object.assign(Object.assign({}, Qe), Xl),
      review: Object.assign(Object.assign({}, Qe), Zl),
    },
    rb = rt(im).map((e) => im[e]),
    ab = rt(sm).map((e) => sm[e]),
    nb = rt(Qe).map((e) => Qe[e]),
    ob = rt(rs).map((e) => rs[e]),
    ib = rt(Zl).map((e) => Zl[e]),
    sb = rt(Xl).map((e) => Xl[e]),
    cb = [...rb, 'custom'].join('|'),
    ub = [...ab, 'custom'].join('|'),
    cm = '(pr[0-9]+)',
    um = '(il[0-9]+pi[0-9]+)',
    lb = new RegExp(`^${cm}(${cb})$`),
    db = new RegExp(`^(${um}(${ub}))|(il[0-9]+nm)$`),
    pb = new RegExp(`^(${nb.join('|')})$`),
    fb = new RegExp(`^(${ob.join('|')})$`),
    mb = new RegExp(`^${cm}custom$`),
    gb = new RegExp(`^${um}custom$`),
    hb = new RegExp(`^(${[...eb, ...ib, ...sb].join('|')})$`),
    Sb = (e) => lb.test(e),
    yb = (e) => db.test(e),
    vb = (e) => pb.test(e),
    Cb = (e) => fb.test(e),
    xb = (e) => hb.test(e),
    Rb = [yb, Sb, vb, Cb, xb],
    bb = [mb, gb],
    Fb = {anonymizeIp: 'aip'},
    Ab = {
      eventCategory: 'ec',
      eventAction: 'ea',
      eventLabel: 'el',
      eventValue: 'ev',
      page: 'dp',
      visitorId: 'cid',
      clientId: 'cid',
      userId: 'uid',
      currencyCode: 'cu',
    },
    Pb = {
      hitType: 't',
      pageViewId: 'pid',
      encoding: 'de',
      location: 'dl',
      referrer: 'dr',
      screenColor: 'sd',
      screenResolution: 'sr',
      title: 'dt',
      userAgent: 'ua',
      language: 'ul',
      eventId: 'z',
      time: 'tm',
    },
    Ib = [
      'contentId',
      'contentIdKey',
      'contentType',
      'searchHub',
      'tab',
      'searchUid',
      'permanentId',
      'contentLocale',
    ],
    Eb = Object.assign(
      Object.assign(Object.assign(Object.assign({}, Fb), Ab), Pb),
      Ib.reduce((e, t) => Object.assign(Object.assign({}, e), {[t]: t}), {})
    ),
    ed = Object.assign(Object.assign({}, Eb), GR),
    wb = (e) => {
      let t = (!!e.action && tb[e.action]) || {};
      return rt(e).reduce((r, a) => {
        let n = t[a] || ed[a] || a;
        return Object.assign(Object.assign({}, r), {[n]: e[a]});
      }, {});
    },
    kb = rt(ed).map((e) => ed[e]),
    Ob = (e) => kb.indexOf(e) !== -1,
    qb = (e) => e === 'custom',
    Tb = (e) => [...Rb, ...ZR, Ob, qb].some((t) => t(e)),
    Db = (e) =>
      rt(e).reduce((t, r) => {
        let a = Vb(r);
        return a
          ? Object.assign(Object.assign({}, t), Nb(a, e[r]))
          : Object.assign(Object.assign({}, t), {[r]: e[r]});
      }, {}),
    Vb = (e) => {
      let t;
      return (
        [...bb].every((r) => {
          var a;
          return (
            (t = (a = r.exec(e)) === null || a === void 0 ? void 0 : a[1]),
            !Boolean(t)
          );
        }),
        t
      );
    },
    Nb = (e, t) =>
      rt(t).reduce(
        (r, a) => Object.assign(Object.assign({}, r), {[`${e}${a}`]: t[a]}),
        {}
      ),
    lm = class {
      constructor(t) {
        this.opts = t;
      }
      sendEvent(t, r) {
        return F(this, void 0, void 0, function* () {
          if (!navigator.sendBeacon)
            throw new Error(
              'navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".'
            );
          let {baseUrl: a, preprocessRequest: n} = this.opts,
            o = this.encodeForEventType(t, r),
            i = yield this.getQueryParamsForEventType(t),
            s = {
              url: `${a}/analytics/${t}?${i}`,
              body: new Blob([o], {type: 'application/x-www-form-urlencoded'}),
            },
            {url: u, body: c} = Object.assign(
              Object.assign({}, s),
              n ? yield n(s, 'analyticsBeacon') : {}
            );
          console.log(`Sending beacon for "${t}" with: `, JSON.stringify(r)),
            navigator.sendBeacon(u, c);
        });
      }
      deleteHttpCookieVisitorId() {
        return Promise.resolve();
      }
      encodeForEventType(t, r) {
        return this.isEventTypeLegacy(t)
          ? this.encodeForLegacyType(t, r)
          : this.encodeForFormUrlEncoded(
              Object.assign({access_token: this.opts.token}, r)
            );
      }
      getQueryParamsForEventType(t) {
        return F(this, void 0, void 0, function* () {
          let {token: r, visitorIdProvider: a} = this.opts,
            n = yield a.getCurrentVisitorId();
          return [
            r && this.isEventTypeLegacy(t) ? `access_token=${r}` : '',
            n ? `visitorId=${n}` : '',
            'discardVisitInfo=true',
          ]
            .filter((o) => !!o)
            .join('&');
        });
      }
      isEventTypeLegacy(t) {
        return [me.click, me.custom, me.search, me.view].indexOf(t) !== -1;
      }
      encodeForLegacyType(t, r) {
        return `${t}Event=${encodeURIComponent(JSON.stringify(r))}`;
      }
      encodeForFormUrlEncoded(t) {
        return Object.keys(t)
          .filter((r) => !!t[r])
          .map(
            (r) =>
              `${encodeURIComponent(r)}=${encodeURIComponent(
                this.encodeValue(t[r])
              )}`
          )
          .join('&');
      }
      encodeValue(t) {
        return typeof t == 'number' ||
          typeof t == 'string' ||
          typeof t == 'boolean'
          ? t
          : JSON.stringify(t);
      }
    },
    dm = class {
      sendEvent(t, r) {
        return F(this, void 0, void 0, function* () {
          return Promise.resolve();
        });
      }
      deleteHttpCookieVisitorId() {
        return F(this, void 0, void 0, function* () {
          return Promise.resolve();
        });
      }
    },
    pm = window.fetch,
    td = class {
      constructor(t) {
        this.opts = t;
      }
      sendEvent(t, r) {
        return F(this, void 0, void 0, function* () {
          let {
              baseUrl: a,
              visitorIdProvider: n,
              preprocessRequest: o,
            } = this.opts,
            i = this.shouldAppendVisitorId(t)
              ? yield this.getVisitorIdParam()
              : '',
            s = {
              url: `${a}/analytics/${t}${i}`,
              credentials: 'include',
              mode: 'cors',
              headers: this.getHeaders(),
              method: 'POST',
              body: JSON.stringify(r),
            },
            u = Object.assign(
              Object.assign({}, s),
              o ? yield o(s, 'analyticsFetch') : {}
            ),
            {url: c} = u,
            l = ha(u, ['url']),
            p = yield pm(c, l);
          if (p.ok) {
            let f = yield p.json();
            return f.visitorId && n.setCurrentVisitorId(f.visitorId), f;
          } else {
            try {
              p.json();
            } catch {}
            throw (
              (console.error(
                `An error has occured when sending the "${t}" event.`,
                p,
                r
              ),
              new Error(
                `An error has occurred when sending the "${t}" event. Check the console logs for more details.`
              ))
            );
          }
        });
      }
      deleteHttpCookieVisitorId() {
        return F(this, void 0, void 0, function* () {
          let {baseUrl: t} = this.opts,
            r = `${t}/analytics/visit`;
          yield pm(r, {headers: this.getHeaders(), method: 'DELETE'});
        });
      }
      shouldAppendVisitorId(t) {
        return [me.click, me.custom, me.search, me.view].indexOf(t) !== -1;
      }
      getVisitorIdParam() {
        return F(this, void 0, void 0, function* () {
          let {visitorIdProvider: t} = this.opts,
            r = yield t.getCurrentVisitorId();
          return r ? `?visitor=${r}` : '';
        });
      }
      getHeaders() {
        let {token: t} = this.opts;
        return Object.assign(
          Object.assign({}, t ? {Authorization: `Bearer ${t}`} : {}),
          {'Content-Type': 'application/json'}
        );
      }
    },
    fm = class {
      constructor(t, r) {
        Gl() && em()
          ? (this.storage = new rm())
          : Gl()
          ? (this.storage = localStorage)
          : (console.warn(
              'BrowserRuntime detected no valid storage available.',
              this
            ),
            (this.storage = new Ga())),
          (this.client = new td(t)),
          (this.beaconClient = new lm(t)),
          window.addEventListener('beforeunload', () => {
            let a = r();
            for (let {eventType: n, payload: o} of a)
              this.beaconClient.sendEvent(n, o);
          });
      }
    },
    mm = class {
      constructor(t, r) {
        (this.storage = r || new Ga()), (this.client = new td(t));
      }
    },
    gm = class {
      constructor() {
        (this.storage = new Ga()), (this.client = new dm());
      }
    },
    Mb = 'xx',
    Qb = (e) => (e == null ? void 0 : e.startsWith(Mb)) || !1,
    Lb = `
      We've detected you're using React Native but have not provided the corresponding runtime, 
      for an optimal experience please use the "coveo.analytics/react-native" subpackage.
      Follow the Readme on how to set it up: https://github.com/coveo/coveo.analytics.js#using-react-native
  `;
  function jb() {
    return (
      typeof navigator != 'undefined' && navigator.product == 'ReactNative'
    );
  }
  var Ub = ['1', 1, 'yes', !0];
  function hm() {
    return (
      Kl() &&
      [
        navigator.globalPrivacyControl,
        navigator.doNotTrack,
        navigator.msDoNotTrack,
        window.doNotTrack,
      ].some((e) => Ub.indexOf(e) !== -1)
    );
  }
  var Sm = 'v15',
    ym = {
      default: 'https://analytics.cloud.coveo.com/rest/ua',
      production: 'https://analytics.cloud.coveo.com/rest/ua',
      hipaa: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
    };
  function Bb(e = ym.default, t = Sm) {
    let r = e.indexOf('.cloud.coveo.com') !== -1;
    return `${e}${r ? '' : '/rest'}/${t}`;
  }
  var Nr = class {
      constructor(t) {
        if (!t) throw new Error('You have to pass options to this constructor');
        (this.options = Object.assign(
          Object.assign({}, this.defaultOptions),
          t
        )),
          (this.visitorId = ''),
          (this.bufferedRequests = []),
          (this.beforeSendHooks = [$R, BR].concat(
            this.options.beforeSendHooks
          )),
          (this.afterSendHooks = this.options.afterSendHooks),
          (this.eventTypeMapping = {});
        let r = {
          baseUrl: this.baseUrl,
          token: this.options.token,
          visitorIdProvider: this,
          preprocessRequest: this.options.preprocessRequest,
        };
        (this.runtime = this.options.runtimeEnvironment || this.initRuntime(r)),
          hm() && (this.clear(), (this.runtime.storage = new Ga()));
      }
      get defaultOptions() {
        return {
          endpoint: ym.default,
          token: '',
          version: Sm,
          beforeSendHooks: [],
          afterSendHooks: [],
        };
      }
      initRuntime(t) {
        return MR() && si()
          ? new fm(t, () => {
              let r = [...this.bufferedRequests];
              return (this.bufferedRequests = []), r;
            })
          : (jb() && console.warn(Lb), new mm(t));
      }
      get storage() {
        return this.runtime.storage;
      }
      determineVisitorId() {
        return F(this, void 0, void 0, function* () {
          try {
            return (yield this.storage.getItem('visitorId')) || Ja();
          } catch (t) {
            return (
              console.log(
                'Could not get visitor ID from the current runtime environment storage. Using a random ID instead.',
                t
              ),
              Ja()
            );
          }
        });
      }
      getCurrentVisitorId() {
        return F(this, void 0, void 0, function* () {
          if (!this.visitorId) {
            let t = yield this.determineVisitorId();
            yield this.setCurrentVisitorId(t);
          }
          return this.visitorId;
        });
      }
      setCurrentVisitorId(t) {
        return F(this, void 0, void 0, function* () {
          (this.visitorId = t), yield this.storage.setItem('visitorId', t);
        });
      }
      getParameters(t, ...r) {
        return F(this, void 0, void 0, function* () {
          return yield this.resolveParameters(t, ...r);
        });
      }
      getPayload(t, ...r) {
        return F(this, void 0, void 0, function* () {
          let a = yield this.resolveParameters(t, ...r);
          return yield this.resolvePayloadForParameters(t, a);
        });
      }
      get currentVisitorId() {
        return (
          typeof (this.visitorId || this.storage.getItem('visitorId')) !=
            'string' && this.setCurrentVisitorId(Ja()),
          this.visitorId
        );
      }
      set currentVisitorId(t) {
        (this.visitorId = t), this.storage.setItem('visitorId', t);
      }
      resolveParameters(t, ...r) {
        return F(this, void 0, void 0, function* () {
          let {
            variableLengthArgumentsNames: a = [],
            addVisitorIdParameter: n = !1,
            usesMeasurementProtocol: o = !1,
            addClientIdParameter: i = !1,
          } = this.eventTypeMapping[t] || {};
          return yield [
            (d) =>
              a.length > 0 ? this.parseVariableArgumentsPayload(a, d) : d[0],
            (d) =>
              F(this, void 0, void 0, function* () {
                return Object.assign(Object.assign({}, d), {
                  visitorId: n ? yield this.getCurrentVisitorId() : '',
                });
              }),
            (d) =>
              F(this, void 0, void 0, function* () {
                return i
                  ? Object.assign(Object.assign({}, d), {
                      clientId: yield this.getCurrentVisitorId(),
                    })
                  : d;
              }),
            (d) => (o ? this.ensureAnonymousUserWhenUsingApiKey(d) : d),
            (d) =>
              this.beforeSendHooks.reduce(
                (m, h) =>
                  F(this, void 0, void 0, function* () {
                    let v = yield m;
                    return yield h(t, v);
                  }),
                d
              ),
          ].reduce(
            (d, m) =>
              F(this, void 0, void 0, function* () {
                let h = yield d;
                return yield m(h);
              }),
            Promise.resolve(r)
          );
        });
      }
      resolvePayloadForParameters(t, r) {
        return F(this, void 0, void 0, function* () {
          let {usesMeasurementProtocol: a = !1} =
            this.eventTypeMapping[t] || {};
          return yield [
            (l) => this.removeEmptyPayloadValues(l, t),
            (l) => this.validateParams(l),
            (l) => (a ? wb(l) : l),
            (l) => (a ? this.removeUnknownParameters(l) : l),
            (l) => (a ? this.processCustomParameters(l) : l),
          ].reduce(
            (l, p) =>
              F(this, void 0, void 0, function* () {
                let f = yield l;
                return yield p(f);
              }),
            Promise.resolve(r)
          );
        });
      }
      makeEvent(t, ...r) {
        return F(this, void 0, void 0, function* () {
          let {newEventType: a = t} = this.eventTypeMapping[t] || {},
            n = yield this.resolveParameters(t, ...r),
            o = yield this.resolvePayloadForParameters(t, n);
          return {
            eventType: a,
            payload: o,
            log: (i) =>
              F(this, void 0, void 0, function* () {
                return (
                  this.bufferedRequests.push({
                    eventType: a,
                    payload: Object.assign(Object.assign({}, o), i),
                  }),
                  yield Promise.all(
                    this.afterSendHooks.map((s) =>
                      s(t, Object.assign(Object.assign({}, n), i))
                    )
                  ),
                  yield this.deferExecution(),
                  yield this.sendFromBufferWithFetch()
                );
              }),
          };
        });
      }
      sendEvent(t, ...r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeEvent(t, ...r)).log({});
        });
      }
      deferExecution() {
        return new Promise((t) => setTimeout(t, 0));
      }
      sendFromBufferWithFetch() {
        return F(this, void 0, void 0, function* () {
          let t = this.bufferedRequests.shift();
          if (t) {
            let {eventType: r, payload: a} = t;
            return this.runtime.client.sendEvent(r, a);
          }
        });
      }
      clear() {
        this.storage.removeItem('visitorId'), new ui().clear();
      }
      deleteHttpOnlyVisitorId() {
        this.runtime.client.deleteHttpCookieVisitorId();
      }
      makeSearchEvent(t) {
        return F(this, void 0, void 0, function* () {
          return this.makeEvent(me.search, t);
        });
      }
      sendSearchEvent(t) {
        var {searchQueryUid: r} = t,
          a = ha(t, ['searchQueryUid']);
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchEvent(a)).log({searchQueryUid: r});
        });
      }
      makeClickEvent(t) {
        return F(this, void 0, void 0, function* () {
          return this.makeEvent(me.click, t);
        });
      }
      sendClickEvent(t) {
        var {searchQueryUid: r} = t,
          a = ha(t, ['searchQueryUid']);
        return F(this, void 0, void 0, function* () {
          return (yield this.makeClickEvent(a)).log({searchQueryUid: r});
        });
      }
      makeCustomEvent(t) {
        return F(this, void 0, void 0, function* () {
          return this.makeEvent(me.custom, t);
        });
      }
      sendCustomEvent(t) {
        var {lastSearchQueryUid: r} = t,
          a = ha(t, ['lastSearchQueryUid']);
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCustomEvent(a)).log({lastSearchQueryUid: r});
        });
      }
      makeViewEvent(t) {
        return F(this, void 0, void 0, function* () {
          return this.makeEvent(me.view, t);
        });
      }
      sendViewEvent(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeViewEvent(t)).log({});
        });
      }
      getVisit() {
        return F(this, void 0, void 0, function* () {
          let r = yield (yield fetch(`${this.baseUrl}/analytics/visit`)).json();
          return (this.visitorId = r.visitorId), r;
        });
      }
      getHealth() {
        return F(this, void 0, void 0, function* () {
          return yield (yield fetch(
            `${this.baseUrl}/analytics/monitoring/health`
          )).json();
        });
      }
      registerBeforeSendEventHook(t) {
        this.beforeSendHooks.push(t);
      }
      registerAfterSendEventHook(t) {
        this.afterSendHooks.push(t);
      }
      addEventTypeMapping(t, r) {
        this.eventTypeMapping[t] = r;
      }
      parseVariableArgumentsPayload(t, r) {
        let a = {};
        for (let n = 0, o = r.length; n < o; n++) {
          let i = r[n];
          if (typeof i == 'string') a[t[n]] = i;
          else if (typeof i == 'object')
            return Object.assign(Object.assign({}, a), i);
        }
        return a;
      }
      isKeyAllowedEmpty(t, r) {
        return ({[me.search]: ['queryText']}[t] || []).indexOf(r) !== -1;
      }
      removeEmptyPayloadValues(t, r) {
        let a = (n) => typeof n != 'undefined' && n !== null && n !== '';
        return Object.keys(t)
          .filter((n) => this.isKeyAllowedEmpty(r, n) || a(t[n]))
          .reduce(
            (n, o) => Object.assign(Object.assign({}, n), {[o]: t[o]}),
            {}
          );
      }
      removeUnknownParameters(t) {
        return Object.keys(t)
          .filter((a) => {
            if (Tb(a)) return !0;
            console.log(a, 'is not processed by coveoua');
          })
          .reduce(
            (a, n) => Object.assign(Object.assign({}, a), {[n]: t[n]}),
            {}
          );
      }
      processCustomParameters(t) {
        let {custom: r} = t,
          a = ha(t, ['custom']),
          n = this.lowercaseKeys(r),
          o = Db(a);
        return Object.assign(Object.assign({}, n), o);
      }
      lowercaseKeys(t) {
        return Object.keys(t || {}).reduce(
          (a, n) =>
            Object.assign(Object.assign({}, a), {[n.toLowerCase()]: t[n]}),
          {}
        );
      }
      validateParams(t) {
        let {anonymizeIp: r} = t,
          a = ha(t, ['anonymizeIp']);
        return (
          r !== void 0 &&
            ['0', 'false', 'undefined', 'null', '{}', '[]', ''].indexOf(
              `${r}`.toLowerCase()
            ) == -1 &&
            (a.anonymizeIp = 1),
          a
        );
      }
      ensureAnonymousUserWhenUsingApiKey(t) {
        let {userId: r} = t,
          a = ha(t, ['userId']);
        return Qb(this.options.token) && !r ? ((a.userId = 'anonymous'), a) : t;
      }
      get baseUrl() {
        return Bb(this.options.endpoint, this.options.version);
      }
    },
    rd;
  (function (e) {
    (e.contextChanged = 'contextChanged'),
      (e.expandToFullUI = 'expandToFullUI');
  })(rd || (rd = {}));
  var E;
  (function (e) {
    (e.interfaceLoad = 'interfaceLoad'),
      (e.interfaceChange = 'interfaceChange'),
      (e.didyoumeanAutomatic = 'didyoumeanAutomatic'),
      (e.didyoumeanClick = 'didyoumeanClick'),
      (e.resultsSort = 'resultsSort'),
      (e.searchboxSubmit = 'searchboxSubmit'),
      (e.searchboxClear = 'searchboxClear'),
      (e.searchboxAsYouType = 'searchboxAsYouType'),
      (e.breadcrumbFacet = 'breadcrumbFacet'),
      (e.breadcrumbResetAll = 'breadcrumbResetAll'),
      (e.documentQuickview = 'documentQuickview'),
      (e.documentOpen = 'documentOpen'),
      (e.omniboxAnalytics = 'omniboxAnalytics'),
      (e.omniboxFromLink = 'omniboxFromLink'),
      (e.searchFromLink = 'searchFromLink'),
      (e.triggerNotify = 'notify'),
      (e.triggerExecute = 'execute'),
      (e.triggerQuery = 'query'),
      (e.undoTriggerQuery = 'undoQuery'),
      (e.triggerRedirect = 'redirect'),
      (e.pagerResize = 'pagerResize'),
      (e.pagerNumber = 'pagerNumber'),
      (e.pagerNext = 'pagerNext'),
      (e.pagerPrevious = 'pagerPrevious'),
      (e.pagerScrolling = 'pagerScrolling'),
      (e.staticFilterClearAll = 'staticFilterClearAll'),
      (e.staticFilterSelect = 'staticFilterSelect'),
      (e.staticFilterDeselect = 'staticFilterDeselect'),
      (e.facetClearAll = 'facetClearAll'),
      (e.facetSearch = 'facetSearch'),
      (e.facetSelect = 'facetSelect'),
      (e.facetSelectAll = 'facetSelectAll'),
      (e.facetDeselect = 'facetDeselect'),
      (e.facetExclude = 'facetExclude'),
      (e.facetUnexclude = 'facetUnexclude'),
      (e.facetUpdateSort = 'facetUpdateSort'),
      (e.facetShowMore = 'showMoreFacetResults'),
      (e.facetShowLess = 'showLessFacetResults'),
      (e.queryError = 'query'),
      (e.queryErrorBack = 'errorBack'),
      (e.queryErrorClear = 'errorClearQuery'),
      (e.queryErrorRetry = 'errorRetry'),
      (e.recommendation = 'recommendation'),
      (e.recommendationInterfaceLoad = 'recommendationInterfaceLoad'),
      (e.recommendationOpen = 'recommendationOpen'),
      (e.likeSmartSnippet = 'likeSmartSnippet'),
      (e.dislikeSmartSnippet = 'dislikeSmartSnippet'),
      (e.expandSmartSnippet = 'expandSmartSnippet'),
      (e.collapseSmartSnippet = 'collapseSmartSnippet'),
      (e.openSmartSnippetFeedbackModal = 'openSmartSnippetFeedbackModal'),
      (e.closeSmartSnippetFeedbackModal = 'closeSmartSnippetFeedbackModal'),
      (e.sendSmartSnippetReason = 'sendSmartSnippetReason'),
      (e.expandSmartSnippetSuggestion = 'expandSmartSnippetSuggestion'),
      (e.collapseSmartSnippetSuggestion = 'collapseSmartSnippetSuggestion'),
      (e.showMoreSmartSnippetSuggestion = 'showMoreSmartSnippetSuggestion'),
      (e.showLessSmartSnippetSuggestion = 'showLessSmartSnippetSuggestion'),
      (e.openSmartSnippetSource = 'openSmartSnippetSource'),
      (e.openSmartSnippetSuggestionSource = 'openSmartSnippetSuggestionSource'),
      (e.openSmartSnippetInlineLink = 'openSmartSnippetInlineLink'),
      (e.openSmartSnippetSuggestionInlineLink =
        'openSmartSnippetSuggestionInlineLink'),
      (e.recentQueryClick = 'recentQueriesClick'),
      (e.clearRecentQueries = 'clearRecentQueries'),
      (e.recentResultClick = 'recentResultClick'),
      (e.clearRecentResults = 'clearRecentResults'),
      (e.noResultsBack = 'noResultsBack'),
      (e.showMoreFoldedResults = 'showMoreFoldedResults'),
      (e.showLessFoldedResults = 'showLessFoldedResults'),
      (e.copyToClipboard = 'copyToClipboard'),
      (e.caseAttach = 'caseAttach'),
      (e.caseDetach = 'caseDetach');
  })(E || (E = {}));
  var vm = {
      [E.triggerNotify]: 'queryPipelineTriggers',
      [E.triggerExecute]: 'queryPipelineTriggers',
      [E.triggerQuery]: 'queryPipelineTriggers',
      [E.triggerRedirect]: 'queryPipelineTriggers',
      [E.queryError]: 'errors',
      [E.queryErrorBack]: 'errors',
      [E.queryErrorClear]: 'errors',
      [E.queryErrorRetry]: 'errors',
      [E.pagerNext]: 'getMoreResults',
      [E.pagerPrevious]: 'getMoreResults',
      [E.pagerNumber]: 'getMoreResults',
      [E.pagerResize]: 'getMoreResults',
      [E.pagerScrolling]: 'getMoreResults',
      [E.facetSearch]: 'facet',
      [E.facetShowLess]: 'facet',
      [E.facetShowMore]: 'facet',
      [E.recommendation]: 'recommendation',
      [E.likeSmartSnippet]: 'smartSnippet',
      [E.dislikeSmartSnippet]: 'smartSnippet',
      [E.expandSmartSnippet]: 'smartSnippet',
      [E.collapseSmartSnippet]: 'smartSnippet',
      [E.openSmartSnippetFeedbackModal]: 'smartSnippet',
      [E.closeSmartSnippetFeedbackModal]: 'smartSnippet',
      [E.sendSmartSnippetReason]: 'smartSnippet',
      [E.expandSmartSnippetSuggestion]: 'smartSnippetSuggestions',
      [E.collapseSmartSnippetSuggestion]: 'smartSnippetSuggestions',
      [E.showMoreSmartSnippetSuggestion]: 'smartSnippetSuggestions',
      [E.showLessSmartSnippetSuggestion]: 'smartSnippetSuggestions',
      [E.clearRecentQueries]: 'recentQueries',
      [E.recentResultClick]: 'recentlyClickedDocuments',
      [E.clearRecentResults]: 'recentlyClickedDocuments',
      [E.showLessFoldedResults]: 'folding',
      [rd.expandToFullUI]: 'interface',
      [E.caseDetach]: 'case',
    },
    ad = class {
      constructor() {
        (this.runtime = new gm()), (this.currentVisitorId = '');
      }
      getPayload() {
        return Promise.resolve();
      }
      getParameters() {
        return Promise.resolve();
      }
      makeEvent(t) {
        return Promise.resolve({
          eventType: t,
          payload: null,
          log: () => Promise.resolve(),
        });
      }
      sendEvent() {
        return Promise.resolve();
      }
      makeSearchEvent() {
        return this.makeEvent(me.search);
      }
      sendSearchEvent() {
        return Promise.resolve();
      }
      makeClickEvent() {
        return this.makeEvent(me.click);
      }
      sendClickEvent() {
        return Promise.resolve();
      }
      makeCustomEvent() {
        return this.makeEvent(me.custom);
      }
      sendCustomEvent() {
        return Promise.resolve();
      }
      makeViewEvent() {
        return this.makeEvent(me.view);
      }
      sendViewEvent() {
        return Promise.resolve();
      }
      getVisit() {
        return Promise.resolve({id: '', visitorId: ''});
      }
      getHealth() {
        return Promise.resolve({status: ''});
      }
      registerBeforeSendEventHook() {}
      registerAfterSendEventHook() {}
      addEventTypeMapping() {}
    };
  function _b(e) {
    let t = '';
    return e.filter((r) => {
      let a = r !== t;
      return (t = r), a;
    });
  }
  function $b(e) {
    return e.map((t) => t.replace(/;/g, ''));
  }
  function Cm(e) {
    let t = 256,
      r = e.join(';');
    return r.length <= t ? r : Cm(e.slice(1));
  }
  var xm = (e) => {
    let t = $b(e),
      r = _b(t);
    return Cm(r);
  };
  function Rm(e) {
    let t =
        typeof e.partialQueries == 'string'
          ? e.partialQueries
          : xm(e.partialQueries),
      r = typeof e.suggestions == 'string' ? e.suggestions : xm(e.suggestions);
    return Object.assign(Object.assign({}, e), {
      partialQueries: t,
      suggestions: r,
    });
  }
  var nd = class {
      constructor(t, r) {
        (this.opts = t), (this.provider = r);
        let a = t.enableAnalytics === !1 || hm();
        this.coveoAnalyticsClient = a ? new ad() : new Nr(t);
      }
      disable() {
        this.coveoAnalyticsClient instanceof Nr &&
          this.coveoAnalyticsClient.clear(),
          (this.coveoAnalyticsClient = new ad());
      }
      enable() {
        this.coveoAnalyticsClient = new Nr(this.opts);
      }
      makeInterfaceLoad() {
        return this.makeSearchEvent(E.interfaceLoad);
      }
      logInterfaceLoad() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeInterfaceLoad()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeRecommendationInterfaceLoad() {
        return this.makeSearchEvent(E.recommendationInterfaceLoad);
      }
      logRecommendationInterfaceLoad() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeRecommendationInterfaceLoad()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeRecommendation() {
        return this.makeCustomEvent(E.recommendation);
      }
      logRecommendation() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeRecommendation()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeRecommendationOpen(t, r) {
        return this.makeClickEvent(E.recommendationOpen, t, r);
      }
      logRecommendationOpen(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeRecommendationOpen(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeStaticFilterClearAll(t) {
        return this.makeSearchEvent(E.staticFilterClearAll, t);
      }
      logStaticFilterClearAll(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeStaticFilterClearAll(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeStaticFilterSelect(t) {
        return this.makeSearchEvent(E.staticFilterSelect, t);
      }
      logStaticFilterSelect(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeStaticFilterSelect(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeStaticFilterDeselect(t) {
        return this.makeSearchEvent(E.staticFilterDeselect, t);
      }
      logStaticFilterDeselect(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeStaticFilterDeselect(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFetchMoreResults() {
        return this.makeCustomEvent(E.pagerScrolling, {type: 'getMoreResults'});
      }
      logFetchMoreResults() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFetchMoreResults()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeInterfaceChange(t) {
        return this.makeSearchEvent(E.interfaceChange, t);
      }
      logInterfaceChange(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeInterfaceChange(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeDidYouMeanAutomatic() {
        return this.makeSearchEvent(E.didyoumeanAutomatic);
      }
      logDidYouMeanAutomatic() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeDidYouMeanAutomatic()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeDidYouMeanClick() {
        return this.makeSearchEvent(E.didyoumeanClick);
      }
      logDidYouMeanClick() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeDidYouMeanClick()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeResultsSort(t) {
        return this.makeSearchEvent(E.resultsSort, t);
      }
      logResultsSort(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeResultsSort(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSearchboxSubmit() {
        return this.makeSearchEvent(E.searchboxSubmit);
      }
      logSearchboxSubmit() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchboxSubmit()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSearchboxClear() {
        return this.makeSearchEvent(E.searchboxClear);
      }
      logSearchboxClear() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchboxClear()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSearchboxAsYouType() {
        return this.makeSearchEvent(E.searchboxAsYouType);
      }
      logSearchboxAsYouType() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchboxAsYouType()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeBreadcrumbFacet(t) {
        return this.makeSearchEvent(E.breadcrumbFacet, t);
      }
      logBreadcrumbFacet(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeBreadcrumbFacet(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeBreadcrumbResetAll() {
        return this.makeSearchEvent(E.breadcrumbResetAll);
      }
      logBreadcrumbResetAll() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeBreadcrumbResetAll()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeDocumentQuickview(t, r) {
        return this.makeClickEvent(E.documentQuickview, t, r);
      }
      logDocumentQuickview(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeDocumentQuickview(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeDocumentOpen(t, r) {
        return this.makeClickEvent(E.documentOpen, t, r);
      }
      logDocumentOpen(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeDocumentOpen(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOmniboxAnalytics(t) {
        return this.makeSearchEvent(E.omniboxAnalytics, Rm(t));
      }
      logOmniboxAnalytics(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOmniboxAnalytics(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOmniboxFromLink(t) {
        return this.makeSearchEvent(E.omniboxFromLink, Rm(t));
      }
      logOmniboxFromLink(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOmniboxFromLink(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSearchFromLink() {
        return this.makeSearchEvent(E.searchFromLink);
      }
      logSearchFromLink() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchFromLink()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeTriggerNotify(t) {
        return this.makeCustomEvent(E.triggerNotify, t);
      }
      logTriggerNotify(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeTriggerNotify(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeTriggerExecute(t) {
        return this.makeCustomEvent(E.triggerExecute, t);
      }
      logTriggerExecute(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeTriggerExecute(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeTriggerQuery() {
        return this.makeCustomEvent(
          E.triggerQuery,
          {query: this.provider.getSearchEventRequestPayload().queryText},
          'queryPipelineTriggers'
        );
      }
      logTriggerQuery() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeTriggerQuery()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeUndoTriggerQuery(t) {
        return this.makeSearchEvent(E.undoTriggerQuery, t);
      }
      logUndoTriggerQuery(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeUndoTriggerQuery(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeTriggerRedirect(t) {
        return this.makeCustomEvent(
          E.triggerRedirect,
          Object.assign(Object.assign({}, t), {
            query: this.provider.getSearchEventRequestPayload().queryText,
          })
        );
      }
      logTriggerRedirect(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeTriggerRedirect(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makePagerResize(t) {
        return this.makeCustomEvent(E.pagerResize, t);
      }
      logPagerResize(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makePagerResize(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makePagerNumber(t) {
        return this.makeCustomEvent(E.pagerNumber, t);
      }
      logPagerNumber(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makePagerNumber(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makePagerNext(t) {
        return this.makeCustomEvent(E.pagerNext, t);
      }
      logPagerNext(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makePagerNext(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makePagerPrevious(t) {
        return this.makeCustomEvent(E.pagerPrevious, t);
      }
      logPagerPrevious(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makePagerPrevious(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makePagerScrolling() {
        return this.makeCustomEvent(E.pagerScrolling);
      }
      logPagerScrolling() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makePagerScrolling()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetClearAll(t) {
        return this.makeSearchEvent(E.facetClearAll, t);
      }
      logFacetClearAll(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetClearAll(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetSearch(t) {
        return this.makeSearchEvent(E.facetSearch, t);
      }
      logFacetSearch(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetSearch(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetSelect(t) {
        return this.makeSearchEvent(E.facetSelect, t);
      }
      logFacetSelect(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetSelect(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetDeselect(t) {
        return this.makeSearchEvent(E.facetDeselect, t);
      }
      logFacetDeselect(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetDeselect(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetExclude(t) {
        return this.makeSearchEvent(E.facetExclude, t);
      }
      logFacetExclude(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetExclude(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetUnexclude(t) {
        return this.makeSearchEvent(E.facetUnexclude, t);
      }
      logFacetUnexclude(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetUnexclude(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetSelectAll(t) {
        return this.makeSearchEvent(E.facetSelectAll, t);
      }
      logFacetSelectAll(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetSelectAll(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetUpdateSort(t) {
        return this.makeSearchEvent(E.facetUpdateSort, t);
      }
      logFacetUpdateSort(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetUpdateSort(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetShowMore(t) {
        return this.makeCustomEvent(E.facetShowMore, t);
      }
      logFacetShowMore(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetShowMore(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeFacetShowLess(t) {
        return this.makeCustomEvent(E.facetShowLess, t);
      }
      logFacetShowLess(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeFacetShowLess(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeQueryError(t) {
        return this.makeCustomEvent(E.queryError, t);
      }
      logQueryError(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeQueryError(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeQueryErrorBack() {
        return F(this, void 0, void 0, function* () {
          let t = yield this.makeCustomEvent(E.queryErrorBack);
          return {
            description: t.description,
            log: () =>
              F(this, void 0, void 0, function* () {
                return (
                  yield t.log({searchUID: this.provider.getSearchUID()}),
                  this.logSearchEvent(E.queryErrorBack)
                );
              }),
          };
        });
      }
      logQueryErrorBack() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeQueryErrorBack()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeQueryErrorRetry() {
        return F(this, void 0, void 0, function* () {
          let t = yield this.makeCustomEvent(E.queryErrorRetry);
          return {
            description: t.description,
            log: () =>
              F(this, void 0, void 0, function* () {
                return (
                  yield t.log({searchUID: this.provider.getSearchUID()}),
                  this.logSearchEvent(E.queryErrorRetry)
                );
              }),
          };
        });
      }
      logQueryErrorRetry() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeQueryErrorRetry()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeQueryErrorClear() {
        return F(this, void 0, void 0, function* () {
          let t = yield this.makeCustomEvent(E.queryErrorClear);
          return {
            description: t.description,
            log: () =>
              F(this, void 0, void 0, function* () {
                return (
                  yield t.log({searchUID: this.provider.getSearchUID()}),
                  this.logSearchEvent(E.queryErrorClear)
                );
              }),
          };
        });
      }
      logQueryErrorClear() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeQueryErrorClear()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeLikeSmartSnippet() {
        return this.makeCustomEvent(E.likeSmartSnippet);
      }
      logLikeSmartSnippet() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeLikeSmartSnippet()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeDislikeSmartSnippet() {
        return this.makeCustomEvent(E.dislikeSmartSnippet);
      }
      logDislikeSmartSnippet() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeDislikeSmartSnippet()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeExpandSmartSnippet() {
        return this.makeCustomEvent(E.expandSmartSnippet);
      }
      logExpandSmartSnippet() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeExpandSmartSnippet()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeCollapseSmartSnippet() {
        return this.makeCustomEvent(E.collapseSmartSnippet);
      }
      logCollapseSmartSnippet() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCollapseSmartSnippet()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOpenSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(E.openSmartSnippetFeedbackModal);
      }
      logOpenSmartSnippetFeedbackModal() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOpenSmartSnippetFeedbackModal()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeCloseSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(E.closeSmartSnippetFeedbackModal);
      }
      logCloseSmartSnippetFeedbackModal() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCloseSmartSnippetFeedbackModal()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSmartSnippetFeedbackReason(t, r) {
        return this.makeCustomEvent(E.sendSmartSnippetReason, {
          reason: t,
          details: r,
        });
      }
      logSmartSnippetFeedbackReason(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSmartSnippetFeedbackReason(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeExpandSmartSnippetSuggestion(t) {
        return this.makeCustomEvent(
          E.expandSmartSnippetSuggestion,
          'documentId' in t ? t : {documentId: t}
        );
      }
      logExpandSmartSnippetSuggestion(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeExpandSmartSnippetSuggestion(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeCollapseSmartSnippetSuggestion(t) {
        return this.makeCustomEvent(
          E.collapseSmartSnippetSuggestion,
          'documentId' in t ? t : {documentId: t}
        );
      }
      logCollapseSmartSnippetSuggestion(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCollapseSmartSnippetSuggestion(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeShowMoreSmartSnippetSuggestion(t) {
        return this.makeCustomEvent(E.showMoreSmartSnippetSuggestion, t);
      }
      logShowMoreSmartSnippetSuggestion(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeShowMoreSmartSnippetSuggestion(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeShowLessSmartSnippetSuggestion(t) {
        return this.makeCustomEvent(E.showLessSmartSnippetSuggestion, t);
      }
      logShowLessSmartSnippetSuggestion(t) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeShowLessSmartSnippetSuggestion(t)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOpenSmartSnippetSource(t, r) {
        return this.makeClickEvent(E.openSmartSnippetSource, t, r);
      }
      logOpenSmartSnippetSource(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOpenSmartSnippetSource(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOpenSmartSnippetSuggestionSource(t, r) {
        return this.makeClickEvent(
          E.openSmartSnippetSuggestionSource,
          t,
          {
            contentIDKey: r.documentId.contentIdKey,
            contentIDValue: r.documentId.contentIdValue,
          },
          r
        );
      }
      makeCopyToClipboard(t, r) {
        return this.makeClickEvent(E.copyToClipboard, t, r);
      }
      logCopyToClipboard(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCopyToClipboard(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      logOpenSmartSnippetSuggestionSource(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOpenSmartSnippetSuggestionSource(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOpenSmartSnippetInlineLink(t, r) {
        return this.makeClickEvent(
          E.openSmartSnippetInlineLink,
          t,
          {contentIDKey: r.contentIDKey, contentIDValue: r.contentIDValue},
          r
        );
      }
      logOpenSmartSnippetInlineLink(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOpenSmartSnippetInlineLink(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeOpenSmartSnippetSuggestionInlineLink(t, r) {
        return this.makeClickEvent(
          E.openSmartSnippetSuggestionInlineLink,
          t,
          {
            contentIDKey: r.documentId.contentIdKey,
            contentIDValue: r.documentId.contentIdValue,
          },
          r
        );
      }
      logOpenSmartSnippetSuggestionInlineLink(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeOpenSmartSnippetSuggestionInlineLink(
            t,
            r
          )).log({searchUID: this.provider.getSearchUID()});
        });
      }
      makeRecentQueryClick() {
        return this.makeSearchEvent(E.recentQueryClick);
      }
      logRecentQueryClick() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeRecentQueryClick()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeClearRecentQueries() {
        return this.makeCustomEvent(E.clearRecentQueries);
      }
      logClearRecentQueries() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeClearRecentQueries()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeRecentResultClick(t, r) {
        return this.makeCustomEvent(E.recentResultClick, {
          info: t,
          identifier: r,
        });
      }
      logRecentResultClick(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeRecentResultClick(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeClearRecentResults() {
        return this.makeCustomEvent(E.clearRecentResults);
      }
      logClearRecentResults() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeClearRecentResults()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeNoResultsBack() {
        return this.makeSearchEvent(E.noResultsBack);
      }
      logNoResultsBack() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeNoResultsBack()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeShowMoreFoldedResults(t, r) {
        return this.makeClickEvent(E.showMoreFoldedResults, t, r);
      }
      logShowMoreFoldedResults(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeShowMoreFoldedResults(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeShowLessFoldedResults() {
        return this.makeCustomEvent(E.showLessFoldedResults);
      }
      logShowLessFoldedResults() {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeShowLessFoldedResults()).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeEventDescription(t, r) {
        var a;
        return {
          actionCause: r,
          customData:
            (a = t.payload) === null || a === void 0 ? void 0 : a.customData,
        };
      }
      makeCustomEvent(t, r, a = vm[t]) {
        return F(this, void 0, void 0, function* () {
          this.coveoAnalyticsClient.getParameters;
          let n = Object.assign(
              Object.assign({}, this.provider.getBaseMetadata()),
              r
            ),
            o = Object.assign(
              Object.assign({}, yield this.getBaseEventRequest(n)),
              {eventType: a, eventValue: t}
            ),
            i = yield this.coveoAnalyticsClient.makeCustomEvent(o);
          return {
            description: this.makeEventDescription(i, t),
            log: ({searchUID: s}) => i.log({lastSearchQueryUid: s}),
          };
        });
      }
      logCustomEvent(t, r, a = vm[t]) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCustomEvent(t, r, a)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeCustomEventWithType(t, r, a) {
        return F(this, void 0, void 0, function* () {
          let n = Object.assign(
              Object.assign({}, this.provider.getBaseMetadata()),
              a
            ),
            o = Object.assign(
              Object.assign({}, yield this.getBaseEventRequest(n)),
              {eventType: r, eventValue: t}
            ),
            i = yield this.coveoAnalyticsClient.makeCustomEvent(o);
          return {
            description: this.makeEventDescription(i, t),
            log: ({searchUID: s}) => i.log({lastSearchQueryUid: s}),
          };
        });
      }
      logCustomEventWithType(t, r, a) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeCustomEventWithType(t, r, a)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      logSearchEvent(t, r) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeSearchEvent(t, r)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      makeSearchEvent(t, r) {
        return F(this, void 0, void 0, function* () {
          let a = yield this.getBaseSearchEventRequest(t, r),
            n = yield this.coveoAnalyticsClient.makeSearchEvent(a);
          return {
            description: this.makeEventDescription(n, t),
            log: ({searchUID: o}) => n.log({searchQueryUid: o}),
          };
        });
      }
      makeClickEvent(t, r, a, n) {
        return F(this, void 0, void 0, function* () {
          let o = Object.assign(
              Object.assign(
                Object.assign({}, r),
                yield this.getBaseEventRequest(
                  Object.assign(Object.assign({}, a), n)
                )
              ),
              {queryPipeline: this.provider.getPipeline(), actionCause: t}
            ),
            i = yield this.coveoAnalyticsClient.makeClickEvent(o);
          return {
            description: this.makeEventDescription(i, t),
            log: ({searchUID: s}) => i.log({searchQueryUid: s}),
          };
        });
      }
      logClickEvent(t, r, a, n) {
        return F(this, void 0, void 0, function* () {
          return (yield this.makeClickEvent(t, r, a, n)).log({
            searchUID: this.provider.getSearchUID(),
          });
        });
      }
      getBaseSearchEventRequest(t, r) {
        return F(this, void 0, void 0, function* () {
          return Object.assign(
            Object.assign(
              Object.assign({}, yield this.getBaseEventRequest(r)),
              this.provider.getSearchEventRequestPayload()
            ),
            {queryPipeline: this.provider.getPipeline(), actionCause: t}
          );
        });
      }
      getBaseEventRequest(t) {
        return F(this, void 0, void 0, function* () {
          let r = Object.assign(
            Object.assign({}, this.provider.getBaseMetadata()),
            t
          );
          return Object.assign(
            Object.assign(
              Object.assign({}, this.getOrigins()),
              this.getSplitTestRun()
            ),
            {
              customData: r,
              language: this.provider.getLanguage(),
              facetState: this.provider.getFacetState
                ? this.provider.getFacetState()
                : [],
              anonymous: this.provider.getIsAnonymous(),
              clientId: yield this.getClientId(),
            }
          );
        });
      }
      getOrigins() {
        var t, r;
        return {
          originContext:
            (r = (t = this.provider).getOriginContext) === null || r === void 0
              ? void 0
              : r.call(t),
          originLevel1: this.provider.getOriginLevel1(),
          originLevel2: this.provider.getOriginLevel2(),
          originLevel3: this.provider.getOriginLevel3(),
        };
      }
      getClientId() {
        return this.coveoAnalyticsClient instanceof Nr
          ? this.coveoAnalyticsClient.getCurrentVisitorId()
          : void 0;
      }
      getSplitTestRun() {
        let t = this.provider.getSplitTestRunName
            ? this.provider.getSplitTestRunName()
            : '',
          r = this.provider.getSplitTestRunVersion
            ? this.provider.getSplitTestRunVersion()
            : '';
        return Object.assign(
          Object.assign({}, t && {splitTestRunName: t}),
          r && {splitTestRunVersion: r}
        );
      }
    },
    bm = (e) =>
      `${e.protocol}//${e.hostname}${
        e.pathname.indexOf('/') === 0 ? e.pathname : `/${e.pathname}`
      }${e.search}`,
    li = {pageview: 'pageview', event: 'event'},
    Fm = class {
      constructor({client: t, uuidGenerator: r = Ja}) {
        (this.actionData = {}),
          (this.client = t),
          (this.uuidGenerator = r),
          (this.pageViewId = r()),
          (this.nextPageViewId = this.pageViewId),
          (this.currentLocation = bm(window.location)),
          (this.lastReferrer = si() ? document.referrer : ''),
          this.addHooks();
      }
      setAction(t, r) {
        (this.action = t), (this.actionData = r);
      }
      clearData() {
        this.clearPluginData(), (this.action = void 0), (this.actionData = {});
      }
      getLocationInformation(t, r) {
        return Object.assign({hitType: t}, this.getNextValues(t, r));
      }
      updateLocationInformation(t, r) {
        this.updateLocationForNextPageView(t, r);
      }
      getDefaultContextInformation(t) {
        let r = {
            title: si() ? document.title : '',
            encoding: si() ? document.characterSet : 'UTF-8',
          },
          a = {
            screenResolution: `${screen.width}x${screen.height}`,
            screenColor: `${screen.colorDepth}-bit`,
          },
          n = {language: navigator.language, userAgent: navigator.userAgent},
          o = {time: Date.now().toString(), eventId: this.uuidGenerator()};
        return Object.assign(
          Object.assign(Object.assign(Object.assign({}, o), a), n),
          r
        );
      }
      updateLocationForNextPageView(t, r) {
        let {
          pageViewId: a,
          referrer: n,
          location: o,
        } = this.getNextValues(t, r);
        (this.lastReferrer = n),
          (this.pageViewId = a),
          (this.currentLocation = o),
          t === li.pageview &&
            ((this.nextPageViewId = this.uuidGenerator()),
            (this.hasSentFirstPageView = !0));
      }
      getNextValues(t, r) {
        return {
          pageViewId: t === li.pageview ? this.nextPageViewId : this.pageViewId,
          referrer:
            t === li.pageview && this.hasSentFirstPageView
              ? this.currentLocation
              : this.lastReferrer,
          location:
            t === li.pageview
              ? this.getCurrentLocationFromPayload(r)
              : this.currentLocation,
        };
      }
      getCurrentLocationFromPayload(t) {
        if (t.page) {
          let r = (n) => n.replace(/^\/?(.*)$/, '/$1');
          return `${((n) => n.split('/').slice(0, 3).join('/'))(
            this.currentLocation
          )}${r(t.page)}`;
        } else return bm(window.location);
      }
    },
    as = Object.assign({}, li),
    Am = Object.keys(as).map((e) => as[e]),
    Pm = class extends Fm {
      constructor({client: t, uuidGenerator: r = Ja}) {
        super({client: t, uuidGenerator: r});
        this.ticket = {};
      }
      addHooks() {
        this.addHooksForEvent(),
          this.addHooksForPageView(),
          this.addHooksForSVCEvents();
      }
      setTicket(t) {
        this.ticket = t;
      }
      clearPluginData() {
        this.ticket = {};
      }
      addHooksForSVCEvents() {
        this.client.registerBeforeSendEventHook((t, ...[r]) =>
          Am.indexOf(t) !== -1 ? this.addSVCDataToPayload(t, r) : r
        ),
          this.client.registerAfterSendEventHook(
            (t, ...[r]) => (
              Am.indexOf(t) !== -1 && this.updateLocationInformation(t, r), r
            )
          );
      }
      addHooksForPageView() {
        this.client.addEventTypeMapping(as.pageview, {
          newEventType: me.collect,
          variableLengthArgumentsNames: ['page'],
          addVisitorIdParameter: !0,
          usesMeasurementProtocol: !0,
        });
      }
      addHooksForEvent() {
        this.client.addEventTypeMapping(as.event, {
          newEventType: me.collect,
          variableLengthArgumentsNames: [
            'eventCategory',
            'eventAction',
            'eventLabel',
            'eventValue',
          ],
          addVisitorIdParameter: !0,
          usesMeasurementProtocol: !0,
        });
      }
      addSVCDataToPayload(t, r) {
        var a;
        let n = Object.assign(
            Object.assign(
              Object.assign(
                Object.assign({}, this.getLocationInformation(t, r)),
                this.getDefaultContextInformation(t)
              ),
              this.action ? {svcAction: this.action} : {}
            ),
            Object.keys((a = this.actionData) !== null && a !== void 0 ? a : {})
              .length > 0
              ? {svcActionData: this.actionData}
              : {}
          ),
          o = this.getTicketPayload();
        return (
          this.clearData(),
          Object.assign(Object.assign(Object.assign({}, o), n), r)
        );
      }
      getTicketPayload() {
        return JR(this.ticket);
      }
    };
  Pm.Id = 'svc';
  var Im;
  (function (e) {
    (e.click = 'click'), (e.flowStart = 'flowStart');
  })(Im || (Im = {}));
  var Em;
  (function (e) {
    (e.enterInterface = 'ticket_create_start'),
      (e.fieldUpdate = 'ticket_field_update'),
      (e.fieldSuggestionClick = 'ticket_classification_click'),
      (e.suggestionClick = 'suggestion_click'),
      (e.suggestionRate = 'suggestion_rate'),
      (e.nextCaseStep = 'ticket_next_stage'),
      (e.caseCancelled = 'ticket_cancel'),
      (e.caseSolved = 'ticket_cancel'),
      (e.caseCreated = 'ticket_create');
  })(Em || (Em = {}));
  var wm;
  (function (e) {
    (e.quit = 'Quit'), (e.solved = 'Solved');
  })(wm || (wm = {}));
  var vt = (e, t) => {
      if ('productListing' in e && e.productListing)
        return e.productListing.facets.results.find((r) => r.facetId === t);
      if ('search' in e && e.search)
        return e.search.response.facets.find((r) => r.facetId === t);
    },
    ns = (e, t) => {
      var r;
      return (r = e.facetSet[t]) == null ? void 0 : r.request;
    };
  function Hb(e, t) {
    return !!t && t.facetId in e.facetSet;
  }
  var di = (e, t) => {
      let r = vt(e, t);
      if (Hb(e, r)) return r;
    },
    os = (e, t) => {
      let r = di(e, t);
      return r ? r.values.filter((a) => a.state === 'selected') : [];
    },
    Nt = (e) =>
      'productListing' in e ? e.productListing.isLoading : e.search.isLoading;
  function Xe(e) {
    if (!e) return {parents: [], values: []};
    let t = [],
      r = e;
    for (; r.length && r[0].children.length; )
      (t = [...t, ...r]), (r = r[0].children);
    let a = r.find((n) => n.state === 'selected');
    return a && ((t = [...t, a]), (r = [])), {parents: t, values: r};
  }
  function zb(e, t) {
    return !!t && t.facetId in e.categoryFacetSet;
  }
  var od = (e, t) => {
      let r = vt(e, t);
      if (zb(e, r)) return r;
    },
    id = (e, t) => {
      var r;
      return (r = e.categoryFacetSet[t]) == null ? void 0 : r.request;
    },
    km = (e, t) => {
      let r = od(e, t);
      return Xe(r == null ? void 0 : r.values).parents;
    },
    sd = (e, t) => {
      let r = id(e, t);
      return Xe(r == null ? void 0 : r.currentValues).parents;
    };
  function Ct() {
    return {};
  }
  function Om(e) {
    return {request: e};
  }
  function xt() {
    return {};
  }
  function qm(e) {
    return {request: e};
  }
  function Rt() {
    return {};
  }
  function Tm(e) {
    return {request: e, hasBreadcrumbs: !0};
  }
  function bt() {
    return {};
  }
  var Sa = (e, t) => {
    let r = Vm(t, e),
      a = r ? r.field : '',
      n = `${a}_${e}`;
    return {facetId: e, facetField: a, facetTitle: n};
  };
  function is(e, t) {
    let {facetId: r, facetValue: a} = e,
      n = Sa(r, t),
      o = Nm(t, r);
    return {...n, facetValue: o === 'hierarchical' ? Dm(t, r) : a};
  }
  function at(e) {
    return {
      facetSet: e.facetSet || bt(),
      categoryFacetSet: e.categoryFacetSet || Ct(),
      dateFacetSet: e.dateFacetSet || xt(),
      numericFacetSet: e.numericFacetSet || Rt(),
    };
  }
  var cd = (e) => {
      let t = [];
      return (
        Kb(e).forEach((r, a) => {
          let n = Nm(e, r.facetId),
            o = eF(r, a + 1);
          if (Yb(r)) {
            if (!!!sd(e, r.facetId).length) return;
            t.push({
              ...o,
              ...Zb(e, r.facetId),
              facetType: n,
              state: 'selected',
            });
            return;
          }
          r.currentValues.forEach((i, s) => {
            if (i.state === 'idle') return;
            let u = Gb(i, s + 1, n),
              c = Wb(r) ? Xb(i) : Jb(i);
            t.push({...o, ...u, ...c});
          });
        }),
        t
      );
    },
    Wb = (e) => e.type === 'specific',
    Yb = (e) => e.type === 'hierarchical',
    Kb = (e) =>
      [
        ...Object.values(e.facetSet),
        ...Object.values(e.categoryFacetSet),
        ...Object.values(e.dateFacetSet),
        ...Object.values(e.numericFacetSet),
      ].map((t) => t.request),
    Gb = (e, t, r) => ({state: e.state, valuePosition: t, facetType: r}),
    Jb = (e) => ({
      displayValue: `${e.start}..${e.end}`,
      value: `${e.start}..${e.end}`,
      start: e.start,
      end: e.end,
      endInclusive: e.endInclusive,
    }),
    Xb = (e) => ({displayValue: e.value, value: e.value}),
    Dm = (e, t) =>
      sd(e, t)
        .map((a) => a.value)
        .join(';'),
    Zb = (e, t) => {
      let r = 1,
        a = Dm(e, t);
      return {value: a, valuePosition: r, displayValue: a};
    },
    eF = (e, t) => ({
      title: `${e.field}_${e.facetId}`,
      field: e.field,
      id: e.facetId,
      facetPosition: t,
    }),
    Vm = (e, t) => {
      var r, a, n, o;
      return (
        ((r = e.facetSet[t]) == null ? void 0 : r.request) ||
        ((a = e.categoryFacetSet[t]) == null ? void 0 : a.request) ||
        ((n = e.dateFacetSet[t]) == null ? void 0 : n.request) ||
        ((o = e.numericFacetSet[t]) == null ? void 0 : o.request)
      );
    },
    Nm = (e, t) => {
      let r = Vm(e, t);
      return r ? r.type : 'specific';
    };
  var ve = () => ({q: '', enableQuerySyntax: !1});
  function Xa() {
    return {
      answerSnippet: '',
      documentId: {contentIdKey: '', contentIdValue: ''},
      question: '',
      relatedQuestions: [],
      score: 0,
    };
  }
  function Ze() {
    return {
      response: {
        results: [],
        searchUid: '',
        totalCountFiltered: 0,
        facets: [],
        queryCorrections: [],
        triggers: [],
        questionAnswer: Xa(),
        pipeline: '',
        splitTestRun: '',
        termsToHighlight: {},
      },
      duration: 0,
      queryExecuted: '',
      error: null,
      automaticallyCorrected: !1,
      isLoading: !1,
      results: [],
      searchResponseId: '',
      requestId: '',
      questionAnswer: Xa(),
    };
  }
  var Ee = () => 'default';
  var Za = '2.8.4';
  var tF = (e) => {
      let t = e.configuration.search.locale.split('-')[0];
      return !t || t.length !== 2 ? 'en' : t;
    },
    Mr = class {
      constructor(t) {
        this.getState = t;
        this.state = t();
      }
      getLanguage() {
        return tF(this.state);
      }
      getBaseMetadata() {
        let {context: t} = this.state,
          r = (t == null ? void 0 : t.contextValues) || {},
          a = {};
        for (let [n, o] of Object.entries(r)) {
          let i = `context_${n}`;
          a[i] = o;
        }
        return (a.coveoHeadlessVersion = Za), a;
      }
      getOriginContext() {
        return this.state.configuration.analytics.originContext;
      }
      getOriginLevel1() {
        return this.state.searchHub || Ee();
      }
      getOriginLevel2() {
        return this.state.configuration.analytics.originLevel2;
      }
      getOriginLevel3() {
        return this.state.configuration.analytics.originLevel3;
      }
      getIsAnonymous() {
        return this.state.configuration.analytics.anonymous;
      }
    };
  var ss = class extends Mr {
      getFacetState() {
        return cd(at(this.getState()));
      }
      getPipeline() {
        var t;
        return (
          this.state.pipeline ||
          ((t = this.state.search) == null ? void 0 : t.response.pipeline) ||
          ss.fallbackPipelineName
        );
      }
      getSearchEventRequestPayload() {
        return {
          queryText: this.queryText,
          responseTime: this.responseTime,
          results: this.mapResultsToAnalyticsDocument(),
          numberOfResults: this.numberOfResults,
        };
      }
      getSearchUID() {
        var r, a;
        let t = this.getState();
        return (
          ((r = t.search) == null ? void 0 : r.searchResponseId) ||
          ((a = t.search) == null ? void 0 : a.response.searchUid) ||
          Ze().response.searchUid
        );
      }
      getSplitTestRunName() {
        var t;
        return (t = this.state.search) == null
          ? void 0
          : t.response.splitTestRun;
      }
      getSplitTestRunVersion() {
        var a;
        let t = !!this.getSplitTestRunName(),
          r =
            ((a = this.state.search) == null ? void 0 : a.response.pipeline) ||
            this.state.pipeline ||
            ss.fallbackPipelineName;
        return t ? r : void 0;
      }
      mapResultsToAnalyticsDocument() {
        var t;
        return (t = this.state.search) == null
          ? void 0
          : t.response.results.map((r) => ({
              documentUri: r.uri,
              documentUriHash: r.raw.urihash,
            }));
      }
      get queryText() {
        var t;
        return ((t = this.state.query) == null ? void 0 : t.q) || ve().q;
      }
      get responseTime() {
        var t;
        return (
          ((t = this.state.search) == null ? void 0 : t.duration) ||
          Ze().duration
        );
      }
      get numberOfResults() {
        var t;
        return (
          ((t = this.state.search) == null
            ? void 0
            : t.response.results.length) || Ze().response.results.length
        );
      }
    },
    ya = ss;
  ya.fallbackPipelineName = 'default';
  var Mm = ({
      logger: e,
      getState: t,
      analyticsClientMiddleware: r = (o, i) => i,
      preprocessRequest: a,
      provider: n = new ya(t),
    }) => {
      let o = t(),
        i = o.configuration.accessToken,
        s = o.configuration.analytics.apiBaseUrl,
        u = o.configuration.analytics.runtimeEnvironment,
        c = o.configuration.analytics.enabled,
        l = new nd(
          {
            token: i,
            endpoint: s,
            runtimeEnvironment: u,
            preprocessRequest: a,
            beforeSendHooks: [
              r,
              (p, f) => (
                e.info(
                  {...f, type: p, endpoint: s, token: i},
                  'Analytics request'
                ),
                f
              ),
            ],
          },
          n
        );
      return c || l.disable(), l;
    },
    Fe = (e) => new Nr(e).getCurrentVisitorId(),
    ud = (e) => {
      let t = new Nr(e);
      t.clear(), t.deleteHttpOnlyVisitorId();
    },
    Ft = new ts.HistoryStore(),
    ld = () => {
      let t = Ft.getHistory()
        .reverse()
        .find((r) => r.name === 'PageView' && r.value);
      return t ? t.value : '';
    };
  function Mt(e) {
    let {
      url: t,
      accessToken: r,
      organizationId: a,
      authentication: n,
      ...o
    } = e;
    return o;
  }
  var gr = (e) => {
      let {response: t} = e;
      return t.body ? rF(e) : aF(t);
    },
    rF = (e) =>
      oF(e)
        ? iF(e)
        : nF(e)
        ? e.body
        : {message: 'unknown', statusCode: 0, type: 'unknown'},
    aF = (e) => {
      let t = JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e)));
      return {
        ...t,
        message: `Client side error: ${t.message || ''}`,
        statusCode: 400,
        type: 'ClientError',
      };
    };
  function nF(e) {
    return e.body.statusCode !== void 0;
  }
  function oF(e) {
    return e.body.exception !== void 0;
  }
  var iF = (e) => ({
    message: e.body.exception.code,
    statusCode: e.response.status,
    type: e.body.exception.code,
  });
  var Gm = be(Lm()),
    Jm = be(Wm());
  var D = new Error('Failed to load reducers.'),
    mi = class extends Error {
      constructor() {
        super();
        (this.name = 'ExpiredToken'),
          (this.message =
            'The token being used to perform the request is expired.');
      }
    },
    en = class extends Error {
      constructor(t, r) {
        super();
        (this.name = 'Disconnected'),
          (this.message = `Client could not connect to the following URL: ${t}`),
          (this.statusCode = r != null ? r : 0);
      }
    };
  function Ym(e) {
    let t = [];
    for (let r in e) {
      let a = encodeURIComponent(r),
        n = encodeURIComponent(e[r]);
      t.push(`${a}=${n}`);
    }
    return t.join('&');
  }
  function Km(e) {
    return typeof e != 'object' || !e ? !1 : Object.values(e).every(qF);
  }
  function qF(e) {
    return (
      typeof e == 'string' || typeof e == 'number' || typeof e == 'boolean'
    );
  }
  function Xm(e) {
    return e === 429;
  }
  var nt = class {
    static async call(t) {
      let r = TF(t),
        {origin: a, preprocessRequest: n, logger: o, requestMetadata: i} = t,
        s = {...r, ...(n ? await n(r, a, i) : {})};
      o.info(s, 'Platform request');
      let {url: u, ...c} = s,
        l = async () => {
          let p = await (0, Gm.default)(u, c);
          if (Xm(p.status)) throw p;
          return p;
        };
      try {
        let p = await (0, Jm.backOff)(l, {
          retry: (f) => {
            let d = f && Xm(f.status);
            return d && o.info('Platform retrying request'), d;
          },
        });
        if (p.status === 419)
          throw (o.info('Platform renewing token'), new mi());
        if (p.status === 404) throw new en(u, p.status);
        return o.info({response: p, requestInfo: s}, 'Platform response'), p;
      } catch (p) {
        return p.message === 'Failed to fetch' ? new en(u) : p;
      }
    }
  };
  function Zm(e, t) {
    let r =
        !t || !t.environment || t.environment === 'prod' ? '' : t.environment,
      a = !t || !t.region || t.region === 'us' ? '' : `-${t.region}`;
    return `https://${e}${r}${a}.cloud.coveo.com`;
  }
  function gi(e) {
    return (e == null ? void 0 : e.multiRegionSubDomain)
      ? `https://${e.multiRegionSubDomain}.org.coveo.com`
      : Zm('platform', e);
  }
  function us(e) {
    return Zm('analytics', e);
  }
  function TF(e) {
    let {
        url: t,
        method: r,
        requestParams: a,
        contentType: n,
        accessToken: o,
        signal: i,
      } = e,
      s = e.method === 'POST' || e.method === 'PUT',
      u = DF(a, n);
    return {
      url: t,
      method: r,
      headers: {'Content-Type': n, Authorization: `Bearer ${o}`, ...e.headers},
      ...(s && {body: u}),
      signal: i,
    };
  }
  function DF(e, t) {
    return t === 'application/x-www-form-urlencoded'
      ? Km(e)
        ? Ym(e)
        : ''
      : JSON.stringify(e);
  }
  var eg = TextDecoder;
  var vd = class {
    constructor(t) {
      this._params = {};
      this._basePath = t;
    }
    addParam(t, r) {
      this._params = {...this.params, [t]: r};
    }
    get basePath() {
      return this._basePath;
    }
    get params() {
      return this._params;
    }
    get hasParams() {
      return Object.entries(this._params).length;
    }
    get href() {
      return this.hasParams
        ? `${this.basePath}?${Object.entries(this.params)
            .map(([t, r]) => `${t}=${encodeURIComponent(r)}`)
            .join('&')}`
        : this.basePath;
    }
  };
  function tg(e) {
    return (
      (
        (e.headers.get('content-type') || '')
          .split(';')
          .find((a) => a.indexOf('charset=') !== -1) || ''
      ).split('=')[1] || 'UTF-8'
    );
  }
  var Qt = (e, t, r, a) => ({
      accessToken: e.accessToken,
      method: t,
      contentType: r,
      url: `${e.url}${a}?${VF(e)}${e.authentication ? `&${NF(e)}` : ''}`,
      origin: 'searchApiFetch',
    }),
    VF = (e) => `organizationId=${e.organizationId}`,
    NF = (e) => `authentication=${encodeURIComponent(e.authentication)}`;
  var rg = (e, t) => {
      let r = new vd(`${e.url}${t}`);
      return (
        r.addParam('access_token', e.accessToken),
        r.addParam('organizationId', e.organizationId),
        r.addParam('uniqueId', e.uniqueId),
        e.q !== void 0 && r.addParam('q', e.q),
        e.enableNavigation !== void 0 &&
          r.addParam('enableNavigation', `${e.enableNavigation}`),
        e.requestedOutputSize !== void 0 &&
          r.addParam('requestedOutputSize', `${e.requestedOutputSize}`),
        e.visitorId !== void 0 && r.addParam('visitorId', `${e.visitorId}`),
        r.href
      );
    },
    ag = async (e, t) => {
      let r = await nt.call({
        ...Qt(e, 'POST', 'application/x-www-form-urlencoded', '/html'),
        requestParams: Mt(e),
        requestMetadata: {method: 'html'},
        ...t,
      });
      if (r instanceof Error) throw r;
      let a = tg(r),
        n = await r.arrayBuffer(),
        i = new eg(a).decode(n);
      return MF(i) ? {success: i} : {error: gr({response: r, body: i})};
    };
  function MF(e) {
    return typeof e == 'string';
  }
  function QF(e) {
    return {statusCode: e.statusCode, type: e.name, message: e.message};
  }
  function LF(e) {
    return {statusCode: e.code, type: e.name, message: e.message, ignored: !0};
  }
  function hi(e, t) {
    if (t && e.name === 'AbortError') return {error: LF(e)};
    if (e instanceof en) return {error: QF(e)};
    throw e;
  }
  var Si = class {
      constructor(t) {
        this.options = t;
        this.searchAbortController = null;
      }
      async plan(t) {
        let r = await nt.call({
          ...Qt(t, 'POST', 'application/json', '/plan'),
          requestParams: Mt(t),
          requestMetadata: {method: 'plan'},
          ...this.options,
        });
        if (r instanceof Error) return hi(r);
        let a = await r.json();
        return UF(a) ? {success: a} : {error: gr({response: r, body: a})};
      }
      async querySuggest(t) {
        let r = await nt.call({
          ...Qt(t, 'POST', 'application/json', '/querySuggest'),
          requestMetadata: {method: 'querySuggest'},
          requestParams: Mt(t),
          ...this.options,
        });
        if (r instanceof Error) return hi(r);
        let a = await r.json(),
          n = {response: r, body: a};
        return jF(a)
          ? {
              success: (
                await this.options.postprocessQuerySuggestResponseMiddleware(n)
              ).body,
            }
          : {error: gr(n)};
      }
      async search(t, r) {
        var i;
        this.searchAbortController &&
          (!(r == null ? void 0 : r.disableAbortWarning) &&
            this.options.logger.warn('Cancelling current pending search query'),
          this.searchAbortController.abort()),
          (this.searchAbortController =
            this.getAbortControllerInstanceIfAvailable());
        let a = await nt.call({
          ...Qt(t, 'POST', 'application/json', ''),
          requestParams: Mt(t),
          requestMetadata: {
            method: 'search',
            origin: r == null ? void 0 : r.origin,
          },
          ...this.options,
          signal: (i = this.searchAbortController) == null ? void 0 : i.signal,
        });
        if (a instanceof Error)
          return hi(a, r == null ? void 0 : r.disableAbortWarning);
        this.searchAbortController = null;
        let n = await a.json(),
          o = {response: a, body: n};
        return xd(n)
          ? ((o.body = _F(n)),
            {
              success: (
                await this.options.postprocessSearchResponseMiddleware(o)
              ).body,
            })
          : {error: gr(o)};
      }
      async facetSearch(t) {
        let r = await nt.call({
          ...Qt(t, 'POST', 'application/json', '/facet'),
          requestParams: Mt(t),
          requestMetadata: {method: 'facetSearch'},
          ...this.options,
        });
        if (r instanceof Error) throw r;
        let a = await r.json(),
          n = {response: r, body: a};
        return (await this.options.postprocessFacetSearchResponseMiddleware(n))
          .body;
      }
      async recommendations(t) {
        let r = await nt.call({
          ...Qt(t, 'POST', 'application/json', ''),
          requestParams: Mt(t),
          requestMetadata: {method: 'recommendations'},
          ...this.options,
        });
        if (r instanceof Error) throw r;
        let a = await r.json();
        return xd(a) ? {success: a} : {error: gr({response: r, body: a})};
      }
      async html(t) {
        return ag(t, {...this.options});
      }
      async productRecommendations(t) {
        let r = await nt.call({
          ...Qt(t, 'POST', 'application/json', ''),
          requestParams: Mt(t),
          requestMetadata: {method: 'productRecommendations'},
          ...this.options,
        });
        if (r instanceof Error) throw r;
        let a = await r.json();
        return xd(a) ? {success: a} : {error: gr({response: r, body: a})};
      }
      async fieldDescriptions(t) {
        let r = await nt.call({
          ...Qt(t, 'GET', 'application/json', '/fields'),
          requestParams: {},
          requestMetadata: {method: 'fieldDescriptions'},
          ...this.options,
        });
        if (r instanceof Error) throw r;
        let a = await r.json();
        return BF(a) ? {success: a} : {error: gr({response: r, body: a})};
      }
      getAbortControllerInstanceIfAvailable() {
        if (typeof window == 'undefined') {
          let t = ng();
          return new t();
        }
        return typeof AbortController == 'undefined'
          ? null
          : new AbortController();
      }
    },
    og = (e) => e.success !== void 0,
    ge = (e) => e.error !== void 0;
  function jF(e) {
    return e.completions !== void 0;
  }
  function UF(e) {
    return e.preprocessingOutput !== void 0;
  }
  function BF(e) {
    return e.fields !== void 0;
  }
  function xd(e) {
    return e.results !== void 0;
  }
  function _F(e) {
    let t = Xa();
    return re(e.questionAnswer)
      ? ((e.questionAnswer = t), e)
      : ((e.questionAnswer = {...t, ...e.questionAnswer}), e);
  }
  var ig = [
    'uri',
    'urihash',
    'permanentid',
    'ec_name',
    'ec_brand',
    'ec_category',
    'ec_item_group_id',
    'ec_price',
    'ec_promo_price',
    'ec_shortdesc',
    'ec_thumbnails',
    'ec_images',
    'ec_in_stock',
    'ec_rating',
    'childResults',
    'totalNumberOfChildResults',
  ];
  var q = new O({required: !0, emptyAllowed: !1}),
    oe = new O({required: !1, emptyAllowed: !1}),
    ie = new O({required: !0, emptyAllowed: !0}),
    At = ({message: e, name: t, stack: r}) => ({message: e, name: t, stack: r}),
    ze = (e, t) => {
      if ('required' in t)
        return {payload: new Z({value: t}).validate({value: e}).value};
      let n = new L({options: {required: !0}, values: t}).validate(e);
      if (n) throw new ga(n);
      return {payload: e};
    },
    y = (e, t) => {
      try {
        return ze(e, t);
      } catch (r) {
        return {payload: e, error: At(r)};
      }
    },
    we = (e, t, r, a) => {
      let n = `Check the initialState of ${a}`;
      return sg(e, t, r, n, 'Controller initialization error');
    },
    pe = (e, t, r, a) => {
      let n = `Check the options of ${a}`;
      return sg(e, t, r, n, 'Controller initialization error');
    },
    sg = (e, t, r, a, n) => {
      try {
        return t.validate(r, a);
      } catch (o) {
        throw (e.logger.error(o, n), o);
      }
    };
  var tn = () => ({
    id: '',
    skus: [],
    maxNumberOfRecommendations: 5,
    filter: {brand: '', category: ''},
    additionalFields: [],
    recommendations: [],
    error: null,
    isLoading: !1,
    searchUid: '',
    duration: 0,
  });
  var Rd = class extends Mr {
    constructor() {
      super(...arguments);
      this.initialState = tn();
    }
    getPipeline() {
      return '';
    }
    getSearchEventRequestPayload() {
      return {
        queryText: '',
        responseTime: this.responseTime,
        results: this.mapResultsToAnalyticsDocument(),
        numberOfResults: this.numberOfResults,
      };
    }
    getSearchUID() {
      var r;
      return (
        ((r = this.getState().productRecommendations) == null
          ? void 0
          : r.searchUid) || this.initialState.searchUid
      );
    }
    mapResultsToAnalyticsDocument() {
      var t;
      return (t = this.state.productRecommendations) == null
        ? void 0
        : t.recommendations.map((r) => ({
            documentUri: r.documentUri,
            documentUriHash: r.documentUriHash,
            permanentid: r.permanentid,
          }));
    }
    get responseTime() {
      var t;
      return (
        ((t = this.state.productRecommendations) == null
          ? void 0
          : t.duration) || this.initialState.duration
      );
    }
    get numberOfResults() {
      var t;
      return (
        ((t = this.state.productRecommendations) == null
          ? void 0
          : t.recommendations.length) ||
        this.initialState.recommendations.length
      );
    }
  };
  var oT = new ts.HistoryStore();
  var fg = be(bd()),
    rn = (e, t = 5) =>
      e +
      Math.random()
        .toString(36)
        .substring(2, 2 + t);
  function ds(e) {
    return Array.isArray(e);
  }
  function ps(e) {
    return e.trim() === '';
  }
  function mg(e, t) {
    return Object.values(e.reduce((r, a, n) => ({...r, [t(a, n)]: a}), {}));
  }
  function XF(e) {
    return (typeof btoa != 'undefined' ? btoa : fg.btoa)(encodeURI(e));
  }
  function fs(e, t) {
    let {[e]: r, ...a} = t;
    return a;
  }
  function an(e) {
    return XF(JSON.stringify(e));
  }
  var ZF = new Set(['1', 1, 'yes', !0]);
  function ms() {
    if (typeof navigator == 'undefined' || typeof window == 'undefined')
      return !1;
    let e = navigator,
      t = window;
    return [
      e.globalPrivacyControl,
      e.doNotTrack,
      e.msDoNotTrack,
      t.doNotTrack,
    ].some((r) => ZF.has(r));
  }
  function gs(e) {
    let t = gg(e),
      r = [e, ...t].filter((n) => n.parentResult).map((n) => n.parentResult);
    return mg([e, ...t, ...r], (n) => n.uniqueId);
  }
  function gg(e) {
    return e.childResults ? e.childResults.flatMap((t) => [t, ...gg(t)]) : [];
  }
  var ot = () => '';
  var M = ((a) => (
    (a[(a.Search = 0)] = 'Search'),
    (a[(a.Custom = 1)] = 'Custom'),
    (a[(a.Click = 2)] = 'Click'),
    a
  ))(M || {});
  function eA(e) {
    return Object.assign(e, {instantlyCallable: !0});
  }
  function tA(e, t) {
    let r = (o) => eA(te(e, o)),
      a = r(async (o, {getState: i, extra: s}) => {
        let {analyticsClientMiddleware: u, preprocessRequest: c, logger: l} = s;
        return await (
          await t({
            getState: i,
            analyticsClientMiddleware: u,
            preprocessRequest: c,
            logger: l,
          })
        ).log({state: i(), extra: s});
      });
    return (
      Object.assign(a, {
        prepare: async ({
          getState: o,
          analyticsClientMiddleware: i,
          preprocessRequest: s,
          logger: u,
        }) => {
          let {description: c, log: l} = await t({
            getState: o,
            analyticsClientMiddleware: i,
            preprocessRequest: s,
            logger: u,
          });
          return {
            description: c,
            action: r(
              async (p, {getState: f, extra: d}) =>
                await l({state: f(), extra: d})
            ),
          };
        },
      }),
      a
    );
  }
  var Q = (e, t, r, a = (n) => new ya(n)) =>
    tA(
      e,
      async ({
        getState: n,
        analyticsClientMiddleware: o,
        preprocessRequest: i,
        logger: s,
      }) => {
        let u = Mm({
            getState: n,
            logger: s,
            analyticsClientMiddleware: o,
            preprocessRequest: i,
            provider: a(n),
          }),
          c = await r(u, n());
        return {
          description: c == null ? void 0 : c.description,
          log: async ({state: l}) => {
            let p = await (c == null
              ? void 0
              : c.log({searchUID: a(() => l).getSearchUID()}));
            return (
              s.info(
                {client: u.coveoAnalyticsClient, response: p},
                'Analytics response'
              ),
              {analyticsType: t}
            );
          },
        };
      }
    );
  var Ve = (e, t) => {
    var o;
    let r = (i) => {
        var s, u;
        return (
          i +
          ((u = (s = t.pagination) == null ? void 0 : s.firstResult) != null
            ? u
            : 0)
        );
      },
      a = -1,
      n = (o = t.search) == null ? void 0 : o.results;
    return (
      (a = Sg(e, n)), a < 0 && (a = sA(e, n)), a < 0 && (a = 0), rA(e, r(a), t)
    );
  };
  function rA(e, t, r) {
    let a = e.raw.collection;
    return {
      collectionName: typeof a == 'string' ? a : 'default',
      documentAuthor: oA(e),
      documentPosition: t + 1,
      documentTitle: e.title,
      documentUri: e.uri,
      documentUriHash: e.raw.urihash,
      documentUrl: e.clickUri,
      rankingModifier: e.rankingModifier || '',
      sourceName: iA(e),
      queryPipeline: r.pipeline || ot(),
    };
  }
  var Le = (e) => (
      e.raw.permanentid ||
        console.warn(
          'Missing field permanentid on result. This might cause many issues with your Coveo deployment. See https://docs.coveo.com/en/1913 and https://docs.coveo.com/en/1640 for more information.',
          e
        ),
      {contentIDKey: 'permanentid', contentIDValue: e.raw.permanentid || ''}
    ),
    hg = {urihash: new O(), sourcetype: new O(), permanentid: new O()},
    yi = {
      uniqueId: q,
      raw: new L({values: hg}),
      title: q,
      uri: q,
      clickUri: q,
      rankingModifier: new O({required: !1, emptyAllowed: !0}),
    };
  function aA(e) {
    return Object.assign({}, ...Object.keys(hg).map((t) => ({[t]: e[t]})));
  }
  function nA(e) {
    return Object.assign({}, ...Object.keys(yi).map((t) => ({[t]: e[t]})), {
      raw: aA(e.raw),
    });
  }
  function oA(e) {
    let t = e.raw.author;
    return re(t) ? 'unknown' : Array.isArray(t) ? t.join(';') : `${t}`;
  }
  function iA(e) {
    let t = e.raw.source;
    return re(t) ? 'unknown' : t;
  }
  var _e = (e) => new Z(yi).validate(nA(e));
  function sA(e, t) {
    for (let [r, a] of t.entries()) {
      let n = gs(a);
      if (Sg(e, n) !== -1) return r;
    }
    return -1;
  }
  function Sg(e, t = []) {
    return t.findIndex(({uniqueId: r}) => r === e.uniqueId);
  }
  var yg = () =>
    Q(
      'analytics/productRecommendations/load',
      M.Search,
      (e) => e.makeRecommendationInterfaceLoad(),
      (e) => new Rd(e)
    );
  function cA(e) {
    return e && 'childResults' in e && 'totalNumberOfChildResults' in e;
  }
  var vg = S('productrecommendations/setId', (e) => y(e, {id: q})),
    Cg = S('productrecommendations/setSku', (e) =>
      y(e, {skus: new K({required: !0, min: 1, each: oe})})
    ),
    xg = S('productrecommendations/setBrand', (e) =>
      y(e, {brand: new O({required: !0, emptyAllowed: !0})})
    ),
    Rg = S('productrecommendations/setCategory', (e) =>
      y(e, {category: new O({required: !0, emptyAllowed: !0})})
    ),
    bg = S('productrecommendations/setAdditionalFields', (e) =>
      y(e, {additionalFields: new K({required: !0, each: oe})})
    ),
    Fg = S('productrecommendations/setMaxNumberOfRecommendations', (e) =>
      y(e, {number: new U({required: !0, max: 50, min: 1})})
    ),
    nn = te(
      'productRecommendations/get',
      async (e, {getState: t, rejectWithValue: r, extra: {apiClient: a}}) => {
        let n = t(),
          o = new Date().getTime(),
          i = await a.productRecommendations(await uA(n)),
          s = new Date().getTime() - o;
        if (ge(i)) return r(i.error);
        let u = n.productRecommendations.additionalFields || [];
        return {
          recommendations: i.success.results.map((c) =>
            Ag(c, {additionalFields: u})
          ),
          analyticsAction: yg(),
          searchUid: i.success.searchUid,
          duration: s,
        };
      }
    ),
    Ag = (e, {additionalFields: t}) => {
      let r = e.raw.ec_price,
        a = e.raw.ec_promo_price,
        n = e.raw.ec_in_stock,
        o = {
          documentUri: e.uri,
          documentUriHash: e.raw.urihash,
          permanentid: e.raw.permanentid,
          clickUri: e.clickUri,
          ec_name: e.raw.ec_name,
          ec_brand: e.raw.ec_brand,
          ec_category: e.raw.ec_category,
          ec_item_group_id: e.raw.ec_item_group_id,
          ec_price: r,
          ec_shortdesc: e.raw.ec_shortdesc,
          ec_thumbnails: e.raw.ec_thumbnails,
          ec_images: e.raw.ec_images,
          ec_promo_price: a === void 0 || (r !== void 0 && a >= r) ? void 0 : a,
          ec_in_stock:
            n === void 0
              ? void 0
              : n.toLowerCase() === 'yes' || n.toLowerCase() === 'true',
          ec_rating: e.raw.ec_rating,
          additionalFields: t.reduce((i, s) => ({...i, [s]: e.raw[s]}), {}),
          childResults: [],
          totalNumberOfChildResults: 0,
        };
      return (
        cA(e) &&
          ((o.childResults = e.childResults.map((i) =>
            Ag(i, {additionalFields: t})
          )),
          (o.totalNumberOfChildResults = e.totalNumberOfChildResults)),
        o
      );
    },
    uA = async (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.search.apiBaseUrl,
      locale: e.configuration.search.locale,
      timezone: e.configuration.search.timezone,
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
      }),
      recommendation: e.productRecommendations.id,
      numberOfResults: e.productRecommendations.maxNumberOfRecommendations,
      fieldsToInclude: [
        ...ig,
        ...(e.productRecommendations.additionalFields || []),
      ],
      mlParameters: {
        ...(e.productRecommendations.skus &&
          e.productRecommendations.skus.length > 0 && {
            itemIds: e.productRecommendations.skus,
          }),
        ...(e.productRecommendations.filter.brand && {
          brandFilter: e.productRecommendations.filter.brand,
        }),
        ...(e.productRecommendations.filter.category && {
          categoryFilter: e.productRecommendations.filter.category,
        }),
      },
      actionsHistory: e.configuration.analytics.enabled ? Ft.getHistory() : [],
      ...(e.context && {context: e.context.contextValues}),
      ...(e.dictionaryFieldContext && {
        dictionaryFieldContext: e.dictionaryFieldContext.contextValues,
      }),
      ...(e.searchHub && {searchHub: e.searchHub}),
    });
  var Qr = async (e, t) => ({
    analytics: {
      clientId: await Fe(e),
      clientTimestamp: new Date().toISOString(),
      documentReferrer: e.originLevel3,
      originContext: e.originContext,
      ...(t && {actionCause: t.actionCause, customData: t.customData}),
      ...(e.userDisplayName && {userDisplayName: e.userDisplayName}),
      ...(e.documentLocation && {documentLocation: e.documentLocation}),
      ...(e.deviceId && {deviceId: e.deviceId}),
      ...(ld() && {pageId: ld()}),
    },
  });
  var Lr = () => ({
    duration: 0,
    error: null,
    isLoading: !1,
    id: 'Recommendation',
    recommendations: [],
    searchUid: '',
    splitTestRun: '',
    pipeline: '',
  });
  var Fd = class extends Mr {
    getPipeline() {
      var t;
      return (
        this.state.pipeline ||
        ((t = this.state.recommendation) == null ? void 0 : t.pipeline) ||
        'default'
      );
    }
    getSearchEventRequestPayload() {
      return {
        queryText: ve().q,
        responseTime: this.responseTime,
        results: this.mapResultsToAnalyticsDocument(),
        numberOfResults: this.numberOfResults,
      };
    }
    getSearchUID() {
      var r;
      return (
        ((r = this.getState().recommendation) == null ? void 0 : r.searchUid) ||
        Lr().searchUid
      );
    }
    getSplitTestRunName() {
      var t;
      return (t = this.state.recommendation) == null ? void 0 : t.splitTestRun;
    }
    getSplitTestRunVersion() {
      var a;
      let t = !!this.getSplitTestRunName(),
        r =
          ((a = this.state.recommendation) == null ? void 0 : a.pipeline) ||
          this.state.pipeline ||
          'default';
      return t ? r : void 0;
    }
    get responseTime() {
      var t;
      return (
        ((t = this.state.recommendation) == null ? void 0 : t.duration) ||
        Lr().duration
      );
    }
    mapResultsToAnalyticsDocument() {
      var t;
      return (t = this.state.recommendation) == null
        ? void 0
        : t.recommendations.map((r) => ({
            documentUri: r.uri,
            documentUriHash: r.raw.urihash,
          }));
    }
    get numberOfResults() {
      var t;
      return (
        ((t = this.state.recommendation) == null
          ? void 0
          : t.recommendations.length) || Lr().recommendations.length
      );
    }
  };
  var Pg = () =>
    Q(
      'analytics/recommendation/update',
      M.Search,
      (e) => e.makeRecommendationInterfaceLoad(),
      (e) => new Fd(e)
    );
  var Ig = S('recommendation/set', (e) => y(e, {id: q})),
    on = te(
      'recommendation/get',
      async (e, {getState: t, rejectWithValue: r, extra: {apiClient: a}}) => {
        let n = t(),
          o = new Date().getTime(),
          i = await a.recommendations(await lA(n)),
          s = new Date().getTime() - o;
        return ge(i)
          ? r(i.error)
          : {
              recommendations: i.success.results,
              analyticsAction: Pg(),
              duration: s,
              searchUid: i.success.searchUid,
              splitTestRun: i.success.splitTestRun,
              pipeline: i.success.pipeline,
            };
      }
    ),
    lA = async (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.search.apiBaseUrl,
      recommendation: e.recommendation.id,
      tab: e.configuration.analytics.originLevel2,
      referrer: e.configuration.analytics.originLevel3,
      timezone: e.configuration.search.timezone,
      locale: e.configuration.search.locale,
      actionsHistory: e.configuration.analytics.enabled ? Ft.getHistory() : [],
      ...(e.advancedSearchQueries && {
        aq: e.advancedSearchQueries.aq,
        cq: e.advancedSearchQueries.cq,
      }),
      ...(e.pipeline && {pipeline: e.pipeline}),
      ...(e.searchHub && {searchHub: e.searchHub}),
      ...(e.context && {context: e.context.contextValues}),
      ...(e.dictionaryFieldContext && {
        dictionaryFieldContext: e.dictionaryFieldContext.contextValues,
      }),
      ...(e.fields && {fieldsToInclude: e.fields.fieldsToInclude}),
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
      }),
      ...(e.configuration.analytics.enabled &&
        (await Qr(e.configuration.analytics))),
      ...(e.configuration.search.authenticationProviders.length && {
        authentication:
          e.configuration.search.authenticationProviders.join(','),
      }),
      ...(e.pagination && {numberOfResults: e.pagination.numberOfResults}),
    });
  var ke = S('breadcrumb/deselectAll'),
    sn = S('breadcrumb/deselectAllNonBreadcrumbs');
  var Lt = S('facet/updateFacetAutoSelection', (e) =>
    y(e, {allow: new J({required: !0})})
  );
  var hs = class extends ya {
    constructor(t) {
      super(t);
      this.getState = t;
    }
    get activeInstantResultQuery() {
      let t = this.getState().instantResults;
      for (let r in t)
        for (let a in t[r].cache) if (t[r].cache[a].isActive) return t[r].q;
      return null;
    }
    get activeInstantResultCache() {
      let t = this.getState().instantResults;
      for (let r in t)
        for (let a in t[r].cache)
          if (t[r].cache[a].isActive) return t[r].cache[a];
      return null;
    }
    getSearchUID() {
      var r;
      return (
        ((r = this.activeInstantResultCache) == null ? void 0 : r.searchUid) ||
        super.getSearchUID()
      );
    }
    getSearchEventRequestPayload() {
      let t = super.getSearchEventRequestPayload(),
        r = this.activeInstantResultQuery || t.queryText;
      return {...t, queryText: r};
    }
  };
  var Eg = (e) =>
      Q(
        'analytics/instantResult/open',
        M.Click,
        (t, r) => (_e(e), t.makeDocumentOpen(Ve(e, r), Le(e))),
        (t) => new hs(t)
      ),
    wg = () =>
      Q(
        'analytics/instantResult/searchboxAsYouType',
        M.Search,
        (e) => e.makeSearchboxAsYouType(),
        (e) => new hs(e)
      );
  var Ad = {id: q},
    dA = {...Ad, q: ie},
    cn = S('instantResults/register', (e) => y(e, Ad)),
    jr = S('instantResults/updateQuery', (e) => y(e, dA)),
    un = S('instantResults/clearExpired', (e) => y(e, Ad));
  var Ss = new U({required: !0, min: 0}),
    ln = S('pagination/registerNumberOfResults', (e) => y(e, Ss)),
    dn = S('pagination/updateNumberOfResults', (e) => y(e, Ss)),
    pn = S('pagination/registerPage', (e) => y(e, Ss)),
    jt = S('pagination/updatePage', (e) => y(e, Ss)),
    fn = S('pagination/nextPage'),
    mn = S('pagination/previousPage');
  var it = S('query/updateQuery', (e) =>
    y(e, {q: new O(), enableQuerySyntax: new J()})
  );
  var gn = async (e, t) => {
    var r, a, n, o;
    return {
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.search.apiBaseUrl,
      locale: e.configuration.search.locale,
      debug: e.debug,
      tab: e.configuration.analytics.originLevel2,
      referrer: e.configuration.analytics.originLevel3,
      timezone: e.configuration.search.timezone,
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
        actionsHistory: Ft.getHistory(),
      }),
      ...(((r = e.advancedSearchQueries) == null ? void 0 : r.aq) && {
        aq: e.advancedSearchQueries.aq,
      }),
      ...(((a = e.advancedSearchQueries) == null ? void 0 : a.cq) && {
        cq: e.advancedSearchQueries.cq,
      }),
      ...(((n = e.advancedSearchQueries) == null ? void 0 : n.lq) && {
        lq: e.advancedSearchQueries.lq,
      }),
      ...(((o = e.advancedSearchQueries) == null ? void 0 : o.dq) && {
        dq: e.advancedSearchQueries.dq,
      }),
      ...(e.context && {context: e.context.contextValues}),
      ...(e.fields &&
        !e.fields.fetchAllFields && {
          fieldsToInclude: e.fields.fieldsToInclude,
        }),
      ...(e.dictionaryFieldContext && {
        dictionaryFieldContext: e.dictionaryFieldContext.contextValues,
      }),
      ...(e.pipeline && {pipeline: e.pipeline}),
      ...(e.query && {
        q: e.query.q,
        enableQuerySyntax: e.query.enableQuerySyntax,
      }),
      ...(e.searchHub && {searchHub: e.searchHub}),
      ...(e.sortCriteria && {sortCriteria: e.sortCriteria}),
      ...(e.configuration.analytics.enabled &&
        (await Qr(e.configuration.analytics, t))),
      ...(e.excerptLength &&
        !re(e.excerptLength.length) && {excerptLength: e.excerptLength.length}),
      ...(e.configuration.search.authenticationProviders.length && {
        authentication:
          e.configuration.search.authenticationProviders.join(','),
      }),
    };
  };
  var hn = S('didYouMean/enable'),
    ys = S('didYouMean/disable'),
    Ut = S('didYouMean/correction', (e) => y(e, q));
  var vs = () =>
      Q('analytics/didyoumean/click', M.Search, (e) => e.makeDidYouMeanClick()),
    kg = () =>
      Q('analytics/didyoumean/automatic', M.Search, (e) =>
        e.makeDidYouMeanAutomatic()
      );
  var Pd = S('history/undo'),
    Id = S('history/redo'),
    Ur = S('history/snapshot'),
    vi = te('history/back', async (e, {dispatch: t}) => {
      t(Pd()), await t(ce());
    }),
    Cs = te('history/forward', async (e, {dispatch: t}) => {
      t(Id()), await t(ce());
    }),
    ce = te('history/change', async (e, {getState: t}) => t().history.present);
  var $e = () => ({
    cq: '',
    cqWasSet: !1,
    aq: '',
    aqWasSet: !1,
    lq: '',
    lqWasSet: !1,
    dq: '',
    dqWasSet: !1,
    defaultFilters: {cq: '', aq: '', lq: '', dq: ''},
  });
  function st() {
    return {contextValues: {}};
  }
  var We = () => !1;
  function Bt() {
    return {contextValues: {}};
  }
  function Sn() {
    return {enabled: !0};
  }
  function Sr() {
    return {freezeFacetOrder: !1, facets: {}};
  }
  function Br() {
    return [];
  }
  function yn() {
    return {};
  }
  function xs(e) {
    return e ? e.expiresAt && Date.now() >= e.expiresAt : !1;
  }
  function Ae() {
    return {
      firstResult: 0,
      defaultNumberOfResults: 10,
      numberOfResults: 10,
      totalCountFiltered: 0,
    };
  }
  function Ca() {
    return {};
  }
  var yr = ((r) => (
      (r.Ascending = 'ascending'), (r.Descending = 'descending'), r
    ))(yr || {}),
    Pt = ((o) => (
      (o.Relevancy = 'relevancy'),
      (o.QRE = 'qre'),
      (o.Date = 'date'),
      (o.Field = 'field'),
      (o.NoSort = 'nosort'),
      o
    ))(Pt || {}),
    _t = (e) => {
      if (Ka(e)) return e.map((t) => _t(t)).join(',');
      switch (e.by) {
        case 'relevancy':
        case 'qre':
        case 'nosort':
          return e.by;
        case 'date':
          return `date ${e.order}`;
        case 'field':
          return `@${e.field} ${e.order}`;
        default:
          return '';
      }
    },
    vn = () => ({by: 'relevancy'}),
    Rs = (e) => ({by: 'date', order: e}),
    bs = (e, t) => ({by: 'field', order: t, field: e}),
    Fs = () => ({by: 'qre'}),
    As = () => ({by: 'nosort'}),
    Og = new L({
      values: {
        by: new Vt({enum: Pt, required: !0}),
        order: new Vt({enum: yr}),
        field: new O(),
      },
    });
  function et() {
    return _t(vn());
  }
  function xa() {
    return {};
  }
  function Ra() {
    return {};
  }
  function Ps() {
    return Ci({});
  }
  function Ci(e) {
    var t, r;
    return {
      context: e.context || st(),
      dictionaryFieldContext: e.dictionaryFieldContext || Bt(),
      facetSet: e.facetSet || bt(),
      numericFacetSet: e.numericFacetSet || Rt(),
      dateFacetSet: e.dateFacetSet || xt(),
      categoryFacetSet: e.categoryFacetSet || Ct(),
      pagination: e.pagination || Ae(),
      query: e.query || ve(),
      tabSet: e.tabSet || Ra(),
      advancedSearchQueries: e.advancedSearchQueries || $e(),
      staticFilterSet: e.staticFilterSet || xa(),
      querySet: e.querySet || Ca(),
      instantResults: e.instantResults || yn(),
      sortCriteria: e.sortCriteria || et(),
      pipeline: e.pipeline || ot(),
      searchHub: e.searchHub || Ee(),
      facetOptions: e.facetOptions || Sr(),
      facetOrder: (t = e.facetOrder) != null ? t : Br(),
      debug: (r = e.debug) != null ? r : We(),
    };
  }
  var pA = new L({values: {undoneQuery: ie}, options: {required: !0}}),
    Is = () =>
      Q('analytics/trigger/query', M.Search, (e, t) => {
        var r;
        return (
          (r = t.triggers) == null ? void 0 : r.queryModification.newQuery
        )
          ? e.makeTriggerQuery()
          : null;
      }),
    Es = (e) =>
      Q(
        'analytics/trigger/query/undo',
        M.Search,
        (t) => (y(e, pA), t.makeUndoTriggerQuery(e))
      ),
    ws = () =>
      Q('analytics/trigger/notify', M.Search, (e, t) => {
        var r;
        return ((r = t.triggers) == null ? void 0 : r.notifications.length)
          ? e.makeTriggerNotify({notifications: t.triggers.notifications})
          : null;
      }),
    ks = () =>
      Q('analytics/trigger/redirect', M.Search, (e, t) => {
        var r;
        return ((r = t.triggers) == null ? void 0 : r.redirectTo)
          ? e.makeTriggerRedirect({redirectedTo: t.triggers.redirectTo})
          : null;
      }),
    Os = () =>
      Q('analytics/trigger/execute', M.Search, (e, t) => {
        var r;
        return ((r = t.triggers) == null ? void 0 : r.executions.length)
          ? e.makeTriggerExecute({executions: t.triggers.executions})
          : null;
      });
  var Cn = S('trigger/query/ignore', (e) =>
      y(e, new O({emptyAllowed: !0, required: !0}))
    ),
    qs = S('trigger/query/modification', (e) =>
      y(e, new L({values: {originalQuery: oe, modification: oe}}))
    );
  var qg = () =>
      Q('search/logFetchMoreResults', M.Search, (e) =>
        e.makeFetchMoreResults()
      ),
    xn = (e) =>
      Q('search/queryError', M.Search, (t, r) => {
        var a, n, o, i;
        return t.makeQueryError({
          query: ((a = r.query) == null ? void 0 : a.q) || ve().q,
          aq:
            ((n = r.advancedSearchQueries) == null ? void 0 : n.aq) || $e().aq,
          cq:
            ((o = r.advancedSearchQueries) == null ? void 0 : o.cq) || $e().cq,
          dq:
            ((i = r.advancedSearchQueries) == null ? void 0 : i.dq) || $e().dq,
          errorType: e.type,
          errorMessage: e.message,
        });
      });
  var Ri = be(Ts()),
    Mg = be(Tg());
  var Ds = be(Ts()),
    Vg = be(Dg());
  Ds.default.extend(Vg.default);
  var Rn = 'YYYY/MM/DD@HH:mm:ss',
    fA = '1401-01-01';
  function ba(e, t) {
    let r = (0, Ds.default)(e, t);
    return !r.isValid() && !t ? (0, Ds.default)(e, Rn) : r;
  }
  function xi(e) {
    return e.format(Rn);
  }
  function Ng(e) {
    return xi(ba(e)) === e;
  }
  function Vs(e, t) {
    let r = ba(e, t);
    if (!r.isValid()) {
      let a =
          '. Please provide a date format string in the configuration options. See https://day.js.org/docs/en/parse/string-format for more information.',
        n = ` with the format "${t}""`;
      throw new Error(`Could not parse the provided date "${e}"${t ? n : a}`);
    }
    Dd(r);
  }
  function Dd(e) {
    if (e.isBefore(fA))
      throw new Error(
        `Date is before year 1401, which is unsupported by the API: ${e}`
      );
  }
  Ri.default.extend(Mg.default);
  var Qg = ['past', 'now', 'next'],
    Lg = ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'],
    mA = (e) => {
      let t = e === 'now';
      return {
        amount: new U({required: !t, min: 1}),
        unit: new O({required: !t, constrainTo: Lg}),
        period: new O({required: !0, constrainTo: Qg}),
      };
    };
  function _r(e) {
    if (typeof e == 'string' && !$t(e))
      throw new Error(
        `The value "${e}" is not respecting the relative date format "period-amount-unit"`
      );
    let t = typeof e == 'string' ? Vd(e) : e;
    new Z(mA(t.period)).validate(t);
    let r = Ug(t),
      a = JSON.stringify(t);
    if (!r.isValid()) throw new Error(`Date is invalid: ${a}`);
    Dd(r);
  }
  function jg(e) {
    let {period: t, amount: r, unit: a} = e;
    switch (t) {
      case 'past':
      case 'next':
        return `${t}-${r}-${a}`;
      case 'now':
        return t;
    }
  }
  function Ug(e) {
    let {period: t, amount: r, unit: a} = e;
    switch (t) {
      case 'past':
        return (0, Ri.default)().subtract(r, a);
      case 'next':
        return (0, Ri.default)().add(r, a);
      case 'now':
        return (0, Ri.default)();
    }
  }
  function bi(e) {
    return xi(Ug(Vd(e)));
  }
  function Bg(e) {
    return e.toLocaleLowerCase().split('-');
  }
  function $t(e) {
    let [t, r, a] = Bg(e);
    if (t === 'now') return !0;
    if (!Qg.includes(t) || !Lg.includes(a)) return !1;
    let n = parseInt(r);
    return !(isNaN(n) || n <= 0);
  }
  function _g(e) {
    return !!e && typeof e == 'object' && 'period' in e;
  }
  function Vd(e) {
    let [t, r, a] = Bg(e);
    return t === 'now'
      ? {period: 'now'}
      : {period: t, amount: r ? parseInt(r) : void 0, unit: a || void 0};
  }
  function $g(e) {
    return _r(e), Vd(e);
  }
  function Hg(e) {
    return e.type === 'dateRange';
  }
  function zg(e) {
    return `start${e}`;
  }
  function Wg(e) {
    return `end${e}`;
  }
  var gA = () => ({dateFacetValueMap: {}});
  function hA(e, t, r) {
    let a = e.start,
      n = e.end;
    return (
      $t(a) && ((a = bi(a)), (r.dateFacetValueMap[t][zg(a)] = e.start)),
      $t(n) && ((n = bi(n)), (r.dateFacetValueMap[t][Wg(n)] = e.end)),
      {...e, start: a, end: n}
    );
  }
  function SA(e, t) {
    if (Hg(e)) {
      let {facetId: r, currentValues: a} = e;
      return (
        (t.dateFacetValueMap[r] = {}),
        {...e, currentValues: a.map((n) => hA(n, r, t))}
      );
    }
    return e;
  }
  function Ns(e) {
    var a;
    let t = gA();
    return {
      request: {
        ...e,
        facets: (a = e.facets) == null ? void 0 : a.map((n) => SA(n, t)),
      },
      mappings: t,
    };
  }
  function yA(e, t, r) {
    return {
      ...e,
      start: r.dateFacetValueMap[t][zg(e.start)] || e.start,
      end: r.dateFacetValueMap[t][Wg(e.end)] || e.end,
    };
  }
  function vA(e, t) {
    return e.facetId in t.dateFacetValueMap;
  }
  function CA(e, t) {
    return vA(e, t)
      ? {...e, values: e.values.map((r) => yA(r, e.facetId, t))}
      : e;
  }
  function Yg(e, t) {
    var r;
    return 'success' in e
      ? {
          success: {
            ...e.success,
            facets:
              (r = e.success.facets) == null ? void 0 : r.map((n) => CA(n, t)),
          },
        }
      : e;
  }
  function bn(e, t) {
    let r = {};
    e.forEach((o) => (r[o.facetId] = o));
    let a = [];
    t.forEach((o) => {
      o in r && (a.push(r[o]), delete r[o]);
    });
    let n = Object.values(r);
    return [...a, ...n];
  }
  function vr(e) {
    return Object.values(e).map((t) => t.request);
  }
  var Fa = 1,
    Fi = 5e3;
  var ct = async (e, t) => {
    var i;
    let r = FA(e),
      a = xA(e),
      n = await gn(e, t),
      o = () =>
        e.pagination
          ? e.pagination.firstResult + e.pagination.numberOfResults > Fi
            ? Fi - e.pagination.firstResult
            : e.pagination.numberOfResults
          : void 0;
    return Ns({
      ...n,
      ...(e.didYouMean && {enableDidYouMean: e.didYouMean.enableDidYouMean}),
      ...(r && {cq: r}),
      ...(a.length && {facets: a}),
      ...(e.pagination && {
        numberOfResults: o(),
        firstResult: e.pagination.firstResult,
      }),
      ...(e.facetOptions && {
        facetOptions: {freezeFacetOrder: e.facetOptions.freezeFacetOrder},
      }),
      ...(((i = e.folding) == null ? void 0 : i.enabled) && {
        filterField: e.folding.fields.collection,
        childField: e.folding.fields.parent,
        parentField: e.folding.fields.child,
        filterFieldRange: e.folding.filterFieldRange,
      }),
    });
  };
  function xA(e) {
    var t;
    return bn(RA(e), (t = e.facetOrder) != null ? t : []);
  }
  function RA(e) {
    return bA(e).filter(({facetId: t}) => {
      var r, a, n;
      return (n =
        (a = (r = e.facetOptions) == null ? void 0 : r.facets[t]) == null
          ? void 0
          : a.enabled) != null
        ? n
        : !0;
    });
  }
  function bA(e) {
    var t, r, a, n;
    return [
      ...vr((t = e.facetSet) != null ? t : {}),
      ...Kg((r = e.numericFacetSet) != null ? r : {}),
      ...Kg((a = e.dateFacetSet) != null ? a : {}),
      ...vr((n = e.categoryFacetSet) != null ? n : {}),
    ];
  }
  function Kg(e) {
    return vr(e).map((t) => {
      let a = t.currentValues.find(({state: n}) => n === 'selected');
      return t.generateAutomaticRanges && !a ? {...t, currentValues: []} : t;
    });
  }
  function FA(e) {
    var o;
    let t =
        ((o = e.advancedSearchQueries) == null ? void 0 : o.cq.trim()) || '',
      r = Object.values(e.tabSet || {}).find((i) => i.isActive),
      a = (r == null ? void 0 : r.expression.trim()) || '',
      n = AA(e);
    return [t, a, ...n].filter((i) => !!i).join(' AND ');
  }
  function AA(e) {
    return Object.values(e.staticFilterSet || {}).map((r) => {
      let a = r.values.filter(
          (o) => o.state === 'selected' && !!o.expression.trim()
        ),
        n = a.map((o) => o.expression).join(' OR ');
      return a.length > 1 ? `(${n})` : n;
    });
  }
  var Aa = class {
    constructor(
      t,
      r = (a) => {
        this.dispatch(it({q: a}));
      }
    ) {
      this.config = t;
      this.onUpdateQueryForCorrection = r;
    }
    async fetchFromAPI({mappings: t, request: r}, a) {
      var u;
      let n = new Date().getTime(),
        o = Yg(await this.extra.apiClient.search(r, a), t),
        i = new Date().getTime() - n,
        s = ((u = this.getState().query) == null ? void 0 : u.q) || '';
      return {response: o, duration: i, queryExecuted: s, requestExecuted: r};
    }
    async process(t) {
      var r, a, n;
      return (n =
        (a =
          (r = this.processQueryErrorOrContinue(t)) != null
            ? r
            : await this.processQueryCorrectionsOrContinue(t)) != null
          ? a
          : await this.processQueryTriggersOrContinue(t)) != null
        ? n
        : this.processSuccessReponse(t);
    }
    processQueryErrorOrContinue(t) {
      return ge(t.response)
        ? (this.dispatch(xn(t.response.error)),
          this.rejectWithValue(t.response.error))
        : null;
    }
    async processQueryCorrectionsOrContinue(t) {
      var s;
      let r = this.getState(),
        a = this.getSuccessResponse(t);
      if (
        !a ||
        ((s = r.didYouMean) == null ? void 0 : s.enableDidYouMean) === !1 ||
        a.results.length !== 0 ||
        a.queryCorrections.length === 0
      )
        return null;
      let n = this.getCurrentQuery(),
        {correctedQuery: o} = a.queryCorrections[0],
        i = await this.automaticallyRetryQueryWithCorrection(o);
      return ge(i.response)
        ? (this.dispatch(xn(i.response.error)),
          this.rejectWithValue(i.response.error))
        : (this.analyticsAction &&
            this.analyticsAction()(
              this.dispatch,
              () =>
                this.getStateAfterResponse(t.queryExecuted, t.duration, r, a),
              this.extra
            ),
          this.dispatch(Ur(Ci(this.getState()))),
          {
            ...i,
            response: {
              ...i.response.success,
              queryCorrections: a.queryCorrections,
            },
            automaticallyCorrected: !0,
            originalQuery: n,
            analyticsAction: kg(),
          });
    }
    async processQueryTriggersOrContinue(t) {
      var s, u;
      let r = this.getSuccessResponse(t);
      if (!r) return null;
      let a =
        ((s = r.triggers.find((c) => c.type === 'query')) == null
          ? void 0
          : s.content) || '';
      if (!a) return null;
      if (
        ((u = this.getState().triggers) == null
          ? void 0
          : u.queryModification.queryToIgnore) === a
      )
        return this.dispatch(Cn('')), null;
      this.analyticsAction && (await this.dispatch(this.analyticsAction));
      let o = this.getCurrentQuery(),
        i = await this.automaticallyRetryQueryWithTriggerModification(a);
      return ge(i.response)
        ? (this.dispatch(xn(i.response.error)),
          this.rejectWithValue(i.response.error))
        : (this.dispatch(Ur(Ci(this.getState()))),
          {
            ...i,
            response: {...i.response.success},
            automaticallyCorrected: !1,
            originalQuery: o,
            analyticsAction: Is(),
          });
    }
    processSuccessReponse(t) {
      return (
        this.dispatch(Ur(Ci(this.getState()))),
        {
          ...t,
          response: this.getSuccessResponse(t),
          automaticallyCorrected: !1,
          originalQuery: this.getCurrentQuery(),
          analyticsAction: this.analyticsAction,
        }
      );
    }
    getSuccessResponse(t) {
      return og(t.response) ? t.response.success : null;
    }
    async automaticallyRetryQueryWithCorrection(t) {
      this.onUpdateQueryForCorrection(t);
      let r = await this.fetchFromAPI(await ct(this.getState()), {
        origin: 'mainSearch',
      });
      return this.dispatch(Ut(t)), r;
    }
    async automaticallyRetryQueryWithTriggerModification(t) {
      return (
        this.dispatch(qs({newQuery: t, originalQuery: this.getCurrentQuery()})),
        this.onUpdateQueryForCorrection(t),
        await this.fetchFromAPI(await ct(this.getState()), {
          origin: 'mainSearch',
        })
      );
    }
    getStateAfterResponse(t, r, a, n) {
      var o, i;
      return {
        ...a,
        query: {
          q: t,
          enableQuerySyntax:
            (i = (o = a.query) == null ? void 0 : o.enableQuerySyntax) != null
              ? i
              : ve().enableQuerySyntax,
        },
        search: {...Ze(), duration: r, response: n, results: n.results},
      };
    }
    getCurrentQuery() {
      var r;
      let t = this.getState();
      return ((r = t.query) == null ? void 0 : r.q) !== void 0 ? t.query.q : '';
    }
    get extra() {
      return this.config.extra;
    }
    getState() {
      return this.config.getState();
    }
    get dispatch() {
      return this.config.dispatch;
    }
    get analyticsAction() {
      return this.config.analyticsAction;
    }
    get rejectWithValue() {
      return this.config.rejectWithValue;
    }
  };
  var Ms = te('search/prepareForSearchWithQuery', (e, t) => {
      let {dispatch: r} = t;
      y(e, {q: new O(), enableQuerySyntax: new J(), clearFilters: new J()}),
        e.clearFilters && (r(ke()), r(sn())),
        r(Lt({allow: !0})),
        r(it({q: e.q, enableQuerySyntax: e.enableQuerySyntax})),
        r(jt(1));
    }),
    T = te('search/executeSearch', async (e, t) => {
      let r = t.getState();
      Gg(r);
      let {
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        } = t.extra,
        {description: i, action: s} = await e.prepare({
          getState: () => t.getState(),
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        }),
        u = new Aa({...t, analyticsAction: s}),
        c = await ct(r, i),
        l = await u.fetchFromAPI(c, {origin: 'mainSearch'});
      return await u.process(l);
    }),
    Ye = te('search/fetchPage', async (e, t) => {
      let r = t.getState();
      Gg(r);
      let {
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        } = t.extra,
        {description: i, action: s} = await e.prepare({
          getState: () => t.getState(),
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        }),
        u = new Aa({...t, analyticsAction: s}),
        c = await ct(r, i),
        l = await u.fetchFromAPI(c, {origin: 'mainSearch'});
      return await u.process(l);
    }),
    ut = te('search/fetchMoreResults', async (e, t) => {
      let r = t.getState(),
        {
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        } = t.extra,
        {description: i, action: s} = await qg().prepare({
          getState: () => t.getState(),
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        }),
        u = new Aa({...t, analyticsAction: s}),
        c = await PA(r, i),
        l = await u.fetchFromAPI(c, {origin: 'mainSearch'});
      return await u.process(l);
    }),
    Ke = te('search/fetchFacetValues', async (e, t) => {
      let r = t.getState(),
        {
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        } = t.extra,
        {description: i, action: s} = await e.prepare({
          getState: () => t.getState(),
          analyticsClientMiddleware: a,
          preprocessRequest: n,
          logger: o,
        }),
        u = new Aa({...t, analyticsAction: s}),
        c = await EA(r, i),
        l = await u.fetchFromAPI(c, {origin: 'facetValues'});
      return await u.process(l);
    }),
    $r = te('search/fetchInstantResults', async (e, t) => {
      y(e, {
        id: q,
        q,
        maxResultsPerQuery: new U({required: !0, min: 1}),
        cacheTimeout: new U(),
      });
      let {q: r, maxResultsPerQuery: a} = e,
        n = t.getState(),
        {
          analyticsClientMiddleware: o,
          preprocessRequest: i,
          logger: s,
        } = t.extra,
        {action: u} = await wg().prepare({
          getState: () => t.getState(),
          analyticsClientMiddleware: o,
          preprocessRequest: i,
          logger: s,
        }),
        c = new Aa({...t, analyticsAction: u}, (d) =>
          t.dispatch(jr({q: d, id: e.id}))
        ),
        l = await IA(n, r, a),
        p = await c.fetchFromAPI(l, {
          origin: 'instantResults',
          disableAbortWarning: !0,
        }),
        f = await c.process(p);
      return 'response' in f
        ? {
            results: f.response.results,
            searchUid: f.response.searchUid,
            analyticsAction: f.analyticsAction,
          }
        : f;
    }),
    PA = async (e, t) => {
      var a, n, o, i;
      let r = await ct(e, t);
      return (
        (r.request = {
          ...r.request,
          firstResult:
            ((n = (a = e.pagination) == null ? void 0 : a.firstResult) != null
              ? n
              : 0) +
            ((i = (o = e.search) == null ? void 0 : o.results.length) != null
              ? i
              : 0),
        }),
        r
      );
    },
    IA = async (e, t, r) => {
      let a = await gn(e);
      return Ns({
        ...a,
        ...(e.didYouMean && {enableDidYouMean: e.didYouMean.enableDidYouMean}),
        numberOfResults: r,
        q: t,
      });
    },
    EA = async (e, t) => {
      let r = await ct(e, t);
      return (r.request.numberOfResults = 0), r;
    },
    Gg = (e) => {
      var t;
      e.configuration.analytics.enabled &&
        Ft.addElement({
          name: 'Query',
          ...(((t = e.query) == null ? void 0 : t.q) && {value: e.query.q}),
          time: JSON.stringify(new Date()),
        });
    };
  var Qs = (e) => (t) => (r) => {
    var o, i;
    let a = (o = r.payload) == null ? void 0 : o.analyticsAction;
    a !== void 0 && ((i = r.payload) == null || delete i.analyticsAction);
    let n = t(r);
    return (
      r.type === T.fulfilled.type &&
        a === void 0 &&
        console.error('No analytics action associated with search:', r),
      r.type === on.fulfilled &&
        a === void 0 &&
        console.error('No analytics action associated with recommendation:', r),
      r.type === nn.fulfilled &&
        a === void 0 &&
        console.error(
          'No analytics action associated with product recommendation:',
          r
        ),
      a !== void 0 && e.dispatch(a),
      n
    );
  };
  function wA(e) {
    return e.instantlyCallable;
  }
  var Ls = () => (e) => (t) => e(wA(t) ? t() : t);
  var js = (e) => () => (t) => (r) => {
      var n;
      if (!r.error) return t(r);
      let a = r.error;
      if (
        (((n = r.payload) == null ? void 0 : n.ignored) ||
          e.error(
            a.stack || a.message || a.name || 'Error',
            `Action dispatch error ${r.type}`,
            r
          ),
        r.error.name !== 'SchemaValidationError')
      )
        return t(r);
    },
    Us = (e) => (t) => (r) => (a) => (
      e.debug(
        {action: a, nextState: t.getState()},
        `Action dispatched: ${a.type}`
      ),
      r(a)
    );
  var Bs = () => ({caseAssistId: '', locale: 'en-US'});
  var _s = () => ({
    status: {loading: !1, error: null, lastResponseId: ''},
    fields: {},
  });
  var $s = () => ({});
  var Hs = be(Ts()),
    Zg = be(Jg()),
    eh = be(Xg());
  Hs.default.extend(eh.default);
  Hs.default.extend(Zg.default);
  var jd = '/rest/search/v2',
    zs = '/rest/ua',
    Ne = () => ({
      organizationId: '',
      accessToken: '',
      platformUrl: gi(),
      search: {
        apiBaseUrl: `${gi()}${jd}`,
        locale: 'en-US',
        timezone: Hs.default.tz.guess(),
        authenticationProviders: [],
      },
      analytics: {
        enabled: !0,
        apiBaseUrl: `${us()}${zs}`,
        originContext: 'Search',
        originLevel2: 'default',
        originLevel3: 'default',
        anonymous: !1,
        deviceId: '',
        userDisplayName: '',
        documentLocation: '',
      },
    });
  var Ws = () => ({
    status: {loading: !1, error: null, lastResponseId: ''},
    documents: [],
  });
  function Hr() {
    return {
      uniqueId: '',
      content: '',
      isLoading: !1,
      position: -1,
      resultsWithPreview: [],
    };
  }
  function th(e = {}) {
    return {
      configuration: Ne(),
      caseAssistConfiguration: Bs(),
      caseField: _s(),
      caseInput: $s(),
      documentSuggestion: Ws(),
      debug: We(),
      version: 'unit-testing-version',
      resultPreview: Hr(),
      searchHub: Ee(),
      ...e,
    };
  }
  var OA = be(ii());
  var Pa = (e) => e;
  function Ud() {
    return {results: [], loading: !1};
  }
  var Bd = () => ({caseContext: {}, caseId: '', caseNumber: ''});
  var Ys = () => ({correctedQuery: '', wordCorrections: [], originalQuery: ''});
  function Ai() {
    return {
      enableDidYouMean: !1,
      wasCorrectedTo: '',
      wasAutomaticallyCorrected: !1,
      queryCorrection: Ys(),
      originalQuery: '',
    };
  }
  function Ia() {
    return {};
  }
  var Ks = [
      'author',
      'language',
      'urihash',
      'objecttype',
      'collection',
      'source',
      'permanentid',
    ],
    _d = [...Ks, 'date', 'filetype', 'parents'],
    ah = [
      ..._d,
      'ec_price',
      'ec_name',
      'ec_description',
      'ec_brand',
      'ec_category',
      'ec_item_group_id',
      'ec_shortdesc',
      'ec_thumbnails',
      'ec_images',
      'ec_promo_price',
      'ec_in_stock',
      'ec_rating',
    ],
    Ea = () => ({
      fieldsToInclude: Ks,
      fetchAllFields: !1,
      fieldsDescription: [],
    });
  var $d = () => ({insightId: ''});
  var Hd = () => ({loading: !1, config: void 0});
  var zd = () => ({});
  function Fn() {
    return {};
  }
  var Gs = () => ({
    url: '',
    clientId: '',
    additionalFields: [],
    advancedParameters: {debug: !1},
    products: [],
    facets: {results: []},
    error: null,
    isLoading: !1,
    responseId: '',
  });
  var wa = ((r) => ((r.Relevance = 'relevance'), (r.Fields = 'fields'), r))(
      wa || {}
    ),
    nh = ((r) => ((r.Ascending = 'asc'), (r.Descending = 'desc'), r))(nh || {}),
    oh = () => ({by: 'relevance'});
  var w0 = new L({
    options: {required: !1},
    values: {
      by: new Vt({enum: wa, required: !0}),
      fields: new K({
        each: new L({values: {name: new O(), direction: new Vt({enum: nh})}}),
      }),
    },
  });
  function Js() {
    return oh();
  }
  function ih(e = {}) {
    return {
      configuration: Ne(),
      productListing: Gs(),
      sort: Js(),
      facetSearchSet: Ia(),
      categoryFacetSet: Ct(),
      categoryFacetSearchSet: Fn(),
      dateFacetSet: xt(),
      facetOptions: Sr(),
      facetOrder: Br(),
      facetSet: bt(),
      numericFacetSet: Rt(),
      pagination: Ae(),
      version: 'unit-testing-version',
      context: st(),
      ...e,
    };
  }
  function sh(e = {}) {
    return {
      configuration: Ne(),
      context: st(),
      dictionaryFieldContext: Bt(),
      searchHub: Ee(),
      productRecommendations: tn(),
      version: 'unit-testing-version',
      ...e,
    };
  }
  function ch(e = {}) {
    return {
      configuration: Ne(),
      advancedSearchQueries: $e(),
      context: st(),
      dictionaryFieldContext: Bt(),
      fields: Ea(),
      searchHub: Ee(),
      pipeline: ot(),
      recommendation: Lr(),
      debug: We(),
      version: 'unit-testing-version',
      pagination: Ae(),
      ...e,
    };
  }
  var uh = be(ii());
  var Xs = (e) => e,
    Zs = (e) => e,
    ec = (e) => e;
  function lh(e) {
    return new Si({
      logger: (0, uh.default)({level: 'silent'}),
      preprocessRequest: Pa,
      postprocessSearchResponseMiddleware: Xs,
      postprocessFacetSearchResponseMiddleware: Zs,
      postprocessQuerySuggestResponseMiddleware: ec,
      ...e,
    });
  }
  var tc = (e) => ({past: [], present: e, future: []}),
    qA = (e) => {
      let {past: t, present: r, future: a} = e;
      if (!r || t.length === 0) return e;
      let n = t[t.length - 1];
      return {past: t.slice(0, t.length - 1), present: n, future: [r, ...a]};
    },
    TA = (e) => {
      let {past: t, present: r, future: a} = e;
      if (!r || a.length === 0) return e;
      let n = a[0],
        o = a.slice(1);
      return {past: [...t, r], present: n, future: o};
    },
    DA = (e) => {
      let {action: t, state: r, reducer: a} = e,
        {past: n, present: o} = r,
        i = a(o, t);
      return o
        ? o === i
          ? r
          : {past: [...n, o], present: i, future: []}
        : tc(i);
    },
    dh = (e) => {
      let {actionTypes: t, reducer: r} = e,
        a = tc();
      return (n = a, o) => {
        switch (o.type) {
          case t.undo:
            return qA(n);
          case t.redo:
            return TA(n);
          case t.snapshot:
            return DA({state: n, reducer: r, action: o});
          default:
            return n;
        }
      };
    };
  function rc() {
    return {length: void 0};
  }
  var An = () => ({
    enabled: !1,
    fields: {
      collection: 'foldingcollection',
      parent: 'foldingparent',
      child: 'foldingchild',
    },
    filterFieldRange: 2,
    collections: {},
  });
  var Pi = () => ({
    liked: !1,
    disliked: !1,
    expanded: !1,
    feedbackModalOpen: !1,
    relatedQuestions: [],
  });
  function ac() {
    return {queries: [], maxLength: 10};
  }
  function nc() {
    return {results: [], maxLength: 10};
  }
  function oc() {
    return {};
  }
  var ic = () => ({
    redirectTo: '',
    query: '',
    executions: [],
    notifications: [],
    queryModification: {originalQuery: '', newQuery: '', queryToIgnore: ''},
  });
  function sc(e = {}) {
    return {
      configuration: Ne(),
      advancedSearchQueries: $e(),
      staticFilterSet: xa(),
      facetSet: bt(),
      dateFacetSet: xt(),
      numericFacetSet: Rt(),
      categoryFacetSet: Ct(),
      facetSearchSet: Ia(),
      categoryFacetSearchSet: Fn(),
      facetOptions: Sr(),
      pagination: Ae(),
      query: ve(),
      querySet: Ca(),
      instantResults: yn(),
      tabSet: Ra(),
      querySuggest: {},
      search: Ze(),
      sortCriteria: et(),
      context: st(),
      dictionaryFieldContext: Bt(),
      didYouMean: Ai(),
      fields: Ea(),
      history: tc(Ps()),
      pipeline: ot(),
      facetOrder: Br(),
      searchHub: Ee(),
      debug: We(),
      resultPreview: Hr(),
      version: 'unit-testing-version',
      folding: An(),
      triggers: ic(),
      questionAnswering: Pi(),
      standaloneSearchBoxSet: oc(),
      recentResults: nc(),
      recentQueries: ac(),
      excerptLength: rc(),
      ...e,
    };
  }
  function mh(e = {}) {
    let t = Ii(e, sc);
    return {
      ...t,
      executeFirstSearch: jest.fn(),
      executeFirstSearchAfterStandaloneSearchBoxRedirect: jest.fn(),
      apiClient: t.apiClient,
    };
  }
  function gh(e = {}) {
    return Ii(e, ch);
  }
  function hh(e = {}) {
    return Ii(e, sh);
  }
  function Sh(e = {}) {
    return Ii(e, ih);
  }
  function yh(e = {}) {
    return Ii(e, th);
  }
  function Ii(e = {}, t, r = VA) {
    let a = (0, ph.default)({level: 'silent'}),
      n = vh(e, t),
      {store: o, apiClient: i} = r(a, n),
      s = o(n),
      u = () => {},
      {state: c, ...l} = e;
    return {
      store: s,
      apiClient: i,
      state: vh(e, t),
      subscribe: jest.fn(() => u),
      get dispatch() {
        return s.dispatch;
      },
      get actions() {
        return s.getActions();
      },
      findAsyncAction(p) {
        let f = this.actions.find((d) => d.type === p.type);
        return NA(f) ? f : void 0;
      },
      logger: a,
      addReducers: jest.fn(),
      enableAnalytics: jest.fn(),
      disableAnalytics: jest.fn(),
      ...l,
    };
  }
  function vh(e, t) {
    let r = e.state || t();
    return (r.configuration.analytics.enabled = !1), r;
  }
  var VA = (e) => {
    let t = {apiClient: lh({logger: e}), validatePayload: ze, logger: e};
    return {
      store: (0, fh.default)([
        Ls,
        js(e),
        Qs,
        Go.withExtraArgument(t),
        ...Ki(),
        Us(e),
      ]),
      apiClient: t.apiClient,
    };
  };
  function NA(e) {
    return e ? 'meta' in e : !1;
  }
  function cc(e = {}) {
    return {
      urihash: '',
      parents: '',
      sfid: '',
      sfparentid: '',
      sfinsertedbyid: '',
      documenttype: '',
      sfcreatedbyid: '',
      permanentid: '',
      date: 0,
      objecttype: '',
      sourcetype: '',
      sftitle: '',
      size: 0,
      sffeeditemid: '',
      clickableuri: '',
      sfcreatedby: '',
      source: '',
      collection: '',
      connectortype: '',
      filetype: '',
      sfcreatedbyname: '',
      sflikecount: 0,
      language: [],
      ...e,
    };
  }
  function Ch(e = {}) {
    return {
      title: '',
      uri: '',
      printableUri: '',
      clickUri: '',
      uniqueId: '',
      excerpt: '',
      firstSentences: '',
      summary: null,
      flags: '',
      hasHtmlVersion: !1,
      score: 0,
      percentScore: 0,
      rankingInfo: null,
      isTopResult: !1,
      isRecommendation: !1,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      absentTerms: [],
      raw: cc(),
      ...e,
    };
  }
  var Gd = {};
  Ui(Gd, {
    escape: () => Pn,
    getHighlightedSuggestion: () => Yd,
    highlightString: () => MA,
  });
  function MA(e) {
    if (ps(e.openingDelimiter) || ps(e.closingDelimiter))
      throw Error('delimiters should be a non-empty string');
    if (re(e.content) || ps(e.content)) return e.content;
    if (e.highlights.length === 0) return Pn(e.content);
    let t = e.content.length,
      r = '',
      a = 0;
    for (let n = 0; n < e.highlights.length; n++) {
      let o = e.highlights[n],
        i = o.offset,
        s = i + o.length;
      if (s > t) break;
      (r += Pn(e.content.slice(a, i))),
        (r += e.openingDelimiter),
        (r += Pn(e.content.slice(i, s))),
        (r += e.closingDelimiter),
        (a = s);
    }
    return a !== t && (r += Pn(e.content.slice(a))), r;
  }
  function Yd(e, t) {
    return (
      (e = Pn(e)),
      e.replace(/\[(.*?)\]|\{(.*?)\}|\((.*?)\)/g, (r, a, n, o) =>
        a
          ? Kd(a, t.notMatchDelimiters)
          : n
          ? Kd(n, t.exactMatchDelimiters)
          : o
          ? Kd(o, t.correctionDelimiters)
          : r
      )
    );
  }
  function Kd(e, t) {
    return t ? t.open + e + t.close : e;
  }
  function Pn(e) {
    let t = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;',
      },
      r = '(?:' + Object.keys(t).join('|') + ')',
      a = RegExp(r),
      n = RegExp(r, 'g');
    return a.test(e) ? e.replace(n, (o) => t[o]) : e;
  }
  var Jd = (e) => y(e, {evt: q, type: oe}),
    xh = (e) =>
      Q('analytics/generic/search', M.Search, (t) => {
        Jd(e);
        let {evt: r, meta: a} = e;
        return t.makeSearchEvent(r, a);
      }),
    Rh = (e) =>
      Q(
        'analytics/generic/click',
        M.Click,
        (t, r) => (
          _e(e.result),
          Jd(e),
          t.makeClickEvent(e.evt, Ve(e.result, r), Le(e.result), e.meta)
        )
      ),
    bh = (e) =>
      Q(
        'analytics/generic/custom',
        M.Custom,
        (t) => (Jd(e), t.makeCustomEventWithType(e.evt, e.type, e.meta))
      ),
    uc = () =>
      Q('analytics/interface/load', M.Search, (e) => e.makeInterfaceLoad()),
    zr = () =>
      Q('analytics/interface/change', M.Search, (e, t) =>
        e.makeInterfaceChange({
          interfaceChangeTo: t.configuration.analytics.originLevel2,
        })
      ),
    lc = () =>
      Q('analytics/interface/searchFromLink', M.Search, (e) =>
        e.makeSearchFromLink()
      ),
    dc = (e) =>
      Q('analytics/interface/omniboxFromLink', M.Search, (t) =>
        t.makeOmniboxFromLink(e)
      );
  var Xd = () => oe,
    Fh = () => q,
    Ht = S('configuration/updateBasicConfiguration', (e) =>
      y(e, {accessToken: oe, organizationId: oe, platformUrl: oe})
    ),
    lt = S('configuration/updateSearchConfiguration', (e) =>
      y(e, {
        apiBaseUrl: oe,
        pipeline: new O({required: !1, emptyAllowed: !0}),
        searchHub: oe,
        timezone: oe,
        locale: oe,
        authenticationProviders: new K({required: !1, each: q}),
      })
    ),
    Wr = S(
      'configuration/updateAnalyticsConfiguration',
      (e) => (
        ms() && (e.enabled = !1),
        y(e, {
          enabled: new J({default: !0}),
          originContext: Xd(),
          originLevel2: Xd(),
          originLevel3: Xd(),
          apiBaseUrl: oe,
          runtimeEnvironment: new de(),
          anonymous: new J({default: !1}),
          deviceId: oe,
          userDisplayName: oe,
          documentLocation: oe,
        })
      )
    ),
    In = S('configuration/analytics/disable'),
    En = S('configuration/analytics/enable'),
    pc = S('configuration/analytics/originlevel2', (e) =>
      y(e, {originLevel2: Fh()})
    ),
    fc = S('configuration/analytics/originlevel3', (e) =>
      y(e, {originLevel3: Fh()})
    );
  var Cr = (e, t) => {
      let r = e;
      return re(r[t]) ? (re(e.raw[t]) ? null : e.raw[t]) : r[t];
    },
    Ah = (e) => (t) => e.every((r) => !re(Cr(t, r))),
    Ph = (e) => (t) => e.every((r) => re(Cr(t, r))),
    Ih = (e, t) => (r) => {
      let a = wh(e, r);
      return t.some((n) =>
        a.some((o) => `${o}`.toLowerCase() === n.toLowerCase())
      );
    },
    Eh = (e, t) => (r) => {
      let a = wh(e, r);
      return t.every((n) =>
        a.every((o) => `${o}`.toLowerCase() !== n.toLowerCase())
      );
    },
    wh = (e, t) => {
      let r = Cr(t, e);
      return ds(r) ? r : [r];
    };
  function mc(e) {
    return e.search.response.searchUid !== '';
  }
  function kh(e, t, r) {
    return e.search.results.find((a) => Cr(a, t) === r);
  }
  function Oh(e) {
    let t = {...e},
      r,
      a = (n) => (o, i) => {
        let s = n(o, i);
        return r ? r(s, i) : s;
      };
    return {
      get combinedReducer() {
        return a((0, g.combineReducers)(t));
      },
      containsAll(n) {
        return Object.keys(n).every((i) => i in t);
      },
      add(n) {
        Object.keys(n)
          .filter((o) => !(o in t))
          .forEach((o) => (t[o] = n[o]));
      },
      addCrossReducer(n) {
        r = n;
      },
    };
  }
  var gc = {
    q: new O(),
    enableQuerySyntax: new J(),
    aq: new O(),
    cq: new O(),
    firstResult: new U({min: 0}),
    numberOfResults: new U({min: 0}),
    sortCriteria: new O(),
    f: new L(),
    cf: new L(),
    nf: new L(),
    df: new L(),
    debug: new J(),
    sf: new L(),
    tab: new O(),
  };
  var ue = S('searchParameters/restore', (e) => y(e, gc));
  var Yr = () => new O({required: !1, emptyAllowed: !0}),
    hc = S('advancedSearchQueries/update', (e) =>
      y(e, {aq: Yr(), cq: Yr(), lq: Yr(), dq: Yr()})
    ),
    Sc = S('advancedSearchQueries/register', (e) =>
      y(e, {aq: Yr(), cq: Yr(), lq: Yr(), dq: Yr()})
    );
  var qh = k($e(), (e) => {
    e.addCase(hc, (t, r) => {
      let {aq: a, cq: n, lq: o, dq: i} = r.payload;
      De(a) || ((t.aq = a), (t.aqWasSet = !0)),
        De(n) || ((t.cq = n), (t.cqWasSet = !0)),
        De(o) || ((t.lq = o), (t.lqWasSet = !0)),
        De(i) || ((t.dq = i), (t.dqWasSet = !0));
    })
      .addCase(Sc, (t, r) => {
        let {aq: a, cq: n, lq: o, dq: i} = r.payload;
        De(a) || ((t.defaultFilters.aq = a), t.aqWasSet || (t.aq = a)),
          De(n) || ((t.defaultFilters.cq = n), t.cqWasSet || (t.cq = n)),
          De(o) || ((t.defaultFilters.lq = o), t.lqWasSet || (t.lq = o)),
          De(i) || ((t.defaultFilters.dq = i), t.dqWasSet || (t.dq = i));
      })
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n =
          (a = r.payload) == null ? void 0 : a.advancedSearchQueries) != null
          ? n
          : t;
      })
      .addCase(ue, (t, r) => {
        let {aq: a, cq: n} = r.payload;
        De(a) || ((t.aq = a), (t.aqWasSet = !0)),
          De(n) || ((t.cq = n), (t.cqWasSet = !0));
      });
  });
  var Th = new L({
      options: {required: !0},
      values: {
        articleLanguage: oe,
        articlePublishStatus: oe,
        articleVersionNumber: oe,
        caseId: q,
        knowledgeArticleId: oe,
        name: oe,
        permanentId: oe,
        resultUrl: oe,
        source: oe,
        title: q,
        uriHash: oe,
      },
    }),
    Dh = S('insight/attachToCase/setAttachedResults', (e) =>
      y(e, {
        results: new K({each: Th}),
        loading: new J({required: !1, default: !1}),
      })
    ),
    Vh = S('insight/attachToCase/attach', (e) => Mh(e)),
    Nh = S('insight/attachToCase/detach', (e) => Mh(e)),
    Mh = (e) =>
      re(e.result.permanentId) && re(e.result.uriHash)
        ? {
            payload: e,
            error: At(new ga('Either permanentId or uriHash is required')),
          }
        : y(e, {result: Th});
  var QA = k(Ud(), (e) => {
      e.addCase(Dh, (t, r) => {
        var o;
        let {results: a, loading: n} = r.payload;
        ('results' in t && ((o = t.results) == null ? void 0 : o.length) > 0) ||
          ((t.results = a), n && (t.loading = n));
      })
        .addCase(Vh, (t, r) => {
          (!re(r.payload.result.permanentId) ||
            !re(r.payload.result.uriHash)) &&
            (t.results = [...t.results, r.payload.result]);
        })
        .addCase(Nh, (t, r) => {
          t.results = t.results.filter((a) => LA(a, r.payload.result));
        });
    }),
    LA = (e, t) => {
      let r =
          !re(e.permanentId) &&
          (e == null ? void 0 : e.permanentId) ===
            (t == null ? void 0 : t.permanentId),
        a =
          !re(e.uriHash) &&
          (e == null ? void 0 : e.uriHash) === (t == null ? void 0 : t.uriHash);
      return !(e.caseId === t.caseId) || (!r && !a);
    };
  var Qh = S('caseAssistConfiguration/set', (e) =>
    y(e, {caseAssistId: q, locale: oe})
  );
  var jA = k(Bs(), (e) => {
    e.addCase(Qh, (t, r) => {
      (t.caseAssistId = r.payload.caseAssistId), (t.locale = r.payload.locale);
    });
  });
  var Lh = S('insight/caseContext/set', (e) => {
      let t = new L({options: {required: !0}}),
        r = y(e, t).error;
      if (r) return {payload: e, error: r};
      let a = Object.values(e),
        n = new K({each: ie}),
        o = y(a, n).error;
      return o ? {payload: e, error: o} : {payload: e};
    }),
    jh = S('insight/caseId/set', (e) => {
      let r = y(e, ie).error;
      return r ? {payload: e, error: r} : {payload: e};
    }),
    Uh = S('insight/caseNumber/set', (e) => {
      let r = y(e, ie).error;
      return r ? {payload: e, error: r} : {payload: e};
    });
  var UA = k(Bd(), (e) => {
    e.addCase(Lh, (t, r) => {
      t.caseContext = r.payload;
    })
      .addCase(jh, (t, r) => {
        t.caseId = r.payload;
      })
      .addCase(Uh, (t, r) => {
        t.caseNumber = r.payload;
      });
  });
  var yc = (e) =>
    Object.keys(e)
      .filter((t) => e[t].value !== '')
      .reduce((t, r) => ({...t, [r]: e[r].value}), {});
  var Bh = S('caseAssist/caseField/register', (e) =>
      y(e, {fieldName: q, fieldValue: ie})
    ),
    _h = S('caseAssist/caseField/update', (e) =>
      y(e, {fieldName: q, fieldValue: ie})
    ),
    vc = te(
      'caseAssist/classifications/fetch',
      async (e, {getState: t, rejectWithValue: r, extra: {apiClient: a}}) => {
        let n = t(),
          o = await a.getCaseClassifications(await BA(n));
        return ge(o) ? r(o.error) : {response: o.success};
      }
    ),
    BA = async (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.platformUrl,
      caseAssistId: e.caseAssistConfiguration.caseAssistId,
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
      }),
      fields: e.caseInput,
      context: e.caseField ? yc(e.caseField.fields) : void 0,
      locale: e.caseAssistConfiguration.locale,
      debug: e.debug,
    });
  var _A = k(_s(), (e) => {
    e.addCase(Bh, (t, r) => {
      let {fieldName: a, fieldValue: n} = r.payload;
      t.fields[a] = {value: n, suggestions: []};
    })
      .addCase(_h, (t, r) => {
        let {fieldName: a, fieldValue: n} = r.payload;
        t.fields[a].value = n;
      })
      .addCase(vc.rejected, (t, r) => {
        var a;
        (t.status.error = (a = r.payload) != null ? a : null),
          (t.status.loading = !1);
      })
      .addCase(vc.fulfilled, (t, r) => {
        let a = {value: '', suggestions: []};
        Object.entries(r.payload.response.fields).forEach(([n, o]) => {
          t.fields[n] || (t.fields[n] = {...a}),
            (t.fields[n].suggestions = o.predictions);
        }),
          (t.status.lastResponseId = r.payload.response.responseId),
          (t.status.error = null),
          (t.status.loading = !1);
      })
      .addCase(vc.pending, (t) => {
        t.status.loading = !0;
      });
  });
  var $h = S('caseAssist/caseInput/update', (e) =>
    y(e, {fieldName: q, fieldValue: ie})
  );
  var $A = k($s(), (e) => {
    e.addCase($h, (t, r) => {
      t[r.payload.fieldName] = {value: r.payload.fieldValue};
    });
  });
  var wn = S('tab/register', (e) => {
      let t = new L({values: {id: q, expression: ie}});
      return y(e, t);
    }),
    xr = S('tab/updateActiveTab', (e) => y(e, q));
  function HA(e, t) {
    if (
      /^https:\/\/platform(dev|stg|hipaa)?(-)?(eu|au)?\.cloud\.coveo\.com/.test(
        e
      )
    )
      return e.replace(/^(https:\/\/)platform/, '$1analytics') + zs;
    let a = e.match(new RegExp(`^https://(${t}\\.org)\\.coveo.com`));
    return a ? e.replace(a[1], 'analytics.cloud') + zs : e;
  }
  var Hh = k(Ne(), (e) =>
    e
      .addCase(Ht, (t, r) => {
        r.payload.accessToken && (t.accessToken = r.payload.accessToken),
          r.payload.organizationId &&
            (t.organizationId = r.payload.organizationId),
          r.payload.platformUrl &&
            ((t.platformUrl = r.payload.platformUrl),
            (t.search.apiBaseUrl = `${r.payload.platformUrl}${jd}`),
            (t.analytics.apiBaseUrl = HA(
              r.payload.platformUrl,
              t.organizationId
            )));
      })
      .addCase(lt, (t, r) => {
        r.payload.apiBaseUrl && (t.search.apiBaseUrl = r.payload.apiBaseUrl),
          r.payload.locale && (t.search.locale = r.payload.locale),
          r.payload.timezone && (t.search.timezone = r.payload.timezone),
          r.payload.authenticationProviders &&
            (t.search.authenticationProviders =
              r.payload.authenticationProviders);
      })
      .addCase(Wr, (t, r) => {
        re(r.payload.enabled) ||
          (!r.payload.enabled && t.analytics.enabled && ud(t.analytics),
          (t.analytics.enabled = r.payload.enabled)),
          re(r.payload.originContext) ||
            (t.analytics.originContext = r.payload.originContext),
          re(r.payload.originLevel2) ||
            (t.analytics.originLevel2 = r.payload.originLevel2),
          re(r.payload.originLevel3) ||
            (t.analytics.originLevel3 = r.payload.originLevel3),
          re(r.payload.apiBaseUrl) ||
            (t.analytics.apiBaseUrl = r.payload.apiBaseUrl),
          re(r.payload.runtimeEnvironment) ||
            (t.analytics.runtimeEnvironment = r.payload.runtimeEnvironment),
          re(r.payload.anonymous) ||
            (t.analytics.anonymous = r.payload.anonymous),
          re(r.payload.deviceId) || (t.analytics.deviceId = r.payload.deviceId),
          re(r.payload.userDisplayName) ||
            (t.analytics.userDisplayName = r.payload.userDisplayName),
          re(r.payload.documentLocation) ||
            (t.analytics.documentLocation = r.payload.documentLocation);
      })
      .addCase(In, (t) => {
        (t.analytics.enabled = !1), ud(t.analytics);
      })
      .addCase(En, (t) => {
        t.analytics.enabled = !0;
      })
      .addCase(pc, (t, r) => {
        t.analytics.originLevel2 = r.payload.originLevel2;
      })
      .addCase(fc, (t, r) => {
        t.analytics.originLevel3 = r.payload.originLevel3;
      })
      .addCase(xr, (t, r) => {
        t.analytics.originLevel2 = r.payload;
      })
      .addCase(ue, (t, r) => {
        t.analytics.originLevel2 = r.payload.tab || t.analytics.originLevel2;
      })
  );
  var zA = new K({each: q, required: !0}),
    zh = (e, t) => (
      y(e, q),
      Ya(t) ? y(t, q) : y(t, zA),
      {payload: {contextKey: e, contextValue: t}}
    ),
    kn = S('context/set', (e) => {
      for (let [t, r] of Object.entries(e)) zh(t, r);
      return {payload: e};
    }),
    On = S('context/add', (e) => zh(e.contextKey, e.contextValue)),
    qn = S('context/remove', (e) => y(e, q));
  var Wh = k(st(), (e) => {
    e.addCase(kn, (t, r) => {
      t.contextValues = r.payload;
    })
      .addCase(On, (t, r) => {
        t.contextValues[r.payload.contextKey] = r.payload.contextValue;
      })
      .addCase(qn, (t, r) => {
        delete t.contextValues[r.payload];
      })
      .addCase(ce.fulfilled, (t, r) => {
        !r.payload || (t.contextValues = r.payload.context.contextValues);
      });
  });
  var Kr = S('debug/enable'),
    Tn = S('debug/disable');
  var Yh = k(We(), (e) => {
    e.addCase(Kr, () => !0)
      .addCase(Tn, () => !1)
      .addCase(ue, (t, r) => {
        var a;
        return (a = r.payload.debug) != null ? a : t;
      });
  });
  var Kh = k(Za, (e) => e);
  var Dn = S('dictionaryFieldContext/set', (e) => {
      let t = new L({options: {required: !0}}),
        r = y(e, t).error;
      if (r) return {payload: e, error: r};
      let a = Object.values(e),
        n = new K({each: ie}),
        o = y(a, n).error;
      return o ? {payload: e, error: o} : {payload: e};
    }),
    Vn = S('dictionaryFieldContext/add', (e) => {
      let t = new L({options: {required: !0}, values: {field: ie, key: ie}});
      return y(e, t);
    }),
    Nn = S('dictionaryFieldContext/remove', (e) => y(e, ie));
  var Gh = k(Bt(), (e) => {
    e.addCase(Dn, (t, r) => {
      t.contextValues = r.payload;
    })
      .addCase(Vn, (t, r) => {
        let {field: a, key: n} = r.payload;
        t.contextValues[a] = n;
      })
      .addCase(Nn, (t, r) => {
        delete t.contextValues[r.payload];
      })
      .addCase(ce.fulfilled, (t, r) => {
        !r.payload ||
          (t.contextValues = r.payload.dictionaryFieldContext.contextValues);
      });
  });
  var Jh = k(Ai(), (e) => {
    e.addCase(hn, (t) => {
      t.enableDidYouMean = !0;
    })
      .addCase(ys, (t) => {
        t.enableDidYouMean = !1;
      })
      .addCase(T.pending, (t) => {
        (t.queryCorrection = Ys()),
          (t.wasAutomaticallyCorrected = !1),
          (t.wasCorrectedTo = '');
      })
      .addCase(T.fulfilled, (t, r) => {
        (t.queryCorrection = r.payload.response.queryCorrections[0] || Ys()),
          (t.originalQuery = r.payload.originalQuery),
          (t.wasAutomaticallyCorrected = r.payload.automaticallyCorrected);
      })
      .addCase(Ut, (t, r) => {
        t.wasCorrectedTo = r.payload;
      });
  });
  var Cc = te(
      'caseAssist/documentSuggestions/fetch',
      async (e, {getState: t, rejectWithValue: r, extra: {apiClient: a}}) => {
        let n = t(),
          o = await a.getDocumentSuggestions(await WA(n));
        return ge(o) ? r(o.error) : {response: o.success};
      }
    ),
    WA = async (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.platformUrl,
      caseAssistId: e.caseAssistConfiguration.caseAssistId,
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
      }),
      fields: e.caseInput,
      context: e.caseField ? yc(e.caseField.fields) : void 0,
      locale: e.caseAssistConfiguration.locale,
      debug: e.debug,
    });
  var YA = k(Ws(), (e) => {
    e.addCase(Cc.rejected, (t, r) => {
      var a;
      (t.status.error = (a = r.payload) != null ? a : null),
        (t.status.loading = !1);
    })
      .addCase(Cc.fulfilled, (t, r) => {
        (t.documents = r.payload.response.documents),
          (t.status.lastResponseId = r.payload.response.responseId),
          (t.status.error = null),
          (t.status.loading = !1);
      })
      .addCase(Cc.pending, (t) => {
        t.status.loading = !0;
      });
  });
  var xc = S('excerptLength/set', (e) => y(e, new U({min: 0, required: !0})));
  var Xh = k(rc(), (e) => {
    e.addCase(xc, (t, r) => {
      t.length = r.payload;
    });
  });
  var ee = q;
  var KA = {
    state: new de({required: !0}),
    numberOfResults: new U({required: !0, min: 0}),
    value: new O({required: !0, emptyAllowed: !0}),
    path: new K({required: !0, each: q}),
    moreValuesAvailable: new J({required: !1}),
  };
  function Zd(e) {
    e.children.forEach((t) => {
      Zd(t);
    }),
      ze(
        {
          state: e.state,
          numberOfResults: e.numberOfResults,
          value: e.value,
          path: e.path,
          moreValuesAvailable: e.moreValuesAvailable,
        },
        KA
      );
  }
  var GA = {
      facetId: ee,
      field: q,
      delimitingCharacter: new O({required: !1, emptyAllowed: !0}),
      filterFacetCount: new J({required: !1}),
      injectionDepth: new U({required: !1, min: 0}),
      numberOfValues: new U({required: !1, min: 1}),
      sortCriteria: new de({required: !1}),
      basePath: new K({required: !1, each: q}),
      filterByBasePath: new J({required: !1}),
    },
    zt = S('categoryFacet/register', (e) => y(e, GA)),
    Gr = S('categoryFacet/toggleSelectValue', (e) => {
      try {
        return ze(e.facetId, q), Zd(e.selection), {payload: e, error: null};
      } catch (t) {
        return {payload: e, error: At(t)};
      }
    }),
    Wt = S('categoryFacet/deselectAll', (e) => y(e, ee)),
    ka = S('categoryFacet/updateNumberOfValues', (e) =>
      y(e, {facetId: ee, numberOfValues: new U({required: !0, min: 1})})
    ),
    Mn = S('categoryFacet/updateSortCriterion', (e) =>
      y(e, {facetId: ee, criterion: new de()})
    );
  var Yt = new O({regex: /^[a-zA-Z0-9-_]+$/}),
    Kt = new O({required: !0}),
    Zh = new K({each: new O()}),
    eS = new O(),
    tS = new J(),
    Gt = new J(),
    Jt = new U({min: 0}),
    It = new U({min: 1}),
    Rc = new J({required: !0}),
    JA = new L(),
    XA = new O(),
    ZA = {captions: JA, numberOfValues: It, query: XA},
    Qn = new L({values: ZA}),
    bc = new L({
      options: {required: !1},
      values: {
        type: new O({constrainTo: ['simple'], emptyAllowed: !1, required: !0}),
        values: new K({
          required: !0,
          max: 25,
          each: new O({emptyAllowed: !1, required: !0}),
        }),
      },
    }),
    rS = new J();
  var Fc = {value: q, numberOfResults: new U({min: 0}), state: q};
  var eP = {
      facetId: ee,
      field: new O({required: !0, emptyAllowed: !0}),
      filterFacetCount: new J({required: !1}),
      injectionDepth: new U({required: !1, min: 0}),
      numberOfValues: new U({required: !1, min: 1}),
      sortCriteria: new de({required: !1}),
      allowedValues: bc,
    },
    Xt = S('facet/register', (e) => y(e, eP)),
    Zt = S('facet/toggleSelectValue', (e) =>
      y(e, {facetId: ee, selection: new L({values: Fc})})
    ),
    xe = S('facet/deselectAll', (e) => y(e, ee)),
    Ln = S('facet/updateSortCriterion', (e) =>
      y(e, {facetId: ee, criterion: new de({required: !0})})
    ),
    Oa = S('facet/updateNumberOfValues', (e) =>
      y(e, {facetId: ee, numberOfValues: new U({required: !0, min: 1})})
    ),
    qa = S('facet/updateIsFieldExpanded', (e) =>
      y(e, {facetId: ee, isFieldExpanded: new J({required: !0})})
    ),
    Jr = S('facet/updateFreezeCurrentValues', (e) =>
      y(e, {facetId: ee, freezeCurrentValues: new J({required: !0})})
    );
  function Xr(e) {
    var o, i;
    let t = aS(e.start, e),
      r = aS(e.end, e),
      a = (o = e.endInclusive) != null ? o : !1,
      n = (i = e.state) != null ? i : 'idle';
    return {start: t, end: r, endInclusive: a, state: n};
  }
  function aS(e, t) {
    let {dateFormat: r} = t;
    return _g(e)
      ? (_r(e), jg(e))
      : typeof e == 'string' && $t(e)
      ? (_r(e), e)
      : (Vs(e, r), xi(ba(e, r)));
  }
  var jn = S('rangeFacet/updateSortCriterion', (e) =>
    y(e, {facetId: ee, criterion: new de({required: !0})})
  );
  var Un = {
      state: q,
      start: new U({required: !0}),
      end: new U({required: !0}),
      endInclusive: new J({required: !0}),
      numberOfResults: new U({required: !0, min: 0}),
    },
    Bn = {
      start: q,
      end: q,
      endInclusive: new J({required: !0}),
      state: q,
      numberOfResults: new U({required: !0, min: 0}),
    },
    _n = (e) => ({
      facetId: ee,
      selection:
        typeof e.start == 'string' ? new L({values: Bn}) : new L({values: Un}),
    });
  var tP = {start: q, end: q, endInclusive: new J({required: !0}), state: q},
    rP = {
      facetId: ee,
      field: q,
      currentValues: new K({required: !1, each: new L({values: tP})}),
      generateAutomaticRanges: new J({required: !0}),
      filterFacetCount: new J({required: !1}),
      injectionDepth: new U({required: !1, min: 0}),
      numberOfValues: new U({required: !1, min: 1}),
      sortCriteria: new de({required: !1}),
      rangeAlgorithm: new de({required: !1}),
    };
  function nS(e) {
    return $t(e) ? bi(e) : e;
  }
  function Ac(e) {
    !e.currentValues ||
      e.currentValues.forEach((t) => {
        let {start: r, end: a} = Xr(t);
        if (ba(nS(r)).isAfter(ba(nS(a))))
          throw new Error(
            `The start value is greater than the end value for the date range ${t.start} to ${t.end}`
          );
      });
  }
  var er = S('dateFacet/register', (e) => {
      try {
        return ze(e, rP), Ac(e), {payload: e, error: null};
      } catch (t) {
        return {payload: e, error: At(t)};
      }
    }),
    tr = S('dateFacet/toggleSelectValue', (e) =>
      y(e, {facetId: ee, selection: new L({values: Bn})})
    ),
    Rr = S('dateFacet/updateFacetValues', (e) => {
      try {
        return (
          ze(e, {facetId: ee, values: new K({each: new L({values: Bn})})}),
          Ac({currentValues: e.values}),
          {payload: e, error: null}
        );
      } catch (t) {
        return {payload: e, error: At(t)};
      }
    }),
    Pc = jn,
    Ic = xe;
  var aP = {
      state: q,
      start: new U({required: !0}),
      end: new U({required: !0}),
      endInclusive: new J({required: !0}),
    },
    nP = {
      facetId: ee,
      field: q,
      currentValues: new K({required: !1, each: new L({values: aP})}),
      generateAutomaticRanges: new J({required: !0}),
      filterFacetCount: new J({required: !1}),
      injectionDepth: new U({required: !1, min: 0}),
      numberOfValues: new U({required: !1, min: 1}),
      sortCriteria: new de({required: !1}),
      rangeAlgorithm: new de({required: !1}),
    };
  function Ec(e) {
    !e.currentValues ||
      e.currentValues.forEach(({start: t, end: r}) => {
        if (t > r)
          throw new Error(
            `The start value is greater than the end value for the numeric range ${t} to ${r}`
          );
      });
  }
  var rr = S('numericFacet/register', (e) => {
      try {
        return y(e, nP), Ec(e), {payload: e, error: null};
      } catch (t) {
        return {payload: e, error: At(t)};
      }
    }),
    ar = S('numericFacet/toggleSelectValue', (e) =>
      y(e, {facetId: ee, selection: new L({values: Un})})
    ),
    br = S('numericFacet/updateFacetValues', (e) => {
      try {
        return (
          ze(e, {facetId: ee, values: new K({each: new L({values: Un})})}),
          Ec({currentValues: e.values}),
          {payload: e, error: null}
        );
      } catch (t) {
        return {payload: e, error: At(t)};
      }
    }),
    wc = jn,
    kc = xe;
  var se = S('facetOptions/update', (e) =>
      y(e, {freezeFacetOrder: new J({required: !1})})
    ),
    je = S('facetOptions/facet/enable', (e) => y(e, ee)),
    ye = S('facetOptions/facet/disable', (e) => y(e, ee));
  var oS = k(Sr(), (e) => {
    e.addCase(se, (t, r) => ({...t, ...r.payload}))
      .addCase(T.fulfilled, (t) => {
        t.freezeFacetOrder = !1;
      })
      .addCase(T.rejected, (t) => {
        t.freezeFacetOrder = !1;
      })
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.facetOptions) != null
          ? n
          : t;
      })
      .addCase(zt, (t, r) => {
        t.facets[r.payload.facetId] = Sn();
      })
      .addCase(Xt, (t, r) => {
        t.facets[r.payload.facetId] = Sn();
      })
      .addCase(er, (t, r) => {
        t.facets[r.payload.facetId] = Sn();
      })
      .addCase(rr, (t, r) => {
        t.facets[r.payload.facetId] = Sn();
      })
      .addCase(je, (t, r) => {
        t.facets[r.payload].enabled = !0;
      })
      .addCase(ye, (t, r) => {
        t.facets[r.payload].enabled = !1;
      })
      .addCase(ue, (t, r) => {
        var a, n, o, i;
        [
          ...Object.keys((a = r.payload.f) != null ? a : {}),
          ...Object.keys((n = r.payload.cf) != null ? n : {}),
          ...Object.keys((o = r.payload.nf) != null ? o : {}),
          ...Object.keys((i = r.payload.df) != null ? i : {}),
        ].forEach((s) => {
          s in t || (t.facets[s] = Sn()), (t.facets[s].enabled = !0);
        });
      });
  });
  var Ei = {
    facetId: ee,
    captions: new L({options: {required: !1}}),
    numberOfValues: new U({required: !1, min: 1}),
    query: new O({required: !1, emptyAllowed: !0}),
  };
  var oP = {
      path: new K({required: !0, each: q}),
      displayValue: ie,
      rawValue: ie,
      count: new U({required: !0, min: 0}),
    },
    $n = S('categoryFacet/selectSearchResult', (e) =>
      y(e, {facetId: ee, value: new L({values: oP})})
    ),
    Hn = S('categoryFacetSearch/register', (e) => y(e, Ei));
  function zn(e, t) {
    var o;
    let {facetId: r, criterion: a} = t,
      n = (o = e[r]) == null ? void 0 : o.request;
    !n || (n.sortCriteria = a);
  }
  function wi(e) {
    !e ||
      ((e.currentValues = e.currentValues.map((t) => ({...t, state: 'idle'}))),
      (e.preventAutoSelect = !0));
  }
  function Oc(e, t) {
    !e || (e.numberOfValues = t);
  }
  function qc(e, t) {
    let r = e[t];
    !r ||
      ((r.request.numberOfValues = r.initialNumberOfValues),
      (r.request.currentValues = []),
      (r.request.preventAutoSelect = !0));
  }
  function ep(e, t, r) {
    (e.currentValues = iP(t, r)),
      (e.numberOfValues = t.length ? 1 : r),
      (e.preventAutoSelect = !0);
  }
  function iP(e, t) {
    if (!e.length) return [];
    let r = iS(e[0], t),
      a = r;
    for (let n of e.splice(1)) {
      let o = iS(n, t);
      a.children.push(o), (a = o);
    }
    return (a.state = 'selected'), (a.retrieveChildren = !0), [r];
  }
  function iS(e, t) {
    return {
      value: e,
      retrieveCount: t,
      children: [],
      state: 'idle',
      retrieveChildren: !1,
    };
  }
  var sS = k(Ct(), (e) => {
      e.addCase(zt, (t, r) => {
        let a = r.payload,
          {facetId: n} = a;
        if (n in t) return;
        let o = cP(a),
          i = o.numberOfValues;
        t[n] = {request: o, initialNumberOfValues: i};
      })
        .addCase(ce.fulfilled, (t, r) => {
          var a, n;
          return (n = (a = r.payload) == null ? void 0 : a.categoryFacetSet) !=
            null
            ? n
            : t;
        })
        .addCase(ue, (t, r) => {
          let a = r.payload.cf || {};
          Object.keys(t).forEach((n) => {
            let o = t[n].request,
              i = a[n] || [];
            (i.length || o.currentValues.length) &&
              ep(o, i, t[n].initialNumberOfValues);
          });
        })
        .addCase(Mn, (t, r) => {
          var i;
          let {facetId: a, criterion: n} = r.payload,
            o = (i = t[a]) == null ? void 0 : i.request;
          !o || (o.sortCriteria = n);
        })
        .addCase(Gr, (t, r) => {
          var p;
          let {facetId: a, selection: n, retrieveCount: o} = r.payload,
            i = (p = t[a]) == null ? void 0 : p.request;
          if (!i) return;
          let {path: s} = n,
            u = s.slice(0, s.length - 1),
            c = sP(i, u, o);
          if (c.length) {
            let f = c[0];
            (f.retrieveChildren = !0),
              (f.state = 'selected'),
              (f.children = []);
            return;
          }
          let l = cS(n.value, o);
          (l.state = 'selected'), c.push(l), (i.numberOfValues = 1);
        })
        .addCase(Wt, (t, r) => {
          let a = r.payload;
          qc(t, a);
        })
        .addCase(ke, (t) => {
          Object.keys(t).forEach((r) => qc(t, r));
        })
        .addCase(Lt, (t, r) =>
          Object.keys(t).forEach((a) => {
            t[a].request.preventAutoSelect = !r.payload.allow;
          })
        )
        .addCase(ka, (t, r) => {
          var i;
          let {facetId: a, numberOfValues: n} = r.payload,
            o = (i = t[a]) == null ? void 0 : i.request;
          if (!!o) {
            if (!o.currentValues.length) return Oc(o, n);
            uP(t, r.payload);
          }
        })
        .addCase($n, (t, r) => {
          let {facetId: a, value: n} = r.payload,
            o = t[a];
          if (!o) return;
          let i = [...n.path, n.rawValue];
          ep(o.request, i, o.initialNumberOfValues);
        })
        .addCase(Ke.fulfilled, (t, r) => {
          uS(t, r.payload.response.facets);
        })
        .addCase(T.fulfilled, (t, r) => {
          uS(t, r.payload.response.facets);
        })
        .addCase(ye, (t, r) => {
          qc(t, r.payload);
        });
    }),
    ki = {
      delimitingCharacter: ';',
      filterFacetCount: !0,
      injectionDepth: 1e3,
      numberOfValues: 5,
      sortCriteria: 'occurrences',
      basePath: [],
      filterByBasePath: !0,
    };
  function sP(e, t, r) {
    let a = e.currentValues;
    for (let n of t) {
      let o = a[0];
      (!o || n !== o.value) && ((o = cS(n, r)), (a.length = 0), a.push(o)),
        (o.retrieveChildren = !1),
        (o.state = 'idle'),
        (a = o.children);
    }
    return a;
  }
  function cP(e) {
    return {
      ...ki,
      currentValues: [],
      preventAutoSelect: !1,
      type: 'hierarchical',
      ...e,
    };
  }
  function cS(e, t) {
    return {
      value: e,
      state: 'idle',
      children: [],
      retrieveChildren: !0,
      retrieveCount: t,
    };
  }
  function uS(e, t) {
    t.forEach((r) => {
      var i;
      if (!lP(e, r)) return;
      let a = r.facetId,
        n = (i = e[a]) == null ? void 0 : i.request;
      if (!n) return;
      let o = dP(n, r);
      (n.currentValues = o ? [] : n.currentValues), (n.preventAutoSelect = !1);
    });
  }
  function uP(e, t) {
    var o;
    let {facetId: r, numberOfValues: a} = t,
      n = (o = e[r]) == null ? void 0 : o.request.currentValues[0];
    if (!!n) {
      for (
        ;
        n.children.length && (n == null ? void 0 : n.state) !== 'selected';

      )
        n = n.children[0];
      n.retrieveCount = a;
    }
  }
  function lP(e, t) {
    return t.facetId in e;
  }
  function dP(e, t) {
    let r = Xe(e.currentValues).parents,
      a = Xe(t.values).parents;
    return r.length !== a.length;
  }
  var lS = k(Br(), (e) => {
    e.addCase(T.fulfilled, (t, r) =>
      r.payload.response.facets.map((a) => a.facetId)
    ).addCase(ce.fulfilled, (t, r) => {
      var a, n;
      return (n = (a = r.payload) == null ? void 0 : a.facetOrder) != null
        ? n
        : t;
    });
  });
  function Tc(e, t, r) {
    let {facetId: a} = t;
    if (e[a]) return;
    let n = !1,
      o = {...nr, ...t},
      i = r();
    e[a] = {
      options: o,
      isLoading: n,
      response: i,
      initialNumberOfValues: o.numberOfValues,
      requestId: '',
    };
  }
  function Dc(e, t) {
    let {facetId: r, ...a} = t,
      n = e[r];
    !n || (n.options = {...n.options, ...a});
  }
  function Vc(e, t, r) {
    let a = e[t];
    !a || ((a.requestId = r), (a.isLoading = !0));
  }
  function Nc(e, t) {
    let r = e[t];
    !r || (r.isLoading = !1);
  }
  function Mc(e, t, r) {
    let {facetId: a, response: n} = t,
      o = e[a];
    !o || (o.requestId === r && ((o.isLoading = !1), (o.response = n)));
  }
  function Oi(e, t, r) {
    let {facetId: a} = t,
      n = e[a];
    !n ||
      ((n.requestId = ''),
      (n.isLoading = !1),
      (n.response = r()),
      (n.options.numberOfValues = n.initialNumberOfValues),
      (n.options.query = nr.query));
  }
  function Qc(e, t) {
    Object.keys(e).forEach((r) => Oi(e, {facetId: r}, t));
  }
  var nr = {captions: {}, numberOfValues: 10, query: ''};
  var Wn = (e) =>
      Q('analytics/facet/showMore', M.Search, (t, r) => {
        y(e, ee);
        let a = Sa(e, at(r));
        return t.makeFacetShowMore(a);
      }),
    Yn = (e) =>
      Q('analytics/facet/showLess', M.Search, (t, r) => {
        y(e, ee);
        let a = Sa(e, at(r));
        return t.makeFacetShowLess(a);
      }),
    dS = (e) =>
      Q('analytics/facet/search', M.Search, (t, r) => {
        y(e, ee);
        let a = at(r),
          n = Sa(e, a);
        return t.makeFacetSearch(n);
      }),
    or = (e) =>
      Q('analytics/facet/sortChange', M.Search, (t, r) => {
        y(e, {facetId: ee, criterion: new de({required: !0})});
        let {facetId: a, criterion: n} = e,
          o = at(r),
          s = {...Sa(a, o), criteria: n};
        return t.makeFacetUpdateSort(s);
      }),
    Ue = (e) =>
      Q('analytics/facet/reset', M.Search, (t, r) => {
        y(e, ee);
        let a = at(r),
          n = Sa(e, a);
        return t.makeFacetClearAll(n);
      }),
    Re = (e) =>
      Q('analytics/facet/select', M.Search, (t, r) => {
        y(e, {facetId: ee, facetValue: q});
        let a = at(r),
          n = is(e, a);
        return t.makeFacetSelect(n);
      }),
    Et = (e) =>
      Q('analytics/facet/deselect', M.Search, (t, r) => {
        y(e, {facetId: ee, facetValue: q});
        let a = at(r),
          n = is(e, a);
        return t.makeFacetDeselect(n);
      }),
    Lc = (e) =>
      Q('analytics/facet/breadcrumb', M.Search, (t, r) => {
        y(e, {facetId: ee, facetValue: q});
        let a = is(e, at(r));
        return t.makeBreadcrumbFacet(a);
      });
  var pS = async (e, t, r) => {
      let a = t.categoryFacetSearchSet[e].options,
        n = t.categoryFacetSet[e].request,
        {captions: o, query: i, numberOfValues: s} = a,
        {
          field: u,
          delimitingCharacter: c,
          basePath: l,
          filterFacetCount: p,
        } = n,
        f = pP(n),
        d = f.length ? [f] : [],
        m = `*${i}*`;
      return {
        url: t.configuration.search.apiBaseUrl,
        accessToken: t.configuration.accessToken,
        organizationId: t.configuration.organizationId,
        ...(t.configuration.search.authenticationProviders.length && {
          authentication:
            t.configuration.search.authenticationProviders.join(','),
        }),
        basePath: l,
        captions: o,
        numberOfValues: s,
        query: m,
        field: u,
        delimitingCharacter: c,
        ignorePaths: d,
        filterFacetCount: p,
        type: 'hierarchical',
        ...(r ? {} : {searchContext: (await ct(t)).request}),
      };
    },
    pP = (e) => {
      let t = [],
        r = e.currentValues[0];
      for (; r; ) t.push(r.value), (r = r.children[0]);
      return t;
    };
  var fS = async (e, t, r) => {
    let {
        captions: a,
        query: n,
        numberOfValues: o,
      } = t.facetSearchSet[e].options,
      {field: i, currentValues: s, filterFacetCount: u} = t.facetSet[e].request,
      c = s.filter((p) => p.state !== 'idle').map((p) => p.value),
      l = `*${n}*`;
    return {
      url: t.configuration.search.apiBaseUrl,
      accessToken: t.configuration.accessToken,
      organizationId: t.configuration.organizationId,
      ...(t.configuration.search.authenticationProviders && {
        authentication:
          t.configuration.search.authenticationProviders.join(','),
      }),
      captions: a,
      numberOfValues: o,
      query: l,
      field: i,
      ignoreValues: c,
      filterFacetCount: u,
      type: 'specific',
      ...(r ? {} : {searchContext: (await ct(t)).request}),
    };
  };
  var mS =
      (e) =>
      async (
        t,
        {dispatch: r, getState: a, extra: {apiClient: n, validatePayload: o}}
      ) => {
        let i = a(),
          s;
        o(t, q), fP(i, t) ? (s = await fS(t, i, e)) : (s = await pS(t, i, e));
        let u = await n.facetSearch(s);
        return e || r(dS(t)), {facetId: t, response: u};
      },
    wt = te('facetSearch/executeSearch', mS(!1)),
    tp = te('facetSearch/executeSearch', mS(!0)),
    Kn = S('facetSearch/clearResults', (e) => y(e, {facetId: ee})),
    fP = (e, t) =>
      e.facetSearchSet !== void 0 &&
      e.facetSet !== void 0 &&
      e.facetSet[t] !== void 0;
  var mP = {
      facetId: ee,
      value: new L({
        values: {
          displayValue: ie,
          rawValue: ie,
          count: new U({required: !0, min: 0}),
        },
      }),
    },
    jc = S('facetSearch/register', (e) => y(e, Ei)),
    Zr = S('facetSearch/update', (e) => y(e, Ei)),
    Ta = S('facetSearch/toggleSelectValue', (e) => y(e, mP));
  var gS = k(Fn(), (e) => {
    e.addCase(Hn, (t, r) => {
      let a = r.payload;
      Tc(t, a, rp);
    })
      .addCase(Zr, (t, r) => {
        Dc(t, r.payload);
      })
      .addCase(wt.pending, (t, r) => {
        let a = r.meta.arg;
        Vc(t, a, r.meta.requestId);
      })
      .addCase(wt.rejected, (t, r) => {
        let a = r.meta.arg;
        Nc(t, a);
      })
      .addCase(wt.fulfilled, (t, r) => {
        Mc(t, r.payload, r.meta.requestId);
      })
      .addCase(Kn, (t, {payload: {facetId: r}}) => {
        Oi(t, {facetId: r}, rp);
      })
      .addCase(T.fulfilled, (t) => {
        Qc(t, rp);
      });
  });
  function rp() {
    return {moreValuesAvailable: !1, values: []};
  }
  var hS = k(Ia(), (e) => {
    e.addCase(jc, (t, r) => {
      let a = r.payload;
      Tc(t, a, ap);
    })
      .addCase(Zr, (t, r) => {
        Dc(t, r.payload);
      })
      .addCase(wt.pending, (t, r) => {
        let a = r.meta.arg;
        Vc(t, a, r.meta.requestId);
      })
      .addCase(wt.rejected, (t, r) => {
        let a = r.meta.arg;
        Nc(t, a);
      })
      .addCase(wt.fulfilled, (t, r) => {
        Mc(t, r.payload, r.meta.requestId);
      })
      .addCase(Kn, (t, {payload: r}) => {
        Oi(t, r, ap);
      })
      .addCase(T.fulfilled, (t) => {
        Qc(t, ap);
      });
  });
  function ap() {
    return {moreValuesAvailable: !1, values: []};
  }
  var SS = S('productlisting/setUrl', (e) =>
      y(e, {url: new O({required: !0, url: !0})})
    ),
    yS = S('productlisting/setAdditionalFields', (e) =>
      y(e, {
        additionalFields: new K({
          required: !0,
          each: new O({required: !0, emptyAllowed: !1}),
        }),
      })
    ),
    dt = te(
      'productlisting/fetch',
      async (e, {getState: t, dispatch: r, rejectWithValue: a, extra: n}) => {
        let o = t(),
          {apiClient: i} = n,
          s = await i.getProducts(await gP(o));
        return ge(s) ? (r(xn(s.error)), a(s.error)) : {response: s.success};
      }
    ),
    gP = async (e) => {
      var a, n, o;
      let t = SP(e),
        r = await Fe(e.configuration.analytics);
      return {
        accessToken: e.configuration.accessToken,
        organizationId: e.configuration.organizationId,
        platformUrl: e.configuration.platformUrl,
        url: (a = e.productListing) == null ? void 0 : a.url,
        ...(e.configuration.analytics.enabled && r ? {clientId: r} : {}),
        ...((
          (n = e.productListing.additionalFields) == null ? void 0 : n.length
        )
          ? {additionalFields: e.productListing.additionalFields}
          : {}),
        ...(e.productListing.advancedParameters &&
        hP(e.productListing.advancedParameters)
          ? {advancedParameters: e.productListing.advancedParameters || {}}
          : {}),
        ...(t.length && {facets: {requests: t}}),
        ...(e.pagination && {
          pagination: {
            numberOfValues: e.pagination.numberOfResults,
            page:
              Math.ceil(
                e.pagination.firstResult / (e.pagination.numberOfResults || 1)
              ) + 1,
          },
        }),
        ...((((o = e.sort) == null ? void 0 : o.by) || wa.Relevance) !==
          wa.Relevance && {sort: e.sort}),
        ...(e.context && {userContext: e.context.contextValues}),
      };
    };
  function hP(e) {
    return e.debug;
  }
  function SP(e) {
    var t;
    return bn(yP(e), (t = e.facetOrder) != null ? t : []);
  }
  function yP(e) {
    var t, r, a, n;
    return [
      ...vr((t = e.facetSet) != null ? t : {}),
      ...vr((r = e.numericFacetSet) != null ? r : {}),
      ...vr((a = e.dateFacetSet) != null ? a : {}),
      ...vr((n = e.categoryFacetSet) != null ? n : {}),
    ];
  }
  var vS = k(bt(), (e) => {
    e.addCase(Xt, (t, r) => {
      let {facetId: a} = r.payload;
      a in t || (t[a] = Tm(vP(r.payload)));
    })
      .addCase(ce.fulfilled, (t, r) => {
        if (!!r.payload && Object.keys(r.payload.facetSet).length !== 0)
          return r.payload.facetSet;
      })
      .addCase(ue, (t, r) => {
        let a = r.payload.f || {};
        Object.keys(t).forEach((o) => {
          let {request: i} = t[o],
            s = a[o] || [],
            u = i.currentValues.filter((c) => !s.includes(c.value));
          (i.currentValues = [...s.map(xS), ...u.map(xP)]),
            (i.preventAutoSelect = s.length > 0),
            (i.numberOfValues = Math.max(s.length, i.numberOfValues));
        });
      })
      .addCase(Zt, (t, r) => {
        var u;
        let {facetId: a, selection: n} = r.payload,
          o = (u = t[a]) == null ? void 0 : u.request;
        if (!o) return;
        o.preventAutoSelect = !0;
        let i = o.currentValues.find((c) => c.value === n.value);
        if (!i) {
          CS(o, n);
          return;
        }
        let s = i.state === 'selected';
        (i.state = s ? 'idle' : 'selected'), (o.freezeCurrentValues = !0);
      })
      .addCase(Jr, (t, r) => {
        var i;
        let {facetId: a, freezeCurrentValues: n} = r.payload,
          o = (i = t[a]) == null ? void 0 : i.request;
        !o || (o.freezeCurrentValues = n);
      })
      .addCase(xe, (t, r) => {
        var a;
        wi((a = t[r.payload]) == null ? void 0 : a.request);
      })
      .addCase(ke, (t) => {
        Object.values(t)
          .filter((r) => r.hasBreadcrumbs)
          .forEach(({request: r}) => wi(r));
      })
      .addCase(sn, (t) => {
        Object.values(t)
          .filter((r) => !r.hasBreadcrumbs)
          .forEach(({request: r}) => wi(r));
      })
      .addCase(Lt, (t, r) =>
        Object.values(t).forEach((a) => {
          a.request.preventAutoSelect = !r.payload.allow;
        })
      )
      .addCase(Ln, (t, r) => {
        zn(t, r.payload);
      })
      .addCase(Oa, (t, r) => {
        var o;
        let {facetId: a, numberOfValues: n} = r.payload;
        Oc((o = t[a]) == null ? void 0 : o.request, n);
      })
      .addCase(qa, (t, r) => {
        var i;
        let {facetId: a, isFieldExpanded: n} = r.payload,
          o = (i = t[a]) == null ? void 0 : i.request;
        !o || (o.isFieldExpanded = n);
      })
      .addCase(T.fulfilled, (t, r) => {
        r.payload.response.facets.forEach((n) => {
          var o;
          return np((o = t[n.facetId]) == null ? void 0 : o.request, n);
        });
      })
      .addCase(dt.fulfilled, (t, r) => {
        var n, o;
        (
          ((o = (n = r.payload.response) == null ? void 0 : n.facets) == null
            ? void 0
            : o.results) || []
        ).forEach((i) => {
          var s;
          return np((s = t[i.facetId]) == null ? void 0 : s.request, i);
        });
      })
      .addCase(Ke.fulfilled, (t, r) => {
        r.payload.response.facets.forEach((n) => {
          var o;
          return np((o = t[n.facetId]) == null ? void 0 : o.request, n);
        });
      })
      .addCase(Ta, (t, r) => {
        var l;
        let {facetId: a, value: n} = r.payload,
          o = (l = t[a]) == null ? void 0 : l.request;
        if (!o) return;
        let {rawValue: i} = n,
          {currentValues: s} = o,
          u = s.find((p) => p.value === i);
        if (u) {
          u.state = 'selected';
          return;
        }
        let c = xS(i);
        CS(o, c), (o.freezeCurrentValues = !0), (o.preventAutoSelect = !0);
      })
      .addCase(ye, (t, r) => {
        if (!(r.payload in t)) return;
        let {request: a} = t[r.payload];
        wi(a);
      });
  });
  function CS(e, t) {
    let {currentValues: r} = e,
      a = r.findIndex((s) => s.state === 'idle'),
      n = a === -1 ? r.length : a,
      o = r.slice(0, n),
      i = r.slice(n + 1);
    (e.currentValues = [...o, t, ...i]),
      (e.numberOfValues = e.currentValues.length);
  }
  function np(e, t) {
    !e ||
      ((e.currentValues = t.values.map(CP)),
      (e.freezeCurrentValues = !1),
      (e.preventAutoSelect = !1));
  }
  var qi = {
    filterFacetCount: !0,
    injectionDepth: 1e3,
    numberOfValues: 8,
    sortCriteria: 'automatic',
  };
  function vP(e) {
    return {
      ...qi,
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: !1,
      isFieldExpanded: !1,
      preventAutoSelect: !1,
      ...e,
    };
  }
  function CP(e) {
    let {value: t, state: r} = e;
    return {value: t, state: r};
  }
  function xS(e) {
    return {value: e, state: 'selected'};
  }
  function xP(e) {
    return {...e, state: 'idle'};
  }
  var Uc = {
    filterFacetCount: !0,
    injectionDepth: 1e3,
    numberOfValues: 8,
    sortCriteria: 'ascending',
    rangeAlgorithm: 'even',
  };
  function Bc(e, t) {
    let {request: r} = t,
      {facetId: a} = r;
    if (a in e) return;
    let n = RS(r);
    (r.numberOfValues = n), (e[a] = t);
  }
  function _c(e, t, r) {
    var n;
    let a = (n = e[t]) == null ? void 0 : n.request;
    !a || ((a.currentValues = r), (a.numberOfValues = RS(a)));
  }
  function $c(e, t, r) {
    var i;
    let a = (i = e[t]) == null ? void 0 : i.request;
    if (!a) return;
    let n = op(a.currentValues, r);
    if (!n) return;
    let o = n.state === 'selected';
    (n.state = o ? 'idle' : 'selected'), (a.preventAutoSelect = !0);
  }
  function ea(e, t) {
    var a;
    let r = (a = e[t]) == null ? void 0 : a.request;
    !r || r.currentValues.forEach((n) => (n.state = 'idle'));
  }
  function Hc(e, t) {
    Object.entries(e).forEach(([r, {request: a}]) => {
      let n = t[r] || [];
      a.currentValues.forEach((s) => {
        let u = !!op(n, s);
        return (s.state = u ? 'selected' : 'idle'), s;
      });
      let o = n.filter((s) => !op(a.currentValues, s)),
        i = a.currentValues;
      i.push(...o), (a.numberOfValues = Math.max(a.numberOfValues, i.length));
    });
  }
  function Gn(e, t, r) {
    t.forEach((a) => {
      var s;
      let n = a.facetId,
        o = (s = e[n]) == null ? void 0 : s.request;
      if (!o) return;
      let i = r(a.values);
      (o.currentValues = i), (o.preventAutoSelect = !1);
    });
  }
  function op(e, t) {
    let {start: r, end: a} = t;
    return e.find((n) => n.start === r && n.end === a);
  }
  function RS(e) {
    let {generateAutomaticRanges: t, currentValues: r, numberOfValues: a} = e;
    return t ? Math.max(a, r.length) : r.length;
  }
  var bS = k(xt(), (e) => {
    e.addCase(er, (t, r) => {
      let {payload: a} = r,
        n = RP(a);
      Bc(t, Om(n));
    })
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.dateFacetSet) != null
          ? n
          : t;
      })
      .addCase(ue, (t, r) => {
        let a = r.payload.df || {};
        Hc(t, a);
      })
      .addCase(tr, (t, r) => {
        let {facetId: a, selection: n} = r.payload;
        $c(t, a, n);
      })
      .addCase(Rr, (t, r) => {
        let {facetId: a, values: n} = r.payload;
        _c(t, a, n);
      })
      .addCase(Ic, (t, r) => {
        ea(t, r.payload);
      })
      .addCase(ke, (t) => {
        Object.keys(t).forEach((r) => {
          ea(t, r);
        });
      })
      .addCase(Pc, (t, r) => {
        zn(t, r.payload);
      })
      .addCase(T.fulfilled, (t, r) => {
        let a = r.payload.response.facets;
        Gn(t, a, FS);
      })
      .addCase(dt.fulfilled, (t, r) => {
        var n, o;
        let a =
          ((o = (n = r.payload.response) == null ? void 0 : n.facets) == null
            ? void 0
            : o.results) || [];
        Gn(t, a, FS);
      })
      .addCase(ye, (t, r) => {
        ea(t, r.payload);
      });
  });
  function RP(e) {
    return {
      ...Uc,
      currentValues: [],
      preventAutoSelect: !1,
      type: 'dateRange',
      ...e,
    };
  }
  function FS(e) {
    return e.map((t) => {
      let {numberOfResults: r, ...a} = t;
      return a;
    });
  }
  var AS = k(Rt(), (e) => {
    e.addCase(rr, (t, r) => {
      let {payload: a} = r,
        n = bP(a);
      Bc(t, qm(n));
    })
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.numericFacetSet) !=
          null
          ? n
          : t;
      })
      .addCase(ue, (t, r) => {
        let a = r.payload.nf || {};
        Hc(t, a);
      })
      .addCase(ar, (t, r) => {
        let {facetId: a, selection: n} = r.payload;
        $c(t, a, n);
      })
      .addCase(br, (t, r) => {
        let {facetId: a, values: n} = r.payload;
        _c(t, a, n);
      })
      .addCase(kc, (t, r) => {
        ea(t, r.payload);
      })
      .addCase(ke, (t) => {
        Object.keys(t).forEach((r) => {
          ea(t, r);
        });
      })
      .addCase(wc, (t, r) => {
        zn(t, r.payload);
      })
      .addCase(T.fulfilled, (t, r) => {
        let a = r.payload.response.facets;
        Gn(t, a, PS);
      })
      .addCase(dt.fulfilled, (t, r) => {
        var n, o;
        let a =
          ((o = (n = r.payload.response) == null ? void 0 : n.facets) == null
            ? void 0
            : o.results) || [];
        Gn(t, a, PS);
      })
      .addCase(ye, (t, r) => {
        ea(t, r.payload);
      });
  });
  function bP(e) {
    return {
      ...Uc,
      currentValues: [],
      preventAutoSelect: !1,
      type: 'numericalRange',
      ...e,
    };
  }
  function PS(e) {
    return e.map((t) => {
      let {numberOfResults: r, ...a} = t;
      return a;
    });
  }
  var ip = {
      collectionField: new O({emptyAllowed: !1, required: !1}),
      parentField: new O({emptyAllowed: !1, required: !1}),
      childField: new O({emptyAllowed: !1, required: !1}),
      numberOfFoldedResults: new U({min: 0, required: !1}),
    },
    ta = S('folding/register', (e) => y(e, ip)),
    ra = te(
      'folding/loadCollection',
      async (e, {getState: t, rejectWithValue: r, extra: {apiClient: a}}) => {
        let n = t(),
          o = await gn(n),
          i = await a.search(
            {
              ...o,
              q: FP(n),
              enableQuerySyntax: !0,
              cq: `@${n.folding.fields.collection}="${e}"`,
              filterField: n.folding.fields.collection,
              childField: n.folding.fields.parent,
              parentField: n.folding.fields.child,
              filterFieldRange: 100,
            },
            {origin: 'foldingCollection'}
          );
        return ge(i)
          ? r(i.error)
          : {
              collectionId: e,
              results: i.success.results,
              rootResult: n.folding.collections[e].result,
            };
      }
    );
  function FP(e) {
    return e.query.q === ''
      ? ''
      : e.query.enableQuerySyntax
      ? `${e.query.q} OR @uri`
      : `( <@- ${e.query.q} -@> ) OR @uri`;
  }
  var sp = (e) =>
      Q(
        'analytics/folding/showMore',
        M.Click,
        (t, r) => (_e(e), t.makeShowMoreFoldedResults(Ve(e, r), Le(e)))
      ),
    IS = Q('analytics/folding/showLess', M.Custom, (e) =>
      e.makeShowLessFoldedResults()
    );
  var AP = new K({each: q, required: !0}),
    aa = S('fields/registerFieldsToInclude', (e) => y(e, AP)),
    Jn = S('fields/fetchall/enable'),
    Da = S('fields/fetchall/disable'),
    Xn = te(
      'fields/fetchDescription',
      async (e, {extra: t, getState: r, rejectWithValue: a}) => {
        let n = r(),
          {accessToken: o, organizationId: i} = n.configuration,
          {apiBaseUrl: s} = n.configuration.search,
          u = await t.apiClient.fieldDescriptions({
            accessToken: o,
            organizationId: i,
            url: s,
          });
        return ge(u) ? a(u.error) : u.success.fields;
      }
    );
  var ES = k(Ea(), (e) =>
    e
      .addCase(aa, (t, r) => {
        t.fieldsToInclude = [...new Set(t.fieldsToInclude.concat(r.payload))];
      })
      .addCase(Jn, (t) => {
        t.fetchAllFields = !0;
      })
      .addCase(Da, (t) => {
        t.fetchAllFields = !1;
      })
      .addCase(Xn.fulfilled, (t, {payload: r}) => {
        t.fieldsDescription = r;
      })
      .addCase(ta, (t, {payload: r}) => {
        var n, o, i;
        let a = An().fields;
        t.fieldsToInclude.push(
          (n = r.collectionField) != null ? n : a.collection,
          (o = r.parentField) != null ? o : a.parent,
          (i = r.childField) != null ? i : a.child
        );
      })
  );
  function PP(e, t) {
    return e.raw[t.collection];
  }
  function cp(e, t) {
    return e.raw[t.parent];
  }
  function Ti(e, t) {
    let r = e.raw[t.child];
    return ds(r) ? r[0] : r;
  }
  function IP(e, t) {
    return (e || t) !== void 0 && e === t;
  }
  function wS(e, t, r, a = []) {
    let n = Ti(e, r);
    return n
      ? a.indexOf(n) !== -1
        ? []
        : t
            .filter((o) => {
              let i = Ti(o, r) === Ti(e, r);
              return cp(o, r) === n && !i;
            })
            .map((o) => ({result: o, children: wS(o, t, r, [...a, n])}))
      : [];
  }
  function EP(e, t) {
    return e.find((r) => {
      let a = cp(r, t) === void 0,
        n = IP(cp(r, t), Ti(r, t));
      return a || n;
    });
  }
  function kS(e) {
    return e.parentResult ? kS(e.parentResult) : e;
  }
  function wP(e, t, r) {
    var o;
    let a = gs(e),
      n = (o = r != null ? r : EP(a, t)) != null ? o : kS(e);
    return {
      result: n,
      children: wS(n, a, t),
      moreResultsAvailable: !0,
      isLoadingMoreResults: !1,
    };
  }
  function zc(e, t, r) {
    let a = {};
    return (
      e.forEach((n) => {
        let o = PP(n, t);
        !o || (!Ti(n, t) && !n.parentResult) || (a[o] = wP(n, t, r));
      }),
      a
    );
  }
  function OS(e, t) {
    if (!e.collections[t])
      throw new Error(
        `Missing collection ${t} from ${Object.keys(
          e.collections
        )}: Folding most probably in an invalid state...`
      );
    return e.collections[t];
  }
  var qS = k(An(), (e) =>
    e
      .addCase(T.fulfilled, (t, {payload: r}) => {
        t.collections = t.enabled ? zc(r.response.results, t.fields) : {};
      })
      .addCase(Ye.fulfilled, (t, {payload: r}) => {
        t.collections = t.enabled ? zc(r.response.results, t.fields) : {};
      })
      .addCase(ut.fulfilled, (t, {payload: r}) => {
        t.collections = t.enabled
          ? {...t.collections, ...zc(r.response.results, t.fields)}
          : {};
      })
      .addCase(ta, (t, {payload: r}) => {
        var a, n, o, i;
        return t.enabled
          ? t
          : {
              enabled: !0,
              collections: {},
              fields: {
                collection:
                  (a = r.collectionField) != null ? a : t.fields.collection,
                parent: (n = r.parentField) != null ? n : t.fields.parent,
                child: (o = r.childField) != null ? o : t.fields.child,
              },
              filterFieldRange:
                (i = r.numberOfFoldedResults) != null ? i : t.filterFieldRange,
            };
      })
      .addCase(ra.pending, (t, {meta: r}) => {
        let a = r.arg;
        OS(t, a).isLoadingMoreResults = !0;
      })
      .addCase(ra.rejected, (t, {meta: r}) => {
        let a = r.arg;
        OS(t, a).isLoadingMoreResults = !1;
      })
      .addCase(
        ra.fulfilled,
        (t, {payload: {collectionId: r, results: a, rootResult: n}}) => {
          let o = zc(a, t.fields, n);
          if (!o || !o[r])
            throw new Error(
              `Unable to create collection ${r} from received results: ${JSON.stringify(
                a
              )}. Folding most probably in an invalid state... `
            );
          (t.collections[r] = o[r]),
            (t.collections[r].moreResultsAvailable = !1);
        }
      )
  );
  var VS = be(DS());
  function Va(e, t, r = (a, n) => a === n) {
    return e.length === t.length && e.findIndex((a, n) => !r(t[n], a)) === -1;
  }
  var Yc = (0, VS.createCustomEqual)(
    (e) => (t, r) =>
      Array.isArray(t) && Array.isArray(r)
        ? t.length !== r.length
          ? !1
          : t.every((a) => r.findIndex((n) => e(a, n)) !== -1)
        : e(t, r)
  );
  var NS = k(Ps(), (e) => {
      e.addCase(Ur, (t, r) => (kP(t, r.payload) ? void 0 : r.payload));
    }),
    kP = (e, t) =>
      OP(e.context, t.context) &&
      qP(e.dictionaryFieldContext, t.dictionaryFieldContext) &&
      QP(e.advancedSearchQueries, t.advancedSearchQueries) &&
      TP(e.tabSet, t.tabSet) &&
      DP(e.staticFilterSet, t.staticFilterSet) &&
      up(e.facetSet, t.facetSet) &&
      up(e.dateFacetSet, t.dateFacetSet) &&
      up(e.numericFacetSet, t.numericFacetSet) &&
      VP(e.categoryFacetSet, t.categoryFacetSet) &&
      NP(e.pagination, t.pagination) &&
      MP(e.query, t.query) &&
      LP(e, t) &&
      jP(e.pipeline, t.pipeline) &&
      UP(e.searchHub, t.searchHub) &&
      BP(e.facetOrder, t.facetOrder) &&
      _P(e.debug, t.debug),
    OP = (e, t) =>
      JSON.stringify(e.contextValues) === JSON.stringify(t.contextValues),
    qP = (e, t) =>
      JSON.stringify(e.contextValues) === JSON.stringify(t.contextValues),
    TP = (e, t) => {
      let r = MS(e),
        a = MS(t);
      return (r == null ? void 0 : r.id) === (a == null ? void 0 : a.id);
    },
    MS = (e) => Object.values(e).find((t) => t.isActive),
    DP = (e, t) => {
      for (let [r, a] of Object.entries(t)) {
        if (!e[r]) return !1;
        let n = QS(e[r]),
          o = QS(a);
        if (JSON.stringify(n) !== JSON.stringify(o)) return !1;
      }
      return !0;
    },
    QS = (e) => e.values.filter((t) => t.state !== 'idle'),
    up = (e, t) => {
      for (let [r, a] of Object.entries(t)) {
        if (!e[r]) return !1;
        let n = e[r].request.currentValues.filter(
            (i) => i.state === 'selected'
          ),
          o = a.request.currentValues.filter((i) => i.state === 'selected');
        if (JSON.stringify(n) !== JSON.stringify(o)) return !1;
      }
      return !0;
    },
    VP = (e, t) => {
      var r;
      for (let [a, n] of Object.entries(t)) {
        if (!e[a]) return !1;
        let o = Xe(
            (r = e[a]) == null ? void 0 : r.request.currentValues
          ).parents.map(({value: s}) => s),
          i = Xe(n == null ? void 0 : n.request.currentValues).parents.map(
            ({value: s}) => s
          );
        if (JSON.stringify(o) !== JSON.stringify(i)) return !1;
      }
      return !0;
    },
    NP = (e, t) =>
      e.firstResult === t.firstResult &&
      e.numberOfResults === t.numberOfResults,
    MP = (e, t) => JSON.stringify(e) === JSON.stringify(t),
    QP = (e, t) => JSON.stringify(e) === JSON.stringify(t),
    LP = (e, t) => e.sortCriteria === t.sortCriteria,
    jP = (e, t) => e === t,
    UP = (e, t) => e === t,
    BP = (e, t) => Va(e, t),
    _P = (e, t) => e === t;
  var LS = S('insightConfiguration/set', (e) => y(e, {insightId: q}));
  var $P = k($d(), (e) => {
    e.addCase(LS, (t, r) => {
      t.insightId = r.payload.insightId;
    });
  });
  var na = S('searchHub/set', (e) =>
    y(e, new O({required: !0, emptyAllowed: !0}))
  );
  var Kc = te(
      'insight/interface/fetch',
      async (
        e,
        {getState: t, dispatch: r, rejectWithValue: a, extra: {apiClient: n}}
      ) => {
        let o = t(),
          i = await n.getInterface(HP(o));
        return ge(i)
          ? a(i.error)
          : (r(na(i.success.searchHub)), {response: i.success});
      }
    ),
    HP = (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.platformUrl,
      insightId: e.insightConfiguration.insightId,
    });
  var zP = k(Hd(), (e) => {
    e.addCase(Kc.pending, (t) => {
      (t.loading = !0), (t.error = void 0);
    })
      .addCase(Kc.rejected, (t, r) => {
        (t.loading = !1), (t.error = r.payload);
      })
      .addCase(Kc.fulfilled, (t, r) => {
        (t.loading = !1), (t.error = void 0);
        let {searchHub: a, ...n} = r.payload.response;
        t.config = n;
      });
  });
  var jS = k(yn(), (e) => {
      e.addCase(cn, (t, r) => {
        let {id: a} = r.payload;
        t[a] || (t[a] = {q: '', cache: {}});
      }),
        e.addCase(jr, (t, r) => {
          let {q: a, id: n} = r.payload;
          !a || (t[n].q = a);
        }),
        e.addCase(un, (t, r) => {
          let {id: a} = r.payload;
          Object.entries(t[a].cache).forEach(([n, o]) => {
            xs(o) && delete t[a].cache[n];
          });
        }),
        e.addCase($r.pending, (t, r) => {
          for (let n in t)
            for (let o in t[n].cache) t[n].cache[o].isActive = !1;
          if (!Gc(t, r.meta)) {
            WP(t, r.meta);
            return;
          }
          let a = Gc(t, r.meta);
          (a.isLoading = !0), (a.isActive = !0), (a.error = null);
        }),
        e.addCase($r.fulfilled, (t, r) => {
          let {results: a, searchUid: n} = r.payload,
            {cacheTimeout: o} = r.meta.arg,
            i = Gc(t, r.meta);
          (i.isActive = !0),
            (i.searchUid = n),
            (i.isLoading = !1),
            (i.error = null),
            (i.results = a),
            (i.expiresAt = o ? o + Date.now() : 0);
        }),
        e.addCase($r.rejected, (t, r) => {
          let a = Gc(t, r.meta);
          (a.error = r.error || null), (a.isLoading = !1), (a.isActive = !1);
        });
    }),
    WP = (e, t) => {
      let {q: r, id: a} = t.arg;
      e[a].cache[r] = {
        isLoading: !0,
        error: null,
        results: [],
        expiresAt: 0,
        isActive: !0,
        searchUid: '',
      };
    },
    Gc = (e, t) => {
      let {q: r, id: a} = t.arg;
      return e[a].cache[r] || null;
    };
  var US = k(Ae(), (e) => {
    e.addCase(ln, (t, r) => {
      let a = lp(t),
        n = r.payload;
      (t.defaultNumberOfResults = t.numberOfResults = n),
        (t.firstResult = Di(a, n));
    })
      .addCase(dn, (t, r) => {
        (t.numberOfResults = r.payload), (t.firstResult = 0);
      })
      .addCase(pn, (t, r) => {
        let a = r.payload;
        t.firstResult = Di(a, t.numberOfResults);
      })
      .addCase(jt, (t, r) => {
        let a = r.payload;
        t.firstResult = Di(a, t.numberOfResults);
      })
      .addCase(mn, (t) => {
        let r = lp(t),
          a = Math.max(r - 1, Fa);
        t.firstResult = Di(a, t.numberOfResults);
      })
      .addCase(fn, (t) => {
        let r = lp(t),
          a = YP(t),
          n = Math.min(r + 1, a);
        t.firstResult = Di(n, t.numberOfResults);
      })
      .addCase(ce.fulfilled, (t, r) => {
        r.payload &&
          ((t.numberOfResults = r.payload.pagination.numberOfResults),
          (t.firstResult = r.payload.pagination.firstResult));
      })
      .addCase(ue, (t, r) => {
        var a, n;
        (t.firstResult =
          (a = r.payload.firstResult) != null ? a : t.firstResult),
          (t.numberOfResults =
            (n = r.payload.numberOfResults) != null
              ? n
              : t.defaultNumberOfResults);
      })
      .addCase(T.fulfilled, (t, r) => {
        let {response: a} = r.payload;
        t.totalCountFiltered = a.totalCountFiltered;
      })
      .addCase(dt.fulfilled, (t, r) => {
        let {response: a} = r.payload;
        t.totalCountFiltered = a.pagination.totalCount;
      })
      .addCase(xe, (t) => {
        kt(t);
      })
      .addCase(Zt, (t) => {
        kt(t);
      })
      .addCase(Wt, (t) => {
        kt(t);
      })
      .addCase(Gr, (t) => {
        kt(t);
      })
      .addCase($n, (t) => {
        kt(t);
      })
      .addCase(tr, (t) => {
        kt(t);
      })
      .addCase(ar, (t) => {
        kt(t);
      })
      .addCase(ke, (t) => {
        kt(t);
      })
      .addCase(Rr, (t) => {
        kt(t);
      })
      .addCase(br, (t) => {
        kt(t);
      })
      .addCase(Ta, (t) => {
        kt(t);
      });
  });
  function kt(e) {
    e.firstResult = Ae().firstResult;
  }
  function lp(e) {
    let {firstResult: t, numberOfResults: r} = e;
    return dp(t, r);
  }
  function YP(e) {
    let {totalCountFiltered: t, numberOfResults: r} = e;
    return pp(t, r);
  }
  function Di(e, t) {
    return (e - 1) * t;
  }
  function dp(e, t) {
    return Math.round(e / t) + 1;
  }
  function pp(e, t) {
    let r = Math.min(e, Fi);
    return Math.ceil(r / t);
  }
  var Zn = S('pipeline/set', (e) =>
    y(e, new O({required: !0, emptyAllowed: !0}))
  );
  var BS = k(ot(), (e) => {
    e.addCase(Zn, (t, r) => r.payload)
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.pipeline) != null
          ? n
          : t;
      })
      .addCase(lt, (t, r) => r.payload.pipeline || t);
  });
  var KP = k(Gs(), (e) => {
    e.addCase(SS, (t, r) => {
      t.url = r.payload.url;
    })
      .addCase(yS, (t, r) => {
        t.additionalFields = r.payload.additionalFields;
      })
      .addCase(dt.rejected, (t, r) => {
        (t.error = r.payload ? r.payload : null), (t.isLoading = !1);
      })
      .addCase(dt.fulfilled, (t, r) => {
        (t.error = null),
          (t.facets = r.payload.response.facets),
          (t.products = r.payload.response.products),
          (t.responseId = r.payload.response.responseId),
          (t.isLoading = !1);
      })
      .addCase(dt.pending, (t) => {
        t.isLoading = !0;
      });
  });
  var GP = k(tn(), (e) => {
    e.addCase(vg, (t, r) => {
      t.id = r.payload.id;
    })
      .addCase(Cg, (t, r) => {
        t.skus = r.payload.skus;
      })
      .addCase(xg, (t, r) => {
        t.filter.brand = r.payload.brand;
      })
      .addCase(Rg, (t, r) => {
        t.filter.category = r.payload.category;
      })
      .addCase(Fg, (t, r) => {
        t.maxNumberOfRecommendations = r.payload.number;
      })
      .addCase(bg, (t, r) => {
        t.additionalFields = r.payload.additionalFields;
      })
      .addCase(nn.rejected, (t, r) => {
        (t.error = r.payload ? r.payload : null), (t.isLoading = !1);
      })
      .addCase(nn.fulfilled, (t, r) => {
        (t.error = null),
          (t.searchUid = r.payload.searchUid),
          (t.recommendations = r.payload.recommendations),
          (t.isLoading = !1);
      })
      .addCase(nn.pending, (t) => {
        t.isLoading = !0;
      });
  });
  var Vi = {id: q},
    eo = S('querySuggest/register', (e) =>
      y(e, {...Vi, count: new U({min: 0})})
    ),
    _S = S('querySuggest/unregister', (e) => y(e, Vi)),
    ir = S('querySuggest/selectSuggestion', (e) =>
      y(e, {...Vi, expression: ie})
    ),
    oa = S('querySuggest/clear', (e) => y(e, Vi)),
    ia = te(
      'querySuggest/fetch',
      async (
        e,
        {
          getState: t,
          rejectWithValue: r,
          extra: {apiClient: a, validatePayload: n},
        }
      ) => {
        n(e, Vi);
        let o = e.id,
          i = await JP(o, t()),
          s = await a.querySuggest(i);
        return ge(s) ? r(s.error) : {id: o, q: i.q, ...s.success};
      }
    ),
    JP = async (e, t) => ({
      accessToken: t.configuration.accessToken,
      organizationId: t.configuration.organizationId,
      url: t.configuration.search.apiBaseUrl,
      count: t.querySuggest[e].count,
      q: t.querySet[e],
      locale: t.configuration.search.locale,
      timezone: t.configuration.search.timezone,
      actionsHistory: t.configuration.analytics.enabled ? Ft.getHistory() : [],
      ...(t.context && {context: t.context.contextValues}),
      ...(t.pipeline && {pipeline: t.pipeline}),
      ...(t.searchHub && {searchHub: t.searchHub}),
      ...(t.configuration.analytics.enabled && {
        visitorId: await Fe(t.configuration.analytics),
        ...(t.configuration.analytics.enabled &&
          (await Qr(t.configuration.analytics))),
      }),
      ...(t.configuration.search.authenticationProviders.length && {
        authentication:
          t.configuration.search.authenticationProviders.join(','),
      }),
    });
  var $S = {id: q, query: ie},
    to = S('querySet/register', (e) => y(e, $S)),
    Na = S('querySet/update', (e) => y(e, $S));
  var HS = k(Ca(), (e) => {
    e.addCase(to, (t, r) => {
      let {id: a, query: n} = r.payload;
      a in t || (t[a] = n);
    })
      .addCase(Na, (t, r) => {
        let {id: a, query: n} = r.payload;
        fp(t, a, n);
      })
      .addCase(ir, (t, r) => {
        let {id: a, expression: n} = r.payload;
        fp(t, a, n);
      })
      .addCase(T.fulfilled, (t, r) => {
        let {queryExecuted: a} = r.payload;
        zS(t, a);
      })
      .addCase(ue, (t, r) => {
        re(r.payload.q) || zS(t, r.payload.q);
      })
      .addCase(ce.fulfilled, (t, r) => {
        if (!!r.payload)
          for (let [a, n] of Object.entries(r.payload.querySet)) fp(t, a, n);
      });
  });
  function zS(e, t) {
    Object.keys(e).forEach((r) => (e[r] = t));
  }
  var fp = (e, t, r) => {
    t in e && (e[t] = r);
  };
  var WS = k(zd(), (e) =>
    e
      .addCase(eo, (t, r) => {
        let a = r.payload.id;
        a in t || (t[a] = XP(r.payload));
      })
      .addCase(_S, (t, r) => {
        delete t[r.payload.id];
      })
      .addCase(ia.pending, (t, r) => {
        let a = t[r.meta.arg.id];
        !a || ((a.currentRequestId = r.meta.requestId), (a.isLoading = !0));
      })
      .addCase(ia.fulfilled, (t, r) => {
        let a = t[r.meta.arg.id];
        if (!a || r.meta.requestId !== a.currentRequestId) return;
        let {q: n} = r.payload;
        n && a.partialQueries.push(n.replace(/;/, encodeURIComponent(';'))),
          (a.responseId = r.payload.responseId),
          (a.completions = r.payload.completions),
          (a.isLoading = !1),
          (a.error = null);
      })
      .addCase(ia.rejected, (t, r) => {
        let a = t[r.meta.arg.id];
        !a || ((a.error = r.payload || null), (a.isLoading = !1));
      })
      .addCase(oa, (t, r) => {
        let a = t[r.payload.id];
        !a ||
          ((a.responseId = ''), (a.completions = []), (a.partialQueries = []));
      })
  );
  function XP(e) {
    return {
      id: '',
      completions: [],
      responseId: '',
      count: 5,
      currentRequestId: '',
      error: null,
      partialQueries: [],
      isLoading: !1,
      ...e,
    };
  }
  var YS = k(ve(), (e) =>
    e
      .addCase(it, (t, r) => ({...t, ...r.payload}))
      .addCase(Ut, (t, r) => {
        t.q = r.payload;
      })
      .addCase(ir, (t, r) => {
        t.q = r.payload.expression;
      })
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.query) != null ? n : t;
      })
      .addCase(ue, (t, r) => {
        var a, n;
        (t.q = (a = r.payload.q) != null ? a : t.q),
          (t.enableQuerySyntax =
            (n = r.payload.enableQuerySyntax) != null
              ? n
              : t.enableQuerySyntax);
      })
  );
  var Jc = () =>
      new L({values: {questionAnswerId: q}, options: {required: !0}}),
    mp = () =>
      new L({values: {linkText: ie, linkURL: ie}, options: {required: !0}});
  function ro(e) {
    return y(e, Jc());
  }
  var ao = S('smartSnippet/expand'),
    no = S('smartSnippet/collapse'),
    oo = S('smartSnippet/like'),
    io = S('smartSnippet/dislike'),
    so = S('smartSnippet/feedbackModal/open'),
    sa = S('smartSnippet/feedbackModal/close'),
    co = S('smartSnippet/related/expand', (e) => ro(e)),
    uo = S('smartSnippet/related/collapse', (e) => ro(e));
  var KS = (e, t) =>
    e.findIndex((r) => r.questionAnswerId === t.questionAnswerId);
  function GS({
    question: e,
    answerSnippet: t,
    documentId: {contentIdKey: r, contentIdValue: a},
  }) {
    return an({
      question: e,
      answerSnippet: t,
      contentIdKey: r,
      contentIdValue: a,
    });
  }
  function ZP(e, t) {
    let r = GS(e);
    return t && r === t.questionAnswerId
      ? t
      : {
          contentIdKey: e.documentId.contentIdKey,
          contentIdValue: e.documentId.contentIdValue,
          expanded: !1,
          questionAnswerId: r,
        };
  }
  var JS = k(Pi(), (e) =>
    e
      .addCase(ao, (t) => {
        t.expanded = !0;
      })
      .addCase(no, (t) => {
        t.expanded = !1;
      })
      .addCase(oo, (t) => {
        (t.liked = !0), (t.disliked = !1), (t.feedbackModalOpen = !1);
      })
      .addCase(io, (t) => {
        (t.liked = !1), (t.disliked = !0);
      })
      .addCase(so, (t) => {
        t.feedbackModalOpen = !0;
      })
      .addCase(sa, (t) => {
        t.feedbackModalOpen = !1;
      })
      .addCase(T.fulfilled, (t, r) => {
        let a = r.payload.response.questionAnswer.relatedQuestions.map((o, i) =>
            ZP(o, t.relatedQuestions[i])
          ),
          n = GS(r.payload.response.questionAnswer);
        return t.questionAnswerId === n
          ? {...t, relatedQuestions: a}
          : {...Pi(), relatedQuestions: a, questionAnswerId: n};
      })
      .addCase(co, (t, r) => {
        let a = KS(t.relatedQuestions, r.payload);
        a !== -1 && (t.relatedQuestions[a].expanded = !0);
      })
      .addCase(uo, (t, r) => {
        let a = KS(t.relatedQuestions, r.payload);
        a !== -1 && (t.relatedQuestions[a].expanded = !1);
      })
  );
  var eI = {
      queries: new K({required: !0, each: new O({emptyAllowed: !1})}),
      maxLength: new U({required: !0, min: 1, default: 10}),
    },
    lo = S('recentQueries/registerRecentQueries', (e) => y(e, eI)),
    po = S('recentQueries/clearRecentQueries');
  var XS = k(ac(), (e) => {
    e.addCase(lo, (t, r) => {
      (t.queries = r.payload.queries.slice(0, r.payload.maxLength)),
        (t.maxLength = r.payload.maxLength);
    })
      .addCase(po, (t) => {
        t.queries = [];
      })
      .addCase(T.fulfilled, (t, r) => {
        let a = r.payload.queryExecuted.trim(),
          n = r.payload.response.results;
        if (!a.length || !n.length) return;
        t.queries = t.queries.filter((i) => i !== a);
        let o = t.queries.slice(0, t.maxLength - 1);
        t.queries = [a, ...o];
      });
  });
  var tI = {
      results: new K({required: !0, each: new L({values: yi})}),
      maxLength: new U({required: !0, min: 1, default: 10}),
    },
    fo = S('recentResults/registerRecentResults', (e) => y(e, tI)),
    pt = S('recentResults/pushRecentResult', (e) => (_e(e), {payload: e})),
    mo = S('recentResults/clearRecentResults');
  var ZS = k(nc(), (e) => {
    e.addCase(fo, (t, r) => {
      (t.results = r.payload.results.slice(0, r.payload.maxLength)),
        (t.maxLength = r.payload.maxLength);
    })
      .addCase(mo, (t) => {
        t.results = [];
      })
      .addCase(pt, (t, r) => {
        let a = r.payload;
        t.results = t.results.filter((o) => o.uniqueId !== a.uniqueId);
        let n = t.results.slice(0, t.maxLength - 1);
        t.results = [a, ...n];
      });
  });
  var rI = k(Lr(), (e) => {
    e.addCase(Ig, (t, r) => {
      t.id = r.payload.id;
    })
      .addCase(on.rejected, (t, r) => {
        (t.error = r.payload ? r.payload : null), (t.isLoading = !1);
      })
      .addCase(on.fulfilled, (t, r) => {
        (t.error = null),
          (t.recommendations = r.payload.recommendations),
          (t.duration = r.payload.duration),
          (t.isLoading = !1),
          (t.searchUid = r.payload.searchUid),
          (t.splitTestRun = r.payload.splitTestRun),
          (t.pipeline = r.payload.pipeline);
      })
      .addCase(on.pending, (t) => {
        t.isLoading = !0;
      });
  });
  async function Xc(e, t) {
    var s;
    let {
        search: r,
        accessToken: a,
        organizationId: n,
        analytics: o,
      } = e.configuration,
      i = ((s = e.query) == null ? void 0 : s.q) || '';
    return {
      url: r.apiBaseUrl,
      accessToken: a,
      organizationId: n,
      enableNavigation: !1,
      ...(o.enabled && {visitorId: await Fe(e.configuration.analytics)}),
      q: i,
      ...t,
      requestedOutputSize: t.requestedOutputSize || 0,
      ...(r.authenticationProviders.length && {
        authentication: r.authenticationProviders.join(','),
      }),
    };
  }
  var Ma = te(
      'resultPreview/fetchResultContent',
      async (e, {extra: t, getState: r, rejectWithValue: a}) => {
        let n = r(),
          o = await Xc(n, e),
          i = await t.apiClient.html(o);
        return ge(i) ? a(i.error) : {content: i.success, uniqueId: e.uniqueId};
      }
    ),
    go = S('resultPreview/next'),
    ho = S('resultPreview/previous'),
    So = S('resultPreview/prepare', (e) =>
      y(e, {results: new K({required: !0})})
    ),
    ey = 2048,
    yo = te(
      'resultPreview/updateContentURL',
      async (e, {getState: t, extra: r}) => {
        let a = t(),
          n = rg(
            await e.buildResultPreviewRequest(a, {
              uniqueId: e.uniqueId,
              requestedOutputSize: e.requestedOutputSize,
            }),
            e.path
          );
        return (
          (n == null ? void 0 : n.length) > ey &&
            r.logger.error(
              `The content URL was truncated as it exceeds the maximum allowed length of ${ey} characters.`
            ),
          {contentURL: n}
        );
      }
    );
  var gp = (e) => e.filter((t) => t.hasHtmlVersion).map((t) => t.uniqueId),
    ty = k(Hr(), (e) => {
      e.addCase(Ma.pending, (t) => {
        t.isLoading = !0;
      })
        .addCase(Ma.fulfilled, (t, r) => {
          let {content: a, uniqueId: n} = r.payload;
          (t.position = t.resultsWithPreview.indexOf(n)),
            (t.content = a),
            (t.uniqueId = n),
            (t.isLoading = !1);
        })
        .addCase(T.fulfilled, (t, r) => {
          let {content: a, isLoading: n, uniqueId: o, contentURL: i} = Hr();
          (t.content = a),
            (t.isLoading = n),
            (t.uniqueId = o),
            (t.contentURL = i),
            (t.resultsWithPreview = gp(r.payload.response.results));
        })
        .addCase(ut.fulfilled, (t, r) => {
          t.resultsWithPreview = t.resultsWithPreview.concat(
            gp(r.payload.response.results)
          );
        })
        .addCase(So, (t, r) => {
          t.resultsWithPreview = gp(r.payload.results);
        })
        .addCase(go, (t) => {
          if (t.isLoading) return;
          let r = t.position + 1;
          r > t.resultsWithPreview.length - 1 && (r = 0), (t.position = r);
        })
        .addCase(ho, (t) => {
          if (t.isLoading) return;
          let r = t.position - 1;
          r < 0 && (r = t.resultsWithPreview.length - 1), (t.position = r);
        })
        .addCase(yo.fulfilled, (t, r) => {
          t.contentURL = r.payload.contentURL;
        });
    });
  var ry = k(Ee(), (e) => {
    e.addCase(na, (t, r) => r.payload)
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.searchHub) != null
          ? n
          : t;
      })
      .addCase(lt, (t, r) => r.payload.searchHub || t);
  });
  function hp(e, t) {
    var a;
    let r = (a = t.payload) != null ? a : null;
    r &&
      ((e.response = Ze().response),
      (e.results = []),
      (e.questionAnswer = Xa())),
      (e.error = r),
      (e.isLoading = !1);
  }
  function Sp(e, t) {
    (e.error = null),
      (e.response = t.payload.response),
      (e.queryExecuted = t.payload.queryExecuted),
      (e.duration = t.payload.duration),
      (e.isLoading = !1);
  }
  function aI(e, t) {
    Sp(e, t),
      (e.results = t.payload.response.results),
      (e.searchResponseId = t.payload.response.searchUid),
      (e.questionAnswer = t.payload.response.questionAnswer);
  }
  function yp(e, t) {
    (e.isLoading = !0), (e.requestId = t.meta.requestId);
  }
  var ay = k(Ze(), (e) => {
    e.addCase(T.rejected, (t, r) => hp(t, r)),
      e.addCase(ut.rejected, (t, r) => hp(t, r)),
      e.addCase(Ye.rejected, (t, r) => hp(t, r)),
      e.addCase(T.fulfilled, (t, r) => {
        aI(t, r);
      }),
      e.addCase(ut.fulfilled, (t, r) => {
        Sp(t, r), (t.results = [...t.results, ...r.payload.response.results]);
      }),
      e.addCase(Ye.fulfilled, (t, r) => {
        Sp(t, r), (t.results = r.payload.response.results);
      }),
      e.addCase(Ke.fulfilled, (t, r) => {
        (t.response.facets = r.payload.response.facets),
          (t.response.searchUid = r.payload.response.searchUid);
      }),
      e.addCase(T.pending, yp),
      e.addCase(ut.pending, yp),
      e.addCase(Ye.pending, yp);
  });
  var ny = {by: new Vt({enum: Pt, required: !0})},
    vo = S('sortCriteria/register', (e) => oy(e)),
    Co = S('sortCriteria/update', (e) => oy(e)),
    oy = (e) => (Ka(e) ? (e.forEach((t) => y(t, ny)), {payload: e}) : y(e, ny));
  var iy = k(et(), (e) => {
    e.addCase(vo, (t, r) => _t(r.payload))
      .addCase(Co, (t, r) => _t(r.payload))
      .addCase(ce.fulfilled, (t, r) => {
        var a, n;
        return (n = (a = r.payload) == null ? void 0 : a.sortCriteria) != null
          ? n
          : t;
      })
      .addCase(ue, (t, r) => {
        var a;
        return (a = r.payload.sortCriteria) != null ? a : t;
      });
  });
  var nI = {by: new Vt({enum: wa, required: !0})},
    sy = S('sort/register', (e) => uy(e)),
    cy = S('sort/update', (e) => uy(e)),
    uy = (e) => y(e, nI);
  var oI = k(Js(), (e) => {
    e.addCase(sy, (t, r) => r.payload).addCase(cy, (t, r) => r.payload);
  });
  function ly(e) {
    return e.type === 'redirect';
  }
  var vp = class {
    constructor(t) {
      this.response = t;
    }
    get basicExpression() {
      return this.response.parsedInput.basicExpression;
    }
    get largeExpression() {
      return this.response.parsedInput.largeExpression;
    }
    get redirectionUrl() {
      let t = this.response.preprocessingOutput.triggers.filter(ly);
      return t.length ? t[0].content : null;
    }
  };
  var xo = S('standaloneSearchBox/register', (e) =>
      y(e, {id: q, redirectionUrl: q})
    ),
    Ro = S('standaloneSearchBox/reset', (e) => y(e, {id: q})),
    bo = S('standaloneSearchBox/updateAnalyticsToSearchFromLink', (e) =>
      y(e, {id: q})
    ),
    Fo = S('standaloneSearchBox/updateAnalyticsToOmniboxFromLink'),
    ca = te(
      'standaloneSearchBox/fetchRedirect',
      async (
        e,
        {
          dispatch: t,
          getState: r,
          rejectWithValue: a,
          extra: {apiClient: n, validatePayload: o},
        }
      ) => {
        o(e, {id: new O({emptyAllowed: !1})});
        let i = await sI(r()),
          s = await n.plan(i);
        if (ge(s)) return a(s.error);
        let {redirectionUrl: u} = new vp(s.success);
        return u && t(iI(u)), u || '';
      }
    ),
    iI = (e) =>
      Q('analytics/standaloneSearchBox/redirect', M.Custom, (t) =>
        t.makeTriggerRedirect({redirectedTo: e})
      ),
    sI = async (e) => ({
      accessToken: e.configuration.accessToken,
      organizationId: e.configuration.organizationId,
      url: e.configuration.search.apiBaseUrl,
      locale: e.configuration.search.locale,
      timezone: e.configuration.search.timezone,
      q: e.query.q,
      ...(e.context && {context: e.context.contextValues}),
      ...(e.pipeline && {pipeline: e.pipeline}),
      ...(e.searchHub && {searchHub: e.searchHub}),
      ...(e.configuration.analytics.enabled && {
        visitorId: await Fe(e.configuration.analytics),
      }),
      ...(e.configuration.analytics.enabled &&
        (await Qr(e.configuration.analytics))),
      ...(e.configuration.search.authenticationProviders.length && {
        authentication:
          e.configuration.search.authenticationProviders.join(','),
      }),
    });
  var dy = k(oc(), (e) =>
    e
      .addCase(xo, (t, r) => {
        let {id: a, redirectionUrl: n} = r.payload;
        a in t || (t[a] = py(n));
      })
      .addCase(Ro, (t, r) => {
        let {id: a} = r.payload,
          n = t[a];
        if (n) {
          t[a] = py(n.defaultRedirectionUrl);
          return;
        }
      })
      .addCase(ca.pending, (t, r) => {
        let a = t[r.meta.arg.id];
        !a || (a.isLoading = !0);
      })
      .addCase(ca.fulfilled, (t, r) => {
        let a = r.payload,
          n = t[r.meta.arg.id];
        !n ||
          ((n.redirectTo = a || n.defaultRedirectionUrl), (n.isLoading = !1));
      })
      .addCase(ca.rejected, (t, r) => {
        let a = t[r.meta.arg.id];
        !a || (a.isLoading = !1);
      })
      .addCase(bo, (t, r) => {
        let a = t[r.payload.id];
        !a || (a.analytics.cause = 'searchFromLink');
      })
      .addCase(Fo, (t, r) => {
        let a = t[r.payload.id];
        !a ||
          ((a.analytics.cause = 'omniboxFromLink'),
          (a.analytics.metadata = r.payload.metadata));
      })
  );
  function py(e) {
    return {
      defaultRedirectionUrl: e,
      redirectTo: '',
      isLoading: !1,
      analytics: {cause: '', metadata: null},
    };
  }
  var Ao = q,
    Cp = new L({
      options: {required: !0},
      values: {
        caption: ie,
        expression: ie,
        state: new O({constrainTo: ['idle', 'selected']}),
      },
    }),
    Zc = new K({required: !0, each: Cp});
  var Po = S('staticFilter/register', (e) => y(e, {id: Ao, values: Zc})),
    Fr = S('staticFilter/toggleSelect', (e) => y(e, {id: Ao, value: Cp})),
    Qa = S('staticFilter/deselectAllFilterValues', (e) => y(e, Ao)),
    eu = (e) =>
      Q('analytics/staticFilter/select', M.Search, (t) =>
        t.makeStaticFilterSelect(e)
      ),
    Io = (e) =>
      Q('analytics/staticFilter/deselect', M.Search, (t) =>
        t.makeStaticFilterDeselect(e)
      ),
    tu = (e) =>
      Q('analytics/staticFilter/clearAll', M.Search, (t) =>
        t.makeStaticFilterClearAll(e)
      );
  var fy = k(xa(), (e) =>
    e
      .addCase(Po, (t, r) => {
        let a = r.payload,
          {id: n} = a;
        n in t || (t[n] = a);
      })
      .addCase(Fr, (t, r) => {
        let {id: a, value: n} = r.payload,
          o = t[a];
        if (!o) return;
        let i = o.values.find((u) => u.caption === n.caption);
        if (!i) return;
        let s = i.state === 'selected';
        i.state = s ? 'idle' : 'selected';
      })
      .addCase(Qa, (t, r) => {
        let a = r.payload,
          n = t[a];
        !n || n.values.forEach((o) => (o.state = 'idle'));
      })
      .addCase(ke, (t) => {
        Object.values(t).forEach((r) => {
          r.values.forEach((a) => (a.state = 'idle'));
        });
      })
      .addCase(ue, (t, r) => {
        let a = r.payload.sf || {};
        Object.entries(t).forEach(([n, o]) => {
          let i = a[n] || [];
          o.values.forEach((s) => {
            s.state = i.includes(s.caption) ? 'selected' : 'idle';
          });
        });
      })
  );
  var my = k(Ra(), (e) => {
    e.addCase(wn, (t, r) => {
      let a = r.payload,
        {id: n} = a;
      n in t || (t[n] = {...a, isActive: !1});
    })
      .addCase(xr, (t, r) => {
        let a = r.payload;
        gy(t, a);
      })
      .addCase(ue, (t, r) => {
        let a = r.payload.tab || '';
        gy(t, a);
      });
  });
  function gy(e, t) {
    t in e &&
      Object.keys(e).forEach((a) => {
        e[a].isActive = a === t;
      });
  }
  var hy = k(ic(), (e) =>
    e
      .addCase(T.pending, (t) => {
        (t.query = ''),
          (t.queryModification = {
            originalQuery: '',
            newQuery: '',
            queryToIgnore: t.queryModification.queryToIgnore,
          });
      })
      .addCase(T.fulfilled, (t, r) => {
        var s;
        let a = [],
          n = [],
          o = [],
          i = [];
        r.payload.response.triggers.forEach((u) => {
          switch (u.type) {
            case 'redirect':
              a.push(u.content);
              break;
            case 'query':
              n.push(u.content);
              break;
            case 'execute':
              o.push({functionName: u.content.name, params: u.content.params});
              break;
            case 'notify':
              i.push(u.content);
              break;
          }
        }),
          (t.redirectTo = (s = a[0]) != null ? s : ''),
          (t.query = t.queryModification.newQuery),
          (t.executions = o),
          (t.notifications = i);
      })
      .addCase(qs, (t, r) => {
        t.queryModification = {...r.payload, queryToIgnore: ''};
      })
      .addCase(Cn, (t, r) => {
        t.queryModification.queryToIgnore = r.payload;
      })
  );
  var W = Hh,
    sr = US,
    cr = vS,
    Eo = hS,
    G = ay,
    ru = qS,
    ur = bS,
    au = lS,
    ft = AS,
    lr = sS,
    Oe = oS,
    wo = gS,
    mt = YS,
    Sy = qh,
    nu = fy,
    ko = HS,
    ou = jS,
    iu = my,
    Oo = WS,
    su = iy,
    cu = Wh,
    uu = Gh,
    lu = Jh,
    ua = ES,
    qo = BS,
    To = ry,
    Do = Yh,
    du = ty,
    yy = Kh,
    la = hy,
    dr = JS,
    pu = dy,
    fu = ZS,
    mu = XS;
  var gu = dh({
    actionTypes: {redo: Id.type, undo: Pd.type, snapshot: Ur.type},
    reducer: NS,
  });
  var vy = Xh;
  function hu(e, t, r) {
    var a, n, o;
    t === void 0 && (t = 50), r === void 0 && (r = {});
    var i = (a = r.isImmediate) != null && a,
      s = (n = r.callback) != null && n,
      u = r.maxWait,
      c = Date.now(),
      l = [];
    function p() {
      if (u !== void 0) {
        var d = Date.now() - c;
        if (d + t >= u) return u - d;
      }
      return t;
    }
    var f = function () {
      var d = [].slice.call(arguments),
        m = this;
      return new Promise(function (h, v) {
        var C = i && o === void 0;
        if (
          (o !== void 0 && clearTimeout(o),
          (o = setTimeout(function () {
            if (((o = void 0), (c = Date.now()), !i)) {
              var b = e.apply(m, d);
              s && s(b),
                l.forEach(function (P) {
                  return (0, P.resolve)(b);
                }),
                (l = []);
            }
          }, p())),
          C)
        ) {
          var x = e.apply(m, d);
          return s && s(x), h(x);
        }
        l.push({resolve: h, reject: v});
      });
    };
    return (
      (f.cancel = function (d) {
        o !== void 0 && clearTimeout(o),
          l.forEach(function (m) {
            return (0, m.reject)(d);
          }),
          (l = []);
      }),
      f
    );
  }
  function Cy(e, t) {
    let r = 0,
      a = hu(() => (r = 0), 500);
    return (n) => (o) => async (i) => {
      if (!(typeof i == 'function')) return o(i);
      let u = await o(i);
      if (!cI(u)) return u;
      if (typeof t != 'function')
        return (
          e.warn(
            'Unable to renew the expired token because a renew function was not provided. Please specify the #renewAccessToken option when initializing the engine.'
          ),
          u
        );
      if (r >= 5)
        return (
          e.warn(
            'Attempted to renew the token but was not successful. Please check the #renewAccessToken function.'
          ),
          u
        );
      r++, a();
      let c = await uI(t);
      n.dispatch(Ht({accessToken: c})), n.dispatch(i);
    };
  }
  function cI(e) {
    var t;
    return ((t = e.error) == null ? void 0 : t.name) === new mi().name;
  }
  async function uI(e) {
    try {
      return await e();
    } catch (t) {
      return '';
    }
  }
  function xy({
    reducer: e,
    preloadedState: t,
    middlewares: r = [],
    thunkExtraArguments: a,
    name: n,
  }) {
    return Ml({
      reducer: e,
      preloadedState: t,
      devTools: {
        stateSanitizer: (o) => (o.history ? {...o, history: '<<OMIT>>'} : o),
        name: n,
        shouldHotReload: !1,
      },
      middleware: (o) => [
        ...r,
        ...o({thunk: {extraArgument: a}}),
        Us(a.logger),
      ],
    });
  }
  var lI = {configuration: W, version: yy};
  function dI(e, t) {
    var n;
    let {analyticsClientMiddleware: r, ...a} =
      (n = e.configuration.analytics) != null ? n : {};
    return ms()
      ? (t.info('Analytics disabled since doNotTrack is active.'),
        {...a, enabled: !1})
      : e.configuration.analytics
      ? a
      : null;
  }
  function Ry(e, t) {
    let r = pI(e, t),
      {accessToken: a, organizationId: n, platformUrl: o} = e.configuration;
    r.dispatch(Ht({accessToken: a, organizationId: n, platformUrl: o}));
    let i = dI(e, r.logger);
    return i && r.dispatch(Wr(i)), r;
  }
  function pI(e, t) {
    let {reducers: r} = e,
      a = Oh({...lI, ...r});
    e.crossReducer && a.addCrossReducer(e.crossReducer);
    let n = t.logger,
      o = fI(e, t, a);
    return {
      addReducers(i) {
        a.containsAll(i) || (a.add(i), o.replaceReducer(a.combinedReducer));
      },
      dispatch: o.dispatch,
      subscribe: o.subscribe,
      enableAnalytics() {
        o.dispatch(En());
      },
      disableAnalytics() {
        o.dispatch(In());
      },
      get state() {
        return o.getState();
      },
      logger: n,
      store: o,
    };
  }
  function fI(e, t, r) {
    let {preloadedState: a, configuration: n} = e,
      o = n.name || 'coveo-headless',
      i = mI(e, t.logger);
    return xy({
      preloadedState: a,
      reducer: r.combinedReducer,
      middlewares: i,
      thunkExtraArguments: t,
      name: o,
    });
  }
  function mI(e, t) {
    let {renewAccessToken: r} = e.configuration,
      a = Cy(t, r);
    return [Ls, a, js(t), Qs].concat(e.middlewares || []);
  }
  var by = be(ii());
  function Fy(e) {
    return (0,
    by.default)({name: '@coveo/headless', level: (e == null ? void 0 : e.level) || 'warn', formatters: {log: e == null ? void 0 : e.logFormatter}, browser: {transmit: {send: (e == null ? void 0 : e.browserPostLogHook) || (() => {})}}});
  }
  function Ay(e, t) {
    let r = gI(e),
      a = ze,
      n = hI(e);
    return {
      analyticsClientMiddleware: r,
      validatePayload: a,
      preprocessRequest: n,
      logger: t,
    };
  }
  function gI(e) {
    let {analytics: t} = e,
      r = (a, n) => n;
    return (t == null ? void 0 : t.analyticsClientMiddleware) || r;
  }
  function hI(e) {
    return e.preprocessRequest || Pa;
  }
  var Py = be(bd());
  var xp = (e, t, r, a, n, o) => {
      let i = e[t];
      re(i) ||
        re(n) ||
        (n !== i &&
          n !== a &&
          (o.warn(
            `Mismatch on access token (JWT Token) ${t} and engine configuration.`
          ),
          o.warn(
            `To remove this warning, make sure that access token value [${i}] matches engine configuration value [${r}]`
          )));
    },
    Rp = (e, t) => !(re(e) || t === e),
    Ni = (e) => {
      try {
        let t = typeof atob != 'undefined' ? atob : Py.atob,
          a = e.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
          n = t(a);
        if (!n) return !1;
        let o = decodeURIComponent(
          n
            .split('')
            .map((i) => '%' + ('00' + i.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(o);
      } catch (t) {
        return !1;
      }
    },
    Iy = (e, t) => (
      Rp(e.searchHub, t.searchHub) && (t.searchHub = e.searchHub), t
    ),
    Ey = (e, t, r, a) => (
      xp(e, 'searchHub', t.searchHub, Ee(), r, a), Iy(e, t)
    ),
    wy = (e, t) => (Rp(e.pipeline, t.pipeline) && (t.pipeline = e.pipeline), t),
    ky = (e, t, r, a) => (xp(e, 'pipeline', t.pipeline, ot(), r, a), wy(e, t)),
    Oy = (e, t) => (
      Rp(e.userDisplayName, t.configuration.analytics.userDisplayName) &&
        (t.configuration.analytics.userDisplayName = e.userDisplayName),
      t
    ),
    SI = (e, t, r, a) => (
      xp(
        e,
        'userDisplayName',
        t.configuration.analytics.userDisplayName,
        Ne().analytics.userDisplayName,
        r,
        a
      ),
      Oy(e, t)
    ),
    qy = (e) =>
      k({}, (t) => {
        t.addCase(na, (r, a) => {
          let n = Ni(r.configuration.accessToken);
          return n ? Ey(n, r, a.payload, e) : r;
        })
          .addCase(Zn, (r, a) => {
            let n = Ni(r.configuration.accessToken);
            return n ? ky(n, r, a.payload, e) : r;
          })
          .addCase(Ht, (r, a) => {
            if (r.configuration.accessToken !== a.payload.accessToken) return r;
            let {accessToken: n} = a.payload;
            if (!n) return r;
            let o = Ni(n);
            return o ? [wy, Iy, Oy].reduce((i, s) => s(o, i), r) : r;
          })
          .addCase(lt, (r, a) => {
            var s;
            let n = Ni(r.configuration.accessToken);
            if (!n) return r;
            let o = Ey(n, r, a.payload.searchHub, e);
            return ky(n, o, (s = a.payload) == null ? void 0 : s.pipeline, e);
          })
          .addCase(Wr, (r, a) => {
            let n = Ni(r.configuration.accessToken);
            return n ? SI(n, r, a.payload.userDisplayName, e) : r;
          });
      });
  var Ty = {
    organizationId: q,
    accessToken: q,
    platformUrl: new O({required: !1, emptyAllowed: !1}),
    name: new O({required: !1, emptyAllowed: !1}),
    analytics: new L({
      options: {required: !1},
      values: {
        enabled: new J({required: !1}),
        originContext: new O({required: !1}),
        originLevel2: new O({required: !1}),
        originLevel3: new O({required: !1}),
      },
    }),
  };
  function Dy() {
    return {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    };
  }
  var Vy = new Z({
    ...Ty,
    search: new L({
      options: {required: !1},
      values: {
        pipeline: new O({required: !1, emptyAllowed: !0}),
        searchHub: oe,
        locale: oe,
        timezone: oe,
        authenticationProviders: new K({required: !1, each: q}),
      },
    }),
  });
  function bp() {
    return {...Dy(), search: {searchHub: 'default'}};
  }
  var yI = {debug: Do, pipeline: qo, searchHub: To, search: G};
  function Ny(e) {
    let t = Fy(e.loggerOptions);
    vI(e.configuration, t);
    let r = CI(e.configuration, t),
      a = {...Ay(e.configuration, t), apiClient: r},
      n = {...e, reducers: yI, crossReducer: qy(t)},
      o = Ry(n, a),
      {search: i} = e.configuration;
    return (
      i && o.dispatch(lt(i)),
      {
        ...o,
        get state() {
          return o.state;
        },
        executeFirstSearch(s = uc()) {
          if (mc(o.state)) return;
          let c = T(s);
          o.dispatch(c);
        },
        executeFirstSearchAfterStandaloneSearchBoxRedirect(s) {
          let {cause: u, metadata: c} = s,
            l = c && u === 'omniboxFromLink' ? dc(c) : lc();
          this.executeFirstSearch(l);
        },
      }
    );
  }
  function vI(e, t) {
    try {
      Vy.validate(e);
    } catch (r) {
      throw (t.error(r, 'Search engine configuration error'), r);
    }
  }
  function CI(e, t) {
    let {search: r} = e;
    return new Si({
      logger: t,
      preprocessRequest: e.preprocessRequest || Pa,
      postprocessSearchResponseMiddleware:
        (r == null ? void 0 : r.preprocessSearchResponseMiddleware) || Xs,
      postprocessFacetSearchResponseMiddleware:
        (r == null ? void 0 : r.preprocessFacetSearchResponseMiddleware) || Zs,
      postprocessQuerySuggestResponseMiddleware:
        (r == null ? void 0 : r.preprocessQuerySuggestResponseMiddleware) || ec,
    });
  }
  function B(e) {
    let t,
      r = new Map(),
      a = () => r.size === 0,
      n = (o) => {
        try {
          let i = JSON.stringify(o),
            s = t !== i;
          return (t = i), s;
        } catch (i) {
          return (
            console.warn(
              'Could not detect if state has changed, check the controller "get state method"',
              i
            ),
            !0
          );
        }
      };
    return {
      subscribe(o) {
        o();
        let i = Symbol(),
          s;
        return (
          a() &&
            ((t = JSON.stringify(this.state)),
            (s = e.subscribe(() => {
              n(this.state) && r.forEach((u) => u());
            }))),
          r.set(i, o),
          () => {
            r.delete(i), a() && s && s();
          }
        );
      },
      get state() {
        return {};
      },
    };
  }
  var My = (e) => {
      let t = /Document weights:\n((?:.)*?)\n+/g,
        r = /Terms weights:\n((?:.|\n)*)\n+/g,
        a = /Total weight: ([0-9]+)/g;
      if (!e) return null;
      let n = t.exec(e),
        o = r.exec(e),
        i = a.exec(e),
        s = RI(e),
        u = Qy(n ? n[1] : null),
        c = xI(o),
        l = i ? Number(i[1]) : null;
      return {
        documentWeights: u,
        termsWeight: c,
        totalWeight: l,
        qreWeights: s,
      };
    },
    Qy = (e) => {
      let t = /(\w+(?:\s\w+)*): ([-0-9]+)/g,
        r = /^(\w+(?:\s\w+)*): ([-0-9]+)$/;
      if (!e) return null;
      let a = e.match(t);
      if (!a) return null;
      let n = {};
      for (let o of a) {
        let i = o.match(r);
        if (i) {
          let s = i[1],
            u = i[2];
          n[s] = Number(u);
        }
      }
      return n;
    },
    Ly = (e, t) => {
      let r = [],
        a;
      for (; (a = t.exec(e)) !== null; ) r.push(a);
      return r;
    },
    xI = (e) => {
      let t = /((?:[^:]+: [0-9]+, [0-9]+; )+)\n((?:\w+: [0-9]+; )+)/g,
        r = /([^:]+): ([0-9]+), ([0-9]+); /g;
      if (!e || !e[1]) return null;
      let a = Ly(e[1], t);
      if (!a) return null;
      let n = {};
      for (let o of a) {
        let i = Ly(o[1], r),
          s = {};
        for (let c of i)
          s[c[1]] = {Correlation: Number(c[2]), 'TF-IDF': Number(c[3])};
        let u = Qy(o[2]);
        n[Object.keys(s).join(', ')] = {terms: s, Weights: u};
      }
      return n;
    },
    RI = (e) => {
      let t = /(Expression:\s".*")\sScore:\s(?!0)([-0-9]+)\n+/g,
        r = t.exec(e),
        a = [];
      for (; r; )
        a.push({expression: r[1], score: parseInt(r[2], 10)}), (r = t.exec(e));
      return a;
    };
  function jy(e) {
    return e.search.response.results.map((r) => {
      let a = My(r.rankingInfo);
      return {result: r, ranking: a};
    });
  }
  var bI = new Z({enabled: new J({default: !1})});
  function Uy(e, t = {}) {
    if (!FI(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state;
    we(e, bI, t.initialState, 'buildRelevanceInspector').enabled && a(Kr());
    let i = (s) => {
      e.logger.warn(
        `Flag [ ${s} ] is now activated. This should *not* be used in any production environment as it negatively impact performance.`
      );
    };
    return {
      ...r,
      get state() {
        let s = n(),
          u = s.debug;
        if (!s.debug) return {isEnabled: u};
        let {
            executionReport: c,
            basicExpression: l,
            advancedExpression: p,
            constantExpression: f,
            userIdentities: d,
            rankingExpressions: m,
          } = s.search.response,
          {fieldsDescription: h, fetchAllFields: v} = s.fields;
        return {
          isEnabled: u,
          rankingInformation: jy(s),
          executionReport: c,
          expressions: {
            basicExpression: l,
            advancedExpression: p,
            constantExpression: f,
          },
          userIdentities: d,
          rankingExpressions: m,
          fieldsDescription: h,
          fetchAllFields: v,
        };
      },
      enable() {
        a(Kr()), i('debug');
      },
      disable() {
        a(Tn()), a(Da());
      },
      enableFetchAllFields() {
        a(Jn()), i('fetchAllFields');
      },
      disableFetchAllFields() {
        a(Da());
      },
      fetchFieldsDescription() {
        !this.state.isEnabled && a(Kr()),
          a(Xn()),
          i('fieldsDescription'),
          e.logger
            .warn(`For production environment, please specify the necessary fields either when instantiating a ResultList controller, or by dispatching a registerFieldsToInclude action.
      
      https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#resultlistoptions
      https://docs.coveo.com/en/headless/latest/reference/search/actions/field/#registerfieldstoinclude`);
      },
    };
  }
  function FI(e) {
    return (
      e.addReducers({debug: Do, search: G, configuration: W, fields: ua}), !0
    );
  }
  function By(e) {
    if (!AI(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state;
    return {
      ...t,
      get state() {
        return {values: a().context.contextValues};
      },
      set(n) {
        r(kn(n));
      },
      add(n, o) {
        r(On({contextKey: n, contextValue: o}));
      },
      remove(n) {
        r(qn(n));
      },
    };
  }
  function AI(e) {
    return e.addReducers({context: cu}), !0;
  }
  function _y(e) {
    return By(e);
  }
  function $y(e) {
    if (!PI(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state;
    return {
      ...t,
      get state() {
        return {values: a().dictionaryFieldContext.contextValues};
      },
      set(n) {
        r(Dn(n));
      },
      add(n, o) {
        r(Vn({field: n, key: o}));
      },
      remove(n) {
        r(Nn(n));
      },
    };
  }
  function PI(e) {
    return e.addReducers({dictionaryFieldContext: uu}), !0;
  }
  function Hy(e) {
    if (!II(e)) throw D;
    let t = B(e),
      {dispatch: r} = e;
    r(hn());
    let a = () => e.state;
    return {
      ...t,
      get state() {
        let n = a();
        return {
          originalQuery: n.didYouMean.originalQuery,
          wasCorrectedTo: n.didYouMean.wasCorrectedTo,
          wasAutomaticallyCorrected: n.didYouMean.wasAutomaticallyCorrected,
          queryCorrection: n.didYouMean.queryCorrection,
          hasQueryCorrection:
            n.didYouMean.queryCorrection.correctedQuery !== '' ||
            n.didYouMean.wasCorrectedTo !== '',
        };
      },
      applyCorrection() {
        r(Ut(this.state.queryCorrection.correctedQuery));
      },
    };
  }
  function II(e) {
    return e.addReducers({configuration: W, didYouMean: lu}), !0;
  }
  function zy(e) {
    let t = Hy(e),
      {dispatch: r} = e;
    return {
      ...t,
      get state() {
        return t.state;
      },
      applyCorrection() {
        t.applyCorrection(), r(T(vs()));
      },
    };
  }
  var pr = (e, t) => {
    var r, a;
    return (a = (r = e.facetOptions.facets[t]) == null ? void 0 : r.enabled) !=
      null
      ? a
      : !0;
  };
  function Wy(e, t) {
    let {field: r, state: a} = e;
    if (!EI(e)) return r;
    let n = `${r}_`,
      o = wI(n, a);
    return OI(r, t), `${n}${o}`;
  }
  function EI(e) {
    let {field: t, state: r} = e;
    return Yy(r).some((n) => n && t in n);
  }
  function wI(e, t) {
    let a = Yy(t)
      .map((n) => Object.keys(n || {}))
      .reduce((n, o) => n.concat(o), []);
    return kI(a, e) + 1;
  }
  function Yy(e) {
    let {
      facetSet: t,
      numericFacetSet: r,
      dateFacetSet: a,
      categoryFacetSet: n,
    } = e;
    return [t, r, a, n];
  }
  function kI(e, t) {
    let r = 0,
      n = e
        .map((o) => {
          let i = o.split(t)[1],
            s = parseInt(i, 10);
          return Number.isNaN(s) ? r : s;
        })
        .sort()
        .pop();
    return n != null ? n : r;
  }
  function OI(e, t) {
    let r = `A facet with field "${e}" already exists.
To avoid unexpected behaviour, configure the #id option on the facet controller.`;
    t.warn(r);
  }
  function Be(e, t) {
    let {state: r, logger: a} = e,
      {field: n, facetId: o} = t;
    return o || Wy({field: n, state: r}, a);
  }
  var Ky = ['alphanumeric', 'occurrences'];
  var Gy = new Z({
    field: Kt,
    basePath: Zh,
    delimitingCharacter: eS,
    facetId: Yt,
    facetSearch: Qn,
    filterByBasePath: tS,
    filterFacetCount: Gt,
    injectionDepth: Jt,
    numberOfValues: It,
    sortCriteria: new O({constrainTo: Ky}),
  });
  function Jy(e, t) {
    if (!qI(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = Be(e, t.options),
      o = {
        ...ki,
        ...fs('facetSearch', t.options),
        field: t.options.field,
        facetId: n,
      },
      i = {facetSearch: {...nr, ...t.options.facetSearch}, ...o};
    pe(e, Gy, i, 'buildCategoryFacet');
    let s = () => id(e.state, n),
      u = () => od(e.state, n),
      c = () => Nt(e.state),
      l = () => pr(e.state, n);
    return (
      a(zt(o)),
      {
        ...r,
        toggleSelect(p) {
          let f = i.numberOfValues;
          a(Gr({facetId: n, selection: p, retrieveCount: f})),
            a(se({freezeFacetOrder: !0}));
        },
        deselectAll() {
          a(Wt(n)), a(se({freezeFacetOrder: !0}));
        },
        sortBy(p) {
          a(Mn({facetId: n, criterion: p})), a(se({freezeFacetOrder: !0}));
        },
        isSortedBy(p) {
          return s().sortCriteria === p;
        },
        showMoreValues() {
          let {numberOfValues: p} = i,
            {values: f} = this.state,
            d = f.length + p;
          a(ka({facetId: n, numberOfValues: d})), a(se({freezeFacetOrder: !0}));
        },
        showLessValues() {
          let {numberOfValues: p} = i;
          a(ka({facetId: n, numberOfValues: p})), a(se({freezeFacetOrder: !0}));
        },
        enable() {
          a(je(n));
        },
        disable() {
          a(ye(n));
        },
        get state() {
          let p = s(),
            f = u(),
            d = c(),
            m = l(),
            {parents: h, values: v} = Xe(f == null ? void 0 : f.values),
            C = h.length !== 0,
            x =
              h.length > 0
                ? h[h.length - 1].moreValuesAvailable
                : (f == null ? void 0 : f.moreValuesAvailable) || !1,
            b = v.length > i.numberOfValues;
          return {
            facetId: n,
            parents: h,
            values: v,
            isLoading: d,
            hasActiveValues: C,
            canShowMoreValues: x,
            canShowLessValues: b,
            sortCriteria: p.sortCriteria,
            enabled: m,
          };
        },
      }
    );
  }
  function qI(e) {
    return (
      e.addReducers({
        categoryFacetSet: lr,
        categoryFacetSearchSet: wo,
        facetOptions: Oe,
        configuration: W,
        search: G,
      }),
      !0
    );
  }
  function Vo(e, t) {
    let r = e.dispatch,
      {options: a, getFacetSearch: n} = t,
      {facetId: o} = a;
    return {
      updateText(i) {
        r(
          Zr({facetId: o, query: i, numberOfValues: n().initialNumberOfValues})
        );
      },
      showMoreResults() {
        let {initialNumberOfValues: i, options: s} = n();
        r(Zr({facetId: o, numberOfValues: s.numberOfValues + i})),
          r(t.isForFieldSuggestions ? tp(o) : wt(o));
      },
      search() {
        r(t.isForFieldSuggestions ? tp(o) : wt(o));
      },
      clear() {
        r(Kn({facetId: o}));
      },
      updateCaptions(i) {
        r(Zr({facetId: o, captions: i}));
      },
      get state() {
        let {response: i, isLoading: s, options: u} = n(),
          {query: c} = u,
          l = i.values;
        return {...i, values: l, isLoading: s, query: c};
      },
    };
  }
  function Xy(e, t) {
    let {dispatch: r} = e,
      a = {...nr, ...t.options},
      {facetId: n} = a,
      o = () => e.state.categoryFacetSearchSet[n];
    r(Hn(a));
    let i = Vo(e, {
      options: a,
      getFacetSearch: o,
      isForFieldSuggestions: t.isForFieldSuggestions,
    });
    return {
      ...i,
      select(s) {
        r($n({facetId: n, value: s}));
      },
      get state() {
        return i.state;
      },
    };
  }
  function Su(e, t) {
    let {dispatch: r} = e,
      a = {...nr, ...t.options},
      {facetId: n} = a,
      o = () => e.state.categoryFacetSearchSet[n],
      i = Xy(e, {
        options: {...a},
        isForFieldSuggestions: t.isForFieldSuggestions,
      });
    r(Hn(a));
    let s = Vo(e, {
      options: a,
      getFacetSearch: o,
      isForFieldSuggestions: t.isForFieldSuggestions,
    });
    return {
      ...s,
      ...i,
      select: (u) => {
        i.select(u),
          r(se({freezeFacetOrder: !0})),
          r(T(Re({facetId: n, facetValue: u.rawValue})));
      },
      get state() {
        return {...s.state, ...i.state};
      },
    };
  }
  function Zy(e, t) {
    if (!TI(e)) throw D;
    let r = Jy(e, t),
      {dispatch: a} = e,
      n = () => r.state.facetId,
      o = Su(e, {
        options: {facetId: n(), ...t.options.facetSearch},
        isForFieldSuggestions: !1,
      }),
      {state: i, ...s} = o;
    return {
      ...r,
      facetSearch: s,
      toggleSelect(u) {
        r.toggleSelect(u);
        let c = DI(n(), u);
        a(T(c));
      },
      deselectAll() {
        r.deselectAll(), a(T(Ue(n())));
      },
      sortBy(u) {
        r.sortBy(u), a(T(or({facetId: n(), criterion: u})));
      },
      showMoreValues() {
        r.showMoreValues(), a(Ke(Wn(n())));
      },
      showLessValues() {
        r.showLessValues(), a(Ke(Yn(n())));
      },
      get state() {
        return {...r.state, facetSearch: o.state};
      },
    };
  }
  function TI(e) {
    return (
      e.addReducers({
        categoryFacetSet: lr,
        categoryFacetSearchSet: wo,
        configuration: W,
        search: G,
      }),
      !0
    );
  }
  function DI(e, t) {
    let r = {facetId: e, facetValue: t.value};
    return t.state === 'selected' ? Et(r) : Re(r);
  }
  var Fp = (e) => e.state === 'selected',
    ev = (e, t) => {
      let r = {facetId: e, facetValue: t.value};
      return Fp(t) ? Et(r) : Re(r);
    };
  function yu(e, t) {
    let {dispatch: r} = e,
      {options: a, select: n, isForFieldSuggestions: o} = t,
      {facetId: i} = a,
      s = () => e.state.facetSearchSet[i];
    r(jc(a));
    let u = Vo(e, {options: a, getFacetSearch: s, isForFieldSuggestions: o});
    return {
      ...u,
      select(c) {
        r(Ta({facetId: i, value: c})), n(c);
      },
      singleSelect(c) {
        r(xe(i)), r(Ta({facetId: i, value: c})), n(c);
      },
      get state() {
        let {values: c} = u.state;
        return {
          ...u.state,
          values: c.map(({count: l, displayValue: p, rawValue: f}) => ({
            count: l,
            displayValue: p,
            rawValue: f,
          })),
        };
      },
    };
  }
  var VI = {facetId: ee, selection: new L({values: Fc})},
    tv = te('facet/executeToggleSelect', ({facetId: e, selection: t}, r) => {
      let {
        dispatch: a,
        extra: {validatePayload: n},
      } = r;
      n({facetId: e, selection: t}, VI),
        a(Zt({facetId: e, selection: t})),
        a(se({freezeFacetOrder: !0}));
    });
  var vu = ['score', 'alphanumeric', 'occurrences', 'automatic'];
  var rv = new Z({
    facetId: Yt,
    field: Kt,
    filterFacetCount: Gt,
    injectionDepth: Jt,
    numberOfValues: It,
    sortCriteria: new O({constrainTo: vu}),
    facetSearch: Qn,
  });
  function av(e, t, r = rv) {
    if (!NI(e)) throw D;
    let {dispatch: a} = e,
      n = B(e),
      o = Be(e, t.options),
      i = {
        ...qi,
        ...fs('facetSearch', t.options),
        field: t.options.field,
        facetId: o,
      },
      s = {facetSearch: {...nr, ...t.options.facetSearch}, ...i};
    pe(e, r, s, 'buildFacet');
    let u = () => ns(e.state, o),
      c = () => di(e.state, o),
      l = () => Nt(e.state),
      p = () => pr(e.state, o),
      f = () => {
        let {currentValues: m} = u();
        return m.filter((h) => h.state !== 'idle').length;
      },
      d = () => {
        let {currentValues: m} = u(),
          h = s.numberOfValues,
          v = !!m.find((C) => C.state === 'idle');
        return h < m.length && v;
      };
    return (
      a(Xt(i)),
      {
        ...n,
        toggleSelect: (m) => a(tv({facetId: s.facetId, selection: m})),
        toggleSingleSelect: function (m) {
          m.state === 'idle' && a(xe(o)), this.toggleSelect(m);
        },
        isValueSelected: Fp,
        deselectAll() {
          a(xe(o)), a(se({freezeFacetOrder: !0}));
        },
        sortBy(m) {
          a(Ln({facetId: o, criterion: m})), a(se({freezeFacetOrder: !0}));
        },
        isSortedBy(m) {
          return this.state.sortCriterion === m;
        },
        showMoreValues() {
          let m = u().numberOfValues,
            h = s.numberOfValues,
            v = h - (m % h),
            C = m + v;
          a(Oa({facetId: o, numberOfValues: C})),
            a(qa({facetId: o, isFieldExpanded: !0})),
            a(se({freezeFacetOrder: !0}));
        },
        showLessValues() {
          let m = s.numberOfValues,
            h = Math.max(m, f());
          a(Oa({facetId: o, numberOfValues: h})),
            a(qa({facetId: o, isFieldExpanded: !1})),
            a(se({freezeFacetOrder: !0}));
        },
        enable() {
          a(je(o));
        },
        disable() {
          a(ye(o));
        },
        get state() {
          let m = u(),
            h = c(),
            v = l(),
            C = p(),
            x = m.sortCriteria,
            b = h ? h.values : [],
            P = b.some((X) => X.state !== 'idle'),
            _ = h ? h.moreValuesAvailable : !1;
          return {
            facetId: o,
            values: b,
            sortCriterion: x,
            isLoading: v,
            hasActiveValues: P,
            canShowMoreValues: _,
            canShowLessValues: d(),
            enabled: C,
          };
        },
      }
    );
  }
  function NI(e) {
    return (
      e.addReducers({
        facetSet: cr,
        facetOptions: Oe,
        configuration: W,
        facetSearchSet: Eo,
      }),
      !0
    );
  }
  var nv = new Z({
    facetId: Yt,
    field: Kt,
    filterFacetCount: Gt,
    injectionDepth: Jt,
    numberOfValues: It,
    sortCriteria: new O({constrainTo: vu}),
    facetSearch: Qn,
    allowedValues: bc,
    hasBreadcrumbs: rS,
  });
  function ov(e, t) {
    if (!MI(e)) throw D;
    let {dispatch: r} = e,
      a = av(
        e,
        {
          ...t,
          options: {
            ...t.options,
            ...(t.options.allowedValues && {
              allowedValues: {type: 'simple', values: t.options.allowedValues},
            }),
          },
        },
        nv
      ),
      n = () => a.state.facetId,
      i = (() => {
        let {facetSearch: c} = t.options;
        return yu(e, {
          options: {facetId: n(), ...c},
          select: (l) => {
            r(se({freezeFacetOrder: !0})),
              r(T(Re({facetId: n(), facetValue: l.rawValue})));
          },
          isForFieldSuggestions: !1,
        });
      })(),
      {state: s, ...u} = i;
    return {
      ...a,
      facetSearch: u,
      toggleSelect(c) {
        a.toggleSelect(c), r(T(ev(n(), c)));
      },
      deselectAll() {
        a.deselectAll(), r(T(Ue(n())));
      },
      sortBy(c) {
        a.sortBy(c), r(T(or({facetId: n(), criterion: c})));
      },
      isSortedBy(c) {
        return this.state.sortCriterion === c;
      },
      showMoreValues() {
        a.showMoreValues(), r(Ke(Wn(n())));
      },
      showLessValues() {
        a.showLessValues(), r(Ke(Yn(n())));
      },
      get state() {
        return {...a.state, facetSearch: i.state};
      },
    };
  }
  function MI(e) {
    return (
      e.addReducers({
        facetSet: cr,
        configuration: W,
        facetSearchSet: Eo,
        search: G,
      }),
      !0
    );
  }
  var Ap = (e) => e.state === 'selected',
    Cu = (e, t) => {
      let r = `${t.start}..${t.end}`,
        a = {facetId: e, facetValue: r};
      return Ap(t) ? Et(a) : Re(a);
    };
  var xu = S('rangeFacet/executeToggleSelect', (e) => y(e, _n(e.selection)));
  var QI = {facetId: ee, selection: new L({values: Bn})},
    iv = te(
      'dateFacet/executeToggleSelect',
      (e, {dispatch: t, extra: {validatePayload: r}}) => {
        r(e, QI), t(tr(e)), t(xu(e)), t(se({freezeFacetOrder: !0}));
      }
    );
  function Ru(e, t) {
    let {facetId: r, getRequest: a} = t,
      n = B(e),
      o = e.dispatch,
      i = () => pr(e.state, r);
    return {
      ...n,
      isValueSelected: Ap,
      deselectAll() {
        o(xe(r)), o(se({freezeFacetOrder: !0}));
      },
      sortBy(s) {
        o(jn({facetId: r, criterion: s})), o(se({freezeFacetOrder: !0}));
      },
      isSortedBy(s) {
        return this.state.sortCriterion === s;
      },
      enable() {
        o(je(r));
      },
      disable() {
        o(ye(r));
      },
      get state() {
        let s = a(),
          u = vt(e.state, r),
          c = s.sortCriteria,
          l = u ? u.values : [],
          p = Nt(e.state),
          f = i(),
          d = l.some((m) => m.state !== 'idle');
        return {
          facetId: r,
          values: l,
          sortCriterion: c,
          hasActiveValues: d,
          isLoading: p,
          enabled: f,
        };
      },
    };
  }
  function bu(e, t) {
    if (!e.generateAutomaticRanges && e.currentValues === void 0) {
      let r = `currentValues should be specified for ${t} when generateAutomaticRanges is false.`;
      throw new Error(r);
    }
  }
  var Fu = ['idle', 'selected'];
  var Au = ['ascending', 'descending'],
    Pu = ['even', 'equiprobable'];
  var LI = {
      start: new O(),
      end: new O(),
      endInclusive: new J(),
      state: new O({constrainTo: Fu}),
    },
    jI = new Z({
      facetId: Yt,
      field: Kt,
      generateAutomaticRanges: Rc,
      filterFacetCount: Gt,
      injectionDepth: Jt,
      numberOfValues: It,
      currentValues: new K({each: new L({values: LI})}),
      sortCriteria: new O({constrainTo: Au}),
      rangeAlgorithm: new O({constrainTo: Pu}),
    });
  function Iu(e, t) {
    pe(e, jI, t, 'buildDateFacet'), Ac(t);
  }
  function sv(e, t) {
    if (!UI(e)) throw D;
    bu(t.options, 'buildDateFacet');
    let r = e.dispatch,
      a = Be(e, t.options),
      n = {currentValues: [], ...t.options, facetId: a};
    Iu(e, n), r(er(n));
    let o = Ru(e, {
      facetId: a,
      getRequest: () => e.state.dateFacetSet[a].request,
    });
    return {
      ...o,
      toggleSelect: (i) => r(iv({facetId: a, selection: i})),
      toggleSingleSelect: function (i) {
        i.state === 'idle' && r(xe(a)), this.toggleSelect(i);
      },
      get state() {
        return o.state;
      },
    };
  }
  function UI(e) {
    return (
      e.addReducers({
        configuration: W,
        search: G,
        dateFacetSet: ur,
        facetOptions: Oe,
      }),
      !0
    );
  }
  function cv(e, t) {
    let r = sv(e, t),
      a = e.dispatch,
      n = () => r.state.facetId;
    return {
      ...r,
      deselectAll() {
        r.deselectAll(), a(T(Ue(n())));
      },
      sortBy(o) {
        r.sortBy(o), a(T(or({facetId: n(), criterion: o})));
      },
      toggleSelect: (o) => {
        r.toggleSelect(o), a(T(Cu(n(), o)));
      },
      get state() {
        return r.state;
      },
    };
  }
  var BI = {facetId: ee, selection: new L({values: Un})},
    _I = 'numericFacet/executeToggleSelect',
    uv = te(_I, (e, {dispatch: t, extra: {validatePayload: r}}) => {
      r(e, BI), t(ar(e)), t(xu(e)), t(se({freezeFacetOrder: !0}));
    });
  var $I = {
      start: new U(),
      end: new U(),
      endInclusive: new J(),
      state: new O({constrainTo: Fu}),
    },
    HI = new Z({
      facetId: Yt,
      field: Kt,
      generateAutomaticRanges: Rc,
      filterFacetCount: Gt,
      injectionDepth: Jt,
      numberOfValues: It,
      currentValues: new K({each: new L({values: $I})}),
      sortCriteria: new O({constrainTo: Au}),
      rangeAlgorithm: new O({constrainTo: Pu}),
    });
  function Eu(e, t) {
    pe(e, HI, t, 'buildNumericFacet'), Ec(t);
  }
  function No(e) {
    return {endInclusive: !1, state: 'idle', ...e};
  }
  function lv(e, t) {
    if (!zI(e)) throw D;
    bu(t.options, 'buildNumericFacet');
    let r = e.dispatch,
      a = Be(e, t.options),
      n = {currentValues: [], ...t.options, facetId: a};
    Eu(e, n), r(rr(n));
    let o = Ru(e, {
      facetId: a,
      getRequest: () => e.state.numericFacetSet[a].request,
    });
    return {
      ...o,
      toggleSelect: (i) => r(uv({facetId: a, selection: i})),
      toggleSingleSelect(i) {
        i.state === 'idle' && r(xe(a)), this.toggleSelect(i);
      },
      get state() {
        return o.state;
      },
    };
  }
  function zI(e) {
    return (
      e.addReducers({
        numericFacetSet: ft,
        facetOptions: Oe,
        configuration: W,
        search: G,
      }),
      !0
    );
  }
  function dv(e, t) {
    if (!WI(e)) throw D;
    let r = lv(e, t),
      a = e.dispatch,
      n = () => r.state.facetId;
    return {
      ...r,
      deselectAll() {
        r.deselectAll(), a(T(Ue(n())));
      },
      sortBy(o) {
        r.sortBy(o), a(T(or({facetId: n(), criterion: o})));
      },
      toggleSelect: (o) => {
        r.toggleSelect(o), a(T(Cu(n(), o)));
      },
      get state() {
        return {...r.state};
      },
    };
  }
  function WI(e) {
    return (
      e.addReducers({numericFacetSet: ft, configuration: W, search: G}), !0
    );
  }
  function YI(e, t) {
    return !!t && t.facetId in e.numericFacetSet;
  }
  var KI = (e, t) => {
      let r = vt(e, t);
      if (YI(e, r)) return r;
    },
    wu = (e, t) => {
      let r = KI(e, t);
      return r ? r.values.filter((a) => a.state === 'selected') : [];
    };
  function pv(e, t) {
    var u;
    if (!GI(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = Be(e, t.options),
      i = {
        ...t.options,
        currentValues: ((u = t.initialState) == null ? void 0 : u.range)
          ? [{...t.initialState.range, endInclusive: !0, state: 'selected'}]
          : [],
        generateAutomaticRanges: !1,
        facetId: o,
      };
    Eu(e, i), a(rr(i));
    let s = () => pr(e.state, o);
    return {
      ...r,
      clear: () => {
        a(br({facetId: o, values: []})), a(se({freezeFacetOrder: !0}));
      },
      setRange: (c) => {
        let l = {...c, state: 'selected', numberOfResults: 0, endInclusive: !0},
          p = br({facetId: o, values: [l]});
        return p.error ? !1 : (a(p), a(se({freezeFacetOrder: !0})), !0);
      },
      enable() {
        a(je(o));
      },
      disable() {
        a(ye(o));
      },
      get state() {
        let c = Nt(n()),
          l = s(),
          p = wu(n(), o),
          f = p.length ? p[0] : void 0;
        return {facetId: o, isLoading: c, range: f, enabled: l};
      },
    };
  }
  function GI(e) {
    return (
      e.addReducers({
        numericFacetSet: ft,
        facetOptions: Oe,
        configuration: W,
        search: G,
      }),
      !0
    );
  }
  function fv(e, t) {
    if (!JI(e)) throw D;
    let r = pv(e, t),
      {dispatch: a} = e,
      n = () => r.state.facetId;
    return {
      ...r,
      clear: () => {
        r.clear(), a(T(Ue(n())));
      },
      setRange: (o) => {
        let i = r.setRange(o);
        return (
          i && a(T(Re({facetId: n(), facetValue: `${o.start}..${o.end}`}))), i
        );
      },
      get state() {
        return {...r.state};
      },
    };
  }
  function JI(e) {
    return (
      e.addReducers({numericFacetSet: ft, configuration: W, search: G}), !0
    );
  }
  function XI(e, t) {
    return !!t && t.facetId in e.dateFacetSet;
  }
  var ZI = (e, t) => {
      let r = vt(e, t);
      if (XI(e, r)) return r;
    },
    ku = (e, t) => {
      let r = ZI(e, t);
      return r ? r.values.filter((a) => a.state === 'selected') : [];
    };
  function mv(e, t) {
    var u;
    if (!eE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = Be(e, t.options),
      i = {
        ...t.options,
        currentValues: ((u = t.initialState) == null ? void 0 : u.range)
          ? [{...t.initialState.range, endInclusive: !0, state: 'selected'}]
          : [],
        generateAutomaticRanges: !1,
        facetId: o,
      };
    Iu(e, i), a(er(i));
    let s = () => pr(e.state, o);
    return {
      ...r,
      clear: () => {
        a(Rr({facetId: o, values: []})), a(se({freezeFacetOrder: !0}));
      },
      setRange: (c) => {
        let l = {...c, state: 'selected', numberOfResults: 0, endInclusive: !0},
          p = Rr({facetId: o, values: [l]});
        return p.error ? !1 : (a(p), a(se({freezeFacetOrder: !0})), !0);
      },
      enable() {
        a(je(o));
      },
      disable() {
        a(ye(o));
      },
      get state() {
        let c = Nt(n()),
          l = s(),
          p = ku(n(), o),
          f = p.length ? p[0] : void 0;
        return {facetId: o, isLoading: c, range: f, enabled: l};
      },
    };
  }
  function eE(e) {
    return (
      e.addReducers({
        dateFacetSet: ur,
        facetOptions: Oe,
        configuration: W,
        search: G,
      }),
      !0
    );
  }
  function gv(e, t) {
    if (!tE(e)) throw D;
    let r = mv(e, t),
      {dispatch: a} = e,
      n = () => r.state.facetId;
    return {
      ...r,
      clear: () => {
        r.clear(), a(T(Ue(n())));
      },
      setRange: (o) => {
        let i = r.setRange(o);
        return (
          i && a(T(Re({facetId: n(), facetValue: `${o.start}..${o.end}`}))), i
        );
      },
      get state() {
        return {...r.state};
      },
    };
  }
  function tE(e) {
    return e.addReducers({dateFacetSet: ur, configuration: W, search: G}), !0;
  }
  var Ou = () =>
      Q('history/analytics/forward', M.Search, (e) =>
        e.makeSearchEvent('historyForward')
      ),
    qu = () =>
      Q('history/analytics/backward', M.Search, (e) =>
        e.makeSearchEvent('historyBackward')
      ),
    Tu = () =>
      Q('history/analytics/noresultsback', M.Search, (e) =>
        e.makeNoResultsBack()
      );
  function hv(e) {
    if (!rE(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = (o) => o.past.length > 0 && !re(o.present);
    return {
      ...t,
      get state() {
        return a().history;
      },
      async back() {
        !n(this.state) || (await r(vi()), r(T(qu())));
      },
      async forward() {
        !this.state.future.length ||
          !this.state.present ||
          (await r(Cs()), r(T(Ou())));
      },
      async backOnNoResults() {
        !n(this.state) || (await r(vi()), r(T(Tu())));
      },
    };
  }
  function rE(e) {
    return e.addReducers({history: gu, configuration: W, facetOrder: au}), !0;
  }
  function aE(e) {
    return e.pagination.firstResult;
  }
  function Sv(e) {
    return e.pagination.numberOfResults;
  }
  function nE(e) {
    return e.pagination.totalCountFiltered;
  }
  var Ar = (e) => {
      let t = aE(e),
        r = Sv(e);
      return dp(t, r);
    },
    Mi = (e) => {
      let t = nE(e),
        r = Sv(e);
      return pp(t, r);
    },
    Du = (e, t) => {
      let r = Ar(e),
        a = Mi(e),
        n = oE(r, t);
      return (n = iE(n)), (n = sE(n, a)), cE(n);
    };
  function oE(e, t) {
    let r = t % 2 == 0,
      a = Math.floor(t / 2),
      n = r ? a - 1 : a,
      o = e - a,
      i = e + n;
    return {start: o, end: i};
  }
  function iE(e) {
    let t = Math.max(Fa - e.start, 0),
      r = e.start + t,
      a = e.end + t;
    return {start: r, end: a};
  }
  function sE(e, t) {
    let r = Math.max(e.end - t, 0),
      a = Math.max(e.start - r, Fa),
      n = e.end - r;
    return {start: a, end: n};
  }
  function cE(e) {
    let t = [];
    for (let r = e.start; r <= e.end; ++r) t.push(r);
    return t;
  }
  var Mo = () =>
      Q('analytics/pager/resize', M.Search, (e, t) => {
        var r;
        return e.makePagerResize({
          currentResultsPerPage:
            ((r = t.pagination) == null ? void 0 : r.numberOfResults) ||
            Ae().numberOfResults,
        });
      }),
    Qo = () =>
      Q('analytics/pager/number', M.Search, (e, t) =>
        e.makePagerNumber({pagerNumber: Ar(t)})
      ),
    Vu = () =>
      Q('analytics/pager/next', M.Search, (e, t) =>
        e.makePagerNext({pagerNumber: Ar(t)})
      ),
    Nu = () =>
      Q('analytics/pager/previous', M.Search, (e, t) =>
        e.makePagerPrevious({pagerNumber: Ar(t)})
      );
  var uE = new Z({numberOfPages: new U({default: 5, min: 0})}),
    lE = new Z({page: new U({min: 1})});
  function yv(e, t = {}) {
    if (!dE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = pe(e, uE, t.options, 'buildPager'),
      i = we(e, lE, t.initialState, 'buildPager').page;
    i && a(pn(i));
    let s = () => Ar(e.state),
      u = () => {
        let {numberOfPages: l} = n;
        return Du(e.state, l);
      },
      c = () => Mi(e.state);
    return {
      ...r,
      get state() {
        let l = s(),
          p = c(),
          f = l > Fa && p > 0,
          d = l < p;
        return {
          currentPage: l,
          currentPages: u(),
          maxPage: p,
          hasPreviousPage: f,
          hasNextPage: d,
        };
      },
      selectPage(l) {
        a(jt(l));
      },
      nextPage() {
        a(fn());
      },
      previousPage() {
        a(mn());
      },
      isCurrentPage(l) {
        return l === this.state.currentPage;
      },
    };
  }
  function dE(e) {
    return e.addReducers({configuration: W, pagination: sr}), !0;
  }
  function vv(e, t = {}) {
    let {dispatch: r} = e,
      a = yv(e, t);
    return {
      ...a,
      get state() {
        return a.state;
      },
      selectPage(n) {
        a.selectPage(n), r(Ye(Qo()));
      },
      nextPage() {
        a.nextPage(), r(Ye(Vu()));
      },
      previousPage() {
        a.previousPage(), r(Ye(Nu()));
      },
    };
  }
  function Cv(e) {
    if (!pE(e)) throw D;
    let t = B(e),
      r = () => e.state;
    return {
      ...t,
      get state() {
        return {hasError: r().search.error !== null, error: r().search.error};
      },
    };
  }
  function pE(e) {
    return e.addReducers({search: G}), !0;
  }
  function xv(e) {
    return Cv(e);
  }
  function Lo(e) {
    if (!fE(e)) throw D;
    let t = B(e),
      r = () => e.state;
    return {
      ...t,
      get state() {
        let a = r();
        return {
          hasError: a.search.error !== null,
          isLoading: a.search.isLoading,
          hasResults: !!a.search.results.length,
          firstSearchExecuted: mc(a),
        };
      },
    };
  }
  function fE(e) {
    return e.addReducers({search: G}), !0;
  }
  function Rv(e) {
    if (!mE(e)) throw D;
    let t = B(e),
      r = Lo(e),
      a = () => e.state,
      n = () => {
        let o = a().search.duration / 1e3;
        return Math.round((o + Number.EPSILON) * 100) / 100;
      };
    return {
      ...t,
      get state() {
        return {
          ...r.state,
          durationInMilliseconds: a().search.duration,
          durationInSeconds: n(),
          firstResult: a().pagination.firstResult + 1,
          hasDuration: a().search.duration !== 0,
          hasQuery: a().search.queryExecuted !== '',
          lastResult: a().pagination.firstResult + a().search.results.length,
          query: a().search.queryExecuted,
          total: a().pagination.totalCountFiltered,
        };
      },
    };
  }
  function mE(e) {
    return e.addReducers({search: G, pagination: sr}), !0;
  }
  function bv(e) {
    return Rv(e);
  }
  var gE = new Z({
    fieldsToInclude: new K({
      required: !1,
      each: new O({required: !0, emptyAllowed: !1}),
    }),
  });
  function Fv(e, t) {
    if (!hE(e)) throw D;
    let r = B(e),
      a = Lo(e),
      {dispatch: n} = e,
      o = () => e.state,
      i = pe(e, gE, t == null ? void 0 : t.options, 'buildCoreResultList');
    i.fieldsToInclude && n(aa(i.fieldsToInclude));
    let s = () =>
        e.state.search.results.length <
        e.state.search.response.totalCountFiltered,
      u = 0,
      c = 0,
      l = 5,
      p = 200,
      f = !1;
    return {
      ...r,
      get state() {
        let m = o();
        return {
          ...a.state,
          results: m.search.results,
          moreResultsAvailable: s(),
          searchResponseId: m.search.searchResponseId,
        };
      },
      fetchMoreResults: () => {
        if (e.state.search.isLoading) return;
        if (!s()) {
          e.logger.info(
            'No more results are available for the result list to fetch.'
          );
          return;
        }
        if (Date.now() - u < p) {
          if ((c++, c >= l)) {
            (u = Date.now()),
              !f &&
                e.logger.error(
                  `The result list method "fetchMoreResults" execution prevented because it has been triggered consecutively ${l} times, with little delay. Please verify the conditions under which the function is called.`
                ),
              (f = !0);
            return;
          }
        } else c = 0;
        (f = !1),
          (t == null ? void 0 : t.fetchMoreResultsActionCreator) &&
            n(t == null ? void 0 : t.fetchMoreResultsActionCreator()).then(
              () => (u = Date.now())
            );
      },
    };
  }
  function hE(e) {
    return e.addReducers({search: G, configuration: W, fields: ua}), !0;
  }
  function Mu(e, t) {
    return Fv(e, {...t, fetchMoreResultsActionCreator: ut});
  }
  var Qu = (e) =>
    Q(
      'analytics/result/open',
      M.Click,
      (t, r) => (_e(e), t.makeDocumentOpen(Ve(e, r), Le(e)))
    );
  function gt(e, t, r) {
    if (!SE(e)) throw D;
    let a = 1e3,
      n = {selectionDelay: a, debounceWait: a, ...t.options},
      o;
    return {
      select: hu(r, n.debounceWait, {isImmediate: !0}),
      beginDelayedSelect() {
        o = setTimeout(r, n.selectionDelay);
      },
      cancelPendingSelect() {
        o && clearTimeout(o);
      },
    };
  }
  function SE(e) {
    return e.addReducers({configuration: W}), !0;
  }
  function Av(e, t) {
    let r = !1,
      a = () => {
        r || ((r = !0), e.dispatch(Qu(t.options.result)));
      };
    return gt(e, t, () => {
      a(), e.dispatch(pt(t.options.result));
    });
  }
  function Pv(e, t) {
    let r = !1,
      a = () => {
        r || ((r = !0), e.dispatch(Eg(t.options.result)));
      };
    return gt(e, t, () => {
      a(), e.dispatch(pt(t.options.result));
    });
  }
  var yE = new Z({numberOfResults: new U({min: 0})});
  function Iv(e, t = {}) {
    if (!vE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      i = we(e, yE, t.initialState, 'buildResultsPerPage').numberOfResults;
    return (
      i !== void 0 && a(ln(i)),
      {
        ...r,
        get state() {
          return {numberOfResults: n().pagination.numberOfResults};
        },
        set(s) {
          a(dn(s));
        },
        isSetTo(s) {
          return s === this.state.numberOfResults;
        },
      }
    );
  }
  function vE(e) {
    return e.addReducers({pagination: sr, configuration: W}), !0;
  }
  function Ev(e, t = {}) {
    if (!CE(e)) throw D;
    let r = Iv(e, t),
      {dispatch: a} = e;
    return {
      ...r,
      get state() {
        return {...r.state};
      },
      set(n) {
        r.set(n), a(Ye(Mo()));
      },
    };
  }
  function CE(e) {
    return e.addReducers({pagination: sr, configuration: W}), !0;
  }
  var da = () =>
    Q('analytics/searchbox/submit', M.Search, (e) => e.makeSearchboxSubmit());
  var Lu = (e) =>
    Q('analytics/querySuggest', M.Search, (t, r) => {
      let a = Pp(r, e);
      return t.makeOmniboxAnalytics(a);
    });
  function Pp(e, t) {
    let {id: r, suggestion: a} = t,
      n = e.querySuggest && e.querySuggest[r];
    if (!n)
      throw new Error(
        `Unable to determine the query suggest analytics metadata to send because no query suggest with id "${r}" was found. Please check the sent #id.`
      );
    let o = n.completions.map((c) => c.expression),
      i = n.partialQueries.length - 1,
      s = n.partialQueries[i] || '',
      u = n.responseId;
    return {
      suggestionRanking: o.indexOf(a),
      partialQuery: s,
      partialQueries: n.partialQueries,
      suggestions: o,
      querySuggestResponseId: u,
    };
  }
  var ju = {enableQuerySyntax: !1, numberOfSuggestions: 5, clearFilters: !0},
    Ip = {open: new O(), close: new O()},
    Ep = {
      id: q,
      numberOfSuggestions: new U({min: 0}),
      enableQuerySyntax: new J(),
      highlightOptions: new L({
        values: {
          notMatchDelimiters: new L({values: Ip}),
          exactMatchDelimiters: new L({values: Ip}),
          correctionDelimiters: new L({values: Ip}),
        },
      }),
      clearFilters: new J(),
    },
    wv = new Z(Ep);
  function kv(e, t) {
    var c, l;
    if (!RE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = ((c = t.options) == null ? void 0 : c.id) || rn('search_box'),
      i = {
        id: o,
        highlightOptions: {
          ...((l = t.options) == null ? void 0 : l.highlightOptions),
        },
        ...ju,
        ...t.options,
      };
    pe(e, wv, i, 'buildSearchBox'),
      a(to({id: o, query: e.state.query.q})),
      i.numberOfSuggestions && a(eo({id: o, count: i.numberOfSuggestions}));
    let s = () => e.state.querySet[i.id],
      u = async (p) => {
        let {enableQuerySyntax: f, clearFilters: d} = i;
        a(Ms({q: s(), enableQuerySyntax: f, clearFilters: d})),
          await a(t.executeSearchActionCreator(p));
      };
    return {
      ...r,
      updateText(p) {
        a(Na({id: o, query: p})), this.showSuggestions();
      },
      clear() {
        a(Na({id: o, query: ''})), a(oa({id: o}));
      },
      showSuggestions() {
        i.numberOfSuggestions &&
          a(t.fetchQuerySuggestionsActionCreator({id: o}));
      },
      selectSuggestion(p) {
        a(ir({id: o, expression: p})),
          u(Lu({id: o, suggestion: p})).then(() => {
            a(oa({id: o}));
          });
      },
      submit(p = da()) {
        u(p), a(oa({id: o}));
      },
      get state() {
        let p = n(),
          f = p.querySuggest[i.id],
          d = xE(f, i.highlightOptions),
          m = f ? f.isLoading : !1;
        return {
          value: s(),
          suggestions: d,
          isLoading: p.search.isLoading,
          isLoadingSuggestions: m,
        };
      },
    };
  }
  function xE(e, t) {
    return e
      ? e.completions.map((r) => ({
          highlightedValue: Yd(r.highlighted, t),
          rawValue: r.expression,
        }))
      : [];
  }
  function RE(e) {
    return (
      e.addReducers({
        query: mt,
        querySuggest: Oo,
        configuration: W,
        querySet: ko,
        search: G,
      }),
      !0
    );
  }
  function Uu(e, t = {}) {
    let r = kv(e, {
      ...t,
      executeSearchActionCreator: T,
      fetchQuerySuggestionsActionCreator: ia,
    });
    return {
      ...r,
      submit() {
        r.submit(da());
      },
      get state() {
        return r.state;
      },
    };
  }
  var bE = {
      searchBoxId: oe,
      maxResultsPerQuery: new U({required: !0, min: 1}),
      cacheTimeout: new U(),
    },
    Ov = new Z(bE);
  function qv(e, t) {
    if (!FE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = {
        searchBoxId: t.options.searchBoxId || rn('instant-results-'),
        cacheTimeout: t.options.cacheTimeout || 6e4,
        maxResultsPerQuery: t.options.maxResultsPerQuery,
      };
    pe(e, Ov, o, 'buildInstantResults');
    let i = o.searchBoxId;
    a(cn({id: i}));
    let s = () => n().instantResults[i],
      u = (p) => s().cache[p],
      c = () => s().q,
      l = () => {
        let p = u(c());
        return p ? (p.isLoading ? [] : p.results) : [];
      };
    return {
      ...r,
      updateQuery(p) {
        if (!p) return;
        let f = u(p);
        (!f || (!f.isLoading && (f.error || xs(f)))) &&
          a(
            $r({
              id: i,
              q: p,
              maxResultsPerQuery: o.maxResultsPerQuery,
              cacheTimeout: o.cacheTimeout,
            })
          ),
          a(jr({id: i, q: p}));
      },
      clearExpired() {
        a(un({id: i}));
      },
      get state() {
        let p = c(),
          f = u(p);
        return {
          q: p,
          isLoading: (f == null ? void 0 : f.isLoading) || !1,
          error: (f == null ? void 0 : f.error) || null,
          results: l(),
        };
      },
    };
  }
  function FE(e) {
    return e.addReducers({instantResults: ou}), !0;
  }
  var jo = () =>
    Q('analytics/sort/results', M.Search, (e, t) =>
      e.makeResultsSort({resultsSortBy: t.sortCriteria || et()})
    );
  function AE(e, t) {
    if (!t) return;
    let r = new Z({criterion: new K({each: Og})}),
      a = PE(t),
      n = {...t, criterion: a};
    we(e, r, n, 'buildSort');
  }
  function PE(e) {
    return e.criterion ? (Ka(e.criterion) ? e.criterion : [e.criterion]) : [];
  }
  function Tv(e, t) {
    var i;
    if (!IE(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state;
    AE(e, t.initialState);
    let o = (i = t.initialState) == null ? void 0 : i.criterion;
    return (
      o && a(vo(o)),
      {
        ...r,
        sortBy(s) {
          a(Co(s)), a(jt(1));
        },
        isSortedBy(s) {
          return this.state.sortCriteria === _t(s);
        },
        get state() {
          return {sortCriteria: n().sortCriteria};
        },
      }
    );
  }
  function IE(e) {
    return e.addReducers({configuration: W, sortCriteria: su}), !0;
  }
  function Dv(e, t = {}) {
    let {dispatch: r} = e,
      a = Tv(e, t),
      n = () => r(T(jo()));
    return {
      ...a,
      get state() {
        return a.state;
      },
      sortBy(o) {
        a.sortBy(o), n();
      },
    };
  }
  function wp(e) {
    return {state: 'idle', ...e};
  }
  var EE = new Z({id: Ao, values: Zc});
  function Vv(e, t) {
    if (!wE(e)) throw D;
    pe(e, EE, t.options, 'buildStaticFilter');
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      {id: o} = t.options;
    return (
      a(Po(t.options)),
      {
        ...r,
        toggleSelect(i) {
          let s = Nv(o, i);
          a(Fr({id: o, value: i})), a(T(s));
        },
        toggleSingleSelect(i) {
          let s = Nv(o, i);
          i.state === 'idle' && a(Qa(o)), a(Fr({id: o, value: i})), a(T(s));
        },
        deselectAll() {
          let i = tu({staticFilterId: o});
          a(Qa(o)), a(T(i));
        },
        isValueSelected(i) {
          return i.state === 'selected';
        },
        get state() {
          var u;
          let i =
              ((u = n().staticFilterSet[o]) == null ? void 0 : u.values) || [],
            s = i.some((c) => c.state !== 'idle');
          return {id: o, values: i, hasActiveValues: s};
        },
      }
    );
  }
  function wE(e) {
    return e.addReducers({staticFilterSet: nu}), !0;
  }
  function Nv(e, t) {
    let {caption: r, expression: a, state: n} = t;
    return (
      n === 'idle' ? eu : Io
    )({staticFilterId: e, staticFilterValue: {caption: r, expression: a}});
  }
  var kE = new Z({expression: ie, id: q}),
    OE = new Z({isActive: new J()});
  function Mv(e, t) {
    if ((TE(t.options.id), !qE(e))) throw D;
    let r = B(e),
      {dispatch: a} = e;
    pe(e, kE, t.options, 'buildTab');
    let n = we(e, OE, t.initialState, 'buildTab'),
      {id: o, expression: i} = t.options;
    return (
      a(wn({id: o, expression: i})),
      n.isActive && a(xr(o)),
      {
        ...r,
        select() {
          a(xr(o));
        },
        get state() {
          var u;
          return {
            isActive: (u = e.state.tabSet[o]) == null ? void 0 : u.isActive,
          };
        },
      }
    );
  }
  function qE(e) {
    return e.addReducers({configuration: W, tabSet: iu}), !0;
  }
  function TE(e) {
    let t = Ne().analytics.originLevel2;
    if (e === t)
      throw new Error(
        `The #id option on the Tab controller cannot use the reserved value "${t}". Please specify a different value.`
      );
  }
  function Qv(e, t) {
    let {dispatch: r} = e,
      a = Mv(e, t),
      n = () => r(T(zr()));
    return {
      ...a,
      get state() {
        return a.state;
      },
      select() {
        a.select(), n();
      },
    };
  }
  function Lv(e) {
    if (!DE(e)) throw D;
    let t = B(e),
      r = () => e.state;
    return {
      ...t,
      sort(a) {
        return bn(a, this.state.facetIds);
      },
      get state() {
        return {facetIds: r().search.response.facets.map((o) => o.facetId)};
      },
    };
  }
  function DE(e) {
    return e.addReducers({search: G, facetOptions: Oe}), !0;
  }
  function jv(e) {
    return Lv(e);
  }
  var VE = {
      categoryFacetId: ee,
      categoryFacetPath: new K({required: !0, each: q}),
    },
    NE = (e, {categoryFacetId: t, categoryFacetPath: r}) => {
      let a = e.categoryFacetSet[t],
        n = a == null ? void 0 : a.request.field,
        o = `${n}_${t}`;
      return {
        categoryFacetId: t,
        categoryFacetPath: r,
        categoryFacetField: n,
        categoryFacetTitle: o,
      };
    },
    Bu = (e) =>
      Q(
        'analytics/categoryFacet/breadcrumb',
        M.Search,
        (t, r) => (y(e, VE), t.makeBreadcrumbFacet(NE(r, e)))
      );
  var _u = () =>
    Q('analytics/facet/deselectAllBreadcrumbs', M.Search, (e) =>
      e.makeBreadcrumbResetAll()
    );
  var $u = (e, {facetId: t, selection: r}) => {
    let n = (e.dateFacetSet[t] || e.numericFacetSet[t]).request.field,
      o = `${n}_${t}`;
    return {
      facetId: t,
      facetField: n,
      facetTitle: o,
      facetRangeEndInclusive: r.endInclusive,
      facetRangeEnd: `${r.end}`,
      facetRangeStart: `${r.start}`,
    };
  };
  var Hu = (e) =>
    Q('analytics/dateFacet/breadcrumb', M.Search, (t, r) => {
      y(e, _n(e.selection));
      let a = $u(r, e);
      return t.makeBreadcrumbFacet(a);
    });
  var zu = (e) =>
    Q('analytics/numericFacet/breadcrumb', M.Search, (t, r) => {
      y(e, _n(e.selection));
      let a = $u(r, e);
      return t.makeBreadcrumbFacet(a);
    });
  var Wu = (e, t, r, a) =>
    Object.keys(t)
      .map((n) => {
        let o = a(e.state, n).map((i) => ({
          value: i,
          deselect: () => r({facetId: n, selection: i}),
        }));
        return {facetId: n, field: t[n].request.field, values: o};
      })
      .filter((n) => n.values.length);
  function Uv(e) {
    let t = B(e),
      {dispatch: r} = e;
    return {
      ...t,
      get state() {
        return {
          facetBreadcrumbs: [],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          staticFilterBreadcrumbs: [],
          hasBreadcrumbs: !1,
        };
      },
      deselectAll: () => {
        r(ke());
      },
      deselectBreadcrumb(a) {
        a.deselect();
      },
    };
  }
  function Bv(e) {
    if (!ME(e)) throw D;
    let t = Uv(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = () =>
        Wu(
          e,
          a().facetSet,
          ({facetId: d, selection: m}) => {
            let h = Lc({facetId: d, facetValue: m.value});
            r(Zt({facetId: d, selection: m})),
              r(Jr({facetId: d, freezeCurrentValues: !1})),
              r(T(h));
          },
          os
        ),
      o = () =>
        Wu(
          e,
          a().numericFacetSet,
          (d) => {
            r(ar(d)), r(T(zu(d)));
          },
          wu
        ),
      i = () =>
        Wu(
          e,
          a().dateFacetSet,
          (d) => {
            r(tr(d)), r(T(Hu(d)));
          },
          ku
        ),
      s = (d) => {
        let m = km(a(), d);
        return {
          facetId: d,
          field: a().categoryFacetSet[d].request.field,
          path: m,
          deselect: () => {
            r(Wt(d)),
              r(
                T(
                  Bu({
                    categoryFacetPath: m.map((h) => h.value),
                    categoryFacetId: d,
                  })
                )
              );
          },
        };
      },
      u = () =>
        Object.keys(a().categoryFacetSet)
          .map(s)
          .filter((d) => d.path.length),
      c = () => {
        let d = a().staticFilterSet || {};
        return Object.values(d).map(l);
      },
      l = (d) => {
        let {id: m, values: h} = d,
          v = h.filter((C) => C.state === 'selected').map((C) => p(m, C));
        return {id: m, values: v};
      },
      p = (d, m) => ({
        value: m,
        deselect: () => {
          let {caption: h, expression: v} = m,
            C = Io({
              staticFilterId: d,
              staticFilterValue: {caption: h, expression: v},
            });
          r(Fr({id: d, value: m})), r(T(C));
        },
      });
    function f() {
      return !![...n(), ...o(), ...i(), ...u(), ...c()].length;
    }
    return {
      ...t,
      get state() {
        return {
          facetBreadcrumbs: n(),
          categoryFacetBreadcrumbs: u(),
          numericFacetBreadcrumbs: o(),
          dateFacetBreadcrumbs: i(),
          staticFilterBreadcrumbs: c(),
          hasBreadcrumbs: f(),
        };
      },
      deselectAll: () => {
        t.deselectAll(), r(T(_u()));
      },
    };
  }
  function ME(e) {
    return (
      e.addReducers({
        configuration: W,
        search: G,
        facetSet: cr,
        numericFacetSet: ft,
        dateFacetSet: ur,
        categoryFacetSet: lr,
      }),
      !0
    );
  }
  var _v = new Z({
    ...Ep,
    redirectionUrl: new O({required: !0, emptyAllowed: !1}),
  });
  function $v(e, t) {
    if (!QE(e)) throw D;
    let {dispatch: r} = e,
      a = () => e.state,
      n = t.options.id || rn('standalone_search_box'),
      o = {
        id: n,
        highlightOptions: {...t.options.highlightOptions},
        ...ju,
        ...t.options,
      };
    pe(e, _v, o, 'buildStandaloneSearchBox');
    let i = Uu(e, {options: o});
    return (
      r(xo({id: n, redirectionUrl: o.redirectionUrl})),
      {
        ...i,
        updateText(s) {
          i.updateText(s), r(bo({id: n}));
        },
        selectSuggestion(s) {
          let u = Pp(a(), {id: n, suggestion: s});
          r(ir({id: n, expression: s})),
            r(Fo({id: n, metadata: u})),
            this.submit();
        },
        afterRedirection() {
          r(Ro({id: n}));
        },
        submit() {
          r(it({q: this.state.value, enableQuerySyntax: o.enableQuerySyntax})),
            r(ca({id: n}));
        },
        get state() {
          let u = a().standaloneSearchBoxSet[n];
          return {
            ...i.state,
            isLoading: u.isLoading,
            redirectTo: u.redirectTo,
            analytics: u.analytics,
          };
        },
      }
    );
  }
  function QE(e) {
    return (
      e.addReducers({
        standaloneSearchBoxSet: pu,
        configuration: W,
        query: mt,
        querySuggest: Oo,
      }),
      !0
    );
  }
  function Hv(e, t) {
    return e.q !== t.q
      ? da()
      : e.sortCriteria !== t.sortCriteria
      ? jo()
      : e.firstResult !== t.firstResult
      ? Qo()
      : e.numberOfResults !== t.numberOfResults
      ? Mo()
      : Yu(e.f, t.f)
      ? kp(e.f, t.f)
      : Yu(e.cf, t.cf)
      ? kp(e.cf, t.cf)
      : Yu(e.nf, t.nf)
      ? Wv(e.nf, t.nf)
      : Yu(e.df, t.df)
      ? Wv(e.df, t.df)
      : zr();
  }
  function Yu(e = {}, t = {}) {
    return JSON.stringify(e) !== JSON.stringify(t);
  }
  function zv(e) {
    let t = {};
    return (
      Object.keys(e).forEach(
        (r) => (t[r] = e[r].map((a) => `${a.start}..${a.end}`))
      ),
      t
    );
  }
  function kp(e = {}, t = {}) {
    let r = Object.keys(e),
      a = Object.keys(t),
      n = r.filter((p) => !a.includes(p));
    if (n.length) {
      let p = n[0];
      return e[p].length > 1 ? Ue(p) : Et({facetId: p, facetValue: e[p][0]});
    }
    let o = a.filter((p) => !r.includes(p));
    if (o.length) {
      let p = o[0];
      return Re({facetId: p, facetValue: t[p][0]});
    }
    let i = a.find((p) => t[p].filter((f) => e[p].includes(f)));
    if (!i) return zr();
    let s = e[i],
      u = t[i],
      c = u.filter((p) => !s.includes(p));
    if (c.length) return Re({facetId: i, facetValue: c[0]});
    let l = s.filter((p) => !u.includes(p));
    return l.length ? Et({facetId: i, facetValue: l[0]}) : zr();
  }
  function Wv(e = {}, t = {}) {
    return kp(zv(e), zv(t));
  }
  function Yv(e) {
    var t, r, a, n, o, i;
    return {
      q: ve().q,
      enableQuerySyntax: ve().enableQuerySyntax,
      aq:
        (r =
          (t = e.advancedSearchQueries) == null
            ? void 0
            : t.defaultFilters.aq) != null
          ? r
          : $e().defaultFilters.aq,
      cq:
        (n =
          (a = e.advancedSearchQueries) == null
            ? void 0
            : a.defaultFilters.cq) != null
          ? n
          : $e().defaultFilters.cq,
      firstResult: Ae().firstResult,
      numberOfResults:
        (i = (o = e.pagination) == null ? void 0 : o.defaultNumberOfResults) !=
        null
          ? i
          : Ae().defaultNumberOfResults,
      sortCriteria: et(),
      f: {},
      cf: {},
      nf: {},
      df: {},
      debug: We(),
      sf: {},
      tab: '',
    };
  }
  var LE = new Z({parameters: new L({options: {required: !0}, values: gc})});
  function Kv(e, t) {
    let {dispatch: r} = e,
      a = B(e);
    return (
      we(e, LE, t.initialState, 'buildSearchParameterManager'),
      r(ue(t.initialState.parameters)),
      {
        ...a,
        synchronize(n) {
          let o = Ku(e, n);
          r(ue(o));
        },
        get state() {
          return {parameters: Op(e)};
        },
      }
    );
  }
  function Ku(e, t) {
    return {...Yv(e.state), ...t};
  }
  function Gv(e, t) {
    return BE(e, t);
  }
  function Op(e) {
    let t = e.state;
    return {
      ...jE(t),
      ...UE(t),
      ..._E(t),
      ...$E(t),
      ...zE(t),
      ...WE(t),
      ...YE(t),
    };
  }
  function jE(e) {
    if (e.query === void 0) return {};
    let t = e.query.q;
    return t !== ve().q ? {q: t} : {};
  }
  function UE(e) {
    let t = Object.values(e.tabSet || {}).find((r) => r.isActive);
    return t ? {tab: t.id} : {};
  }
  function BE(e, t) {
    let r = e.state.tabSet,
      a = t.tab;
    if (!r || !Object.entries(r).length || !a) return !0;
    let n = a in r;
    return (
      n ||
        e.logger.warn(
          `The tab search parameter "${a}" is invalid. Ignoring change.`
        ),
      n
    );
  }
  function _E(e) {
    if (e.sortCriteria === void 0) return {};
    let t = e.sortCriteria;
    return t !== et() ? {sortCriteria: t} : {};
  }
  function $E(e) {
    if (e.facetSet === void 0) return {};
    let t = Object.entries(e.facetSet)
      .filter(([r]) => {
        var a, n, o;
        return (o =
          (n = (a = e.facetOptions) == null ? void 0 : a.facets[r]) == null
            ? void 0
            : n.enabled) != null
          ? o
          : !0;
      })
      .map(([r, {request: a}]) => {
        let n = HE(a.currentValues);
        return n.length ? {[r]: n} : {};
      })
      .reduce((r, a) => ({...r, ...a}), {});
    return Object.keys(t).length ? {f: t} : {};
  }
  function HE(e) {
    return e.filter((t) => t.state === 'selected').map((t) => t.value);
  }
  function zE(e) {
    if (e.categoryFacetSet === void 0) return {};
    let t = Object.entries(e.categoryFacetSet)
      .filter(([r]) => {
        var a, n, o;
        return (o =
          (n = (a = e.facetOptions) == null ? void 0 : a.facets[r]) == null
            ? void 0
            : n.enabled) != null
          ? o
          : !0;
      })
      .map(([r, a]) => {
        let {parents: n} = Xe(a.request.currentValues),
          o = n.map((i) => i.value);
        return o.length ? {[r]: o} : {};
      })
      .reduce((r, a) => ({...r, ...a}), {});
    return Object.keys(t).length ? {cf: t} : {};
  }
  function WE(e) {
    if (e.numericFacetSet === void 0) return {};
    let t = Object.entries(e.numericFacetSet)
      .filter(([r]) => {
        var a, n, o;
        return (o =
          (n = (a = e.facetOptions) == null ? void 0 : a.facets[r]) == null
            ? void 0
            : n.enabled) != null
          ? o
          : !0;
      })
      .map(([r, {request: a}]) => {
        let n = Jv(a.currentValues);
        return n.length ? {[r]: n} : {};
      })
      .reduce((r, a) => ({...r, ...a}), {});
    return Object.keys(t).length ? {nf: t} : {};
  }
  function YE(e) {
    if (e.dateFacetSet === void 0) return {};
    let t = Object.entries(e.dateFacetSet)
      .filter(([r]) => {
        var a, n, o;
        return (o =
          (n = (a = e.facetOptions) == null ? void 0 : a.facets[r]) == null
            ? void 0
            : n.enabled) != null
          ? o
          : !0;
      })
      .map(([r, {request: a}]) => {
        let n = Jv(a.currentValues);
        return n.length ? {[r]: n} : {};
      })
      .reduce((r, a) => ({...r, ...a}), {});
    return Object.keys(t).length ? {df: t} : {};
  }
  function Jv(e) {
    return e.filter((t) => t.state === 'selected');
  }
  function Gu(e, t) {
    let {dispatch: r} = e,
      a = Kv(e, t);
    return {
      ...a,
      synchronize(n) {
        let o = Xv(e),
          i = Ku(e, o),
          s = Ku(e, n);
        Yc(i, s) || !Gv(e, s) || (a.synchronize(n), r(T(Hv(i, s))));
      },
      get state() {
        return {parameters: Xv(e)};
      },
    };
  }
  function Xv(e) {
    let t = e.state;
    return {
      ...Op(e),
      ...KE(t),
      ...GE(t),
      ...JE(t),
      ...XE(t),
      ...ZE(t),
      ...rw(t),
      ...ew(t),
    };
  }
  function KE(e) {
    if (e.query === void 0) return {};
    let t = e.query.enableQuerySyntax;
    return t !== void 0 && t !== ve().enableQuerySyntax
      ? {enableQuerySyntax: t}
      : {};
  }
  function GE(e) {
    if (e.advancedSearchQueries === void 0) return {};
    let {aq: t, defaultFilters: r} = e.advancedSearchQueries;
    return t !== r.aq ? {aq: t} : {};
  }
  function JE(e) {
    if (e.advancedSearchQueries === void 0) return {};
    let {cq: t, defaultFilters: r} = e.advancedSearchQueries;
    return t !== r.cq ? {cq: t} : {};
  }
  function XE(e) {
    if (e.pagination === void 0) return {};
    let t = e.pagination.firstResult;
    return t !== Ae().firstResult ? {firstResult: t} : {};
  }
  function ZE(e) {
    if (e.pagination === void 0) return {};
    let {numberOfResults: t, defaultNumberOfResults: r} = e.pagination;
    return t !== r ? {numberOfResults: t} : {};
  }
  function ew(e) {
    if (e.staticFilterSet === void 0) return {};
    let t = Object.entries(e.staticFilterSet)
      .map(([r, a]) => {
        let n = tw(a.values);
        return n.length ? {[r]: n} : {};
      })
      .reduce((r, a) => ({...r, ...a}), {});
    return Object.keys(t).length ? {sf: t} : {};
  }
  function tw(e) {
    return e.filter((t) => t.state === 'selected').map((t) => t.caption);
  }
  function rw(e) {
    if (e.debug === void 0) return {};
    let t = e.debug;
    return t !== We() ? {debug: t} : {};
  }
  var Ju = '&',
    Qi = '=',
    qp = '..';
  function Li() {
    return {serialize: aw, deserialize: uw};
  }
  function aw(e) {
    return Object.entries(e)
      .map(nw)
      .filter((t) => t)
      .join(Ju);
  }
  function nw(e) {
    let [t, r] = e;
    return eC(t)
      ? t === 'f' || t === 'cf' || t === 'sf'
        ? ow(r)
          ? sw(t, r)
          : ''
        : t === 'nf' || t === 'df'
        ? iw(r)
          ? cw(t, r)
          : ''
        : `${t}${Qi}${encodeURIComponent(r)}`
      : '';
  }
  function ow(e) {
    return Tp(e) ? Zv(e, (r) => typeof r == 'string') : !1;
  }
  function iw(e) {
    return Tp(e) ? Zv(e, (r) => Tp(r) && 'start' in r && 'end' in r) : !1;
  }
  function Tp(e) {
    return !!(e && typeof e == 'object');
  }
  function Zv(e, t) {
    return (
      Object.entries(e).filter((a) => {
        let n = a[1];
        return !Array.isArray(n) || !n.every(t);
      }).length === 0
    );
  }
  function sw(e, t) {
    return Object.entries(t)
      .map(
        ([r, a]) =>
          `${e}-${r}${Qi}${a.map((n) => encodeURIComponent(n)).join(',')}`
      )
      .join(Ju);
  }
  function cw(e, t) {
    return Object.entries(t)
      .map(([r, a]) => {
        let n = a.map(({start: o, end: i}) => `${o}${qp}${i}`).join(',');
        return `${e}-${r}${Qi}${n}`;
      })
      .join(Ju);
  }
  function uw(e) {
    return e
      .split(Ju)
      .map((a) => lw(a))
      .map(dw)
      .filter(hw)
      .map(Sw)
      .reduce((a, n) => {
        let [o, i] = n;
        if (tC(o)) {
          let s = {...a[o], ...i};
          return {...a, [o]: s};
        }
        return {...a, [o]: i};
      }, {});
  }
  function lw(e) {
    let [t, ...r] = e.split(Qi),
      a = r.join(Qi);
    return [t, a];
  }
  function dw(e) {
    let [t, r] = e,
      n = /^(f|cf|nf|df|sf)-(.+)$/.exec(t);
    if (!n) return e;
    let o = n[1],
      i = n[2],
      s = r.split(','),
      u = pw(o, s),
      c = {[i]: u};
    return [o, JSON.stringify(c)];
  }
  function pw(e, t) {
    return e === 'nf' ? fw(t) : e === 'df' ? gw(t) : t;
  }
  function fw(e) {
    return e
      .map((t) => t.split(qp).map(parseFloat))
      .filter((t) => t.length === 2 && t.every(Number.isFinite))
      .map(([t, r]) => No({start: t, end: r, state: 'selected'}));
  }
  function mw(e) {
    try {
      return Ng(e) ? (Vs(e, Rn), !0) : $t(e) ? (_r(e), !0) : !1;
    } catch (t) {
      return !1;
    }
  }
  function gw(e) {
    return e
      .map((t) => t.split(qp))
      .filter((t) => t.length === 2 && t.every((r) => mw(r)))
      .map(([t, r]) => Xr({start: t, end: r, state: 'selected'}));
  }
  function hw(e) {
    let t = eC(e[0]),
      r = e.length === 2;
    return t && r;
  }
  function eC(e) {
    return (
      e in
      {
        q: !0,
        aq: !0,
        cq: !0,
        enableQuerySyntax: !0,
        firstResult: !0,
        numberOfResults: !0,
        sortCriteria: !0,
        f: !0,
        cf: !0,
        nf: !0,
        df: !0,
        debug: !0,
        sf: !0,
        tab: !0,
      }
    );
  }
  function Sw(e) {
    let [t, r] = e;
    return t === 'enableQuerySyntax'
      ? [t, r === 'true']
      : t === 'debug'
      ? [t, r === 'true']
      : t === 'firstResult'
      ? [t, parseInt(r)]
      : t === 'numberOfResults'
      ? [t, parseInt(r)]
      : tC(t)
      ? [t, yw(r)]
      : [t, decodeURIComponent(r)];
  }
  function yw(e) {
    let t = JSON.parse(e),
      r = {};
    return (
      Object.entries(t).forEach((a) => {
        let [n, o] = a;
        r[n] = o.map((i) => (Ya(i) ? decodeURIComponent(i) : i));
      }),
      r
    );
  }
  function tC(e) {
    return ['f', 'cf', 'nf', 'df', 'sf'].includes(e);
  }
  var vw = new Z({fragment: new O()});
  function rC(e, t) {
    let r;
    function a() {
      r = e.state.search.requestId;
    }
    function n() {
      return r !== e.state.search.requestId;
    }
    if (!xw(e)) throw D;
    we(e, vw, t.initialState, 'buildUrlManager');
    let o = B(e),
      i = t.initialState.fragment;
    a();
    let s = Gu(e, {initialState: {parameters: Xu(i)}});
    return {
      ...o,
      subscribe(u) {
        let c = () => {
          let l = this.state.fragment;
          !Cw(i, l) && n() && ((i = l), u()), a();
        };
        return c(), e.subscribe(c);
      },
      get state() {
        return {fragment: Li().serialize(s.state.parameters)};
      },
      synchronize(u) {
        i = u;
        let c = Xu(u);
        s.synchronize(c);
      },
    };
  }
  function Cw(e, t) {
    if (e === t) return !0;
    let r = Xu(e),
      a = Xu(t);
    return Yc(r, a);
  }
  function Xu(e) {
    return Li().deserialize(e);
  }
  function xw(e) {
    return e.addReducers({configuration: W}), !0;
  }
  function aC(e) {
    return Lo(e);
  }
  var nC = (e) =>
    Q('analytics/resultPreview/open', M.Click, (t, r) => {
      _e(e);
      let a = Ve(e, r),
        n = Le(e);
      return t.makeDocumentQuickview(a, n);
    });
  function oC(e, t, r, a, n) {
    if (!Rw(e)) throw D;
    let {dispatch: o} = e,
      i = () => e.state,
      s = B(e),
      {result: u, maximumPreviewSize: c} = t.options,
      l = () => {
        let {resultsWithPreview: f, position: d} = i().resultPreview;
        return f[d];
      },
      p = (f) => {
        t.options.onlyContentURL
          ? o(
              yo({
                uniqueId: f,
                requestedOutputSize: c,
                buildResultPreviewRequest: r,
                path: a,
              })
            )
          : o(Ma({uniqueId: f, requestedOutputSize: c})),
          n && n();
      };
    return {
      ...s,
      fetchResultContent() {
        p(u.uniqueId);
      },
      next() {
        o(go()), p(l());
      },
      previous() {
        o(ho()), p(l());
      },
      get state() {
        let f = i(),
          d = u.hasHtmlVersion,
          m = f.resultPreview,
          h = u.uniqueId === m.uniqueId ? m.content : '',
          v = m.isLoading,
          C = m.contentURL,
          x = l();
        return {
          content: h,
          resultHasPreview: d,
          isLoading: v,
          contentURL: C,
          currentResultUniqueId: x,
        };
      },
    };
  }
  function Rw(e) {
    return e.addReducers({configuration: W, resultPreview: du}), !0;
  }
  function iC(e, t) {
    if (!bw(e)) throw D;
    let {dispatch: r} = e,
      a = () => e.state,
      n = () => a().search.results,
      s = oC(e, t, Xc, '/html', () => {
        e.dispatch(nC(t.options.result));
      });
    return (
      r(So({results: n()})),
      {
        ...s,
        get state() {
          return {
            ...s.state,
            currentResult:
              n().findIndex(
                (u) => u.uniqueId === s.state.currentResultUniqueId
              ) + 1,
            totalResults: n().length,
          };
        },
      }
    );
  }
  function bw(e) {
    return e.addReducers({search: G}), !0;
  }
  var Fw = new Z(ip);
  function sC(e, t = {}) {
    var i;
    if (!Aw(e)) throw D;
    let r = Mu(e, t),
      {dispatch: a} = e,
      n = () => e.state,
      o = ((i = t.options) == null ? void 0 : i.folding)
        ? pe(e, Fw, t.options.folding, 'buildFoldedResultList')
        : {};
    return (
      a(ta({...o})),
      {
        ...r,
        loadCollection: (s) => {
          a(ra(s.result.raw[e.state.folding.fields.collection])),
            a(sp(s.result));
        },
        logShowMoreFoldedResults: (s) => {
          a(sp(s));
        },
        logShowLessFoldedResults: () => {
          a(IS());
        },
        findResultById(s) {
          return Dp(
            this.state.results,
            (u) => u.result.uniqueId === s.result.uniqueId
          );
        },
        findResultByCollection(s) {
          return Dp(
            this.state.results,
            (u) =>
              u.result.raw.foldingcollection === s.result.raw.foldingcollection
          );
        },
        get state() {
          let s = n();
          return {
            ...r.state,
            results: r.state.results.map((u) => {
              let c = u.raw[s.folding.fields.collection];
              return !c || !s.folding.collections[c]
                ? {
                    result: u,
                    moreResultsAvailable: !1,
                    isLoadingMoreResults: !1,
                    children: [],
                  }
                : s.folding.collections[c];
            }),
          };
        },
      }
    );
  }
  function Aw(e) {
    return (
      e.addReducers({search: G, configuration: W, folding: ru, query: mt}), !0
    );
  }
  function Dp(e, t) {
    for (let r = 0; r < e.length; r++) {
      let a = e[r];
      if (t(a)) return a;
      if (a.children.length) {
        let n = Dp(a.children, t);
        if (n) return n;
      }
    }
    return null;
  }
  function cC(e) {
    if (!Pw(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = a().triggers.redirectTo;
    return {
      ...t,
      subscribe(o) {
        let i = () => {
          let s = n !== this.state.redirectTo;
          (n = this.state.redirectTo),
            s && this.state.redirectTo && (o(), r(ks()));
        };
        return i(), e.subscribe(i);
      },
      get state() {
        return {redirectTo: a().triggers.redirectTo};
      },
    };
  }
  function Pw(e) {
    return e.addReducers({triggers: la}), !0;
  }
  function uC(e) {
    if (!Iw(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = () => a().triggers.queryModification.newQuery,
      o = () => a().triggers.queryModification.originalQuery;
    return {
      ...t,
      get state() {
        return {
          newQuery: n(),
          originalQuery: o(),
          wasQueryModified: n() !== '',
        };
      },
      undo() {
        r(Cn(n())), r(it({q: o()})), r(T(Es({undoneQuery: n()})));
      },
    };
  }
  function Iw(e) {
    return e.addReducers({triggers: la, query: mt}), !0;
  }
  function lC(e) {
    if (!Ew(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = a().triggers.executions;
    return {
      ...t,
      subscribe(o) {
        let i = () => {
          let s = !Va(
            this.state.executions,
            n,
            (u, c) =>
              u.functionName === c.functionName && Va(u.params, c.params)
          );
          (n = this.state.executions),
            s && this.state.executions.length && (o(), r(Os()));
        };
        return i(), e.subscribe(i);
      },
      get state() {
        return {executions: a().triggers.executions};
      },
    };
  }
  function Ew(e) {
    return e.addReducers({triggers: la}), !0;
  }
  function dC(e) {
    if (!ww(e)) throw D;
    let t = B(e),
      {dispatch: r} = e,
      a = () => e.state,
      n = a().triggers.notifications;
    return {
      ...t,
      subscribe(o) {
        let i = () => {
          let s = !Va(n, this.state.notifications);
          (n = this.state.notifications), s && (o(), r(ws()));
        };
        return i(), e.subscribe(i);
      },
      get state() {
        return {notifications: a().triggers.notifications};
      },
    };
  }
  function ww(e) {
    return e.addReducers({triggers: la}), !0;
  }
  function Pr(e, t) {
    var a, n;
    let r =
      t != null
        ? t
        : (n = (a = e.search) == null ? void 0 : a.questionAnswer) == null
        ? void 0
        : n.documentId;
    return r && e.search && kh(e, r.contentIdKey, r.contentIdValue);
  }
  function La(e, t) {
    var n, o, i, s, u;
    let r =
      (o =
        (n = e.questionAnswering) == null
          ? void 0
          : n.relatedQuestions.findIndex((c) => c.questionAnswerId === t)) !=
      null
        ? o
        : -1;
    if (r === -1) return null;
    let a =
      (u =
        (s = (i = e.search) == null ? void 0 : i.questionAnswer) == null
          ? void 0
          : s.relatedQuestions) == null
        ? void 0
        : u[r];
    return a != null ? a : null;
  }
  var Zu = () =>
      Q('analytics/smartSnippet/expand', M.Custom, (e) =>
        e.makeExpandSmartSnippet()
      ),
    el = () =>
      Q('analytics/smartSnippet/collapse', M.Custom, (e) =>
        e.makeCollapseSmartSnippet()
      ),
    tl = () =>
      Q('analytics/smartSnippet/like', M.Custom, (e) =>
        e.makeLikeSmartSnippet()
      ),
    rl = () =>
      Q('analytics/smartSnippet/dislike', M.Custom, (e) =>
        e.makeDislikeSmartSnippet()
      );
  function al() {
    return Q('analytics/smartSnippet/source/open', M.Click, (e, t) => {
      let r = Pr(t);
      return e.makeOpenSmartSnippetSource(Ve(r, t), Le(r));
    });
  }
  var nl = (e) =>
      Q('analytics/smartSnippet/source/open', M.Click, (t, r) => {
        y(e, mp());
        let a = Pr(r);
        return t.makeOpenSmartSnippetInlineLink(Ve(a, r), {...Le(a), ...e});
      }),
    ol = () =>
      Q('analytics/smartSnippet/feedbackModal/open', M.Custom, (e) =>
        e.makeOpenSmartSnippetFeedbackModal()
      ),
    il = () =>
      Q('analytics/smartSnippet/feedbackModal/close', M.Custom, (e) =>
        e.makeCloseSmartSnippetFeedbackModal()
      ),
    sl = (e) =>
      Q('analytics/smartSnippet/sendFeedback', M.Custom, (t) =>
        t.makeSmartSnippetFeedbackReason(e)
      ),
    cl = (e) =>
      Q('analytics/smartSnippet/sendFeedback', M.Custom, (t) =>
        t.makeSmartSnippetFeedbackReason('other', e)
      ),
    ul = (e) =>
      Q('analytics/smartSnippetSuggestion/expand', M.Custom, (t, r) => {
        ro(e);
        let a = La(r, e.questionAnswerId);
        return a
          ? t.makeExpandSmartSnippetSuggestion({
              question: a.question,
              answerSnippet: a.answerSnippet,
              documentId: a.documentId,
            })
          : null;
      }),
    ll = (e) =>
      Q('analytics/smartSnippetSuggestion/expand', M.Custom, (t, r) => {
        ro(e);
        let a = La(r, e.questionAnswerId);
        return a
          ? t.makeCollapseSmartSnippetSuggestion({
              question: a.question,
              answerSnippet: a.answerSnippet,
              documentId: a.documentId,
            })
          : null;
      }),
    dl = (e) =>
      Q('analytics/smartSnippet/source/open', M.Click, (t, r) => {
        y(e, Jc());
        let a = La(r, e.questionAnswerId);
        if (!a) return null;
        let n = Pr(r, a.documentId);
        return n
          ? t.makeOpenSmartSnippetSuggestionSource(Ve(n, r), {
              question: a.question,
              answerSnippet: a.answerSnippet,
              documentId: a.documentId,
            })
          : null;
      }),
    pl = (e, t) =>
      Q('analytics/smartSnippet/source/open', M.Click, (r, a) => {
        y(e, Jc()), y(t, mp());
        let n = La(a, e.questionAnswerId);
        if (!n) return null;
        let o = Pr(a, n.documentId);
        return o
          ? r.makeOpenSmartSnippetSuggestionInlineLink(Ve(o, a), {
              question: n.question,
              answerSnippet: n.answerSnippet,
              documentId: n.documentId,
              linkText: t.linkText,
              linkURL: t.linkURL,
            })
          : null;
      });
  function fl(e, t) {
    if (!kw(e)) throw D;
    let r = () => e.state,
      a = new Set(),
      n = (l) => (a.has(l) ? !0 : (a.add(l), !1)),
      o = null,
      i = (l) => {
        o !== l && ((o = l), (u = {}), a.clear());
      },
      s = (l, p, f) => {
        var d;
        return gt(
          e,
          {
            options: {
              selectionDelay:
                (d = t == null ? void 0 : t.options) == null
                  ? void 0
                  : d.selectionDelay,
            },
          },
          () => {
            n(p) || e.dispatch(f ? pl({questionAnswerId: f}, l) : nl(l));
          }
        );
      },
      u = {},
      c = (l, p) => {
        let {searchResponseId: f} = r().search;
        i(f);
        let d = an({...l, questionAnswerId: p});
        return d in u || (u[d] = s(l, d, p)), u[d];
      };
    return {
      selectInlineLink(l, p) {
        var f;
        (f = c(l, p)) == null || f.select();
      },
      beginDelayedSelectInlineLink(l, p) {
        var f;
        (f = c(l, p)) == null || f.beginDelayedSelect();
      },
      cancelPendingSelectInlineLink(l, p) {
        var f;
        (f = c(l, p)) == null || f.cancelPendingSelect();
      },
    };
  }
  function kw(e) {
    return e.addReducers({search: G, questionAnswering: dr}), !0;
  }
  function pC(e, t) {
    var u, c;
    if (!Ow(e)) throw D;
    let r = B(e),
      a = () => e.state,
      n = () => Pr(a()),
      o = null,
      i = gt(
        e,
        {
          options: {
            selectionDelay:
              (u = t == null ? void 0 : t.options) == null
                ? void 0
                : u.selectionDelay,
          },
        },
        () => {
          let l = n();
          if (!l) {
            o = null;
            return;
          }
          let {searchResponseId: p} = a().search;
          o !== p && ((o = p), e.dispatch(al()), e.dispatch(pt(l)));
        }
      ),
      s = fl(e, {
        options: {
          selectionDelay:
            (c = t == null ? void 0 : t.options) == null
              ? void 0
              : c.selectionDelay,
        },
      });
    return {
      ...r,
      get state() {
        let l = a();
        return {
          question: l.search.questionAnswer.question,
          answer: l.search.questionAnswer.answerSnippet,
          documentId: l.search.questionAnswer.documentId,
          expanded: l.questionAnswering.expanded,
          answerFound: l.search.questionAnswer.answerSnippet !== '',
          liked: l.questionAnswering.liked,
          disliked: l.questionAnswering.disliked,
          feedbackModalOpen: l.questionAnswering.feedbackModalOpen,
          source: n(),
        };
      },
      expand() {
        e.dispatch(Zu()), e.dispatch(ao());
      },
      collapse() {
        e.dispatch(el()), e.dispatch(no());
      },
      like() {
        e.dispatch(tl()), e.dispatch(oo());
      },
      dislike() {
        e.dispatch(rl()), e.dispatch(io());
      },
      openFeedbackModal() {
        e.dispatch(ol()), e.dispatch(so());
      },
      closeFeedbackModal() {
        e.dispatch(il()), e.dispatch(sa());
      },
      sendFeedback(l) {
        e.dispatch(sl(l)), e.dispatch(sa());
      },
      sendDetailedFeedback(l) {
        e.dispatch(cl(l)), e.dispatch(sa());
      },
      selectSource() {
        i.select();
      },
      beginDelayedSelectSource() {
        i.beginDelayedSelect();
      },
      cancelPendingSelectSource() {
        i.cancelPendingSelect();
      },
      selectInlineLink(l) {
        s.selectInlineLink(l);
      },
      beginDelayedSelectInlineLink(l) {
        s.beginDelayedSelectInlineLink(l);
      },
      cancelPendingSelectInlineLink(l) {
        s.cancelPendingSelectInlineLink(l);
      },
    };
  }
  function Ow(e) {
    return e.addReducers({search: G, questionAnswering: dr}), !0;
  }
  function fC(e, t) {
    if (!qw(e)) throw D;
    let r = () => e.state,
      a = (p) => {
        let f = r(),
          d = La(f, p);
        return d ? Pr(f, d.documentId) : null;
      },
      n = new Set(),
      o = (p) => (n.has(p) ? !0 : (n.add(p), !1)),
      i = null,
      s = (p) => {
        i !== p && ((i = p), (c = {}), n.clear());
      },
      u = (p, f) => {
        var d;
        return gt(
          e,
          {
            options: {
              selectionDelay:
                (d = t == null ? void 0 : t.options) == null
                  ? void 0
                  : d.selectionDelay,
            },
          },
          () => {
            o(f) || (e.dispatch(dl({questionAnswerId: f})), e.dispatch(pt(p)));
          }
        );
      },
      c = {},
      l = (p) => {
        let {searchResponseId: f} = r().search;
        s(f);
        let d = a(p);
        return d ? (p in c || (c[p] = u(d, p)), c[p]) : null;
      };
    return {
      selectSource(p) {
        var f;
        (f = l(p)) == null || f.select();
      },
      beginDelayedSelectSource(p) {
        var f;
        (f = l(p)) == null || f.beginDelayedSelect();
      },
      cancelPendingSelectSource(p) {
        var f;
        (f = l(p)) == null || f.cancelPendingSelect();
      },
    };
  }
  function qw(e) {
    return e.addReducers({search: G, questionAnswering: dr}), !0;
  }
  function mC(e, t) {
    var s, u;
    if (!Tw(e)) throw D;
    let r = B(e),
      a = () => e.state,
      n = (c) => {
        let {contentIdKey: l, contentIdValue: p} = c;
        return e.state.search.results.find((f) => Cr(f, l) === p);
      },
      o = fC(e, {
        options: {
          selectionDelay:
            (s = t == null ? void 0 : t.options) == null
              ? void 0
              : s.selectionDelay,
        },
      }),
      i = fl(e, {
        options: {
          selectionDelay:
            (u = t == null ? void 0 : t.options) == null
              ? void 0
              : u.selectionDelay,
        },
      });
    return {
      ...r,
      get state() {
        let c = a();
        return {
          questions: c.search.questionAnswer.relatedQuestions.map((l, p) => ({
            question: l.question,
            answer: l.answerSnippet,
            documentId: l.documentId,
            questionAnswerId:
              c.questionAnswering.relatedQuestions[p].questionAnswerId,
            expanded: c.questionAnswering.relatedQuestions[p].expanded,
            source: n(l.documentId),
          })),
        };
      },
      expand(c) {
        let l = {questionAnswerId: c};
        e.dispatch(ul(l)), e.dispatch(co(l));
      },
      collapse(c) {
        let l = {questionAnswerId: c};
        e.dispatch(ll(l)), e.dispatch(uo(l));
      },
      selectSource(c) {
        o.selectSource(c);
      },
      beginDelayedSelectSource(c) {
        o.beginDelayedSelectSource(c);
      },
      cancelPendingSelectSource(c) {
        o.cancelPendingSelectSource(c);
      },
      selectInlineLink(c, l) {
        i.selectInlineLink(l, c);
      },
      beginDelayedSelectInlineLink(c, l) {
        i.beginDelayedSelectInlineLink(l, c);
      },
      cancelPendingSelectInlineLink(c, l) {
        i.cancelPendingSelectInlineLink(l, c);
      },
    };
  }
  function Tw(e) {
    return e.addReducers({search: G, questionAnswering: dr}), !0;
  }
  var gC = () =>
      Q('analytics/recentQueries/clear', M.Custom, (e) =>
        e.makeClearRecentQueries()
      ),
    hC = () =>
      Q('analytics/recentQueries/click', M.Search, (e) =>
        e.makeRecentQueryClick()
      );
  var Dw = {queries: []},
    Vw = {maxLength: 10, clearFilters: !0},
    Nw = new Z({queries: new K({required: !0})}),
    Mw = new Z({
      maxLength: new U({required: !0, min: 1}),
      clearFilters: new J(),
    });
  function Qw(e, t) {
    pe(e, Mw, t == null ? void 0 : t.options, 'buildRecentQueriesList'),
      we(e, Nw, t == null ? void 0 : t.initialState, 'buildRecentQueriesList');
  }
  function SC(e, t) {
    if (!Lw(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = {...Vw, ...(t == null ? void 0 : t.options)},
      i = {...Dw, ...(t == null ? void 0 : t.initialState)};
    Qw(e, {options: o, initialState: i});
    let s = {queries: i.queries, maxLength: o.maxLength};
    return (
      a(lo(s)),
      {
        ...r,
        get state() {
          let u = n();
          return {
            ...u.recentQueries,
            analyticsEnabled: u.configuration.analytics.enabled,
          };
        },
        clear() {
          a(gC()), a(po());
        },
        executeRecentQuery(u) {
          let c = new U({
            required: !0,
            min: 0,
            max: this.state.queries.length,
          }).validate(u);
          if (c) throw new Error(c);
          a(Ms({q: this.state.queries[u], clearFilters: o.clearFilters})),
            a(T(hC()));
        },
      }
    );
  }
  function Lw(e) {
    return e.addReducers({search: G, recentQueries: mu}), !0;
  }
  var yC = (e) =>
      Q(
        'analytics/recentResults/click',
        M.Custom,
        (t, r) => (_e(e), t.makeRecentResultClick(Ve(e, r), Le(e)))
      ),
    vC = () =>
      Q('analytics/recentResults/clear', M.Custom, (e) =>
        e.makeClearRecentResults()
      );
  var jw = {initialState: {results: []}, options: {maxLength: 10}},
    Uw = new Z({results: new K({required: !0})}),
    Bw = new Z({maxLength: new U({required: !0, min: 1})});
  function _w(e, t) {
    pe(e, Bw, t == null ? void 0 : t.options, 'buildRecentResultsList'),
      we(e, Uw, t == null ? void 0 : t.initialState, 'buildRecentResultsList');
  }
  function CC(e, t) {
    if (!$w(e)) throw D;
    let r = B(e),
      {dispatch: a} = e,
      n = () => e.state,
      o = {...jw, ...t};
    _w(e, o);
    let i = {results: o.initialState.results, maxLength: o.options.maxLength};
    return (
      a(fo(i)),
      {
        ...r,
        get state() {
          return n().recentResults;
        },
        clear() {
          a(vC()), a(mo());
        },
      }
    );
  }
  function $w(e) {
    return e.addReducers({recentResults: fu}), !0;
  }
  function xC(e, t) {
    return gt(e, t, () => e.dispatch(yC(t.options.result)));
  }
  function RC(e, t) {
    if (!Hw(e)) throw D;
    let r = (f) => {
        var d, m;
        return (m =
          (d = e.state.facetOptions.facets[f]) == null ? void 0 : d.enabled) !=
          null
          ? m
          : !1;
      },
      a = (f) => {
        var d, m, h, v, C, x, b, P, _, X, H, I, $, ne, N, A;
        return (A =
          (N =
            (H =
              (b =
                (h =
                  (m = (d = e.state.facetSet) == null ? void 0 : d[f]) == null
                    ? void 0
                    : m.request) == null
                  ? void 0
                  : h.currentValues) != null
                ? b
                : (x =
                    (C =
                      (v = e.state.categoryFacetSet) == null ? void 0 : v[f]) ==
                    null
                      ? void 0
                      : C.request) == null
                ? void 0
                : x.currentValues) != null
              ? H
              : (X =
                  (_ = (P = e.state.numericFacetSet) == null ? void 0 : P[f]) ==
                  null
                    ? void 0
                    : _.request) == null
              ? void 0
              : X.currentValues) != null
            ? N
            : (ne =
                ($ = (I = e.state.dateFacetSet) == null ? void 0 : I[f]) == null
                  ? void 0
                  : $.request) == null
            ? void 0
            : ne.currentValues) != null
          ? A
          : null;
      },
      n = (f) => f in e.state.facetOptions.facets,
      o = () =>
        an({
          isFacetRegistered: n(t.facetId),
          parentFacets: t.conditions.map(({parentFacetId: f}) =>
            n(f) ? {enabled: r(f), values: a(f)} : null
          ),
        }),
      i = () => {
        let f = o();
        return f === l ? !1 : ((l = f), !0);
      },
      s = () =>
        t.conditions.some((f) => {
          if (!r(f.parentFacetId)) return !1;
          let d = a(f.parentFacetId);
          return d === null ? !1 : f.condition(d);
        }),
      u = () => {
        e.state.facetSet &&
          Object.entries(e.state.facetSet).forEach(
            ([f, d]) =>
              d.request.freezeCurrentValues &&
              e.dispatch(Jr({facetId: f, freezeCurrentValues: !1}))
          );
      },
      c = () => {
        if (!n(t.facetId)) return;
        let f = r(t.facetId),
          d = s();
        f !== d && (e.dispatch(d ? je(t.facetId) : ye(t.facetId)), u());
      };
    if (!t.conditions.length) return {stopWatching() {}};
    let l = o(),
      p = e.subscribe(() => {
        i() && c();
      });
    return (
      c(),
      {
        stopWatching() {
          p();
        },
      }
    );
  }
  function Hw(e) {
    return e.addReducers({facetOptions: Oe}), !0;
  }
  function bC(e, t) {
    if (!zw(e)) throw D;
    let {facetSearch: r, allowedValues: a, ...n} = t.options.facet,
      o = Be(e, n);
    e.dispatch(
      Xt({
        ...qi,
        ...n,
        facetId: o,
        ...(a && {allowedValues: {type: 'simple', values: a}}),
      })
    );
    let i = yu(e, {
      options: {...r, facetId: o},
      select: (u) => {
        e.dispatch(se({freezeFacetOrder: !0})),
          e.dispatch(T(Re({facetId: o, facetValue: u.rawValue})));
      },
      isForFieldSuggestions: !0,
    });
    return {
      ...B(e),
      ...i,
      updateText: function (u) {
        i.updateText(u), i.search();
      },
      get state() {
        return i.state;
      },
    };
  }
  function zw(e) {
    return (
      e.addReducers({
        facetSet: cr,
        configuration: W,
        facetSearchSet: Eo,
        search: G,
      }),
      !0
    );
  }
  function FC(e, t) {
    if (!Ww(e)) throw D;
    let {facetSearch: r, ...a} = t.options.facet,
      n = Be(e, a);
    e.dispatch(zt({...ki, ...a, facetId: n}));
    let o = Su(e, {options: {...r, facetId: n}, isForFieldSuggestions: !0});
    return {
      ...B(e),
      ...o,
      updateText: function (s) {
        o.updateText(s), o.search();
      },
      get state() {
        return o.state;
      },
    };
  }
  function Ww(e) {
    return (
      e.addReducers({
        categoryFacetSet: lr,
        configuration: W,
        categoryFacetSearchSet: wo,
        search: G,
      }),
      !0
    );
  }
  function Yw(e) {
    return (
      e.addReducers({advancedSearchQueries: Sy}),
      {updateAdvancedSearchQueries: hc, registerAdvancedSearchQueries: Sc}
    );
  }
  function Kw(e) {
    return (
      e.addReducers({categoryFacetSet: lr}),
      {
        deselectAllCategoryFacetValues: Wt,
        registerCategoryFacet: zt,
        toggleSelectCategoryFacetValue: Gr,
        updateCategoryFacetNumberOfValues: ka,
        updateCategoryFacetSortCriterion: Mn,
        updateFacetAutoSelection: Lt,
      }
    );
  }
  function Gw(e) {
    return (
      e.addReducers({facetSet: cr}),
      {
        deselectAllFacetValues: xe,
        registerFacet: Xt,
        toggleSelectFacetValue: Zt,
        updateFacetIsFieldExpanded: qa,
        updateFacetNumberOfValues: Oa,
        updateFacetSortCriterion: Ln,
        updateFreezeCurrentValues: Jr,
        updateFacetAutoSelection: Lt,
      }
    );
  }
  function Jw(e) {
    return (
      e.addReducers({configuration: W}),
      {
        disableAnalytics: In,
        enableAnalytics: En,
        setOriginLevel2: pc,
        setOriginLevel3: fc,
        updateAnalyticsConfiguration: Wr,
        updateBasicConfiguration: Ht,
      }
    );
  }
  function Xw(e) {
    return (
      e.addReducers({configuration: W, pipeline: qo, searchHub: To}),
      {updateSearchConfiguration: lt}
    );
  }
  function Zw(e) {
    return (
      e.addReducers({context: cu}),
      {addContext: On, removeContext: qn, setContext: kn}
    );
  }
  function ek(e) {
    return (
      e.addReducers({dictionaryFieldContext: uu}),
      {addContext: Vn, removeContext: Nn, setContext: Dn}
    );
  }
  function tk(e) {
    return e.addReducers({debug: Do}), {disableDebug: Tn, enableDebug: Kr};
  }
  function rk(e) {
    return (
      e.addReducers({dateFacetSet: ur}),
      {
        deselectAllDateFacetValues: Ic,
        registerDateFacet: er,
        toggleSelectDateFacetValue: tr,
        updateDateFacetSortCriterion: Pc,
        updateDateFacetValues: Rr,
      }
    );
  }
  function ak(e) {
    return (
      e.addReducers({facetOptions: Oe}),
      {updateFacetOptions: se, enableFacet: je, disableFacet: ye}
    );
  }
  function nk(e) {
    return (
      e.addReducers({didYouMean: lu, query: mt}),
      {
        applyDidYouMeanCorrection: Ut,
        disableDidYouMean: ys,
        enableDidYouMean: hn,
      }
    );
  }
  function ok(e) {
    return (
      e.addReducers({fields: ua}),
      {
        registerFieldsToInclude: aa,
        enableFetchAllFields: Jn,
        disableFetchAllFields: Da,
        fetchFieldsDescription: Xn,
      }
    );
  }
  function ik(e) {
    return (
      e.addReducers({history: gu, facetOrder: au}), {back: vi, forward: Cs}
    );
  }
  function sk(e) {
    return (
      e.addReducers({numericFacetSet: ft}),
      {
        deselectAllNumericFacetValues: kc,
        registerNumericFacet: rr,
        toggleSelectNumericFacetValue: ar,
        updateNumericFacetSortCriterion: wc,
        updateNumericFacetValues: br,
      }
    );
  }
  function ck(e) {
    return (
      e.addReducers({folding: ru}), {registerFolding: ta, loadCollection: ra}
    );
  }
  function uk(e) {
    return (
      e.addReducers({pagination: sr}),
      {
        nextPage: fn,
        previousPage: mn,
        registerNumberOfResults: ln,
        registerPage: pn,
        updateNumberOfResults: dn,
        updatePage: jt,
      }
    );
  }
  function lk(e) {
    return e.addReducers({pipeline: qo}), {setPipeline: Zn};
  }
  function dk(e) {
    return e.addReducers({query: mt}), {updateQuery: it};
  }
  function pk(e) {
    return (
      e.addReducers({querySet: ko}),
      {registerQuerySetQuery: to, updateQuerySetQuery: Na}
    );
  }
  function fk(e) {
    return (
      e.addReducers({instantResults: ou}),
      {
        registerInstantResults: cn,
        updateInstantResultsQuery: jr,
        clearExpiredResults: un,
      }
    );
  }
  function mk(e) {
    return (
      e.addReducers({querySuggest: Oo, querySet: ko}),
      {
        clearQuerySuggest: oa,
        fetchQuerySuggestions: ia,
        registerQuerySuggest: eo,
        selectQuerySuggestion: ir,
      }
    );
  }
  function gk(e) {
    return (
      e.addReducers({search: G}),
      {
        executeSearch: T,
        fetchMoreResults: ut,
        fetchFacetValues: Ke,
        fetchPage: Ye,
        fetchInstantResults: $r,
      }
    );
  }
  function hk(e) {
    return e.addReducers({searchHub: To}), {setSearchHub: na};
  }
  function Sk(e) {
    return (
      e.addReducers({sortCriteria: su}),
      {registerSortCriterion: vo, updateSortCriterion: Co}
    );
  }
  function yk(e) {
    return (
      e.addReducers({standaloneSearchBoxSet: pu}),
      {
        registerStandaloneSearchBox: xo,
        fetchRedirectUrl: ca,
        updateAnalyticsToSearchFromLink: bo,
        updateAnalyticsToOmniboxFromLink: Fo,
        resetStandaloneSearchBox: Ro,
      }
    );
  }
  function vk(e) {
    return (
      e.addReducers({staticFilterSet: nu}),
      {
        registerStaticFilter: Po,
        toggleSelectStaticFilterValue: Fr,
        deselectAllStaticFilterValues: Qa,
      }
    );
  }
  function Ck(e) {
    return e.addReducers({tabSet: iu}), {registerTab: wn, updateActiveTab: xr};
  }
  function xk(e) {
    return (
      e.addReducers({questionAnswering: dr}),
      {
        collapseSmartSnippet: no,
        expandSmartSnippet: ao,
        dislikeSmartSnippet: io,
        likeSmartSnippet: oo,
        openFeedbackModal: so,
        closeFeedbackModal: sa,
        expandSmartSnippetRelatedQuestion: co,
        collapseSmartSnippetRelatedQuestion: uo,
      }
    );
  }
  function Rk(e) {
    return (
      e.addReducers({}),
      {deselectAllBreadcrumbs: ke, deselectAllNonBreadcrumbs: sn}
    );
  }
  function bk(e) {
    return (
      e.addReducers({recentQueries: mu}),
      {registerRecentQueries: lo, clearRecentQueries: po}
    );
  }
  function Fk(e) {
    return (
      e.addReducers({recentResults: fu}),
      {registerRecentResults: fo, clearRecentResults: mo, pushRecentResult: pt}
    );
  }
  function Ak(e) {
    return e.addReducers({excerptLength: vy}), {setExcerptLength: xc};
  }
  function Pk(e) {
    return (
      e.addReducers({resultPreview: du}),
      {
        fetchResultContent: Ma,
        updateContentURL: yo,
        nextPreview: go,
        previousPreview: ho,
        preparePreviewPagination: So,
      }
    );
  }
  var Ik = new Z({
    content: new de({required: !0}),
    conditions: new de({required: !0}),
    priority: new U({required: !1, default: 0, min: 0}),
    fields: new K({required: !1, each: q}),
  });
  function AC(e) {
    if (!Ek(e)) throw D;
    let t = [],
      r = (a) => {
        a.forEach((n) => {
          if (
            (Ik.validate(n), !n.conditions.every((i) => i instanceof Function))
          )
            throw new ga(
              'Each result template conditions should be a function that takes a result as an argument and returns a boolean'
            );
        });
      };
    return {
      registerTemplates(...a) {
        let n = [];
        r(a),
          a.forEach((o) => {
            let i = {...o, priority: o.priority || 0, fields: o.fields || []};
            t.push(i), n.push(...i.fields);
          }),
          t.sort((o, i) => i.priority - o.priority),
          n.length && e.dispatch(aa(n));
      },
      selectTemplate(a) {
        let n = t.find((o) => o.conditions.every((i) => i(a)));
        return n ? n.content : null;
      },
    };
  }
  function Ek(e) {
    return e.addReducers({fields: ua}), !0;
  }
  var Vp;
  ((o) => {
    (o.getResultProperty = Cr),
      (o.fieldsMustBeDefined = Ah),
      (o.fieldsMustNotBeDefined = Ph),
      (o.fieldMustMatch = Ih),
      (o.fieldMustNotMatch = Eh);
  })(Vp || (Vp = {}));
  function wk(e) {
    return (
      e.addReducers({}),
      {
        logClearBreadcrumbs: _u,
        logInterfaceLoad: uc,
        logSearchFromLink: lc,
        logOmniboxFromLink: dc,
        logInterfaceChange: zr,
        logDidYouMeanClick: vs,
        logCategoryFacetBreadcrumb: Bu,
        logFacetBreadcrumb: Lc,
        logFacetClearAll: Ue,
        logFacetDeselect: Et,
        logFacetSelect: Re,
        logFacetShowLess: Yn,
        logFacetShowMore: Wn,
        logFacetUpdateSort: or,
        logDateFacetBreadcrumb: Hu,
        logNumericFacetBreadcrumb: zu,
        logNavigateBackward: qu,
        logNavigateForward: Ou,
        logPageNext: Vu,
        logPageNumber: Qo,
        logPagePrevious: Nu,
        logPagerResize: Mo,
        logSearchboxSubmit: da,
        logQuerySuggestionClick: Lu,
        logResultsSort: jo,
        logDislikeSmartSnippet: rl,
        logLikeSmartSnippet: tl,
        logOpenSmartSnippetFeedbackModal: ol,
        logCloseSmartSnippetFeedbackModal: il,
        logSmartSnippetFeedback: sl,
        logSmartSnippetDetailedFeedback: cl,
        logExpandSmartSnippet: Zu,
        logCollapseSmartSnippet: el,
        logExpandSmartSnippetSuggestion: ul,
        logCollapseSmartSnippetSuggestion: ll,
        logNoResultsBack: Tu,
        logStaticFilterSelect: eu,
        logStaticFilterDeselect: Io,
        logStaticFilterClearAll: tu,
        logTriggerQuery: Is,
        logUndoTriggerQuery: Es,
        logNotifyTrigger: ws,
        logTriggerRedirect: ks,
        logTriggerExecute: Os,
      }
    );
  }
  function kk(e) {
    return (
      e.addReducers({}),
      {
        logDocumentOpen: Qu,
        logOpenSmartSnippetSource: al,
        logOpenSmartSnippetSuggestionSource: dl,
        logOpenSmartSnippetInlineLink: nl,
        logOpenSmartSnippetSuggestionInlineLink: pl,
      }
    );
  }
  function Ok(e) {
    return (
      e.addReducers({}),
      {logSearchEvent: xh, logClickEvent: Rh, logCustomEvent: bh}
    );
  }
  function qk(e) {
    let {by: t, order: r} = e;
    switch (t) {
      case Pt.Relevancy:
        return vn();
      case Pt.QRE:
        return Fs();
      case Pt.NoSort:
        return As();
      case Pt.Date:
        if (!r)
          throw new Error(
            'An order (i.e., ascending or descending) should be specified for a sort criterion sorted by "date"'
          );
        return Rs(r);
      default:
        if (!r)
          throw new Error(
            `An order (i.e., ascending or descending) should be specified for a sort criterion sorted by a field, such as "${t}"`
          );
        return bs(t, r);
    }
  }
  function Tk(e) {
    return e === void 0 || e === yr.Ascending || e === yr.Descending;
  }
  function PC(e) {
    let t = e.split(','),
      r = new Error(`Wrong criterion expression format for "${e}"`);
    if (!t.length) throw r;
    return t.map((a) => {
      let n = a.trim().split(' '),
        o = n[0].toLowerCase(),
        i = n[1] && n[1].toLowerCase();
      if (n.length > 2 || o === '') throw r;
      if (!Tk(i))
        throw new Error(
          `Wrong criterion sort order "${i}" in expression "${e}". Order should either be "${yr.Ascending}" or "${yr.Descending}"`
        );
      return qk({by: o, order: i});
    });
  }
  function qe(e) {
    return e.negate ? 'NOT ' : '';
  }
  function ht(e) {
    return {
      contains: '=',
      differentThan: '<>',
      fuzzyMatch: '~=',
      greaterThan: '>',
      greaterThanOrEqual: '>=',
      isExactly: '==',
      lowerThan: '<',
      lowerThanOrEqual: '<=',
      phoneticMatch: '%=',
      regexMatch: '/=',
      wildcardMatch: '*=',
    }[e];
  }
  function IC(e) {
    return {
      toQuerySyntax() {
        let {field: t, value: r} = e,
          a = ht(e.operator);
        return `${qe(e)}@${t}${a}${r}`;
      },
    };
  }
  function EC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {field: r, from: a, to: n} = e,
          o = ht('isExactly');
        return `${t}@${r}${o}${a}..${n}`;
      },
    };
  }
  function wC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {expression: r} = e;
        return `${t}"${r}"`;
      },
    };
  }
  function kC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {field: r} = e;
        return `${t}@${r}`;
      },
    };
  }
  function OC(e) {
    return {
      toQuerySyntax() {
        let {expression: t, negate: r} = e;
        return r ? `NOT (${t})` : t;
      },
    };
  }
  function qC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {startTerm: r, otherTerms: a} = e,
          n = Dk(a),
          o = `${r} ${n}`;
        return e.negate ? `${t}(${o})` : o;
      },
    };
  }
  function Dk(e) {
    return e
      .map((t) => {
        let {endTerm: r, maxKeywordsBetween: a} = t;
        return `near:${a} ${r}`;
      })
      .join(' ');
  }
  function TC(e) {
    return {
      toQuerySyntax() {
        let {field: t, value: r} = e,
          a = qe(e),
          n = ht(e.operator);
        return `${a}@${t}${n}${r}`;
      },
    };
  }
  function DC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {field: r, from: a, to: n} = e,
          o = ht('isExactly');
        return `${t}@${r}${o}${a}..${n}`;
      },
    };
  }
  function VC(e) {
    return {
      toQuerySyntax() {
        let {name: t, parameters: r} = e,
          a = Vk(r);
        return `$${t}(${a})`;
      },
    };
  }
  function Vk(e) {
    return Object.entries(e)
      .map((t) => {
        let [r, a] = t,
          n = typeof a == 'string' ? a : a.toQuerySyntax();
        return `${r}: ${n}`;
      })
      .join(', ');
  }
  function NC(e) {
    return {
      toQuerySyntax() {
        let t = qe(e),
          {field: r, operator: a, value: n} = e,
          o = ht(a),
          i = a === 'fuzzyMatch' ? ` $quoteVar(value: ${n})` : `("${n}")`;
        return `${t}@${r}${o}${i}`;
      },
    };
  }
  function MC(e) {
    return {
      toQuerySyntax() {
        let {field: t} = e,
          r = qe(e),
          a = ht(e.operator),
          n = e.values.map((i) => `"${i}"`),
          o = n.length === 1 ? n[0] : `(${n.join(',')})`;
        return `${r}@${t}${a}${o}`;
      },
    };
  }
  function Nk() {
    let e = [],
      t = 'and';
    return {
      addExpression(r) {
        return e.push(r), this;
      },
      addKeyword(r) {
        return e.push(OC(r)), this;
      },
      addNear(r) {
        return e.push(qC(r)), this;
      },
      addExactMatch(r) {
        return e.push(wC(r)), this;
      },
      addFieldExists(r) {
        return e.push(kC(r)), this;
      },
      addStringField(r) {
        return e.push(MC(r)), this;
      },
      addStringFacetField(r) {
        return e.push(NC(r)), this;
      },
      addNumericField(r) {
        return e.push(TC(r)), this;
      },
      addNumericRangeField(r) {
        return e.push(DC(r)), this;
      },
      addDateField(r) {
        return e.push(IC(r)), this;
      },
      addDateRangeField(r) {
        return e.push(EC(r)), this;
      },
      addQueryExtension(r) {
        return e.push(VC(r)), this;
      },
      joinUsing(r) {
        return (t = r), this;
      },
      toQuerySyntax() {
        let r = Mk(t),
          a = e.map((n) => n.toQuerySyntax()).join(`) ${r} (`);
        return e.length <= 1 ? a : `(${a})`;
      },
    };
  }
  function Mk(e) {
    return e === 'and' ? 'AND' : 'OR';
  }
  /*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
  /**
   * @license
   *
   * Copyright 2023 Coveo Solutions Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *       http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
});
//# sourceMappingURL=headless.js.map
