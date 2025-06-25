import { Bus } from '../infra/bus.js'
import { Sphere } from '../infra/sphere.js'

export class OidSphere extends HTMLElement {
  connectedCallback () {
    // parametrizes the global sphere
    if (this.hasAttribute('global')) {
      this._sphere = Sphere.i
      if (this.hasAttribute('stylesheets'))
        Sphere.i.stydefault = this.getAttribute('stylesheets')
      if (this.hasAttribute('stydefault'))
        Sphere.i.stydefault = this.getAttribute('stydefault')
      if (this.hasAttribute('assets'))
        Sphere.i.assets = this.getAttribute('assets')
      // cannot change the id and the bus of the global sphere
    } else {
      const id = this.getAttribute('id')
      if (Sphere.get(id))
        // if the sphere already exists, use it
        this._sphere = Sphere.get(id)
      else
        this._sphere = Sphere.create(
          this.getAttribute('id'),
          new Bus(),
          this.getAttribute('stylesheets'),
          this.getAttribute('stydefault'),
          this.getAttribute('assets'))
    }
  }

  get id () {
    return this._sphere.id
  }

  get stylesheets () {
    return this._sphere.stylesheets
  }

  get stydefault () {
    return this._sphere.stydefault
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