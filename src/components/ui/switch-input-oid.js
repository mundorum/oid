import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUIInput } from '../../base/oid-ui-input.js'

export class SwitchOid extends OidUIInput {
  constructor () {
    super()
    if (this.hasAttribute('value'))
      this.value = false
  }

  render () {
    super.render()
    this._input = this._presentation.querySelector('#oid-input')
  }

  handleInvert (topic, message) {
    this.value = !this.value
    if (this.value)
      this._input.checked = true
    else
      this._input.checked = false
  }
}

Oid.component(
{
  id: 'oid:switch',
  element: 'switch-oid',
  // properties: variable and value inherited from OidUIInput
  receive: ['invert'],
  implementation: SwitchOid,
  styles: css`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }
  input:checked + .slider {
    background-color: #2196F3;
  }
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
  .slider.round {
    border-radius: 34px;
  }
  .slider.round:before {
    border-radius: 50%;
  }`,
  template: html`
  <label id="oid-prs" class="switch">
    <input id="oid-input" type="checkbox">
    <span class="slider round"></span>
  </label>`
})