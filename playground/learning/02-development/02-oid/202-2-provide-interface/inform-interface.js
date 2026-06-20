import { Oid } from '@mundorum/oid/oid.js'

Oid.cInterface ({
  id: 'exitf:inform',
  operations: {
    'arrive': {
      response: true,
      handler: 'someoneArrives'
    }
  }
})