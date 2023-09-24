import { html, css } from '../../../infra/literals.js'
import { Oid } from '../../../base/oid'
import { OidUI } from '../../../base/oid-ui'

export class SplitPaneOid extends OidUI {
  constructor () {
    super()
    this._x = 0
    this._y = 0
    this._leftWidth = 0
    this._onMousemove = this._onMousemove.bind(this)
    this._onMouseup = this._onMouseup.bind(this)
  }

  connectedCallback () {
    super.connectedCallback()
    this._left = this.shadowRoot.getElementById('left')
    this._resizer = this.shadowRoot.getElementById('resizer')
    this._right = this.shadowRoot.getElementById('right')
  }

  _onMousedown (event) {
    this._x = event.clientX
    this._y = event.clientY
    this._leftWidth = this._left.getBoundingClientRect().width

    this.shadowRoot.addEventListener('mousemove', this._onMousemove)
    this.shadowRoot.addEventListener('mouseup', this._onMouseup)
  }

  _onMousemove (event) {
    const dx = event.clientX - this._x
    const dy = event.clientY - this._y

    const newLeftWidth =
      (this._leftWidth + dx) * 100 / this._presentation.getBoundingClientRect().width
    this._left.style.width = newLeftWidth + '%'

    this._resizer.style.cursor = 'col-resize'
    document.body.style.cursor = 'col-resize'

    this._left.style.userSelect = 'none'
    this._left.style.pointerEvents = 'none'

    this._right.style.userSelect = 'none'
    this._right.style.pointerEvents = 'none'
  }

  _onMouseup (event) {
    this.shadowRoot.removeEventListener('mousemove', this._onMousemove)
    this.shadowRoot.removeEventListener('mouseup', this._onMouseup)

    this._resizer.style.removeProperty('cursor')
    document.body.style.removeProperty('cursor')

    this._left.style.removeProperty('user-select')
    this._left.style.removeProperty('pointer-events')

    this._right.style.removeProperty('user-select')
    this._right.style.removeProperty('pointer-events')
  }
}

Oid.component({
  id: 'oid:split-pane',
  element: 'split-pane-oid',
  properties: {
    label: {},
    prompt: {default: '>'}
  },
  implementation: SplitPaneOid,
  stylesheet: 'default',
  styles: css`
  .group {
    display: flex;
    width: 100%;
    height: 16rem;
  }
  .panel-left {
    width: 25%;
  }
  .resizer {
    cursor: ew-resize;
    height: 100%;
  }
  .panel-right {
    flex: 1;
  }`,
  template: html`
  <div id="oid-prs" class="group">
    <div class="panel-left bg-base" id="left"><slot name="left"></slot></div>
    <div class="resizer divide" id="resizer" @mousedown></div>
    <div class="panel-right bg-base" id="right"><slot name="right"></slot></div>
  </div>`
})