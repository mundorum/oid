export class Bus {
  constructor() {
    this._listeners = {}
    this._listenersRgx = []
    this._providers = {}
    this._pendingCnx = {}
  }

  /* Message-oriented communication
   ********************************/

  subscribe (subscribed, handler) {
    if (subscribed != null) {
      let topics = {}
      if (typeof subscribed === 'string' && handler != null)
        topics[subscribed] = handler
      else if (typeof subscribed === 'object')
        topics = subscribed
      const listenersRgx = this._listenersRgx.slice()
      const listeners = { ...this._listeners }
      for (const tp in topics) {
        if (topics[tp] != null) {
          // topic filter: transform wildcards in regular expressions
          if (tp.includes('+') || tp.includes('#'))
            listenersRgx.push([Bus._convertRegExp(tp), topics[tp], tp])
          else {
            if (listeners[tp] == null)
              listeners[tp] = []
            else
              listeners[tp] = listeners[tp].slice() // clone
            listeners[tp].push(topics[tp])
          }
        }
      }
      this._listenersRgx = listenersRgx
      this._listeners = listeners
    }
  }

  unsubscribe (subscribed) {
    if (subscribed != null) {
      const topics = {}
      if (typeof subscribed === 'string' && handler != null)
        topics[subscribed] = handler
      else if (typeof subscribed === 'object')
        topics = subscribed
      const listenersRgx = this._listenersRgx.slice()
      const listeners = { ...this._listeners }
      for (const tp in topics) {
        if (tp.includes('+') || tp.includes('#')) {
          for (const l in listenersRgx) {
            if (listenersRgx[l][1] === topics[tp] &&
                listenersRgx[l][2] == tp) {
              listenersRgx.splice(l, 1)
              break
            }
          }
        } else if (listeners[tp] != null) {
          for (const l in listeners[tp]) {
            if (listeners[tp][l] === topics[tp]) {
              listeners[tp] = listeners[tp].toSplice(l, 1) // clone
              break
            }
          }
        }
      }
      this._listenersRgx = listenersRgx
      this._listeners = listeners
    }
  }

  async publish (topic, message) {
    if (this._listeners[topic] != null)
      for (const handler of this._listeners[topic])
        handler(topic, message)
    const listenersRgx = this._listenersRgx
    for (const l of listenersRgx) {
      const match = l[0].exec(topic)
      if (match != null && match[0] === topic)
        l[1](topic, message)
    }
  }

  /* Message analysis services
     *************************/

  static _convertRegExp (filter) {
    return new RegExp(filter.replace(/\//g, '\\/')
      .replace(/\+/g, '[^\/]+')
      .replace(/#/g, '.+'))
  }

  /* Connection-oriented communication
   ***********************************/

  /*
   * Components declare provided services. Each interface defines a type of
   *  service. The same component can have several interfaces/services:
   *   cInterface: interface provided by the component
   *   id: unique id of the component instance that offers the service
   *   provider: the component or component subobject that implements
   *             the interface/service
   */
  provide (cInterface, id, provider) {
    let status = false
    if (id != null && cInterface != null && provider != null) {
      const key = cInterface + '#' + id
      if (this._providers[key] == null) {
        status = true
        this._providers[key] = provider
        if (this._pendingCnx[key] != null) {
          for (let c of this._pendingCnx[key])
            c.connectionReady(cInterface, id, provider)
          // c.connectionReady(cInterface, id,
          //     this.invoke.bind(this, key), provider)
          delete this._pendingCnx[key]
        }
      }
    }
    return status
  }

  /*
   * Removes a provided service (usually, when the component is destroyed)
   */
  withhold (cInterface, id) {
    let status = false
    if (id != null && cInterface != null) {
      const key = cInterface + '#' + id
      if (this._providers[key]) {
        status = true
        delete this._providers[key]
      }
    }
    return status
  }

  /*
   * Connects a component to another one based on the id and a provided service.
   *   id: id of the component that offers the service
   *   cInterface: label related to the provided interface
   *   callback: component that will be notified as soon as the interface is
   *             connected
   */
  connect (cInterface, id, callback) {
    let status = false
    if (id != null && cInterface != null && callback != null) {
      const key = cInterface + '#' + id
      if (this._providers[key])
        callback.connectionReady(cInterface, id, this._providers[key])
        // callback.connectionReady(cInterface, id,
        //     this.invoke.bind(this, key), this._providers[key])
      else
        if (this._pendingCnx[key])
          this._pendingCnx[key].push(callback)
        else
          this._pendingCnx[key] = [callback]
    }
  }

  /*
   * Triggers a interface defined by an id and component, sending an optional
   * message to it.
   */
  async invoke (cInterface, id, notice, message) {
    // console.log('=== bus invoke', cInterface, id, notice, message)
    // console.log(this._providers)
    const key = cInterface + '#' + id
    if (this._providers[key] != null)
      return await
        this._providers[key].handleInvoke(cInterface, notice, message)
    else
      return null
  }
}

Bus.i = new Bus()