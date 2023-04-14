import { Oid } from '../../../base/oid'
import { OidUI } from '../../../base/oid-ui'

export class Ex03 extends OidUI {
  constructor () {
    super()
  }

  notifyTest (topic, message) {
    console.log('=== changeName', topic, message)
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
  notify: ['test'],
  template: `<h1>Hello, {{this.name}}</h1>`,
  implementation: Ex03
})