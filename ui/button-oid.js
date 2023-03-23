import { Oid } from '../base/oid'
import { OidUI } from '../base/oidui'

export class ButtonOid extends OidUI {
  render () {
    this._shadowHTML(ButtonOid.template)
  }
}

ButtonOid.template = `<span id="oid-prs">{{this.label}}</span>`

Oid.component(
{
  id: 'oid:button',
  element: 'button-oid',
  properties: {
    label: {}
  },
  implementation: ButtonOid
})