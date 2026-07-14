(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  644745,
  (e) => {
    "use strict";
    var t = e.i(505278),
      i = e.i(207849);
    e.s([
      "default",
      0,
      function (e) {
        let s,
          r,
          n = (0, i.c)(3),
          { className: a } = e;
        return (
          n[0] === Symbol.for("react.memo_cache_sentinel")
            ? ((s = (0, t.jsx)("g", {
                fill: "currentColor",
                children: (0, t.jsx)("path", {
                  d: "M19.162 5.452 10.698.565a.88.88 0 0 0-.879 0L1.356 5.452a.74.74 0 0 0-.37.64v9.853a.74.74 0 0 0 .37.64l8.464 4.887a.879.879 0 0 0 .879 0l8.464-4.886a.74.74 0 0 0 .37-.64V6.091a.74.74 0 0 0-.37-.64Zm-.531 1.035L10.46 20.639c-.055.095-.201.056-.201-.055v-9.266a.52.52 0 0 0-.26-.45L1.975 6.237c-.096-.056-.057-.202.054-.202h16.34c.233 0 .378.252.262.453Z",
                }),
              })),
              (n[0] = s))
            : (s = n[0]),
          n[1] !== a
            ? ((r = (0, t.jsx)("svg", {
                className: a,
                xmlns: "http://www.w3.org/2000/svg",
                width: "20",
                height: "20",
                viewBox: "0 0 20 22",
                fill: "none",
                children: s,
              })),
              (n[1] = a),
              (n[2] = r))
            : (r = n[2]),
          r
        );
      },
    ]);
  },
  992741,
  798791,
  (e) => {
    "use strict";
    var t = e.i(612793);
    let i = String.raw,
      s = (() => {
        try {
          document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
        } catch {
          return !1;
        }
        return !0;
      })(),
      r = "u" > typeof CSS && CSS.supports && CSS.supports("line-height", "mod(1,1)"),
      n = "u" > typeof matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null,
      a = "--_number-flow-d-opacity",
      l = "--_number-flow-d-width",
      o = "--_number-flow-dx",
      d = "--_number-flow-d",
      c = (() => {
        try {
          return (
            CSS.registerProperty({ name: a, syntax: "<number>", inherits: !1, initialValue: "0" }),
            CSS.registerProperty({
              name: o,
              syntax: "<length>",
              inherits: !0,
              initialValue: "0px",
            }),
            CSS.registerProperty({ name: l, syntax: "<number>", inherits: !1, initialValue: "0" }),
            CSS.registerProperty({ name: d, syntax: "<number>", inherits: !0, initialValue: "0" }),
            !0
          );
        } catch {
          return !1;
        }
      })(),
      h = "round(nearest, calc(var(--number-flow-mask-height, 0.25em) / 2), 1px)",
      u = `calc(${h} * 2)`,
      m = "var(--number-flow-mask-width, 0.5em)",
      p = `calc(${m} / var(--scale-x))`,
      f = "#000 0, transparent 71%",
      g = i`:host{display:inline-block;direction:ltr;white-space:nowrap;isolation:isolate;line-height:1}.number,.number__inner{display:inline-block;transform-origin:left top}:host([data-will-change]) :is(.number,.number__inner,.section,.digit,.digit__num,.symbol){will-change:transform}.number{--scale-x:calc(1 + var(${l}) / var(--width));transform:translateX(var(${o})) scaleX(var(--scale-x));margin:0 calc(-1 * ${m});position:relative;-webkit-mask-image:linear-gradient(to right,transparent 0,#000 ${p},#000 calc(100% - ${p}),transparent ),linear-gradient(to bottom,transparent 0,#000 ${u},#000 calc(100% - ${u}),transparent 100% ),radial-gradient(at bottom right,${f}),radial-gradient(at bottom left,${f}),radial-gradient(at top left,${f}),radial-gradient(at top right,${f});-webkit-mask-size:100% calc(100% - ${u} * 2),calc(100% - ${p} * 2) 100%,${p} ${u},${p} ${u},${p} ${u},${p} ${u};-webkit-mask-position:center,center,top left,top right,bottom right,bottom left;-webkit-mask-repeat:no-repeat}.number__inner{padding:${h} ${m};transform:scaleX(calc(1 / var(--scale-x))) translateX(calc(-1 * var(${o})))}:host > :not(.number){z-index:5}.section,.symbol{display:inline-block;position:relative;isolation:isolate}.section::after{content:'\200b';display:inline-block}.section--justify-left{transform-origin:center left}.section--justify-right{transform-origin:center right}.section > [inert],.symbol > [inert]{margin:0 !important;position:absolute !important;z-index:-1}.digit{display:inline-block;position:relative;--c:var(--current) + var(${d})}.digit__num,.number .section::after{padding:${h} 0}.digit__num{display:inline-block;--offset-raw:mod(var(--length) + var(--n) - mod(var(--c),var(--length)),var(--length));--offset:calc( var(--offset-raw) - var(--length) * round(down,var(--offset-raw) / (var(--length) / 2),1) );--y:clamp(-100%,var(--offset) * 100%,100%);transform:translateY(var(--y))}.digit__num[inert]{position:absolute;top:0;left:50%;transform:translateX(-50%) translateY(var(--y))}.digit:not(.is-spinning) .digit__num[inert]{display:none}.symbol__value{display:inline-block;mix-blend-mode:plus-lighter;white-space:pre}.section--justify-left .symbol > [inert]{left:0}.section--justify-right .symbol > [inert]{right:0}.animate-presence{opacity:calc(1 + var(${a}))}`,
      x = HTMLElement,
      v =
        (i`:host{display:inline-block;direction:ltr;white-space:nowrap;line-height:1}span{display:inline-block}:host([data-will-change]) span{will-change:transform}.number,.digit{padding:${h} 0}.symbol{white-space:pre}`,
        (e, t, i) => {
          let s = document.createElement(e),
            [r, n] = Array.isArray(t) ? [void 0, t] : [t, i];
          return r && Object.assign(s, r), null == n || n.forEach((e) => s.appendChild(e)), s;
        }),
      b = r && s && c;
    class y extends x {
      constructor() {
        super(), (this.created = !1), (this.batched = !1);
        const { animated: e, ...t } = this.constructor.defaultProps;
        (this._animated = this.computedAnimated = e), Object.assign(this, t);
      }
      get animated() {
        return this._animated;
      }
      set animated(e) {
        var t;
        this.animated !== e &&
          ((this._animated = e),
          null == (t = this.shadowRoot) || t.getAnimations().forEach((e) => e.finish()));
      }
      set data(e) {
        var t;
        if (null == e) return;
        let { pre: i, integer: s, fraction: r, post: a, value: l } = e;
        if (this.created) {
          let o = this._data;
          (this._data = e),
            (this.computedTrend =
              "function" == typeof this.trend ? this.trend(o.value, l) : this.trend),
            (this.computedAnimated =
              b &&
              this._animated &&
              (!this.respectMotionPreference || !(null != n && n.matches)) &&
              this.offsetWidth > 0 &&
              this.offsetHeight > 0 &&
              "visible" === this.ownerDocument.visibilityState),
            null == (t = this.plugins) ||
              t.forEach((t) => {
                var i;
                return null == (i = t.onUpdate) ? void 0 : i.call(t, e, o, this);
              }),
            this.batched || this.willUpdate(),
            this._pre.update(i),
            this._num.update({ integer: s, fraction: r }),
            this._post.update(a),
            this.batched || this.didUpdate();
        } else {
          (this._data = e), this.attachShadow({ mode: "open" });
          try {
            this._internals ?? (this._internals = this.attachInternals()),
              (this._internals.role = "img");
          } catch {}
          let t = document.createElement("style");
          this.nonce && (t.nonce = this.nonce),
            (t.textContent = g),
            this.shadowRoot.appendChild(t),
            (this._pre = new N(this, i, { justify: "right", part: "left" })),
            this.shadowRoot.appendChild(this._pre.el),
            (this._num = new w(this, s, r)),
            this.shadowRoot.appendChild(this._num.el),
            (this._post = new N(this, a, { justify: "left", part: "right" })),
            this.shadowRoot.appendChild(this._post.el),
            (this.created = !0);
        }
        try {
          this._internals.ariaLabel = e.valueAsString;
        } catch {}
      }
      willUpdate() {
        this._pre.willUpdate(), this._num.willUpdate(), this._post.willUpdate();
      }
      didUpdate() {
        if (!this.computedAnimated) return;
        this._abortAnimationsFinish
          ? this._abortAnimationsFinish.abort()
          : this.dispatchEvent(new Event("animationsstart")),
          this._pre.didUpdate(),
          this._num.didUpdate(),
          this._post.didUpdate();
        let e = new AbortController();
        Promise.all(this.shadowRoot.getAnimations().map((e) => e.finished)).then(() => {
          e.signal.aborted ||
            (this.dispatchEvent(new Event("animationsfinish")),
            (this._abortAnimationsFinish = void 0));
        }),
          (this._abortAnimationsFinish = e);
      }
    }
    y.defaultProps = {
      transformTiming: {
        duration: 900,
        easing:
          "linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)",
      },
      spinTiming: void 0,
      opacityTiming: { duration: 450, easing: "ease-out" },
      animated: !0,
      trend: (e, t) => Math.sign(t - e),
      respectMotionPreference: !0,
      plugins: void 0,
      digits: void 0,
    };
    class w {
      constructor(e, t, i, { className: s, ...r } = {}) {
        (this.flow = e),
          (this._integer = new _(e, t, { justify: "right", part: "integer" })),
          (this._fraction = new _(e, i, { justify: "left", part: "fraction" })),
          (this._inner = v("span", { className: "number__inner" }, [
            this._integer.el,
            this._fraction.el,
          ])),
          (this.el = v("span", { ...r, part: "number", className: `number ${s ?? ""}` }, [
            this._inner,
          ]));
      }
      willUpdate() {
        (this._prevWidth = this.el.offsetWidth),
          (this._prevLeft = this.el.getBoundingClientRect().left),
          this._integer.willUpdate(),
          this._fraction.willUpdate();
      }
      update({ integer: e, fraction: t }) {
        this._integer.update(e), this._fraction.update(t);
      }
      didUpdate() {
        let e = this.el.getBoundingClientRect();
        this._integer.didUpdate(), this._fraction.didUpdate();
        let t = this._prevLeft - e.left,
          i = this.el.offsetWidth,
          s = this._prevWidth - i;
        this.el.style.setProperty("--width", String(i)),
          this.el.animate(
            { [o]: [`${t}px`, "0px"], [l]: [s, 0] },
            { ...this.flow.transformTiming, composite: "accumulate" },
          );
      }
    }
    class j {
      constructor(e, t, { justify: i, className: s, ...r }, n) {
        (this.flow = e),
          (this.children = new Map()),
          (this.onCharRemove = (e) => () => {
            this.children.delete(e);
          }),
          (this.justify = i);
        const a = t.map((e) => this.addChar(e).el);
        this.el = v(
          "span",
          { ...r, className: `section section--justify-${i} ${s ?? ""}` },
          n ? n(a) : a,
        );
      }
      addChar(e, { startDigitsAtZero: t = !1, ...i } = {}) {
        let s =
          "integer" === e.type || "fraction" === e.type
            ? new S(this, e.type, t ? 0 : e.value, e.pos, {
                ...i,
                onRemove: this.onCharRemove(e.key),
              })
            : new C(this, e.type, e.value, { ...i, onRemove: this.onCharRemove(e.key) });
        return this.children.set(e.key, s), s;
      }
      unpop(e) {
        e.el.removeAttribute("inert"), (e.el.style.top = ""), (e.el.style[this.justify] = "");
      }
      pop(e) {
        e.forEach((e) => {
          var t, i;
          (e.el.style.top = `${e.el.offsetTop}px`),
            (e.el.style[this.justify] =
              `${((t = e.el), "left" === this.justify ? t.offsetLeft : ((null == (i = t.offsetParent instanceof HTMLElement ? t.offsetParent : null) ? void 0 : i.offsetWidth) ?? 0) - t.offsetWidth - t.offsetLeft)}px`);
        }),
          e.forEach((e) => {
            e.el.setAttribute("inert", ""), (e.present = !1);
          });
      }
      addNewAndUpdateExisting(e) {
        let t = new Map(),
          i = new Map(),
          s = "left" === this.justify,
          r = s ? "prepend" : "append";
        if (
          ((function (e, t, { reverse: i = !1 } = {}) {
            let s = e.length;
            for (let r = i ? s - 1 : 0; i ? r >= 0 : r < s; i ? r-- : r++) t(e[r], r);
          })(
            e,
            (e) => {
              let s;
              this.children.has(e.key)
                ? ((s = this.children.get(e.key)), i.set(e, s), this.unpop(s), (s.present = !0))
                : ((s = this.addChar(e, { startDigitsAtZero: !0, animateIn: !0 })), t.set(e, s)),
                this.el[r](s.el);
            },
            { reverse: s },
          ),
          this.flow.computedAnimated)
        ) {
          let e = this.el.getBoundingClientRect();
          t.forEach((t) => {
            t.willUpdate(e);
          });
        }
        t.forEach((e, t) => {
          e.update(t.value);
        }),
          i.forEach((e, t) => {
            e.update(t.value);
          });
      }
      willUpdate() {
        let e = this.el.getBoundingClientRect();
        (this._prevOffset = e[this.justify]), this.children.forEach((t) => t.willUpdate(e));
      }
      didUpdate() {
        let e = this.el.getBoundingClientRect();
        this.children.forEach((t) => t.didUpdate(e));
        let t = e[this.justify],
          i = this._prevOffset - t;
        i &&
          this.children.size &&
          this.el.animate(
            { transform: [`translateX(${i}px)`, "none"] },
            { ...this.flow.transformTiming, composite: "accumulate" },
          );
      }
    }
    class _ extends j {
      update(e) {
        let t = new Map();
        this.children.forEach((i, s) => {
          e.find((e) => e.key === s) || t.set(s, i), this.unpop(i);
        }),
          this.addNewAndUpdateExisting(e),
          t.forEach((e) => {
            e instanceof S && e.update(0);
          }),
          this.pop(t);
      }
    }
    class N extends j {
      update(e) {
        let t = new Map();
        this.children.forEach((i, s) => {
          e.find((e) => e.key === s) || t.set(s, i);
        }),
          this.pop(t),
          this.addNewAndUpdateExisting(e);
      }
    }
    class $ {
      constructor(e, t, { onRemove: i, animateIn: s = !1 } = {}) {
        (this.flow = e),
          (this.el = t),
          (this._present = !0),
          (this._remove = () => {
            var e;
            this.el.remove(), null == (e = this._onRemove) || e.call(this);
          }),
          this.el.classList.add("animate-presence"),
          this.flow.computedAnimated &&
            s &&
            this.el.animate(
              { [a]: [-0.9999, 0] },
              { ...this.flow.opacityTiming, composite: "accumulate" },
            ),
          (this._onRemove = i);
      }
      get present() {
        return this._present;
      }
      set present(e) {
        if (this._present !== e) {
          if (
            ((this._present = e),
            e ? this.el.removeAttribute("inert") : this.el.setAttribute("inert", ""),
            !this.flow.computedAnimated)
          ) {
            e || this._remove();
            return;
          }
          this.el.style.setProperty("--_number-flow-d-opacity", e ? "0" : "-.999"),
            this.el.animate(
              { [a]: e ? [-0.9999, 0] : [0.999, 0] },
              { ...this.flow.opacityTiming, composite: "accumulate" },
            ),
            e
              ? this.flow.removeEventListener("animationsfinish", this._remove)
              : this.flow.addEventListener("animationsfinish", this._remove, { once: !0 });
        }
      }
    }
    class k extends $ {
      constructor(e, t, i, s) {
        super(e.flow, i, s), (this.section = e), (this.value = t), (this.el = i);
      }
    }
    class S extends k {
      constructor(e, t, i, s, r) {
        var n, a;
        const l =
            ((null == (a = null == (n = e.flow.digits) ? void 0 : n[s]) ? void 0 : a.max) ?? 9) + 1,
          o = Array.from({ length: l }).map((e, t) => {
            let s = v("span", { className: "digit__num" }, [document.createTextNode(String(t))]);
            return t !== i && s.setAttribute("inert", ""), s.style.setProperty("--n", String(t)), s;
          }),
          d = v("span", { part: `digit ${t}-digit`, className: "digit" }, o);
        d.style.setProperty("--current", String(i)),
          d.style.setProperty("--length", String(l)),
          super(e, i, d, r),
          (this.pos = s),
          (this._onAnimationsFinish = () => {
            this.el.classList.remove("is-spinning");
          }),
          (this._numbers = o),
          (this.length = l);
      }
      willUpdate(e) {
        let t = this.el.getBoundingClientRect();
        this._prevValue = this.value;
        let i = t[this.section.justify] - e[this.section.justify],
          s = t.width / 2;
        this._prevCenter = "left" === this.section.justify ? i + s : i - s;
      }
      update(e) {
        this.el.style.setProperty("--current", String(e)),
          this._numbers.forEach((t, i) =>
            i === e ? t.removeAttribute("inert") : t.setAttribute("inert", ""),
          ),
          (this.value = e);
      }
      didUpdate(e) {
        let t = this.el.getBoundingClientRect(),
          i = t[this.section.justify] - e[this.section.justify],
          s = t.width / 2,
          r = "left" === this.section.justify ? i + s : i - s,
          n = this._prevCenter - r;
        n &&
          this.el.animate(
            { transform: [`translateX(${n}px)`, "none"] },
            { ...this.flow.transformTiming, composite: "accumulate" },
          );
        let a = this.getDelta();
        a &&
          (this.el.classList.add("is-spinning"),
          this.el.animate(
            { [d]: [-a, 0] },
            { ...(this.flow.spinTiming ?? this.flow.transformTiming), composite: "accumulate" },
          ),
          this.flow.addEventListener("animationsfinish", this._onAnimationsFinish, { once: !0 }));
      }
      getDelta() {
        var e;
        if (this.flow.plugins)
          for (let t of this.flow.plugins) {
            let i =
              null == (e = t.getDelta) ? void 0 : e.call(t, this.value, this._prevValue, this);
            if (null != i) return i;
          }
        let t = this.value - this._prevValue,
          i = this.flow.computedTrend || Math.sign(t);
        return i < 0 && this.value > this._prevValue
          ? this.value - this.length - this._prevValue
          : i > 0 && this.value < this._prevValue
            ? this.length - this._prevValue + this.value
            : t;
      }
    }
    class C extends k {
      constructor(e, t, i, s) {
        const r = v("span", { className: "symbol__value", textContent: i });
        super(e, i, v("span", { part: `symbol ${t}`, className: "symbol" }, [r]), s),
          (this.type = t),
          (this._children = new Map()),
          (this._onChildRemove = (e) => () => {
            this._children.delete(e);
          }),
          this._children.set(i, new $(this.flow, r, { onRemove: this._onChildRemove(i) }));
      }
      willUpdate(e) {
        if ("decimal" === this.type) return;
        let t = this.el.getBoundingClientRect();
        this._prevOffset = t[this.section.justify] - e[this.section.justify];
      }
      update(e) {
        if (this.value !== e) {
          let t = this._children.get(this.value);
          t && (t.present = !1);
          let i = this._children.get(e);
          if (i) i.present = !0;
          else {
            let t = v("span", { className: "symbol__value", textContent: e });
            this.el.appendChild(t),
              this._children.set(
                e,
                new $(this.flow, t, { animateIn: !0, onRemove: this._onChildRemove(e) }),
              );
          }
        }
        this.value = e;
      }
      didUpdate(e) {
        if ("decimal" === this.type) return;
        let t = this.el.getBoundingClientRect()[this.section.justify] - e[this.section.justify],
          i = this._prevOffset - t;
        i &&
          this.el.animate(
            { transform: [`translateX(${i}px)`, "none"] },
            { ...this.flow.transformTiming, composite: "accumulate" },
          );
      }
    }
    var E = t;
    let R = parseInt(E.version.match(/^(\d+)\./)?.[1]) >= 19;
    class A extends y {
      attributeChangedCallback(e, t, i) {
        this[e] = JSON.parse(i);
      }
    }
    (A.observedAttributes = R ? [] : ["data", "digits"]),
      customElements.get("number-flow-react") || customElements.define("number-flow-react", A);
    let P = {},
      T = R
        ? function (e) {
            return e;
          }
        : JSON.stringify;
    function M(e) {
      let {
        transformTiming: t,
        spinTiming: i,
        opacityTiming: s,
        animated: r,
        respectMotionPreference: n,
        trend: a,
        plugins: l,
        ...o
      } = e;
      return [
        {
          transformTiming: t,
          spinTiming: i,
          opacityTiming: s,
          animated: r,
          respectMotionPreference: n,
          trend: a,
          plugins: l,
        },
        o,
      ];
    }
    class L extends E.Component {
      updateProperties(e) {
        if (!this.el) return;
        this.el.batched = !this.props.isolate;
        let [t] = M(this.props);
        Object.entries(t).forEach(([e, t]) => {
          this.el[e] = t ?? A.defaultProps[e];
        }),
          e?.onAnimationsStart &&
            this.el.removeEventListener("animationsstart", e.onAnimationsStart),
          this.props.onAnimationsStart &&
            this.el.addEventListener("animationsstart", this.props.onAnimationsStart),
          e?.onAnimationsFinish &&
            this.el.removeEventListener("animationsfinish", e.onAnimationsFinish),
          this.props.onAnimationsFinish &&
            this.el.addEventListener("animationsfinish", this.props.onAnimationsFinish);
      }
      componentDidMount() {
        this.updateProperties(),
          R && this.el && ((this.el.digits = this.props.digits), (this.el.data = this.props.data));
      }
      getSnapshotBeforeUpdate(e) {
        if ((this.updateProperties(e), e.data !== this.props.data)) {
          if (this.props.group)
            return this.props.group.willUpdate(), () => this.props.group?.didUpdate();
          if (!this.props.isolate) return this.el?.willUpdate(), () => this.el?.didUpdate();
        }
        return null;
      }
      componentDidUpdate(e, t, i) {
        i?.();
      }
      handleRef(e) {
        this.props.innerRef && (this.props.innerRef.current = e), (this.el = e);
      }
      render() {
        let [
          e,
          {
            innerRef: t,
            className: i,
            data: s,
            nonce: r,
            willChange: n,
            isolate: a,
            group: l,
            digits: o,
            onAnimationsStart: d,
            onAnimationsFinish: c,
            ...h
          },
        ] = M(this.props);
        return E.createElement("number-flow-react", {
          ref: this.handleRef,
          "data-will-change": n ? "" : void 0,
          class: i,
          nonce: r,
          ...h,
          dangerouslySetInnerHTML: { __html: "" },
          suppressHydrationWarning: !0,
          digits: T(o),
          data: T(s),
        });
      }
      constructor(e) {
        super(e), (this.handleRef = this.handleRef.bind(this));
      }
    }
    let U = E.forwardRef(function (
        { value: e, locales: t, format: i, prefix: s, suffix: r, ...n },
        a,
      ) {
        E.useImperativeHandle(a, () => l.current, []);
        let l = E.useRef(),
          o = E.useContext(F);
        o?.useRegister(l);
        let d = E.useMemo(() => (t ? JSON.stringify(t) : ""), [t]),
          c = E.useMemo(() => (i ? JSON.stringify(i) : ""), [i]),
          h = E.useMemo(
            () =>
              (function (e, t, i, s) {
                let r = t.formatToParts(e);
                i && r.unshift({ type: "prefix", value: i }),
                  s && r.push({ type: "suffix", value: s });
                let n = [],
                  a = [],
                  l = [],
                  o = [],
                  d = {},
                  c = (e) => `${e}:${(d[e] = (d[e] ?? -1) + 1)}`,
                  h = "",
                  u = !1,
                  m = !1;
                for (let e of r) {
                  h += e.value;
                  let t = "minusSign" === e.type || "plusSign" === e.type ? "sign" : e.type;
                  "integer" === t
                    ? ((u = !0),
                      a.push(...e.value.split("").map((e) => ({ type: t, value: parseInt(e) }))))
                    : "group" === t
                      ? a.push({ type: t, value: e.value })
                      : "decimal" === t
                        ? ((m = !0), l.push({ type: t, value: e.value, key: c(t) }))
                        : "fraction" === t
                          ? l.push(
                              ...e.value
                                .split("")
                                .map((e) => ({
                                  type: t,
                                  value: parseInt(e),
                                  key: c(t),
                                  pos: -1 - d[t],
                                })),
                            )
                          : (u || m ? o : n).push({ type: t, value: e.value, key: c(t) });
                }
                let p = [];
                for (let e = a.length - 1; e >= 0; e--) {
                  let t = a[e];
                  p.unshift(
                    "integer" === t.type
                      ? { ...t, key: c(t.type), pos: d[t.type] }
                      : { ...t, key: c(t.type) },
                  );
                }
                return {
                  pre: n,
                  integer: p,
                  fraction: l,
                  post: o,
                  valueAsString: h,
                  value: "string" == typeof e ? parseFloat(e) : e,
                };
              })(e, (P[`${d}:${c}`] ??= new Intl.NumberFormat(t, i)), s, r),
            [e, d, c, s, r],
          );
        return E.createElement(L, { ...n, group: o, data: h, innerRef: l });
      }),
      F = E.createContext(void 0);
    ((e = "") =>
      i`:where(number-flow${e}){line-height:1}number-flow${e} > span{font-kerning:none;display:inline-block;padding:${u} 0}`)(
      "-react",
    ),
      e.s([], 992741),
      e.s(["default", 0, U], 798791);
  },
  417038,
  (e) => {
    "use strict";
    var t = e.i(612793);
    let i = (0, t.createContext)({ isPlaying: !0 }),
      s = i.Provider;
    e.s(["DemoPlaybackProvider", 0, s, "useDemoPlayback", 0, () => (0, t.useContext)(i)]);
  },
  388537,
  (e) => {
    "use strict";
    e.s([
      "hasValidLink",
      0,
      function (e) {
        return (
          !!e &&
          "none" !== e.linkType &&
          !!(e.href || e.slug || e.page || e.simplePage || e.post || e.file)
        );
      },
      "isExternalLink",
      0,
      function (e) {
        return (
          !!e &&
          (!!e.openInNewTab ||
            ("href" === e.linkType &&
              !!e.href &&
              (e.href.startsWith("http://") || e.href.startsWith("https://"))))
        );
      },
    ]);
  },
  446295,
  (e) => {
    "use strict";
    var t = e.i(505278),
      i = e.i(207849),
      s = e.i(264458),
      r = e.i(229138),
      n = e.i(612793),
      a = e.i(417038),
      l = e.i(413676),
      o = e.i(180185),
      d = e.i(388537);
    function c(e) {
      return e instanceof Element && !!e.closest("[data-ignore-play-on-hover]");
    }
    e.s([
      "default",
      0,
      function (e) {
        let h,
          u,
          m,
          p,
          f,
          g,
          x,
          v,
          b,
          y,
          w,
          j,
          _,
          N,
          $,
          k,
          S,
          C = (0, i.c)(74),
          {
            mediaBgColor: E,
            mediaBgHex: R,
            mediaBgHexDark: A,
            mediaPosition: P,
            mediaType: T,
            mediaBg: M,
            media: L,
            video: U,
            children: F,
            preload: z,
            wallpaperClassName: D,
            link: O,
            enableWallpaperZoom: W,
            enableWallpaperBrightness: V,
            allowOverflow: B,
            height: I,
            heightMobile: Z,
            maxHeightMobile: H,
            playOnHover: X,
            mediaImageClassName: J,
          } = e,
          G = void 0 !== z && z,
          K = void 0 !== W && W,
          Y = void 0 !== V && V,
          q = void 0 !== X && X,
          [Q, ee] = (0, n.useState)(!1),
          [et, ei] = (0, n.useState)(!1),
          es = M?.src ?? null,
          er = M?.darkSrc ?? null,
          en = !!(R && A),
          ea = !!(R && !A),
          el = L?.src,
          eo = L?.darkSrc,
          ed = L?.alt,
          ec = U?.src,
          eh = !q || Q || et,
          eu = void 0 !== B && B ? "overflow-hidden xl:overflow-visible" : null,
          em = Z && "responsive-media-height",
          ep = H && "max-h-mobile";
        return (
          C[0] !== en ||
          C[1] !== ea ||
          C[2] !== E ||
          C[3] !== eu ||
          C[4] !== em ||
          C[5] !== ep ||
          C[6] !== D
            ? ((h = (0, s.default)(
                "media-border-container relative grid grid-cols-1 grid-rows-1",
                eu,
                D,
                em,
                ep,
                ea || en
                  ? void 0
                  : {
                      "bg-[image:var(--color-theme-card-03)]": !E,
                      "bg-theme-bg": "bg" === E,
                      "bg-theme-card-hex": "card-hex" === E,
                      "bg-theme-card-01-hex": "card-01-hex" === E,
                      "bg-theme-card-02-hex": "card-02-hex" === E,
                      "bg-theme-card-03-hex": "card-03-hex" === E,
                      "bg-theme-card-04-hex": "card-04-hex" === E,
                      "bg-theme-card-warm-hex": "card-warm-hex" === E,
                      "bg-theme-accent": "accent" === E,
                    },
              )),
              (C[0] = en),
              (C[1] = ea),
              (C[2] = E),
              (C[3] = eu),
              (C[4] = em),
              (C[5] = ep),
              (C[6] = D),
              (C[7] = h))
            : (h = C[7]),
          C[8] !== ea || C[9] !== R
            ? ((u = ea ? { backgroundColor: R } : {}), (C[8] = ea), (C[9] = R), (C[10] = u))
            : (u = C[10]),
          C[11] !== en || C[12] !== R || C[13] !== A
            ? ((m = en ? { "--layered-media-bg-light": R, "--layered-media-bg-dark": A } : {}),
              (C[11] = en),
              (C[12] = R),
              (C[13] = A),
              (C[14] = m))
            : (m = C[14]),
          C[15] !== I || C[16] !== Z
            ? ((p = I && !Z ? { height: I } : {}),
              (f = Z ? { "--layered-media-height": I, "--layered-media-height-mobile": Z } : {}),
              (C[15] = I),
              (C[16] = Z),
              (C[17] = p),
              (C[18] = f))
            : ((p = C[17]), (f = C[18])),
          C[19] !== H
            ? ((g = H ? { "--max-h-mobile": H } : {}), (C[19] = H), (C[20] = g))
            : (g = C[20]),
          C[21] !== u || C[22] !== m || C[23] !== p || C[24] !== f || C[25] !== g
            ? ((x = { ...u, ...m, ...p, ...f, ...g }),
              (C[21] = u),
              (C[22] = m),
              (C[23] = p),
              (C[24] = f),
              (C[25] = g),
              (C[26] = x))
            : (x = C[26]),
          C[27] !== q
            ? ((v = q
                ? (e) => {
                    "mouse" !== e.pointerType || c(e.target) || ee(!0);
                  }
                : void 0),
              (C[27] = q),
              (C[28] = v))
            : (v = C[28]),
          C[29] !== Q || C[30] !== q
            ? ((b =
                q && !Q
                  ? (e) => {
                      if ("mouse" !== e.pointerType) return;
                      let t = e.target;
                      t instanceof Element && !c(t) && ee(!0);
                    }
                  : void 0),
              (C[29] = Q),
              (C[30] = q),
              (C[31] = b))
            : (b = C[31]),
          C[32] !== q
            ? ((y = q
                ? (e) => {
                    "mouse" === e.pointerType && ee(!1);
                  }
                : void 0),
              (C[32] = q),
              (C[33] = y))
            : (y = C[33]),
          C[34] !== q
            ? ((w = q
                ? (e) => {
                    "mouse" !== e.pointerType && ei(!0);
                  }
                : void 0),
              (C[34] = q),
              (C[35] = w))
            : (w = C[35]),
          C[36] !== en || C[37] !== R || C[38] !== A
            ? ((j =
                en &&
                (0, t.jsxs)(t.Fragment, {
                  children: [
                    (0, t.jsx)("div", {
                      className: "media-light absolute inset-0 z-0",
                      style: { backgroundColor: R },
                    }),
                    (0, t.jsx)("div", {
                      className: "media-dark absolute inset-0 z-0",
                      style: { backgroundColor: A },
                    }),
                  ],
                })),
              (C[36] = en),
              (C[37] = R),
              (C[38] = A),
              (C[39] = j))
            : (j = C[39]),
          C[40] !== Y || C[41] !== K || C[42] !== er || C[43] !== es || C[44] !== G
            ? ((_ =
                es &&
                (0, t.jsx)("div", {
                  className: "relative z-1 col-span-full row-span-full overflow-hidden",
                  children: er
                    ? (0, t.jsxs)(t.Fragment, {
                        children: [
                          (0, t.jsx)(r.default, {
                            src: es,
                            alt: "",
                            fill: !0,
                            className: (0, s.default)(
                              "media-light absolute inset-0 object-cover",
                              K ? "scale-[1.1] transform" : void 0,
                              Y ? "wallpaper-brightness-dark" : void 0,
                            ),
                            priority: G,
                          }),
                          (0, t.jsx)(r.default, {
                            src: er,
                            alt: "",
                            fill: !0,
                            className: (0, s.default)(
                              "media-dark absolute inset-0 object-cover",
                              K ? "scale-[1.1] transform" : void 0,
                              Y ? "wallpaper-brightness-dark" : void 0,
                            ),
                            priority: G,
                          }),
                        ],
                      })
                    : (0, t.jsx)(r.default, {
                        src: es,
                        alt: "",
                        fill: !0,
                        className: (0, s.default)(
                          "absolute inset-0 object-cover",
                          K ? "scale-[1.1] transform" : void 0,
                          Y ? "wallpaper-brightness-dark" : void 0,
                        ),
                        priority: G,
                      }),
                })),
              (C[40] = Y),
              (C[41] = K),
              (C[42] = er),
              (C[43] = es),
              (C[44] = G),
              (C[45] = _))
            : (_ = C[45]),
          C[46] !== F || C[47] !== eh
            ? ((N =
                F &&
                (0, t.jsx)("div", {
                  className: "z-20 col-span-full row-span-full",
                  children: (0, t.jsx)(a.DemoPlaybackProvider, {
                    value: { isPlaying: eh },
                    children: F,
                  }),
                })),
              (C[46] = F),
              (C[47] = eh),
              (C[48] = N))
            : (N = C[48]),
          C[49] !== ed ||
          C[50] !== eo ||
          C[51] !== O ||
          C[52] !== J ||
          C[53] !== P ||
          C[54] !== T ||
          C[55] !== G ||
          C[56] !== el
            ? (($ =
                "image" === T &&
                el &&
                (0, t.jsx)("div", {
                  className: (0, s.default)("z-20 col-span-full row-span-full grid", {
                    "pt-g1.75 pr-g1.75": "bottomLeft" === P,
                    "pt-g1.75 pl-g1.75": "bottomRight" === P,
                    "pt-g1.75 pl-g1.75 pr-g1.75 items-center": "bottomCenter" === P,
                    "p-g1.75 place-center": "center" === P,
                  }),
                  children:
                    O && (0, d.hasValidLink)(O)
                      ? (0, t.jsx)(l.default, {
                          link: O,
                          className: "block h-full w-full",
                          download: O?.linkType === "file" || void 0,
                          children: eo
                            ? (0, t.jsxs)(t.Fragment, {
                                children: [
                                  (0, t.jsx)(r.default, {
                                    src: el,
                                    alt: ed || "",
                                    width: 800,
                                    height: 450,
                                    className: (0, s.default)("media-light h-auto w-full", J),
                                    priority: G,
                                  }),
                                  (0, t.jsx)(r.default, {
                                    src: eo,
                                    alt: ed || "",
                                    width: 800,
                                    height: 450,
                                    className: (0, s.default)("media-dark h-auto w-full", J),
                                    priority: G,
                                  }),
                                ],
                              })
                            : (0, t.jsx)(r.default, {
                                src: el,
                                alt: ed || "",
                                width: 800,
                                height: 450,
                                className: (0, s.default)("h-auto w-full", J),
                                priority: G,
                              }),
                        })
                      : eo
                        ? (0, t.jsxs)(t.Fragment, {
                            children: [
                              (0, t.jsx)(r.default, {
                                src: el,
                                alt: ed || "",
                                width: 800,
                                height: 450,
                                className: (0, s.default)("media-light h-auto w-full", J),
                                priority: G,
                              }),
                              (0, t.jsx)(r.default, {
                                src: eo,
                                alt: ed || "",
                                width: 800,
                                height: 450,
                                className: (0, s.default)("media-dark h-auto w-full", J),
                                priority: G,
                              }),
                            ],
                          })
                        : (0, t.jsx)(r.default, {
                            src: el,
                            alt: ed || "",
                            width: 800,
                            height: 450,
                            className: (0, s.default)("h-auto w-full", J),
                            priority: G,
                          }),
                })),
              (C[49] = ed),
              (C[50] = eo),
              (C[51] = O),
              (C[52] = J),
              (C[53] = P),
              (C[54] = T),
              (C[55] = G),
              (C[56] = el),
              (C[57] = $))
            : ($ = C[57]),
          C[58] !== P || C[59] !== T || C[60] !== ec
            ? ((k =
                "video" === T &&
                ec &&
                (0, t.jsx)("div", {
                  className: (0, s.default)("z-20 col-span-full row-span-full", {
                    "pt-g1.75 pr-g1.75": "bottomLeft" === P,
                    "pt-g1.75 pl-g1.75": "bottomRight" === P,
                    "pt-g1.75 pl-g1.75 pr-g1.75 align-self-end justify-self-center":
                      "bottomCenter" === P,
                    "p-g1.75 place-self-center": "center" === P,
                  }),
                  children: (0, t.jsx)(o.default, { src: ec }),
                })),
              (C[58] = P),
              (C[59] = T),
              (C[60] = ec),
              (C[61] = k))
            : (k = C[61]),
          C[62] !== x ||
          C[63] !== v ||
          C[64] !== b ||
          C[65] !== y ||
          C[66] !== w ||
          C[67] !== j ||
          C[68] !== _ ||
          C[69] !== N ||
          C[70] !== $ ||
          C[71] !== k ||
          C[72] !== h
            ? ((S = (0, t.jsxs)("div", {
                className: h,
                style: x,
                onPointerEnter: v,
                onPointerMove: b,
                onPointerLeave: y,
                onPointerDownCapture: w,
                children: [j, _, N, $, k],
              })),
              (C[62] = x),
              (C[63] = v),
              (C[64] = b),
              (C[65] = y),
              (C[66] = w),
              (C[67] = j),
              (C[68] = _),
              (C[69] = N),
              (C[70] = $),
              (C[71] = k),
              (C[72] = h),
              (C[73] = S))
            : (S = C[73]),
          S
        );
      },
    ]);
  },
  152831,
  (e) => {
    "use strict";
    e.s([
      "getDelayForRole",
      0,
      function (e) {
        switch (e) {
          case "thinking":
          case "browser":
            return 600;
          case "search":
            return 500;
          case "read":
            return 400;
          case "terminal":
            return 800;
          default:
            return 150;
        }
      },
      "isToolRole",
      0,
      function (e) {
        return (
          "thinking" === e || "search" === e || "read" === e || "terminal" === e || "browser" === e
        );
      },
    ]);
  },
  680976,
  (e) => {
    "use strict";
    var t = e.i(612793),
      i = e.i(94884);
    let s = new Map([
        [
          "bold",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", {
              d: "M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z",
            }),
          ),
        ],
        [
          "duotone",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", { d: "M160,48V208L80,128Z", opacity: "0.2" }),
            t.createElement("path", {
              d: "M163.06,40.61a8,8,0,0,0-8.72,1.73l-80,80a8,8,0,0,0,0,11.32l80,80A8,8,0,0,0,168,208V48A8,8,0,0,0,163.06,40.61ZM152,188.69,91.31,128,152,67.31Z",
            }),
          ),
        ],
        [
          "fill",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", {
              d: "M168,48V208a8,8,0,0,1-13.66,5.66l-80-80a8,8,0,0,1,0-11.32l80-80A8,8,0,0,1,168,48Z",
            }),
          ),
        ],
        [
          "light",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", {
              d: "M164.24,203.76a6,6,0,1,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,128Z",
            }),
          ),
        ],
        [
          "regular",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", {
              d: "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z",
            }),
          ),
        ],
        [
          "thin",
          t.createElement(
            t.Fragment,
            null,
            t.createElement("path", {
              d: "M162.83,205.17a4,4,0,0,1-5.66,5.66l-80-80a4,4,0,0,1,0-5.66l80-80a4,4,0,1,1,5.66,5.66L85.66,128Z",
            }),
          ),
        ],
      ]),
      r = t.forwardRef((e, r) => t.createElement(i.default, { ref: r, ...e, weights: s }));
    (r.displayName = "CaretLeftIcon"), e.s(["CaretLeft", 0, r], 680976);
  },
  919473,
  (e) => {
    "use strict";
    var t = e.i(505278),
      i = e.i(972643),
      s = e.i(341807),
      r = e.i(346140),
      n = e.i(612793),
      a = e.i(651466),
      l = e.i(152831),
      o = e.i(207849),
      d = e.i(680976),
      c = e.i(587888);
    function h(e) {
      let i,
        s,
        a,
        l,
        h,
        u,
        m,
        p,
        f,
        g,
        x,
        v,
        b,
        y,
        w,
        j,
        _,
        N,
        $,
        k,
        S,
        C,
        E,
        R,
        A,
        P,
        T,
        M = (0, o.c)(76),
        { questions: L, onComplete: U, onSkip: F } = e,
        z = (0, r.useMessages)(),
        [D, O] = (0, n.useState)(0);
      M[0] === Symbol.for("react.memo_cache_sentinel") ? ((i = {}), (M[0] = i)) : (i = M[0]);
      let [W, V] = (0, n.useState)(i),
        B = L[D];
      if (!B) return null;
      M[1] === Symbol.for("react.memo_cache_sentinel")
        ? ((s = (e, t, i) => {
            V((s) => {
              let r = s[e] || [];
              return i
                ? r.includes(t)
                  ? { ...s, [e]: r.filter((e) => e !== t) }
                  : { ...s, [e]: [...r, t] }
                : { ...s, [e]: [t] };
            });
          }),
          (M[1] = s))
        : (s = M[1]);
      let I = s;
      M[2] !== D
        ? ((a = () => {
            D > 0 && O(D - 1);
          }),
          (M[2] = D),
          (M[3] = a))
        : (a = M[3]);
      let Z = a;
      M[4] !== D || M[5] !== L.length
        ? ((l = () => {
            D < L.length - 1 && O(D + 1);
          }),
          (M[4] = D),
          (M[5] = L.length),
          (M[6] = l))
        : (l = M[6]);
      let H = l;
      M[7] !== W || M[8] !== D || M[9] !== U || M[10] !== L.length
        ? ((h = () => {
            D < L.length - 1 ? O(D + 1) : U?.(W);
          }),
          (M[7] = W),
          (M[8] = D),
          (M[9] = U),
          (M[10] = L.length),
          (M[11] = h))
        : (h = M[11]);
      let X = h;
      M[12] === Symbol.for("react.memo_cache_sentinel")
        ? ((u = ["1", "2", "3", "4", "5", "6", "7", "8"]), (M[12] = u))
        : (u = M[12]);
      let J = u;
      M[13] !== W || M[14] !== B.id
        ? ((m = W[B.id] || []), (M[13] = W), (M[14] = B.id), (M[15] = m))
        : (m = M[15]);
      let G = m,
        K = B.id;
      M[16] !== z ? ((p = z((0, r.msg)("Questions"))), (M[16] = z), (M[17] = p)) : (p = M[17]),
        M[18] !== p
          ? ((f = (0, t.jsx)("div", {
              className: "text-theme-text-sec type-product-sm flex items-center px-1",
              children: (0, t.jsx)("span", { children: p }),
            })),
            (M[18] = p),
            (M[19] = f))
          : (f = M[19]);
      let Y = 0 === D;
      M[20] === Symbol.for("react.memo_cache_sentinel")
        ? ((g = (0, t.jsx)(d.CaretLeft, { size: 14 })), (M[20] = g))
        : (g = M[20]),
        M[21] !== Z || M[22] !== Y
          ? ((x = (0, t.jsx)("button", {
              type: "button",
              onClick: Z,
              disabled: Y,
              className:
                "text-theme-text-sec hover:text-theme-text cursor-pointer p-0.5 disabled:cursor-default disabled:opacity-30",
              children: g,
            })),
            (M[21] = Z),
            (M[22] = Y),
            (M[23] = x))
          : (x = M[23]);
      let q = D === L.length - 1;
      if (
        (M[24] === Symbol.for("react.memo_cache_sentinel")
          ? ((v = (0, t.jsx)(c.CaretRight, { size: 14 })), (M[24] = v))
          : (v = M[24]),
        M[25] !== H || M[26] !== q
          ? ((b = (0, t.jsx)("button", {
              type: "button",
              onClick: H,
              disabled: q,
              className:
                "text-theme-text-sec hover:text-theme-text cursor-pointer p-0.5 disabled:cursor-default disabled:opacity-30",
              children: v,
            })),
            (M[25] = H),
            (M[26] = q),
            (M[27] = b))
          : (b = M[27]),
        M[28] !== x || M[29] !== b
          ? ((y = (0, t.jsxs)("div", { className: "flex items-center gap-0.5", children: [x, b] })),
            (M[28] = x),
            (M[29] = b),
            (M[30] = y))
          : (y = M[30]),
        M[31] !== f || M[32] !== y
          ? ((w = (0, t.jsxs)("div", {
              className: "flex items-center justify-between pt-1.5 pr-1.5 pb-0 pl-1",
              children: [f, y],
            })),
            (M[31] = f),
            (M[32] = y),
            (M[33] = w))
          : (w = M[33]),
        M[34] !== z || M[35] !== B.prompt
          ? ((j = z(B.prompt)), (M[34] = z), (M[35] = B.prompt), (M[36] = j))
          : (j = M[36]),
        M[37] !== j
          ? ((_ = (0, t.jsx)("div", {
              className: "text-theme-text type-product-base mb-2 font-medium",
              children: j,
            })),
            (M[37] = j),
            (M[38] = _))
          : (_ = M[38]),
        M[39] !== z ||
          M[40] !== B.allowMultiple ||
          M[41] !== B.id ||
          M[42] !== B.options ||
          M[43] !== G)
      ) {
        let e;
        M[45] !== z || M[46] !== B.allowMultiple || M[47] !== B.id || M[48] !== G
          ? ((e = (e, i) => {
              let s = J[i] || String(i + 1),
                r = G.includes(e.id);
              return (0, t.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => I(B.id, e.id, B.allowMultiple),
                  className: `flex w-full cursor-pointer items-center gap-2 rounded py-1 pr-1.5 pl-0 text-left transition-colors ${r ? "text-theme-text" : "text-theme-text-sec hover:bg-theme-bg-hover hover:text-theme-text"}`,
                  style: r ? { backgroundColor: "var(--color-theme-bg-hover)" } : void 0,
                  children: [
                    (0, t.jsx)("span", {
                      className: `type-product-sm flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded border text-[11px] ${r ? "border-transparent text-white" : "border-theme-border-02"}`,
                      style: r ? { backgroundColor: "#C08532" } : void 0,
                      children: s,
                    }),
                    (0, t.jsx)("span", { className: "type-product-base", children: z(e.label) }),
                  ],
                },
                e.id,
              );
            }),
            (M[45] = z),
            (M[46] = B.allowMultiple),
            (M[47] = B.id),
            (M[48] = G),
            (M[49] = e))
          : (e = M[49]),
          (N = B.options.map(e)),
          (M[39] = z),
          (M[40] = B.allowMultiple),
          (M[41] = B.id),
          (M[42] = B.options),
          (M[43] = G),
          (M[44] = N);
      } else N = M[44];
      return (
        M[50] !== N
          ? (($ = (0, t.jsx)("div", { className: "space-y-0.5", children: N })),
            (M[50] = N),
            (M[51] = $))
          : ($ = M[51]),
        M[52] !== z ? ((k = z((0, r.msg)("Skip"))), (M[52] = z), (M[53] = k)) : (k = M[53]),
        M[54] !== F || M[55] !== k
          ? ((S = (0, t.jsx)("button", {
              type: "button",
              onClick: F,
              className:
                "text-theme-text-sec hover:text-theme-text type-product-base flex cursor-pointer items-center rounded px-1.5 py-0.5 text-xs",
              children: k,
            })),
            (M[54] = F),
            (M[55] = k),
            (M[56] = S))
          : (S = M[56]),
        M[57] === Symbol.for("react.memo_cache_sentinel")
          ? ((C = { backgroundColor: "#C08532" }), (M[57] = C))
          : (C = M[57]),
        M[58] !== D || M[59] !== z || M[60] !== L.length
          ? ((E = D === L.length - 1 ? z((0, r.msg)("Build")) : z((0, r.msg)("Continue"))),
            (M[58] = D),
            (M[59] = z),
            (M[60] = L.length),
            (M[61] = E))
          : (E = M[61]),
        M[62] !== X || M[63] !== E
          ? ((R = (0, t.jsx)("button", {
              type: "button",
              onClick: X,
              className:
                "type-product-base-medium flex cursor-pointer items-center rounded px-1.5 py-0.5 text-xs text-white hover:brightness-110",
              style: C,
              children: E,
            })),
            (M[62] = X),
            (M[63] = E),
            (M[64] = R))
          : (R = M[64]),
        M[65] !== S || M[66] !== R
          ? ((A = (0, t.jsxs)("div", {
              className: "mt-1.5 flex items-center justify-end gap-2",
              children: [S, R],
            })),
            (M[65] = S),
            (M[66] = R),
            (M[67] = A))
          : (A = M[67]),
        M[68] !== _ || M[69] !== $ || M[70] !== A
          ? ((P = (0, t.jsxs)("div", { className: "pt-1 pr-2 pb-2 pl-2", children: [_, $, A] })),
            (M[68] = _),
            (M[69] = $),
            (M[70] = A),
            (M[71] = P))
          : (P = M[71]),
        M[72] !== B.id || M[73] !== w || M[74] !== P
          ? ((T = (0, t.jsx)("div", {
              className: "grid w-full",
              children: (0, t.jsxs)(
                "div",
                {
                  className: "bg-theme-product-editor border-theme-border-02 rounded-lg border",
                  children: [w, P],
                },
                K,
              ),
            })),
            (M[72] = B.id),
            (M[73] = w),
            (M[74] = P),
            (M[75] = T))
          : (T = M[75]),
        T
      );
    }
    var u = e.i(449008),
      m = e.i(125467),
      p = e.i(573772),
      f = e.i(928402);
    let g = {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -6 },
    };
    function x(e) {
      let i = e.split("\n");
      return i
        .map((e, s) => {
          if (!e.trim()) {
            i[s - 1]?.trim(), i[s + 1]?.trim();
            let e = /^(\s*)(•|\*|-)\s+/.test(i[s - 1] || ""),
              r = /^(\s*)(•|\*|-)\s+/.test(i[s + 1] || "");
            return e || r ? null : (0, t.jsx)("br", {}, `br-${s}`);
          }
          let r = e.match(/^(\s*)(•|\*|-)\s+(.*)$/);
          if (r) {
            let [, e, , n] = r,
              a = Math.floor(e.length / 2),
              l = v(n, s),
              o = i.slice(s + 1).find((e) => (e || "").trim()),
              d = !o || !/^(\s*)(•|\*|-)\s+/.test(o);
            return (0, t.jsxs)(
              "div",
              {
                className: `flex items-start gap-1 py-1 ${d ? "pb-2" : ""}`,
                style: { paddingLeft: 16 * a + "px" },
                children: [
                  (0, t.jsx)("span", { className: "text-theme-text-sec", children: "•" }),
                  (0, t.jsx)("div", { className: "flex-1", children: l }),
                ],
              },
              `line-${s}`,
            );
          }
          let n = v(e, s);
          return (0, t.jsx)("div", { className: "min-h-[1.5em]", children: n }, `line-${s}`);
        })
        .filter(Boolean);
    }
    function v(e, i) {
      return e.split(/(`[^`]+`)/g).map((e, s) => {
        let r;
        if (e.startsWith("`") && e.endsWith("`"))
          return (0, t.jsx)(
            "code",
            {
              className:
                "bg-theme-card-04-hex type-product-base-mono text-theme-text rounded-2xs px-0.5",
              children: e.slice(1, -1),
            },
            `${i}-${s}`,
          );
        let a = (e, i) => {
            let s = e;
            return (
              (s = (s = s
                .split(/(\*\*[^*]+\*\*)/g)
                .map((e, s) =>
                  e.startsWith("**") && e.endsWith("**")
                    ? (0, t.jsx)(
                        "span",
                        { className: "font-semibold", children: e.slice(2, -2) },
                        `${i}-b-${s}`,
                      )
                    : e,
                )).map((e, s) =>
                "string" == typeof e
                  ? e
                      .split(/(\*[^*]+\*)/g)
                      .map((e, r) =>
                        e.startsWith("*") && e.endsWith("*") && e.length > 2
                          ? (0, t.jsx)("em", { children: e.slice(1, -1) }, `${i}-i-${s}-${r}`)
                          : e,
                      )
                  : e,
              )),
              (0, t.jsx)(n.default.Fragment, { children: s }, `${i}`)
            );
          },
          l = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
          o = 0,
          d = [];
        for (; null !== (r = l.exec(e)); ) {
          let n = e.slice(o, r.index);
          n && d.push(a(n, `${i}-${s}-t-${o}`));
          let l = r[1],
            c = r[2];
          d.push(
            (0, t.jsx)(
              "a",
              { href: c, style: { color: "var(--color-theme-accent)" }, children: l },
              `${i}-${s}-a-${r.index}`,
            ),
          ),
            (o = r.index + r[0].length);
        }
        let c = e.slice(o);
        return d.length > 0
          ? (c && d.push(a(c, `${i}-${s}-t-end`)),
            (0, t.jsx)(n.default.Fragment, { children: d }, `${i}-${s}`))
          : a(e, `${i}-${s}-t`);
      });
    }
    e.s(
      [
        "default",
        0,
        function ({
          messages: e,
          onSend: o,
          placeholder: d,
          streamInitialMessages: c = !1,
          title: v = (0, r.msg)("New Agent", { $context: "as in an AI agent" }),
          onOpenFile: b,
          onCodeMessageVisible: y,
          onInitialPlaybackDone: w,
          textSizePx: j = 13,
          textOnly: _ = !1,
          typographyClassName: N = "type-product-base",
          defaultMode: $,
          defaultModel: k,
          questions: S,
        }) {
          let C = (0, r.useGT)(),
            E = (0, r.useMessages)();
          v = E(v);
          let R = (0, f.usePrefersReducedMotion)(),
            A = (0, n.useRef)(null),
            P = (0, n.useMemo)(() => e.find((e) => "user" === e.role), [e]),
            T = (0, n.useMemo)(() => (P ? e.filter((e) => e.id !== P.id) : e), [e, P]),
            [M, L] = (0, n.useState)(c && !R ? [] : T),
            U = (0, n.useRef)(!1),
            F = (0, n.useMemo)(() => T.map((e) => `${e.id}:${e.role}`).join("|"), [T]),
            [z, D] = (0, n.useState)(new Set()),
            O = (0, n.useRef)(new Set()),
            W = (0, n.useRef)(!1),
            V = (0, n.useRef)(!c),
            [B, I] = (0, n.useState)(!1),
            [Z, H] = (0, n.useState)(!1),
            [X, J] = (0, n.useState)(!1),
            G = (0, n.useRef)(new Set()),
            K = (0, n.useRef)(e),
            Y = (0, n.useRef)(!1);
          (0, n.useEffect)(() => {
            H(!0);
          }, []),
            (0, n.useEffect)(() => {
              A.current?.scrollTo({ top: A.current.scrollHeight });
            }, [M.length]),
            (0, n.useEffect)(() => {
              (!c || R) && (G.current = new Set(e.map((e) => e.id)));
            }, [R]);
          let q = (e) => (0, l.getDelayForRole)(e);
          (0, n.useEffect)(() => {
            if ((U.current, !c || R)) {
              L(T),
                (U.current = c),
                (W.current = !1),
                (V.current = !0),
                J(!0),
                Z && setTimeout(() => I(!0), 600),
                (K.current = T);
              return;
            }
            let e = K.current,
              t = e.length > 0 && T.length >= e.length && e.every((e, t) => e.id === T[t]?.id);
            if (V.current && t) {
              L(T), (K.current = T);
              return;
            }
            if (
              (L([]),
              (O.current = new Set()),
              D(new Set()),
              (W.current = !1),
              (V.current = !1),
              I(!1),
              J(!1),
              (U.current = c),
              V.current || W.current)
            )
              return;
            W.current = !0;
            let i = !1;
            return (
              (async () => {
                for (let e = 0; e < T.length && !i; e++) {
                  let t = T[e];
                  if ((L((e) => [...e, t]), !Y.current && "code" === t.role)) {
                    Y.current = !0;
                    let e = t.text.split(" ")[0];
                    y?.(e);
                  }
                  let i = (0, l.isToolRole)(t.role),
                    s = q(t.role);
                  i &&
                    D((e) => {
                      let i = new Set(e);
                      return i.add(t.id), i;
                    }),
                    await new Promise((e) => setTimeout(e, s)),
                    i &&
                      (D((e) => {
                        let i = new Set(e);
                        return i.delete(t.id), i;
                      }),
                      O.current.add(t.id));
                }
                if (!i) {
                  (V.current = !0), (W.current = !1), J(!0), setTimeout(() => I(!0), 800);
                  try {
                    w?.();
                  } catch {}
                }
              })(),
              () => {
                i = !0;
              }
            );
          }, [c, F, T, y, w, R, Z]),
            (0, n.useEffect)(() => {
              (!c || V.current || R) && L(T);
            }, [T, c, R]),
            (0, n.useEffect)(() => {
              if (Y.current) return;
              let e = M.find((e) => "code" === e.role);
              if (e) {
                Y.current = !0;
                let t = e.text.split(" ")[0];
                y?.(t);
              }
            }, [M, y]),
            (0, n.useEffect)(() => {
              for (let e of M) G.current.add(e.id);
            }, [M]),
            (0, n.useEffect)(() => {
              if (!c || !V.current) return;
              let e = [];
              return (
                M.forEach((t) => {
                  let i, s;
                  if (((i = t.role), !(0, l.isToolRole)(i) || O.current.has(t.id))) return;
                  D((e) => {
                    if (e.has(t.id)) return e;
                    let i = new Set(e);
                    return i.add(t.id), i;
                  });
                  let r = window.setTimeout(
                    () => {
                      D((e) => {
                        let i = new Set(e);
                        return i.delete(t.id), i;
                      }),
                        O.current.add(t.id);
                    },
                    ((s = t.role), (0, l.getDelayForRole)(s)),
                  );
                  e.push(r);
                }),
                () => {
                  e.forEach((e) => window.clearTimeout(e));
                }
              );
            }, [M, c]);
          let Q = async () => {
              for (let e of (I(!1),
              [
                {
                  id: `fu-thinking-${Date.now()}`,
                  role: "thinking",
                  text: (0, r.msg)("Thought 4s"),
                },
                {
                  id: `fu-search-${Date.now()}`,
                  role: "search",
                  text: (0, r.msg)("Planning next moves based on your preferences"),
                },
                {
                  id: `fu-read-${Date.now()}`,
                  role: "read",
                  text: (0, r.msg)("Read feature-prd.md"),
                },
                {
                  id: `fu-code-${Date.now()}`,
                  role: "code",
                  text: (0, r.msg)("feature-prd.md +21 -8"),
                },
                {
                  id: `fu-final-${Date.now()}`,
                  role: "assistant",
                  text: (0, r.msg)("Plan updated. Ready to build!"),
                },
              ]))
                L((t) => [...t, e]),
                  "thinking" === e.role
                    ? (D((t) => new Set([...t, e.id])),
                      await new Promise((e) => setTimeout(e, 800)),
                      D((t) => {
                        let i = new Set(t);
                        return i.delete(e.id), i;
                      }))
                    : "search" === e.role || "read" === e.role
                      ? (D((t) => new Set([...t, e.id])),
                        await new Promise((e) => setTimeout(e, 600)),
                        D((t) => {
                          let i = new Set(t);
                          return i.delete(e.id), i;
                        }))
                      : "code" === e.role
                        ? (D((t) => new Set([...t, e.id])),
                          await new Promise((e) => setTimeout(e, 500)),
                          D((t) => {
                            let i = new Set(t);
                            return i.delete(e.id), i;
                          }),
                          y?.("feature-prd.md"))
                        : await new Promise((e) => setTimeout(e, 300));
            },
            ee = S && S.length > 0;
          return _
            ? (0, t.jsx)("div", {
                className: "w-full",
                children: M.map((e, i) =>
                  (0, t.jsx)(
                    "div",
                    {
                      className: "w-full",
                      children:
                        "assistant" === e.role
                          ? (0, t.jsx)("div", {
                              className: `text-theme-text ${N}`,
                              style: { fontSize: `${j}px` },
                              children: x(E(e.text)),
                            })
                          : (0, t.jsx)("div", {
                              className: `text-theme-text ${N} break-words whitespace-pre-wrap`,
                              style: { fontSize: `${j}px` },
                              children: E(e.text),
                            }),
                    },
                    e.id,
                  ),
                ),
              })
            : (0, t.jsxs)("div", {
                className: "bg-theme-product-chrome flex h-full w-full flex-col",
                children: [
                  (0, t.jsx)("div", {
                    className:
                      "text-theme-text type-product-base-medium flex h-8 items-center px-3 pt-2",
                    children: (0, t.jsx)("div", {
                      className: "mx-auto w-full max-w-[580px]",
                      children: E(v),
                    }),
                  }),
                  (0, t.jsx)("div", {
                    ref: A,
                    className: "thin-scrollbar flex-1 overflow-auto overscroll-y-auto px-3 pt-0",
                    children: (0, t.jsxs)("div", {
                      className: "mx-auto w-full max-w-[580px]",
                      children: [
                        " ",
                        P
                          ? (0, t.jsxs)("div", {
                              className: "sticky top-0 z-10",
                              children: [
                                (0, t.jsx)("div", {
                                  className: "bg-theme-product-chrome",
                                  children: (0, t.jsx)("div", {
                                    className:
                                      "bg-theme-product-editor border-theme-border-02 text-theme-text type-product-base ml-auto w-full rounded-lg border px-2 py-1.5 break-words whitespace-pre-wrap",
                                    style: { fontSize: `${j}px` },
                                    children: P.text,
                                  }),
                                }),
                                (0, t.jsx)("div", {
                                  className:
                                    "from-theme-product-chrome pointer-events-none h-2 bg-gradient-to-b to-transparent",
                                }),
                              ],
                            })
                          : null,
                        (0, t.jsx)(i.AnimatePresence, {
                          initial: !1,
                          mode: "popLayout",
                          children: M.map((e) => {
                            let i, r, n, a, l, o, d, c, h, f, v, y, w, _, $, k, S, R;
                            return (0, t.jsx)(
                              s.motion.div,
                              {
                                variants: g,
                                initial: !G.current.has(e.id) && "initial",
                                animate: "animate",
                                exit: "exit",
                                transition: {
                                  duration: 0.18 * !G.current.has(e.id),
                                  ease: "easeOut",
                                  delay: 0,
                                },
                                className: `w-full ${("thinking" === e.role || "search" === e.role || e.role, "")}`,
                                children: (0, t.jsx)("div", {
                                  className: `rounded-lg ${"user" === e.role ? "bg-theme-product-editor border-theme-border-02 mb-2 ml-auto w-full border px-2 py-2" : "code" === e.role ? "bg-theme-product-editor border-theme-border-02 mt-1 mb-1 cursor-pointer rounded border p-2" : "terminal" === e.role ? "bg-theme-product-editor border-theme-border-02 mt-1 mb-1 rounded border p-2" : "browser" === e.role || "thinking" === e.role || "search" === e.role || "read" === e.role ? "w-full px-1 py-1" : "w-full px-1 py-2"}`,
                                  onClick: () => {
                                    if ("code" !== e.role) return;
                                    let t = e.text.split(" ")[0];
                                    b?.(t);
                                  },
                                  onMouseEnter: (t) => {
                                    "code" === e.role &&
                                      (t.currentTarget.style.backgroundColor =
                                        "var(--color-theme-card-hover-hex)");
                                  },
                                  onMouseLeave: (t) => {
                                    "code" === e.role &&
                                      (t.currentTarget.style.backgroundColor = "");
                                  },
                                  children:
                                    "code" === e.role
                                      ? ((r = (i = e.text.split(" "))[0]),
                                        (a = (n = i.slice(1).join(" ")).match(/\+(\d+)/)),
                                        (l = n.match(/-(\d+)/)),
                                        (0, t.jsxs)("div", {
                                          className: "flex items-center gap-1.5",
                                          title: C("Open {fileName}", { fileName: r }),
                                          children: [
                                            (0, t.jsx)(u.default, {
                                              className: "text-theme-text-sec",
                                            }),
                                            (0, t.jsxs)("span", {
                                              className: `text-theme-text ${N}`,
                                              children: [
                                                (0, t.jsx)("span", {
                                                  className: "font-medium",
                                                  children: r,
                                                }),
                                                a &&
                                                  (0, t.jsxs)("span", {
                                                    className:
                                                      "text-theme-product-ansi-green ml-1.5",
                                                    children: ["+", a[1]],
                                                  }),
                                                l &&
                                                  (0, t.jsxs)("span", {
                                                    className: "text-theme-product-ansi-red ml-0.5",
                                                    children: ["-", l[1]],
                                                  }),
                                              ],
                                            }),
                                          ],
                                        }))
                                      : "terminal" === e.role
                                        ? ((d = (o = e.text.split("\n"))[0]),
                                          (h =
                                            (c = o.slice(1).join("\n"))
                                              .toLowerCase()
                                              .includes("error") ||
                                            c.toLowerCase().includes("failed")),
                                          (f =
                                            c.toLowerCase().includes("passed") ||
                                            c.toLowerCase().includes("success") ||
                                            c.includes("✓")),
                                          (0, t.jsxs)("div", {
                                            className: "space-y-1",
                                            children: [
                                              (0, t.jsxs)("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                  (0, t.jsx)(m.default, {
                                                    className: "text-theme-text-sec flex-shrink-0",
                                                  }),
                                                  (0, t.jsx)("span", {
                                                    className:
                                                      "type-product-base-mono text-theme-text font-medium",
                                                    children: d,
                                                  }),
                                                ],
                                              }),
                                              c &&
                                                (0, t.jsx)("pre", {
                                                  className: `type-product-base-mono ml-5 whitespace-pre-wrap text-xs ${h ? "text-theme-product-ansi-red" : f ? "text-theme-product-ansi-green" : "text-theme-text-sec"}`,
                                                  children: c,
                                                }),
                                            ],
                                          }))
                                        : "browser" === e.role
                                          ? ((v = e.text),
                                            (0, t.jsxs)("div", {
                                              className: "flex items-center gap-1.5",
                                              children: [
                                                (0, t.jsx)(p.Globe, {
                                                  size: 14,
                                                  className: "text-theme-text-sec flex-shrink-0",
                                                  weight: "duotone",
                                                }),
                                                (0, t.jsx)("span", {
                                                  className: `text-theme-text-sec ${N} text-xs`,
                                                  children: v,
                                                }),
                                              ],
                                            }))
                                          : ((y =
                                              "thinking" === e.role ||
                                              "search" === e.role ||
                                              "read" === e.role),
                                            (w = z.has(e.id)),
                                            ($ = (_ = e.text.split(" "))[0]),
                                            (k = _.slice(1).join(" ")),
                                            (S = $),
                                            (R = k),
                                            y &&
                                              w &&
                                              ("thinking" === e.role
                                                ? ((S = C("Planning")), (R = C("next moves")))
                                                : "search" === e.role
                                                  ? (S = C("Searching"))
                                                  : "read" === e.role && (S = C("Reading"))),
                                            (0, t.jsx)("div", {
                                              className: `${N} ${y ? "text-theme-text-sec flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap" : "assistant" === e.role ? "text-theme-text" : "text-theme-text break-words whitespace-pre-wrap"}`,
                                              style: { fontSize: y ? "12px" : `${j}px` },
                                              children: y
                                                ? w
                                                  ? (0, t.jsx)("span", {
                                                      className: "shimmer",
                                                      style: {
                                                        "--shimmer-color":
                                                          "var(--color-theme-text-sec)",
                                                        "--shimmer-intensity": "80%",
                                                      },
                                                      children:
                                                        "thinking" === e.role
                                                          ? C("Planning next moves")
                                                          : "search" === e.role
                                                            ? C("Searching {rest}", { rest: k })
                                                            : C("Reading {rest}", { rest: k }),
                                                    })
                                                  : (0, t.jsxs)("div", {
                                                      className:
                                                        "flex items-baseline gap-1 overflow-hidden",
                                                      children: [
                                                        (0, t.jsx)("span", {
                                                          className:
                                                            "text-theme-text-sec flex-shrink-0",
                                                          children: S,
                                                        }),
                                                        R &&
                                                          (0, t.jsx)("span", {
                                                            className:
                                                              "text-theme-text-sec min-w-0 truncate opacity-60",
                                                            children: R,
                                                          }),
                                                      ],
                                                    })
                                                : "assistant" === e.role
                                                  ? x(E(e.text))
                                                  : "user" === e.role &&
                                                      e.attachments &&
                                                      e.attachments.length > 0
                                                    ? (0, t.jsxs)("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                          (0, t.jsx)("div", {
                                                            className: "flex flex-wrap gap-1.5",
                                                            children: e.attachments.map((e) =>
                                                              (0, t.jsxs)(
                                                                "div",
                                                                {
                                                                  className:
                                                                    "bg-theme-product-chrome border-theme-border-02 flex items-center gap-1.5 rounded-md border px-2 py-1",
                                                                  children: [
                                                                    (0, t.jsx)(u.default, {
                                                                      className:
                                                                        "text-theme-text-ter h-3.5 w-3.5",
                                                                    }),
                                                                    (0, t.jsx)("span", {
                                                                      className:
                                                                        "text-theme-text-sec text-xs",
                                                                      children: e.name,
                                                                    }),
                                                                  ],
                                                                },
                                                                e.name,
                                                              ),
                                                            ),
                                                          }),
                                                          (0, t.jsx)("div", {
                                                            children: E(e.text),
                                                          }),
                                                        ],
                                                      })
                                                    : E(e.text),
                                            })),
                                }),
                              },
                              e.id,
                            );
                          }),
                        }),
                        (0, t.jsx)("div", {
                          className:
                            "from-theme-product-chrome pointer-events-none sticky bottom-0 z-20 h-2 bg-gradient-to-t to-transparent",
                        }),
                      ],
                    }),
                  }),
                  (0, t.jsx)(i.AnimatePresence, {
                    children:
                      ee &&
                      Z &&
                      X &&
                      B &&
                      (0, t.jsx)(s.motion.div, {
                        initial: { opacity: 0, y: 12 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 12 },
                        transition: { duration: 0.25, ease: "easeOut" },
                        className: "relative z-10 mt-2 mb-2 px-3",
                        children: (0, t.jsx)("div", {
                          className: "mx-auto w-full max-w-[580px]",
                          children: (0, t.jsx)(h, {
                            questions: S,
                            onComplete: Q,
                            onSkip: () => {
                              Q();
                            },
                          }),
                        }),
                      }),
                  }),
                  (0, t.jsx)("div", {
                    className: "bg-theme-product-chrome relative z-20 p-3 pt-0",
                    children: (0, t.jsx)("div", {
                      className: "mx-auto w-full max-w-[580px]",
                      children: (0, t.jsx)("div", {
                        className: `overflow-hidden rounded-lg border ${ee && B ? "bg-theme-product-editor border-theme-border-02" : "border-theme-border-02 focus-within:border-theme-primary focus-within:bg-theme-product-editor"}`,
                        children: (0, t.jsx)(a.default, {
                          onSend: (t) => {
                            (W.current = !1), (V.current = !0), L(T), D(new Set());
                            try {
                              G.current = new Set(e.map((e) => e.id));
                            } catch {}
                            o(t);
                          },
                          placeholder: ee && B ? C("Add follow-up...") : d,
                          frameless: !0,
                          textSizePx: j,
                          defaultMode: $,
                          defaultModel: k,
                        }),
                      }),
                    }),
                  }),
                ],
              });
        },
      ],
      919473,
    );
  },
]);
