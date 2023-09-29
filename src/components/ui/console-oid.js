import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid'
import { OidUI } from '../../base/oid-ui'

export class ConsoleOid extends OidUI {
  handleSend (topic, message) {
    if (this._presentation && message && message.value)
      this._presentation.value +=
        (this.prompt.length > 0 ? `${this.prompt} ` : '') +
      `${message.value}\n`
  }
}

Oid.component({
  id: 'oid:console',
  element: 'console-oid',
  properties: {
    prompt: {default: '>'},
    rows: {default: 10}
  },
  receive: {'display': 'handleSend'},
  provide: ['itf:transfer'],
  implementation: ConsoleOid,
  styles: css`
  .console {
    width: 100%;
    font-family: "Courier New", monospace;
    font-size: 1em;
    background-color: lightgray
  }`,
  template: html`
  <textarea class="console" rows="{{this.rows}}" id="oid-prs" readonly></textarea>`
})