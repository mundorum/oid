import { Oid } from '../../../base/oid'
import { OidUI } from '../../../base/oid-ui'

export class StatePaneOid extends OidUI {
  async connectedCallback () {
    super.connectedCallback()
    this._toInitial = this.initial
    this._updateVisualState()

    this._observer = new MutationObserver(
      this._updateVisualState.bind(this))
    this._observer.observe(this,
      {childList: true, subtree: true})
  }

  _updateVisualState () {
    if (this._toInitial != null) {
      this._state = this.querySelector(`#${this._toInitial}`)
      if (this._state != null)
        this._toInitial = null
    }
    const children = this.querySelectorAll('*')
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (this._state == null)
        this._state = child
      if (child === this._state && child.style.display != null) {
        child.style.removeProperty('display')
      } else if (child.style.display == null ||
                 child.style.display !== 'none') {
        child.style.display = 'none'
      }
    }
  }

  handleFirst () {
    this._state = this.firstElementChild
    this._updateVisualState()
  }

  handleNext () {
    if (this._state != null) {
      let next = this._state.nextElementSibling
      if (next == null) next = this.firstElementChild
      this._state = next
      this._updateVisualState()
    }
  }

  handlePrev () {
    if (this._state != null) {
      let prev = this._state.previousElementSibling
      if (prev == null) prev = this.lastElementChild
      this._state = prev
      this._updateVisualState()
    }
  }

  handleLast () {
    this._state = this.lastElementChild
    this._updateVisualState()
  }

  handleState (topic, message) {
    this._state = this.querySelector(`#${message.value}`)
    this._updateVisualState()
  }
}

Oid.component({
  id: 'oid:state-pane',
  element: 'state-pane-oid',
  properties: {
    initial: {}
  },
  receive: ['first', 'next', 'prev', 'last', 'state'],
  implementation: StatePaneOid,
  stylesheets: 'default'
})