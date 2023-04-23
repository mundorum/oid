import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid'
import { OidUI } from '../../base/oid-ui'

export class ConsoleOid extends OidUI {
  handleDisplay (topic, message) {
    if (this._presentation && message.value)
      this._presentation.value += `${message.value}\n`
  }
}

Oid.component({
  id: 'oid:console',
  element: 'console-oid',
  properties: {
    label: {}
  },
  receive: ['display'],
  implementation: ConsoleOid,
  styles: css`
  .console {
    width: 97%;
    font-family: "Courier New", monospace;
    font-size: 1em;
    background-color: lightgray
  }`,
  template: html`
  <textarea class="console" rows="10" id="oid-prs" readonly>
  </textarea>`
})