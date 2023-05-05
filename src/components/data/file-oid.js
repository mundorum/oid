import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class FileOid extends OidUI {
  _onDragover (event) {
    if (this.pre)
      this._presentation.innerHTML = this.pre
    event.preventDefault()
  }

  async _onDrop (event) {
    event.preventDefault()
    if (this.post)
      this._presentation.innerHTML = this.post

    let file = null
    if (event.dataTransfer.items) {
      for (let item of event.dataTransfer.items) {
        if (item.kind === 'file')
          file = item.getAsFile()
      }
    } else
      file = event.dataTransfer.files[0]
    const content = await file.text()
    this._notify('loaded', {value: content})
    this._invoke('itf:transfer', 'send', {value: content})
  }
}

Oid.component(
{
  id: 'oid:file',
  element: 'file-oid',
  properties: {
    label: { default: 'Drop Zone' },
    pre:   { default: 'Drop your file here' },
    post:  { default: 'File loaded' }
  },
  implementation: FileOid,
  styles: css`
  #oid-prs {
    border: 5px solid;
  }`,
  template: html`
  <div id="oid-prs" @dragover @drop>{{this.label}}</div>`
})