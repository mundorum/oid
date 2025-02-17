var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
const css = (strings, ...values) => String.raw({ raw: strings }, ...values);
class Bus {
  constructor() {
    this._listeners = {};
    this._listenersRgx = [];
    this._providers = {};
    this._pendingCnx = {};
  }
  /* Message-oriented communication
   ********************************/
  subscribe(subscribed, handler2) {
    if (subscribed != null) {
      let topics = {};
      if (typeof subscribed === "string" && handler2 != null)
        topics[subscribed] = handler2;
      else if (typeof subscribed === "object")
        topics = subscribed;
      const listenersRgx = this._listenersRgx.slice();
      const listeners = { ...this._listeners };
      for (const tp in topics) {
        if (topics[tp] != null) {
          if (tp.includes("+") || tp.includes("#"))
            listenersRgx.push([Bus._convertRegExp(tp), topics[tp], tp]);
          else {
            if (listeners[tp] == null)
              listeners[tp] = [];
            else
              listeners[tp] = listeners[tp].slice();
            listeners[tp].push(topics[tp]);
          }
        }
      }
      this._listenersRgx = listenersRgx;
      this._listeners = listeners;
    }
  }
  unsubscribe(subscribed) {
    if (subscribed != null) {
      const topics = {};
      if (typeof subscribed === "string" && handler != null)
        topics[subscribed] = handler;
      else if (typeof subscribed === "object")
        topics = subscribed;
      const listenersRgx = this._listenersRgx.slice();
      const listeners = { ...this._listeners };
      for (const tp in topics) {
        if (tp.includes("+") || tp.includes("#")) {
          for (const l in listenersRgx) {
            if (listenersRgx[l][1] === topics[tp] && listenersRgx[l][2] == tp) {
              listenersRgx.splice(l, 1);
              break;
            }
          }
        } else if (listeners[tp] != null) {
          for (const l in listeners[tp]) {
            if (listeners[tp][l] === topics[tp]) {
              listeners[tp] = listeners[tp].toSplice(l, 1);
              break;
            }
          }
        }
      }
      this._listenersRgx = listenersRgx;
      this._listeners = listeners;
    }
  }
  async publish(topic, message) {
    if (this._listeners[topic] != null)
      for (const handler2 of this._listeners[topic])
        handler2(topic, message);
    const listenersRgx = this._listenersRgx;
    for (const l of listenersRgx) {
      const match = l[0].exec(topic);
      if (match != null && match[0] === topic)
        l[1](topic, message);
    }
  }
  /* Message analysis services
     *************************/
  static _convertRegExp(filter) {
    return new RegExp(filter.replace(/\//g, "\\/").replace(/\+/g, "[^/]+").replace(/#/g, ".+"));
  }
  /* Connection-oriented communication
   ***********************************/
  /*
   * Components declare provided services. Each interface defines a type of
   *  service. The same component can have several interfaces/services:
   *   cInterface: interface provided by the component
   *   id: unique id of the component instance that offers the service
   *   provider: the component or component subobject that implements
   *             the interface/service
   */
  provide(cInterface, id, provider) {
    let status = false;
    if (id != null && cInterface != null && provider != null) {
      const key = cInterface + "#" + id;
      if (this._providers[key] == null) {
        status = true;
        this._providers[key] = provider;
        if (this._pendingCnx[key] != null) {
          for (let c of this._pendingCnx[key])
            c.connectionReady(cInterface, id, provider);
          delete this._pendingCnx[key];
        }
      }
    }
    return status;
  }
  /*
   * Removes a provided service (usually, when the component is destroyed)
   */
  withhold(cInterface, id) {
    let status = false;
    if (id != null && cInterface != null) {
      const key = cInterface + "#" + id;
      if (this._providers[key]) {
        status = true;
        delete this._providers[key];
      }
    }
    return status;
  }
  /*
   * Connects a component to another one based on the id and a provided service.
   *   id: id of the component that offers the service
   *   cInterface: label related to the provided interface
   *   callback: component that will be notified as soon as the interface is
   *             connected
   */
  connect(cInterface, id, callback) {
    if (id != null && cInterface != null && callback != null) {
      const key = cInterface + "#" + id;
      if (this._providers[key])
        callback.connectionReady(cInterface, id, this._providers[key]);
      else if (this._pendingCnx[key])
        this._pendingCnx[key].push(callback);
      else
        this._pendingCnx[key] = [callback];
    }
  }
  /*
   * Triggers a interface defined by an id and component, sending an optional
   * message to it.
   */
  async invoke(cInterface, id, notice, message) {
    const key = cInterface + "#" + id;
    if (this._providers[key] != null)
      return await this._providers[key].handleInvoke(cInterface, notice, message);
    else
      return null;
  }
}
Bus.i = new Bus();
const sphereSetup = {
  id: "default",
  bus: Bus.i,
  stylesheets: "/lib/foundation/",
  stydefault: ["stylesheets:oiddefault.css"],
  assets: "/assets/"
};
class Sphere {
  constructor(id, bus, stylesheets, stydefault, assets) {
    this._id = id || null;
    this._bus = bus ? bus : Sphere.i.bus;
    this._stylesheets = stylesheets ? stylesheets : Sphere.i.stylesheets;
    this._stydefault = stydefault ? stydefault : Sphere.i.stydefault;
    this._assets = assets ? assets : Sphere.i.assets;
  }
  static create(id, bus, stylesheets, stydefault, assets) {
    if (id != null && Sphere._spheres[id] != null)
      throw new Error(`Sphere with id ${id} already exists`);
    const sphere = new Sphere(id, bus, stylesheets, stydefault, assets);
    if (id != null)
      Sphere._spheres[id] = sphere;
    return sphere;
  }
  static get(id) {
    return id ? Sphere._spheres[id] || null : null;
  }
  get id() {
    return this._id;
  }
  get bus() {
    return this._bus;
  }
  set stylesheets(newValue) {
    this._stylesheets = newValue;
  }
  get stylesheets() {
    return this._stylesheets;
  }
  set stydefault(newValue) {
    this._stydefault = newValue;
  }
  get stydefault() {
    return this._stydefault;
  }
  set assets(newValue) {
    this._assets = newValue;
  }
  get assets() {
    return this._assets;
  }
}
Sphere._spheres = {};
Sphere.i = Sphere.create(
  sphereSetup.id,
  sphereSetup.bus,
  sphereSetup.stylesheets,
  sphereSetup.stydefault,
  sphereSetup.assets
);
class OidSphere extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute("global")) {
      this._sphere = Sphere.i;
      if (this.hasAttribute("stylesheets"))
        Sphere.i.stydefault = this.getAttribute("stylesheets");
      if (this.hasAttribute("stydefault"))
        Sphere.i.stydefault = this.getAttribute("stydefault");
      if (this.hasAttribute("assets"))
        Sphere.i.assets = this.getAttribute("assets");
    } else {
      const id = this.getAttribute("id");
      if (Sphere.get(id))
        this._sphere = Sphere.get(id);
      else
        this._sphere = Sphere.create(
          this.getAttribute("id"),
          new Bus(),
          this.getAttribute("stylesheets"),
          this.getAttribute("stydefault"),
          this.getAttribute("assets")
        );
    }
  }
  get id() {
    return this._sphere.id;
  }
  get stylesheets() {
    return this._sphere.stylesheets;
  }
  get stydefault() {
    return this._sphere.stydefault;
  }
  get assets() {
    return this._sphere.assets;
  }
  get sphere() {
    return this._sphere;
  }
}
OidSphere.elementTag = "oid-sphere";
customElements.define(OidSphere.elementTag, OidSphere);
class Primitive extends HTMLElement {
  constructor() {
    super();
    this._sphere = null;
  }
  get _bus() {
    return this._sphere == null ? null : this._sphere.bus;
  }
  connectedCallback() {
    let ag = this._findAggregator(OidSphere);
    if (ag != null)
      this._sphere = ag.sphere;
    else
      this._sphere = Sphere.i;
  }
  _findAggregator(agClass) {
    let parent = this.parentNode != null ? this.parentNode : this instanceof DocumentFragment ? this.host : null;
    while (parent != null && !(parent instanceof agClass))
      parent = parent.parentNode != null ? parent.parentNode : parent instanceof DocumentFragment ? parent.host : null;
    return parent;
  }
  /*
   * Bus Proxy
   */
  _subscribe(subscribed, handler2) {
    if (this._bus != null)
      this._bus.subscribe(subscribed, handler2);
  }
  _unsubscribe(subscribed, handler2) {
    this._bus.unsubscribe(subscribed, handler2);
  }
  async _publish(topic, message) {
    await this._bus.publish(topic, message);
  }
  _provide(cInterface, id, provider) {
    this._bus.provide(cInterface, id, provider);
  }
  _withhold(cInterface, id) {
    this._bus.withhold(cInterface, id);
  }
  _connect(cInterface, id, callback) {
    this._bus.connect(cInterface, id, callback);
  }
  async _invoke(cInterface, id, notice, message) {
    return await this._bus.invoke(cInterface, id, notice, message);
  }
}
class OidBase extends Primitive {
  constructor() {
    super();
    this._mapTopicNotice = {};
    this._rgxTopicNotice = [];
    this._mapNoticeTopic = {};
    this._receiveHandler = {};
    this._provideHandler = {};
    this._connected = {};
    this._convertNotice = this._convertNotice.bind(this);
    this.handleNotice = this.handleNotice.bind(this);
  }
  async connectedCallback() {
    super.connectedCallback();
    await this._initialize();
  }
  disconnectedCallback() {
    this._finalize();
  }
  async _initialize() {
    const spec = this.constructor.spec;
    if (spec) {
      this._buildHandlers(this._receiveHandler, spec.receive);
      this._buildProviders();
      this._buildProvidersHandlers();
      this._buildEventDispatchers(spec.dispatcher);
    }
    if (spec && spec.properties) {
      for (const [prop, def] of Object.entries(spec.properties))
        if (def.default != null && !this.hasAttribute(prop))
          this[prop] = def.default;
    }
    if (this.hasAttribute("custom"))
      this._custom = await Oid.getCustom(spec.id, this.getAttribute("custom"));
    if (this.hasAttribute("publish"))
      this._publishNoticeTopic(this.getAttribute("publish"));
    if (this.hasAttribute("subscribe"))
      this._subscribeTopicNotice(this.getAttribute("subscribe"));
    if (this.hasAttribute("connect"))
      this._connectInterface(this.getAttribute("connect"));
  }
  _buildProviders() {
    const spec = this.constructor.spec;
    if (spec.provide != null && this.id)
      for (const p in spec.provide)
        this._provide(p, this.id, this);
  }
  _buildProvidersHandlers() {
    const spec = this.constructor.spec;
    if (spec.provide != null)
      for (const p in spec.provide) {
        this._buildHandlers(
          this._provideHandler,
          spec.provide[p].operations,
          p
        );
      }
  }
  _removeProviders() {
    const spec = this.constructor.spec;
    if (spec.provide != null && this.id)
      for (const p in spec.provide)
        this._withhold(p, this.id);
  }
  _buildHandlers(handlerSet, handlersSpec, cInterface) {
    if (handlersSpec != null) {
      const prefix = cInterface == null ? "" : cInterface + ".";
      if (Array.isArray(handlersSpec)) {
        for (const notice of handlersSpec)
          if (handlerSet[prefix + notice] == null)
            handlerSet[prefix + notice] = this["handle" + notice[0].toUpperCase() + notice.slice(1)].bind(this);
      } else {
        for (const [notice, noticeSpec] of Object.entries(handlersSpec)) {
          if (handlerSet[prefix + notice] == null) {
            const meth = typeof noticeSpec === "string" ? noticeSpec : noticeSpec.handler != null ? noticeSpec.handler : "handle" + notice[0].toUpperCase() + notice.slice(1);
            handlerSet[prefix + notice] = this[meth].bind(this);
          }
        }
      }
    }
  }
  _buildEventDispatchers(dispatcherTempl) {
    if (dispatcherTempl) {
      this._dispatcher = [];
      for (const [atr, event, dispatch] of dispatcherTempl)
        this._dispatcher.push([atr, event, dispatch.bind(this)]);
    }
  }
  _finalize() {
    this._removeProviders();
    for (const topic in this._mapTopicNotice)
      if (this._mapTopicNotice[topic] != topic)
        this._unsubscribe(topic, this._convertNotice);
      else
        this._unsubscribe(topic, this.handleNotice);
  }
  // call setter every time an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    const jsName = name.replace(
      /-([a-z])/g,
      (match, letter) => letter.toUpperCase()
    );
    this[jsName] = newValue;
  }
  static get observedAttributes() {
    return ["id"];
  }
  get id() {
    return this._id;
  }
  set id(newValue) {
    if (this._id != null && this._bus != null)
      this._removeProviders();
    this._id = newValue;
    if (this._bus != null)
      this._buildProviders();
  }
  get publish() {
    return this.getAttribute("publish");
  }
  /*
  set publish (newValue) {
    this._publishProp = newValue
    if (this._bus != null)
      this._publishNoticeTopic(newValue)
  }
  */
  get subscribe() {
    return this.getAttribute("subscribe");
  }
  /*
  set subscribe (newValue) {
    this._subscribeProp = newValue
    if (this._bus != null)
      this._subscribeTopicNotice(newValue)
  }
  */
  get connect() {
    return this.getAttribute("connect");
  }
  /*
  set connect (newValue) {
    this._connectProp = newValue
    if (this._bus != null)
      this._connectInterface(newValue)
  }
  */
  handleGet(notice, message) {
    if (message.property != null)
      return this[message.property];
    else
      return null;
  }
  handleSet(notice, message) {
    if (message.property != null && message.value != null)
      this[message.property] = message.value;
  }
  _subscribeTopicNotice(topicNotice) {
    const tpnts = topicNotice.split(";");
    for (const tn of tpnts) {
      const parts = tn.split("~");
      if (parts.length > 1) {
        const topic = parts[0].trim();
        if (topic.includes("+") || topic.includes("#"))
          this._rgxTopicNotice.push(
            [Bus._convertRegExp(topic), parts[1].trim(), topic]
          );
        else
          this._mapTopicNotice[topic] = parts[1].trim();
        this._subscribe(topic, this._convertNotice);
      } else {
        const topic = tn.trim();
        this._mapTopicNotice[topic] = topic;
        this._subscribe(topic, this.handleNotice);
      }
    }
  }
  _publishNoticeTopic(noticeTopic) {
    const nttps = noticeTopic.split(";");
    for (const nt of nttps) {
      const parts = nt.split("~");
      if (parts.length > 1)
        this._mapNoticeTopic[parts[0].trim()] = parts[1].trim();
      else
        this._mapNoticeTopic[nt.trim()] = nt.trim();
    }
  }
  _connectInterface(idInterface) {
    let status = true;
    const idint = idInterface.split(";");
    for (const ii of idint) {
      const parts = ii.split("#");
      if (parts.length > 1)
        this._connect(parts[0].trim(), parts[1].trim(), this);
      else
        status = false;
    }
    return status;
  }
  _notify(notice, message) {
    if (this._mapNoticeTopic[notice] != null)
      this._publish(this._mapNoticeTopic[notice], message);
  }
  _convertNotice(topic, message) {
    if (this._mapTopicNotice[topic] != null)
      this.handleNotice(this._mapTopicNotice[topic], message);
    else
      for (const [rgx, notice] of this._rgxTopicNotice) {
        const match = rgx.exec(topic);
        if (match != null && match[0] === topic) {
          this.handleNotice(notice, message);
          break;
        }
      }
  }
  connectTo(cInterface, component) {
    if (component.id)
      this._connect(cInterface, component.id, this);
  }
  connectionReady(cInterface, id, component) {
    if (this._connected[cInterface] == null)
      this._connected[cInterface] = [];
    this._connected[cInterface].push(id);
  }
  async _invoke(cInterface, notice, message) {
    const intSpec = Oid.getInterface(cInterface);
    if (this._connected[cInterface] != null) {
      if (intSpec.response != null && intSpec.response === true) {
        const responses = [];
        for (const id of this._connected[cInterface])
          responses.push(await this._bus.invoke(cInterface, id, notice, message));
        return intSpec.cardinality && intSpec.cardinality[2] == "1" ? responses[0] : responses;
      } else {
        for (const id of this._connected[cInterface])
          return await this._bus.invoke(cInterface, id, notice, message);
      }
    }
  }
  handleNotice(notice, message) {
    if (this._receiveHandler[notice] != null)
      this._receiveHandler[notice](notice, message);
  }
  handleInvoke(cInterface, notice, message) {
    let response = null;
    if (this._provideHandler[cInterface + "." + notice] != null)
      response = this._provideHandler[cInterface + "." + notice](notice, message);
    return response;
  }
  _customExists(field) {
    return this._custom != null && this._custom.hasOwnProperty(field);
  }
  _getCustomField(field) {
    return this._custom == null || this._custom[field] == null ? null : this._custom[field];
  }
  _callCustom(operation, parameters) {
    if (this._custom != null && this._custom[operation] != null)
      return this._custom[operation](this, parameters);
  }
}
class OidWeb extends OidBase {
}
class OidUI extends OidWeb {
  async connectedCallback() {
    await super.connectedCallback();
    this._stylesheets = this.constructor.spec.stylesheets.replace('href="default"', 'href="' + this._sphere.stydefault + '"').replace('href="stylesheets:', 'href="' + this._sphere.stylesheets);
    this.render();
  }
  render() {
    const spec = this.constructor.spec;
    let template = spec != null ? spec.template : null;
    if (this.template) {
      const tmpl = this.template();
      if (tmpl != this._template) {
        this._template = tmpl;
        const td = Oid.prepareDispatchers(tmpl, this.constructor);
        this._templatePre = td.template;
        this._buildEventDispatchers(td.dispatcher, this);
      }
      template = this._templatePre;
    }
    this._presentation = null;
    if (spec != null && template != null) {
      let customTemplate = this._getCustomField("style");
      customTemplate = customTemplate ? `<style>${customTemplate}</style>` : "";
      const html2 = (this._stylesheets + spec.styles + customTemplate + template).replace(
        /{{[ \t]*(url:)?[ \t]*this\.([^}]*)}}/g,
        (match, p1, p2) => {
          p2 = p2 ? p2.trim() : "";
          let value = this[p2] ? this[p2] : "";
          if (p1 === "url:")
            value = value.replace("assets:", this._sphere.assets);
          return value;
        }
      );
      if (spec.shadow === false) {
        this.innerHTML = html2;
        this._presentation = this.querySelector("#oid-prs") || this;
      } else
        this._presentation = this._shadowHTML(html2);
      if (this._dispatcher) {
        const query = spec.shadow === false ? this : this.shadowRoot;
        for (const [atr, event, dispatch] of this._dispatcher) {
          const target = query.querySelector("[" + atr + "]");
          target.addEventListener(event, dispatch);
        }
      }
    }
  }
  _shadowHTML(html2) {
    const clone = OidUI.prepareShadow(this, html2);
    return this.shadowRoot.querySelector("#oid-prs") || clone;
  }
  static prepareShadow(owner, html2) {
    const template = document.createElement("template");
    template.innerHTML = html2;
    const clone = document.importNode(template.content, true);
    if (!owner.shadowRoot)
      owner.attachShadow({ mode: "open" });
    else
      owner.shadowRoot.innerHTML = "";
    owner.shadowRoot.appendChild(clone);
    return clone;
  }
}
const _Oid = class _Oid {
  static cInterface(spec) {
    if (spec != null)
      _Oid._interfaceReg[spec.id] = spec;
  }
  static getInterface(cInterface) {
    return _Oid._interfaceReg[cInterface];
  }
  static component(spec) {
    spec = Object.assign({}, _Oid._defaultSpec, spec);
    let impl = spec.implementation;
    if (impl == null) {
      const inh = spec.ui === false || spec.template == null ? spec.element == null ? OidBase : OidWeb : OidUI;
      const className = spec.element[0].toUpperCase() + spec.element.slice(1).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
      impl = class extends inh {
      };
      Object.defineProperty(impl, "name", { value: className });
    }
    const observed = impl.observedAttributes.slice();
    if (spec.properties) {
      Object.defineProperty(impl, "observedAttributes", {
        get: function() {
          return this.observed;
        }
      });
      for (const pname in spec.properties) {
        const property = spec.properties[pname];
        const jsName = pname.replace(
          /-([a-z])/g,
          (match, letter) => letter.toUpperCase()
        );
        Object.defineProperty(
          impl.prototype,
          jsName,
          property.readonly ? {
            get: function() {
              return this["_" + jsName];
            }
          } : impl.prototype.render == null ? {
            get: function() {
              return this["_" + jsName];
            },
            set: function(newValue) {
              this["_" + jsName] = newValue;
            }
          } : {
            get: function() {
              return this["_" + jsName];
            },
            set: function(newValue) {
              const old = this["_" + jsName];
              this["_" + jsName] = newValue;
              if (old != newValue && this._sphere)
                this.render();
            }
          }
        );
        if (property.attribute == null || property.attribute !== false)
          observed.push(pname);
      }
    }
    spec.provide = spec.provide == null ? _Oid.defaultInterface : spec.provide.concat(_Oid.defaultInterface);
    if (spec.provide) {
      const provideSpec = {};
      for (const p of spec.provide) {
        const cInterface = _Oid._interfaceReg[p];
        if (cInterface == null)
          throw new Error("Unknown interface id: " + p);
        else
          provideSpec[p] = cInterface;
      }
      spec.provide = provideSpec;
    }
    _Oid.stylePreprocess(spec);
    const td = _Oid.prepareDispatchers(spec.template, impl);
    spec.template = td.template;
    if (td.dispatcher)
      spec.dispatcher = td.dispatcher;
    Object.assign(impl, { spec, observed });
    if (spec.element == null)
      spec.element = "internal-" + spec.id.replace(":", "-");
    customElements.define(spec.element, impl);
    _Oid._oidReg[spec.id] = impl;
  }
  static componentSet(id, complementarySpec) {
    if (id != null && _Oid._oidReg[id] != null) {
      const spec = _Oid._oidReg[id].spec;
      for (const p in complementarySpec)
        spec[p] = complementarySpec[p];
      _Oid.stylePreprocess(spec);
    }
  }
  // styles and template preprocessing
  static stylePreprocess(spec) {
    let sty = "";
    if (spec.stylesheets) {
      let ss = spec.stylesheets;
      if (!Array.isArray(ss)) ss = [ss];
      for (const s of ss)
        sty += `<link href="${s}" rel="stylesheet">`;
    }
    spec.stylesheets = sty;
    spec.styles = spec.styles ? `<style>${spec.styles}</style>` : "";
  }
  static prepareDispatchers(template, impl) {
    let dispatcher = null;
    if (template) {
      let atrn = 1;
      const te = template.split(
        /@([^= >]*)[ \t]*(?:=[ \t]*{{[ \t]*this\.([^}]*)[ \t]*}})?/
      );
      if (te.length > 1) {
        dispatcher = [];
        let ntempl = "";
        for (let i = 0; i + 2 < te.length; i += 3) {
          ntempl += te[i] + _Oid.eventAttribute + atrn + " ";
          const evt = te[i + 1].trim();
          const funcName = te[i + 2] != null ? te[i + 2].trim() : "_on" + evt[0].toUpperCase() + evt.substring(1);
          dispatcher.push([
            _Oid.eventAttribute + atrn,
            evt,
            impl.prototype[funcName]
          ]);
          atrn++;
        }
        template = ntempl + te[te.length - 1];
      }
    }
    return {
      template,
      dispatcher
    };
  }
  static create(componentId, properties) {
    const impl = _Oid._oidReg[componentId];
    if (impl == null)
      throw new Error("Unknown component id: " + componentId);
    const instance = document.createElement(impl.spec.element);
    if (properties != null) {
      for (const p in properties)
        instance.setAttribute(p, properties[p]);
    }
    return instance;
  }
  static customize(id, spec) {
    if (id != null && _Oid._oidReg[id] != null && spec != null && spec.cid != null) {
      _Oid._oidCustom[id + "." + spec.cid] = spec;
      if (_Oid._customQueue[id + "." + spec.cid] != null) {
        _Oid._customQueue[id + "." + spec.cid]();
        delete _Oid._customQueue[id + "." + spec.cid];
      }
    }
  }
  static async getCustom(id, cid) {
    if (id == null || cid == null)
      return null;
    if (_Oid._oidCustom[id + "." + cid] == null) {
      const promise = new Promise((resolve, reject) => {
        const callback = function() {
          resolve();
        };
        _Oid._customQueue[id + "." + cid] = callback;
      });
      await promise;
    }
    return _Oid._oidCustom[id + "." + cid];
  }
  static setDefault(spec) {
    this._defaultSpec = spec;
  }
  static addDefault(spec) {
    for (const p in spec) {
      if (this._defaultSpec[p] == null)
        this._defaultSpec[p] = spec[p];
      else if (Array.isArray(this._defaultSpec[p]))
        this._defaultSpec[p] = this._defaultSpec[p].concat(spec[p]);
      else if (typeof this._defaultSpec[p] === "object")
        Object.assign(this._defaultSpec[p], spec[p]);
      else
        this._defaultSpec[p] = spec[p];
    }
  }
};
__publicField(_Oid, "eventAttribute", "oidevent_");
__publicField(_Oid, "defaultInterface", ["itf:oid"]);
__publicField(_Oid, "_interfaceReg", {});
__publicField(_Oid, "_oidReg", {});
__publicField(_Oid, "_oidCustom", {});
__publicField(_Oid, "_customQueue", {});
__publicField(_Oid, "_defaultSpec", {});
let Oid = _Oid;
Oid.cInterface({
  id: "itf:oid",
  operations: {
    "get": { response: true },
    "set": { response: false }
  },
  cardinality: "n:n"
});
Oid.cInterface({
  id: "itf:transfer",
  operations: ["send"],
  cardinality: "n:n"
});
Oid.cInterface({
  id: "itf:iterate",
  operations: {
    "first": { response: true },
    "next": { response: true }
  },
  cardinality: "1:n"
});
class OidPlay extends OidSphere {
  connectedCallback() {
    super.connectedCallback();
    const html2 = this._prepareHTML();
    const template = OidPlay.template.replace("{stylesheet}", this.stylesheet).replace(
      "{code}",
      OidPlay.code.replace("{html}", html2).replace("{rows}", this._rows(html2))
    ).replace("{console}", this.messages ? OidPlay.console.replace("{rows}", this.rows ? this.rows : OidPlay.rows) : "");
    OidUI.prepareShadow(this, template);
    this._scriptPanel = this.shadowRoot.querySelector("#script");
    this._unlockScript = this._unlockScript.bind(this);
    this._scriptPanel.addEventListener("click", this._unlockScript);
    this._buttonRender = this.shadowRoot.querySelector("#btn-render");
    this._buttonRender.addEventListener("click", this._computeRender.bind(this));
    this._observer = new MutationObserver(this._scriptUpdated.bind(this));
    this._observer.observe(
      this,
      { attributes: true, childList: true, subtree: true }
    );
    this.sphere.bus.subscribe("#", this._busMonitor.bind(this));
  }
  static get observedAttributes() {
    return OidSphere.observedAttributes.concat(["messages", "rows"]);
  }
  get messages() {
    return this.hasAttribute("messages");
  }
  get messages() {
    return this.hasAttribute("messages");
  }
  get rows() {
    return this.getAttribute("rows");
  }
  set rows(newValue) {
    this.setAttribute("rows", newValue);
  }
  _scriptUpdated(mutationsList, observer) {
    const html2 = this._prepareHTML();
    this._scriptPanel.value = html2;
    this._scriptPanel.rows = this._rows(html2);
  }
  _rows(html2) {
    const lines = html2.split(/\r\n|\r|\n/);
    let rows = 0;
    lines.forEach((l) => {
      rows += Math.floor(l.length / 45) + 1;
    });
    return rows;
  }
  _prepareHTML() {
    let html2 = this.innerHTML.replace('=""', "").replace(/^[\r\n]+/, "").replace(/[\r\n]+$/, "");
    if (html2.startsWith(" ") || html2.startsWith("	")) {
      const indent = html2.match(/^[ \t]+/);
      html2 = html2.replace(new RegExp("^" + indent, "gm"), "");
    }
    return html2;
  }
  _unlockScript() {
    this._scriptPanel.removeEventListener("click", this._unlockScript);
    this._scriptPanel.readOnly = false;
    this._buttonRender.style.display = "initial";
  }
  _computeRender() {
    this.shadowRoot.querySelector("#render").innerHTML = this._scriptPanel.value;
  }
  _busMonitor(topic, message) {
    if (topic != "bus/monitor")
      this.sphere.bus.publish("bus/monitor", { value: `[${topic}] ${JSON.stringify(message)}` });
  }
}
OidPlay.rows = 5;
OidPlay.code = html`<div style="width:100%;display:flex">
<textarea id="script" class="code" style="width:100%;cursor:pointer" rows="{rows}" readonly>{html}</textarea>
<button id="btn-render" class="btn btn-secondary" style="width:auto;display:none">Render</button>
</div>`;
OidPlay.template = html`<link rel="stylesheet" href="{stylesheet}">
{code}
<div id="render"><slot></slot></div>
{console}`;
OidPlay.console = html`<div id="msg-pnl" style="width:100%">
  <b>Messages on the Bus</b><br>
  <console-oid rows="{rows}" class="code" prompt="" subscribe="bus/monitor~display"></console-oid>
</div>`;
OidPlay.elementTag = "oid-play";
customElements.define(OidPlay.elementTag, OidPlay);
class SubmitOid extends OidWeb {
  async handleSubmit(topic, message) {
    const toSubmit = {};
    const schema = this._getCustomField("schema");
    let form = null;
    if (schema != null) {
      for (let s of Object.keys(schema)) {
        let field = document.querySelector("#" + s);
        if (field != null)
          toSubmit[s] = field.value;
      }
    } else {
      form = this.parentNode;
      while (form != null && form.nodeName.toLowerCase() != "form")
        form = form.parentNode;
      if (form != null)
        for (let f of form) {
          if (f.type == "radio" || f.type == "checkbox") {
            if (f.checked) {
              if (f.type == "checkbox" || !f.hasAttribute("name"))
                toSubmit[f.id] = f.value;
              else
                toSubmit[f.name] = f.value;
            }
          } else
            toSubmit[f.id] = f.value;
        }
    }
    if (!this._customExists("pre") || this._callCustom("pre", toSubmit) === true) {
      this._notify("submit", { value: toSubmit });
      this._invoke("itf:transfer", "send", { value: toSubmit });
    }
  }
}
Oid.component(
  {
    id: "oid:submit",
    element: "submit-oid",
    receive: ["submit"],
    implementation: SubmitOid
  }
);
class FileOid extends OidUI {
  _onDragover(event) {
    if (this.pre)
      this._presentation.innerHTML = this.pre;
    event.preventDefault();
  }
  async _onDrop(event) {
    event.preventDefault();
    if (this.post)
      this._presentation.innerHTML = this.post;
    let file = null;
    if (event.dataTransfer.items) {
      for (const item of event.dataTransfer.items) {
        if (item.kind === "file")
          file = item.getAsFile();
      }
    } else
      file = event.dataTransfer.files[0];
    const content = await file.text();
    this._notify("loaded", { value: content });
    this._invoke("itf:transfer", "send", { value: content });
  }
}
Oid.component(
  {
    id: "oid:file",
    element: "file-oid",
    properties: {
      label: { default: "Drop Zone" },
      pre: { default: "Drop your file here" },
      post: { default: "File loaded" }
    },
    implementation: FileOid,
    styles: css`
  #oid-prs {
    border: 5px solid;
  }`,
    template: html`
  <div id="oid-prs" @dragover @drop>{{this.label}}</div>`
  }
);
class LocalStorageOid extends OidWeb {
  handleLoad(topic, message) {
    const key = `${this.dataset}:${message.collection || this.collection}:${message.key || this.key}`;
    const content = JSON.parse(localStorage.getItem(key));
    this._notify("loaded", { value: content });
    this._invoke("itf:transfer", "send", { value: content });
  }
  handleStore(topic, message) {
    if (message.value) {
      const key = `${this.dataset}:${message.collection || this.collection}:${message.key || this.key}`;
      localStorage.setItem(key, JSON.stringify(message.value));
    }
  }
}
Oid.component(
  {
    id: "oid:local-storage",
    element: "local-storage-oid",
    receive: ["load", "store"],
    properties: {
      dataset: { default: "default-mundorum-oid" },
      collection: { default: "default" },
      key: { default: "default" }
    },
    implementation: LocalStorageOid
  }
);
class ImageOid extends OidUI {
  _onClick() {
    this._notify("click", { value: this.label || this.source });
  }
  _onMouseenter() {
    this._notify("mouseenter", { value: this.label || this.source });
  }
  _onMouseleave() {
    this._notify("mouseleave", { value: this.label || this.source });
  }
}
Oid.component(
  {
    id: "oid:image",
    element: "image-oid",
    properties: {
      source: { default: "assets:images/image.svg" },
      label: {}
    },
    implementation: ImageOid,
    stylesheets: "default",
    template: html`
  <image id="oid-prs" src="{{url:this.source}}" alt="{{this.label}}"
    @click @mouseenter @mouseleave>`
  }
);
class ButtonOid extends OidUI {
  _onClick() {
    this._callCustom("click");
    this._notify("click", { value: this.value || this.label });
    this._invoke("itf:transfer", "send", { value: this.value || this.label });
  }
  _onMouseenter() {
    this._notify("mouseenter", { value: this.value || this.label });
  }
  _onMouseleave() {
    this._notify("mouseleave", { value: this.value || this.label });
  }
}
Oid.component(
  {
    id: "oid:button",
    element: "button-oid",
    properties: {
      label: {},
      value: {}
    },
    implementation: ButtonOid,
    stylesheets: "default",
    template: html`
  <button id="oid-prs" class="btn btn-primary"
    @click @mouseenter @mouseleave>
    {{this.label}}
  </button>`
  }
);
class ConsoleOid extends OidUI {
  handleSend(topic, message) {
    if (this._presentation && message && message.value) {
      if (typeof message.value === "object")
        message.value = JSON.stringify(message.value);
    }
    this._presentation.value += (this.prompt.length > 0 ? `${this.prompt} ` : "") + `${message.value}
`;
  }
}
Oid.component({
  id: "oid:console",
  element: "console-oid",
  properties: {
    prompt: { default: ">" },
    rows: { default: 10 }
  },
  receive: { "display": "handleSend" },
  provide: ["itf:transfer"],
  implementation: ConsoleOid,
  styles: css`
  .console {
    width: 100%;
    font-family: "Courier New", monospace;
    font-size: 1em;
    background-color: lightgray
  }`,
  template: html`
  <textarea class="console" rows="{{this.rows}}" id="oid-prs" readonly></textarea>`
});
class OidUIInput extends OidUI {
  connectedCallback() {
    this._value = this.getAttribute("value") || false;
    super.connectedCallback();
  }
  static get observedAttributes() {
    return OidUI.observedAttributes.concat(
      ["variable", "value"]
    );
  }
  get variable() {
    return this._variable;
  }
  set variable(newValue) {
    this._variable = newValue;
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
  }
}
class SwitchOid extends OidUIInput {
  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute("value")) {
      this.value = !(this.getAttribute("value") === "off");
      this.render();
    }
    this._notify(
      "initial",
      { value: this.value ? this.on : this.off }
    );
  }
  render() {
    super.render();
    this._input = this._presentation.querySelector("#oid-input");
    this._input.checked = this.value;
  }
  handleInvert(topic, message) {
    this.value = !this.value;
    if (this.value)
      this._input.checked = true;
    else
      this._input.checked = false;
    this._notifyState();
  }
  handleOn() {
    this.value = true;
    this._input.checked = true;
    this._notifyState();
  }
  handleOff() {
    this.value = false;
    this._input.checked = false;
    this._notifyState();
  }
  _onInput() {
    this._value = this._input.checked;
    this._notifyState();
  }
  _notifyState() {
    const state = this._value ? this.on : this.off;
    this._notify("change", { value: state });
    this._notify(state, { value: state });
  }
}
Oid.component(
  {
    id: "oid:switch",
    element: "switch-oid",
    // properties: variable and value inherited from OidUIInput
    properties: {
      on: { default: "on" },
      off: { default: "off" }
    },
    receive: ["invert", "on", "off"],
    implementation: SwitchOid,
    styles: css`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }
  input:checked + .slider {
    background-color: #2196F3;
  }
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
  .slider.round {
    border-radius: 34px;
  }
  .slider.round:before {
    border-radius: 50%;
  }`,
    template: html`
  <label id="oid-prs" class="switch">
    <input id="oid-input" type="checkbox" @input>
    <span class="slider round"></span>
  </label>`
  }
);
class SliderOid extends OidUIInput {
  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("value")) {
      this.value = Math.round((parseInt("" + this.min) + parseInt("" + this.max)) / 2);
      this.render();
    }
    this._notify("initial", { value: this.value });
  }
  render() {
    super.render();
    this._input = this._presentation.querySelector("#oid-input");
    if (this.hasAttribute("index")) {
      this._index = this._presentation.querySelector("#index");
      this._index.innerHTML = this.value;
    }
  }
  _onInput() {
    this._value = this._input.value;
    if (this.hasAttribute("index"))
      this._index.innerHTML = this.value;
    this._notify("change", { value: this.value });
  }
}
Oid.component(
  {
    id: "oid:slider",
    element: "slider-oid",
    properties: {
      min: { default: 0 },
      max: { default: 100 },
      index: { default: false }
    },
    implementation: SliderOid,
    stylesheets: "default",
    template: html`
  <div id="oid-prs" style="width:100%; display:flex; flex-direction:row">
    <span id="index" style="flex:initial"></span>
    <input type="range" id="oid-input" min="{{this.min}}" max="{{this.max}}"
           value="{{this.value}}" style="flex:auto" @input>
  </div>`
  }
);
class SplitPaneOid extends OidUI {
  constructor() {
    super();
    this._x = 0;
    this._y = 0;
    this._sideASize = 0;
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseup = this._onMouseup.bind(this);
  }
  async connectedCallback() {
    await super.connectedCallback();
    this._horz = !(this.split === "vertical");
    this._resizer = this.shadowRoot.getElementById("resizer");
    this._sidea = this.shadowRoot.getElementById("sidea");
    this._sideb = this.shadowRoot.getElementById("sideb");
    if (this._horz) {
      this._resizer.style.cursor = "ew-resize";
      this._resizer.style.height = "100%";
      this._resizer.classList.add("divide-x");
      this._sidea.style.width = this.proportion;
    } else {
      this._resizer.style.cursor = "ns-resize";
      this._presentation.style.flexDirection = "column";
      this._resizer.style.width = "100%";
      this._resizer.classList.add("divide-y");
      this._sidea.style.height = this.proportion;
    }
  }
  _onMousedown(event) {
    this._x = event.clientX;
    this._y = event.clientY;
    this._sideASize = this._horz ? this._sidea.getBoundingClientRect().width : this._sidea.getBoundingClientRect().height;
    this.shadowRoot.addEventListener("mousemove", this._onMousemove);
    this.shadowRoot.addEventListener("mouseup", this._onMouseup);
  }
  _onMousemove(event) {
    const dx = event.clientX - this._x;
    const dy = event.clientY - this._y;
    if (this._horz) {
      const newSideAWidth = (this._sideASize + dx) * 100 / this._presentation.getBoundingClientRect().width;
      this._sidea.style.width = newSideAWidth + "%";
      this._resizer.style.cursor = "col-resize";
      document.body.style.cursor = "col-resize";
    } else {
      const newSideAHeight = (this._sideASize + dy) * 100 / this._presentation.getBoundingClientRect().height;
      this._sidea.style.height = newSideAHeight + "%";
      this._resizer.style.cursor = "row-resize";
      document.body.style.cursor = "row-resize";
    }
    this._sidea.style.userSelect = "none";
    this._sidea.style.pointerEvents = "none";
    this._sideb.style.userSelect = "none";
    this._sideb.style.pointerEvents = "none";
  }
  _onMouseup(event) {
    this.shadowRoot.removeEventListener("mousemove", this._onMousemove);
    this.shadowRoot.removeEventListener("mouseup", this._onMouseup);
    this._resizer.style.cursor = this._horz ? "ew-resize" : "ns-resize";
    document.body.style.removeProperty("cursor");
    this._sidea.style.removeProperty("user-select");
    this._sidea.style.removeProperty("pointer-events");
    this._sideb.style.removeProperty("user-select");
    this._sideb.style.removeProperty("pointer-events");
    this._notify(
      "resize",
      {
        awidth: this._sidea.style.width,
        aheight: this._sidea.style.height,
        bwidth: this._sideb.style.width,
        bheight: this._sideb.style.height
      }
    );
  }
}
Oid.component({
  id: "oid:split-pane",
  element: "split-pane-oid",
  properties: {
    split: { default: "horizontal" },
    proportion: { default: "50%" }
  },
  implementation: SplitPaneOid,
  stylesheets: "default",
  styles: css`
  .group {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .pane-b {
    flex: 1;
  }`,
  template: html`
  <div id="oid-prs" class="group">
    <div class="bg-base" id="sidea"><slot name="side-a"></slot></div>
    <div class="divide" id="resizer" @mousedown></div>
    <div class="pane-b bg-base" id="sideb"><slot name="side-b"></slot></div>
  </div>`
});
class StatePaneOid extends OidUI {
  async connectedCallback() {
    super.connectedCallback();
    this._toInitial = this.initial;
    this._updateVisualState();
    this._observer = new MutationObserver(
      this._updateVisualState.bind(this)
    );
    this._observer.observe(
      this,
      { childList: true, subtree: true }
    );
  }
  _updateVisualState() {
    if (this._toInitial != null) {
      this._state = this.querySelector(`#${this._toInitial}`);
      if (this._state != null)
        this._toInitial = null;
    }
    const children = this.querySelectorAll("*");
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (this._state == null)
        this._state = child;
      if (child === this._state && child.style.display != null) {
        child.style.removeProperty("display");
      } else if (child.style.display == null || child.style.display !== "none") {
        child.style.display = "none";
      }
    }
  }
  handleFirst() {
    this._state = this.firstElementChild;
    this._updateVisualState();
  }
  handleNext() {
    if (this._state != null) {
      let next = this._state.nextElementSibling;
      if (next == null) next = this.firstElementChild;
      this._state = next;
      this._updateVisualState();
    }
  }
  handlePrev() {
    if (this._state != null) {
      let prev = this._state.previousElementSibling;
      if (prev == null) prev = this.lastElementChild;
      this._state = prev;
      this._updateVisualState();
    }
  }
  handleLast() {
    this._state = this.lastElementChild;
    this._updateVisualState();
  }
  handleState(topic, message) {
    this._state = this.querySelector(`#${message.value}`);
    this._updateVisualState();
  }
}
Oid.component({
  id: "oid:state-pane",
  element: "state-pane-oid",
  properties: {
    initial: {}
  },
  receive: ["first", "next", "prev", "last", "state"],
  implementation: StatePaneOid,
  stylesheets: "default"
});
export {
  Bus,
  ButtonOid,
  ConsoleOid,
  FileOid,
  ImageOid,
  LocalStorageOid,
  Oid,
  OidBase,
  OidPlay,
  OidSphere,
  OidUI,
  OidWeb,
  Primitive,
  SliderOid,
  Sphere,
  SplitPaneOid,
  StatePaneOid,
  SubmitOid,
  SwitchOid,
  css,
  html
};
//# sourceMappingURL=oidlib-dev.js.map
