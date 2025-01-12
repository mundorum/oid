import { css, html, Oid, OidUI } from '/lib/foundation/oidlib-dev.js'

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
  styles: css`
  .test {
    color: rgb(30 30 30);
  }`,
  stylesheets: ['someone.css'],
  template: html`<button class="mybutton" @click>I am {{this.name}}</button>`,
  implementation: SomeoneOid
})