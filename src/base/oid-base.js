import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()

    this._mapTopicNotice = {}
    this._mapNoticeTopic = {}
    this._receiveHandler = {}
    this._provideHandler = {}

    this._convertNotice = this._convertNotice.bind(this)
    this.handleNotice = this.handleNotice.bind(this)
    const spec = this.constructor.spec
    if (spec) {
      this._buildHandlers(this._receiveHandler, spec.receive)
      console.log('=== receive')
      console.log(this.constructor.spec)
      console.log(this._receiveHandler)
      for (const p in spec.provide)
        this._buildHandlers(this._provideHandler, spec.provide[p])
      this._buildEventDispatchers()
    }
  }

  connectedCallback () {
    const spec = this.constructor.spec
    if (spec && spec.properties) {
      for (const [prop, def] of Object.entries(spec.properties))
        if (def.default != null && !this.hasAttribute(prop))
          this[prop] = def.default
    }
  }

  _buildHandlers (handlerSet, handlersSpec) {
    if (handlersSpec != null) {
      if (Array.isArray(handlersSpec)) {
        for (const notice of handlersSpec)
          handlerSet[notice] =
            this['handle' + notice[0].toUpperCase() +
            notice.slice(1)].bind(this)
      } else {
        for (const [notice, handler] of Object.entries(handlersSpec))
          handlerSet[notice] = this[handler].bind(this)
      }
    }
  }

  _buildEventDispatchers () {
    const spec = this.constructor.spec
    if (spec.template) {
      let atrn = 1
      const te = spec.template.split(
        /@([^= >]*)[ \t]*(?:=[ \t]*{{[ \t]*this\.([^}]*)[ \t]*}})?/)
      if (te.length > 1) {
        this._eventDispatch = []
        let ntempl = ''
        for (let i = 0; i + 2 < te.length; i += 3) {
          ntempl +=
            te[i] + OidBase.eventAttribute + atrn + ' '
          const funcName = (te[i + 2] == null)
            ? '_on' + te[i + 1][0].toUpperCase() + te[i + 1].slice(1)
            : te[i + 2]
          this._eventDispatch.push([
            OidBase.eventAttribute + atrn, te[i + 1], this[funcName].bind(this)])
          atrn++
        }
        spec.template = ntempl + te[te.length - 1]
      }
    }
  }

  disconnectedCallback () {
    for (const topic in this._mapTopicNotice)
      if (this._mapTopicNotice[topic] != topic)
        this._unsubscribe(topic, this._convertNotice)
      else
        this._unsubscribe(topic, this.handleNotice)
  }

  static get observedAttributes () {
    return ['publish', 'subscribe', 'connect']
  }

  get publish () {
    return this._publishProp
  }

  set publish (newValue) {
    this._publishProp = newValue
    this._publishNoticeTopic(newValue)
  }

  get subscribe () {
    return this._subscribeProp
  }

  set subscribe (newValue) {
    this._subscribeProp = newValue
    this._subscribeTopicNotice(newValue)
  }

  get connect () {
    return this._connectProp
  }

  set connect (newValue) {
    this._connectProp = newValue
    this._connectInterface(newValue)
  }

  _subscribeTopicNotice (topicNotice) {
    const tpnts = topicNotice.split(';')
    for (const tn of tpnts) {
      const colon = tn.lastIndexOf(':')
      if (colon != -1) {
        const topic = tn.substring(0, colon)
        this._mapTopicNotice[topic] = tn.substring(colon + 1)
        this._subscribe(topic, this._convertNotice)
      } else {
        this._mapTopicNotice[tn] = tn  // store to unsubscribe
        this._subscribe(tn, this.handleNotice)
      }
    }
  }

  _publishNoticeTopic (noticeTopic) {
    const nttps = noticeTopic.split(';')
    for (const nt of nttps) {
      const colon = nt.lastIndexOf(':')
      if (colon != -1)
        this._mapNoticeTopic[nt.substring(0, colon)] = nt.substring(colon + 1)
      else
        this._mapNoticeTopic[nt] = nt
    }
    // console.log('mapNoticeTopic', this._mapNoticeTopic)
  }

  _connectInterface (idInterface) {
    let status = true
    const idint = noticeTopic.split(';')
    for (const ii of idiii) {
      const parts = ii.split(':')
      if (parts.length > 1)
        this._connect(parts[0].trim(), parts[1].trim(), this)
      else
        status = false
    }
    return status
  }

  _notify (notice, message) {
    // console.log('notify', notice, message)
    if (this._mapNoticeTopic[notice] != null)
      this._publish(this._mapNoticeTopic[notice], message)
  }

  _convertNotice (topic, message) {
    this.handleNotice(this._mapTopicNotice[topic], message)
  }

  connectionReady(id, cInterface, busHandler, component) {
    console.log('=== connectionReady', id, cInterface, busHandler, component)
  }

  handleNotice (notice, message) {
    if (this._receiveHandler[notice] != null)
      this._receiveHandler[notice](notice, message)
  }

  handleInvoke (notice, message) {
    if (this._provideHandler[notice] != null)
      this._provideHandler[notice](notice, message)
  }
}

OidBase.eventAttribute = 'oidevent_'