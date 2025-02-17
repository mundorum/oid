import { Oid, html } from '/lib/foundation/oidlib-dev.js'

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