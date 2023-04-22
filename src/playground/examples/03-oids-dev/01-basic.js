import { Oid } from '/dist/oidlib-dev.js'

Oid.component(
{
  id: 'ex:basic',
  element: 'ex01-oid',
  properties: {
    name: {}
  },
  template: `<h1>Hello, {{this.name}}</h1>`
})