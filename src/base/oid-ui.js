import { OidBase } from './oid-base.js'

export class OidUI extends OidBase {
  connectedCallback() {
    super.connectedCallback()
    this.render()
  }

  render() {
    const spec = this.constructor.spec
    if (spec.template) {
      if (spec.shadow === false)
        this.innerHTML = spec.template
      else
        this._shadowHTML(spec.template)
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