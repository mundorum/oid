import { Oid } from '@mundorum/oid/oid.js'

Oid.component(
{
  id: 'ex:basic',
  element: 'basic-oid',
  properties: {
    name: {}
  },
  template: `<h1>Hello, {{this.name}}</h1>`
})