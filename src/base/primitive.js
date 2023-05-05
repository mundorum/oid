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