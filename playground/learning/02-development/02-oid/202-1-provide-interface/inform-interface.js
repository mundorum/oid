import { Oid } from '/lib/foundation/oidlib-dev.js'

Oid.cInterface ({
  id: 'exitf:inform',
  operations: ['arrive'],
  cardinality: 'n:n'
})