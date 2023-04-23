import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()
    this._toHandle = this._toHandle.bind(this)
    this.handleReceive = this.handleReceive.bind(this)
    this._buildReceiveHandlers()
  }

  connectedCallback () {
    if (this.hasAttribute('publish'))
      this._mapNoticeTopic(this.publish)
    if (this.hasAttribute('subscribe'))
      this._subscribeTopic(this.subscribe)
  }

  disconnectedCallback () {
    if (this._subsTopic != null) {
      if (this._subsNote != null)
        this._unsubscribe(this._subsTopic, this._toHandle)
      else
        this._unsubscribe(this._subsTopic, this.handleReceive)
    }
  }

  static get observedAttributes () {
    return ['publish', 'subscribe']
  }

  get publish () {
    return this.getAttribute('publish')
  }

  set publish (newValue) {
    this.setAttribute('publish', newValue)
    this._mapNoticeTopic(newValue)
  }

  get subscribe () {
    return this.getAttribute('subscribe')
  }

  set subscribe (newValue) {
    this.setAttribute('subscribe', newValue)
    this._subscribeTopic(newValue)
  }

  _subscribeTopic (topicNotice) {
    const colon = topicNotice.lastIndexOf(':')
    if (colon != -1) {
      this._subsTopic = topicNotice.substring(0, colon)
      this._subsNotice = topicNotice.substring(colon + 1)
      this._subscribe(this._subsTopic, this._toHandle)
      // console.log('=== map topic/notice')
      // console.log(this._subsTopic, this._toHandle)
    } else {
      this._subsTopic = topicNotice
      this._subscribe(topicNotice, this.handleReceive)
    }
    // console.log('=== map topic/notice')
    // console.log(this._subsTopic, this._subsNotice)
  }

  _mapNoticeTopic (noticeTopic) {
    const colon = noticeTopic.lastIndexOf(':')
    if (colon != -1) {
      this._pubNotice = noticeTopic.substring(0, colon)
      this._pubTopic = noticeTopic.substring(colon + 1)
    } else {
      this._pubNotice = noticeTopic
      this._pubTopic = noticeTopic
    }
  }

  _toHandle (topic, message) {
    // console.log('=== _toHandle', topic)
    this.handleReceive((this._subsNotice)
      ? this._subsNotice : topic, message)
  }

  notify (notice, message) {
    // console.log('=== notify', notice, message)
    // console.log(this._pubNotice, this._pubTopic)
    if (this._pubNotice != null && this._pubNotice == notice &&
        this._pubTopic != null) {
      // console.log('=== publish', this._pubTopic, message)
      this._publish(this._pubTopic, message)
    }
  }

  handleReceive (notice, message) {
    // console.log('=== handleReceive', notice, message)
    if (this._receiveHandler != null) {
      const handler = this._receiveHandler[notice]
      if (handler != null) handler(notice, message)
    }
  }

  _buildReceiveHandlers () {
    const spec = this.constructor.spec
    if (spec != null && spec.receive != null) {
      this._receiveHandler = {}
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
}