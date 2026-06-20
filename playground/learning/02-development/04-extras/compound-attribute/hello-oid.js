import { html, Oid } from '@mundorum/oid/oid.js'

Oid.component(
{
  id: 'ex:hello',
  element: 'hello-oid',
  properties: {
    'first-name': {default: 'nobody'},
    'last-name': {default: ''}
  },
  template: html`<h1>Hello, {{this.firstName}} {{this.lastName}}</h1>`
})