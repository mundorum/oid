import { Oid } from '../base/oid'

Oid.cInterface ({
  id: 'itf:transfer',
  operations: ['send'],
  cardinality: 'n:n'
})

Oid.cInterface ({
  id: 'itf:iterate',
  operations: {
    'first': {response: true},
    'next': {response: true}
  },
  cardinality: '1:n'
})