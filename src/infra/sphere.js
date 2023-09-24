import { sphereSetup } from './sphere-setup'

export class Sphere {
  constructor (bus, stylesheet) {
    this._bus = (bus) ? bus : sphereSetup.bus
    this._stylesheet = (stylesheet) ? stylesheet : sphereSetup.stylesheet
  }

  get bus () {
    return this._bus
  }

  get stylesheet () {
    return this._stylesheet
  }
}

Sphere.i = new Sphere()