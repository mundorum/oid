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
}