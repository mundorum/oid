import { sphereSetup } from './sphere-setup'

export class Sphere {
  constructor (bus, stylesheet, assets) {
    this._bus = (bus) ? bus : sphereSetup.bus
    this._stylesheet =
      (stylesheet) ? stylesheet : sphereSetup.stylesheet
    this._assets = (assets) ? assets : sphereSetup.assets
  }

  get bus () {
    return this._bus
  }

  get stylesheet () {
    return this._stylesheet
  }

  get assets () {
    return this._assets
  }
}

Sphere.i = new Sphere()