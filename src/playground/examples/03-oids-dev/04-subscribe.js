import { Oid, OidUI } from '/dist/oidlib-dev.js'

export class Ex04 extends OidUI {
  constructor () {
    super()
  }

  notifyMyTest (topic, message) {
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
  notify: {
    'test': 'notifyMyTest'
  },
  template: `<h1>Hello, {{this.name}}</h1>`,
  implementation: Ex04
})