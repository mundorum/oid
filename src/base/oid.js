import { OidBase } from './oid-base.js'
import { OidWeb } from './oid-web.js'
import { OidUI } from './oid-ui.js'

export class Oid {
  static _interfaceReg = {}
  static _oidReg = {}

  static cInterface (spec) {
    if (spec != null)
      Oid._interfaceReg[spec.id] = spec
  }

  static getInterface (cInterface) {
    return Oid._interfaceReg[cInterface]
  }

  static component (spec) {
    let impl = spec.implementation
    if (impl == null) {
      const inh =
        (spec.ui === false || spec.template == null)
          ? ((spec.element == null) ? OidBase : OidWeb)
          : OidUI
      const className = spec.element[0].toUpperCase() +
        spec.element.slice(1)
          .replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
      impl = class extends inh { }
      Object.defineProperty(impl, 'name', {value: className})
    }
    const observed = impl.observedAttributes.slice()
    if (spec.properties) {
      Object.defineProperty(impl, 'observedAttributes', {
        get: function() {return this.observed}
      })
      for (const pname in spec.properties) {
        const property = spec.properties[pname]
        Object.defineProperty(impl.prototype, pname,
          ((impl.prototype.render == null)
            ? {
              get: function() {return this['_' + pname]},
              set: function(newValue) {
                // console.log('=== set ' + pname)
                // console.log(newValue)
                this['_' + pname] = newValue
              }
            }
            : {
              get: function() {return this['_' + pname]},
              set: function(newValue) {
                // console.log('=== set ' + pname)
                // console.log(newValue)
                this['_' + pname] = newValue
                this.render()
              }
            }))
        if (property.attribute == null || property.attribute !== false)
          observed.push(
            (property.attribute) ? property.attribute : pname)
      }
    }

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

    impl.prototype.attributeChangedCallback =
      function(name, oldValue, newValue) {
        this[name] = newValue
      }

    Object.assign(impl, {spec: spec, observed: observed})
    // <TODO> Provisory
    if (spec.element == null)
      spec.element = 'internal-' + spec.id.replace(':', '-')
    customElements.define(spec.element, impl)
    Oid._oidReg[spec.id] = impl
  }

  static create (componentId, properties) {
    const impl = Oid._oidReg[componentId]
    if (impl == null)
      throw new Error('Unknown component id: ' + componentId)
    const instance = document.createElement(impl.spec.element)
    if (properties != null) {
      for (const p in properties) {
        // const property = impl.spec.properties[p]
        // if (property != null && property.attribute === true)
          instance.setAttribute(p, properties[p])
        // else
        //   element[p] = properties[p]         
      }
    }
    return instance
  }
}