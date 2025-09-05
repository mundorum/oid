/**
 * Transforms data from a form in a REST submission
 */

import { Oid } from '../../base/oid.js'
import { OidWeb } from '../../base/oid-web.js'
import axios from 'axios'

export class RESTOid extends OidWeb {
  async handleGet (notice, message) {
    await this._restRequest('GET', notice, message)
  }

  async handlePost (notice, message) {
    await this._restRequest('POST', notice, message)
  }

  async handlePut (notice, message) {
    await this._restRequest('PUT', notice, message)
  }

  async handleDelete (notice, message) {
    await this._restRequest('DELETE', notice, message)
  }

  async _restRequest (method, notice, message) {
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
        let pathKey = paths[0]
        const noticeParts = notice.split('/')
        console.log('=== noticeParts')
        console.log(noticeParts)
        if (noticeParts.length > 1) {
          const method = noticeParts[0]
          const key = noticeParts[1]
          for (let p of paths) {
            if (api.oas.paths[p][method] &&
                api.oas.paths[p][method].operationId == key) {
              pathKey = p
              break
            }
          }
        }

        console.log('=== pathKey')
        console.log(pathKey)

        let url = pathKey
        for (let p in parameters)
          url = url.replace('{' + p + '}', parameters[p])

        console.log('=== url')
        console.log(url)

        const request = {
          method: method.toUpperCase(),
          url: url,
          withCredentials: true
        }

        let pathDetails = api.oas.paths[pathKey]
        if (pathDetails[method] != null) {
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
    const preparedResult =
      (result != null && typeof result === 'object' &&
       !Array.isArray(result) && result.value != null)
        ? result : {value: result}
    this._notify('dispatch', preparedResult)
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
