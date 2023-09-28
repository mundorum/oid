import { Bus } from '../infra/bus.js'
import { Sphere } from '../infra/sphere.js'

export class OidSphere extends HTMLElement {
  connectedCallback () {
    // parametrizes the global sphere
    if (this.hasAttribute('global')) {
      this._sphere = Sphere.i
      if (this.hasAttribute('stylesheet'))
        Sphere.i.stylesheet = this.getAttribute('stylesheet')
      if (this.hasAttribute('assets'))
        Sphere.i.assets = this.getAttribute('assets')
    } else
      this._sphere = new Sphere(
        new Bus(),
        this.getAttribute('stylesheet'),
        this.getAttribute('assets'))
  }

  static get observedAttributes () {
    return ['stylesheet', 'assets']
  }

  get stylesheet () {
    return this._sphere.stylesheet
  }

  get assets () {
    return this._sphere.assets
  }

  get sphere () {
    return this._sphere
  }
}

OidSphere.elementTag = 'oid-sphere'
customElements.define(OidSphere.elementTag, OidSphere)