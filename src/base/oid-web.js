import { OidBase } from './oid-base.js'

export class OidWeb extends OidBase {
  connectedCallback () {
    this._initialize()
  }

  disconnectedCallback () {
    this._finalize()
  }
}