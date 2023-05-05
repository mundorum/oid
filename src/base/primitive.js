import { Bus } from '../infra/bus.js'

export class Primitive extends HTMLElement {
  constructor () {
    super()
    this._bus = Bus.i
  }

  /*
   * Bus Proxy
   */

  _subscribe (subscribed, handler) {
    return this._bus.subscribe(subscribed, handler)
  }

  _unsubscribe (subscribed, handler) {
    this._bus.unsubscribe(subscribed, handler)
  }

  async _publish (topic, message) {
    await this._bus.publish(topic, message)
  }

  _provides (id, service, handler) {
    this._bus.provides(id, service, handler)
  }

  _withhold (id, service) {
    this._bus.withhold(id, service)
  }

  _connect (id, service, callback) {
    this._bus.connect(id, service, callback)
  }

  async _invoke (id, service, message) {
    return await this._bus.invoke (id, service, message)
  }
}