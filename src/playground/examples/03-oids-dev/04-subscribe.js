import { html, Oid, OidUI } from '/dist/oidlib-dev.js'

export class Ex04 extends OidUI {
  constructor () {
    super()
  }

  myHandleTest (topic, message) {
    this.name = message.value
    this.render()
  }
}

Oid.component(
{
  id: 'ex:subscribe',
  element: 'ex04-oid',
  properties: {
    name: {}
  },
  receive: {
    'test': 'myHandleTest'
  },
  template: html`<h1>Hello, {{this.name}}</h1>`,
  implementation: Ex04
})