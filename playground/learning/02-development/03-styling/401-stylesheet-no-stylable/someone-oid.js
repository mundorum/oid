import { html, css, Oid, OidUI } from '/lib/oidlib-dev.js'

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
  // there is a precedence for the styles over stylesheet
  stylesheets: 'default',
  styles: css`.btn-primary {
    background-color: maroon;
    color: salmon;
  }`,
  template: html`<button class="btn btn-primary" @click>I am {{this.name}}</button>`,
  implementation: SomeoneOid
})