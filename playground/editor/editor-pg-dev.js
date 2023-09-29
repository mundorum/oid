import { Bus } from '/lib/oidlib-dev.js'

export class EditorPg {
  start () {
    Bus.i.subscribe('control/render', this._renderOids.bind(this))
    Bus.i.subscribe('#', this._busMonitor.bind(this))
  }

  _renderOids () {
    document.querySelector("#pg-render").innerHTML =
        document.querySelector("#pg-editor").value
  }

  _busMonitor (topic, message) {
    if (topic != 'bus/monitor' && topic != 'control/render')
      Bus.i.publish('bus/monitor', {value: `[${topic}] ${JSON.stringify(message)}`})
  }
}

EditorPg.i = new EditorPg()