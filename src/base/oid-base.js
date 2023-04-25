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

  connectedCallback () {
    const spec = this.constructor.spec
    if (spec && spec.properties) {
      for (const [prop, def] of Object.entries(spec.properties))
        if (def.default != null && !this.hasAttribute(prop))
          this[prop] = def.default
    }
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
    return ['publish', 'subscribe']
  }

  get publish () {
    // return this.getAttribute('publish')
    return this._publishProp
  }

  set publish (newValue) {
    // this.setAttribute('publish', newValue)
    this._publishProp = newValue
    this._publishNoticeTopic(newValue)
  }

  get subscribe () {
    // return this.getAttribute('subscribe')
    return this._subscribeProp
  }

  set subscribe (newValue) {
    // this.setAttribute('subscribe', newValue)
    this._subscribeProp = newValue
    this._subscribeTopicNotice(newValue)
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

  _notify (notice, message) {
    // console.log('notify', notice, message)
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

OidBase.eventAttribute = 'oidevent_'