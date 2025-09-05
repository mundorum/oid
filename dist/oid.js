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
      let topics = {};
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
  static _convertRegExp(filter2) {
    return new RegExp(filter2.replace(/\//g, "\\/").replace(/\+/g, "[^/]+").replace(/#/g, ".+"));
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
    let status = false;
    if (id != null && cInterface != null && callback != null) {
      const key = `${cInterface}#${id}`;
      if (this._providers[key])
        callback.connectionReady(cInterface, id, this._providers[key]);
      else if (this._pendingCnx[key])
        this._pendingCnx[key].push(callback);
      else
        this._pendingCnx[key] = [callback];
      status = true;
    }
    return status;
  }
  /*
   * Triggers a interface defined by an id and component, sending an optional
   * message to it.
   */
  async invoke(cInterface, id, notice, message) {
    const key = `${cInterface}#${id}`;
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
  stylesheets: "<auto>",
  stydefault: ["stylesheets:oid.min.css"],
  assets: "/assets/"
};
class Sphere {
  constructor(id, bus, stylesheets, stydefault, assets) {
    this._id = id || null;
    this._bus = bus ? bus : Sphere.i.bus;
    this._stydefault = stydefault ? stydefault : Sphere.i.stydefault;
    this._stylesheets = stylesheets ? stylesheets : Sphere.i.stylesheets;
    if (this._stylesheets === "<auto>" && this._stydefault) {
      const styleName = this._stydefault[0].split(/[:\/]/).pop();
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of links) {
        if (link.href && link.href.endsWith(styleName)) {
          this._stylesheets = link.href.slice(0, -styleName.length);
          break;
        }
      }
    }
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
        return responses;
      } else {
        for (const id of this._connected[cInterface])
          return await this._bus.invoke(cInterface, id, notice, message);
      }
    }
  }
  handleNotice(notice, message) {
    const noticeMain = notice && notice.includes("/") ? notice.split("/")[0] : notice;
    if (this._receiveHandler[noticeMain] != null)
      this._receiveHandler[noticeMain](notice, message);
  }
  async handleInvoke(cInterface, notice, message) {
    let response = null;
    if (this._provideHandler[`${cInterface}.${notice}`] != null)
      response = await this._provideHandler[`${cInterface}.${notice}`](notice, message);
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
  flow: "pull"
});
Oid.cInterface({
  id: "itf:transfer",
  operations: ["send"],
  flow: "push"
});
Oid.cInterface({
  id: "itf:storage",
  operations: ["store", "load"],
  flow: "pull"
});
Oid.cInterface({
  id: "itf:iterate",
  operations: {
    "first": { response: true },
    "next": { response: true }
  },
  flow: "pull",
  connections: "1"
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
  set messages(newValue) {
    this.setAttribute("messages", newValue);
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
      for (const s of Object.keys(schema)) {
        const field = document.querySelector(`#${s}`);
        if (field != null)
          toSubmit[s] = field.value;
      }
    } else {
      form = this.parentNode;
      while (form != null && form.nodeName.toLowerCase() !== "form")
        form = form.parentNode;
      if (form != null)
        for (const f of form) {
          if (f.type === "radio" || f.type === "checkbox") {
            if (f.checked) {
              if (f.type === "checkbox" || !f.hasAttribute("name"))
                toSubmit[f.id] = f.value;
              else
                toSubmit[f.name] = f.value;
            }
          } else
            toSubmit[f.id] = f.value;
        }
    }
    if (!this._customExists("pre") || this._callCustom("pre", toSubmit) === true) {
      this._notify("submit", toSubmit);
      this._notify("dispatch", { value: toSubmit });
      this._invoke("itf:transfer", "send", { value: toSubmit });
    }
  }
  handleUpdate(topic, message) {
    if (message.value) {
      let form = this.parentNode;
      while (form != null && form.nodeName.toLowerCase() !== "form")
        form = form.parentNode;
      if (form != null)
        for (const f of form) {
          if (f.type === "radio" || f.type === "checkbox") {
            if (f.checked) {
              if (f.type === "checkbox" || !f.hasAttribute("name"))
                f.value = message.value[f.id];
              else
                f.value = message.value[f.name];
            }
          } else
            f.value = message.value[f.id];
        }
    }
  }
}
Oid.component(
  {
    id: "oid:submit",
    element: "submit-oid",
    receive: ["submit", "update"],
    implementation: SubmitOid
  }
);
class FileOid extends OidUI {
  template() {
    let tmpl = this.selection === "both" ? html`<div class="group">` : "";
    if (this.selection === "drop" || this.selection === "both")
      tmpl += html`<div class="drop" @dragover @drop>{{this.dropLabel}}</div>`;
    if (this.selection === "dialog" || this.selection === "both")
      tmpl += html`<input type="file" class="selector" @change></input>`;
    if (this.selection === "both") tmpl += "</div>";
    return tmpl;
  }
  _onDragover(event) {
    if (this.pre)
      this._presentation.innerHTML = this.dropPre;
    event.preventDefault();
  }
  async _onDrop(event) {
    event.preventDefault();
    if (this.post)
      this._presentation.innerHTML = this.dropPost;
    let file = null;
    if (event.dataTransfer.items) {
      for (const item of event.dataTransfer.items) {
        if (item.kind === "file")
          file = item.getAsFile();
      }
    } else
      file = event.dataTransfer.files[0];
    let content = await file.text();
    if (this.filetype === "json") content = JSON.parse(content);
    this._notify("dispatch", { value: content });
    this._invoke("itf:transfer", "send", { value: content });
  }
  _onChange(event) {
    const result = {};
    const file = event.target.files[0];
    if (!file)
      result.error = "No file selected";
    else {
      const reader = new FileReader();
      reader.onload = (e) => {
        result.value = e.target.result;
        if (this.filetype === "json")
          result.value = JSON.parse(result.value);
      };
      reader.onerror = (e) => {
        result.error = `Error reading file: ${e.target.error}`;
      };
      reader.readAsText(file);
    }
    this._notify("dispatch", result);
    this._invoke("itf:transfer", "send", result);
  }
  handleRetrieve(topic, message) {
  }
  handleStore(topic, message) {
    let content = message.value || "";
    if (this.filetype === "json") content = JSON.stringify(content);
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(
      new Blob([content], { type: "text/plain" })
    );
    a.setAttribute("download", message.filename || this.filename);
    a.click();
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }
}
Oid.component(
  {
    id: "oid:file",
    element: "file-oid",
    properties: {
      selection: { default: "both" },
      // none, drop, dialog, both
      dropLabel: { default: "Drop Zone" },
      dropPre: { default: "Drop your file here" },
      dropPost: { default: "File loaded" },
      filename: { default: "file.txt" },
      filetype: { default: "plain" }
      // plain, json
    },
    receive: ["retrieve", "store"],
    implementation: FileOid,
    styles: css`
  .group {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .drop {
    width: 50%;
    border: 5px solid;
  }
  .selector {
    flex: 1;
  }`
  }
);
class LocalStorageOid extends OidWeb {
  async handleLoad(topic, message) {
    const key = `${this.dataset}:${message.collection || this.collection}:${message.key || this.key}`;
    const content = JSON.parse(localStorage.getItem(key));
    this._notify("dispatch", { value: content });
    this._invoke("itf:transfer", "send", { value: content });
    return { value: content };
  }
  async handleStore(topic, message) {
    let status = false;
    if (message.value) {
      const key = `${this.dataset}:${message.collection || this.collection}:${message.key || this.key}`;
      localStorage.setItem(key, JSON.stringify(message.value));
      status = true;
    }
    return status;
  }
}
Oid.component(
  {
    id: "oid:local-storage",
    element: "local-storage-oid",
    receive: ["load", "store"],
    provide: ["itf:storage"],
    properties: {
      dataset: { default: "default-mundorum-oid" },
      collection: { default: "default" },
      key: { default: "default" }
    },
    implementation: LocalStorageOid
  }
);
class JSONFileOid extends OidWeb {
  async handleLoad(topic, message) {
    const result = {};
    if (message.filename == null && this.filename == null)
      result.error = "No file name provided";
    else {
      const filename = message.filename || this.filename;
      const response = await fetch(`${filename}`);
      if (!response.ok)
        result.error = "Failed to load JSON";
      else
        result.value = await response.json();
    }
    this._notify("dispatch", result);
    this._invoke("itf:transfer", "send", result);
    return result;
  }
}
Oid.component(
  {
    id: "oid:json-file",
    element: "json-file-oid",
    receive: ["load"],
    properties: {
      filename: {}
    },
    implementation: JSONFileOid
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
  handleRepublish(topic, message) {
    if (this.value)
      this._notify("republish", message);
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
    receive: ["invert", "on", "off", "republish"],
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
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError$1.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path) && cookie.push("path=" + path);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  let contentType;
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Response(str).arrayBuffer()));
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
});
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const supportsResponseStream = isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
const resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
    !resolvers[type] && (resolvers[type] = utils$1.isFunction(res[type]) ? (res2) => res2[type]() : (_, config) => {
      throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response());
const getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }
  if (utils$1.isBlob(body)) {
    return body.size;
  }
  if (utils$1.isSpecCompliantForm(body)) {
    const _request = new Request(platform.origin, {
      method: "POST",
      body
    });
    return (await _request.arrayBuffer()).byteLength;
  }
  if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
    return body.byteLength;
  }
  if (utils$1.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils$1.isString(body)) {
    return (await encodeText(body)).byteLength;
  }
};
const resolveBodyLength = async (headers, body) => {
  const length = utils$1.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
};
const fetchAdapter = isFetchSupported && (async (config) => {
  let {
    url,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
  let request;
  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
    composedSignal.unsubscribe();
  });
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
      let _request = new Request(url, {
        method: "POST",
        body: data,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        const [onProgress, flush] = progressEventDecorator(
          requestContentLength,
          progressEventReducer(asyncDecorator(onUploadProgress))
        );
        data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }
    if (!utils$1.isString(withCredentials)) {
      withCredentials = withCredentials ? "include" : "omit";
    }
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : void 0
    });
    let response = await fetch(request, fetchOptions);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
      const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
        responseContentLength,
        progressEventReducer(asyncDecorator(onDownloadProgress), true)
      ) || [];
      response = new Response(
        trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }),
        options
      );
    }
    responseType = responseType || "text";
    let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && unsubscribe && unsubscribe();
    return await new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders$1.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    unsubscribe && unsubscribe();
    if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
      throw Object.assign(
        new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
        {
          cause: err.cause || err
        }
      );
    }
    throw AxiosError$1.from(err, err && err.code, config, request);
  }
});
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: fetchAdapter
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters2[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.11.0";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
class RESTOid extends OidWeb {
  async handleGet(notice, message) {
    await this._restRequest("GET", notice, message);
  }
  async handlePost(notice, message) {
    await this._restRequest("POST", notice, message);
  }
  async handlePut(notice, message) {
    await this._restRequest("PUT", notice, message);
  }
  async handleDelete(notice, message) {
    await this._restRequest("DELETE", notice, message);
  }
  async _restRequest(method, notice, message) {
    let result = null;
    let parameters = {};
    if (message != null) {
      parameters = typeof message.value === "object" ? message.value : message;
    }
    console.log("=== parameters");
    console.log(parameters);
    const api = this._getCustomField("api");
    if (api != null && api.environment != null) {
      for (let e in api.environment) {
        parameters[e] = api.environment[e];
      }
    }
    if (this.parameters != null) {
      const par = this.parameters.split(";");
      for (const p of par) {
        const atr = p.split(":");
        parameters[atr[0]] = atr[1];
      }
    }
    if (api != null && api.oas != null && api.oas.paths != null) {
      const paths = Object.keys(api.oas.paths);
      if (paths.length > 0) {
        let pathKey = paths[0];
        const noticeParts = notice.split("/");
        console.log("=== noticeParts");
        console.log(noticeParts);
        if (noticeParts.length > 1) {
          const method2 = noticeParts[0];
          const key = noticeParts[1];
          for (let p of paths) {
            if (api.oas.paths[p][method2] && api.oas.paths[p][method2].operationId == key) {
              pathKey = p;
              break;
            }
          }
        }
        console.log("=== pathKey");
        console.log(pathKey);
        let url = pathKey;
        for (let p in parameters)
          url = url.replace("{" + p + "}", parameters[p]);
        console.log("=== url");
        console.log(url);
        const request = {
          method: method.toUpperCase(),
          url,
          withCredentials: true
        };
        let pathDetails = api.oas.paths[pathKey];
        if (pathDetails[method] != null) {
          if (pathDetails[method].parameters != null) {
            let body = {};
            for (let p of pathDetails[method].parameters)
              if (p.in != null && p.in == "query")
                body[p.name] = parameters[p.name];
            if (request.method == "GET")
              request.params = body;
            else
              request.data = body;
          }
        }
        await axios(request).then(function(endpointResponse) {
          result = endpointResponse.data;
        }).catch(function(error) {
          result = {
            error: error.response != null ? error.response.data != null && error.response.data.error != null ? error.response.data.error : {
              code: error.response.status ? error.response.status : 500,
              message: error.message
            } : { code: 500, message: error.message }
          };
        });
      }
    }
    const preparedResult = result != null && typeof result === "object" && !Array.isArray(result) && result.value != null ? result : { value: result };
    this._notify("dispatch", preparedResult);
  }
}
Oid.component(
  {
    id: "oid:rest",
    element: "rest-oid",
    properties: {
      parameters: {}
    },
    receive: ["get", "post", "put", "delete"],
    implementation: RESTOid
  }
);
const _RSSOid = class _RSSOid extends OidUI {
  connectedCallback() {
    super.connectedCallback();
    this._items = [];
    this._currentItem = 0;
    if (this.hasAttribute("autorun")) {
      this.handleNext();
    }
  }
  template() {
    var _a;
    return ((_a = this._current) == null ? void 0 : _a.value) || "";
  }
  async handleNext() {
    if (this._items.length == 0) {
      await this._loadRSS();
    }
    if (this._currentItem < this._items.length) {
      this._current = this._items[this._currentItem];
      this._notify("dispatch", { value: this._current });
      this._invoke("itf:transfer", "send", { value: this._current });
    }
    this._currentItem++;
    this.render();
  }
  async _loadRSS() {
    if (this.source != null) {
      await fetch(this.source).then((response) => response.text()).then((rss) => new window.DOMParser().parseFromString(rss, "text/xml")).then((data) => {
        const items = data.querySelectorAll("item");
        this._items = [];
        for (const it of items) {
          let image = null;
          let el = 0;
          while (image == null && el < _RSSOid.imageElements.length) {
            image = it.querySelector(_RSSOid.imageElements[el]);
            el++;
          }
          const imageURL = image == null ? null : image.getAttribute("url") ? image.getAttribute("url") : image.getAttribute("href") ? image.getAttribute("href") : null;
          const item = {
            title: it.querySelector("title").innerHTML,
            link: it.querySelector("link").innerHTML
          };
          if (imageURL != null) {
            item.image = imageURL;
          }
          item.value = this.constructor.spec.template.replace("{{image}}", imageURL == null ? "" : imageURL).replace("{{link}}", item.link).replaceAll("{{title}}", item.title);
          this._items.push(item);
        }
      });
    }
  }
};
__publicField(_RSSOid, "imageElements", ["image", "thumbnail"]);
let RSSOid = _RSSOid;
Oid.component(
  {
    id: "oid:rss",
    element: "rss-oid",
    properties: {
      source: {},
      autorun: { default: false }
    },
    receive: ["next"],
    implementation: RSSOid,
    stylesheets: "default",
    styles: css`
    img { width: 200px; height: auto }
  `,
    template: html`
    <article>
      <img src="{{image}}" alt="{{title}}">
      <p><a href="{{link}}" target="_blank">{{title}}</a></p>
    </article>`
  }
);
class PlatformOid extends OidWeb {
  connectedCallback() {
    super.connectedCallback();
    this._space = document.querySelector(`#${this.space}`);
  }
  handleUpdate(topic, message) {
    var _a;
    if (this.space != null && ((_a = message.value) == null ? void 0 : _a[this.source]))
      this.space.innerHTML = message.value[this.source];
  }
}
Oid.component({
  id: "oid:platform",
  element: "platform-oid",
  properties: {
    space: { default: "platform-oid-space" },
    source: { default: "source" }
  },
  receive: ["update"],
  implementation: PlatformOid
});
export {
  Bus,
  ButtonOid,
  ConsoleOid,
  FileOid,
  ImageOid,
  JSONFileOid,
  LocalStorageOid,
  Oid,
  OidBase,
  OidPlay,
  OidSphere,
  OidUI,
  OidWeb,
  PlatformOid,
  Primitive,
  RESTOid,
  RSSOid,
  SliderOid,
  Sphere,
  SplitPaneOid,
  StatePaneOid,
  SubmitOid,
  SwitchOid,
  css,
  html
};
//# sourceMappingURL=oid.js.map
