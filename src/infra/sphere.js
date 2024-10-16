import { sphereSetup } from './sphere-setup'

export class Sphere {
  constructor (id, bus, stylesheets, stydefault, assets) {
    this._id = id || null
    this._bus = (bus) ? bus : Sphere.i.bus
    this._stylesheets = (stylesheets) ? stylesheets : Sphere.i.stylesheets
    this._stydefault =
      (stydefault) ? stydefault : Sphere.i.stydefault
    this._assets = (assets) ? assets : Sphere.i.assets
  }

  static create (id, bus, stylesheets, stydefault, assets) {
    if (id != null && Sphere._spheres[id] != null)
      throw new Error(`Sphere with id ${id} already exists`)
    const sphere = new Sphere(id, bus, stylesheets, stydefault, assets)
    if (id != null)
      Sphere._spheres[id] = sphere
    return sphere
  }

  static get (id) {
    return (id) ? (Sphere._spheres[id] || null) : null
  }

  get id () {
    return this._id
  }

  get bus () {
    return this._bus
  }

  set stylesheets (newValue) {
    this._stylesheets = newValue
  }

  get stylesheets () {
    return this._stylesheets
  }

  set stydefault (newValue) {
    this._stydefault = newValue
  }

  get stydefault () {
    return this._stydefault
  }

  set assets (newValue) {
    this._assets = newValue
  }

  get assets () {
    return this._assets
  }
}

// controls the existing spheres that have id
Sphere._spheres = {}

Sphere.i = Sphere.create(
  sphereSetup.id,
  sphereSetup.bus,
  sphereSetup.stylesheets,
  sphereSetup.stydefault,
  sphereSetup.assets
)