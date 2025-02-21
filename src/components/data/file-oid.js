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
      for (const item of event.dataTransfer.items) {
        if (item.kind === 'file')
          file = item.getAsFile()
      }
    } else
      file = event.dataTransfer.files[0]
    let content = await file.text()
    if (this.filetype === 'json') content = JSON.parse(content)
    this._notify('dispatch', {value: content})
    this._invoke('itf:transfer', 'send', {value: content})
  }

  handleStore (topic, message) {
    let content = message.value || ''
    if (this.filetype == 'json') content = JSON.stringify(content)
    const a = document.createElement('a')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.href = window.URL.createObjectURL(
      new Blob([content], {type: 'text/plain'}))
    a.setAttribute('download', message.filename || this.filename)
    a.click()
    window.URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }
}

Oid.component(
{
  id: 'oid:file',
  element: 'file-oid',
  properties: {
    label: { default: 'Drop Zone' },
    pre:   { default: 'Drop your file here' },
    post:  { default: 'File loaded' },
    filename: { default: 'file.txt' },
    filetype: { default: 'plain' }  // plain, json
  },
  receive: ['store'],
  implementation: FileOid,
  styles: css`
  #oid-prs {
    border: 5px solid;
  }`,
  template: html`
  <div id="oid-prs" @dragover @drop>{{this.label}}</div>`
})