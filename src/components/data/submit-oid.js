/**
 * Transforms data from a form in a REST submission
 */

import { Oid } from '../../base/oid.js'
import { OidWeb } from '../../base/oid-web.js'

export class SubmitOid extends OidWeb {
  async handleSubmit (topic, message) {
    const toSubmit = {}
    const schema = this._getCustomField('schema')
    let form = null
    if (schema != null) {
      for (const s of Object.keys(schema)) {
        const field = document.querySelector(`#${s}`)
        if (field != null)
          toSubmit[s] = field.value
      }
    } else {
      form = this.parentNode
      while (form != null && form.nodeName.toLowerCase() !== 'form')
        form = form.parentNode
      if (form != null)
        for (const f of form) {
          if (f.type === 'radio' || f.type === 'checkbox') {
            if (f.checked) {
              if (f.type === 'checkbox' || !f.hasAttribute('name'))
                toSubmit[f.id] = f.value
              else
                toSubmit[f.name] = f.value
            }
          } else
            toSubmit[f.id] = f.value
        }
    }
    if (!this._customExists('pre') || this._callCustom('pre', toSubmit) === true) {
      this._notify('submit', toSubmit)
      this._notify('dispatch', {value: toSubmit})
      this._invoke('itf:transfer', 'send', {value: toSubmit})
    }
  }

  handleUpdate (topic, message) {
    if (message.value) {
      let form = this.parentNode
      while (form != null && form.nodeName.toLowerCase() !== 'form')
        form = form.parentNode
      if (form != null)
        for (const f of form) {
          if (f.type === 'radio' || f.type === 'checkbox') {
            if (f.checked) {
              if (f.type === 'checkbox' || !f.hasAttribute('name'))
                f.value = message.value[f.id]
              else
                f.value = message.value[f.name]
            }
          } else
            f.value = message.value[f.id]
        }
    }
  }
}

Oid.component(
{
  id: 'oid:submit',
  element: 'submit-oid',
  receive: ['submit', 'update'],
  implementation: SubmitOid
})
