import { Bus } from '../infra/bus.js'
import { Oid } from './oid.js'
import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()

    this._mapTopicNotice = {}
    this._rgxTopicNotice = []
    this._mapNoticeTopic = {}
    this._receiveHandler = {}
    this._provideHandler = {}
    this._connected = {}

    this._convertNotice = this._convertNotice.bind(this)
    this.handleNotice = this.handleNotice.bind(this)

    if (!this.connectedCallback)
      this._initialize()
  }

  _initialize () {
    const spec = this.constructor.spec
    if (spec) {
      this._buildHandlers(this._receiveHandler, spec.receive)
      this._buildProviders()
      this._buildProvidersHandlers()
      this._buildEventDispatchers(spec.dispatcher)
    }

    if (spec && spec.properties) {
      for (const [prop, def] of Object.entries(spec.properties))
        if (def.default != null && !this.hasAttribute(prop))
          this[prop] = def.default
    }
  }

  _buildProviders () {
    const spec = this.constructor.spec
    if (spec.provide != null && this.id)
      for (const p in spec.provide)
          this._provide(p, this.id, this)
  }

  _buildProvidersHandlers () {
    const spec = this.constructor.spec
    if (spec.provide != null)
      for (const p in spec.provide) {
        this._buildHandlers(
          this._provideHandler, spec.provide[p].operations, p)
      }
  }

  _removeProviders () {
    const spec = this.constructor.spec
    if (spec.provide != null && this.id)
      for (const p in spec.provide)
          this._withhold(p, this.id)
  }

  _buildHandlers (handlerSet, handlersSpec, cInterface) {
    if (handlersSpec != null) {
      const prefix = (cInterface == null) ? '' : cInterface + '.'
      if (Array.isArray(handlersSpec)) {
        for (const notice of handlersSpec)
          if (handlerSet[prefix + notice] == null)
            handlerSet[prefix + notice] =
              this['handle' + notice[0].toUpperCase() +
              notice.slice(1)].bind(this)
      } else {
        for (const [notice, handler] of Object.entries(handlersSpec))
          if (handlerSet[prefix + notice] == null)
            handlerSet[prefix + notice] = this[handler].bind(this)
      }
    }
  }

  _buildEventDispatchers (dispatcherTempl) {
    if (dispatcherTempl) {
      this._dispatcher = []
      for (const [atr, event, dispatch] of dispatcherTempl)
        this._dispatcher.push([atr, event, dispatch.bind(this)])
    }
  }

  _finalize () {
    this._removeProviders()
    for (const topic in this._mapTopicNotice)
      if (this._mapTopicNotice[topic] != topic)
        this._unsubscribe(topic, this._convertNotice)
      else
        this._unsubscribe(topic, this.handleNotice)
  }

  // call setter every time an observed attribute changes
  attributeChangedCallback (name, oldValue, newValue) {
    const jsName = name.replace(
      /-([a-z])/g, (match, letter) => letter.toUpperCase())
    this[jsName] = newValue
  }

  static get observedAttributes () {
    return ['id', 'publish', 'subscribe', 'connect']
  }

  get id () {
    return this._id
  }

  set id (newValue) {
    if (this._id != null)
      this._removeProviders()
    this._id = newValue
    this._buildProviders()
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
        if (topic.includes('+') || topic.includes('#'))
          this._rgxTopicNotice.push(
            [Bus._convertRegExp(topic), parts[1].trim(), topic])
        else
          this._mapTopicNotice[topic] = parts[1].trim()
        this._subscribe(topic, this._convertNotice)
      } else {
        const topic = tn.trim()
        this._mapTopicNotice[topic] = topic  // store to unsubscribe
        this._subscribe(topic, this.handleNotice)
      }
    }
    console.log('=== component subscribed')
    console.log(this._mapTopicNotice)
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
        // console.log('=== connect', parts[0].trim(), parts[1].trim(), this)
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
    if (this._mapTopicNotice[topic] != null)
      this.handleNotice(this._mapTopicNotice[topic], message)
    else
      for (const [rgx, notice] of this._rgxTopicNotice) {
        const match = rgx.exec(topic)
        if (match != null && match[0] === topic) {
          this.handleNotice(notice, message)
          break
        }
      }
  }

  connectTo (cInterface, component) {
    if (component.id)
      this._connect(cInterface, component.id, this)
  }

  connectionReady(cInterface, id, component) {
    // console.log('=== connectionReady', id, cInterface, component)
    if (this._connected[cInterface] == null)
      this._connected[cInterface] = []
    this._connected[cInterface].push(id)
  }

  async _invoke (cInterface, notice, message) {
    // console.log('=== invoke', cInterface, notice, message)
    // console.log(this._connected)
    const intSpec = Oid.getInterface(cInterface)
    // console.log('=== intSpec')
    // console.log(intSpec)
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
        // console.log('=== invoking', this._connected[cInterface])
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
    // console.log('=== handleInvoke', cInterface, notice, message)
    // console.log(this._provideHandler)
    let response = null
    if (this._provideHandler[cInterface + '.' + notice] != null)
      response =
        this._provideHandler[cInterface + '.' + notice](notice, message)
    return response
  }
}