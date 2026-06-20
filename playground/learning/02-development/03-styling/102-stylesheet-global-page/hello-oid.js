import { html, Oid, OidUI } from '@mundorum/oid/oid.js'

export class HelloOid extends OidUI {
  handleSomeone (topic, message) {
    this.name = message.value
  }
}

Oid.component(
{
  id: 'ex:hello',
  element: 'hello-oid',
  properties: {
    name: {default: 'nobody'}
  },
  receive: ['someone'],
  template: html`<p>Hello, {{this.name}}</p>`,
  implementation: HelloOid
})