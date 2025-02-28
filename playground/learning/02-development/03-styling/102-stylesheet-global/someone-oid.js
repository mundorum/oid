import { html, Oid, OidUI } from '/lib/foundation/oidlib-dev.js'

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
  // addresses a global stylesheet ['/lib/foundation/oiddefault.css']
  // this stylesheet defines classes btn and btn-primary
  stylesheets: 'default',
  template: html`<button class="btn btn-primary" @click>I am {{this.name}}</button>`,
  implementation: SomeoneOid
})