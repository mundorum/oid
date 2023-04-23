import { html, Oid, OidUI } from '/dist/oidlib-dev.js'

export class Ex03 extends OidUI {
  constructor () {
    super()
  }

  handleTest (topic, message) {
    this.name = message.value
    this.render()
  }
}

Oid.component(
{
  id: 'ex:subscribe',
  element: 'ex03-oid',
  properties: {
    name: {}
  },
  receive: ['test'],
  template: html`<h1>Hello, {{this.name}}</h1>`,
  implementation: Ex03
})