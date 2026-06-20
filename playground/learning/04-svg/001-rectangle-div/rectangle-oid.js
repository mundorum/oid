import { Oid, html } from '@mundorum/oid/oid.js'

Oid.component(
{
  id: 'ex:rectangle',
  element: 'rectangle-oid',
  properties: {
    width: {},
    height: {},
    fill: {}
  },
  template: html`<div style="width:{{this.width}};height:{{this.height}};background-color:{{this.fill}}"></div>`
})