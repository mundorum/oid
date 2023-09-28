import { sphereSetup } from './sphere-setup'

export class Sphere {
  constructor (bus, stylesheet, assets) {
    this._bus = (bus) ? bus : Sphere.i.bus
    this._stylesheet =
      (stylesheet) ? stylesheet : Sphere.i.stylesheet
    this._assets = (assets) ? assets : Sphere.i.assets
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

Sphere.i = new Sphere(
  sphereSetup.bus, sphereSetup.stylesheet,
  sphereSetup.assets
)