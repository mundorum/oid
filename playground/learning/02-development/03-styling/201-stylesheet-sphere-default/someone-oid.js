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
  // addresses a local stylesheet ['local.css']
  // this stylesheet defines the class mybutton
  stylesheets: 'default',
  template: html`<button class="mybutton" @click>I am {{this.name}}</button>`,
  implementation: SomeoneOid
})