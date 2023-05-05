import { Oid } from './oid.js'
import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()

    this._mapTopicNotice = {}
    this._mapNoticeTopic = {}
    this._receiveHandler = {}
    this._provideHandler = {}
    this._connected = {}

    this._convertNotice = this._convertNotice.bind(this)
    this.handleNotice = this.handleNotice.bind(this)
  }

  connectedCallback () {
    const spec = this.constructor.spec
    if (spec) {
      this._buildHandlers(this._receiveHandler, spec.receive)
      // console.log('=== receive')
      // console.log(this.constructor.spec)
      // console.log(this._receiveHandler)
      if (spec.provide != null)
        for (const p in spec.provide) {
          console.log('=== provide', p, this.id)
          if (this.id)
            this._provide(p, this.id, this)
          this._buildHandlers(this._provideHandler, spec.provide[p].operations)
        }
      this._buildEventDispatchers()
    }

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
          if (handlerSet[notice] == null)
            handlerSet[notice] =
              this['handle' + notice[0].toUpperCase() +
              notice.slice(1)].bind(this)
      } else {
        for (const [notice, handler] of Object.entries(handlersSpec))
          if (handlerSet[notice] == null)
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
    return ['id', 'publish', 'subscribe', 'connect']
  }

  get id () {
    return this._id
  }

  set id (newValue) {
    this._id = newValue
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
      const parts = tn.split('~')
      if (parts.length > 1) {
        const topic = parts[0].trim()
        this._mapTopicNotice[topic] = parts[1].trim()
        this._subscribe(topic, this._convertNotice)
      } else {
        const topic = tn.trim()
        this._mapTopicNotice[topic] = topic  // store to unsubscribe
        this._subscribe(topic, this.handleNotice)
      }
    }
  }

  _publishNoticeTopic (noticeTopic) {
    const nttps = noticeTopic.split(';')
    for (const nt of nttps) {
      const parts = nt.split('~')
      if (parts.length > 1)
        this._mapNoticeTopic[parts[0].trim()] = parts[1].trim()
      else
        this._mapNoticeTopic[nt.trim()] = nt.trim()
    }
    // console.log('mapNoticeTopic', this._mapNoticeTopic)
  }

  _connectInterface (idInterface) {
    let status = true
    const idint = idInterface.split(';')
    for (const ii of idint) {
      const parts = ii.split('#')
      if (parts.length > 1) {
        this._connect(parts[0].trim(), parts[1].trim(), this)
        console.log('=== connect', parts[0].trim(), parts[1].trim(), this)
      } else
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

  connectionReady(cInterface, id, component) {
    console.log('=== connectionReady', id, cInterface, component)
    if (this._connected[cInterface] == null)
      this._connected[cInterface] = []
    this._connected[cInterface].push(id)
  }

  async _invoke (cInterface, notice, message) {
    console.log('=== invoke', cInterface, notice, message)
    console.log(this._connected)
    const intSpec = Oid.getInterface(cInterface)
    console.log('=== intSpec')
    console.log(intSpec)
    if (this._connected[cInterface] != null) {
      if (intSpec.response != null &&
          intSpec.response === true) {
        const responses = []
        for (const id of this._connected[cInterface])
          responses.push(await this._bus.invoke (cInterface, id, notice, message))
        return (intSpec.cardinality &&
                intSpec.cardinality[2] == '1')
                ? responses[0] : responses
      } else {
        console.log('=== invoking', this._connected[cInterface])
        for (const id of this._connected[cInterface])
          return await this._bus.invoke (cInterface, id, notice, message)
      }
    }
  }

  handleNotice (notice, message) {
    if (this._receiveHandler[notice] != null)
      this._receiveHandler[notice](notice, message)
  }

  handleInvoke (cInterface, notice, message) {
    console.log('=== handleInvoke', notice, message)
    console.log(this._provideHandler)
    if (this._provideHandler[notice] != null)
      this._provideHandler[notice](notice, message)
  }
}

OidBase.eventAttribute = 'oidevent_'