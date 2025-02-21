import { Oid } from '../../base/oid'
import { OidWeb } from '../../base/oid-web'

export class PlatformOid extends OidWeb {
  connectedCallback () {
    super.connectedCallback()
    this._space = document.querySelector(`#${this.space}`)
  }

  handleUpdate (topic, message) {
    if (this.space != null && message.value?.[this.source])
      this.space.innerHTML = message.value[this.source]
  }
}

Oid.component({
  id: 'oid:platform',
  element: 'platform-oid',
  properties: {
    space: { default: 'platform-oid-space' },
    source: { default: 'source' }
  },
  receive: ['update'],
  implementation: PlatformOid
})