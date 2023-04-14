import { Oid } from '../../base/oid'
import { OidUI } from '../../base/oid-ui'

export class ButtonOid extends OidUI {
  render () {
    const presentation = this._shadowHTML(ButtonOid.template)
    presentation.style.cursor = 'pointer'
    if (!this.author) presentation.addEventListener('click', this._computeTrigger.bind(this))
  }

  _computeTrigger () {
    // this._publish('example/test', 'Borba')
    this.notify('clicked', {value: this.label})
  }
}

ButtonOid.template =
`<style>
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
}
</style>
<span id="oid-prs" class="button">{{this.label}}</span>`

Oid.component(
{
  id: 'oid:button',
  element: 'button-oid',
  properties: {
    label: {}
  },
  implementation: ButtonOid
})