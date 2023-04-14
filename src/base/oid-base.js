import { Primitive } from './primitive.js'

export class OidBase extends Primitive {
  constructor () {
    super()
    this._toNotify = this._toNotify.bind(this)
    this.notified = this.notified.bind(this)
    this._buildNotification()
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
        this._unsubscribe(this._subsTopic, this._toNotify)
      else
        this._unsubscribe(this._subsTopic, this.notified)
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
      this._subscribe(this._subsTopic, this._toNotify)
      console.log('=== map topic/notice')
      console.log(this._subsTopic, this._toNotify)
    } else {
      this._subsTopic = topicNotice
      this._subscribe(topicNotice, this.notified)
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

  _toNotify (topic, message) {
    console.log('=== _toNotify', topic)
    this.notified((this._subsNotice)
      ? this._subsNotice : topic, message)
  }

  notify (notice, message) {
    console.log('=== notify', notice, message)
    if (this._pubNotice != null && this._pubNotice == notice &&
        this._pubTopic != null)
      this._publish(this._pubTopic, message)
  }

  notified (notice, message) {
    console.log('=== notified', notice, message)
    if (this._noteHandler != null) {
      const handler = this._noteHandler[notice]
      if (handler != null) handler(notice, message)
    }
  }

  _buildNotification () {
    const spec = this.constructor.spec
    if (spec != null && spec.notify != null) {
      this._noteHandler = {}
      // check if type is array
      if (Array.isArray(spec.notify)) {
        for (const notice of spec.notify)
          this._noteHandler[notice] =
            this['notify' + notice[0].toUpperCase() + notice.slice(1)].bind(this)
      } else {
        for (const [notice, callback] of Object.entries(spec.notify))
          this._noteHandler[notice] = this[callback].bind(this)
      }
    }
  }
}