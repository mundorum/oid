import { Sphere } from '../infra/sphere.js'
import { OidSphere } from './oid-sphere.js'

export class Primitive extends HTMLElement {
  constructor () {
    super()
    this._sphere = null
  }

  get _bus () {
    return (this._sphere == null) ? null : this._sphere.bus
  }

  connectedCallback () {
    let ag = this._findAggregator(OidSphere)
    if (ag != null)
      this._sphere = ag.sphere
    else
      this._sphere = Sphere.i
  }

  _findAggregator(agClass) {
    let parent = (this.parentNode != null)
      ? this.parentNode
      : ((this instanceof DocumentFragment) ? this.host : null)
    while (parent != null && !(parent instanceof agClass))
      parent = (parent.parentNode != null)
        ? parent.parentNode
        : ((parent instanceof DocumentFragment) ? parent.host : null)
    return parent
  }

  /*
   * Bus Proxy
   */

  _subscribe (subscribed, handler) {
    if (this._bus != null)
      this._bus.subscribe(subscribed, handler)
  }

  _unsubscribe (subscribed, handler) {
    this._bus.unsubscribe(subscribed, handler)
  }

  async _publish (topic, message) {
    await this._bus.publish(topic, message)
  }

  _provide (cInterface, id, provider) {
    this._bus.provide(cInterface, id, provider)
  }

  _withhold (cInterface, id) {
    this._bus.withhold(cInterface, id)
  }

  _connect (cInterface, id, callback) {
    this._bus.connect(cInterface, id, callback)
  }

  async _invoke (cInterface, id, notice, message) {
    return await this._bus.invoke (cInterface, id, notice, message)
  }
}