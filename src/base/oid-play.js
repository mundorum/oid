import { html } from '../infra/literals.js'
import { OidSphere } from './oid-sphere.js'
import { OidUI } from './oid-ui.js'

export class OidPlay extends OidSphere {
  connectedCallback () {
    super.connectedCallback()

    const html = this._prepareHTML()

    const template =
      OidPlay.template
        .replace('{stylesheet}', this.stylesheet)
        .replace('{code}',
          OidPlay.code
            .replace('{html}', html)
            .replace('{rows}', html.split(/\r\n|\r|\n/).length))
        .replace('{console}', (this.messages ?
          OidPlay.console
            .replace('{rows}', ((this.rows) ? this.rows : OidPlay.rows)) : ''))

    OidUI.prepareShadow(this, template)
    this._scriptPanel = this.shadowRoot.querySelector('#script')
    this._unlockScript = this._unlockScript.bind(this)
    this._scriptPanel.addEventListener('click', this._unlockScript)
    this._buttonRender = this.shadowRoot.querySelector('#btn-render')
    this._buttonRender.addEventListener('click', this._computeRender.bind(this))
    this._observer = new MutationObserver(this._scriptUpdated.bind(this))
    this._observer.observe(this,
                           {attributes: true, childList: true, subtree: true})
  }

  static get observedAttributes () {
    return OidSphere.observedAttributes.concat(['messages', 'rows'])
  }

  get messages () {
    return this.hasAttribute('messages')
  }

  get messages () {
    return this.hasAttribute('messages')
  }

  get rows () {
    return this.getAttribute('rows')
  }

  set rows (newValue) {
    this.setAttribute('rows', newValue)
  }

  _scriptUpdated(mutationsList, observer) {
    const html = this._prepareHTML()
    this._scriptPanel.value = html
    this._scriptPanel.rows = html.split(/\r\n|\r|\n/).length
  }

  _prepareHTML () {
    let html = this.innerHTML.replace('=""', '')
                             .replace(/^[\r\n]+/, '')
                             .replace(/[\r\n]+$/, '')
    if (html.startsWith(' ') || html.startsWith('\t')) {
      const indent = html.match(/^[ \t]+/)
      html = html.replace(new RegExp('^' + indent, 'gm'), '')
    }
    return html
  }

  _unlockScript() {
    this._scriptPanel.removeEventListener('click', this._unlockScript)
    // this._scriptPanel.style.width = '90%'
    this._scriptPanel.readOnly = false
    this._buttonRender.style.display = 'initial'
  }

  _computeRender() {
    this.shadowRoot.querySelector('#render').innerHTML = this._scriptPanel.value
  }
}

OidPlay.rows = 5

OidPlay.code =
html`<div style="width:97%;display:flex">
<textarea id="script" style="width:100%;cursor:pointer" rows="{rows}" readonly>{html}</textarea>
<button id="btn-render" class="btn btn-secondary" style="width:auto;display:none">Render</button>
</div>`

OidPlay.template =
html`<link rel="stylesheet" href="{stylesheet}">
{code}
<div id="render"><slot></slot></div>
{console}`

OidPlay.console = 
html`<div id="msg-pnl" style="width:97%">
  <b>Messages on the Bus</b><br>
  <console-oid rows="{rows}" subscribe="#~display"></console-oid>
</div>`

OidPlay.elementTag = 'oid-play'
customElements.define(OidPlay.elementTag, OidPlay)