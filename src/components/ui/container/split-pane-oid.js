import { html, css } from '../../../infra/literals.js'
import { Oid } from '../../../base/oid'
import { OidUI } from '../../../base/oid-ui'

export class SplitPaneOid extends OidUI {
  constructor () {
    super()
    this._x = 0
    this._y = 0
    this._sideASize = 0
    this._onMousemove = this._onMousemove.bind(this)
    this._onMouseup = this._onMouseup.bind(this)
  }

  async connectedCallback () {
    await super.connectedCallback()
    this._horz = !(this.split === 'vertical')

    this._resizer = this.shadowRoot.getElementById('resizer')
    this._sidea = this.shadowRoot.getElementById('sidea')
    this._sideb = this.shadowRoot.getElementById('sideb')

    if (this._horz) {
      this._resizer.style.cursor = 'ew-resize'
      this._resizer.style.height = '100%'
      this._resizer.classList.add('divide-x')
      this._sidea.style.width = this.proportion
    } else {
      this._resizer.style.cursor = 'ns-resize'
      this._presentation.style.flexDirection = 'column'
      this._resizer.style.width = '100%'
      this._resizer.classList.add('divide-y')
      this._sidea.style.height = this.proportion
    }
  }

  _onMousedown (event) {
    this._x = event.clientX
    this._y = event.clientY
    this._sideASize = (this._horz)
      ? this._sidea.getBoundingClientRect().width
      : this._sidea.getBoundingClientRect().height

    this.shadowRoot.addEventListener('mousemove', this._onMousemove)
    this.shadowRoot.addEventListener('mouseup', this._onMouseup)
  }

  _onMousemove (event) {
    const dx = event.clientX - this._x
    const dy = event.clientY - this._y

    if (this._horz) {
      const newSideAWidth =
        (this._sideASize + dx) * 100 / this._presentation.getBoundingClientRect().width
      this._sidea.style.width = newSideAWidth + '%'

      this._resizer.style.cursor = 'col-resize'
      document.body.style.cursor = 'col-resize'
    } else {
      const newSideAHeight =
        (this._sideASize + dy) * 100 / this._presentation.getBoundingClientRect().height
      this._sidea.style.height = newSideAHeight + '%'

      this._resizer.style.cursor = 'row-resize'
      document.body.style.cursor = 'row-resize'
    }

    this._sidea.style.userSelect = 'none'
    this._sidea.style.pointerEvents = 'none'

    this._sideb.style.userSelect = 'none'
    this._sideb.style.pointerEvents = 'none'
  }

  _onMouseup (event) {
    this.shadowRoot.removeEventListener('mousemove', this._onMousemove)
    this.shadowRoot.removeEventListener('mouseup', this._onMouseup)

    this._resizer.style.cursor = (this._horz) ? 'ew-resize' : 'ns-resize'
    document.body.style.removeProperty('cursor')

    this._sidea.style.removeProperty('user-select')
    this._sidea.style.removeProperty('pointer-events')

    this._sideb.style.removeProperty('user-select')
    this._sideb.style.removeProperty('pointer-events')

    this._notify('resize',
      {awidth: this._sidea.style.width,
       aheight: this._sidea.style.height,
       bwidth: this._sideb.style.width,
       bheight: this._sideb.style.height})
  }
}

Oid.component({
  id: 'oid:split-pane',
  element: 'split-pane-oid',
  properties: {
    split: {default: 'horizontal'},
    proportion: {default: '50%'}
  },
  implementation: SplitPaneOid,
  stylesheet: 'default',
  styles: css`
  .group {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .pane-b {
    flex: 1;
  }`,
  template: html`
  <div id="oid-prs" class="group">
    <div class="bg-base" id="sidea"><slot name="side-a"></slot></div>
    <div class="divide" id="resizer" @mousedown></div>
    <div class="pane-b bg-base" id="sideb"><slot name="side-b"></slot></div>
  </div>`
})