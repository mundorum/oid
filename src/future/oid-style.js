import { html } from '../infra/literals.js'
import { Oid } from '../base/oid.js'
import { OidUI } from '../base/oid-ui.js'

export class OidStyle extends OidUI {
  async connectedCallback () {
    await super.connectedCallback()
    this.render()
    console.log('=== style')
    console.log(this._presentation.innerHTML)
  }

  get id () {
    return this._sphere.id
  }
}

Oid.component(
{
  id: 'oid:style',
  element: 'oid-style',
  implementation: OidStyle,
  template: html`
  <div id="oid-prs" style="display: none"><slot></slot></div>`
})