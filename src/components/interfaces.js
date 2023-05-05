import { Oid } from '../base/oid'

Oid.cInterface ({
  id: 'itf:transfer',
  operations: ['send'],
  cardinality: 'n:n',
  response: false
})

Oid.cInterface ({
  id: 'itf:iterate',
  operations: ['first', 'next'],
  cardinality: 'n:1',
  response: false
})