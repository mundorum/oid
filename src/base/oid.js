import { OidBase } from './oid-base.js'
import { OidWeb } from './oid-web.js'
import { OidUI } from './oid-ui.js'

export class Oid {
  static eventAttribute = 'oidevent_'

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
          ((impl.prototype.render == null)
            ? {
              get: function() {return this['_' + jsName]},
              set: function(newValue) {
                this['_' + jsName] = newValue
              }
            }
            : {
              get: function() {return this['_' + jsName]},
              set: function(newValue) {
                this['_' + jsName] = newValue
                this.render()
              }
            }))
        if (property.attribute == null || property.attribute !== false)
          observed.push(pname)
      }
    }

    // associate function ids to specifications
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
          const funcName = (te[i + 2] == null)
            ? '_on' + te[i + 1][0].toUpperCase() + te[i + 1].slice(1)
            : te[i + 2]
          dispatcher.push([
            Oid.eventAttribute + atrn, te[i + 1],
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
}