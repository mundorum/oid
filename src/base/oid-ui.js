import { Oid } from './oid.js'
import { OidWeb } from './oid-web.js'

export class OidUI extends OidWeb {
  connectedCallback () {
    super.connectedCallback()
    this.render()
  }

  render () {
    const spec = this.constructor.spec

    // handles a dynamic template
    let template = (spec != null) ? spec.template : null
    if (this.template) {
      const tmpl = this.template()
      if (tmpl != this._template) {
        this._template = tmpl
        const td = Oid.prepareDispatchers(tmpl)
        this._templatePre = td.template
        this._buildEventDispatchers(td.dispatcher, this)
      }
      template = this._templatePre
    }

    this._presentation = null
    if (spec != null && template != null) {
      let html =
        ((spec.styles ? `<style>${spec.styles}</style>` : '') +
         template)
        .replace(
          /{{this\.([^}]*)}}/g,
          (match, p1) => {return this[p1]})

      if (spec.shadow === false) {
        this.innerHTML = html
        this._presentation = this.querySelector('#oid-prs') || this
      } else
        this._presentation = this._shadowHTML(html)

      if (this._dispatcher) {
        const query = (spec.shadow === false) ? this : this.shadowRoot
        for (const [atr, event, dispatch] of this._dispatcher) {
          const target = query.querySelector('[' + atr + ']')
          target.addEventListener(event, dispatch)
        }
      }
    }
  }

  _shadowHTML (html) {
    const template = document.createElement('template')
    template.innerHTML = html
    const clone = document.importNode(template.content, true)
    if (!this.shadowRoot)
      this.attachShadow({ mode: 'open' })
    else
      this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(clone)
    return this.shadowRoot.querySelector('#oid-prs') || clone
  }
}