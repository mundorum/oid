import { html } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class ImageOid extends OidUI {
  _onClick () {
    this._notify('click', {value: this.label || this.source})
  }

  _onMouseenter () {
    this._notify('mouseenter', {value: this.label || this.source})
  }

  _onMouseleave () {
    this._notify('mouseleave', {value: this.label || this.source})
  }
}

Oid.component(
{
  id: 'oid:image',
  element: 'image-oid',
  properties: {
    source: {},
    label: {}
  },
  implementation: ImageOid,
  stylesheet: 'default',
  template: html`
  <image id="oid-prs" src="{{url:this.source}}" alt="{{this.label}}"
    @click @mouseenter @mouseleave>`
})