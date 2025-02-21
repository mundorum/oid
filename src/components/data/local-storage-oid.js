import { Oid } from '../../base/oid.js'
import { OidWeb } from '../../base/oid-web.js'

export class LocalStorageOid extends OidWeb {
  async handleLoad (topic, message) {
    const key = `${this.dataset}:${(message.collection||this.collection)}:${(message.key||this.key)}`
    const content = JSON.parse(localStorage.getItem(key))
    this._notify('dispatch', {value: content})
    this._invoke('itf:transfer', 'send', {value: content})
    return {value: content}
  }

  async handleStore (topic, message) {
    let status = false
    if (message.value) {
      const key = `${this.dataset}:${(message.collection||this.collection)}:${(message.key||this.key)}`
      localStorage.setItem(key, JSON.stringify(message.value))
      status = true
    }
    return status
  }
}

Oid.component(
{
  id: 'oid:local-storage',
  element: 'local-storage-oid',
  receive: ['load', 'store'],
  provide: ['itf:storage'],
  properties: {
    dataset: { default: 'default-mundorum-oid' },
    collection: { default: 'default' },
    key: { default: 'default' }
  },
  implementation: LocalStorageOid
})