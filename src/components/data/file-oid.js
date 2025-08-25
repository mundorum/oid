import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class FileOid extends OidUI {
  template () {
    let tmpl = (this.selection === 'both') ? html`<div class="group">` : ''
    if (this.selection === 'drop' || this.selection === 'both')
      tmpl += html`<div class="drop" @dragover @drop>{{this.dropLabel}}</div>`
    if (this.selection === 'dialog' || this.selection === 'both')
      tmpl += html`<input type="file" class="selector" @change></input>`
    if (this.selection === 'both') tmpl += '</div>'
    return tmpl
  }

  _onDragover (event) {
    if (this.pre)
      this._presentation.innerHTML = this.dropPre
    event.preventDefault()
  }

  async _onDrop (event) {
    event.preventDefault()
    if (this.post)
      this._presentation.innerHTML = this.dropPost

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

  _onChange (event) {
    const result = {}
    const file = event.target.files[0]
    if (!file)
      result.error = 'No file selected'
    else {
      const reader = new FileReader()

      reader.onload = (e) => {
        result.value = e.target.result
        if (this.filetype === 'json')
          result.value = JSON.parse(result.value)
      }

      reader.onerror = (e) => {
        result.error = `Error reading file: ${e.target.error}`
      }

      reader.readAsText(file)
    }
    this._notify('dispatch', result)
    this._invoke('itf:transfer', 'send', result)
  }

  handleRetrieve (topic, message) {
    
  }

  handleStore (topic, message) {
    let content = message.value || ''
    if (this.filetype === 'json') content = JSON.stringify(content)
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
    selection: { default: 'both' }, // none, drop, dialog, both
    dropLabel: { default: 'Drop Zone' },
    dropPre:   { default: 'Drop your file here' },
    dropPost:  { default: 'File loaded' },
    filename:  { default: 'file.txt' },
    filetype:  { default: 'plain' }  // plain, json
  },
  receive: ['retrieve', 'store'],
  implementation: FileOid,
  styles: css`
  .group {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .drop {
    width: 50%;
    border: 5px solid;
  }
  .selector {
    flex: 1;
  }`
})