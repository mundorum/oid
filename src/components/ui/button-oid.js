import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class ButtonOid extends OidUI {
  _onClick () {
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
  styles: css`
  .btn {
    border: 1px solid rgb(30 30 30);
    border-radius: 0.375rem;
    margin: 0.5rem;
    background-color: white;
    color: rgb(30 30 30);
    padding: 1rem 0.5rem;
  }
  .btn:hover {
    border: 2px solid black;
    color: black;
    font-weight: bolder;
    cursor: pointer;
  }`,
  template: html`
  <button id="oid-prs" class="btn btn-primary"
    @click @mouseenter @mouseleave>
    {{this.label}}
  </button>`
})