import { html } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUIInput } from '../../base/oid-ui-input.js'

export class SliderOid extends OidUIInput {
  connectedCallback () {
    super.connectedCallback()
    if (!this.hasAttribute('value')) {
      // <TODO> automatically recognize attribute type and improve render
      this.value = 
        Math.round((parseInt('' + this.min) + parseInt('' + this.max)) / 2)
      this.render()
    }
    this._notify('initial', { value: this.value })
  }

  render () {
    super.render()
    this._input = this._presentation.querySelector('#oid-input')
    if (this.hasAttribute('index')) {
      this._index = this._presentation.querySelector('#index')
      this._index.innerHTML = this.value
    }
  }

  _onInput () {
    this._value = this._input.value
    if (this.hasAttribute('index'))
      this._index.innerHTML = this.value
    this._notify('change', { value: this.value })
  }
}

Oid.component(
{
  id: 'oid:slider',
  element: 'slider-oid',
  properties: {
    min: {default: 0},
    max: {default: 100},
    index: {default: false}
  },
  implementation: SliderOid,
  stylesheet: 'default',
  template: html`
  <div id="oid-prs" style="width:100%; display:flex; flex-direction:row">
    <span id="index" style="flex:initial"></span>
    <input type="range" id="oid-input" min="{{this.min}}" max="{{this.max}}"
           value="{{this.value}}" style="flex:auto" @input>
  </div>`
})