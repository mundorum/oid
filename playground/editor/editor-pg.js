const { Oid, Sphere, Bus } = await import(
  (new URL(document.location).searchParams.get('dev'))
    ? '/lib/oidlib-dev.js'
    : './lib/oid-full-dev.js')

export class EditorPg {
  start () {
    this._controlSphere = Sphere.get('control').bus
    this._controlSphere.subscribe(
      'file/loaded', this._renderFile.bind(this))
    this._controlSphere.subscribe(
      'control/download', this._downloadResult.bind(this))
    this._controlSphere.subscribe(
      'control/render', this._renderOids.bind(this))
    this._controlSphere.subscribe(
      'control/clear', this._clearOids.bind(this))
    Bus.i.subscribe('#', this._busMonitor.bind(this))
  }

  _renderFile (topic, message) {
    this._template = message.value
    document.querySelector("#pg-render").innerHTML = this._template
    this._showTree()
  }

  _showTree () {
    const root = document.querySelector("#pg-render")
    this._controlSphere.publish('tree/clear')
    document.querySelector("#oid-list").innerHTML =
      '<option value="">Select an OID</option>'
    for (let childId = 1; childId <= root.children.length; childId++)
      this._buildTree(root.children[childId-1], null, childId)
  }

  _buildTree (element, parentId, childId) {
    const id = (parentId != null) ? `${parentId}.${childId}` : `${childId}`
    const name = element.nodeName.toLowerCase()

    // node
    const node = { id: id,
                   label: name + (element.id ? `: ${element.id}` : '') }
    if (!name.endsWith('-oid'))
      node.format = 'light'
    this._controlSphere.publish('tree/node', node)
    if (element.id) {
      const option = document.createElement('option')
      option.value = element.id
      option.text = element.id
      document.querySelector("#oid-list").appendChild(option)
    }

    // edge
    if (parentId != null) {
      const edge = { source: parentId,
                     target: id }
      this._controlSphere.publish('tree/edge', edge)
    }

    for (let childId = 1; childId <= element.children.length; childId++)
      this._buildTree(element.children[childId-1], id, childId)
  }

  _renderOids () {
    const div = document.createElement('div')
    div.innerHTML = document.querySelector("#pg-editor").value

    const selectedOption = document.querySelector("#oid-list").value
    const base = document.querySelector(
      (selectedOption === '') ? '#pg-render' : `#${selectedOption}`)

    while (div.firstChild)
      base.appendChild(div.firstChild)

    this._showTree()
  }

  _clearOids () {
    document.querySelector("#pg-render").innerHTML = 
      (this._template != null) ? this._template : ''
    this._showTree()
  }

  _busMonitor (topic, message) {
    Sphere.get('control').bus.
      publish('control/monitor', {value: `[${topic}] ${JSON.stringify(message)}`})
  }

  _downloadResult () {
    const a = document.createElement('a')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.href = window.URL.createObjectURL(
      new Blob([document.querySelector('#pg-render').innerHTML], {type: 'text/plain'}))
    a.setAttribute('download', 'result.html')
    a.click()
    window.URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }
}

EditorPg.i = new EditorPg()

// Oid.customize('goid:graph', {
//   cid: 'example',
//   graph: (oid) => {
//     oid.importGraph({
//       nodes: [
//         { id: 'a', label: 'A' },
//         { id: 'a1', label: 'A.1', format: 'light' },
//         { id: 'a2', label: 'A.2' },
//         { id: 'a11', label: 'A.1.1', format: 'light' },
//         { id: 'b', label: 'B' },
//         { id: 'b1', label: 'B.1' },
//       ],
//       edges: [
//         { source: 'a', target: 'a1' },
//         { source: 'a', target: 'a2' },
//         { source: 'a1', target: 'a11' },
//         { source: 'b', target: 'b1' },
//       ]
//     })
//   }
// })