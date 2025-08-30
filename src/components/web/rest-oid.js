/**
 * Transforms data from a form in a REST submission
 */

import { Oid } from '../../base/oid.js'
import { OidWeb } from '../../base/oid-web.js'
import axios from 'axios'

export class RESTOid extends OidWeb {
  async handleGet (topic, message) {
    console.log('=== REST GET Request ===')
    await this._restRequest('GET', message)
  }

  async handlePost (topic, message) {
    await this._restRequest('POST', message)
  }

  async handlePut (topic, message) {
    await this._restRequest('PUT', message)
  }

  async handleDelete (topic, message) {
    await this._restRequest('DELETE', message)
  }

  async _restRequest (method, message) {
    let result = null
    let parameters = {}
    if (message != null) {
      parameters =
        (typeof message.value === 'object')
          ? message.value : message
    }

    console.log('=== parameters')
    console.log(parameters)

    const api = this._getCustomField('api')
    if (api != null && api.environment != null) {
      for (let e in api.environment) {
        parameters[e] = api.environment[e]
      }
    }

    if (this.parameters != null) {
      const par = this.parameters.split(';')
      for (const p of par) {
        const atr = p.split(':')
        parameters[atr[0]] = atr[1]
      }
    }

    if (api != null && api.oas != null && api.oas.paths != null) {
      const paths = Object.keys(api.oas.paths)
      if (paths.length > 0) {
        let url = paths[0]
        for (let p in parameters)
          url = url.replace('{' + p + '}', parameters[p])

        const request = {
          method: method.toUpperCase(),
          url: url,
          withCredentials: true
        }

        let pathDetails = api.oas.paths[paths[0]]
        let opid = ''
        if (pathDetails[method] != null) {
          if (pathDetails[method].operationId) opid = pathDetails[method].operationId
          if (pathDetails[method].parameters != null) {
            let body = {}
            for (let p of pathDetails[method].parameters)
              if (p.in != null && p.in == 'query')
                body[p.name] = parameters[p.name]
            if (request.method == 'GET')
              request.params = body
            else
              request.data = body
          }
        }

        await axios(request)
          .then(function (endpointResponse) {
            result = endpointResponse.data
          })
          .catch(function (error) {
            result = {
              error: (error.response != null)
                       ? ((error.response.data != null &&
                          error.response.data.error != null)
                          ? error.response.data.error
                          : {code: (error.response.status)
                                    ? error.response.status : 500,
                             message: error.message})
                      : {code: 500, message: error.message}
            }
          })
      }
    }
    this._notify('dispatch', {value: result})
  }
}

Oid.component(
{
  id: 'oid:rest',
  element: 'rest-oid',
  properties: {
    parameters: {}
  },
  receive: ['get', 'post', 'put', 'delete'],
  implementation: RESTOid
})
