import { Oid } from '/lib/foundation/oidlib-dev.js'

Oid.customize('oid:button', {
  cid: 'random',
  click: function (oid) {
    oid.value = Math.random()
  }
})