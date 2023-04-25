import { OidBase } from './oid-base.js'

export class OidUI extends OidBase {
  connectedCallback () {
    super.connectedCallback()
    this.render()
  }

  render () {
    this._presentation = null
    const spec = this.constructor.spec
    if (spec && spec.template) {
      let html =
        ((spec.styles ? `<style>${spec.styles}</style>` : '') +
         spec.template)
        .replace(
          /{{this\.([^}]*)}}/g,
          (match, p1) => {return this[p1]})
      if (spec.shadow === false) {
        this.innerHTML = html
        this._presentation = this.querySelector('#oid-prs') || this
      } else
        this._presentation = this._shadowHTML(html)

      if (this._eventDispatch) {
        const query = (spec.shadow === false) ? this : this.shadowRoot
        for (const [atr, event, dispatch] of this._eventDispatch) {
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