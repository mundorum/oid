export class Bus {
  constructor() {
    this._listeners = []
    this._providers = {}
    this._connections = {}
  }

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
    console.log('=== publish')
    console.log(topic)
    console.log(this._listeners)
    let matched = false
    const listeners = this._listeners
    for (const l in listeners) {
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
}

Bus.i = new Bus()