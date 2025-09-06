import { Oid } from '@mundorum/oid/oid.js'

Oid.customize('oid:rest', {
  cid: 'xkcd',
  api: {
    oas: {
      paths: {
        'http://xkcd.com/{comic_id}/info.0.json': {
          'get': {
            operationId: 'info'
          }
        }
      }
    }
  }
})
