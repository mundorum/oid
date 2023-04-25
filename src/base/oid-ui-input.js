/**
 * Base for all UI input components
 */

import { OidUI } from './oid-ui.js'

export class OidUIInput extends OidUI {
  constructor () {
    super()
    this._value = this.getAttribute('value') || false
  }

  static get observedAttributes () {
    return OidUI.observedAttributes.concat(
      ['variable', 'value'])
  }

  get variable () {
    // return this.getAttribute('variable')
    return this._variable
  }

  set variable (newValue) {
    this._variable = newValue
    // this.setAttribute('variable', newValue)
  }

  get value () {
    return this._value
  }

  set value (newValue) {
    this._value = newValue
  }
}
