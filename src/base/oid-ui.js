import { OidBase } from './oid-base.js'

export class OidUI extends OidBase {
  connectedCallback() {
    super.connectedCallback()
    this.render()
  }

  render() {
    this._presentation = null
    const spec = this.constructor.spec
    if (spec.template) {
      const template =
        (spec.styles ? `<style>${spec.styles}</style>` : '') +
        spec.template
      if (spec.shadow === false) {
        this.innerHTML = template
        this._presentation = this.querySelector('#oid-prs') || this
      } else
        this._presentation = this._shadowHTML(template)
    }
  }

  _shadowHTML (html) {
    // console.log('=== object ===')
    // console.log(this)
    const template = document.createElement('template')
    template.innerHTML = html.replace(
      /{{this\.([^}]*)}}/g,
      (match, p1) => {return this[p1]})
    const clone = document.importNode(template.content, true)
    if (!this.shadowRoot)
      this.attachShadow({ mode: 'open' })
    else
      this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(clone)
    return this.shadowRoot.querySelector('#oid-prs') || clone
  }
}