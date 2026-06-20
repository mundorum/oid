import { Oid } from '@mundorum/oid/oid.js'

Oid.customize('oid:button', {
  cid: 'random',
  click: function (oid) {
    oid.value = Math.random()
  }
})