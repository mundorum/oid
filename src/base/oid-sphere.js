import { Bus } from '../infra/bus.js'
import { Sphere } from '../infra/sphere.js'

export class OidSphere extends HTMLElement {
  connectedCallback () {
    this._sphere = new Sphere(new Bus(), this.stylesheet)
  }

  static get observedAttributes () {
    return ['stylesheet']
  }

  get stylesheet () {
    return this.getAttribute('stylesheet')
  }

  get sphere () {
    return this._sphere
  }
}

OidSphere.elementTag = 'oid-sphere'
customElements.define(OidSphere.elementTag, OidSphere)