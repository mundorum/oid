import { html, css } from '../../infra/literals.js'
import { Oid } from '../../base/oid.js'
import { OidUI } from '../../base/oid-ui.js'

export class RSSOid extends OidUI {
  static imageElements = ['image', 'thumbnail']

  connectedCallback () {
    super.connectedCallback()
    this._items = []
    this._currentItem = 0
    if (this.hasAttribute('autorun')) { this.handleNext() }
  }

  template () {
    return this._current?.value || ''
  }

  async handleNext () {
    if (this._items.length == 0) { await this._loadRSS() }
    if (this._currentItem < this._items.length) {
      this._current = this._items[this._currentItem]
      this._notify('dispatch', {value: this._current})
      this._invoke('itf:transfer', 'send', {value: this._current})
    }
    this._currentItem++
    this.render()
  }

  async _loadRSS () {
    if (this.source != null) {
      await fetch(this.source)
        .then(response => response.text())
        .then(rss => new window.DOMParser().parseFromString(rss, 'text/xml'))
        .then(data => {
          const items = data.querySelectorAll('item')
          this._items = []
          for (const it of items) {
            let image = null
            let el = 0
            while (image == null && el < RSSOid.imageElements.length) {
              image = it.querySelector(RSSOid.imageElements[el])
              el++
            }
            const imageURL =
                     (image == null) ? null
                       : (image.getAttribute('url')) ? image.getAttribute('url')
                         : (image.getAttribute('href')) ? image.getAttribute('href')
                           : null
            const item = {
              title: it.querySelector('title').innerHTML,
              link: it.querySelector('link').innerHTML
            }
            if (imageURL != null) { item.image = imageURL }
            item.value = this.constructor.spec.template
              .replace('{{image}}', (imageURL == null) ? '' : imageURL)
              .replace('{{link}}', item.link)
              .replaceAll('{{title}}', item.title)
            this._items.push(item)
          }
        })
    }
  }
}

Oid.component(
{
  id: 'oid:rss',
  element: 'rss-oid',
  properties: {
    source: {},
    autorun: { default: false }
  },
  receive: ['next'],
  implementation: RSSOid,
  stylesheets: 'default',
  styles: css`
    img { width: 200px; height: auto }
  `,
  template: html`
    <article>
      <img src="{{image}}" alt="{{title}}">
      <p><a href="{{link}}" target="_blank">{{title}}</a></p>
    </article>`
})
