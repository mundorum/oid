import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()

    this._mapTopicNotice = {}
    this._mapNoticeTopic = {}
    this._receiveHandler = {}

    this._convertNotice = this._convertNotice.bind(this)
    this.handleNotice = this.handleNotice.bind(this)
    this._buildReceiveHandlers()
    this._buildEventDispatchers()
  }

  _buildReceiveHandlers () {
    const spec = this.constructor.spec
    if (spec != null && spec.receive != null) {
      // check if type is array
      if (Array.isArray(spec.receive)) {
        for (const notice of spec.receive)
          this._receiveHandler[notice] =
            this['handle' + notice[0].toUpperCase() + notice.slice(1)].bind(this)
      } else {
        for (const [notice, callback] of Object.entries(spec.receive))
          this._receiveHandler[notice] = this[callback].bind(this)
      }
    }
  }

  _buildEventDispatchers () {
    const spec = this.constructor.spec
    if (spec && spec.template) {
      let clsn = 1
      const te = spec.template.split(/@([^=]*)={{this\.([^}]*)}}/)
      if (te.length > 1) {
        this._eventDispatch = []
        let ntempl = ''
        for (let i = 0; i + 2 < te.length; i += 3) {
          ntempl +=
            te[i] + OidBase.eventClass + clsn
          this._eventDispatch.push([
            OidBase.eventClass + clsn, te[i + 1], te[i + 2]])
          clsn++
        }
        spec.template = ntempl + te[te.length - 1]
      }
      // console.log('=== template')
      // console.log(this.constructor.spec.template)
      // console.log(this._eventDispatch)
    }
  }

  connectedCallback () {
    if (this.hasAttribute('publish'))
      this._publishNoticeTopic(this.publish)
    if (this.hasAttribute('subscribe'))
      this._subscribeTopicNotice(this.subscribe)
  }

  disconnectedCallback () {
    for (const topic in this._mapTopicNotice)
      if (this._mapTopicNotice[topic] != topic)
        this._unsubscribe(topic, this._convertNotice)
      else
        this._unsubscribe(topic, this.handleNotice)
  }

  static get observedAttributes () {
    return ['publish', 'subscribe']
  }

  get publish () {
    return this.getAttribute('publish')
  }

  set publish (newValue) {
    this.setAttribute('publish', newValue)
    this._publishNoticeTopic(newValue)
  }

  get subscribe () {
    return this.getAttribute('subscribe')
  }

  set subscribe (newValue) {
    this.setAttribute('subscribe', newValue)
    this._subscribeTopicNotice(newValue)
  }

  _subscribeTopicNotice (topicNotice) {
    const tpnts = topicNotice.split(',')
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
    const nttps = noticeTopic.split(',')
    for (const nt of nttps) {
      const colon = nt.lastIndexOf(':')
      if (colon != -1)
        this._mapNoticeTopic[nt.substring(0, colon)] = nt.substring(colon + 1)
      else
        this._mapNoticeTopic[nt] = nt
    }
  }

  _notify (notice, message) {
    if (this._mapNoticeTopic[notice] != null)
      this._publish(this._mapNoticeTopic[notice], message)
  }

  _convertNotice (topic, message) {
    this.handleNotice(this._mapTopicNotice[topic], message)
  }

  handleNotice (notice, message) {
    if (this._receiveHandler[notice] != null)
      this._receiveHandler[notice](notice, message)
  }
}

OidBase.eventClass = 'oidevent_'