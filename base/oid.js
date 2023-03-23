import { OidWeb } from './oidweb.js'
import { OidUI } from './oidui.js'

export class Oid {
  static component (spec) {

    let impl = spec.implementation
    if (impl == null) {
      const inh = (spec.ui === false) ? OidWeb : OidUI
      const className = spec.element[0].toUpperCase() +
        spec.element.slice(1)
          .replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
      impl = class extends inh { }
      Object.defineProperty(impl, 'name', {value: className})
    }

    const observed = []
    if (spec.properties) {
      Object.defineProperty(impl, 'observedAttributes', {
        get: function() {return this.observed}
      })
      for (const pname in spec.properties) {
        const property = spec.properties[pname]
        Object.defineProperty(impl.prototype, pname, {
          get: function() {return this['_' + pname]},
          set: function(newValue) {
            console.log('=== object set ===')
            console.log(this)
            this['_' + pname] = newValue
            this.render()
          }
        })
        if (property.attribute == null || property.attribute !== false)
          observed.push(
            (property.attribute) ? property.attribute : pname)
      }
    }

    impl.prototype.attributeChangedCallback = function(name, oldValue, newValue) {
      this[name] = newValue
    }

    Object.assign(impl, {spec: spec, observed: observed})
    customElements.define(spec.element, impl)
  }
}