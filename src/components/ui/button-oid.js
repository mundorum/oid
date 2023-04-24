import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid'
import { OidUI } from '../../base/oid-ui'

export class ButtonOid extends OidUI {
  constructor () {
    super()
    this._onClick = this._onClick.bind(this)
  }

  _onClick () {
    this._notify('click', {value: this.value || this.label})
  }

  _onMouseEnter () {
    this._notify('mouseenter', {value: this.value || this.label})
  }

  _onMouseLeave () {
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
  styles: css`
  .button {
    border: 1px solid lightgray;
    border-radius: 5px;
    margin: 5px;
    color: #1d1d1b;
    padding: 14px 25px;
    text-align: center;
    text-decoration: none;
    display: block;
    width: 50%;
  }
  .button:hover {
    color: black;
    font-weight: bold;
    cursor: pointer;
  }`,
  template: html`
  <span id="oid-prs" class="button" @click={{this._onClick}}
    @mouseenter={{this._onMouseEnter}} @mouseleave={{this._onMouseLeave}}>
    {{this.label}}
  </span>`
})