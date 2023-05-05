import { OidBase } from './oid-base.js'
import { OidUI } from './oid-ui.js'

export class Oid {
  static oidreg = {}

  static component (spec) {
    let impl = spec.implementation
    if (impl == null) {
      const inh = (spec.ui === false) ? OidBase : OidUI
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

    impl.prototype.attributeChangedCallback =
      function(name, oldValue, newValue) {
        this[name] = newValue
      }

    Object.assign(impl, {spec: spec, observed: observed})
    customElements.define(spec.element, impl)
    Oid.oidreg[spec.id] = impl
  }

  static create (componentId, properties) {
    const impl = Oid.oidreg[componentId]
    if (impl == null)
      throw new Error('Unknown component id: ' + componentId)
    const element = document.createElement(impl.spec.element)
    if (properties != null) {
      for (const p in properties) {
        // const property = impl.spec.properties[p]
        // if (property != null && property.attribute === true)
          element.setAttribute(p, properties[p])
        // else
        //   element[p] = properties[p]         
      }
    }
    return element
  }
}