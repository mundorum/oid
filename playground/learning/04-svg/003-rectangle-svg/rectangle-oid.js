import { Oid, html } from '/lib/foundation/oidlib-dev.js'

Oid.component(
{
  id: 'ex:rectangle',
  element: 'rectangle-oid',
  properties: {
    x: {},
    y: {},
    width: {},
    height: {},
    fill: {}
  },
  template: html`<rect x="{{this.x}}" y="{{this.y}" width="{{this.width}}" height="{{this.height}}" fill="{{this.fill}}"/>`
})