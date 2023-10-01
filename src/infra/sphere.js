import { sphereSetup } from './sphere-setup'

export class Sphere {
  constructor (id, bus, stylesheet, assets) {
    this._id = id || null
    this._bus = (bus) ? bus : Sphere.i.bus
    this._stylesheet =
      (stylesheet) ? stylesheet : Sphere.i.stylesheet
    this._assets = (assets) ? assets : Sphere.i.assets
  }

  static create (id, bus, stylesheet, assets) {
    if (id != null && Sphere._spheres[id] != null)
      throw new Error(`Sphere with id ${id} already exists`)
    const sphere = new Sphere(id, bus, stylesheet, assets)
    if (id != null)
      Sphere._spheres[id] = sphere
    return sphere
  }

  get (id) {
    return (id) ? (Sphere._spheres[id] || null) : null
  }

  get id () {
    return this._id
  }

  get bus () {
    return this._bus
  }

  set stylesheet (newValue) {
    this._stylesheet = newValue
  }

  get stylesheet () {
    return this._stylesheet
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
  sphereSetup.stylesheet,
  sphereSetup.assets
)