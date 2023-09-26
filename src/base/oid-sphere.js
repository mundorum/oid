import { Bus } from '../infra/bus.js'
import { Sphere } from '../infra/sphere.js'

export class OidSphere extends HTMLElement {
  connectedCallback () {
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