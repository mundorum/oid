import { Oid } from '../base/oid'

Oid.component(
{
  id: 'ex:sample',
  element: 'sample-oid',
  properties: {
    name: {default: 'World'}
  },
  template: `<h1>Hello, {{this.name}}</h1>`
})