import { html } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class ButtonOid extends OidUI {
  _onClick () {
    this._callCustom('click')
    this._notify('click', {value: this.value || this.label})
    this._invoke('itf:transfer', 'send', {value: this.value || this.label})
  }

  _onMouseenter () {
    this._notify('mouseenter', {value: this.value || this.label})
  }

  _onMouseleave () {
    this._notify('mouseleave', {value: this.value || this.label})
  }
}

Oid.component(
{
  id: 'oid:button',
  element: 'button-oid',
  properties: {
    label: {},
    value: {}
  },
  implementation: ButtonOid,
  stylesheet: 'default',
  template: html`
  <button id="oid-prs" class="btn btn-primary"
    @click @mouseenter @mouseleave>
    {{this.label}}
  </button>`
})