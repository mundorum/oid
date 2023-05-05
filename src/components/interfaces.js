import { Oid } from '../base/oid'

Oid.cInterface ({
  id: 'itf:transfer',
  operations: ['send'],
  cardinality: 'n:n',
  response: false
})