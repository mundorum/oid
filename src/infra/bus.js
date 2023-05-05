export class Bus {
  constructor() {
    this._listeners = []
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
      console.log('=== subscribe')
      console.log(topics)
      const listeners = this._listeners.slice()
      for (const tp in topics) {
        if (topics[tp] != null) {
          // topic filter: transform wildcards in regular expressions
          if (tp.includes('+') || tp.includes('#')) {
            listeners.push({
              topic: tp,
              regexp: Bus._convertRegExp(tp),
              handler: topics[tp]
            })
          } else {
            listeners.push({
              topic: tp,
              handler: topics[tp]
            })
          }
        }
      }
      this._listeners = listeners
      console.log('=== listeners')
      console.log(this._listeners)
    }
  }

  unsubscribe (subscribed) {
    if (subscribed != null) {
      const topics = {}
      if (typeof subscribed === 'string' && handler != null)
        topics[subscribed] = handler
      else if (typeof subscribed === 'object')
        topics = subscribed
      const listeners = this._listeners.slice()
      for (const tp in topics) {
        for (const l in this._listeners) {
          if (this._listeners[l].topic === tp &&
              this._listeners[l].handler === topics[tp]) {
            listeners.splice(l, 1)
            break
          }
        }
      }
      this._listeners = listeners
    }
  }

  async publish (topic, message) {
    // console.log('=== publish')
    // console.log(topic)
    // console.log(this._listeners)
    const listeners = this._listeners
    for (const l in listeners) {
      let matched = false
      if (listeners[l].regexp) {
        const matchStr = listeners[l].regexp.exec(topic)
        if (matchStr != null && matchStr[0] === topic) { matched = true }
      } else if (listeners[l].topic === topic)
        matched = true
      if (matched)
        listeners[l].handler(topic, message)
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
      const key = cInterface + ':' + id
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
      const key = cInterface + ':' + id
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
      const key = cInterface + ':' + id
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
    console.log('=== bus invoke', cInterface, id, notice, message)
    console.log(this._providers)
    const key = cInterface + ':' + id
    if (this._providers[key] != null)
      return await
        this._providers[key].handleInvoke(cInterface, notice, message)
    else
      return null
  }
}

Bus.i = new Bus()