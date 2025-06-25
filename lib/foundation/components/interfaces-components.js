import { Oid } from '../base/oid'

Oid.cInterface ({
  id: 'itf:transfer',
  operations: ['send'],
  flow: 'push'
})

Oid.cInterface ({
  id: 'itf:storage',
  operations: ['store', 'load'],
  flow: 'pull'
})

Oid.cInterface ({
  id: 'itf:iterate',
  operations: {
    'first': {response: true},
    'next': {response: true}
  },
  flow: 'pull',
  connections: '1'
})