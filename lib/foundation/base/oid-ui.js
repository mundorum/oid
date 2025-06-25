import { Oid } from './oid.js'
import { OidWeb } from './oid-web.js'

export class OidUI extends OidWeb {
  async connectedCallback () {
    await super.connectedCallback()

    // resolve dynamic styles
    this._stylesheets = this.constructor.spec.stylesheets
      .replace('href="default"', 'href="' + this._sphere.stydefault + '"')
      .replace('href="stylesheets:', 'href="' + this._sphere.stylesheets)

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
        const td = Oid.prepareDispatchers(tmpl, this.constructor)
        this._templatePre = td.template
        this._buildEventDispatchers(td.dispatcher, this)
      }
      template = this._templatePre
    }

    this._presentation = null
    if (spec != null && template != null) {
      let customTemplate = this._getCustomField('style')
      customTemplate =  (customTemplate)
        ? `<style>${customTemplate}</style>` : ''

      const html =
        (this._stylesheets + spec.styles + customTemplate + template)
        .replace(
          /{{[ \t]*(url:)?[ \t]*this\.([^}]*)}}/g,
          (match, p1, p2) => {
            p2 = (p2) ? p2.trim() : ''
            let value = (this[p2]) ? this[p2] : ''
            if (p1 === 'url:')
              value = value.replace('assets:', this._sphere.assets)
            return value
          })

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
    const clone = OidUI.prepareShadow(this, html)
    return this.shadowRoot.querySelector('#oid-prs') || clone
  }

  static prepareShadow (owner, html) {
    const template = document.createElement('template')
    template.innerHTML = html
    const clone = document.importNode(template.content, true)
    if (!owner.shadowRoot)
      owner.attachShadow({ mode: 'open' })
    else
      owner.shadowRoot.innerHTML = ''
    owner.shadowRoot.appendChild(clone)
    return clone
  }
}