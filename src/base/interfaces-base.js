import { Oid } from './oid'

Oid.cInterface ({
  id: 'itf:oid',
  operations: {
    'get': {response: true},
    'set': {response: false}
  },
  flow: 'pull'
})