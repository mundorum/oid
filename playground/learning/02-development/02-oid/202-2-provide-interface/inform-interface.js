import { Oid } from '/lib/foundation/oidlib-dev.js'

Oid.cInterface ({
  id: 'exitf:inform',
  operations: {
    'arrive': {
      response: true,
      handler: 'someoneArrives'
    }
  }
})