import { html, Oid, OidUI } from '@mundorum/oid/oid.js'

Oid.component(
{
  id: 'ex:parameters',
  element: 'parameters-oid',
  properties: {
    char: {default: '-'},
    size: {default: '1'}
  },
  template: html`<h3>Parameters - char: {{this.char}}, size: {{this.size}}</h3>`
})