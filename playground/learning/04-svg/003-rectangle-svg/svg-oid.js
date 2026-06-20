import { Oid, html } from '@mundorum/oid/oid.js'

Oid.component(
{
  id: 'ex:svg',
  element: 'svg-oid',
  properties: {
    width: {},
    height: {}
  },
  template: html`
<svg width="{{this.width}}" height="{{this.height}}">
  <slot></slot>
</svg>`
})