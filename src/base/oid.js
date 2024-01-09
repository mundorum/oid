import { OidBase } from './oid-base.js'
import { OidWeb } from './oid-web.js'
import { OidUI } from './oid-ui.js'

export class Oid {
  static eventAttribute = 'oidevent_'
  static defaultInterface = ['itf:oid']

  static _interfaceReg = {}
  static _oidReg = {}
  static _oidCustom = {}
  static _customQueue = {}
  static _defaultSpec = {}

  static cInterface (spec) {
    if (spec != null)
      Oid._interfaceReg[spec.id] = spec
  }

  static getInterface (cInterface) {
    return Oid._interfaceReg[cInterface]
  }

  static component (spec) {
    // add default values
    spec = Object.assign({}, Oid._defaultSpec, spec)

    // define the class implementation
    let impl = spec.implementation
    if (impl == null) {
      const inh =
        (spec.ui === false || spec.template == null)
          ? ((spec.element == null) ? OidBase : OidWeb)
          : OidUI
      const className = spec.element[0].toUpperCase() +
        spec.element.slice(1)
          .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
      impl = class extends inh { }
      Object.defineProperty(impl, 'name', {value: className})
    }

    // build property getters and setters
    const observed = impl.observedAttributes.slice()
    if (spec.properties) {
      Object.defineProperty(impl, 'observedAttributes', {
        get: function() { return this.observed }
      })
      for (const pname in spec.properties) {
        const property = spec.properties[pname]
        const jsName = pname.replace(
          /-([a-z])/g, (match, letter) => letter.toUpperCase())
        Object.defineProperty(impl.prototype, jsName,
          ((property.readonly)
              ? {
                  get: function() {return this['_' + jsName]}
                }
              : (impl.prototype.render == null)
                 ? {
                    get: function() {return this['_' + jsName]},
                    set: function(newValue) {
                      this['_' + jsName] = newValue
                    }
                  }
                  : {
                      get: function() {return this['_' + jsName]},
                      set: function(newValue) {
                        const old = this['_' + jsName]
                        this['_' + jsName] = newValue
                        if (old != newValue && this._sphere)
                          this.render()
                      }
                    }
          )
        )
        if (property.attribute == null || property.attribute !== false)
          observed.push(pname)
      }
    }

    // associate interface ids to specifications
    spec.provide = (spec.provide == null)
      ? Oid.defaultInterface : spec.provide.concat(Oid.defaultInterface)
    if (spec.provide) {
      const provideSpec = {}
      for (const p of spec.provide) {
        const cInterface = Oid._interfaceReg[p]
        if (cInterface == null)
          throw new Error('Unknown interface id: ' + p)
        else
          provideSpec[p] = cInterface
      }
      spec.provide = provideSpec
    }

    Oid.stylePreprocess(spec)

    const td = Oid.prepareDispatchers(spec.template, impl)
    spec.template = td.template
    if (td.dispatcher)
      spec.dispatcher = td.dispatcher

    // attach the specification to the implementation
    Object.assign(impl, {spec: spec, observed: observed})
  
    // <TODO> provisory - classes without element will not inherit HTMLElement
    if (spec.element == null)
      spec.element = 'internal-' + spec.id.replace(':', '-')
    customElements.define(spec.element, impl)
  
    // register the implementation in the dictionary
    Oid._oidReg[spec.id] = impl
  }

  static componentSet (id, complementarySpec) {
    if (id != null && Oid._oidReg[id] != null) {
      const spec = Oid._oidReg[id].spec
      for (const p in complementarySpec)
        spec[p] = complementarySpec[p]
      Oid.stylePreprocess(spec)
    }
  }

  // styles and template preprocessing
  static stylePreprocess (spec) {
    let sty = ''
    if (spec.stylesheets) {
      let ss = spec.stylesheets
      if (!Array.isArray(ss)) ss = [ss]
      for (const s of ss)
        sty += `<link href="${s}" rel="stylesheet">`
    }
    spec.stylesheets = sty
    spec.styles = (spec.styles) ? `<style>${spec.styles}</style>` : ''
  }

  static prepareDispatchers (template, impl) {
    let dispatcher = null
    if (template) {
      let atrn = 1
      const te = template.split(
        /@([^= >]*)[ \t]*(?:=[ \t]*{{[ \t]*this\.([^}]*)[ \t]*}})?/)
      if (te.length > 1) {
        dispatcher = []
        let ntempl = ''
        for (let i = 0; i + 2 < te.length; i += 3) {
          ntempl +=
            te[i] + Oid.eventAttribute + atrn + ' '
          const evt = te[i + 1].trim()
          const funcName = (te[i + 2] != null)
            ? te[i + 2].trim()
            : '_on' + evt[0].toUpperCase() + evt.substring(1)
          dispatcher.push([
            Oid.eventAttribute + atrn, evt,
            impl.prototype[funcName]])
          atrn++
        }
        template = ntempl + te[te.length - 1]
      }
    }
    return {
      template: template,
      dispatcher: dispatcher
    }
  }

  static create (componentId, properties) {
    const impl = Oid._oidReg[componentId]
    if (impl == null)
      throw new Error('Unknown component id: ' + componentId)
    const instance = document.createElement(impl.spec.element)
    if (properties != null) {
      for (const p in properties)
        instance.setAttribute(p, properties[p])
    }
    return instance
  }

  static customize (id, spec) {
    if (id != null && Oid._oidReg[id] != null &&
        spec != null && spec.cid != null) {
      Oid._oidCustom[id + '.' + spec.cid] = spec
      if (Oid._customQueue[id + '.' + spec.cid] != null) {
        Oid._customQueue[id + '.' + spec.cid]()
        delete Oid._customQueue[id + '.' + spec.cid]
      }
    }
  }

  static async getCustom (id, cid) {
    if (id == null || cid == null)
      return null

    // wait the customization
    if (Oid._oidCustom[id + '.' + cid] == null) {
      const promise = new Promise((resolve, reject) => {
        const callback = function () {
          resolve()
        }
        Oid._customQueue[id + '.' + cid] = callback
      })
      await promise
    }
    return Oid._oidCustom[id + '.' + cid]
  }

  static setDefault (spec) {
    this._defaultSpec = spec
  }

  static addDefault (spec) {
    for (const p in spec) {
      if (this._defaultSpec[p] == null)
        this._defaultSpec[p] = spec[p]
      else if (Array.isArray(this._defaultSpec[p]))
        this._defaultSpec[p] = this._defaultSpec[p].concat(spec[p])
      else if (typeof this._defaultSpec[p] === 'object')
        Object.assign(this._defaultSpec[p], spec[p])
      else
        this._defaultSpec[p] = spec[p]
    }
  }
}