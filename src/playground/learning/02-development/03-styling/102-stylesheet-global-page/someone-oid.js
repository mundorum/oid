import { html, Oid, OidUI } from '/lib/oidlib-dev.js'

export class SomeoneOid extends OidUI {
  _onClick () {
    this._notify('click', {value: this.name})
  }
}

Oid.component(
{
  id: 'ex:someone',
  element: 'someone-oid',
  properties: {
    name: {default: 'nobody'}
  },
  // addresses a global stylesheet ['/lib/oiddefault.css']
  // this stylesheet defines classes btn and btn-primary
  // read external fonts, as there is also an external link to the stylesheet
  stylesheet: 'default',
  template: html`<button class="btn btn-primary" @click>I am {{this.name}}</button>`,
  implementation: SomeoneOid
})