import { Oid } from '../../base/oid.js'
import { OidWeb } from '../../base/oid-web.js'

export class JSONFileOid extends OidWeb {
  async handleLoad (topic, message) {
    const result = {}

    if (message.filename == null && this.filename == null)
      result.error = 'No file name provided'
    else {
      const filename = message.filename || this.filename
      const response = await fetch(`${filename}`)
      if (!response.ok)
        result.error = 'Failed to load JSON'
      else
        result.value = await response.json()
    }

    this._notify('dispatch', result)
    this._invoke('itf:transfer', 'send', result)
    return result
  }
}

Oid.component(
{
  id: 'oid:json-file',
  element: 'json-file-oid',
  receive: ['load'],
  properties: {
    filename: {}
  },
  implementation: JSONFileOid
})